import { describe, it, expect } from "vitest";
import {
  getAllCanonicalServices,
  getCanonicalService,
  resolveServiceSlug,
} from "@/lib/services/canonical-services";
import { adaptDbServiceToPresentation } from "@/lib/services/service-adapters";
import { canonicalizeRoute } from "@/lib/url-helper";

describe("Services CMS Contract & Persistence Round-Trip Suite", () => {
  // 1. Canonical Services Taxonomy Count
  it("1. Returns exactly the 10 canonical service disciplines", () => {
    const services = getAllCanonicalServices();
    expect(services.length).toBe(10);
    const slugs = services.map((s) => s.slug);
    expect(slugs).toEqual([
      "mega-events",
      "fec-development",
      "kids-concepts",
      "experiential-activations",
      "shows-performances",
      "av-stage-rentals",
      "attraction-operations",
      "ticketing-solutions",
      "fabrication-branding",
      "feasibility-design-research",
    ]);
  });

  // 2. Legacy Aliases Resolution without Duplication
  it("2. Reconciles legacy aliases to their canonical primary service slugs", () => {
    expect(resolveServiceSlug("family-entertainment-centers")).toBe("fec-development");
    expect(resolveServiceSlug("fec")).toBe("fec-development");
    expect(resolveServiceSlug("family-entertainment-center")).toBe("fec-development");
    expect(resolveServiceSlug("audio-visual-stage")).toBe("av-stage-rentals");
    expect(resolveServiceSlug("av-rentals")).toBe("av-stage-rentals");
    expect(resolveServiceSlug("attraction-operations")).toBe("attraction-operations");
    expect(resolveServiceSlug("event-engineering")).toBe("mega-events");
    expect(resolveServiceSlug("design-research")).toBe("feasibility-design-research");
  });

  // 3. Route Canonicalization for Service Aliases
  it("3. canonicalizeRoute routes aliases to the canonical service URL", () => {
    expect(canonicalizeRoute("/b2b/services/fec")).toBe("/b2b/services/fec-development");
    expect(canonicalizeRoute("/b2b/services/family-entertainment-centers")).toBe("/b2b/services/fec-development");
    expect(canonicalizeRoute("/b2b/services/audio-visual-stage")).toBe("/b2b/services/av-stage-rentals");
    expect(canonicalizeRoute("/services/av-rentals")).toBe("/b2b/services/av-stage-rentals");
  });

  // 4. Persistence Round-Trip: Unpacking Full Enhancement JSON from Prisma Record
  it("4. Rehydrates all 17 structured bilingual sections from DB process and root fields", () => {
    const dbRecord: any = {
      id: "srv-doha-mega-1",
      slug: "mega-events",
      titleEn: "Custom Mega Events",
      titleAr: "الفعاليات الكبرى المخصصة",
      taglineEn: "Bespoke production in Qatar",
      taglineAr: "إنتاج مخصص في قطر",
      category: "Specialized Festivals",
      heroMediaType: "VIDEO",
      heroMediaUrl: "https://example.com/hero.mp4",
      thumbnail: "https://example.com/thumb.jpg",
      isVisible: true,
      isFeatured: true,
      process: {
        heroOutcomeEn: "Unrivaled Stadium Spectacles Delivered on Schedule",
        heroOutcomeAr: "عروض استثنائية في الملاعب يتم تسليمها في الموعد المحدد",
        supportingStatementEn: "Full turnkey event delivery across Qatar with dedicated crowd management.",
        supportingStatementAr: "تنفيذ شامل للفعاليات في كافة أنحاء قطر مع إدارة حشود متطورة.",
        mobileHeroMediaUrl: "https://example.com/mobile-hero.jpg",
        videoPosterUrl: "https://example.com/poster.jpg",
        ctaPrimary: "CUSTOM_LINK",
        ctaPrimaryTextEn: "Schedule Technical Workshop",
        ctaPrimaryTextAr: "حجز ورشة عمل فنية",
        ctaPrimaryUrl: "/b2b/contact?type=workshop",
        ctaSecondaryTextEn: "Explore Parade Case Study",
        ctaSecondaryTextAr: "استعراض مسيرة الهيليوم",
        ctaSecondaryUrl: "/b2b/case-studies/doha-balloon-parade-2022",
        verifiedProofPoints: [
          { value: "60k+", labelEn: "Peak Daily Attendance", labelAr: "الذروة اليومية للحضور", isVerified: true },
          { value: "Unverified Claim", labelEn: "Draft Metric", labelAr: "مقياس مسودة", isVerified: false },
        ],
        wowHow: [
          {
            id: "wh-1",
            titleEn: "Cinematic Inflatables",
            titleAr: "المجسمات السينمائية",
            wowEn: "Giant balloon characters hovering over Corniche.",
            wowAr: "شخصيات كرتونية عملاقة تطفو فوق الكورنيش.",
            howEn: "Dual-anchor tether calculations and wind sensors.",
            howAr: "حسابات نقاط التثبيت المزدوجة ومستشعرات الرياح.",
          },
        ],
        objectives: [
          {
            id: "obj-1",
            labelEn: "National Day Celebration",
            labelAr: "احتفال اليوم الوطني",
            descriptionEn: "High-throughput parade corridor.",
            descriptionAr: "مسار احتفالي عالي الاستيعاب.",
            highlightedCapabilityIds: ["cap-1"],
            recommendedDeliverableIds: ["del-1"],
          },
        ],
        capabilities: [
          {
            id: "cap-1",
            titleEn: "Balloon Rigging & Telemetry",
            titleAr: "تركيب ومراقبة البالونات",
            descriptionEn: "Real-time helium pressure monitoring.",
            descriptionAr: "مراقبة ضغط الهيليوم في الوقت الفعلي.",
            deliverablesEn: ["Telemetry Dossier"],
            deliverablesAr: ["ملف المراقبة"],
            suitableForEn: ["Outdoor Festivals"],
            suitableForAr: ["المهرجانات المفتوحة"],
            colSpan: 2,
          },
        ],
        engagementModels: [
          {
            id: "eng-1",
            titleEn: "Turnkey Production",
            titleAr: "الإنتاج الشامل",
            subtitleEn: "Sole Accountability",
            subtitleAr: "المسؤولية الكاملة",
            descriptionEn: "Complete concept to tear down.",
            descriptionAr: "من الفكرة إلى التفكيك.",
            bestForEn: "Multi-day public parades",
            bestForAr: "المسيرات الجماهيرية متعددة الأيام",
            typicalDurationEn: "8 Weeks",
            typicalDurationAr: "٨ أسابيع",
          },
        ],
        deliverables: [
          {
            id: "del-1",
            titleEn: "Pre-Production Dossier",
            titleAr: "ملف ما قبل الإنتاج",
            itemsEn: ["3D Balloon Simulation", "RAMS Safety Pack"],
            itemsAr: ["محاكاة ثلاثية الأبعاد", "ملف السلامة RAMS"],
          },
        ],
        lifecycleStages: [
          {
            id: "stg-1",
            stageNumber: "01",
            titleEn: "Wind Modeling & Site Survey",
            titleAr: "نمذجة الرياح ومسح الموقع",
            descriptionEn: "Corniche meteorological analysis.",
            descriptionAr: "تحليل الأرصاد الجوية لكورنيش الدوحة.",
            outputsEn: ["Survey Certificate"],
            outputsAr: ["شهادة مسح الموقع"],
          },
        ],
        serviceSpecificModule: {
          type: "scale-explorer",
          titleEn: "Parade Scale Explorer",
          titleAr: "مستكشف حجم المسيرات",
          subtitleEn: "Select corridor length",
          subtitleAr: "اختر طول المسار",
          data: {},
        },
        enterpriseReadiness: [
          {
            id: "er-1",
            titleEn: "Qatar Civil Defence Approval",
            titleAr: "اعتماد الدفاع المدني القطري",
            descriptionEn: "All balloon gases non-flammable certified.",
            descriptionAr: "شهادات معتمدة لعدم قابلية الغازات للاشتعال.",
          },
        ],
        relatedCaseStudySlugs: ["doha-balloon-parade-2022"],
        relatedServiceSlugs: ["shows-performances", "av-stage-rentals"],
        relatedServicesNarrativeEn: "Shows and AV support the main parade execution.",
        relatedServicesNarrativeAr: "تدعم العروض والمسارح الصوتية تنفيذ المسيرة.",
        sectionVisibility: {
          hero: true,
          wowHow: true,
          objectives: true,
          gallery: true,
          capabilities: true,
          engagementModels: true,
          deliverables: true,
          lifecycle: true,
          specialistModule: true,
          caseStudies: true,
          enterpriseReadiness: true,
          relatedServices: true,
        },
      },
      gallery: [
        {
          id: "g-1",
          url: "https://example.com/gallery1.jpg",
          captionEn: "Corniche Parade 2022",
          captionAr: "مسيرة الكورنيش ٢٠٢٢",
          orderIndex: 0,
        },
      ],
    };

    const adapted = adaptDbServiceToPresentation(dbRecord);

    expect(adapted.id).toBe("srv-doha-mega-1");
    expect(adapted.slug).toBe("mega-events");
    expect(adapted.titleEn).toBe("Custom Mega Events");
    expect(adapted.titleAr).toBe("الفعاليات الكبرى المخصصة");
    expect(adapted.heroOutcomeEn).toBe("Unrivaled Stadium Spectacles Delivered on Schedule");
    expect(adapted.heroOutcomeAr).toBe("عروض استثنائية في الملاعب يتم تسليمها في الموعد المحدد");
    expect(adapted.ctaPrimaryTextEn).toBe("Schedule Technical Workshop");
    expect(adapted.ctaPrimaryTextAr).toBe("حجز ورشة عمل فنية");
    expect(adapted.ctaPrimaryUrl).toBe("/b2b/contact?type=workshop");
    expect(adapted.ctaSecondaryUrl).toBe("/b2b/case-studies/doha-balloon-parade-2022");
    expect(adapted.wowHow.length).toBe(1);
    expect(adapted.wowHow[0].titleEn).toBe("Cinematic Inflatables");
    expect(adapted.objectives.length).toBe(1);
    expect(adapted.capabilities.length).toBe(1);
    expect(adapted.engagementModels.length).toBe(1);
    expect(adapted.deliverables.length).toBe(1);
    expect(adapted.lifecycleStages.length).toBe(1);
    expect(adapted.enterpriseReadiness.length).toBe(1);
    expect(adapted.relatedCaseStudySlugs).toEqual(["doha-balloon-parade-2022"]);
    expect(adapted.relatedServiceSlugs).toEqual(["shows-performances", "av-stage-rentals"]);
    expect(adapted.relatedServicesNarrativeEn).toBe("Shows and AV support the main parade execution.");
    expect(adapted.galleryItems?.length).toBe(1);
  });

  // 5. Strict Factual Claims & Claims Verification Filtering
  it("5. Strictly suppresses unverified factual claims (isVerified === false)", () => {
    const dbRecordWithClaims: any = {
      slug: "mega-events",
      titleEn: "Mega Events",
      titleAr: "الفعاليات الكبرى",
      process: {
        verifiedProofPoints: [
          { value: "100%", labelEn: "Permitted", labelAr: "مرخص", isVerified: true },
          { value: "48h", labelEn: "Rapid Rigging", labelAr: "تركيب سريع", isVerified: true },
          { value: "1M+", labelEn: "Unverified Claim", labelAr: "ادعاء غير موثق", isVerified: false },
        ],
      },
    };

    const adapted = adaptDbServiceToPresentation(dbRecordWithClaims);
    expect(adapted.verifiedProofPoints.length).toBe(2);
    expect(adapted.verifiedProofPoints.map((p) => p.value)).toEqual(["100%", "48h"]);
    expect(adapted.verifiedProofPoints.some((p) => p.value === "1M+")).toBe(false);
  });

  // 6. Section Suppression Independence: Missing enhancement data hides only that section
  it("6. Missing enhancement data suppresses only that section without hiding the parent service", () => {
    const minimalRecord: any = {
      id: "srv-minimal",
      slug: "attraction-operations",
      titleEn: "Attraction Operations & Management",
      titleAr: "تشغيل وإدارة الوجهات والفعاليات",
      taglineEn: "Day-to-day guest operations",
      taglineAr: "العمليات اليومية وإدارة تجربة الزوار",
      isVisible: true,
      process: {
        wowHow: [],
        objectives: [],
        capabilities: [],
        deliverables: [],
        lifecycleStages: [],
        enterpriseReadiness: [],
        verifiedProofPoints: [],
      },
    };

    const adapted = adaptDbServiceToPresentation(minimalRecord);
    expect(adapted).toBeDefined();
    expect(adapted.id).toBe("srv-minimal");
    expect(adapted.slug).toBe("attraction-operations");
    expect(adapted.wowHow).toEqual([]);
    expect(adapted.objectives).toEqual([]);
    expect(adapted.capabilities).toEqual([]);
    expect(adapted.deliverables).toEqual([]);
    expect(adapted.lifecycleStages).toEqual([]);
    expect(adapted.enterpriseReadiness).toEqual([]);
    expect(adapted.verifiedProofPoints).toEqual([]);
  });

  // 7. Directory Deduplication: Public services directory renders exactly 10 cards
  it("7. Canonical mapping deduplicates legacy aliases into exactly 10 distinct service cards", () => {
    const rawDbServices = [
      { slug: "mega-events", titleEn: "Mega Events", isVisible: true },
      { slug: "fec", titleEn: "FEC Legacy Record", isVisible: true },
      { slug: "family-entertainment-centers", titleEn: "FEC Duplicate", isVisible: true },
      { slug: "audio-visual-stage", titleEn: "AV Stage Legacy", isVisible: true },
      { slug: "kids-concepts", titleEn: "Kids Concepts", isVisible: true },
      { slug: "experiential-activations", titleEn: "Activations", isVisible: true },
      { slug: "shows-performances", titleEn: "Shows", isVisible: true },
      { slug: "ticketing-solutions", titleEn: "Ticketing", isVisible: true },
      { slug: "fabrication-branding", titleEn: "Fabrication", isVisible: true },
      { slug: "feasibility-design-research", titleEn: "Feasibility", isVisible: true },
    ];

    const canonicalServices = getAllCanonicalServices();
    const servicesMap = new Map<string, any>();

    canonicalServices.forEach((cs) => {
      servicesMap.set(cs.slug, { slug: cs.slug, titleEn: cs.titleEn });
    });

    rawDbServices.forEach((dbs) => {
      if (dbs.isVisible !== false) {
        const canonical = getCanonicalService(dbs.slug);
        const targetSlug = canonical ? canonical.slug : dbs.slug;
        servicesMap.set(targetSlug, {
          ...(servicesMap.get(targetSlug) || {}),
          ...dbs,
          slug: targetSlug,
        });
      }
    });

    const effectiveServices = Array.from(servicesMap.values());
    expect(effectiveServices.length).toBe(10);
    expect(effectiveServices.map((s) => s.slug)).toEqual([
      "mega-events",
      "fec-development",
      "kids-concepts",
      "experiential-activations",
      "shows-performances",
      "av-stage-rentals",
      "attraction-operations",
      "ticketing-solutions",
      "fabrication-branding",
      "feasibility-design-research",
    ]);
  });
});
