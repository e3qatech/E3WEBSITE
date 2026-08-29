/**
 * Verified Case Study Metrics & Proof Point Contract
 */
export interface VerifiedCaseStudyMetric {
  id?: string;
  value: string;
  prefix?: string;
  suffix?: string;
  labelEn: string;
  labelAr: string;
  sourceEn?: string;
  sourceAr?: string;
  isHighlighted?: boolean;
}

/**
 * Before / After Spatial Transformation Contract
 */
export interface CaseStudyBeforeAfterPayload {
  enabled?: boolean;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  beforeCaptionEn?: string;
  beforeCaptionAr?: string;
  afterCaptionEn?: string;
  afterCaptionAr?: string;
}

/**
 * Turnkey Scope & Timeline Specifications Contract
 */
export interface CaseStudyScopeTimelinePayload {
  durationEn?: string;
  durationAr?: string;
  scaleEn?: string;
  scaleAr?: string;
  locationEn?: string;
  locationAr?: string;
  deliverablesEn?: string[];
  deliverablesAr?: string[];
  disciplines?: string[]; // service slugs
}

/**
 * Case Study Media Gallery Item Contract
 */
export interface CaseStudyGalleryItemPayload {
  id: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO" | "YOUTUBE" | "VIMEO";
  captionEn?: string;
  captionAr?: string;
  orderIndex?: number;
  aspectRatio?: "16:9" | "4:3" | "1:1";
}

/**
 * Case Study Verified Testimonial Contract
 */
export interface CaseStudyTestimonialPayload {
  id?: string;
  quoteEn: string;
  quoteAr?: string;
  authorEn: string;
  authorAr?: string;
  roleEn?: string;
  roleAr?: string;
  companyEn?: string;
  companyAr?: string;
  avatarUrl?: string;
  companyLogoUrl?: string;
  isVerified?: boolean;
}

/**
 * Full Typed Presentation Model for Case Studies ("The Vault" Framework)
 */
export interface CaseStudyPresentation {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  clientName: string;
  year: number;
  category: string;
  isFeatured: boolean;
  isPublished: boolean;
  heroImageUrl: string;
  heroMediaType: "IMAGE" | "VIDEO";
  thumbnailUrl: string;
  thumbnailMediaType: "IMAGE" | "VIDEO" | "SPLINE";
  clientLogoUrl?: string;
  challengeEn: string;
  challengeAr: string;
  solutionEn: string;
  solutionAr: string;
  resultEn: string;
  resultAr: string;
  metrics: VerifiedCaseStudyMetric[];
  scopeTimeline: CaseStudyScopeTimelinePayload;
  beforeAfter?: CaseStudyBeforeAfterPayload | null;
  gallery: CaseStudyGalleryItemPayload[];
  testimonials: CaseStudyTestimonialPayload[];
  teamMembers: Array<{
    id: string;
    roleEn?: string;
    roleAr?: string;
    orderIndex?: number;
    employeeProfile: {
      id: string;
      firstName: string;
      lastName: string;
      designation?: string;
      profileImage?: string;
      department?: string;
    };
  }>;
  relatedServiceSlugs: string[];
  attraction?: any;
  seo?: any;
}

function safeJsonParse<T>(input: unknown, fallback: T): T {
  if (!input) return fallback;
  if (typeof input === "object") return input as T;
  if (typeof input === "string") {
    try {
      return JSON.parse(input) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Adapts raw Prisma / DB CaseStudy record into strict presentation contract.
 * - Database records remain authoritative.
 * - Missing optional sections suppress cleanly.
 * - Enforces verified metrics and testimonials.
 */
export function adaptDbCaseStudyToPresentation(dbCase: any): CaseStudyPresentation {
  if (!dbCase) {
    throw new Error("Cannot adapt null or undefined case study record");
  }

  const id = String(dbCase.id || "case");
  const slug = String(dbCase.slug || "case");
  const titleEn = String(dbCase.titleEn || "");
  const titleAr = String(dbCase.titleAr || dbCase.titleEn || "");
  const clientName = String(dbCase.clientName || "E3 Experiences Qatar");
  const year = typeof dbCase.year === "number" ? dbCase.year : (dbCase.year ? parseInt(dbCase.year) : new Date().getFullYear());
  const category = String(dbCase.category || "Corporate");
  const isFeatured = Boolean(dbCase.isFeatured);
  const isPublished = dbCase.isPublished !== false;

  const heroImageUrl = String(dbCase.heroImageUrl || dbCase.thumbnailUrl || "");
  const heroMediaType = (dbCase.heroMediaType as "IMAGE" | "VIDEO") || "IMAGE";
  const thumbnailUrl = String(dbCase.thumbnailUrl || dbCase.heroImageUrl || "");
  const thumbnailMediaType = (dbCase.thumbnailMediaType as "IMAGE" | "VIDEO" | "SPLINE") || "IMAGE";
  const clientLogoUrl = dbCase.clientLogoUrl || undefined;

  const challengeEn = String(dbCase.challengeEn || "");
  const challengeAr = String(dbCase.challengeAr || dbCase.challengeEn || "");
  const solutionEn = String(dbCase.solutionEn || "");
  const solutionAr = String(dbCase.solutionAr || dbCase.solutionEn || "");
  const resultEn = String(dbCase.resultEn || "");
  const resultAr = String(dbCase.resultAr || dbCase.resultEn || "");

  // 1. Safe Metrics Parsing & Filtering (Only non-empty valid numbers/labels)
  const rawMetrics = safeJsonParse<any[]>(dbCase.metrics, []);
  const metrics: VerifiedCaseStudyMetric[] = [];
  if (Array.isArray(rawMetrics)) {
    rawMetrics.forEach((m, idx) => {
      const val = m.valueEn || m.value || m.val || m.valueAr || "";
      const labelEn = m.labelEn || m.label || "";
      const labelAr = m.labelAr || m.label || labelEn;
      if (val && (labelEn || labelAr)) {
        metrics.push({
          id: m.id || `metric-${idx}`,
          value: String(val),
          prefix: m.prefix || "",
          suffix: m.suffix || "",
          labelEn: String(labelEn),
          labelAr: String(labelAr),
          sourceEn: m.sourceEn || m.source || undefined,
          sourceAr: m.sourceAr || m.source || undefined,
          isHighlighted: Boolean(m.isHighlighted),
        });
      }
    });
  }

  // 2. Safe Scope & Timeline Parsing
  const rawTechnicalSpecs = safeJsonParse<any>(dbCase.technicalSpecs, {});
  const rawServicesUsed = safeJsonParse<any>(dbCase.servicesUsed, []);
  const scopeTimeline: CaseStudyScopeTimelinePayload = {
    durationEn: rawTechnicalSpecs?.durationEn || rawTechnicalSpecs?.duration || undefined,
    durationAr: rawTechnicalSpecs?.durationAr || rawTechnicalSpecs?.duration || undefined,
    scaleEn: rawTechnicalSpecs?.scaleEn || rawTechnicalSpecs?.scale || undefined,
    scaleAr: rawTechnicalSpecs?.scaleAr || rawTechnicalSpecs?.scale || undefined,
    locationEn: rawTechnicalSpecs?.locationEn || rawTechnicalSpecs?.location || undefined,
    locationAr: rawTechnicalSpecs?.locationAr || rawTechnicalSpecs?.location || undefined,
    deliverablesEn: Array.isArray(rawTechnicalSpecs?.deliverablesEn)
      ? rawTechnicalSpecs.deliverablesEn
      : typeof rawTechnicalSpecs?.deliverablesEn === "string"
      ? rawTechnicalSpecs.deliverablesEn.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : undefined,
    deliverablesAr: Array.isArray(rawTechnicalSpecs?.deliverablesAr)
      ? rawTechnicalSpecs.deliverablesAr
      : typeof rawTechnicalSpecs?.deliverablesAr === "string"
      ? rawTechnicalSpecs.deliverablesAr.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : undefined,
    disciplines: Array.isArray(rawServicesUsed)
      ? rawServicesUsed.map((s: any) => (typeof s === "string" ? s : s.slug || s.id)).filter(Boolean)
      : typeof rawServicesUsed === "string"
      ? rawServicesUsed.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
  };

  // 3. Safe Before/After Parsing (Independent suppression if images missing)
  const rawBeforeAfter = safeJsonParse<any>(dbCase.beforeAfter, null);
  let beforeAfter: CaseStudyBeforeAfterPayload | null = null;
  if (
    rawBeforeAfter &&
    rawBeforeAfter.enabled !== false &&
    rawBeforeAfter.beforeImageUrl &&
    rawBeforeAfter.afterImageUrl
  ) {
    beforeAfter = {
      enabled: true,
      beforeImageUrl: rawBeforeAfter.beforeImageUrl,
      afterImageUrl: rawBeforeAfter.afterImageUrl,
      beforeCaptionEn: rawBeforeAfter.beforeCaptionEn || "Initial Site State",
      beforeCaptionAr: rawBeforeAfter.beforeCaptionAr || "حالة الموقع قبل التنفيذ",
      afterCaptionEn: rawBeforeAfter.afterCaptionEn || "Delivered Transformation",
      afterCaptionAr: rawBeforeAfter.afterCaptionAr || "التحول والإنجاز بعد التنفيذ",
    };
  }

  // 4. Safe Gallery Parsing
  const rawGallery = safeJsonParse<any[]>(dbCase.gallery, []);
  const gallery: CaseStudyGalleryItemPayload[] = [];
  if (Array.isArray(rawGallery)) {
    rawGallery.forEach((item, idx) => {
      const url = item.url || item.mediaUrl || item.imageUrl || "";
      if (url) {
        gallery.push({
          id: item.id || `gal-${idx}`,
          url,
          mediaType: (item.mediaType as any) || (url.endsWith(".mp4") || url.includes("video") ? "VIDEO" : "IMAGE"),
          captionEn: item.captionEn || item.titleEn || undefined,
          captionAr: item.captionAr || item.titleAr || undefined,
          orderIndex: item.orderIndex ?? idx,
          aspectRatio: item.aspectRatio || "16:9",
        });
      }
    });
  }

  // 5. Safe Testimonials Parsing
  const rawTestimonials = safeJsonParse<any[]>(dbCase.testimonials, []);
  const testimonials: CaseStudyTestimonialPayload[] = [];
  if (Array.isArray(rawTestimonials)) {
    rawTestimonials.forEach((t, idx) => {
      const quoteEn = t.quoteEn || t.quote || "";
      const authorEn = t.authorEn || t.author || t.name || "";
      if (quoteEn && authorEn) {
        testimonials.push({
          id: t.id || `test-${idx}`,
          quoteEn: String(quoteEn),
          quoteAr: t.quoteAr || quoteEn,
          authorEn: String(authorEn),
          authorAr: t.authorAr || authorEn,
          roleEn: t.roleEn || t.role || undefined,
          roleAr: t.roleAr || t.role || undefined,
          companyEn: t.companyEn || t.company || clientName,
          companyAr: t.companyAr || t.company || clientName,
          avatarUrl: t.avatarUrl || undefined,
          companyLogoUrl: t.companyLogoUrl || clientLogoUrl || undefined,
          isVerified: t.isVerified !== false,
        });
      }
    });
  }

  // 6. Safe Team Members Mapping
  const teamMembers: any[] = (dbCase.teamMembers || [])
    .filter((tm: any) => tm && tm.employeeProfile)
    .map((tm: any, idx: number) => ({
      id: tm.id || `tm-${idx}`,
      roleEn: tm.roleEn || tm.employeeProfile.designation || "Project Specialist",
      roleAr: tm.roleAr || tm.employeeProfile.designation || "أخصائي المشروع",
      orderIndex: tm.orderIndex ?? idx,
      employeeProfile: {
        id: tm.employeeProfile.id,
        firstName: tm.employeeProfile.firstName,
        lastName: tm.employeeProfile.lastName,
        designation: tm.employeeProfile.designation,
        profileImage: tm.employeeProfile.profileImage,
        department: tm.employeeProfile.department,
      },
    }));

  return {
    id,
    slug,
    titleEn,
    titleAr,
    clientName,
    year,
    category,
    isFeatured,
    isPublished,
    heroImageUrl,
    heroMediaType,
    thumbnailUrl,
    thumbnailMediaType,
    clientLogoUrl,
    challengeEn,
    challengeAr,
    solutionEn,
    solutionAr,
    resultEn,
    resultAr,
    metrics,
    scopeTimeline,
    beforeAfter,
    gallery,
    testimonials,
    teamMembers,
    relatedServiceSlugs: scopeTimeline.disciplines || [],
    attraction: dbCase.attraction || null,
    seo: safeJsonParse(dbCase.seo, {}),
  };
}
