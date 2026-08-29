/**
 * Centralized Public Framework Interface Labels (EN & AR)
 *
 * Sourced dynamically with full support for CMS/database overrides.
 * All public buttons, status badges, directory headings, navigation tabs,
 * empty states, and accessibility announcements are centralized here.
 */

export interface ServiceFrameworkLabels {
  // Badges & Categories
  enterpriseCapability: string;
  turnkey: string;
  multiDiscipline: string;
  qatarReady: string;
  verified: string;
  accredited: string;
  canonicalDisciplines: string;

  // Navigation & Actions
  buildProjectBrief: string;
  addToProjectBrief: string;
  includeInBrief: string;
  requestModelScope: string;
  viewRelevantWork: string;
  exploreServiceDetails: string;
  exploreService: string;
  viewAllServices: string;
  viewAllCaseStudies: string;
  readCaseStudy: string;
  applySolutionBundle: string;
  expandAll: string;
  collapseAll: string;
  viewFullscreen: string;
  closeLightbox: string;
  previousImage: string;
  nextImage: string;
  quickView: string;

  // Headings & Section Titles
  directoryHeading: string;
  directorySubheading: string;
  navigatorHeading: string;
  navigatorSubheading: string;
  solutionFinderHeading: string;
  solutionFinderSubheading: string;
  galleryHeading: string;
  gallerySubheading: string;
  caseStudiesHeading: string;
  caseStudiesSubheading: string;
  deliverablesHeading: string;
  deliverablesSubheading: string;
  engagementHeading: string;
  engagementSubheading: string;
  readinessHeading: string;
  readinessSubheading: string;
  relatedSolutionsHeading: string;
  relatedSolutionsSubheading: string;

  // Empty & Fallback States
  noMediaConfigured: string;
  noCaseStudiesFound: string;
  noGalleryItems: string;
  noDeliverablesFound: string;

  // Accessibility & Form Labels
  projectFormatLabel: string;
  lifespanLabel: string;
  targetAudienceLabel: string;
  primaryObjectiveLabel: string;
  requiredScopeLabel: string;
  recommendedBundleLabel: string;
  selectDiscipline: string;
  stepIndicator: string;
}

export const SERVICE_LABELS_EN: ServiceFrameworkLabels = {
  // Badges & Categories
  enterpriseCapability: "Enterprise Capability",
  turnkey: "Turnkey",
  multiDiscipline: "Multi-Discipline",
  qatarReady: "Qatar-Ready",
  verified: "Verified",
  accredited: "Accredited",
  canonicalDisciplines: "10 Canonical Disciplines",

  // Navigation & Actions
  buildProjectBrief: "Build Your Project Brief",
  addToProjectBrief: "Add to Project Brief",
  includeInBrief: "Include in Brief",
  requestModelScope: "Request Model Scope",
  viewRelevantWork: "View Relevant Work",
  exploreServiceDetails: "Explore Service Details",
  exploreService: "Explore Service",
  viewAllServices: "View All Services",
  viewAllCaseStudies: "View All Case Studies",
  readCaseStudy: "Read Case Study",
  applySolutionBundle: "Apply Bundle to Project Brief",
  expandAll: "Expand All",
  collapseAll: "Collapse All",
  viewFullscreen: "View Fullscreen",
  closeLightbox: "Close Lightbox",
  previousImage: "Previous Image",
  nextImage: "Next Image",
  quickView: "Quick View",

  // Headings & Section Titles
  directoryHeading: "Enterprise Capability Directory",
  directorySubheading: "Turnkey spatial design, technical fabrication, live production, and operations in Qatar.",
  navigatorHeading: "Integrated Discipline Navigator",
  navigatorSubheading: "Explore the ten core entertainment and event engineering capabilities delivered by E3.",
  solutionFinderHeading: "What Are You Building or Staging?",
  solutionFinderSubheading: "Select your project parameters to receive a tailored E3 capability bundle designed for turnkey execution.",
  galleryHeading: "Site Visuals & Production Craftsmanship",
  gallerySubheading: "High-resolution photography and media documenting real installation, engineering tolerances, and audience experience.",
  caseStudiesHeading: "Verified Projects Executed in Qatar",
  caseStudiesSubheading: "Real case studies showcasing E3's exact scope, attendance numbers, and verified execution outcomes.",
  deliverablesHeading: "Formal Deliverables & Scope Roster",
  deliverablesSubheading: "Structured contractual deliverables provided at each milestone of the engagement.",
  engagementHeading: "Procurement & Engagement Models",
  engagementSubheading: "Flexible contracting structures tailored to government entities, semi-government authorities, and private developers.",
  readinessHeading: "Enterprise Readiness & Accreditations",
  readinessSubheading: "Rigorous HSE certifications, vendor pre-qualifications, and compliance standards for projects in Qatar.",
  relatedSolutionsHeading: "Integrated Cross-Discipline Solutions",
  relatedSolutionsSubheading: "Complementary capabilities frequently bundled for seamless turnkey project execution.",

  // Empty & Fallback States
  noMediaConfigured: "No visual assets configured for this service yet.",
  noCaseStudiesFound: "Case studies for this discipline are being compiled.",
  noGalleryItems: "Production gallery items are being documented.",
  noDeliverablesFound: "Deliverables are customized per procurement RFP.",

  // Accessibility & Form Labels
  projectFormatLabel: "Project Format",
  lifespanLabel: "Lifespan",
  targetAudienceLabel: "Target Audience",
  primaryObjectiveLabel: "Primary Objective",
  requiredScopeLabel: "Required Scope",
  recommendedBundleLabel: "Recommended Service Bundle",
  selectDiscipline: "Select Discipline",
  stepIndicator: "Step",
};

export const SERVICE_LABELS_AR: ServiceFrameworkLabels = {
  // Badges & Categories
  enterpriseCapability: "خدمات قطاع الأعمال",
  turnkey: "تسليم مفتاح شامل",
  multiDiscipline: "متعدد التخصصات",
  qatarReady: "جاهز للتنفيذ في قطر",
  verified: "معتمد وموثق",
  accredited: "مرخص رسمياً",
  canonicalDisciplines: "التخصصات العشر المعتمدة",

  // Navigation & Actions
  buildProjectBrief: "بناء موجز مشروعك المخصص",
  addToProjectBrief: "إضافة إلى موجز المشروع",
  includeInBrief: "تضمين في الموجز",
  requestModelScope: "طلب نطاق النموذج",
  viewRelevantWork: "استعراض المشاريع ذات الصلة",
  exploreServiceDetails: "استعراض تفاصيل الخدمة",
  exploreService: "استعراض الخدمة",
  viewAllServices: "عرض كافة الخدمات",
  viewAllCaseStudies: "عرض جميع المشاريع",
  readCaseStudy: "استعراض تفاصيل المشروع",
  applySolutionBundle: "تطبيق الحزمة المقترحة على الموجز",
  expandAll: "توسيع الكل",
  collapseAll: "طي الكل",
  viewFullscreen: "تكبير الصورة",
  closeLightbox: "إغلاق المعرض",
  previousImage: "الصورة السابقة",
  nextImage: "الصورة التالية",
  quickView: "نظرة سريعة",

  // Headings & Section Titles
  directoryHeading: "دليل خدمات المنظومة لقطاع الأعمال",
  directorySubheading: "حلول التصميم المكاني، التصنيع الهندسي، الإنتاج الميداني، والتشغيل المتكامل في قطر.",
  navigatorHeading: "متصفح التخصصات والقدرات المتكاملة",
  navigatorSubheading: "استكشف التخصصات العشر الأساسية التي تقدمها إي ثري لقطاع الفعاليات والترفيه.",
  solutionFinderHeading: "ما الذي تخطط لبنائه أو تنظيمه؟",
  solutionFinderSubheading: "حدد طبيعة مشروعك وأهدافه لاقتراح حزمة الخدمات المثالية لإنجازه بكفاءة.",
  galleryHeading: "شواهد التنفيذ والإنتاج الميداني",
  gallerySubheading: "توثيق فوتوغرافي وميداني عالي الدقة يبرز جودة التشطيبات ودقة الهندسة والتركيب.",
  caseStudiesHeading: "مشاريع وطنية تم تنفيذها في قطر",
  caseStudiesSubheading: "دراسات حالة حقيقية توضح نطاق عمل إي ثري، أرقام الحضور، ومخرجات التنفيذ المعتمدة.",
  deliverablesHeading: "مصفوفة المخرجات ونطاق التسليم",
  deliverablesSubheading: "مخرجات تعاقدية واضحة وموثقة يتم تسليمها في كل مرحلة من مراحل المشروع.",
  engagementHeading: "نماذج التعاقد والتعيين التشغيلي",
  engagementSubheading: "هياكل تعاقدية مرنة مصممة لتلبية متطلبات الجهات الحكومية وشبه الحكومية والقطاع الخاص.",
  readinessHeading: "الجاهزية المؤسسية والاعتمادات الرسمية",
  readinessSubheading: "شهادات السلامة والصحة المهنية والتأهيل المعتمد لتنفيذ كبرى المشاريع الوطنية في دولة قطر.",
  relatedSolutionsHeading: "حلول متكاملة مكملة للمشروع",
  relatedSolutionsSubheading: "خدمات وقدرات إضافية ترتبط وثيقاً بهذا التخصص لتحقيق أقصى درجات التكامل والنجاح.",

  // Empty & Fallback States
  noMediaConfigured: "لا توجد وسائط مرئية مخصصة لهذه الخدمة حالياً.",
  noCaseStudiesFound: "جاري توثيق دراسات الحالة الإضافية لهذا التخصص.",
  noGalleryItems: "جاري إعداد وتوثيق لقطات المعرض الميداني.",
  noDeliverablesFound: "يتم تفصيل وتحديد المخرجات بناءً على كراسة الشروط الخاصة بكل مشروع.",

  // Accessibility & Form Labels
  projectFormatLabel: "نوع المشروع",
  lifespanLabel: "الإطار الزمني",
  targetAudienceLabel: "الجمهور المستهدف",
  primaryObjectiveLabel: "الهدف الأساسي",
  requiredScopeLabel: "نطاق العمل المطلوب",
  recommendedBundleLabel: "حزمة التخصصات المقترحة",
  selectDiscipline: "اختر التخصص",
  stepIndicator: "الخطوة",
};

export function getServiceFrameworkLabels(locale: string): ServiceFrameworkLabels {
  return locale === "ar" ? SERVICE_LABELS_AR : SERVICE_LABELS_EN;
}
