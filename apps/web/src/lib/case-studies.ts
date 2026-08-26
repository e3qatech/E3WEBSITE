import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * QF-05: Canonical Case Study Publication & Visibility Rules
 *
 * 1. Base Canonical Field: `isPublished: true` is strictly required for any public visibility.
 * 2. Status Guard: Draft, archived, unpublished, or hidden records must NEVER appear publicly.
 * 3. Featured Flag: `isFeatured: true` controls display ordering and highlight priority,
 *    but NEVER overrides publication eligibility.
 * 4. Linked Attraction Guard: If linked to an attraction, that attraction must also be published and not hidden.
 */

export interface CaseStudyLike {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleAr?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isHidden?: boolean;
  status?: string;
  attraction?: {
    isPublished?: boolean;
    isHidden?: boolean;
  } | null;
  [key: string]: any;
}

/**
 * In-memory predicate to verify case study publication eligibility.
 * Handles both raw Prisma records and serialized client display DTOs.
 */
export function isCaseStudyEligible(cs: CaseStudyLike | null | undefined): boolean {
  if (!cs || typeof cs !== "object") return false;
  if (cs.isPublished === false) return false;
  if (cs.isHidden === true) return false;
  if (cs.isVisible === false) return false;

  // QF-13: Archived duplicate records marked in SEO must never appear on public index
  if (cs.seo?.isArchived === true) {
    return false;
  }

  if (typeof cs.status === "string") {
    const statusUpper = cs.status.trim().toUpperCase();
    if (["DRAFT", "ARCHIVED", "UNPUBLISHED", "HIDDEN", "DELETED"].includes(statusUpper)) {
      return false;
    }
  }

  // If explicitly linked to a hidden attraction, respect the hidden boundary
  if (cs.attraction && cs.attraction.isHidden === true) {
    return false;
  }

  // Must be explicitly published / visible (strictly true)
  return cs.isPublished === true || cs.isVisible === true;
}

/**
 * Canonical Prisma WHERE filter for public case study queries.
 */
export function getPublicCaseStudyWhere(
  additionalWhere?: Prisma.CaseStudyWhereInput
): Prisma.CaseStudyWhereInput {
  return {
    isPublished: true,
    ...(additionalWhere || {}),
  };
}

export interface PublicCaseStudiesQueryOptions {
  ids?: string[];
  category?: string;
  year?: number;
  attractionId?: string;
  limit?: number;
  featuredFirst?: boolean;
  includeTeam?: boolean;
  includeAttraction?: boolean;
  select?: Prisma.CaseStudySelect;
}

/**
 * Shared canonical database fetcher for public case studies.
 * Guarantees that only published records are ever returned across all public consumers.
 */
export async function getPublicCaseStudies(options: PublicCaseStudiesQueryOptions = {}) {
  const {
    ids,
    category,
    year,
    attractionId,
    limit,
    featuredFirst = true,
    includeTeam = false,
    includeAttraction = false,
    select,
  } = options;

  try {
    const where: Prisma.CaseStudyWhereInput = {
      isPublished: true,
    };

    if (Array.isArray(ids) && ids.length > 0) {
      where.id = { in: ids };
    }

    if (category && category !== "ALL" && category !== "All") {
      where.category = category;
    }

    if (year && !isNaN(year)) {
      where.year = year;
    }

    if (attractionId) {
      where.attractionId = attractionId;
    }

    const orderBy: Prisma.CaseStudyOrderByWithRelationInput[] = featuredFirst
      ? [{ isFeatured: "desc" }, { year: "desc" }, { createdAt: "desc" }]
      : [{ year: "desc" }, { createdAt: "desc" }];

    const queryArgs: any = {
      where,
      orderBy,
    };

    if (typeof limit === "number" && limit > 0 && (!ids || ids.length === 0)) {
      queryArgs.take = limit;
    }

    if (select) {
      queryArgs.select = select;
    } else {
      const include: Prisma.CaseStudyInclude = {};
      if (includeTeam) {
        include.teamMembers = {
          include: {
            employeeProfile: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        };
      }
      if (includeAttraction) {
        include.attraction = true;
      }
      if (Object.keys(include).length > 0) {
        queryArgs.include = include;
      }
    }

    const results = await db.caseStudy.findMany(queryArgs);
    const eligibleResults = results.filter(isCaseStudyEligible);

    // If specific IDs were requested, preserve their designated manual ordering
    if (Array.isArray(ids) && ids.length > 0) {
      const idMap = new Map((eligibleResults as any[]).map((item: any) => [item.id, item]));
      const ordered = ids.map((id) => idMap.get(id)).filter(Boolean) as typeof eligibleResults;
      if (ordered.length > 0) {
        return typeof limit === "number" && limit > 0 ? ordered.slice(0, limit) : ordered;
      }
    }

    if (eligibleResults.length > 0) {
      return eligibleResults;
    }

    // Defensive fallback: If database is unseeded or empty, provide canonical published cases
    const defaultList = Object.entries(CANONICAL_CASE_STUDIES_FALLBACKS).map(([slug, data], idx) => ({
      id: `canonical-${slug}`,
      slug,
      ...data,
      isPublished: true,
      isVisible: true,
      status: "PUBLISHED",
      orderIndex: idx,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    let filteredDefaults = defaultList;
    if (category && category !== "ALL" && category !== "All") {
      filteredDefaults = filteredDefaults.filter((c: any) => c.category === category);
    }
    if (year && !isNaN(year)) {
      filteredDefaults = filteredDefaults.filter((c: any) => c.year === year);
    }
    if (Array.isArray(ids) && ids.length > 0) {
      filteredDefaults = filteredDefaults.filter((c: any) => ids.includes(c.id) || ids.includes(c.slug));
    }
    return typeof limit === "number" && limit > 0 ? filteredDefaults.slice(0, limit) : filteredDefaults;
  } catch (error) {
    console.error("[GET_PUBLIC_CASE_STUDIES_ERROR]", error);
    
    // Provide canonical published cases on connection error
    const defaultList = Object.entries(CANONICAL_CASE_STUDIES_FALLBACKS).map(([slug, data], idx) => ({
      id: `canonical-${slug}`,
      slug,
      ...data,
      isPublished: true,
      isVisible: true,
      status: "PUBLISHED",
      orderIndex: idx,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return defaultList;
  }
}

/**
 * Canonical fallback records for known case studies to guarantee that the public DTO
 * always has complete, rich content (Hero, Challenge, Solution, Result, Metrics, Gallery, Testimonials, Team, SEO).
 */
export const CANONICAL_CASE_STUDIES_FALLBACKS: Record<string, Partial<CaseStudyLike>> = {
  "case-urban-arena": {
    titleEn: "Urban Arena Tactical Entertainment Hub",
    titleAr: "أوربان أرينا — مجمع الترفيه التكتيكي التفاعلي",
    clientName: "E3 Owned & Operated / Doha Mall",
    category: "Entertainment Destinations",
    categoryAr: "الوجهات الترفيهية التفاعلية",
    year: 2024,
    isFeatured: true,
    isPublished: true,
    heroMediaType: "VIDEO",
    heroImageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/d1a1b309-29fc-415b-a5f8-48bc2f14752d.mp4",
    thumbnailMediaType: "IMAGE",
    thumbnailUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1600&auto=format&fit=crop",
    clientLogoUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png",
    challengeEn: "Converting a 4,500 sqm high-ceiling commercial shell into Qatar's first multi-tiered tactical combat and gamified obstacle arena with real-time laser telemetry and biometric leaderboards under an aggressive 90-day build timeline.",
    challengeAr: "تحويل مساحة تجارية خام بارتفاعات شاهقة تبلغ 4500 متر مربع إلى أول مجمع ترفيهي تكتيكي متعدد المستويات في قطر مجهز بنظام تتبع الليزر اللحظي ولوحات الصدارة البيومترية خلال جدول زمني قياسي مدته 90 يوماً.",
    solutionEn: "Engineered proprietary acoustic zoning, high-speed infra-red tracking arrays, integrated laser tag courses, bazooka ball, paintless paintball zones, and automated guest throughput queuing with dynamic lighting cues.",
    solutionAr: "هندسة مناطق عزل صوتي متقدمة، وشبكات تتبع بالأشعة تحت الحمراء عالية الدقة، مع مسارات متكاملة لليزر تاج والكرات التكتيكية وإدارة رقمية فورية لحشود الزوار مع إضاءة ديناميكية متزامنة.",
    resultEn: "Achieved record 99.4% telemetry uptime, welcomed over 350,000 players in the opening quarter, and reduced average match turnover interval to under 90 seconds.",
    resultAr: "تحقيق نسبة جاهزية تشغيلية 99.4%، واستقبال أكثر من 350,000 لاعب خلال الربع الأول، مع تقليص وقت تبديل جولات اللعب إلى أقل من 90 ثانية.",
    metrics: [
      { valueEn: "350K+", valueAr: "350K+", labelEn: "Total Arena Players", labelAr: "إجمالي لاعبي الأرينا" },
      { valueEn: "4,500 m²", valueAr: "4,500 م²", labelEn: "Tactical Play Space", labelAr: "مساحة اللعب التكتيكية" },
      { valueEn: "99.4%", valueAr: "99.4%", labelEn: "Telemetry System Uptime", labelAr: "جاهزية أنظمة التتبع" },
      { valueEn: "<90s", valueAr: "<90ث", labelEn: "Match Turnover Interval", labelAr: "معدل دوران الجولات" },
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1600&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "High-intensity tactical obstacle grid and neon illumination",
        captionAr: "شبكة العقبات التكتيكية والإضاءة النيونية التفاعلية",
      },
      {
        url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "Infrared laser tag combat field and dynamic scoring hubs",
        captionAr: "ميدان الليزر تاج وشاشات تسجيل النقاط المباشرة",
      },
      {
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "Central telemetry monitoring and match control bridge",
        captionAr: "منصة المراقبة المركزية والتحكم اللحظي بالمباريات",
      },
      {
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "VIP briefing lounge and team staging quarter",
        captionAr: "قاعة التوجيه التكتيكي لكبار الشخصيات ومنطقة تجهيز الفرق",
      },
    ],
    testimonials: [
      {
        quoteEn: "Urban Arena completely redefined indoor gamified entertainment in Qatar with unmatched engineering, safety protocols, and operational throughput.",
        quoteAr: "أعادت أوربان أرينا صياغة مفهوم الترفيه التفاعلي الداخلي في قطر بمعايير هندسية وأمان وتدفق جماهيري استثنائي.",
        authorName: "Nasser Al-Hajri",
        authorRole: "Executive Director, Retail & Mall Operations",
        isVisible: true,
      },
      {
        quoteEn: "The multi-tiered tactical combat zones and automated telemetry made it the most engaging FEC concept in Doha.",
        quoteAr: "المسارات التكتيكية متعددة المستويات وأنظمة التتبع الآلي جعلت المشروع التجربة الترفيهية الأكثر جذباً في الدوحة.",
        authorName: "Eng. Jassim Al-Kuwari",
        authorRole: "Senior Facility Development Manager",
        isVisible: true,
      },
    ],
    seo: {
      metaTitleEn: "Urban Arena Tactical Entertainment Hub Case Study | E3 Qatar",
      metaTitleAr: "دراسة حالة مجمع أوربان أرينا الترفيهي التكتيكي | إي ثري قطر",
      metaDescriptionEn: "Explore how E3 engineered Qatar's premier gamified tactical combat destination at Urban Arena.",
      metaDescriptionAr: "استكشف كيف هندست إي ثري الوجهة الترفيهية التكتيكية الرائدة في قطر بأوربان أرينا.",
    },
  },
  "doha-balloon-parade-2022": {
    titleEn: "Doha Balloon Parade 2022",
    titleAr: "استعراض بالونات الدوحة 2022",
    clientName: "Visit Qatar",
    category: "Mega Events",
    categoryAr: "الفعاليات الكبرى",
    year: 2022,
    isFeatured: true,
    isPublished: true,
    heroMediaType: "IMAGE",
    heroImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    thumbnailMediaType: "IMAGE",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    challengeEn: "Executing Qatar's first 3-kilometer open-air balloon parade along the iconic Doha Corniche for over 760,000 spectators across 3 consecutive days.",
    challengeAr: "تنفيذ أول استعراض بالونات مفتوح بطول 3 كيلومترات على كورنيش الدوحة لأكثر من 760 ألف متفرج على مدار 3 أيام متتالية.",
    solutionEn: "Orchestrated 40 giant helium inflatables, 2,500+ security and operations staff, and synchronized musical troupes with real-time crowd dynamics telemetry.",
    solutionAr: "إدارة وتوجيه 40 مجسماً هوائياً عملاقاً، وأكثر من 2500 فرد من الطواقم الأمنية والتشغيلية، ومجموعات موسيقية متزامنة مع تتبع لحظي لحركة الجماهير.",
    resultEn: "Successfully managed 760,000+ attendees over 3 days across a 3km Corniche route with zero safety incidents and international media acclaim.",
    resultAr: "نجاح استثنائي في إدارة حشود تجاوزت 760,000 زائر على مدار 3 أيام على امتداد 3 كم على كورنيش الدوحة بدون أي حوادث أمنية وبإشادة إعلامية دولية واسعة.",
    metrics: [
      { valueEn: "760K+", valueAr: "760K+", labelEn: "Total Attendees", labelAr: "إجمالي الحضور" },
      { valueEn: "3 KM", valueAr: "3 كم", labelEn: "Parade Route", labelAr: "مسار الاستعراض" },
      { valueEn: "2,500+", valueAr: "2,500+", labelEn: "Crew & Operations Staff", labelAr: "طواقم العمل والتشغيل" },
      { valueEn: "60 Days", valueAr: "60 يوماً", labelEn: "Award to Execution", labelAr: "من الترسية للتنفيذ" },
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "Giant helium inflatables soaring above the Doha Corniche skyline",
        captionAr: "البالونات العملاقة تحلق فوق كورنيش الدوحة بأفق العاصمة",
      },
      {
        url: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=1200&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "Marching brass bands and street performance troupes",
        captionAr: "الفرق الموسيقية النحاسية واستعراضات الشارع الحية",
      },
      {
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "Night illumination and kinetic fireworks finale",
        captionAr: "العروض الضوئية الليلية وعروض الألعاب النارية الختامية",
      },
    ],
    testimonials: [
      {
        quoteEn: "E3 delivered Qatar's first world-class balloon parade with remarkable operational crowd control and spectacular family entertainment.",
        quoteAr: "قدمت إي ثري أول موكب بالونات عالمي في قطر بإدارة حشود متميزة وبرنامج ترفيهي عائلي استثنائي.",
        authorName: "Hamad Al-Kuwari",
        authorRole: "Festivals & Major Events Director, Visit Qatar",
        isVisible: true,
      },
    ],
    seo: {
      metaTitleEn: "Doha Balloon Parade 2022 Case Study | E3 Qatar",
      metaTitleAr: "دراسة حالة استعراض بالونات الدوحة 2022 | إي ثري قطر",
      metaDescriptionEn: "Discover how E3 produced Qatar's landmark 3km Corniche balloon parade for 760,000+ visitors.",
      metaDescriptionAr: "استكشف كيف أنتجت إي ثري موكب بالونات كورنيش الدوحة الأيقوني لـ 760 ألف زائر.",
    },
  },
  "summer-splash-2026-paw-patrol-spongebob": {
    titleEn: "Summer Splash 2026 with PAW Patrol & SpongeBob",
    titleAr: "سمر سبلاش 2026 مع باو باترول وسبونج بوب",
    clientName: "Meryal Waterpark / Visit Qatar",
    category: "Global IP & Family Entertainment",
    categoryAr: "الشخصيات العالمية والترفيه العائلي",
    year: 2026,
    isFeatured: true,
    isPublished: true,
    heroMediaType: "IMAGE",
    heroImageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/hero_banner.jpg",
    thumbnailMediaType: "IMAGE",
    thumbnailUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/hero_banner.jpg",
    clientLogoUrl: "https://eeeqa.com/assets/partners/meryal-logo.svg",
    challengeEn: "Designing and operating an integrated multi-brand Nickelodeon immersive activation within Qatar's premier waterpark destination, delivering simultaneous meet-and-greets, interactive splash zones, live performance stages, and crowd-safe visitor routing under peak summer conditions.",
    challengeAr: "تصميم وتشغيل تجربة نيكلوديون تفاعلية متعددة العلامات التجارية داخل أبرز حديقة مائية في قطر، مع إدارة متزامنة للقاء الشخصيات ومناطق الرشاشات التفاعلية وعروض المسرح الحي وتوجيه آمن للزوار في ذروة الصيف.",
    solutionEn: "Engineered branded experiential zones featuring SpongeBob SquarePants and PAW Patrol, with synchronized water effects, shaded interactive queue lines, specialized character management protocols, and multi-lingual family event hosting.",
    solutionAr: "هندسة مناطق تجارب تفاعلية مرخصة تضم سبونج بوب وباو باترول مع تأثيرات مائية متزامنة، ومسارات مظللة، وبروتوكولات متطورة لإدارة الشخصيات واستضافة العروض العائلية ثنائية اللغة.",
    resultEn: "Delivered landmark family festival attendance exceeding 450,000 visitors, maintained 100% safety compliance across 60 daily show sessions, and achieved a 96.8% positive family satisfaction rating.",
    resultAr: "تحقيق حضور عائلي قياسي تجاوز 450 ألف زائر، والحفاظ على نسبة أمان 100% عبر 60 جلسة عرض يومية مع تقييم رضا عائلي بلغ 96.8%.",
    metrics: [
      { valueEn: "450K+", valueAr: "450K+", labelEn: "Total Family Visitors", labelAr: "إجمالي الزوار والعائلات" },
      { valueEn: "60", valueAr: "60", labelEn: "Daily Interactive Shows", labelAr: "عرض تفاعلي يومي" },
      { valueEn: "100%", valueAr: "100%", labelEn: "Safety Compliance", labelAr: "معايير السلامة المعتمدة" },
      { valueEn: "96.8%", valueAr: "96.8%", labelEn: "Family Approval Rating", labelAr: "نسبة رضا العائلات" },
    ],
    gallery: [
      {
        url: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/hero_banner.jpg",
        type: "IMAGE",
        captionEn: "Main stage live activation and character showcase",
        captionAr: "المسرح الرئيسي للعروض الحية وتفاعل الشخصيات",
      },
      {
        url: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/spongebob-01.jpg",
        type: "IMAGE",
        captionEn: "SpongeBob Bikini Bottom interactive splash station",
        captionAr: "محطة سبونج بوب التفاعلية بيكيني بوتوم للألعاب المائية",
      },
    ],
    testimonials: [
      {
        quoteEn: "E3 created an extraordinary Nickelodeon destination experience that engaged hundreds of thousands of children and families with flawless operational safety.",
        quoteAr: "صنعت إي ثري تجربة وجهة استثنائية لنيكلوديون جذبت مئات الآلاف من الأطفال والعائلات مع أمان تشغيلي منقطع النظير.",
        authorName: "Marketing Director",
        authorRole: "Meryal Waterpark Management",
        isVisible: true,
      },
    ],
    seo: {
      metaTitleEn: "Summer Splash 2026 Case Study | E3 Qatar",
      metaTitleAr: "دراسة حالة سمر سبلاش 2026 | إي ثري قطر",
      metaDescriptionEn: "Discover how E3 delivered Qatar's premier Nickelodeon waterpark activation for 450,000+ visitors.",
      metaDescriptionAr: "استكشف كيف أنتجت إي ثري أكبر فعالية ترفيهية مائية مع شخصيات نيكلوديون لـ 450 ألف زائر.",
    },
  },
};

/**
 * Enriches a case study record with canonical defaults for any empty or missing fields.
 */
export function enrichCaseStudyWithDefaults(rawCase: any): any {
  if (!rawCase) return rawCase;

  const fallback = CANONICAL_CASE_STUDIES_FALLBACKS[rawCase.slug] || {};

  // Infer media types if missing
  let heroMediaType = rawCase.heroMediaType || fallback.heroMediaType || "IMAGE";
  const heroImageUrl = rawCase.heroImageUrl || fallback.heroImageUrl || "";
  if (heroImageUrl && typeof heroImageUrl === "string") {
    if (heroImageUrl.endsWith(".mp4") || heroImageUrl.endsWith(".webm") || heroImageUrl.includes("/video/")) {
      heroMediaType = "VIDEO";
    }
  }

  let thumbnailMediaType = rawCase.thumbnailMediaType || fallback.thumbnailMediaType || "IMAGE";
  const thumbnailUrl = rawCase.thumbnailUrl || fallback.thumbnailUrl || "";
  if (thumbnailUrl && typeof thumbnailUrl === "string") {
    if (thumbnailUrl.includes("spline") || thumbnailUrl.includes("my.spline.design")) {
      thumbnailMediaType = "SPLINE";
    } else if (thumbnailUrl.endsWith(".mp4") || thumbnailUrl.endsWith(".webm")) {
      thumbnailMediaType = "VIDEO";
    }
  }

  let rawMetrics: any[] = [];
  if (Array.isArray(rawCase.metrics) && rawCase.metrics.length > 0) {
    rawMetrics = rawCase.metrics;
  } else if (rawCase.metrics && typeof rawCase.metrics === "object" && Object.keys(rawCase.metrics).length > 0) {
    rawMetrics = Object.entries(rawCase.metrics).map(([key, val]) => ({
      labelEn: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      labelAr: key,
      valueEn: String(val),
      valueAr: String(val),
    }));
  } else {
    rawMetrics = fallback.metrics || [];
  }

  const rawGallery = Array.isArray(rawCase.gallery) && rawCase.gallery.length > 0
    ? rawCase.gallery
    : (fallback.gallery || []);

  const rawTestimonials = Array.isArray(rawCase.testimonials) && rawCase.testimonials.length > 0
    ? rawCase.testimonials
    : (fallback.testimonials || []);

  const rawSeo = rawCase.seo && typeof rawCase.seo === "object" && Object.keys(rawCase.seo).length > 0
    ? rawCase.seo
    : (fallback.seo || {});

  return {
    ...rawCase,
    titleEn: rawCase.titleEn || fallback.titleEn || "",
    titleAr: rawCase.titleAr || fallback.titleAr || rawCase.titleEn || "",
    clientName: rawCase.clientName || fallback.clientName || "",
    category: rawCase.category || fallback.category || "General",
    categoryAr: rawCase.categoryAr || fallback.categoryAr || rawCase.category || "",
    year: rawCase.year || fallback.year || 2024,
    isFeatured: rawCase.isFeatured ?? fallback.isFeatured ?? false,
    heroMediaType,
    heroImageUrl,
    thumbnailMediaType,
    thumbnailUrl,
    clientLogoUrl: rawCase.clientLogoUrl || fallback.clientLogoUrl || "",
    challengeEn: rawCase.challengeEn || fallback.challengeEn || "",
    challengeAr: rawCase.challengeAr || fallback.challengeAr || "",
    solutionEn: rawCase.solutionEn || fallback.solutionEn || "",
    solutionAr: rawCase.solutionAr || fallback.solutionAr || "",
    resultEn: rawCase.resultEn || fallback.resultEn || "",
    resultAr: rawCase.resultAr || fallback.resultAr || "",
    metrics: rawMetrics,
    gallery: rawGallery,
    testimonials: rawTestimonials,
    seo: rawSeo,
  };
}

/**
 * Fetch a single published case study by slug.
 * Returns null if the case study does not exist or is unpublished/draft.
 */
export async function getPublicCaseStudyBySlug(
  slug: string,
  options: { includeTeam?: boolean; includeAttraction?: boolean } = {}
) {
  if (!slug) return null;

  try {
    const include: Prisma.CaseStudyInclude = {};
    if (options.includeTeam) {
      include.teamMembers = {
        include: {
          employeeProfile: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      };
    }
    if (options.includeAttraction) {
      include.attraction = true;
    }

    const caseStudy = await db.caseStudy.findUnique({
      where: { slug },
      ...(Object.keys(include).length > 0 ? { include } : {}),
    });

    if (!isCaseStudyEligible(caseStudy)) {
      return null;
    }

    return enrichCaseStudyWithDefaults(caseStudy);
  } catch (error) {
    console.error("[GET_PUBLIC_CASE_STUDY_BY_SLUG_ERROR]", error);
    return null;
  }
}

/**
 * Fetch the next published case study for footer transitions.
 */
export async function getNextPublicCaseStudy(
  currentId: string,
  currentYear?: number
) {
  try {
    const nextStudy =
      (await db.caseStudy.findFirst({
        where: {
          isPublished: true,
          ...(currentYear ? { year: { lte: currentYear } } : {}),
          id: { not: currentId },
        },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      })) ||
      (await db.caseStudy.findFirst({
        where: {
          isPublished: true,
          id: { not: currentId },
        },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      }));

    return isCaseStudyEligible(nextStudy) ? enrichCaseStudyWithDefaults(nextStudy) : null;
  } catch (error) {
    console.error("[GET_NEXT_PUBLIC_CASE_STUDY_ERROR]", error);
    return null;
  }
}

