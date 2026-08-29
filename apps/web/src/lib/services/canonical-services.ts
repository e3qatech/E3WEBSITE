/**
 * E3 Canonical B2B Services — System Constants, Types & Migration Templates
 *
 * NOTE: All public-facing frontend marketing copy, metrics, descriptions, and media
 * must be sourced dynamically from the database (Prisma `Service` records).
 * This file contains strictly TypeScript interfaces, module registry keys,
 * legacy URL redirect mappings, and initial database seed templates.
 */

export const CANONICAL_SERVICE_SLUGS = [
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
] as const;

export type CanonicalServiceSlug = typeof CANONICAL_SERVICE_SLUGS[number];

/**
 * Mapping of historical / legacy slugs to current canonical slugs for permanent redirects.
 */
export const LEGACY_SERVICE_SLUG_REDIRECTS: Record<string, CanonicalServiceSlug> = {
  "family-entertainment-centers": "fec-development",
  "fec": "fec-development",
  "fec-dev": "fec-development",
  "kids-play-concepts": "kids-concepts",
  "kids-play": "kids-concepts",
  "kids": "kids-concepts",
  "immersive-attractions": "kids-concepts",
  "event-engineering": "mega-events",
  "events": "mega-events",
  "experiential-brand-activations": "experiential-activations",
  "brand-activations": "experiential-activations",
  "brand-activation": "experiential-activations",
  "activations": "experiential-activations",
  "live-shows-performances": "shows-performances",
  "shows": "shows-performances",
  "seasonal-campaigns": "shows-performances",
  "audio-visual-stage": "av-stage-rentals",
  "e3-rentals": "av-stage-rentals",
  "av-rentals": "av-stage-rentals",
  "av-multimedia": "av-stage-rentals",
  "rentals": "av-stage-rentals",
  "attraction-operations-management": "attraction-operations",
  "venue-management": "attraction-operations",
  "operations": "attraction-operations",
  "attractions-operations": "attraction-operations",
  "ticketing-access-solutions": "ticketing-solutions",
  "ticketing": "ticketing-solutions",
  "bookingqube": "ticketing-solutions",
  "spatial-fabrication-theming": "fabrication-branding",
  "custom-fabrication": "fabrication-branding",
  "fabrication": "fabrication-branding",
  "branding": "fabrication-branding",
  "design-research": "feasibility-design-research",
  "entertainment-consulting": "feasibility-design-research",
  "feasibility-research": "feasibility-design-research",
  "feasibility-studies": "feasibility-design-research",
  "feasibility": "feasibility-design-research",
};

export const CANONICAL_SERVICES_METADATA: Record<CanonicalServiceSlug, { titleEn: string; titleAr: string }> = {
  "mega-events": {
    titleEn: "Mega Events & End-to-End Production",
    titleAr: "الفعاليات الكبرى والإنتاج المتكامل",
  },
  "fec-development": {
    titleEn: "Family Entertainment Centre Development",
    titleAr: "تطوير مراكز الترفيه العائلي",
  },
  "kids-concepts": {
    titleEn: "Kids’ Play Concepts",
    titleAr: "مفاهيم ومناطق ألعاب الأطفال",
  },
  "experiential-activations": {
    titleEn: "Experiential Activations",
    titleAr: "التفعيلات والتجارب التفاعلية",
  },
  "shows-performances": {
    titleEn: "Shows & Performances",
    titleAr: "العروض والإنتاج المسرحي",
  },
  "av-stage-rentals": {
    titleEn: "AV, Stage Equipment & Rentals",
    titleAr: "الأنظمة الصوتية والمرئية وتجهيزات المسارح",
  },
  "attraction-operations": {
    titleEn: "Attraction Operations Support",
    titleAr: "تشغيل وإدارة الوجهات الترفيهية",
  },
  "ticketing-solutions": {
    titleEn: "Ticketing & Accreditation Solutions",
    titleAr: "حلول التذاكر وإدارة الدخول والاعتماد",
  },
  "fabrication-branding": {
    titleEn: "Fabrication & Branding",
    titleAr: "التصنيع المعماري والهوية المكانية",
  },
  "feasibility-design-research": {
    titleEn: "Feasibility, Design & Research",
    titleAr: "دراسات الجدوى والتصميم والأبحاث الترفيهية",
  },
};

export function getLocalizedCanonicalServiceTitle(slug: string, isAr: boolean): string {
  const meta = CANONICAL_SERVICES_METADATA[slug as CanonicalServiceSlug];
  if (meta) {
    return isAr ? meta.titleAr : meta.titleEn;
  }
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function resolveCanonicalSlug(slug: string): CanonicalServiceSlug | null {
  const normalized = slug.trim().toLowerCase();
  if ((CANONICAL_SERVICE_SLUGS as readonly string[]).includes(normalized)) {
    return normalized as CanonicalServiceSlug;
  }
  return LEGACY_SERVICE_SLUG_REDIRECTS[normalized] || null;
}

export const resolveServiceSlug = resolveCanonicalSlug;
export const CANONICAL_SERVICES = CANONICAL_SERVICE_SLUGS;

export function isCanonicalSlug(slug: string): boolean {
  return (CANONICAL_SERVICE_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());
}

export function getCanonicalService(slug: string): any {
  const canonicalSlug = resolveCanonicalSlug(slug);
  if (!canonicalSlug) return null;
  const tmpl = INITIAL_SERVICE_TEMPLATES[canonicalSlug];
  if (!tmpl) return null;
  return {
    id: canonicalSlug,
    slug: canonicalSlug,
    titleEn: tmpl.titleEn,
    titleAr: tmpl.titleAr,
    taglineEn: tmpl.taglineEn,
    taglineAr: tmpl.taglineAr,
    categoryEn: tmpl.categoryEn,
    categoryAr: tmpl.categoryAr,
    heroOutcomeEn: tmpl.cms.heroOutcomeEn,
    heroOutcomeAr: tmpl.cms.heroOutcomeAr,
    supportingStatementEn: tmpl.cms.supportingStatementEn,
    supportingStatementAr: tmpl.cms.supportingStatementAr,
    process: tmpl.cms,
    ...tmpl.cms
  };
}

export function getAllCanonicalServices(): any[] {
  return CANONICAL_SERVICE_SLUGS.map((s) => getCanonicalService(s)).filter(Boolean);
}

export type CanonicalService = any;

// ---------------------------------------------------------------------------
// TYPE DEFINITIONS FOR CMS-MANAGED SERVICE CONTENT & CLAIM GOVERNANCE
// ---------------------------------------------------------------------------

export type VerificationStatus = "DRAFT" | "VERIFIED" | "APPROVED" | "EXPIRED";

export interface StructuredClaim {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  status: VerificationStatus;
  evidence: string;
  evidenceNotes?: string;
  isPublicEvidence?: boolean;
  publicSourceUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  expiryDate?: string | null;
  scope?: string;
}

/**
 * Strict Claim Governance Filter:
 * Only APPROVED claims with non-empty evidence that have not expired may render publicly.
 */
export function isApprovedClaim(claim: any): boolean {
  if (!claim || typeof claim !== "object") return false;
  if (claim.status !== "APPROVED") return false;
  const ev = (claim.evidence || claim.documentUrl || claim.sourceEn || claim.sourceAr || "").trim();
  if (!ev || ev.length === 0) return false;
  if (claim.expiryDate) {
    const exp = new Date(claim.expiryDate);
    if (!isNaN(exp.getTime()) && exp.getTime() <= Date.now()) {
      return false;
    }
  }
  return true;
}

export interface VerifiedProofPoint extends StructuredClaim {
  value: string;
  labelEn: string;
  labelAr: string;
}

export interface WowHowItem {
  id: string;
  titleEn: string;
  titleAr: string;
  wowEn: string;
  wowAr: string;
  howEn: string;
  howAr: string;
  wowMediaUrl?: string;
  wowMediaType?: "IMAGE" | "VIDEO";
  howMediaUrl?: string;
  howMediaType?: "IMAGE" | "VIDEO";
  verifiedOutcomeEn?: string;
  verifiedOutcomeAr?: string;
}

export interface ServiceObjective {
  id: string;
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface CapabilityBentoItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  deliverablesEn: string[];
  deliverablesAr: string[];
  suitableForEn: string[];
  suitableForAr: string[];
  tagEn?: string;
  tagAr?: string;
  mediaUrl?: string;
  colSpan?: 1 | 2;
}

export interface EngagementModel {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  bestForEn: string;
  bestForAr: string;
  typicalDurationEn: string;
  typicalDurationAr: string;
}

export interface DeliverableCategory {
  id: string;
  titleEn: string;
  titleAr: string;
  itemsEn: string[];
  itemsAr: string[];
}

export interface LifecycleStage {
  id: string;
  stageNumber: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  outputsEn: string[];
  outputsAr: string[];
  mediaUrl?: string;
}

export type SpecialistModuleType =
  | "scale-explorer"
  | "fec-lifecycle"
  | "kids-age-matrix"
  | "activation-mapper"
  | "performance-catalogue"
  | "av-venue-selector"
  | "operations-sop-model"
  | "ticketing-flow"
  | "fabrication-materials"
  | "research-study-gates";

export interface SpecialistModuleSpec {
  labelEn: string;
  labelAr: string;
  valueEn: string;
  valueAr: string;
  claimId?: string;
}

export interface SpecialistModuleItem {
  id: string;
  labelEn: string;
  labelAr: string;
  tagEn?: string;
  tagAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  mediaUrl?: string;
  specs?: SpecialistModuleSpec[];
  outputsEn?: string[];
  outputsAr?: string[];
  claim?: StructuredClaim;
}

export interface SpecialistModuleSection {
  id: string;
  titleEn: string;
  titleAr: string;
  items: SpecialistModuleItem[];
}

export interface ServiceSpecificModuleConfig {
  type: SpecialistModuleType;
  moduleType?: SpecialistModuleType;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  disclaimerEn?: string;
  disclaimerAr?: string;
  options?: SpecialistModuleItem[];
  sections?: SpecialistModuleSection[];
  data?: Record<string, any>;
}

export interface EnterpriseReadinessItem extends StructuredClaim {
  documentUrl?: string;
}

export interface StructuredMediaConfig {
  url: string;
  mediaType?: "IMAGE" | "VIDEO";
  desktopUrl?: string;
  mobileUrl?: string;
  posterUrl?: string;
  altTextEn?: string;
  altTextAr?: string;
  altEn?: string;
  altAr?: string;
  captionEn?: string;
  captionAr?: string;
  focalPoint?: "center" | "top" | "bottom" | "left" | "right";
  displayFormat?: "16:9" | "4:3" | "1:1" | "custom";
  sortOrder?: number;
  isVisible?: boolean;
  mediaRights?: string;
}

export interface ServiceGalleryItemPayload {
  id: string;
  url: string;
  mediaType?: "IMAGE" | "VIDEO";
  posterUrl?: string;
  captionEn?: string;
  captionAr?: string;
  altTextEn?: string;
  altTextAr?: string;
  altEn?: string;
  altAr?: string;
  focalPoint?: "center" | "top" | "bottom" | "left" | "right";
  displayFormat?: "16:9" | "4:3" | "1:1" | "full-bleed" | "custom";
  mediaRights?: string;
  orderIndex?: number;
  isVisible?: boolean;
}

export type ServiceLayoutVariant = "expanded" | "accordion" | "tabs" | "compact-cards" | "media-led";
export type DeliverablesLayoutVariant = "roster" | "accordion" | "grouped-tabs";

export interface ServicePresentationOptions {
  accentColor?: "emerald" | "amber" | "cyan" | "violet" | "crimson" | "orange" | "gold";
  heroComposition?: "fullscreen-cinematic" | "split-media" | "centered" | "editorial-left";
  sectionSequenceTheme?: "dark-dominant" | "hybrid-editorial" | "light-clean";
  capabilityLayout?: "bento-grid" | "asymmetric-cards" | "feature-list";
  galleryLayout?: "grid" | "filmstrip" | "featured" | "mosaic" | "filmstrip-slider" | "masonry";
  layoutVariant?: ServiceLayoutVariant;
  deliverablesLayout?: DeliverablesLayoutVariant;
  specialistModuleLayout?: "default" | "compact" | "wide";
  ctaLayout?: "split-hero" | "centered-banner" | "minimal-card";
}

export interface ServiceProjectMoment {
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO";
  posterUrl?: string;
  titleEn?: string;
  titleAr?: string;
  statementEn?: string;
  statementAr?: string;
  projectTagEn?: string;
  projectTagAr?: string;
  altTextEn?: string;
  altTextAr?: string;
  focalPoint?: "center" | "top" | "bottom" | "left" | "right";
}

export interface ServiceCmsPayload {
  heroOutcomeEn?: string;
  heroOutcomeAr?: string;
  supportingStatementEn?: string;
  supportingStatementAr?: string;
  directoryCardMediaUrl?: string;
  directoryCardAltTextEn?: string;
  directoryCardAltTextAr?: string;
  navigatorFeatureMediaUrl?: string;
  navigatorFeatureAltTextEn?: string;
  navigatorFeatureAltTextAr?: string;
  heroDesktopMediaUrl?: string;
  heroDesktopAltEn?: string;
  heroDesktopAltAr?: string;
  heroMobileMediaUrl?: string;
  heroMobileAltEn?: string;
  heroMobileAltAr?: string;
  heroVideoUrl?: string;
  heroVideoPosterUrl?: string;
  heroAltTextEn?: string;
  heroAltTextAr?: string;
  heroMediaRights?: string;
  ogImageUrl?: string;
  ogImageAltTextEn?: string;
  ogImageAltTextAr?: string;
  primaryCtaLabelEn?: string;
  primaryCtaLabelAr?: string;
  primaryCtaLink?: string;
  secondaryCtaLabelEn?: string;
  secondaryCtaLabelAr?: string;
  secondaryCtaLink?: string;
  presentation?: ServicePresentationOptions;
  projectMoment?: ServiceProjectMoment;
  verifiedProofPoints?: VerifiedProofPoint[];
  wowHow?: WowHowItem[];
  objectives?: ServiceObjective[];
  capabilities?: CapabilityBentoItem[];
  engagementModels?: EngagementModel[];
  deliverables?: DeliverableCategory[];
  lifecycleStages?: LifecycleStage[];
  galleryItems?: ServiceGalleryItemPayload[];
  serviceSpecificModule?: ServiceSpecificModuleConfig;
  enterpriseReadiness?: EnterpriseReadinessItem[];
  relatedServiceSlugs?: string[];
  selectedCaseStudyIds?: string[];
  caseStudySelectionMode?: "AUTOMATIC" | "MANUAL";
  briefConfig?: {
    enabledObjectives?: string[];
    venueOptions?: string[];
    audienceBrackets?: string[];
    budgetBrackets?: string[];
    customQuestionEn?: string;
    customQuestionAr?: string;
  };
  sectionVisibility?: {
    hero?: boolean;
    wowHow?: boolean;
    objectives?: boolean;
    capabilities?: boolean;
    projectMoment?: boolean;
    engagementModels?: boolean;
    deliverables?: boolean;
    lifecycle?: boolean;
    gallery?: boolean;
    specialistModule?: boolean;
    caseStudies?: boolean;
    enterpriseReadiness?: boolean;
    relatedSolutions?: boolean;
    finalCta?: boolean;
  };
  sectionsOrder?: string[];
  revisions?: Array<{
    timestamp: string;
    author: string;
    note?: string;
    snapshot: any;
  }>;
}

// ---------------------------------------------------------------------------
// DEFAULT CMS INITIALIZATION TEMPLATES (FOR DB MIGRATION & CMS RESET ONLY)
// ---------------------------------------------------------------------------

export const INITIAL_SERVICE_TEMPLATES: Record<CanonicalServiceSlug, {
  categoryEn: string;
  categoryAr: string;
  titleEn: string;
  titleAr: string;
  taglineEn: string;
  taglineAr: string;
  cms: ServiceCmsPayload;
}> = {
  "mega-events": {
    categoryEn: "Mega Events & Production",
    categoryAr: "الفعاليات الكبرى والإنتاج الشامل",
    titleEn: "Mega Events & End-to-End Production",
    titleAr: "الفعاليات الكبرى والإنتاج الشامل",
    taglineEn: "Turnkey planning, creative staging, and execution for national celebrations and large-scale public spectacles.",
    taglineAr: "تخطيط شامل، إخراج إبداعي، وتنفيذ متكامل للاحتفالات الوطنية والفعاليات الجماهيرية الكبرى.",
    cms: {
      heroOutcomeEn: "Flawless Execution on Qatar's Grandest Stages",
      heroOutcomeAr: "تنفيذ لا تشوبه شائبة على أضخم المسارح والمنصات في قطر",
      supportingStatementEn: "From master planning to live show-calling, E3 unites world-class creative direction with military-grade operational engineering.",
      supportingStatementAr: "من المخطط العام وحتى البث الحي وإدارة العرض، تجمع إي ثري بين الإخراج الإبداعي العالمي والهندسة التشغيلية الدقيقة.",
      verifiedProofPoints: [
        { id: "p1", value: "Turnkey", labelEn: "Single-Source Accountability", labelAr: "مسؤولية تنفيذية شاملة وموحدة", status: "APPROVED", evidence: "E3 Mega Events Governance Dossier 2026", approvedBy: "E3 Executive Board", approvedAt: "2026-08-01", titleEn: "Single-Source Turnkey Delivery", titleAr: "تسليم تنفيذي موحد وشامل" },
        { id: "p2", value: "Multi-Discipline", labelEn: "Creative, Technical & Operations", labelAr: "إبداع، تقنية، وإدارة عمليات", status: "APPROVED", evidence: "E3 Integrated Operations Manual 2026", approvedBy: "E3 Executive Board", approvedAt: "2026-08-01", titleEn: "Multi-Discipline Integration", titleAr: "تكامل التخصصات الإبداعية والتقنية" },
        { id: "p3", value: "Qatar-Ready", labelEn: "Full Authority Clearances", labelAr: "تنسيق كامل مع الجهات الحكومية", status: "APPROVED", evidence: "E3 Statutory Coordination Protocol 2026", approvedBy: "E3 Executive Board", approvedAt: "2026-08-01", titleEn: "Statutory & Municipal Clearances", titleAr: "الاعتمادات والتنسيق الحكومي" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Opening Ceremony Experience",
          titleAr: "تجربة حفلات الافتتاح",
          wowEn: "Breathtaking scale, synchronized kinetic stages, immersive projection mapping, and emotionally charged storytelling.",
          wowAr: "إبهار بصري استثنائي، مسارح حركية متزامنة، عروض إسقاط ضوئي غامرة، وسرد قصصي يخلب الألباب.",
          howEn: "Fully engineered spatial layouts, redundant show-control networks, calibrated multi-zone acoustics, and trained crowd flow stewards.",
          howAr: "مخططات مكانية مدروسة، شبكات تحكم احتياطية مزدوجة، أنظمة صوتية متعددة النطاقات، وفرق مدربة لإدارة تدفق الحشود.",
          verifiedOutcomeEn: "Engineered for 100% live show stability and seamless audience flow.",
          verifiedOutcomeAr: "مصممة لضمان استقرار العرض الحي بنسبة 100% وانسيابية تامة للحضور."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Deliver a National Celebration / Opening Ceremony", labelAr: "تنظيم احتفال وطني أو حفل افتتاح رسمي", descriptionEn: "Turnkey creative direction, stage engineering, and VIP protocol delivery.", descriptionAr: "إخراج إبداعي شامل، هندسة مسرحية، وإدارة بروتوكول كبار الشخصيات." },
        { id: "o2", labelEn: "Produce a Multi-Day Public Festival", labelAr: "إنتاج مهرجان جماهيري متعدد الأيام", descriptionEn: "Site infrastructure, multi-stage scheduling, vendor coordination, and crowd safety.", descriptionAr: "بنية تحتية للموقع، جدولة مسارح متعددة، تنسيق الخدمات، وسلامة الحشود." },
        { id: "o3", labelEn: "Turnkey Event Engineering & Technical Direction", labelAr: "إدارة فنية وهندسة تشغيلية متكاملة للفعاليات", descriptionEn: "Complete technical riders, rigging approvals, sound mapping, and live show control.", descriptionAr: "مخططات تقنية معتمدة، تصاريح التعليق الإنشائي، وتوجيه العروض الحية." }
      ],
      capabilities: [
        { id: "c1", titleEn: "Spatial Concept & Creative Masterplanning", titleAr: "المخطط العام والمفاهيم المكانية الإبداعية", descriptionEn: "3D venue mapping, stage architecture, crowd flow zoning, and bespoke narrative thematic development.", descriptionAr: "محاكاة ثلاثية الأبعاد للموقع، تصميم المسارح، تقسيم مسارات الجمهور، وتطوير الهوية الإبداعية.", deliverablesEn: ["3D Venue Masterplan & BIM", "Thematic Concept Narrative", "Stage CAD Drawings"], deliverablesAr: ["المخطط العام ثلاثي الأبعاد ونماذج BIM", "وثيقة المفهوم الإبداعي", "مخططات المسرح الهندسية CAD"], suitableForEn: ["Stadiums", "Public Boulevards", "Exhibition Arenas"], suitableForAr: ["الاستادات", "البوليفارد والمساحات المفتوحة", "المعارض الكبرى"], colSpan: 2, tagEn: "Architecture & Concept", tagAr: "المعمار والمفاهيم" },
        { id: "c2", titleEn: "Live Show Calling & Broadcast Coordination", titleAr: "إدارة العروض الحية والتنسيق الإعلامي", descriptionEn: "Timecode-synchronized show control, stage management, multilingual cueing, and live broadcast integration.", descriptionAr: "توجيه دقيق متزامن مع التايم كود، إدارة الكواليس، وإشارات العرض متعددة اللغات والبث الحي.", deliverablesEn: ["Master Cue Sheet & Rundown", "Show Call Roster", "Broadcast Patching Matrix"], deliverablesAr: ["جدول إشارات العرض الرئيسي", "خطة إدارة الكواليس", "مخطط ربط البث الحي"], suitableForEn: ["Ceremonies", "Concerts", "Official Galas"], suitableForAr: ["الحفلات الرسمية", "المهرجانات", "الاحتفالات الكبرى"], colSpan: 1, tagEn: "Show Production", tagAr: "إدارة العرض" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Turnkey Event Delivery", titleAr: "تسليم الفعالية الشامل (Turnkey)", subtitleEn: "Single-Source EPC Model", subtitleAr: "مسؤولية تنفيذية وهندسية شاملة", descriptionEn: "Full accountability from initial blank-canvas concept to post-event site demobilization and analytics.", descriptionAr: "تولي كامل المسؤولية من الفكرة الأولى حتى تفكيك الموقع والتقارير الختامية.", bestForEn: "Government ministries, sports authorities, and major event organizers.", bestForAr: "الوزارات والهيئات الحكومية، الاتحادات الرياضية، والمنظمون الدوليون.", typicalDurationEn: "3 - 12 Months", typicalDurationAr: "٣ إلى ١٢ شهراً" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Pre-Production & Engineering Phase", titleAr: "مرحلة ما قبل الإنتاج والهندسة", itemsEn: ["Detailed 3D CAD & Rigging Load Analysis", "Event Health, Safety & Environmental Plan (HSE)", "Civil Defence & Municipality Approval Dossier", "Master Show Run-Down & Timecode Matrix"], itemsAr: ["مخططات CAD ثلاثية الأبعاد وتحليل أحمال التعليق", "خطة السلامة والصحة المهنية والبيئة (HSE)", "ملف التنسيق والاعتمادات الرسمية للدفاع المدني والبلدية", "جدول تشغيل العرض الرئيسي ومصفوفة التايم كود"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Discover & Scope", titleAr: "الاستكشاف وتحديد النطاق", descriptionEn: "Site survey, stakeholder alignment, capacity modeling, and authority clearance mapping.", descriptionAr: "معاينة الموقع، مواءمة الأهداف مع الشركاء، نمذجة الطاقة الاستيعابية، وحصر متطلبات التراخيص.", outputsEn: ["Site Feasibility Dossier", "Scope Definition Document"], outputsAr: ["تقرير الجدوى المكانية", "وثيقة نطاق العمل"] },
        { id: "ls2", stageNumber: "02", titleEn: "Design & Spatial BIM", titleAr: "التصميم والنمذجة المكانية", descriptionEn: "3D architectural stage design, lighting plots, acoustic modeling, and crowd simulation.", descriptionAr: "تصميم المسارح ثلاثي الأبعاد، مخططات الإضاءة، المحاكاة الصوتية، وتدفق الحشود.", outputsEn: ["3D Render Deck", "Engineering Load Schedules"], outputsAr: ["حزمة التصاميم ثلاثية الأبعاد", "جداول الأحمال الهندسية"] },
        { id: "ls3", stageNumber: "03", titleEn: "Develop & Procure", titleAr: "التطوير والتصنيع الفني", descriptionEn: "Custom fabrication, technical system prep, rehearsal scheduling, and crew onboarding.", descriptionAr: "التصنيع المخصص، تجهيز الأنظمة التقنية، جدولة البروفات، وتعيين فرق العمل.", outputsEn: ["Production Milestones Schedule", "Vendor SLA Roster"], outputsAr: ["جدول المعالم التنفيذية", "قائمة التوريد والموردين"] },
        { id: "ls4", stageNumber: "04", titleEn: "Deliver & Show-Call", titleAr: "التنفيذ وإدارة العرض الحي", descriptionEn: "Rigging, technical rehearsals, live show cueing, and operational command.", descriptionAr: "التركيب والتعليق الإنشائي، البروفات التقنية، توجيه العرض الحي، وغرفة العمليات.", outputsEn: ["Live Cue Calling", "Daily Operational Log"], outputsAr: ["إدارة العرض المباشر", "السجل التشغيلي اليومي"] },
        { id: "ls5", stageNumber: "05", titleEn: "Measure & Wrap", titleAr: "التقييم والتقرير الختامي", descriptionEn: "Safe de-rigging, site handover, attendance analytics, and post-event debrief.", descriptionAr: "التفكيك الآمن، تسليم الموقع، تقارير الحضور والأداء، والاجتماع الختامي.", outputsEn: ["Post-Event Executive Summary", "Media Asset Archive"], outputsAr: ["الملخص التنفيذي للفعالية", "أرشيف المواد الإعلامية"] }
      ],
      serviceSpecificModule: {
        type: "scale-explorer",
        titleEn: "Mega Events Planning & Production Framework",
        titleAr: "إطار تخطيط وإنتاج الفعاليات الكبرى",
        subtitleEn: "Exploratory planning guidance for venue scale, technical parameters, and site zoning architecture.",
        subtitleAr: "دليل تخطيطي استرشادي لنطاق السعة والتجهيزات التقنية وتقسيم مناطق الموقع.",
        disclaimerEn: "Indicative planning framework. Final production specifications, rigging calculations, and power grids require formal venue site surveys and Civil Defence approvals.",
        disclaimerAr: "إطار تخطيطي استرشادي. تعتمد المواصفات الفنية النهائية وحسابات الأحمال وشبكات الطاقة على المعاينة الميدانية وتراخيص الدفاع المدني.",
        options: [
          {
            id: "tier-ballroom",
            labelEn: "Ballroom & VIP Plazas",
            labelAr: "القاعات الكبرى والساحات الخاصة",
            tagEn: "500 - 2,500 Guests",
            tagAr: "٥٠٠ - ٢,٥٠٠ ضيف",
            descriptionEn: "Intimate high-prestige environments requiring acoustic fidelity, scenic staging, and VIP protocol routing.",
            descriptionAr: "بيئات راقية لكبار الشخصيات تتطلب نقاءً صوتياً استثنائياً، ديكورات مسرحية مخصصة، ومسارات بروتوكولية مستقلة.",
            specs: [
              { labelEn: "Stage Architecture", labelAr: "هندسة المسرح", valueEn: "Modular Scenic Proscenium", valueAr: "مسرح ديكوري تركيبي" },
              { labelEn: "Visual Display", labelAr: "الشاشات المرئية", valueEn: "Fine-Pitch Display Wall", valueAr: "شاشات عرض فائقة الدقة" },
              { labelEn: "Audio Scheme", labelAr: "المنظومة الصوتية", valueEn: "Stereo L/R Line Array", valueAr: "سماعات ستيريو مصفوفة" },
              { labelEn: "Power Scheme", labelAr: "شبكة الطاقة", valueEn: "Synchronized Dual Feed", valueAr: "تغذية كهربائية مزدوجة" }
            ],
            outputsEn: ["VIP Protocol Access Plan", "Acoustic Tuning Report", "Scenic Finish Sign-Off"],
            outputsAr: ["مخطط مسار كبار الشخصيات", "تقرير المعايرة الصوتية", "اعتماد التشطيبات الديكورية"]
          },
          {
            id: "tier-arena",
            labelEn: "Arena & Coastal Pavilions",
            labelAr: "الصالات المغلقة والأجنحة الساحلية",
            tagEn: "2,500 - 15,000 Guests",
            tagAr: "٢,٥٠٠ - ١٥,٠٠٠ ضيف",
            descriptionEn: "Medium-scale dynamic venues requiring reinforced roof trussing, multi-tier sound reinforcement, and crowd management.",
            descriptionAr: "وجهات متوسطة السعة تتطلب هياكل تعليق مقواة، توزيع صوتي متعدد المستويات، وإدارة انسيابية للحشود.",
            specs: [
              { labelEn: "Stage Architecture", labelAr: "هندسة المسرح", valueEn: "Heavy-Duty Grid System", valueAr: "هياكل مسرحية ثقيلة" },
              { labelEn: "Visual Display", labelAr: "الشاشات المرئية", valueEn: "High-Brightness LED System", valueAr: "شاشات LED عالية السطوع" },
              { labelEn: "Audio Scheme", labelAr: "المنظومة الصوتية", valueEn: "Array + Delay Towers", valueAr: "مصفوفة صوتية مع أبراج تأخير" },
              { labelEn: "Power Scheme", labelAr: "شبكة الطاقة", valueEn: "Multi-Generator Grid", valueAr: "شبكة مولدات متزامنة" }
            ],
            outputsEn: ["Rigging Load Calculation Pack", "Crowd Ingress/Egress Plan", "Broadcast Patch Plan"],
            outputsAr: ["حسابات أوزان التعليق الإنشائي", "مخطط تدفق الحشود والطوارئ", "مخطط البث التلفزيوني"]
          },
          {
            id: "tier-boulevard",
            labelEn: "Boulevard & Open Grandstands",
            labelAr: "البوليفارد والمدرجات المفتوحة",
            tagEn: "15,000 - 40,000 Guests",
            tagAr: "١٥,٠٠٠ - ٤٠,٠٠٠ ضيف",
            descriptionEn: "Large linear outdoor spaces requiring weatherized electrical infrastructure, distributed audio, and safety zoning.",
            descriptionAr: "مساحات مفتوحة ممتدة تتطلب بنية كهربائية مقاومة للعوامل الجوية، صوتاً موزعاً بعناية، وتقسيم مناطق الأمان.",
            specs: [
              { labelEn: "Stage Architecture", labelAr: "هندسة المسرح", valueEn: "Modular Truss Architecture", valueAr: "جمالونات إنشائية ممتدة" },
              { labelEn: "Visual Display", labelAr: "الشاشات المرئية", valueEn: "Weatherized LED Canvas", valueAr: "شاشات خارجية مقاومة للمناخ" },
              { labelEn: "Audio Scheme", labelAr: "المنظومة الصوتية", valueEn: "Distributed Delay Network", valueAr: "شبكة أبراج صوتية موزعة" },
              { labelEn: "Power Scheme", labelAr: "شبكة الطاقة", valueEn: "Dual-Feeder Substation", valueAr: "محطة تغذية مزدوجة" }
            ],
            outputsEn: ["Weather Mitigation Matrix", "Pedestrian Egress Dossier", "Civil Defence Approval Dossier"],
            outputsAr: ["خطة مواجهة العوامل الجوية", "ملف مسارات المشاة والإخلاء", "ملف موافقة الدفاع المدني"]
          },
          {
            id: "tier-stadium",
            labelEn: "National Stadium Complex",
            labelAr: "مجمعات الاستادات الوطنية",
            tagEn: "40,000+ Guests",
            tagAr: "٤٠,٠٠٠+ ضيف",
            descriptionEn: "Grand-scale stadium environments requiring custom 360° stage architecture, field-of-play protection, and synchronized multi-point networks.",
            descriptionAr: "استادات كبرى تتطلب مسارح 360 درجة، حماية أرضية الملعب، وشبكات تحكم وتوزيع متزامنة.",
            specs: [
              { labelEn: "Stage Architecture", labelAr: "هندسة المسرح", valueEn: "Custom Spatial Staging", valueAr: "مسارح مكانية مخصصة" },
              { labelEn: "Visual Display", labelAr: "الشاشات المرئية", valueEn: "360° Stadium Visual System", valueAr: "منظومة شاشات محيطية 360" },
              { labelEn: "Audio Scheme", labelAr: "المنظومة الصوتية", valueEn: "Stadium Ring Delay System", valueAr: "منظومة صوتية حلقية شاملة" },
              { labelEn: "Power Scheme", labelAr: "شبكة الطاقة", valueEn: "Isolated Triple-Grid Set", valueAr: "شبكة طاقة ثلاثية معزولة" }
            ],
            outputsEn: ["Turf Protection System", "Multi-Point Timecode Matrix", "Master Incident Command Plan"],
            outputsAr: ["نظام حماية العشب الطبيعي", "مصفوفة توحيد إشارات التايم كود", "خطة قيادة العمليات المركزية"]
          }
        ],
        sections: [
          {
            id: "site-zones",
            titleEn: "Site Zoning & Operations Command",
            titleAr: "تقسيم مناطق الموقع وغرفة العمليات",
            items: [
              { id: "z1", labelEn: "Main Stage & Performance Zone", labelAr: "منطقة المسرح والعرض الحي", tagEn: "Production Core", tagAr: "قلب الإنتاج", descriptionEn: "Structural staging, lighting grids, audio delay towers, and performer access corridors.", descriptionAr: "الهياكل الإنشائية للمسرح، شبكات الإضاءة، أبراج الصوت، ومسارات الفنانين." },
              { id: "z2", labelEn: "FOH Technical & Broadcast Control", labelAr: "غرفة التحكم الفني والبث التلفزيوني", tagEn: "Technical Hub", tagAr: "المركز التقني", descriptionEn: "Front-of-House sound and lighting control, timecode distribution, and broadcast media links.", descriptionAr: "التحكم بالصوت والإضاءة المباشرة، توزيع إشارات التايم كود، والربط الإعلامي." },
              { id: "z3", labelEn: "VIP Hospitality & Protocol Zone", labelAr: "منطقة كبار الشخصيات والبروتوكول", tagEn: "Hospitality", tagAr: "الضيافة الرسمية", descriptionEn: "Private protocol viewing galleries, acoustic isolation barriers, and dedicated security gates.", descriptionAr: "منصات المشاهدة الخاصة، حواجز العزل الصوتي، وبوابات الدخول الأمنية." },
              { id: "z4", labelEn: "Operations & Incident Command", labelAr: "مركز العمليات وإدارة الطوارئ", tagEn: "Safety & Command", tagAr: "القيادة والسلامة", descriptionEn: "Joint operational control center linking venue telemetry, crowd flow, and emergency services.", descriptionAr: "مركز عمليات مشترك يربط بيانات الميدان وتدفق الحشود مع فرق الطوارئ." }
            ]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Documented Risk Assessments (RAMS)", titleAr: "تقييم المخاطر وإجراءات العمل الآمن (RAMS)", descriptionEn: "Site-specific Risk Assessment and Method Statements prepared for every structural build and live show element.", descriptionAr: "تقييم مفصل للمخاطر وبيان طريقة العمل الآمن لكل هيكل إنشائي وعنصر تقني.", status: "APPROVED", evidence: "E3 Mega Events HSE Manual 2026", approvedBy: "E3 HSE Committee", approvedAt: "2026-08-01" },
        { id: "er2", titleEn: "Civil Defence & Municipal Clearances", titleAr: "التنسيق مع الدفاع المدني والجهات البلدية", descriptionEn: "Direct coordination for egress widths, fire suppression access, flame-retardant certifications, and structural load sign-offs.", descriptionAr: "تنسيق مباشر لمسارات الطوارئ، شهادات مقاومة الحريق للمواد، واعتمادات الأحمال الإنشائية.", status: "APPROVED", evidence: "E3 Statutory Coordination Guidelines", approvedBy: "E3 HSE Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["shows-performances", "av-stage-rentals", "ticketing-solutions", "fabrication-branding", "attraction-operations"]
    }
  },
  "fec-development": {
    categoryEn: "Location-Based Entertainment",
    categoryAr: "مراكز الترفيه العائلي",
    titleEn: "Family Entertainment Centre Development",
    titleAr: "تطوير مراكز الترفيه العائلي (FEC)",
    taglineEn: "Turnkey spatial concepting, master planning, ride fitout, and operational readiness for indoor entertainment hubs.",
    taglineAr: "تطوير شامل، مخططات معمارية، تجهيز مناطق الألعاب، وجاهزية تشغيلية كاملة للمراكز الترفيهية المغلقة.",
    cms: {
      heroOutcomeEn: "High-Yield Attraction Landmarks Built to Endure",
      heroOutcomeAr: "معالم ترفيهية عالية العائد مصممة للاستدامة والنمو",
      supportingStatementEn: "E3 transforms retail and leisure footprints into high-footfall entertainment destinations with optimized guest dwell time and operational margins.",
      supportingStatementAr: "تحوّل إي ثري المساحات التجارية والترفيهية إلى وجهات استثنائية تعزز مدة إقامة الزوار وترفع العوائد التشغيلية.",
      verifiedProofPoints: [
        { id: "p1", value: "Turnkey", labelEn: "Concept to Opening Day", labelAr: "من الفكرة حتى يوم الافتتاح", status: "APPROVED", evidence: "E3 FEC Project Delivery Charter 2026", approvedBy: "E3 Projects Committee", approvedAt: "2026-08-01", titleEn: "Turnkey Project Delivery", titleAr: "تسليم المشاريع الشامل" },
        { id: "p2", value: "Revenue-Led", labelEn: "Optimized Flow & Spend", labelAr: "تصميم يعظم تدفق الزوار والإنفاق", status: "APPROVED", evidence: "E3 Spatial Yield Framework 2026", approvedBy: "E3 Commercial Committee", approvedAt: "2026-08-01", titleEn: "Commercial Flow Optimization", titleAr: "تعظيم التدفق التجاري" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Guest Immersion vs. Operational Flow",
          titleAr: "اندماج الزائر مقابل الكفاءة التشغيلية",
          wowEn: "Vibrant thematic worlds, intuitive play journeys, and immersive family experiences that drive repeat visitation.",
          wowAr: "عوالم تفاعلية آسرة، رحلة زائر بديهية وسلسة، وتجارب عائلية تحفز تكرار الزيارة باستمرار.",
          howEn: "Data-backed capacity modeling, maintenance-friendly ride zoning, integrated cashless POS, and safety-verified play equipment.",
          howAr: "نمذجة الطاقة الاستيعابية، تخطيط مناطق الألعاب لسهولة الصيانة، أنظمة دفع لا تلامسية، وتجهيزات ألعاب معتمدة السلامة.",
          verifiedOutcomeEn: "Engineered for maximum guest safety and commercial viability.",
          verifiedOutcomeAr: "مصممة لتحقيق أعلى درجات الأمان والسلامة مع كفاءة تجارية مستدامة."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Develop New Mall Anchor FEC", labelAr: "تطوير مركز ترفيهي رئيسي داخل مجمع تجاري", descriptionEn: "Turnkey development from feasibility to fitout and opening day.", descriptionAr: "تطوير شامل من دراسة الجدوى حتى التجهيزات والافتتاح." },
        { id: "o2", labelEn: "Retrofit & Modernize Existing Venue", labelAr: "تحديث وتطوير مركز ترفيهي قائم", descriptionEn: "Attraction replacement, cashless system upgrades, and refreshed theming.", descriptionAr: "استبدال الألعاب، ترقية أنظمة التذاكر الذكية، وتجديد الديكورات." }
      ],
      capabilities: [
        { id: "c1", titleEn: "FEC Masterplanning & Capacity Modeling", titleAr: "المخطط العام ونمذجة الطاقة الاستيعابية", descriptionEn: "Zoning for active play, redemption arcades, F&B hubs, and party rooms with simulated peak-hour throughput.", descriptionAr: "تقسيم مناطق اللعب الحركي، ألعاب الأركيد، المطاعم، وغرف الحفلات مع محاكاة ساعات الذروة.", deliverablesEn: ["Detailed 2D/3D Masterplan", "Capacity & Throughput Matrix", "Ride Layout Specifications"], deliverablesAr: ["المخطط العام ثنائي وثلاثي الأبعاد", "مصفوفة الاستيعاب والتدفق", "مخططات توزيع الألعاب"], suitableForEn: ["Shopping Malls", "Stand-Alone Venues", "Mixed-Use Resorts"], suitableForAr: ["المجمعات التجارية", "المراكز المستقلة", "المنتجعات متعددة الاستخدامات"], colSpan: 2, tagEn: "Masterplanning", tagAr: "المخطط العام" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Design & Build (Turnkey EPC)", titleAr: "التصميم والتنفيذ الشامل (EPC)", subtitleEn: "Full Spatial & Fitout Delivery", subtitleAr: "تنفيذ كامل للمساحات والتجهيزات", descriptionEn: "Complete concept creation, architectural fitout, attraction procurement, testing, and operational handover.", descriptionAr: "ابتكار المفهوم، أعمال الديكور والتجهيز، توريد وتركيب الألعاب، الفحص والتشغيل التجريبي.", bestForEn: "Real estate developers and commercial property owners.", bestForAr: "المطورون العقاريون ومالكو العقارات التجارية.", typicalDurationEn: "6 - 18 Months", typicalDurationAr: "٦ إلى ١٨ شهراً" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Architecture & Procurement", titleAr: "التصميم الهندسي والتوريد", itemsEn: ["Architectural Fitout Drawings & MEP Specifications", "Ride & Attraction Procurement Matrix", "Civil Defence Fire & Safety Compliance Pack"], itemsAr: ["مخططات الديكور والمواصفات الكهروميكانيكية MEP", "جدول توريد وتركيب الألعاب والمعدات", "ملف اعتمادات السلامة والدفاع المدني"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Vision & Space Feasibility", titleAr: "الرؤية والجدوى المكانية", descriptionEn: "Footprint analysis, catchment demographics, and commercial modeling.", descriptionAr: "تحليل المساحة، التركيبة السكانية المحيطة، والنموذج التجاري.", outputsEn: ["Demographic Fit Report", "Space Layout Concept"], outputsAr: ["تقرير التوافق الديمغرافي", "المفهوم الأولي للمساحة"] },
        { id: "ls2", stageNumber: "02", titleEn: "Masterplanning & 3D Design", titleAr: "المخطط العام والتصميم ثلاثي الأبعاد", descriptionEn: "Thematic development, ride selection, and MEP coordination.", descriptionAr: "تطوير الثيمة، اختيار الألعاب، وتنسيق المخططات الهندسية.", outputsEn: ["3D Virtual Walkthrough", "MEP Fitout Package"], outputsAr: ["جولة افتراضية ثلاثية الأبعاد", "حزمة المخططات الكهروميكانيكية"] },
        { id: "ls3", stageNumber: "03", titleEn: "Fitout & Installation", titleAr: "التجهيز والتركيب الموقعي", descriptionEn: "Interior construction, ride assembly, and acoustic treatments.", descriptionAr: "أعمال البناء والديكور، تركيب الألعاب، والمعالجات الصوتية.", outputsEn: ["Installation Sign-Off", "Load Test Certificates"], outputsAr: ["محاضر اعتماد التركيب", "شهادات فحص الأحمال"] },
        { id: "ls4", stageNumber: "04", titleEn: "Operational Readiness (ORAT)", titleAr: "الجاهزية التشغيلية (ORAT)", descriptionEn: "Staff training, POS cashless setup, SOP dry runs, and soft launch.", descriptionAr: "تدريب الكوادر، ربط نقاط البيع الذكية، واختبارات التشغيل التجريبي.", outputsEn: ["Venue Operating Manual", "Opening Readiness Report"], outputsAr: ["دليل تشغيل المركز", "تقرير الجاهزية للافتتاح"] }
      ],
      serviceSpecificModule: {
        type: "fec-lifecycle",
        titleEn: "FEC Development Governance Framework",
        titleAr: "إطار حوكمة وتطوير المراكز الترفيهية",
        subtitleEn: "Structured 4-phase development lifecycle for family entertainment centers and thematic destinations.",
        subtitleAr: "مراحل التطوير المنهجية المكونة من 4 بوابات لمراكز الترفيه العائلي والوجهات الترفيهية.",
        disclaimerEn: "Phasing timelines and spatial allocations are indicative estimates subject to site condition, landlord criteria, and municipal permitting.",
        disclaimerAr: "الجداول الزمنية وتوزيع المساحات استرشادية وتخضع للمعاينة الميدانية واشتراطات المطور والبلدية.",
        options: [
          {
            id: "fec-boutique",
            labelEn: "Boutique Play & Edutainment",
            labelAr: "المراكز الترفيهية والتعليمية المدمجة",
            tagEn: "1,000 - 2,500 m²",
            tagAr: "١,٠٠٠ - ٢,٥٠٠ م²",
            descriptionEn: "Mall-integrated anchor zone focused on early childhood development, soft play mazes, and birthday party rooms.",
            descriptionAr: "مساحات مدمجة داخل المجمعات تركز على تنمية مهارات الأطفال، متاهات اللعب الناعم، وغرف الفعاليات الخاصة.",
            specs: [
              { labelEn: "Primary Attraction", labelAr: "النشاط الرئيسي", valueEn: "Soft Play & Roleplay", valueAr: "ألعاب حركية ومحاكاة أدوار" },
              { labelEn: "Circulation Ratio", labelAr: "نسبة الممرات", valueEn: "35% - 40% Open Flow", valueAr: "٣٥٪ - ٤٠٪ مساحات حركة" },
              { labelEn: "Dwell Time", labelAr: "متوسط مدة الإقامة", valueEn: "90 - 120 Minutes", valueAr: "٩٠ - ١٢٠ دقيقة" }
            ],
            outputsEn: ["Age-Appropriate Play Zoning", "Acoustic Attenuation Plan", "Party Room Booking Flow"],
            outputsAr: ["تقسيم الألعاب حسب العمر", "خطة العزل الصوتي", "مسار حجز غرف الحفلات"]
          },
          {
            id: "fec-flagship",
            labelEn: "Flagship Family Entertainment Center",
            labelAr: "المراكز الترفيهية العائلية الرئيسية",
            tagEn: "2,500 - 6,000 m²",
            tagAr: "٢,٥٠٠ - ٦,٠٠٠ م²",
            descriptionEn: "Multi-activity regional destination combining redemption arcades, high-ropes courses, VR simulators, and casual dining.",
            descriptionAr: "وجهة إقليمية تجمع بين ألعاب الأركيد، مسارات الحبال والتسلق، أجهزة الواقع الافتراضي، ومنطقة المطاعم.",
            specs: [
              { labelEn: "Primary Attraction", labelAr: "النشاط الرئيسي", valueEn: "Arcade + Ropes + VR", valueAr: "أركيد + تسلق + واقع افتراضي" },
              { labelEn: "Circulation Ratio", labelAr: "نسبة الممرات", valueEn: "40% - 45% Open Flow", valueAr: "٤٠٪ - ٤٥٪ مساحات حركة" },
              { labelEn: "Dwell Time", labelAr: "متوسط مدة الإقامة", valueEn: "2.5 - 3.5 Hours", valueAr: "٢,٥ - ٣,٥ ساعات" }
            ],
            outputsEn: ["Cashless POS Integration Plan", "Power & Data Grid Schedule", "Preventive Maintenance Roster"],
            outputsAr: ["خطة ربط التذاكر الذكية", "جدول شبكات الكهرباء والبيانات", "جدول الصيانة الوقائية"]
          },
          {
            id: "fec-destination",
            labelEn: "Mega Theme & Adventure Destination",
            labelAr: "الوجهات الترفيهية والمغامرات الكبرى",
            tagEn: "6,000 - 12,000+ m²",
            tagAr: "٦,٠٠٠ - ١٢,٠٠٠+ م²",
            descriptionEn: "Standalone destination attraction featuring indoor roller coasters, drop towers, immersive theming, and branded retail.",
            descriptionAr: "معلم ترفيهي مستقل يضم قطارات أفعوانية داخلية، أبراج هبوط، بيئات سينمائية غامرة، ومتاجر تجزئة متخصصة.",
            specs: [
              { labelEn: "Primary Attraction", labelAr: "النشاط الرئيسي", valueEn: "Major Mechanical Rides", valueAr: "ألعاب ميكانيكية كبرى" },
              { labelEn: "Circulation Ratio", labelAr: "نسبة الممرات", valueEn: "45% - 50% Open Flow", valueAr: "٤٥٪ - ٥٠٪ مساحات حركة" },
              { labelEn: "Dwell Time", labelAr: "متوسط مدة الإقامة", valueEn: "4+ Hours", valueAr: "٤+ ساعات" }
            ],
            outputsEn: ["Ride Foundation & Load Sign-Off", "Civil Defence Egress Matrix", "Full Facility Operating Manual"],
            outputsAr: ["اعتمادات قواعد وأحمال الألعاب", "مصفوفة مسارات الطوارئ للدفاع المدني", "دليل التشغيل الشامل للمرفق"]
          }
        ],
        sections: [
          {
            id: "phases",
            titleEn: "4-Phase Delivery Governance",
            titleAr: "بوابات الحوكمة والتنفيذ الأربع",
            items: [
              { id: "ph1", labelEn: "Phase 1: Spatial Feasibility & Zoning", labelAr: "المرحلة ١: الجدوى المكانية والتقسيم", tagEn: "Feasibility", tagAr: "الجدوى", descriptionEn: "Catchment analysis, spatial layout concepts, and initial capacity sizing.", descriptionAr: "تحليل النطاق الجغرافي، المفهوم المكاني، وتحديد الطاقة الاستيعابية." },
              { id: "ph2", labelEn: "Phase 2: Concept Masterplan & BIM", labelAr: "المرحلة ٢: المخطط العام ونمذجة BIM", tagEn: "Design", tagAr: "التصميم", descriptionEn: "3D theming, ride selection, MEP engineering, and Civil Defence egress coordination.", descriptionAr: "التصميم ثلاثي الأبعاد، اختيار الألعاب، المخططات الهندسية، ومسارات الطوارئ." },
              { id: "ph3", labelEn: "Phase 3: Civil MEP & Ride Installation", labelAr: "المرحلة ٣: الأعمال الميكانيكية وتركيب الألعاب", tagEn: "Fitout", tagAr: "التنفيذ", descriptionEn: "On-site construction, thematic fabrication, ride assembly, and load testing.", descriptionAr: "أعمال البناء، تصنيع الديكورات، تركيب الألعاب، واختبارات الأحمال المعتمدة." },
              { id: "ph4", labelEn: "Phase 4: ORAT & Soft Opening Clearances", labelAr: "المرحلة ٤: الجاهزية التشغيلية والافتتاح", tagEn: "Readiness", tagAr: "الجاهزية", descriptionEn: "Staff training, POS cashless activation, authority inspections, and operational go-live.", descriptionAr: "تدريب الكوادر، تفعيل الدفع الذكي، الفحص البلدي، وبدء التشغيل التجريبي." }
            ]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Play Safety & Rigorous Inspection", titleAr: "معايير سلامة الألعاب والفحص الدوري", descriptionEn: "All play equipment, impact surfaces, and containment netting engineered and tested to verified safety standards.", descriptionAr: "جميع الألعاب والأسطح الماصة للصدمات وشباك الحماية مصممة ومختبرة وفق معايير السلامة المعتمدة.", status: "APPROVED", evidence: "E3 Play Equipment Safety Verification Manual", approvedBy: "E3 Safety Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["kids-concepts", "attraction-operations", "ticketing-solutions", "fabrication-branding", "feasibility-design-research"]
    }
  },
  "kids-concepts": {
    categoryEn: "Edutainment & Play",
    categoryAr: "المفاهيم الترفيهية للأطفال",
    titleEn: "Kids’ Play Concepts",
    titleAr: "مفاهيم الترفيه واللعب التعليمي للأطفال",
    taglineEn: "Imaginative, sensory, and developmental play environments designed for early childhood and youth engagement.",
    taglineAr: "بيئات لعب تفاعلية ومحفزة للنمو والابتكار مصممة للأطفال والناشئة وفق أعلى معايير السلامة العالمية.",
    cms: {
      heroOutcomeEn: "Playful Learning Environments That Captivate Families",
      heroOutcomeAr: "بيئات لعب تعليمية ملهمة تأسر قلوب الأطفال والعائلات",
      supportingStatementEn: "From bespoke soft play sanctuaries to interactive role-play cities, E3 creates safe, stimulating worlds that turn family leisure into meaningful discovery.",
      supportingStatementAr: "من مساحات اللعب الحركي الآمنة إلى مدن المهن المصغرة، تصنع إي ثري عوالم تحفز الاستكشاف والخيال.",
      verifiedProofPoints: [
        { id: "p1", value: "Safety-First", labelEn: "Certified Materials & Soft Edges", labelAr: "مواد آمنة ومعتمدة وأسطح ناعمة", status: "APPROVED", evidence: "E3 Child Safety Material Standards", approvedBy: "E3 HSE Committee", approvedAt: "2026-08-01", titleEn: "Non-Toxic Materials Standard", titleAr: "معايير المواد غير السامة" },
        { id: "p2", value: "Developmental", labelEn: "Motor & Sensory Stimulation", labelAr: "تنمية المهارات الحركية والحسية", status: "APPROVED", evidence: "E3 Developmental Play Architecture Guidelines", approvedBy: "E3 Design Committee", approvedAt: "2026-08-01", titleEn: "Developmental Play Framework", titleAr: "إطار اللعب التنموي" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Joyful Exploration vs. Total Child Safety",
          titleAr: "بهجة الاستكشاف مقابل أقصى معايير الأمان",
          wowEn: "Magical sensory tunnels, vibrant climbing landscapes, and collaborative discovery stations that spark boundless curiosity.",
          wowAr: "أنفاق استكشاف حسية، مسارات تسلق مبهجة، ومحطات تفاعلية تعزز الفضول والعمل الجماعي لدى الأطفال.",
          howEn: "Non-toxic flame-retardant materials, continuous adult sightlines, sanitization-friendly surfaces, and secure staff oversight.",
          howAr: "مواد غير سامة مقاومة للاشتعال، زوايا رؤية مفتوحة لأولياء الأمور، أسطح سهلة التعقيم، وإشراف ميداني منضبط.",
          verifiedOutcomeEn: "Built to highest safety standards for absolute parental peace of mind.",
          verifiedOutcomeAr: "مصممة وفق أعلى معايير الأمان لمنح أولياء الأمور راحة بال واطمئنان كامل."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Design Custom Indoor Soft Play Sanctuary", labelAr: "تصميم مساحة لعب حركي ناعم مخصصة", descriptionEn: "Multi-level soft play structures tailored for toddlers to 8-year-olds.", descriptionAr: "متاهات وهياكل لعب متعددة المستويات مصممة للأطفال من عمر سنتين حتى ٨ سنوات." }
      ],
      capabilities: [
        { id: "c1", titleEn: "Sensory & Developmental Play Architecture", titleAr: "تصميم بيئات اللعب الحسي والنمائي", descriptionEn: "Bespoke zones balancing tactile sensory stimulation, gross motor challenges, and imaginative pretend-play.", descriptionAr: "مناطق مخصصة تجمع بين التحفيز الحسي، التحديات الحركية، ومحاكاة الأدوار الواقعية.", deliverablesEn: ["Play Ergonomics Study", "Custom Fabricated Play Elements", "Safety Sign-Off Dossier"], deliverablesAr: ["دراسة ملاءمة مقاسات الأطفال", "تصنيع عناصر اللعب المخصصة", "شهادات اعتماد الأمان"], suitableForEn: ["Malls", "Resorts", "Nurseries"], suitableForAr: ["المجمعات", "المنتجعات", "مراكز الطفولة"], colSpan: 2, tagEn: "Play Architecture", tagAr: "هندسة اللعب" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Design, Build & Certification", titleAr: "التصميم والتصنيع والاعتماد", subtitleEn: "Turnkey Play Zone Delivery", subtitleAr: "تسليم متكامل لمنطقة اللعب", descriptionEn: "End-to-end delivery from custom play design to on-site assembly, load certification, and staff SOP handover.", descriptionAr: "تنفيذ متكامل من التصميم الإبداعي حتى التركيب الموقعي، شهادات الاعتماد، وتدريب المشرفين.", bestForEn: "Hospitality venues, family clubs, and retail mall operators.", bestForAr: "الفنادق والمنتجعات، الأندية العائلية، وإدارات المجمعات التجارية.", typicalDurationEn: "2 - 5 Months", typicalDurationAr: "شهران إلى ٥ أشهر" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Play Safety & Fitout Pack", titleAr: "حزمة الأمان والتجهيزات", itemsEn: ["Material Toxicity & Flame-Retardant Certificates", "Impact Absorption Surfacing Test Records", "Operator Daily Safety Checklist (SOP)"], itemsAr: ["شهادات سلامة المواد ومقاومة الحريق", "سجلات اختبار امتصاص الأسطح للصدمات", "قائمة الفحص اليومي لسلامة الألعاب"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Age-Group & Space Audit", titleAr: "دراسة الفئة العمرية والمساحة", descriptionEn: "Evaluating footprint, capacity targets, and target age mix.", descriptionAr: "تقييم المساحة، الطاقة الاستيعابية، والتوزيع العمري المستهدف.", outputsEn: ["Zoning Plan", "Capacity Matrix"], outputsAr: ["مخطط التقسيم", "مصفوفة الاستيعاب"] },
        { id: "ls2", stageNumber: "02", titleEn: "Thematic Play Design", titleAr: "تصميم الثيمة وعناصر اللعب", descriptionEn: "3D visual rendering of custom structures and sensory zones.", descriptionAr: "تصاميم ثلاثية الأبعاد لهياكل اللعب والمحطات الحسية.", outputsEn: ["3D Play Renderings", "Material Spec Sheet"], outputsAr: ["تصاميم ثلاثية الأبعاد", "مواصفات المواد"] },
        { id: "ls3", stageNumber: "03", titleEn: "Fabrication & Assembly", titleAr: "التصنيع والتركيب الموقعي", descriptionEn: "High-density foam sculpting, safety netting, and padding installation.", descriptionAr: "تشكيل الإسفنج عالي الكثافة، تركيب الشباك، والحمايات المبطنة.", outputsEn: ["Installation Report", "Safety Certificate"], outputsAr: ["تقرير التركيب", "شهادة الأمان المعتمدة"] }
      ],
      serviceSpecificModule: {
        type: "kids-age-matrix",
        titleEn: "Age-Segmented Play Matrix & Standards",
        titleAr: "مصفوفة فئات اللعب والمعايير المعتمدة",
        subtitleEn: "Child development play typologies and safety considerations across age brackets.",
        subtitleAr: "أنماط اللعب التنموي واعتبارات السلامة المعتمدة حسب الفئات العمرية.",
        disclaimerEn: "Play elements require verified age appropriateness, certified impact-absorbing surfacing, and regular safety maintenance inspections.",
        disclaimerAr: "تتطلب تجهيزات اللعب مطابقة الفئة العمرية وأرضيات امتصاص الصدمات المعتمدة والفحص الدوري.",
        options: [
          {
            id: "age-toddler",
            labelEn: "0 - 3 Years (Toddlers)",
            labelAr: "الأطفال الصغار (٠ - ٣ سنوات)",
            tagEn: "Sensory & Motor Exploration",
            tagAr: "الاستكشاف الحسي والحركي الأولي",
            descriptionEn: "Low-height sensory zones emphasizing gross motor discovery, tactile surfaces, and dedicated parent accompaniment zones.",
            descriptionAr: "مساحات استكشاف منخفضة الارتفاع تركز على المهارات الحركية والتفاعل الحسي مع مرافقة أولياء الأمور.",
            outputsEn: ["High-density soft foam padding", "Tactile sensory wall exploration panels", "Dedicated parent-child accompaniment areas", "Secure perimeter containment gates"],
            outputsAr: ["حمايات إسفنجية ناعمة عالية الكثافة", "ألواح جدارية للاستكشاف الحسي", "مساحات مخصصة لمرافقة أولياء الأمور", "بوابات أمان محيطية مغلقة"]
          },
          {
            id: "age-explorer",
            labelEn: "4 - 7 Years (Explorers)",
            labelAr: "المستكشفون الصغار (٤ - ٧ سنوات)",
            tagEn: "Roleplay & Agility",
            tagAr: "محاكاة الأدوار والرشاقة الحركية",
            descriptionEn: "Multi-level soft play labyrinths, miniature civic roleplay stations, and interactive ball systems designed for collaborative play.",
            descriptionAr: "متاهات حركية متعددة المستويات، مدن مهن ومحاكاة أدوار مصغرة، وألعاب تفاعلية للعب الجماعي.",
            outputsEn: ["Miniature civic roleplay stations", "Multi-tier soft climbing labyrinths", "Interactive ball systems and gravity slides", "Non-toxic flame-retardant finishes"],
            outputsAr: ["محطات محاكاة المهن والوظائف", "متاهات تسلق ناعمة متعددة الطوابق", "أنظمة كرات تفاعلية ومزالق آمنة", "تشطيبات غير سامة ومقاومة للاشتعال"]
          },
          {
            id: "age-adventurer",
            labelEn: "8 - 12 Years (Adventurers)",
            labelAr: "المغامرون الناشئون (٨ - ١٢ سنة)",
            tagEn: "Active Agility & Skill",
            tagAr: "تحديات المهارة والحركة النشطة",
            descriptionEn: "High-energy obstacle courses, interactive digital climbing challenges, and reaction testing zones.",
            descriptionAr: "مسارات حواجز حركية، جدران تسلق رقمية تفاعلية، وتحديات سرعة الاستجابة والمهارة البدنية.",
            outputsEn: ["Modular agility challenge tracks", "Interactive digital sports walls", "Reflex challenge rooms", "Reinforced safety enclosure systems"],
            outputsAr: ["مسارات حواجز وتحديات حركية", "جدران رياضية رقمية تفاعلية", "غرف اختبار سرعة رد الفعل", "شباك وأنظمة حماية مقواة"]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Sanitization & Hygiene Protocols", titleAr: "بروتوكولات التعقيم والنظافة المعتمدة", descriptionEn: "Seamless vinyl surfaces engineered for rapid non-toxic disinfection and hospital-grade air purification.", descriptionAr: "أسطح فينيل ملساء بدون فواصل لسهولة التعقيم اليومي وأنظمة تنقية هواء متطورة.", status: "APPROVED", evidence: "E3 Play Sanitization & Hygiene Guidelines", approvedBy: "E3 HSE Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["fec-development", "attraction-operations", "fabrication-branding"]
    }
  },
  "experiential-activations": {
    categoryEn: "Brand & Spatial Marketing",
    categoryAr: "التجارب التفاعلية والتسويق المكاني",
    titleEn: "Experiential Activations",
    titleAr: "التجارب التفاعلية والتسويق المكاني",
    taglineEn: "Bespoke brand pavilions, pop-up sensory environments, and interactive consumer experiences that command attention.",
    taglineAr: "أجنحة تفاعلية مخصصة، بيئات حسية مؤقتة، وتجارب استثنائية تصنع ارتباطاً وثيقاً بين العلامة التجارية وجمهورها.",
    cms: {
      heroOutcomeEn: "Brand Encounters That Spark Instant Social Amplification",
      heroOutcomeAr: "تجارب تفاعلية تصنع صدى واسعاً وتأثيراً رقمياً فورياً",
      supportingStatementEn: "We translate corporate campaigns, luxury launches, and cultural moments into highly engaging, physical-meets-digital environments.",
      supportingStatementAr: "نحوّل الحملات التسويقية والتدشينات الفاخرة إلى تجارب مكانية تجمع بين الإبداع الواقعي والتقنيات الرقمية التفاعلية.",
      verifiedProofPoints: [
        { id: "p1", value: "Phygital", labelEn: "Seamless Physical + Digital Tech", labelAr: "دمج التقنية الرقمية بالمساحة الواقعية", status: "APPROVED", evidence: "E3 Interactive Spatial Engineering Manual", approvedBy: "E3 Digital Atelier", approvedAt: "2026-08-01", titleEn: "Phygital Integration Protocol", titleAr: "بروتوكول الدمج الرقمي والمكاني" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Shareable Wonder vs. Reliable Tech Stacks",
          titleAr: "الإبهار القابل للمشاركة مقابل موثوقية الأنظمة",
          wowEn: "High-contrast architectural photopoints, kinetic LED sculptures, and interactive AI moments.",
          wowAr: "نقاط تصوير معمارية مبهرة، شاشات LED حركية، ومحطات ذكاء اصطناعي تفاعلية.",
          howEn: "Industrial micro-controllers, low-latency sensor triggers, high-traffic finishes, and continuous telemetry monitoring.",
          howAr: "وحدات تحكم صناعية دقيقة، حساسات استجابة فورية، مواد تصنيع عالية التحمل، ومراقبة تقنية مستمرة.",
          verifiedOutcomeEn: "Engineered for 100% activation uptime and viral social sharing.",
          verifiedOutcomeAr: "مصممة لتحقيق استمرارية تشغيلية كاملة وأقصى انتشار رقمي."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Launch a High-Profile Product or Brand Campaign", labelAr: "إطلاق منتج فاخر أو حملة علامة تجارية كبرى", descriptionEn: "Bespoke pop-up architecture with integrated sensory storytelling.", descriptionAr: "جناح معماري مؤقت مع سرد قصصي وتقنيات تفاعلية متكاملة." }
      ],
      capabilities: [
        { id: "c1", titleEn: "Interactive Brand Pavilions & Pop-Up Architecture", titleAr: "أجنحة العلامات التجارية والمعمار المؤقت", descriptionEn: "Rapid-deploy premium structures, precision joinery, transparent OLED displays, and bespoke architectural skins.", descriptionAr: "أجنحة فاخرة سريعة التركيب، أعمال خشبية دقيقة، شاشات شفافة، وواجهات معمارية مميزة.", deliverablesEn: ["3D Spatial Pavilion Render", "Fabrication Drawing Pack", "Brand Integration Guide"], deliverablesAr: ["التصميم ثلاثي الأبعاد للجناح", "مخططات التصنيع التنفيذية", "دليل دمج الهوية البصرية"], suitableForEn: ["Malls", "Expos", "Outdoor Plazas"], suitableForAr: ["المجمعات", "المعارض", "الساحات المفتوحة"], colSpan: 2, tagEn: "Spatial Activations", tagAr: "التجارب المكانية" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Turnkey Campaign Activation", titleAr: "تنفيذ الحملة التفاعلية الشاملة", subtitleEn: "Design, Build, Staff & Operate", subtitleAr: "تصميم، تصنيع، توظيف، وتشغيل", descriptionEn: "End-to-end ownership: creative concept, municipal permits, build, trained brand ambassadors, and daily tech support.", descriptionAr: "مسؤولية متكاملة: الفكرة الإبداعية، التصاريح الرسمية، التصنيع، كوادر الضيافة المدربة، والدعم التقني.", bestForEn: "Global luxury brands, telecoms, and automotive manufacturers.", bestForAr: "العلامات التجارية الفاخرة، شركات الاتصالات، وقطاع السيارات.", typicalDurationEn: "1 - 8 Weeks", typicalDurationAr: "أسبوع إلى ٨ أسابيع" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Activation Strategy & Blueprint", titleAr: "استراتيجية ومخططات التفعيل", itemsEn: ["3D Photorealistic Visuals & Technical Cut-Sheets", "Municipal & Mall Management Approval Set", "Post-Campaign Engagement Analytics Report"], itemsAr: ["تصاميم ثلاثية الأبعاد ومخططات القياسات التنفيذية", "حزمة موافقات البلدية وإدارات المجمعات", "تقرير إحصائيات التفاعل والانتشار الرقمي"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Campaign Brief & Spatial Idea", titleAr: "موجز الحملة والمفهوم المكاني", descriptionEn: "Demystifying brand KPIs and conceptualizing high-impact touchpoints.", descriptionAr: "تحديد أهداف الحملة وابتكار نقاط التفاعل الأكثر تأثيراً.", outputsEn: ["Activation Concept Deck", "Moodboard"], outputsAr: ["عرض المفهوم الإبداعي", "لوحة المزاج العام"] },
        { id: "ls2", stageNumber: "02", titleEn: "3D Engineering & Prototyping", titleAr: "الهندسة ثلاثية الأبعاد والنماذج الأولية", descriptionEn: "Full CAD drawings, software UX/UI, and sensor integration testing.", descriptionAr: "مخططات CAD، واجهات الاستخدام الرقمية، واختبار الحساسات.", outputsEn: ["Interactive Prototype Demo", "BOM & Fitout Spec"], outputsAr: ["نموذج تفاعلي أولي", "قائمة المواد والمواصفات"] },
        { id: "ls3", stageNumber: "03", titleEn: "Rapid Build & Live Operation", titleAr: "التصنيع السريع والتشغيل المباشر", descriptionEn: "Overnight installation, brand ambassador briefing, and active live running.", descriptionAr: "التركيب السريع، تدريب سفراء العلامة التجارية، والتشغيل الحي.", outputsEn: ["Handover Sign-off", "Daily Footfall Log"], outputsAr: ["محضر التسليم والبدء", "سجل الزوار اليومي"] }
      ],
      serviceSpecificModule: {
        type: "activation-mapper",
        titleEn: "Experiential Campaign Architecture",
        titleAr: "بنية التفعيلات والحملات التفاعلية",
        subtitleEn: "Strategic mapping of campaign objectives to interactive technologies and visitor journeys.",
        subtitleAr: "المواءمة الاستراتيجية بين أهداف الحملة والحلول التفاعلية ومسار الزائر.",
        disclaimerEn: "Hardware combinations and guest throughput depend on spatial footprint, venue power supply, and network connectivity.",
        disclaimerAr: "تعتمد التجهيزات التقنية وتدفق الزوار على المساحة المتاحة ومصادر الطاقة والشبكات في الموقع.",
        options: [
          {
            id: "act-reach",
            labelEn: "Mass Brand Reach & Viral Buzz",
            labelAr: "الانتشار الجماهيري والصدى الرقمي",
            tagEn: "High-Volume Footfall",
            tagAr: "تدفق جماهيري كثيف",
            descriptionEn: "Dynamic visual landmarks with kinetic displays, photogenic architectural framing, and instant digital sharing triggers.",
            descriptionAr: "معالم بصرية تفاعلية مع شاشات حركية، نقاط تصوير هندسية مميزة، وأدوات مشاركة رقمية فورية.",
            outputsEn: ["Kinetic LED display canopy", "Interactive automated photo touchpoints", "Digital asset delivery", "Real-time engagement counter"],
            outputsAr: ["مظلة شاشات LED حركية", "محطات تصوير تفاعلية ذاتية", "توصيل المحتوى الرقمي فورياً", "عداد تفاعل فوري مباشر"]
          },
          {
            id: "act-immersion",
            labelEn: "VIP Emotional Immersion",
            labelAr: "الانغماس الحسي لكبار الشخصيات",
            tagEn: "High-Touch Narrative",
            tagAr: "سرد قصصي عالي التأثير",
            descriptionEn: "Multi-sensory projection environments, spatial audio fields, and bespoke interactive installations designed for deep engagement.",
            descriptionAr: "بيئات إسقاط ضوئي متعددة الحواس، حقول صوتية مكانية، وتجهيزات تفاعلية مخصصة للارتباط العاطفي بالمنتج.",
            outputsEn: ["Sensory projection mapping surface", "Bespoke ambient soundscape", "Tactile physical product reveal station", "Private VIP escort briefing"],
            outputsAr: ["أسطح إسقاط ضوئي بانورامية", "مؤثرات صوتية مكانية مخصصة", "منصة كشف تفاعلية للمنتج", "بروتوكول استقبال كبار الشخصيات"]
          },
          {
            id: "act-retail",
            labelEn: "Retail Footfall & Conversion",
            labelAr: "تحفيز زيارة المتاجر والمبيعات",
            tagEn: "Commercial Gamification",
            tagAr: "ألعاب تفاعلية تجارية",
            descriptionEn: "Interactive digital passport stations, QR reward redemption, and gamified product discovery hubs.",
            descriptionAr: "محطات جواز سفر رقمي، استبدال الجوائز الترويجية، ومراكز تفاعلية لاستكشاف المنتجات باللعب.",
            outputsEn: ["Gamified digital exploration stations", "Instant reward redemption POS", "Footfall routing signage", "Retailer voucher validation"],
            outputsAr: ["محطات استكشاف رقمية مدعمة بالألعاب", "نقاط تسليم الجوائز الفورية", "لوحات توجيه حركة المشاة", "التحقق من كوبونات الشركاء"]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Rapid Overnight Deployment Protocol", titleAr: "بروتوكول التركيب الليلي السريع", descriptionEn: "Pre-fabricated modular components engineered for silent, mess-free overnight installation in operating retail malls.", descriptionAr: "عناصر جاهزة مسبقاً مصممة للتركيب الليلي الصامت والنظيف داخل المجمعات التجارية دون تعطيل الحركة.", status: "APPROVED", evidence: "E3 Rapid Deployment Protocol 2026", approvedBy: "E3 Logistics Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["fabrication-branding", "mega-events", "shows-performances", "av-stage-rentals"]
    }
  },
  "shows-performances": {
    categoryEn: "Live Entertainment & Talent",
    categoryAr: "العروض الحية والمحتوى المسرحي",
    titleEn: "Shows & Performances",
    titleAr: "العروض الحية والمحتوى الترفيهي المسرحي",
    taglineEn: "Curated international theatrical productions, aerial acts, cultural ensembles, and bespoke choreographed spectacles.",
    taglineAr: "عروض مسرحية عالمية، فقرات استعراضية وهوائية، فرق فلكلورية، واستعراضات مصممة خصيصاً للمناسبات الكبرى.",
    cms: {
      heroOutcomeEn: "Spectacular Choreography & World-Class Talent on Demand",
      heroOutcomeAr: "إبهار استعراضي وكوادر فنية عالمية بمعايير استثنائية",
      supportingStatementEn: "E3 books, produces, and stage-manages high-caliber international entertainment tailored to regional cultural sensitivities.",
      supportingStatementAr: "تتولى إي ثري استقطاب وإنتاج وإدارة أروع العروض الترفيهية العالمية بما ينسجم تماماً مع الهوية والقيم الثقافية في قطر.",
      verifiedProofPoints: [
        { id: "p1", value: "Curated", labelEn: "International Talent Network", labelAr: "شبكة عروض وفنانين عالمية معتمدة", status: "APPROVED", evidence: "E3 Theatrical Talent Accreditation Roster", approvedBy: "E3 Creative Directorate", approvedAt: "2026-08-01", titleEn: "Accredited Talent Network", titleAr: "شبكة المواهب المعتمدة" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Stage Artistry vs. Backstage Rigor",
          titleAr: "الإبداع المسرحي مقابل الانضباط وراء الكواليس",
          wowEn: "Flawless aerial acrobatics, synchronized ensemble dance, and emotive musical orchestration.",
          wowAr: "استعراضات بهلوانية هوائية، لوحات راقصة متناغمة، ومؤثرات صوتية وموسيقية آسرة.",
          howEn: "Certified dynamic rigging safety, dedicated talent liaison, costume management, and backstage protocol.",
          howAr: "أنظمة تعليق وهوائيات معتمدة هندسياً، إدارة محترفة لفرق العمل، وإشراف دقيق على الكواليس والأزياء.",
          verifiedOutcomeEn: "Delivered with 100% adherence to cultural standards and performer safety.",
          verifiedOutcomeAr: "تنفذ بالتزام كامل بالمعايير الثقافية المعتمدة وأعلى درجات السلامة."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Book Headline Theatrical / Aerial Act", labelAr: "استقطاب عروض مسرحية أو بهلوانية عالمية", descriptionEn: "Turnkey talent booking, visa management, stage management, and dynamic rigging.", descriptionAr: "حجز العروض، إصدار التأشيرات، إدارة المسرح، وهندسة التعليق الهوائي." }
      ],
      capabilities: [
        { id: "c1", titleEn: "International Show Curation & Theatrical Production", titleAr: "انتقاء وإنتاج العروض المسرحية العالمية", descriptionEn: "Sourcing world-class performers, custom show scripting, costume design, and bespoke musical scoring.", descriptionAr: "استقطاب أفضل الفنانين والفرق، كتابة سيناريو العرض، تصميم الأزياء، والتأليف الموسيقي الخاص.", deliverablesEn: ["Show Script & Storyboard", "Talent Rider Dossier", "Rehearsal Schedule"], deliverablesAr: ["سيناريو ولوحة قصة العرض", "ملف المتطلبات الفنية للفنانين", "جدول البروفات"], suitableForEn: ["Theatres", "Festivals", "Corporate Galas"], suitableForAr: ["المسارح", "المهرجانات", "الاحتفالات الرسمية"], colSpan: 2, tagEn: "Theatrical Production", tagAr: "الإنتاج المسرحي" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Turnkey Show Production", titleAr: "الإنتاج الشامل للعرض المسرحي", subtitleEn: "Full Cast, Staging & Management", subtitleAr: "طاقم كامل، تجهيز مسرحي، وإدارة كواليس", descriptionEn: "End-to-end: talent curation, travel/visas, rehearsals, costume tailoring, lighting/sound cues, and live calling.", descriptionAr: "إدارة شاملة: انتقاء المواهب، السفر والتأشيرات، البروفات، الأزياء، وهندسة الإضاءة والصوت وتوجيه العرض.", bestForEn: "Shopping festivals, national holiday organizers, and gala events.", bestForAr: "مهرجانات التسوق، احتفالات الأعياد الوطنية، والمناسبات الكبرى.", typicalDurationEn: "1 - 4 Weeks", typicalDurationAr: "أسبوع إلى ٤ أسابيع" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Talent & Stage Documentation", titleAr: "وثائق المسرح وإدارة المواهب", itemsEn: ["Talent Biographies & Approved Performance Video Clips", "Stage Technical Rider & Dynamic Load Sign-Off", "Cultural Sensitivity & Wardrobe Compliance Dossier"], itemsAr: ["السير الذاتية ومقاطع الفيديو المعتمدة للعروض", "المتطلبات التقنية للمسرح واعتمادات أحمال التعليق", "ملف مواءمة الأزياء والمحتوى مع المعايير الثقافية"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Curation & Concept Alignment", titleAr: "الانتقاء ومواءمة فكرة العرض", descriptionEn: "Selecting matching performance concepts for target audience.", descriptionAr: "اختيار أنسب العروض التي تلائم الفعالية وطبيعة الجمهور.", outputsEn: ["Talent Catalogue", "Cost Estimate"], outputsAr: ["كتالوج العروض المقترحة", "التقدير المالي"] },
        { id: "ls2", stageNumber: "02", titleEn: "Logistics, Visas & Wardrobe", titleAr: "اللوجستيات والتأشيرات والأزياء", descriptionEn: "Securing approvals, travel, accommodation, and custom costumes.", descriptionAr: "إنهاء الموافقات الرسمية، تذاكر السفر والإقامة، وتجهيز الأزياء.", outputsEn: ["Travel Schedule", "Wardrobe Compliance Pack"], outputsAr: ["جدول السفر والإقامة", "حزمة اعتماد الأزياء"] },
        { id: "ls3", stageNumber: "03", titleEn: "Stage Rehearsals & Live Run", titleAr: "البروفات المسرحية والعرض المباشر", descriptionEn: "Dry-runs, sound/lighting integration, and scheduled daily shows.", descriptionAr: "البروفات الموقعية، ضبط الصوت والإضاءة، وتنفيذ العروض اليومية.", outputsEn: ["Live Show Management", "Audience Count Log"], outputsAr: ["إدارة العرض الحي", "سجل إحصاء الحضور"] }
      ],
      serviceSpecificModule: {
        type: "performance-catalogue",
        titleEn: "Turnkey Performance Production Portfolio",
        titleAr: "ملف العروض والإنتاج المسرحي المتكامل",
        subtitleEn: "Curated performance disciplines with indicative technical rider and stage requirements.",
        subtitleAr: "تخصصات استعراضية مدروسة مع المتطلبات الفنية ومواصفات المسرح الاسترشادية.",
        disclaimerEn: "Technical riders, rigging points, and cast numbers are tailored during the creative rehearsal and venue coordination phase.",
        disclaimerAr: "يتم اعتماد المخططات الفنية وحسابات التعليق وأعداد الفرقة خلال مرحلة البروفات الإبداعية والتنسيق الميداني.",
        options: [
          {
            id: "perf-aerial",
            labelEn: "Aerial & Acrobatic Ensembles",
            labelAr: "العروض البهلوانية والاستعراضات الهوائية",
            tagEn: "12 - 24 Performers",
            tagAr: "١٢ - ٢٤ فناناً",
            descriptionEn: "High-altitude silk acrobatics, kinetic balance acts, and dynamic aerial choreography.",
            descriptionAr: "استعراضات بهلوانية هوائية، عروض التوازن الحركي، ولوحات استعراضية معلقة.",
            specs: [
              { labelEn: "Rigging Height", labelAr: "ارتفاع التعليق المطلوب", valueEn: "Min 8.5m Clear Height", valueAr: "ارتفاع صافٍ ٨,٥م كحد أدنى" },
              { labelEn: "Load Rating", labelAr: "معامل أحمال الأمان", valueEn: "10:1 Safety Factor", valueAr: "معامل أمان إنشائي ١٠:١" },
              { labelEn: "Audio Rider", labelAr: "المتطلبات الصوتية", valueEn: "Wireless IEM Channels", valueAr: "سماعات أذن لاسلكية للمؤدين" }
            ],
            outputsEn: ["Rigging structural certificate", "Rehearsal timecode sheet", "Costume flame-retardant clearance"],
            outputsAr: ["شهادة اعتماد نقاط التعليق", "جدول توقيتات البروفات", "شهادة اعتماد مقاومة الأزياء للاشتعال"]
          },
          {
            id: "perf-illusion",
            labelEn: "Illusion & Kinetic Visuals",
            labelAr: "عروض الخدع البصرية وفنون الوهم",
            tagEn: "4 - 8 Performers",
            tagAr: "٤ - ٨ فنانين",
            descriptionEn: "Large-scale theatrical stage illusions, synchronized light art, and interactive visual spectacles.",
            descriptionAr: "خدع مسرحية كبرى، لوحات ضوئية متناغمة، وعروض بصرية تأسر الجمهور.",
            specs: [
              { labelEn: "Rigging Height", labelAr: "ارتفاع التعليق المطلوب", valueEn: "Min 5.0m Clear Height", valueAr: "ارتفاع صافٍ ٥,٠م كحد أدنى" },
              { labelEn: "Stage Wings", labelAr: "كواليس المسرح", valueEn: "Enclosed Masking Wings", valueAr: "كواليس جانبية معتمة" },
              { labelEn: "Audio Rider", labelAr: "المتطلبات الصوتية", valueEn: "Timecode Sync Soundtrack", valueAr: "تزامن الصوت مع التايم كود" }
            ],
            outputsEn: ["Stage props load plan", "Lighting blackout cue list", "Backstage security protocol"],
            outputsAr: ["مخطط أوزان ديكورات المسرح", "قائمة إشارات الإعتام الضوئي", "بروتوكول أمن الكواليس"]
          },
          {
            id: "perf-cultural",
            labelEn: "Orchestral & Cultural Troupes",
            labelAr: "الفرق الفلكلورية والأوركسترا التراثية",
            tagEn: "18 - 36 Musicians",
            tagAr: "١٨ - ٣٦ عازفاً",
            descriptionEn: "Authentic heritage instrumentalists, regional folkloric ensembles, and symphonic fusion performances.",
            descriptionAr: "فرق الفنون الشعبية والتراثية الأصيلة، عازفون تقليديون، ومقطوعات أوركسترالية مدمجة.",
            specs: [
              { labelEn: "Rigging Height", labelAr: "ارتفاع التعليق المطلوب", valueEn: "Min 4.0m Clear Height", valueAr: "ارتفاع صافٍ ٤,٠م كحد أدنى" },
              { labelEn: "Audio Patch", labelAr: "مصفوفة مدخلات الصوت", valueEn: "Multi-Input Live Patch", valueAr: "توصيلات صوتية متعددة القنوات" },
              { labelEn: "Acoustic Tuning", labelAr: "المعايرة الصوتية", valueEn: "Natural Reverb Control", valueAr: "معالجة صدى الصوت الطبيعي" }
            ],
            outputsEn: ["Instrument input patch list", "Stage riser layout CAD", "Cultural heritage compliance review"],
            outputsAr: ["قائمة مدخلات الآلات الموسيقية", "مخطط منصات المسرح CAD", "مراجعة مواءمة التراث الثقافي"]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Aerial Rigging & Structural Sign-Off", titleAr: "اعتماد هياكل التعليق الهوائي والسلامة", descriptionEn: "All aerial rigging certified by structural engineers with safety factors of 10:1 or higher and secondary tethering.", descriptionAr: "جميع نقاط التعليق الهوائي معتمدة هندسياً بمعامل أمان ١٠:١ مع حبال أمان احتياطية مزدوجة.", status: "APPROVED", evidence: "E3 Aerial Rigging & Performer Safety Manual", approvedBy: "E3 HSE Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["mega-events", "av-stage-rentals", "experiential-activations", "attraction-operations"]
    }
  },
  "av-stage-rentals": {
    categoryEn: "Technical Production & Equipment",
    categoryAr: "الإنتاج التقني وتأجير معدات المسارح",
    titleEn: "AV, Stage Equipment & Rentals",
    titleAr: "الأنظمة الصوتية والمرئية وتجهيزات المسارح",
    taglineEn: "High-spec sound reinforcement, stage lighting, indoor/outdoor LED displays, rigging, and broadcast integration.",
    taglineAr: "أنظمة صوتية متطورة، إضاءة مسرحية احترافية، شاشات LED داخلية وخارجية، وهياكل تعليق إنشائية معتمدة.",
    cms: {
      heroOutcomeEn: "High-Impact Acoustic & Visual Staging With Zero Compromise",
      heroOutcomeAr: "تجهيزات صوتية وبصرية وهندسية فائقة الدقة والوضوح",
      supportingStatementEn: "From intimate corporate boardrooms to multi-acre festival grounds, E3 deploys calibrated technical infrastructure managed by certified engineers.",
      supportingStatementAr: "من الفعاليات المؤسسية الراقية إلى المهرجانات الكبرى في الهواء الطلق، توفر إي ثري أحدث التجهيزات التقنية بإشراف مهندسين معتمدين.",
      verifiedProofPoints: [
        { id: "p1", value: "Calibrated", labelEn: "Acoustically Tuned Systems", labelAr: "أنظمة صوتية معايرة وموزعة بدقة", status: "APPROVED", evidence: "E3 Audio Engineering QA Standards", approvedBy: "E3 Technical Committee", approvedAt: "2026-08-01", titleEn: "Acoustic Tuning Protocol", titleAr: "بروتوكول المعايرة الصوتية" },
        { id: "p2", value: "Certified", labelEn: "Load-Tested Rigging & Trusses", labelAr: "هياكل تعليق مفحوصة ومعتمدة الأحمال", status: "APPROVED", evidence: "E3 Rigging & Truss Load Certification Manual", approvedBy: "E3 Structural Committee", approvedAt: "2026-08-01", titleEn: "Rigging Safety Standard", titleAr: "معايير سلامة التعليق" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Immersive Sensory Impact vs. Signal Redundancy",
          titleAr: "النقاء الصوتي والبصري مقابل ازدواجية الإشارة",
          wowEn: "Ultra-crisp audio dispersion, punchy architectural lighting beams, and ultra-high-resolution LED canvases.",
          wowAr: "توزيع صوتي نقي وشامل، إضاءة معمارية وحركية مبهرة، وشاشات LED فائقة الدقة والسطوع.",
          howEn: "Optical fiber signal backbones, primary/secondary show-control switchers, and isolated clean-power distribution.",
          howAr: "شبكات توزيع ألياف ضوئية فائقة السرعة، أنظمة تحكم احتياطية جاهزة للتحويل الفوري، ومولدات طاقة معزولة.",
          verifiedOutcomeEn: "Engineered for rock-solid signal reliability across all show elements.",
          verifiedOutcomeAr: "مصممة لضمان موثوقية وثبات الإشارة الصوتية والمرئية بنسبة 100%."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Supply Turnkey Stage Lighting, Audio & LED Screen Pack", labelAr: "تجهيز مسرح متكامل بأنظمة الصوت والإضاءة وشاشات LED", descriptionEn: "Complete technical production design, delivery, rigging, calibration, and live show operation.", descriptionAr: "تصميم المخطط التقني، التوريد، التركيب، المعايرة، والتشغيل الفني المباشر." }
      ],
      capabilities: [
        { id: "c1", titleEn: "Concert Audio Reinforcement & Acoustic Modeling", titleAr: "الأنظمة الصوتية للحفلات والمحاكاة الأكوستيكية", descriptionEn: "Line-array systems, multi-point digital delay compensation, active feedback suppression, and RF frequency coordination.", descriptionAr: "أنظمة لاين أري، معالجة تأخير الصوت الرقمي، عزل الترددات اللاسلكية وتفادي التداخل.", deliverablesEn: ["Acoustic Simulation Map", "Sound Patching Schedule", "FOH Audio Mix"], deliverablesAr: ["خريطة المحاكاة الصوتية", "مخطط توزيع السماعات والتوصيل", "هندسة الصوت المباشر"], suitableForEn: ["Arenas", "Concert Venues", "Open-Air Parks"], suitableForAr: ["الساحات المغلقة", "مسارح الحفلات", "الحدائق والمساحات المفتوحة"], colSpan: 2, tagEn: "Audio Systems", tagAr: "أنظمة الصوت" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Equipment Rental with Engineering Crew", titleAr: "تأجير المعدات مع الطاقم الهندسي المتخصص", subtitleEn: "Full Dry & Wet Hire Options", subtitleAr: "خيارات تأجير مرنة مع أو بدون طاقم التشغيل", descriptionEn: "Delivery, rigging, line-checking, live show operation by certified engineers, and post-event de-rig.", descriptionAr: "التوريد، التركيب والتعليق، الفحص الهندسي، التشغيل الحي بواسطة مهندسين معتمدين، والتفكيك الآمن.", bestForEn: "Event production agencies, corporate clients, and public institutions.", bestForAr: "شركات تنظيم الفعاليات، الهيئات الحكومية، والشركات الكبرى.", typicalDurationEn: "1 - 14 Days", typicalDurationAr: "يوم إلى ١٤ يوماً" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Technical Production Package", titleAr: "حزمة الإنتاج التقني للمسرح", itemsEn: ["AutoCAD Stage Layout & Rigging Plot", "Lighting Console Showfile & Timecode Setup", "Electrical Generator & Clean Power Distribution Plan"], itemsAr: ["مخططات المسرح ونقاط التعليق AutoCAD", "ملف برمجة الإضاءة والتايم كود", "خطة توزيع الطاقة الكهربائية والمولدات المعزولة"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Acoustic & Power Survey", titleAr: "المعاينة الصوتية ومصادر الطاقة", descriptionEn: "Site inspection, decibel targets, and electrical load calculation.", descriptionAr: "معاينة الموقع، قياس مستويات الصوت المطلوبة، وحساب الأحمال الكهربائية.", outputsEn: ["Acoustic Model", "Power Load Schedule"], outputsAr: ["نموذج التوزيع الصوتي", "جدول الأحمال الكهربائية"] },
        { id: "ls2", stageNumber: "02", titleEn: "Rigging & Truss Assembly", titleAr: "التعليق وتركيب هياكل التراس", descriptionEn: "Structural hoist installation and load-cell weight verification.", descriptionAr: "تثبيت محركات الرفع وفحص وتدقيق توزيع الأوزان.", outputsEn: ["Rigging Certificate", "Truss Plot"], outputsAr: ["شهادة اعتماد التعليق", "مخطط الهياكل الإنشائية"] },
        { id: "ls3", stageNumber: "03", titleEn: "Calibration & Live Show Run", titleAr: "المعايرة والتشغيل الفني الحي", descriptionEn: "Pink noise calibration, lighting focus, and active show-mixing.", descriptionAr: "معايرة الصوت، ضبط مسارات الإضاءة، وهندسة الصوت والإضاءة أثناء العرض.", outputsEn: ["Live FOH Operations", "Event Wrap Report"], outputsAr: ["إدارة التحكم الفني الحي", "تقرير تفكيك الموقع"] }
      ],
      serviceSpecificModule: {
        type: "av-venue-selector",
        titleEn: "Venue Audio-Visual & Staging Integration",
        titleAr: "تكامل الأنظمة الصوتية والمرئية والمسارح",
        subtitleEn: "Professional equipment frameworks across venue types and acoustic profiles.",
        subtitleAr: "أطر التجهيزات الاحترافية حسب نوع القاعة ومتطلبات التغطية الصوتية.",
        disclaimerEn: "Acoustic line arrays, truss rigging, and power distribution require acoustic modeling and structural engineering signoff.",
        disclaimerAr: "تتطلب أنظمة الصوت والتعليق الإنشائي نمذجة صوتية هندسية واعتماداً إنشائياً قبل التركيب.",
        options: [
          {
            id: "venue-ballroom",
            labelEn: "Hotel Ballroom & Private Hall",
            labelAr: "قاعات الفنادق والاحتفالات المغلقة",
            tagEn: "500 m² (200 - 800 Guests)",
            tagAr: "٥٠٠ م² (٢٠٠ - ٨٠٠ ضيف)",
            descriptionEn: "Controlled indoor environment requiring high speech intelligibility, warm architectural lighting, and discrete cable management.",
            descriptionAr: "بيئة مغلقة تتطلب نقاءً فائقاً لنقل الكلمات والخطابات، إضاءة معمارية دافئة، وتمديدات كابلات مخفية.",
            specs: [
              { labelEn: "Audio Grid", labelAr: "الشبكة الصوتية", valueEn: "Stereo Column Arrays", valueAr: "سماعات عمودية موزعة" },
              { labelEn: "Lighting Rig", labelAr: "شبكة الإضاءة", valueEn: "Warm White Key + Wash", valueAr: "إضاءة رئيسية دافئة وغامرة" },
              { labelEn: "Visual Display", labelAr: "شاشة العرض", valueEn: "Fine-Pitch Indoor LED", valueAr: "شاشة LED داخلية عالية الدقة" },
              { labelEn: "Power Delivery", labelAr: "التغذية الكهربائية", valueEn: "3-Phase Distribution", valueAr: "توزيع ثلاثي الأطوار" }
            ],
            outputsEn: ["Speech clarity simulation", "Lighting scene programming", "Discreet rigging plan"],
            outputsAr: ["محاكاة وضوح الخطاب", "برمجة مشاهد الإضاءة", "مخطط تعليق مخفي"]
          },
          {
            id: "venue-convention",
            labelEn: "Convention Center & Exhibition Hall",
            labelAr: "مراكز المؤتمرات والمعارض الكبرى",
            tagEn: "2,000 m² (800 - 3,000 Guests)",
            tagAr: "٢,٠٠٠ م² (٨٠٠ - ٣,٠٠٠ ضيف)",
            descriptionEn: "High-ceiling expansive space requiring distributed delay speakers, motorized rigging trusses, and crisp presentation surfaces.",
            descriptionAr: "مساحات واسعة ذات أسقف مرتفعة تتطلب سماعات تأخير موزعة، جمالونات تعليق بمحركات آلية، وشاشات عروض فائقة الوضوح.",
            specs: [
              { labelEn: "Audio Grid", labelAr: "الشبكة الصوتية", valueEn: "Line Array + Center Fills", valueAr: "مصفوفة لاين أري مع سماعات وسطية" },
              { labelEn: "Lighting Rig", labelAr: "شبكة الإضاءة", valueEn: "Automated Spot & Wash", valueAr: "كشافات موجهة وغامرة متحركة" },
              { labelEn: "Visual Display", labelAr: "شاشة العرض", valueEn: "Ultra-Wide Video Wall", valueAr: "جدار فيديو بانورامي" },
              { labelEn: "Power Delivery", labelAr: "التغذية الكهربائية", valueEn: "Heavy 3-Phase Camlock", valueAr: "تغذية كهربائية صناعية ثقيلة" }
            ],
            outputsEn: ["Multi-zone audio delay map", "Truss load-bearing dossier", "Fiber-optic signal matrix"],
            outputsAr: ["خريطة تأخير الصوت متعددة النطاقات", "ملف أحمال التعليق الإنشائي", "مصفوفة توزيع الألياف الضوئية"]
          },
          {
            id: "venue-stadium",
            labelEn: "Outdoor Festival Grounds & Stadium",
            labelAr: "المهرجانات المفتوحة والاستادات",
            tagEn: "15,000+ m² (5,000 - 50,000+ Guests)",
            tagAr: "١٥,٠٠٠+ م² (٥,٠٠٠ - ٥٠,٠٠٠+ ضيف)",
            descriptionEn: "Expansive outdoor arena requiring weatherized IP65 fixtures, long-throw line arrays with delay towers, and high-nit outdoor screens.",
            descriptionAr: "ساحة مفتوحة واسعة تتطلب أجهزة مقاومة للعوامل الجوية IP65، أنظمة صوت بعيدة المدى مع أبراج تأخير، وشاشات خارجية ساطعة.",
            specs: [
              { labelEn: "Audio Grid", labelAr: "الشبكة الصوتية", valueEn: "Long-Throw Delay Network", valueAr: "شبكة أبراج صوتية ممتدة المدى" },
              { labelEn: "Lighting Rig", labelAr: "شبكة الإضاءة", valueEn: "IP65 Weatherproof Rig", valueAr: "إضاءة مقاومة للطقس IP65" },
              { labelEn: "Visual Display", labelAr: "شاشة العرض", valueEn: "High-Nit Outdoor LED", valueAr: "شاشات خارجية فائقة السطوع" },
              { labelEn: "Power Delivery", labelAr: "التغذية الكهربائية", valueEn: "Dual Synchronized Gensets", valueAr: "مولدات متزامنة مزدوجة" }
            ],
            outputsEn: ["Weatherization contingency plan", "Distributed power grid layout", "Acoustic decibel containment study"],
            outputsAr: ["خطة مواجهة العوامل المناخية", "مخطط شبكة الطاقة الموزعة", "دراسة حصر مستويات الضجيج"]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Certified Electrical & Clean-Power Distribution", titleAr: "توزيع كهربائي معزول ومعتمد", descriptionEn: "All power distribution units equipped with RCD trip protection, isolated earthing, and balanced three-phase loading.", descriptionAr: "جميع لوحات التوزيع مزودة بقواطع حماية RCD، وتأريض معزول، وتوزيع متوازن للأحمال ثلاثية الطور.", status: "APPROVED", evidence: "E3 Electrical Safety & Power Distribution Protocol", approvedBy: "E3 Engineering Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["mega-events", "shows-performances", "experiential-activations"]
    }
  },
  "attraction-operations": {
    categoryEn: "Venue Management & Operations",
    categoryAr: "إدارة وتشغيل الوجهات والفعاليات",
    titleEn: "Attraction Operations Support",
    titleAr: "خدمات إدارة وتشغيل الوجهات الترفيهية",
    taglineEn: "Comprehensive workforce deployment, guest services, ticketing staff, facility maintenance, and crowd safety management.",
    taglineAr: "إدارة وتشغيل متكاملة للمرافق الترفيهية، كوادر خدمة العملاء، إدارة التذاكر، الصيانة الوقائية، وبروتوكولات السلامة.",
    cms: {
      heroOutcomeEn: "Seamless Daily Operations & Exceptional Guest Satisfaction",
      heroOutcomeAr: "تشغيل يومي سلس وأعلى معايير رضا الزوار",
      supportingStatementEn: "E3 deploys trained hospitality professionals, operations managers, and preventive maintenance teams to ensure zero downtime and world-class service.",
      supportingStatementAr: "توفر إي ثري كوادر تشغيلية مدربة، مدراء عمليات محترفين، وفرق صيانة وقائية لضمان استمرارية التشغيل وتميز تجربة الضيوف.",
      verifiedProofPoints: [
        { id: "p1", value: "SOP-Driven", labelEn: "Strict Service Level Agreements", labelAr: "إجراءات تشغيل قياسية ومعايير خدمة صارمة", status: "APPROVED", evidence: "E3 Attraction Standard Operating Procedures (SOP)", approvedBy: "E3 Operations Board", approvedAt: "2026-08-01", titleEn: "SOP Operational Standard", titleAr: "معايير التشغيل القياسية" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Warm Hospitality vs. Operational Discipline",
          titleAr: "حفاوة الاستقبال مقابل الانضباط التشغيلي",
          wowEn: "Welcoming multilingual hosts, rapid queues, immaculate facility hygiene, and helpful guest assistance.",
          wowAr: "كوادر استقبال متعددة اللغات، طوابير سريعة ومنظمة، نظافة مثالية للمرفق، واستجابة فورية للزوار.",
          howEn: "Real-time staff rotation rosters, hourly safety checklists, mystery shopper audits, and centralized incident dispatch.",
          howAr: "جداول مناوبات مرنة، قوائم فحص دورية للسلامة، جولات تدقيق الجودة، وغرفة عمليات لإدارة البلاغات.",
          verifiedOutcomeEn: "Maintains >95% guest satisfaction ratings and compliant safety audits.",
          verifiedOutcomeAr: "يحقق نسبة رضا للزوار تتجاوز ٩٥٪ مع اجتياز كامل لجميع فحوصات السلامة."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Outsource Turnkey Attraction Operations", labelAr: "إسناد التشغيل الكامل للمرفق الترفيهي", descriptionEn: "Complete day-to-day management: guest service, ticketing, maintenance, and safety.", descriptionAr: "إدارة يومية متكاملة: خدمة الزوار، التذاكر، الصيانة، وإدارة السلامة." }
      ],
      capabilities: [
        { id: "c1", titleEn: "Guest Experience Staffing & Hospitality Training", titleAr: "توظيف وتدريب كوادر خدمة الزوار والضيافة", descriptionEn: "Sourcing, training, uniforming, and managing frontline hosts, ride operators, cashiers, and supervisors.", descriptionAr: "استقطاب وتدريب وتوحيد أزياء وإدارة موظفي الاستقبال، مشغلي الألعاب، الصرافين، والمشرفين.", deliverablesEn: ["Staffing Shift Rosters", "Standard Operating Procedures (SOPs)", "Service Quality Audits"], deliverablesAr: ["جداول مناوبات الموظفين", "دليل إجراءات التشغيل القياسية (SOP)", "تقارير تدقيق جودة الخدمة"], suitableForEn: ["Theme Parks", "FECs", "Exhibitions"], suitableForAr: ["المدن الترفيهية", "مراكز الترفيه العائلي", "المعارض الكبرى"], colSpan: 2, tagEn: "Operations Staffing", tagAr: "التشغيل والكوادر" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Turnkey Operations Management", titleAr: "الإدارة والتشغيل الكامل (Turnkey Operations)", subtitleEn: "Full Venue Operating Contract", subtitleAr: "عقد تشغيل شامل للمرفق", descriptionEn: "Full accountability for staffing, POS management, health and safety, opening/closing checklists, and performance SLAs.", descriptionAr: "مسؤولية شاملة عن التوظيف، إدارة نقاط البيع، السلامة والصحة المهنية، وإجراءات الفتح والإغلاق.", bestForEn: "Mall owners, private amusement centres, and pop-up destination developers.", bestForAr: "مالكو المجمعات، مراكز الألعاب الخاصة، ومطورو الوجهات الترفيهية المؤقتة.", typicalDurationEn: "6 - 36 Months", typicalDurationAr: "٦ إلى ٣٦ شهراً" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Operational Protocols & Reporting", titleAr: "البروتوكولات التشغيلية والتقارير", itemsEn: ["Standard Operating Procedure (SOP) Manual", "Incident Response & Evacuation Protocol", "Weekly Operational Dashboard & Revenue Reconciliation"], itemsAr: ["دليل إجراءات التشغيل القياسية المعتمد (SOP)", "بروتوكول الاستجابة للطوارئ وخطة الإخلاء", "التقرير التشغيلي الأسبوعي ومطابقة الإيرادات"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Operational Audit & Sizing", titleAr: "التدقيق التشغيلي وتحديد الاحتياج", descriptionEn: "Assessing headcount requirements, peak traffic points, and role profiles.", descriptionAr: "تحديد حجم الكوادر المطلوبة، نقاط الضغط والازدحام، والتوصيف الوظيفي.", outputsEn: ["Staffing Model", "Role Descriptions"], outputsAr: ["الهيكل التشغيلي", "التوصيف الوظيفي"] },
        { id: "ls2", stageNumber: "02", titleEn: "Training & ORAT Simulation", titleAr: "التدريب ومحاكاة التشغيل التجريبي", descriptionEn: "Customer service, evacuation drills, and cashier POS certification.", descriptionAr: "التدريب على خدمة العملاء، تمارين الإخلاء، واعتماد صرافي التذاكر.", outputsEn: ["Staff Certification Log", "SOP Handbook"], outputsAr: ["سجل اعتماد الكوادر", "دليل إجراءات العمل"] },
        { id: "ls3", stageNumber: "03", titleEn: "Live Daily Venue Management", titleAr: "الإدارة والتشغيل اليومي المباشر", descriptionEn: "On-site duty management, continuous audits, and monthly reporting.", descriptionAr: "الإشراف الميداني المستمر، تدقيق الجودة، والتقارير الشهرية.", outputsEn: ["Monthly SLA Review", "Customer NPS Dashboard"], outputsAr: ["مراجعة اتفاقية مستوى الخدمة", "لوحة مؤشرات رضا العملاء"] }
      ],
      serviceSpecificModule: {
        type: "operations-sop-model",
        titleEn: "Operational Governance & SOP Hierarchy",
        titleAr: "الهيكل التشغيلي وإجراءات العمل القياسية",
        subtitleEn: "Documented operational leadership roles and standard safety inspection protocols.",
        subtitleAr: "الأدوار القيادية التشغيلية وبروتوكولات الفحص والسلامة الموثقة.",
        disclaimerEn: "Staffing ratios and inspection frequencies adhere to attraction manufacturer guidelines and statutory safety regulations.",
        disclaimerAr: "تحدد نسب الكادر ومواعيد الفحص وفق دليل الشركة المصنعة للألعاب واشتراطات السلامة الرسمية.",
        options: [
          {
            id: "role-director",
            labelEn: "Duty Operations Manager",
            labelAr: "مدير عمليات المرفق",
            tagEn: "Executive Governance",
            tagAr: "الإدارة التنفيذية",
            descriptionEn: "Overall facility safety, statutory incident command, SLA compliance, and cross-departmental coordination.",
            descriptionAr: "الإشراف الكامل على أمان المرفق، إدارة بلاغات الطوارئ، متابعة مؤشرات الأداء، والتنسيق بين الأقسام.",
            outputsEn: ["Daily executive duty log", "Incident escalation protocol", "Authority inspection sign-off"],
            outputsAr: ["سجل العمليات اليومي التنفيذي", "بروتوكول تصعيد البلاغات", "اعتماد محاضر التفتيش الرسمية"]
          },
          {
            id: "role-supervisor",
            labelEn: "Guest Experience Supervisor",
            labelAr: "مشرف تجربة الزوار والخدمات",
            tagEn: "Floor Management",
            tagAr: "الإشراف الميداني",
            descriptionEn: "Queue flow management, cashier cash-handling audits, customer escalation, and frontline staff rotation.",
            descriptionAr: "إدارة انسيابية الطوابير، تدقيق صناديق التذاكر، معالجة ملاحظات العملاء، ومناوبات موظفي الاستقبال.",
            outputsEn: ["Queue dwell-time tracking", "Cashier reconciliation sheet", "Hourly restroom audit"],
            outputsAr: ["متابعة زمن الانتظار في الطوابير", "مطابقة صناديق التذاكر", "تدقيق نظافة المرافق بالساعة"]
          },
          {
            id: "role-operator",
            labelEn: "Certified Ride Operator",
            labelAr: "مشغل الألعاب والمرافق المعتمد",
            tagEn: "Attraction Safety",
            tagAr: "سلامة الألعاب",
            descriptionEn: "Standard pre-ride safety cycling, guest height/restraint verification, and emergency stop operational readiness.",
            descriptionAr: "الفحص الصباحي للألعاب، تدقيق قياسات أطوال الزوار وأحزمة الأمان، والجاهزية الفورية لإيقاف الطوارئ.",
            outputsEn: ["Pre-opening mechanical check log", "Restraint verification cycle count", "E-Stop functional test log"],
            outputsAr: ["سجل الفحص الصباحي الميكانيكي", "سجل تدقيق أحزمة الأمان بالدورة", "سجل اختبار زر إيقاف الطوارئ"]
          }
        ],
        sections: [
          {
            id: "sop-checklist",
            titleEn: "Daily Operational SOP Checklist",
            titleAr: "قائمة إجراءات التشغيل القياسية اليومية",
            items: [
              { id: "sop1", labelEn: "01. Pre-Opening Inspection", labelAr: "٠١. الفحص الصباحي قبل الافتتاح", tagEn: "08:00 - 09:30", tagAr: "٠٨:٠٠ - ٠٩:٣٠", descriptionEn: "Mechanical cycling, emergency stop verification, and digital sign-off log." },
              { id: "sop2", labelEn: "02. Shift Telemetry & Monitoring", labelAr: "٠٢. متابعة المناوبة والعمليات الحية", tagEn: "Continuous", tagAr: "مستمر طوال اليوم", descriptionEn: "Queue dwell-time tracking, regular staff rotation, and guest welfare checks." },
              { id: "sop3", labelEn: "03. Emergency Protocol Readiness", labelAr: "٠٣. الجاهزية لإجراءات الطوارئ والإخلاء", tagEn: "Drills & Checks", tagAr: "تمارين وتدقيق دوري", descriptionEn: "Functional safety drills, evacuation pathway clearance, and direct first responder sync." }
            ]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "First Aid & Emergency Response Training", titleAr: "تدريب الإسعافات الأولية والاستجابة للطوارئ", descriptionEn: "All floor supervisors certified in basic life support (BLS), first aid, and structured emergency evacuation.", descriptionAr: "جميع المشرفين معتمدون في الإسعافات الأولية الأساسية وإجراءات الإخلاء المنظم للطوارئ.", status: "APPROVED", evidence: "E3 First Aid & Emergency Response Certification", approvedBy: "E3 HSE Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["fec-development", "ticketing-solutions", "kids-concepts"]
    }
  },
  "ticketing-solutions": {
    categoryEn: "Ticketing & Access Technology",
    categoryAr: "حلول التذاكر وإدارة الدخول الذكية",
    titleEn: "Ticketing & Accreditation Solutions",
    titleAr: "حلول التذاكر وإدارة الدخول والاعتمادات (BookingQube)",
    taglineEn: "High-throughput online booking, RFID smart wristbands, turnstile integration, sub-second scanning, and live revenue analytics.",
    taglineAr: "منظومة حجز إلكتروني متقدمة، بوابات دخول ذكية، أساور RFID، مسح فائق السرعة، ولوحات تحكم مالية مباشرة.",
    cms: {
      heroOutcomeEn: "Frictionless Access & Real-Time Revenue Telemetry",
      heroOutcomeAr: "دخول سلس وفوري مع تحكم مالي وإحصائي مباشر",
      supportingStatementEn: "Powered by BookingQube, E3 provides event ticketing, box-office sales, attendee registration, access control, and real-time reporting.",
      supportingStatementAr: "مدعومة بنظام BookingQube المعتمد، توفر إي ثري خدمات بيع التذاكر الإلكترونية وشباك التذاكر، تسجيل الحضور، بوابات الدخول، والتقارير المباشرة.",
      verifiedProofPoints: [
        { id: "p1", value: "Ticketing", labelEn: "Online & Box-Office Solutions", labelAr: "حلول التذاكر الإلكترونية وشباك التذاكر", status: "APPROVED", evidence: "BookingQube Platform Capability Dossier", approvedBy: "E3 Technology Board", approvedAt: "2026-08-01", titleEn: "Ticketing Platform Capability", titleAr: "قدرات منصة التذاكر" },
        { id: "p2", value: "Access", labelEn: "Crowd & Access Management", labelAr: "إدارة الدخول وتدفق الحشود", status: "APPROVED", evidence: "BookingQube Access Architecture Specification", approvedBy: "E3 Technology Board", approvedAt: "2026-08-01", titleEn: "Access Control Capability", titleAr: "قدرات إدارة الدخول" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Frictionless Access vs. Secure Validation",
          titleAr: "سهولة الدخول مقابل دقة التحقق",
          wowEn: "Clean mobile ticketing interfaces, fast gate clearance, and live attendee insights.",
          wowAr: "واجهات حجز إلكتروني ميسرة، انسيابية الدخول عند البوابات، وتقارير فورية لأعداد الحضور.",
          howEn: "Synchronized online/offline scanners, automated duplicate ticket rejection, and real-time attendance dashboards.",
          howAr: "أجهزة مسح تعمل مع الإنترنت وبدونه، كشف تلقائي للتذاكر المكررة، ولوحات بيانات مباشرة لمتابعة الدخول.",
          verifiedOutcomeEn: "Engineered for reliable access flow and accurate revenue reconciliation.",
          verifiedOutcomeAr: "مصممة لضمان انسيابية الدخول ودقة المطابقة المالية للفعاليات."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Deploy Online Ticketing & Turnstile Access for Major Event", labelAr: "إطلاق نظام تذاكر وبوابات إلكترونية لفعالية كبرى", descriptionEn: "Turnkey ticketing platform with customized branding, payment processing, and turnstiles.", descriptionAr: "منصة تذاكر متكاملة بهوية مخصصة، دعم الدفع الإلكتروني، وبوابات الدخول." }
      ],
      capabilities: [
        { id: "c1", titleEn: "Omnichannel Ticketing Engine (BookingQube)", titleAr: "منصة التذاكر متعددة القنوات (BookingQube)", descriptionEn: "Multi-tier pricing, promotional discount codes, corporate group booking, and multi-currency checkout.", descriptionAr: "فئات تذاكر متعددة، أكواد خصم ترويجية، حجوزات الشركات والمجموعات، وعمليات دفع متعددة العملات.", deliverablesEn: ["Custom Branded Ticketing Portal", "Payment Gateway Integration", "Financial Settlement Reports"], deliverablesAr: ["بوابة تذاكر بهوية مخصصة", "ربط بوابات الدفع الإلكتروني", "تقارير التسوية المالية المباشرة"], suitableForEn: ["Festivals", "Theme Parks", "Sports Tournaments"], suitableForAr: ["المهرجانات", "المدن الترفيهية", "البطولات الرياضية"], colSpan: 2, tagEn: "Ticketing Engine", tagAr: "منظومة التذاكر" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Turnkey Platform Deployment & Hardware Hire", titleAr: "توفير المنصة وتأجير أجهزة البوابات (SaaS + HW)", subtitleEn: "Full Software, Hardware & On-Site Crew", subtitleAr: "برمجيات وأجهزة وطاقم فني موقعي", descriptionEn: "Software setup, ticket scanners/turnstiles supply, dedicated on-site network, and on-site support engineers.", descriptionAr: "تجهيز المنصة، توفير أجهزة المسح والبوابات، شبكة اتصالات مخصصة، ومهندسو دعم موقعيون.", bestForEn: "Event producers, venue operators, and exhibition organizers.", bestForAr: "منظمو الفعاليات، مشغلو الوجهات، وإدارات المعارض والمؤتمرات.", typicalDurationEn: "1 Day to Multi-Year", typicalDurationAr: "يوم واحد إلى عدة سنوات" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Ticketing & Access Pack", titleAr: "حزمة التذاكر وإدارة الدخول", itemsEn: ["Live Revenue & Attendance Dashboard Access", "Accreditation & Badge Printing Setup Dossier", "Post-Event Financial Reconciliation & Settlement Report"], itemsAr: ["صلاحية الوصول للوحة التحكم المالية والإحصائية المباشرة", "ملف طباعة بطاقات الاعتماد والشارات الرسمية", "تقرير التسوية المالية الختامي ومطابقة الحسابات"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Tiering & Payment Setup", titleAr: "تحديد الفئات وربط الدفع", descriptionEn: "Ticket categories, early-bird rates, and payment gateway activation.", descriptionAr: "فئات التذاكر، باقات الحجز المبكر، وتفعيل بوابات الدفع الإلكتروني.", outputsEn: ["Ticket Structure", "Merchant Gateway Config"], outputsAr: ["هيكل التذاكر", "إعدادات بوابة الدفع"] },
        { id: "ls2", stageNumber: "02", titleEn: "Hardware & Gate Prep", titleAr: "تجهيز الأجهزة وبوابات الدخول", descriptionEn: "Scanner testing, turnstile rigging, and staff cashier training.", descriptionAr: "فحص أجهزة المسح، تركيب البوابات، وتدريب موظفي نقاط البيع.", outputsEn: ["Gate Deployment Plan", "Scanner Test Log"], outputsAr: ["مخطط توزيع البوابات", "سجل فحص الأجهزة"] },
        { id: "ls3", stageNumber: "03", titleEn: "Live Gate Monitoring & Settlement", titleAr: "المراقبة الحية والتسوية المالية", descriptionEn: "Real-time ingress monitoring and automated financial settlements.", descriptionAr: "متابعة تدفق الدخول مباشرة وإصدار التسويات المالية الدقيقة.", outputsEn: ["Real-time Dashboard", "Settlement Report"], outputsAr: ["لوحة المتابعة المباشرة", "تقرير التسوية المالية"] }
      ],
      serviceSpecificModule: {
        type: "ticketing-flow",
        titleEn: "BookingQube Ticketing & Access Architecture",
        titleAr: "بنية منصة بوكينج كيوب للتذاكر وإدارة الدخول",
        subtitleEn: "End-to-end ticketing, attendee registration, access control, and audience telemetry.",
        subtitleAr: "منظومة متكاملة لحجز التذاكر، تسجيل الحضور، بوابات الدخول، وتحليلات الجمهور.",
        disclaimerEn: "Ticketing channels and hardware configurations are customized based on event capacity, venue gates, and network infrastructure.",
        disclaimerAr: "يتم تخصيص قنوات التذاكر والتجهيزات الميدانية وفق سعة الفعالية وعدد البوابات والبنية التحتية للشبكة.",
        options: [
          {
            id: "step-booking",
            labelEn: "1. Event & Box-Office Ticketing",
            labelAr: "١. الحجز الإلكتروني ونقاط البيع",
            tagEn: "Multi-Channel Sales",
            tagAr: "مبيعات متعددة القنوات",
            descriptionEn: "Responsive web & mobile ticketing portal, multi-tier ticket categories, dynamic promotional codes, and box office point-of-sale support.",
            descriptionAr: "بوابة حجز إلكترونية سريعة، فئات تذاكر متعددة، أكواد خصم ترويجية، ودعم نقاط بيع شباك التذاكر الميداني.",
            outputsEn: ["Custom branded portal", "Time-slot scheduling", "Multi-tier pricing", "Box office POS checkout"],
            outputsAr: ["بوابة حجز بهوية مخصصة", "جدولة الفترات الزمنية", "تسعير فئات متعددة", "نقاط بيع شباك التذاكر"]
          },
          {
            id: "step-accreditation",
            labelEn: "2. Accreditation & Registration",
            labelAr: "٢. التسجيل المسبق والاعتماد",
            tagEn: "Attendee Management",
            tagAr: "إدارة المسجلين",
            descriptionEn: "Pre-event attendee registration, customized data collection forms, badge printing workflows, and VIP delegate credentials.",
            descriptionAr: "تسجيل مسبق للحضور، نماذج جمع بيانات مخصصة، طباعة شارات الدخول، واعتماد كبار الشخصيات والوفود.",
            outputsEn: ["Custom registration fields", "Pre-registration approval flow", "Badge printing templates", "VIP delegate list export"],
            outputsAr: ["حقول تسجيل مخصصة", "مسار اعتماد التسجيل", "قوالب طباعة الشارات", "تصدير قوائم كبار الشخصيات"]
          },
          {
            id: "step-access",
            labelEn: "3. Access & Crowd Management",
            labelAr: "٣. بوابات الدخول وإدارة الحشود",
            tagEn: "Gate Scanning & Validation",
            tagAr: "مسح وتحقق البوابات",
            descriptionEn: "Rapid gate validation, turnstile integration support, synchronized online/offline scanning, and duplicate pass prevention.",
            descriptionAr: "تحقق سريع عند البوابات، دعم الربط مع البوابات الإلكترونية، مسح متزامن مع الإنترنت وبدونه، ومنع التذاكر المكررة.",
            outputsEn: ["Online/offline scanning nodes", "Anti-passback rule enforcement", "Turnstile hardware sync", "Gate operator handhelds"],
            outputsAr: ["أجهزة مسح تدعم العمل دون إنترنت", "تطبيق قواعد منع التكرار", "ربط مع البوابات الإلكترونية", "أجهزة مسح يدوية للمشغلين"]
          },
          {
            id: "step-insights",
            labelEn: "4. Audience Insights & Reporting",
            labelAr: "٤. تحليلات الحضور ولوحة البيانات",
            tagEn: "Live Analytics & Audit",
            tagAr: "تحليلات حية وتدقيق",
            descriptionEn: "Real-time attendance graphs, gate throughput analytics, capacity threshold alerts, and post-event financial settlement reports.",
            descriptionAr: "متابعة لحظية لأعداد الحضور، معدل التدفق على البوابات، تنبيهات الطاقة الاستيعابية، وتقارير المطابقة المالية الختامية.",
            outputsEn: ["Real-time entry telemetry", "Hourly gate throughput logs", "Audience demographic reports", "Financial reconciliation summary"],
            outputsAr: ["بيانات الدخول اللحظية", "سجل التدفق بالساعة", "تقارير ديموغرافية الحضور", "ملخص المطابقة والتسوية المالية"]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Data Privacy & Transaction Security", titleAr: "حماية البيانات وأمن المعاملات", descriptionEn: "Customer data and payment transactions protected in accordance with regional data privacy regulations and security benchmarks.", descriptionAr: "حماية بيانات العملاء ومعاملات الدفع بما يتوافق مع القوانين واللوائح التنظيمية لحماية البيانات.", status: "APPROVED", evidence: "BookingQube Data Protection & Security Policy", approvedBy: "E3 Security Directorate", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["mega-events", "attraction-operations", "fec-development"]
    }
  },
  "fabrication-branding": {
    categoryEn: "Scenic Fabrication & Spatial Signage",
    categoryAr: "التصنيع الإنشائي والديكور والهوية المكانية",
    titleEn: "Fabrication & Branding",
    titleAr: "التصنيع الإنشائي والديكور وتطبيقات الهوية المكانية",
    taglineEn: "Precision CNC joinery, scenic painting, architectural metalwork, dynamic lightboxes, and large-format environmental branding.",
    taglineAr: "تصنيع أخشاب ومعادن عالية الدقة بالتحكم الرقمي (CNC)، ديكورات مسرحية، لوحات إرشادية مضيئة، وهندسة الهوية المكانية.",
    cms: {
      heroOutcomeEn: "Museum-Grade Spatial Craftsmanship Built to Exacting Tolerances",
      heroOutcomeAr: "حرفية تصنيع استثنائية وتشطيبات متقنة بأعلى معايير الجودة",
      supportingStatementEn: "E3 operates specialized fabrication facilities combining advanced CNC routing, laser cutting, metal welding, and artisan finishes.",
      supportingStatementAr: "تجمع ورش ومرافق تصنيع إي ثري بين أحدث تقنيات القطع بالليزر والـ CNC والتشطيبات الحرفية الدقيقة لإنتاج مجسمات وديكورات معمارية مبهرة.",
      verifiedProofPoints: [
        { id: "p1", value: "Craftsmanship", labelEn: "In-House Precision Finishing", labelAr: "دقة تشطيب حرفية عالية", status: "APPROVED", evidence: "E3 Fabrication Quality Manual 2026", approvedBy: "E3 Quality Board", approvedAt: "2026-08-01", titleEn: "Workshop Precision Standards", titleAr: "معايير دقة التصنيع" },
        { id: "p2", value: "Durable", labelEn: "Engineered for Extreme Weather", labelAr: "مواد مقاومة للظروف المناخية القاسية", status: "APPROVED", evidence: "E3 Outdoor Substrate Durability Specifications", approvedBy: "E3 Materials Board", approvedAt: "2026-08-01", titleEn: "Weather Durability Standards", titleAr: "معايير مقاومة العوامل الجوية" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Flawless Architectural Finishes vs. Structural Integrity",
          titleAr: "جمالية التشطيبات المعمارية مقابل المتانة الإنشائية",
          wowEn: "Seamless high-gloss surfaces, glowing architectural letterforms, and tactile textured scenic structures.",
          wowAr: "أسطح فائقة النعومة واللمعان، حروف معمارية مضيئة، وديكورات ثلاثية الأبعاد ذات ملمس واقعي متقن.",
          howEn: "Reinforced steel subframes, marine-grade outdoor coatings, precision CNC mitring, and certified load-bearing anchors.",
          howAr: "هياكل حديدية داخلية مدعمة، دهانات مقاومة للعوامل البحرية والحرارة، وقواعد تثبيت إنشائية معتمدة.",
          verifiedOutcomeEn: "Engineered to maintain aesthetic perfection under harsh regional climate conditions.",
          verifiedOutcomeAr: "مصممة لتحافظ على رونقها وجودتها تحت الظروف المناخية القاسية."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Fabricate Custom Exhibition Booth or Scenic Stage Set", labelAr: "تصنيع جناح معرض مخصص أو ديكور مسرحي متكامل", descriptionEn: "Turnkey workshop fabrication, sample approvals, logistics, and on-site assembly.", descriptionAr: "تصنيع كامل في الورش، اعتماد العينات، النقل اللوجستي، والتركيب الموقعي." }
      ],
      capabilities: [
        { id: "c1", titleEn: "Architectural Metalwork & CNC Wood Joinery", titleAr: "الأعمال المعدنية المعمارية والنجارة الرقمية (CNC)", descriptionEn: "Structural steel frames, precision aluminum cladding, custom acrylic work, and high-pressure laminate cabinetry.", descriptionAr: "هياكل حديدية معتمدة، تكسيات ألمنيوم دقيقة، أعمال الأكريليك، وتصنيع الخزائن والمنصات المعمارية.", deliverablesEn: ["Workshop Production Shop-Drawings", "Physical Material Sample Board", "On-Site Installation Certificate"], deliverablesAr: ["المخططات التنفيذية للورش (Shop Drawings)", "لوحة عينات المواد الحقيقية للاعتماد", "محضر اعتماد التركيب والتسليم الموقعي"], suitableForEn: ["Museums", "Malls", "Corporate HQs"], suitableForAr: ["المتاحف", "المجمعات التجارية", "المقرات الرئيسية"], colSpan: 2, tagEn: "Precision Joinery", tagAr: "التصنيع الدقيق" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Design, Fabricate & Install (Turnkey)", titleAr: "التصميم والتصنيع والتركيب الشامل", subtitleEn: "Full Workshop & Installation Scope", subtitleAr: "تنفيذ كامل من الورشة حتى الموقع", descriptionEn: "Shop drawing production, material sourcing, workshop fabrication, logistics, and certified site installation.", descriptionAr: "إعداد المخططات التنفيذية، توفير المواد، التصنيع في الورش، النقل، والتركيب المعتمد.", bestForEn: "Interior designers, exhibition planners, and retail developers.", bestForAr: "مصممو الديكور، منظمو المعارض، ومطورو المساحات التجارية.", typicalDurationEn: "3 - 10 Weeks", typicalDurationAr: "٣ إلى ١٠ أسابيع" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Fabrication Dossier & Samples", titleAr: "ملف التصنيع وعينات المواد", itemsEn: ["Detailed 2D/3D Shop Drawings with Material Callouts", "Signed Material & Finish Sample Swatches", "Structural Sign-Off & Safe Work Method Statement"], itemsAr: ["مخططات تنفيذية تفصيلية محددة المواد والقياسات", "عينات الألوان والمواد المعتمدة رسمياً", "تقرير الاعتماد الإنشائي وإجراءات العمل الآمن"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Shop Drawings & Material Approval", titleAr: "المخططات التنفيذية واعتماد المواد", descriptionEn: "CAD drafting, material samples, and finish selection.", descriptionAr: "إعداد المخططات الدقيقة، تقديم عينات المواد، واعتماد درجات الألوان.", outputsEn: ["Shop Drawing Pack", "Approved Sample Swatches"], outputsAr: ["حزمة المخططات التنفيذية", "لوحة العينات المعتمدة"] },
        { id: "ls2", stageNumber: "02", titleEn: "Workshop CNC & Joinery", titleAr: "التصنيع الميكانيكي والنجارة بالورش", descriptionEn: "Precision cutting, welding, assembly, and scenic painting.", descriptionAr: "القطع الرقمي، اللحام الهيكلي، التجميع الأولي، والدهانات الاحترافية.", outputsEn: ["Workshop Inspection Sign-Off", "Transport Manifest"], outputsAr: ["محضر فحص الجودة بالورشة", "سجل النقل اللوجستي"] },
        { id: "ls3", stageNumber: "03", titleEn: "Site Delivery & Final Fitout", titleAr: "التوريد والتركيب الموقعي النهائي", descriptionEn: "Clean on-site installation, lighting hookups, and handover.", descriptionAr: "التركيب النظيف في الموقع، توصيل الإضاءة المخفية، والتسليم النهائي.", outputsEn: ["Handover Certificate", "Care & Maintenance Guide"], outputsAr: ["شهادة التسليم النهائي", "دليل العناية والصيانة"] }
      ],
      serviceSpecificModule: {
        type: "fabrication-materials",
        titleEn: "Material Engineering & Scenic Fabrication",
        titleAr: "هندسة المواد والتصنيع الديكوري",
        subtitleEn: "Material classification and fabrication techniques for thematic environments and experiential structures.",
        subtitleAr: "تصنيف المواد وتقنيات التصنيع المخصصة للبيئات الترفيهية والمجسمات الإبداعية.",
        disclaimerEn: "Material selection, fire retardant treatments, and structural anchors are certified based on structural engineering calculations and Civil Defence standards.",
        disclaimerAr: "يتم اعتماد نوع المواد ومعالجات مقاومة الحريق والتثبيت الإنشائي بناءً على الحسابات الهندسية واشتراطات الدفاع المدني.",
        options: [
          {
            id: "mat-steel",
            labelEn: "Structural Steel & Metalwork",
            labelAr: "الهياكل الحديدية والأعمال المعدنية",
            tagEn: "Load-Bearing & Structural",
            tagAr: "تحمل إنشائي عالي",
            descriptionEn: "Engineered structural subframes, powder-coated aluminum cladding, and certified anchor points for high-wind tolerance.",
            descriptionAr: "هياكل حديدية مدعمة، تكسيات ألمنيوم مطلية حرارياً، ونقاط تثبيت معتمدة لمقاومة الرياح.",
            specs: [
              { labelEn: "Structural Core", labelAr: "الهيكل الإنشائي", valueEn: "High-Tensile Steel Box Sections", valueAr: "مقاطع فولاذية عالية المقاومة" },
              { labelEn: "Surface Finish", labelAr: "المعالجة السطحية", valueEn: "Powder-Coated / Marine Primer", valueAr: "طلاء حراري ومقاوم للتآكل" }
            ],
            outputsEn: ["Structural engineer load sign-off", "Weld penetration test certificate", "Wind tolerance calculation pack"],
            outputsAr: ["محضر اعتماد المهندس الإنشائي", "شهادة فحص جودة اللحام", "حسابات مقاومة الرياح"]
          },
          {
            id: "mat-acrylic",
            labelEn: "Precision CNC Acrylic & Joinery",
            labelAr: "النجارة الرقمية والأكريليك الدقيق",
            tagEn: "High-Detail Finishes",
            tagAr: "تشطيبات دقيقة عالية النقاء",
            descriptionEn: "Seamless high-gloss surfaces, optical-grade acrylic fabrication, and integrated backlit architectural diffusion.",
            descriptionAr: "أسطح فائقة النعومة، تشكيل أكريليك بصري عالي النقاء، وإضاءة خلفية معمارية متجانسة.",
            specs: [
              { labelEn: "Fabrication Method", labelAr: "طريقة التصنيع", valueEn: "Multi-Axis CNC Routing", valueAr: "قطع رقمي متعدد المحاور CNC" },
              { labelEn: "Light Diffusion", labelAr: "نفاذية الضوء", valueEn: "Homogeneous Optical Acrylic", valueAr: "أكريليك ناشر للضوء بانتظام" }
            ],
            outputsEn: ["Physical material sample approval", "Joint alignment inspection log", "Lighting dispersion test"],
            outputsAr: ["اعتماد عينات المواد الحقيقية", "سجل تدقيق استواء الفواصل", "فحص تجانس توزيع الإضاءة"]
          },
          {
            id: "mat-scenic",
            labelEn: "Scenic Foam & Polyurea Shell",
            labelAr: "الديكورات المجسمة وطلاء البولي يوريا",
            tagEn: "Sculptural Theming",
            tagAr: "مجسمات ثيمية ثلاثية الأبعاد",
            descriptionEn: "Lightweight EPS foam sculpted to complex 3D organic shapes, coated with an impact-resistant polyurea protective shell.",
            descriptionAr: "مجسمات إسفنجية EPS منحوتة بدقة، مغلفة بطبقة بولي يوريا فائقة الصلابة لمقاومة الصدمات.",
            specs: [
              { labelEn: "Core Substrate", labelAr: "المادة الأساسية", valueEn: "Dense EPS Thematic Foam", valueAr: "إسفنج EPS عالي الكثافة" },
              { labelEn: "Hard Shell", labelAr: "الطبقة الواقية", valueEn: "Impact Polyurea Hardcoat", valueAr: "طبقة بولي يوريا صلبة ومقاومة" }
            ],
            outputsEn: ["3D sculpt miniature approval", "Impact test verification", "Scenic color matching swatches"],
            outputsAr: ["اعتماد مجسم ثلاثي الأبعاد مصغر", "فحص مقاومة الصدمات", "عينات مطابقة ألوان الديكور"]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Fire-Retardant Treatments & Compliance", titleAr: "معالجات مقاومة الحريق والامتثال للسلامة", descriptionEn: "All paints, scenic coatings, and substrates tested and certified for fire retardancy in public installations.", descriptionAr: "جميع الدهانات ومواد الديكور معالجة ومطابقة لاشتراطات مقاومة الحريق في الأماكن العامة.", status: "APPROVED", evidence: "E3 Scenic Materials Fire Retardancy Verification Dossier", approvedBy: "E3 HSE Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["experiential-activations", "mega-events", "fec-development"]
    }
  },
  "feasibility-design-research": {
    categoryEn: "Advisory, Research & Concept",
    categoryAr: "الاستشارات والأبحاث والمفاهيم الاستراتيجية",
    titleEn: "Feasibility, Design & Research",
    titleAr: "دراسات الجدوى والأبحاث والتصميم الاستراتيجي",
    taglineEn: "Comprehensive market feasibility studies, guest demographic analysis, financial modeling, and creative IP concept design.",
    taglineAr: "دراسات جدوى تسويقية ومالية متكاملة، تحليل ديموغرافي للزوار، وتطوير المفاهيم الإبداعية للمشاريع الترفيهية.",
    cms: {
      heroOutcomeEn: "Data-Driven Strategic Clarity for High-Stakes Investments",
      heroOutcomeAr: "رؤية استثمارية واستراتيجية مدعومة بالبيانات الدقيقة",
      supportingStatementEn: "We de-risk entertainment investments by validating catchment demand, sizing attraction footprints, and building bankable financial models.",
      supportingStatementAr: "نحمي الاستثمارات الترفيهية ونعزز عوائدها من خلال التحقق العلمي من حجم الطلب وتحديد المساحات المثلى وبناء النماذج المالية المعتمدة.",
      verifiedProofPoints: [
        { id: "p1", value: "Bankable", labelEn: "Investment-Grade Financial Modeling", labelAr: "نماذج مالية استثمارية معتمدة للبنوك", status: "APPROVED", evidence: "E3 Feasibility & Research Methodology Standards", approvedBy: "E3 Investment Committee", approvedAt: "2026-08-01", titleEn: "Bankable Financial Modeling", titleAr: "النمذجة المالية المعتمدة" }
      ],
      wowHow: [
        {
          id: "wh1",
          titleEn: "Visionary Concepts vs. Rigorous Financial Realism",
          titleAr: "الرؤى الإبداعية الملهمة مقابل الواقعية المالية الصارمة",
          wowEn: "Inspiring masterplan narratives, creative attraction storytelling, and captivating 3D visionary decks.",
          wowAr: "رؤى معمارية ملهمة، مفاهيم ترفيهية آسرة، وعروض تقديمية ثلاثية الأبعاد تنبض بالحياة.",
          howEn: "Detailed CAPEX/OPEX benchmarking, regional demographic indexing, footfall yield simulations, and ROI sensitivity models.",
          howAr: "تحليل مقارن للمصروفات الرأسمالية والتشغيلية، دراسة ديموغرافية للجمهور، ونماذج حساسية العائد الاستثماري.",
          verifiedOutcomeEn: "Delivers comprehensive roadmaps for informed executive decisions.",
          verifiedOutcomeAr: "يقدم خارطة طريق واضحة وقرارات استثمارية مدروسة وموثوقة."
        }
      ],
      objectives: [
        { id: "o1", labelEn: "Commission Commercial Feasibility & Market Study", labelAr: "طلب دراسة جدوى تسويقية ومالية متكاملة", descriptionEn: "Full demand analysis, catchment sizing, CAPEX/OPEX estimation, and financial forecasting.", descriptionAr: "تحليل الطلب في السوق، تقدير التكاليف الرأسمالية والتشغيلية، والتوقعات المالية." }
      ],
      capabilities: [
        { id: "c1", titleEn: "Market Feasibility & Financial Modeling", titleAr: "دراسات الجدوى التسويقية والنمذجة المالية", descriptionEn: "Detailed demographic catchment sizing, competitive benchmarking, attendance projections, and 10-year pro-forma cash flows.", descriptionAr: "تحليل النطاق الجغرافي والسكان، المقارنة التنافسية، توقعات أعداد الزوار، والتدفقات النقدية لعشر سنوات.", deliverablesEn: ["Executive Feasibility Study Dossier", "Financial Model (Pro-Forma P&L, IRR, NPV)", "Risk & Sensitivity Matrix"], deliverablesAr: ["تقرير دراسة الجدوى التنفيذي الشامل", "النموذج المالي (الأرباح، معدل العائد، وصافي القيمة)", "مصفوفة المخاطر وتحليل الحساسية المالية"], suitableForEn: ["Investment Funds", "Developers", "Tourism Authorities"], suitableForAr: ["صناديق الاستثمار", "المطورون العقاريون", "هيئات السياحة"], colSpan: 2, tagEn: "Financial Advisory", tagAr: "الاستشارات المالية" }
      ],
      engagementModels: [
        { id: "em1", titleEn: "Strategic Feasibility & Advisory Study", titleAr: "الدراسة الاستشارية والجدوى الاستراتيجية", subtitleEn: "Full Independent Advisory Study", subtitleAr: "دراسة استشارية مستقلة وشاملة", descriptionEn: "Market analysis, competitive research, demographic sizing, financial pro-forma, and executive board presentation.", descriptionAr: "تحليل السوق، دراسة المنافسين، التوزيع السكاني، التوقعات المالية، وتقديم العرض لمجلس الإدارة.", bestForEn: "Asset owners, master developers, and private equity investors.", bestForAr: "مالكو الأصول والمشاريع الكبرى، والمستثمرون وصناديق الملكية الخاصة.", typicalDurationEn: "4 - 8 Weeks", typicalDurationAr: "٤ إلى ٨ أسابيع" }
      ],
      deliverables: [
        { id: "d1", titleEn: "Advisory & Research Dossier", titleAr: "ملف الاستشارات والدراسات المكتملة", itemsEn: ["Comprehensive Market Feasibility & Catchment Dossier", "Audited Financial Model with Sensitivity Analysis", "Thematic Masterplan Concept Deck & Narrative"], itemsAr: ["ملف دراسة الجدوى التسويقية وحجم السوق", "النموذج المالي المدقق مع تحليل حساسية المتغيرات", "عرض المخطط العام والمفهوم الإبداعي للمشروع"] }
      ],
      lifecycleStages: [
        { id: "ls1", stageNumber: "01", titleEn: "Market & Demographic Benchmarking", titleAr: "دراسة السوق والتركيبة السكانية", descriptionEn: "Catchment sizing, competitor audits, and consumer spending patterns.", descriptionAr: "تحليل النطاق السكاني، تدقيق المنافسين، وأنماط إنفاق المستهلكين.", outputsEn: ["Market Assessment Report", "Competitor Matrix"], outputsAr: ["تقرير تقييم السوق", "مصفوفة المنافسين"] },
        { id: "ls2", stageNumber: "02", titleEn: "Financial Pro-Forma & Sizing", titleAr: "النمذجة المالية وتحديد المساحات", descriptionEn: "CAPEX/OPEX estimations, revenue stream modeling, and IRR calculations.", descriptionAr: "تقدير التكاليف، نمذجة مصادر الدخل، وحساب العائد الداخلي على الاستثمار.", outputsEn: ["10-Year Pro-Forma Model", "Sensitivity Analysis"], outputsAr: ["النموذج المالي لعشر سنوات", "تحليل الحساسية المالية"] },
        { id: "ls3", stageNumber: "03", titleEn: "Executive Report & Board Presentation", titleAr: "التقرير التنفيذي والعرض النهائي", descriptionEn: "Synthesizing findings into actionable recommendations for decision-makers.", descriptionAr: "تلخيص النتائج في توصيات عملية واضحة لأصحاب القرار.", outputsEn: ["Executive Presentation Deck", "Final Study Dossier"], outputsAr: ["العرض التنفيذي لمجلس الإدارة", "الملف الكامل للدراسة"] }
      ],
      serviceSpecificModule: {
        type: "research-study-gates",
        titleEn: "4-Gate Strategic Investment Appraisal",
        titleAr: "منهجية تقييم الاستثمار ودراسات الجدوى (4 بوابات)",
        subtitleEn: "Institutional appraisal methodology for entertainment destinations, attraction zoning, and capital allocation.",
        subtitleAr: "منهجية مؤسسية لتقييم الوجهات الترفيهية وتوزيع الألعاب وتخصيص رأس المال الاستثماري.",
        disclaimerEn: "Feasibility studies provide strategic and financial modeling guidance. Project returns depend on market execution, economic climate, and operational governance.",
        disclaimerAr: "تقدم دراسات الجدوى نماذج استراتيجية ومالية استرشادية. تعتمد العوائد على كفاءة التنفيذ التشغيلي وظروف السوق.",
        options: [
          {
            id: "gate-1",
            labelEn: "Gate 1: Catchment & Market Demand",
            labelAr: "البوابة ١: تحليل السوق والطلب الجماهيري",
            tagEn: "Demographic Analysis",
            tagAr: "التحليل الديموغرافي",
            descriptionEn: "Resident and tourist demographic analysis, regional entertainment benchmarking, and target visitor profiling.",
            descriptionAr: "تحليل الكثافة السكانية والزوار والسياح، دراسة المنافسين الإقليميين، وتحديد شرائح الجمهور المستهدفة.",
            outputsEn: ["Primary & secondary catchment demographic study", "Regional competitor benchmarking matrix", "Target visitor spending capacity profile"],
            outputsAr: ["دراسة النطاق السكاني الأولي والثانوي", "مصفوفة مقارنة المنافسين في المنطقة", "تحديد القدرة الشرائية ومعدل إنفاق الزوار"]
          },
          {
            id: "gate-2",
            labelEn: "Gate 2: Attraction Mix & Spatial Sizing",
            labelAr: "البوابة ٢: مزيج الألعاب وتحديد المساحات",
            tagEn: "Spatial Programming",
            tagAr: "البرمجة المكانية",
            descriptionEn: "Attraction capacity sizing, circulation ratios, dwell time projection, and peak-hour load modeling.",
            descriptionAr: "تحديد طاقة استيعاب الألعاب، نسب الممرات والمساحات المفتوحة، تقدير مدة الإقامة، ونمذجة ساعات الذروة.",
            outputsEn: ["Spatial footprint and zoning allocation table", "Simulated peak-hour visitor throughput model", "Attraction category revenue mix"],
            outputsAr: ["جدول توزيع المساحات والأنشطة", "نموذج محاكاة تدفق الزوار في ساعات الذروة", "توزيع مصادر الدخل حسب فئات الألعاب"]
          },
          {
            id: "gate-3",
            labelEn: "Gate 3: Financial Pro-Forma & Sensitivity",
            labelAr: "البوابة ٣: النموذج المالي وتحليل الحساسية",
            tagEn: "Investment Pro-Forma",
            tagAr: "النموذج المالي",
            descriptionEn: "10-year bankable financial cash flow model, CAPEX phasing schedule, and OPEX sensitivity analysis.",
            descriptionAr: "نموذج تدفقات نقدية بنكية لعشر سنوات، جدول مراحل ضخ التكاليف الرأسمالية، وتحليل حساسية المصروفات التشغيلية.",
            outputsEn: ["10-Year Pro-Forma Income Statement & Cash Flow", "Discounted Cash Flow (DCF) IRR & NPV calculations", "Stress-tested sensitivity scenarios"],
            outputsAr: ["قائمة الدخل والتدفقات النقدية المتوقعة لعشر سنوات", "حسابات معدل العائد الداخلي وصافي القيمة الحالية", "سيناريوهات اختبار الحساسية تحت ظروف ضاغطة"]
          },
          {
            id: "gate-4",
            labelEn: "Gate 4: Procurement & Execution Strategy",
            labelAr: "البوابة ٤: استراتيجية التوريد والتنفيذ",
            tagEn: "Tender Roadmap",
            tagAr: "خارطة طريق المناقصات",
            descriptionEn: "RFP tender packaging, vendor qualification criteria, statutory milestone roadmap, and risk register.",
            descriptionAr: "إعداد حزم كراسات الشروط والمناقصات، معايير تأهيل الموردين، خارطة طريق الاعتمادات، وسجل المخاطر.",
            outputsEn: ["EPC and vendor procurement strategy dossier", "Statutory approvals & licensing milestone schedule", "Master project risk mitigation register"],
            outputsAr: ["استراتيجية طرح المناقصات وتأهيل الموردين", "جدول المعالم التنفيذية والتراخيص الرسمية", "سجل حصر وإدارة مخاطر المشروع الشامل"]
          }
        ]
      },
      enterpriseReadiness: [
        { id: "er1", titleEn: "Independent & Defensible Financial Modeling", titleAr: "نماذج مالية دقيقة ومستقلة", descriptionEn: "Methodology built on standardized discounted cash flow (DCF) principles and verified regional operational cost benchmarks.", descriptionAr: "منهجية مبنية على معايير التدفقات النقدية المخصومة المعتمدة ومؤشرات التكلفة الإقليمية الموثوقة.", status: "APPROVED", evidence: "E3 Financial Appraisal Standards Dossier", approvedBy: "E3 Investment Committee", approvedAt: "2026-08-01" }
      ],
      relatedServiceSlugs: ["fec-development", "mega-events", "attraction-operations"]
    }
  }
};
