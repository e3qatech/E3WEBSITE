/**
 * Centralized Bilingual Interface Labels for E3 Case Studies ("The Vault" Framework)
 */

export interface CaseStudyLabels {
  hero: {
    badge: { en: string; ar: string };
    title: { en: string; ar: string };
    subtitle: { en: string; ar: string };
    deliveredCountLabel: { en: string; ar: string };
    exploreCta: { en: string; ar: string };
    filterAnchorCta: { en: string; ar: string };
  };
  filters: {
    allSectors: { en: string; ar: string };
    allDisciplines: { en: string; ar: string };
    allYears: { en: string; ar: string };
    searchPlaceholder: { en: string; ar: string };
    sectorLabel: { en: string; ar: string };
    disciplineLabel: { en: string; ar: string };
    yearLabel: { en: string; ar: string };
    resetFilters: { en: string; ar: string };
    resultsCount: { en: string; ar: string };
    noResults: { en: string; ar: string };
  };
  spotlight: {
    eyebrow: { en: string; ar: string };
    verifiedPill: { en: string; ar: string };
    readCaseCta: { en: string; ar: string };
    buildBriefCta: { en: string; ar: string };
  };
  detail: {
    clientBadge: { en: string; ar: string };
    yearBadge: { en: string; ar: string };
    sectorBadge: { en: string; ar: string };
    challengeTitle: { en: string; ar: string };
    solutionTitle: { en: string; ar: string };
    resultTitle: { en: string; ar: string };
    metricsTitle: { en: string; ar: string };
    metricsSubtitle: { en: string; ar: string };
    scopeTitle: { en: string; ar: string };
    scopeSubtitle: { en: string; ar: string };
    durationLabel: { en: string; ar: string };
    scaleLabel: { en: string; ar: string };
    deliverablesLabel: { en: string; ar: string };
    galleryTitle: { en: string; ar: string };
    gallerySubtitle: { en: string; ar: string };
    beforeAfterTitle: { en: string; ar: string };
    beforeLabel: { en: string; ar: string };
    afterLabel: { en: string; ar: string };
    teamTitle: { en: string; ar: string };
    teamSubtitle: { en: string; ar: string };
    testimonialsTitle: { en: string; ar: string };
    testimonialsSubtitle: { en: string; ar: string };
    relatedServicesTitle: { en: string; ar: string };
    relatedServicesSubtitle: { en: string; ar: string };
    nextProjectTitle: { en: string; ar: string };
    includeInBriefCta: { en: string; ar: string };
    floatingBriefCta: { en: string; ar: string };
  };
}

export const CASE_STUDY_LABELS: CaseStudyLabels = {
  hero: {
    badge: {
      en: "Verified Landmark Portfolio",
      ar: "سجل المشاريع والإنجازات الوطنية",
    },
    title: {
      en: "The Vault: Proven Proof of Work in Qatar",
      ar: "سجل الإنجازات: أعمال وطنية موثقة في قطر",
    },
    subtitle: {
      en: "Explore Qatar's landmark celebrations, spatial installations, and entertainment destinations delivered under turnkey leadership.",
      ar: "استعرض مشاريعنا الوطنية المعتمدة، والتجارب الترفيهية الغامرة المنفذة بأعلى معايير الانضباط الهندسي والإبداعي في قطر.",
    },
    deliveredCountLabel: {
      en: "Delivered Landmarks",
      ar: "مشروعاً منجزاً",
    },
    exploreCta: {
      en: "Explore Case Archive",
      ar: "استكشف أرشيف المشاريع",
    },
    filterAnchorCta: {
      en: "Filter by Impact Lens",
      ar: "تصفية حسب نوع الإنجاز",
    },
  },
  filters: {
    allSectors: {
      en: "All Sectors",
      ar: "جميع القطاعات",
    },
    allDisciplines: {
      en: "All Disciplines",
      ar: "جميع التخصصات",
    },
    allYears: {
      en: "All Years",
      ar: "كافة السنوات",
    },
    searchPlaceholder: {
      en: "Search by client, landmark, or discipline...",
      ar: "ابحث بالعميل، اسم المشروع، أو التخصص...",
    },
    sectorLabel: {
      en: "Sector",
      ar: "القطاع",
    },
    disciplineLabel: {
      en: "Discipline",
      ar: "التخصص الهندسي",
    },
    yearLabel: {
      en: "Year",
      ar: "سنة التنفيذ",
    },
    resetFilters: {
      en: "Clear All Filters",
      ar: "إعادة ضبط الفلاتر",
    },
    resultsCount: {
      en: "Verified Projects",
      ar: "مشاريع معتمدة",
    },
    noResults: {
      en: "No verified projects match the selected criteria.",
      ar: "لا توجد مشاريع تطابق معايير البحث المحددة حالياً.",
    },
  },
  spotlight: {
    eyebrow: {
      en: "Landmark Spotlight",
      ar: "مشروع بارز في الصدارة",
    },
    verifiedPill: {
      en: "Verified Execution",
      ar: "تنفيذ موثق ومعتمد",
    },
    readCaseCta: {
      en: "Explore Full Case Study",
      ar: "استعراض تفاصيل دراسة الحالة",
    },
    buildBriefCta: {
      en: "Build Brief with this Scope",
      ar: "بناء موجز مشروع بهذا النطاق",
    },
  },
  detail: {
    clientBadge: {
      en: "Client & Authority",
      ar: "الجهة والعميل",
    },
    yearBadge: {
      en: "Delivered Year",
      ar: "سنة التسليم",
    },
    sectorBadge: {
      en: "Industry Sector",
      ar: "القطاع",
    },
    challengeTitle: {
      en: "The Strategic Challenge",
      ar: "التحدي الاستراتيجي والمتطلبات",
    },
    solutionTitle: {
      en: "The Engineering Solution",
      ar: "الحل الهندسي والابتكار التنفيذي",
    },
    resultTitle: {
      en: "The Measurable Outcome",
      ar: "النتائج التشغيلية والأثر المحقق",
    },
    metricsTitle: {
      en: "Verified Impact & Working Metrics",
      ar: "مؤشرات الأداء والأثر المعتمد",
    },
    metricsSubtitle: {
      en: "Audited delivery numbers, visitor throughput, and operational metrics.",
      ar: "أرقام تشغيلية وإحصائيات حضور وأثر معتمدة تم توثيقها ميدانياً.",
    },
    scopeTitle: {
      en: "Turnkey Scope & Phased Delivery",
      ar: "نطاق العمل المتكامل ومراحل التنفيذ",
    },
    scopeSubtitle: {
      en: "Exact scope boundaries, delivery timeline, and technical execution disciplines.",
      ar: "مواصفات نطاق العمل، والجدول الزمني ومسؤوليات التسليم المباشر.",
    },
    durationLabel: {
      en: "Execution Timeline",
      ar: "المدة الزمنية للتنفيذ",
    },
    scaleLabel: {
      en: "Project Scale / Capacity",
      ar: "حجم المشروع والطاقة الاستيعابية",
    },
    deliverablesLabel: {
      en: "Core Turnkey Deliverables",
      ar: "المخرجات والتسليمات الرئيسية",
    },
    galleryTitle: {
      en: "Visual Proof & Behind the Build",
      ar: "التوثيق البصري وكواليس التنفيذ",
    },
    gallerySubtitle: {
      en: "High-resolution project imagery, fabrication milestones, and live operational captures.",
      ar: "صور عالية الدقة توثق مراحل التصنيع، الإنتاج الميداني، والتفاعل الحي للزوار.",
    },
    beforeAfterTitle: {
      en: "Spatial Transformation (Before & After)",
      ar: "التحول المكاني (قبل وبعد التنفيذ)",
    },
    beforeLabel: {
      en: "Before / Initial Site",
      ar: "قبل التنفيذ / الموقع الأولي",
    },
    afterLabel: {
      en: "After / Live Activation",
      ar: "بعد التنفيذ / التشغيل الحي",
    },
    teamTitle: {
      en: "Behind the Build: Project Leadership",
      ar: "كواليس التنفيذ: القيادة وفريق العمل",
    },
    teamSubtitle: {
      en: "Meet the senior producers, technical directors, and specialists behind this delivery.",
      ar: "تعرف على مديري الإنتاج، المشرفين التقنيين والمهندسين الذين قادوا المشروع.",
    },
    testimonialsTitle: {
      en: "Client & Stakeholder Endorsements",
      ar: "شهادات العملاء والجهات المعنية",
    },
    testimonialsSubtitle: {
      en: "Direct feedback from government entities, private developers, and event organizers.",
      ar: "آراء موثقة من ممثلي الجهات الحكومية والشركاء والمطورين.",
    },
    relatedServicesTitle: {
      en: "Integrated Disciplines Used in this Project",
      ar: "التخصصات الهندسية المطبقة في هذا المشروع",
    },
    relatedServicesSubtitle: {
      en: "Explore the specific E3 services that powered this landmark delivery.",
      ar: "استكشف خدمات وقدرات إي ثري التخصصية التي ساهمت في إنجاح هذا المشروع.",
    },
    nextProjectTitle: {
      en: "Continue Exploring Landmark Case Studies",
      ar: "استكمل استعراض سجل المشاريع الوطنية",
    },
    includeInBriefCta: {
      en: "Build Brief with this Discipline",
      ar: "بناء موجز مشروع بهذا التخصص",
    },
    floatingBriefCta: {
      en: "Build Your Project Brief",
      ar: "بناء موجز مشروعك",
    },
  },
};
