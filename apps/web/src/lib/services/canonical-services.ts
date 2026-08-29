/**
 * E3 Enterprise Canonical Services Taxonomy & Verification Layer
 * 
 * Strict Content Integrity Standards:
 * - 10 Canonical Service Disciplines with alias resolution.
 * - Verified metrics, proof points, and working practices only.
 * - WOW & HOW dual storytelling device.
 * - Configurable deliverables, engagement models, and 6-stage lifecycle.
 * - Service-specific unique modules.
 */

export interface VerifiedProofPoint {
  value: string;
  labelEn: string;
  labelAr: string;
  sourceEn?: string;
  sourceAr?: string;
  isVerified?: boolean;
}

export interface WowHowItem {
  id: string;
  titleEn: string;
  titleAr: string;
  wowEn: string;
  wowAr: string;
  howEn: string;
  howAr: string;
}

export interface ServiceObjective {
  id: string;
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
  highlightedCapabilityIds: string[];
  recommendedDeliverableIds: string[];
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
  iconName?: string;
  tagEn?: string;
  tagAr?: string;
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

export type LifecycleStageId = 'discover' | 'design' | 'develop' | 'deliver' | 'operate' | 'measure';

export interface LifecycleStage {
  id: LifecycleStageId;
  stageNumber: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  outputsEn: string[];
  outputsAr: string[];
}

export type ServiceModuleType =
  | 'scale-explorer'          // Mega Events: Scale, Audience & Production Complexity
  | 'fec-lifecycle'           // FEC Development: Design → Build → Operate Lifecycle
  | 'kids-age-matrix'         // Kids' Concepts: Age groups, learning goals & activity formats
  | 'activation-mapper'       // Experiential Activations: Objective, interaction & engagement mapping
  | 'performance-catalogue'   // Shows: Performance catalogue & technical-rider request
  | 'av-venue-selector'       // AV & Stage: Venue-scale & equipment-requirement selector
  | 'operations-sop-model'    // Operations Support: Staffing structure, SOPs & reporting model
  | 'ticketing-flow'          // Ticketing: BookingQube journey, integrations & demo request
  | 'fabrication-materials'   // Fabrication: Materials, finishes & fabrication-stage gallery
  | 'research-study-gates';   // Feasibility & Research: Study outputs, decision gates & sample report

export interface ServiceSpecificModuleConfig {
  type: ServiceModuleType;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  data: any;
}

export interface EnterpriseReadinessItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  badgeEn?: string;
  badgeAr?: string;
}

export interface ServiceGalleryItemPayload {
  id: string;
  url: string;
  mediaUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  captionEn?: string;
  captionAr?: string;
  titleEn?: string;
  titleAr?: string;
  orderIndex?: number;
  isVisible?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export interface CanonicalService {
  id: string;
  slug: string;
  aliases: string[];
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  taglineEn: string;
  taglineAr: string;
  heroOutcomeEn: string;
  heroOutcomeAr: string;
  supportingStatementEn: string;
  supportingStatementAr: string;
  heroMediaUrl?: string;
  heroMediaType?: 'IMAGE' | 'VIDEO';
  mobileHeroMediaUrl?: string;
  videoPosterUrl?: string;
  ctaPrimary?: string;
  ctaPrimaryTextEn?: string;
  ctaPrimaryTextAr?: string;
  ctaPrimaryUrl?: string;
  ctaSecondary?: string;
  ctaSecondaryTextEn?: string;
  ctaSecondaryTextAr?: string;
  ctaSecondaryUrl?: string;
  verifiedProofPoints: VerifiedProofPoint[];
  wowHow: WowHowItem[];
  objectives: ServiceObjective[];
  capabilities: CapabilityBentoItem[];
  engagementModels: EngagementModel[];
  deliverables: DeliverableCategory[];
  lifecycleStages: LifecycleStage[];
  serviceSpecificModule: ServiceSpecificModuleConfig;
  enterpriseReadiness: EnterpriseReadinessItem[];
  relatedServiceSlugs: string[];
  relatedCaseStudySlugs?: string[];
  relatedServicesNarrativeEn?: string;
  relatedServicesNarrativeAr?: string;
  sectionVisibility?: Record<string, boolean>;
  sectionOrdering?: string[];
  galleryItems?: ServiceGalleryItemPayload[];
}

export const CANONICAL_SERVICES: CanonicalService[] = [
  // 1. MEGA EVENTS & END-TO-END PRODUCTION
  {
    id: "mega-events",
    slug: "mega-events",
    aliases: ["event-engineering", "events-production", "events"],
    titleEn: "Mega Events & End-to-End Production",
    titleAr: "الفعاليات الكبرى والإنتاج الشامل",
    categoryEn: "Events & Festivals",
    categoryAr: "الفعاليات والمهرجانات",
    taglineEn: "Turnkey masterplanning, spatial design, and live execution for Qatar's landmark celebrations.",
    taglineAr: "تخطيط شامل وتصميم فضائي وإنتاج حي للاحتفالات والمهرجانات الكبرى في قطر.",
    heroOutcomeEn: "Flawless Live Execution for Thousands of Guests with Zero Creative Compromise.",
    heroOutcomeAr: "تنفيذ حي استثنائي لآلاف الزوار بأعلى معايير الإبداع والانضباط التشغيلي.",
    supportingStatementEn: "From initial concept modeling and authority coordination to live show calling and multi-acre site management, E3 delivers national-scale events under one unified leadership team.",
    supportingStatementAr: "من النمذجة الإبداعية والتنسيق مع الجهات المعنية إلى إدارة العرض المباشر والعمليات الميدانية، تقدم إي ثري الفعاليات الوطنية تحت قيادة موحدة.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "500,000+",
        labelEn: "Live Guests Hosted",
        labelAr: "زائر تمت استضافتهم في الفعاليات",
        sourceEn: "Verified landmark public event registrations",
        sourceAr: "سجلات الفعاليات الجماهيرية المعتمدة"
      },
      {
        value: "45-Day",
        labelEn: "Fast-Track Mobilization",
        labelAr: "جاهزية تشغيلية سريعة",
        sourceEn: "Verified multi-acre site builds in Qatar",
        sourceAr: "مشاريع سريعة الإنجاز في قطر"
      },
      {
        value: "100%",
        labelEn: "In-House Qatar Atelier",
        labelAr: "إنتاج وتصنيع محلي متكامل",
        sourceEn: "Doha-based creative & engineering teams",
        sourceAr: "فرق تصميم وهندسة مقيمة في الدوحة"
      }
    ],
    wowHow: [
      {
        id: "m-1",
        titleEn: "Landmark Audience Immersion",
        titleAr: "إبهار جماهيري استثنائي",
        wowEn: "Audiences experience synchronized kinetic lighting, sweeping 360-degree soundscapes, and grand architectural stages that feel larger than life.",
        wowAr: "يعيش الزوار تجربة غامرة مع إضاءة حركية متزامنة، وأنظمة صوتية محيطية، ومسارح معمارية ضخمة تترك أثراً لا يُنسى.",
        howEn: "E3 engineers precise load calculations, dual-redundant show control servers, computational acoustic modeling, and rigorous safety-barrier simulations.",
        howAr: "تقوم إي ثري بحسابات الأحمال الإنشائية، وأنظمة التحكم المزدوجة المانعة للأعطال، والنمذجة الصوتية الدقيقة، ومحاكاة مسارات السلامة."
      },
      {
        id: "m-2",
        titleEn: "Seamless Crowd Flow & Hospitality",
        titleAr: "انسيابية حركة الحشود والضيافة",
        wowEn: "Thousands of families, VIPs, and international delegates move effortlessly between entrance portals, activation zones, and seating arenas.",
        wowAr: "تتحرك آلاف العائلات والوفود الرسمية بسهولة وسلاسة بين بوابات الدخول ومناطق التفاعل ومدرجات المشاهدة.",
        howEn: "We deploy real-time digital density mapping, designated VIP corridors, fast-throughput access gates, and trained multilingual hospitality liaisons.",
        howAr: "نوظف خرائط الكثافة الرقمية اللحظية، ومسارات كبار الشخصيات، وبوابات الدخول السريعة، وكوادر ضيافة مدربة متعددة اللغات."
      }
    ],
    objectives: [
      {
        id: "obj-national-day",
        labelEn: "Deliver a National Celebration or Public Festival",
        labelAr: "تنظيم احتفال وطني أو مهرجان جماهيري",
        descriptionEn: "High-throughput masterplanning with cultural resonance, safety clearances, and immersive production.",
        descriptionAr: "تخطيط واسع النطاق يراعي الهوية الثقافية والتراخيص الأمنية وأعلى تقنيات الإنتاج.",
        highlightedCapabilityIds: ["cap-masterplanning", "cap-live-calling", "cap-authority-liaison"],
        recommendedDeliverableIds: ["del-preprod", "del-production"]
      },
      {
        id: "obj-corporate-summit",
        labelEn: "Execute an Executive Summit or Mega Launch",
        labelAr: "تنفيذ قمة تنفيذية أو إطلاق استراتيجي",
        descriptionEn: "Precision staging, VIP protocol management, bespoke architectural fabrication, and broadcast feeds.",
        descriptionAr: "منصات عرض متقدمة، بروتوكولات كبار الشخصيات، وتصنيع معماري مخصص وتغطية بث مباشر.",
        highlightedCapabilityIds: ["cap-live-calling", "cap-spatial-design"],
        recommendedDeliverableIds: ["del-production", "del-post"]
      }
    ],
    capabilities: [
      {
        id: "cap-masterplanning",
        titleEn: "Event Masterplanning & Spatial Zoning",
        titleAr: "المخطط العام للفعالية والتوزيع المكاني",
        descriptionEn: "Complete spatial layout, pedestrian circulation modeling, emergency egress mapping, and multi-zone infrastructure planning.",
        descriptionAr: "تصميم المخطط الفضائي، ونمذجة تدفق المشاة، وتحديد مسارات الطوارئ، وتوزيع البنية التحتية.",
        deliverablesEn: ["Master Site CAD/BIM Layout", "Capacity & Egress Calculation", "Zoning Master Schedule"],
        deliverablesAr: ["مخطط الموقع الهندسي CAD/BIM", "حسابات الطاقة الاستيعابية والإخلاء", "جدول توزيع المناطق"],
        suitableForEn: ["Outdoor Boulevards", "Public Parks", "Arena Grounds"],
        suitableForAr: ["الشوارع والساحات المفتوحة", "الحدائق العامة", "المجمعات الرياضية"],
        tagEn: "Spatial Strategy",
        tagAr: "التخطيط الفضائي",
        colSpan: 2
      },
      {
        id: "cap-live-calling",
        titleEn: "Show Calling & Production Direction",
        titleAr: "إدارة العرض المباشر والإنتاج الفني",
        descriptionEn: "Senior stage managers, multi-camera broadcast switching, SMPTE timecode sync, and live performance coordination.",
        descriptionAr: "إدارة المسرح والإنتاج، ومزامنة التايم كود الزمني، والتنسيق الفني للعروض الحية.",
        deliverablesEn: ["Minute-by-Minute Run of Show", "Technical Rider Validation", "Show Calling Roster"],
        deliverablesAr: ["جدول العرض دقيقة بدقيقة", "اعتماد المتطلبات الفنية", "طاقم مديري العرض"],
        suitableForEn: ["Ceremonies", "Concerts", "Keynotes"],
        suitableForAr: ["الاحتفالات الرسمية", "الحفلات الموسيقية", "المؤتمرات"],
        tagEn: "Show Control",
        tagAr: "إدارة العرض"
      },
      {
        id: "cap-authority-liaison",
        titleEn: "Authority Clearances & HSE Coordination",
        titleAr: "التراخيص الحكومية والسلامة والصحة المهنية",
        descriptionEn: "Direct liaison with Civil Defence, Ministry approvals, environmental health guidelines, and third-party engineering certifications.",
        descriptionAr: "التنسيق مع الدفاع المدني والجهات الحكومية واعتماد شهادات السلامة الهندسية المعتمدة.",
        deliverablesEn: ["Comprehensive HSE Plan", "Method Statements & Risk Assessments (RAMS)", "Civil Defence Submission Dossier"],
        deliverablesAr: ["خطة السلامة والصحة الشاملة", "بيانات العمل وتقييم المخاطر", "ملف التراخيص والدفاع المدني"],
        suitableForEn: ["All Public & Private Gatherings"],
        suitableForAr: ["كافة الفعاليات العامة والخاصة"],
        tagEn: "Compliance",
        tagAr: "الامتثال والتراخيص"
      }
    ],
    engagementModels: [
      {
        id: "eng-turnkey",
        titleEn: "Turnkey Event Delivery",
        titleAr: "التنفيذ الشامل المتكامل (Turnkey)",
        subtitleEn: "Single Point of Responsibility",
        subtitleAr: "مسؤولية متكاملة من البداية للنهاية",
        descriptionEn: "E3 assumes 100% accountability from creative concept to post-event teardown, managing all design, build, technical, and staffing streams.",
        descriptionAr: "تتولى إي ثري المسؤولية الكاملة من الفكرة الإبداعية إلى تفكيك الموقع، شاملة كافة العمليات والتصنيع والإدارة.",
        bestForEn: "Large festivals, national ceremonies, multi-day public events",
        bestForAr: "المهرجانات الكبرى، الاحتفالات الوطنية، والفعاليات الجماهيرية",
        typicalDurationEn: "6 to 24 Weeks",
        typicalDurationAr: "٦ إلى ٢٤ أسبوعاً"
      },
      {
        id: "eng-production-partner",
        titleEn: "Technical Production & Staging Partner",
        titleAr: "الشريك الفني والإنتاجي للمسارح",
        subtitleEn: "Specialist Co-Delivery",
        subtitleAr: "شريك متخصص في التنفيذ الفني",
        descriptionEn: "Working alongside client creative agencies to engineer stage fabrications, kinetic AV, audio-visual grids, and on-site technical direction.",
        descriptionAr: "العمل مع الوكالات الإبداعية للعميل لتنفيذ هياكل المسارح، والأنظمة الصوتية والضوئية، والإشراف الفني الميداني.",
        bestForEn: "Conferences, touring shows, brand launches with existing creative",
        bestForAr: "المؤتمرات، العروض المتنقلة، وإطلاق المنتجات ذات الهوية الجاهزة",
        typicalDurationEn: "3 to 12 Weeks",
        typicalDurationAr: "٣ إلى ١٢ أسبوعاً"
      }
    ],
    deliverables: [
      {
        id: "del-preprod",
        titleEn: "Pre-Production & Engineering",
        titleAr: "مرحلة ما قبل الإنتاج والهندسة",
        itemsEn: [
          "Concept 3D Renders & Walkthrough Simulations",
          "Architectural & Structural CAD Drawings",
          "Production Timeline & Critical Path Schedule",
          "Risk Assessment & Method Statement (RAMS)"
        ],
        itemsAr: [
          "تصاميم ثلاثية الأبعاد ومحاكاة بصرية كاملة",
          "المخططات المعمارية والإنشائية بصيغة CAD",
          "الجدول الزمني ومسار العمل الحرج للإنتاج",
          "تقييم المخاطر وبيانات منهجية العمل (RAMS)"
        ]
      },
      {
        id: "del-production",
        titleEn: "Live Execution & Operations",
        titleAr: "التنفيذ الحي والتشغيل الميداني",
        itemsEn: [
          "Fully Fabricated & Certified Stage Environments",
          "Multi-Zone Audio, Lighting & Video Systems",
          "Live Show Calling Team & Dedicated Stage Management",
          "On-Site Redundancy & Emergency Power Grids"
        ],
        itemsAr: [
          "بيئات مسرحية مصنعة ومعتمدة إنشائياً",
          "أنظمة صوت وإضاءة وشاشات فيديو متعددة المناطق",
          "فريق إدارة العرض المباشر والتحكم الفني",
          "أنظمة طاقة احتياطية ومولدات مزدوجة مانعة للانقطاع"
        ]
      },
      {
        id: "del-post",
        titleEn: "Post-Event & Reporting",
        titleAr: "ما بعد الفعالية وإغلاق المشروع",
        itemsEn: [
          "Site Reinstatement & Handover Certification",
          "Attendance, Footfall & Incident Reports",
          "Archival 4K Photo & Video Media Package"
        ],
        itemsAr: [
          "إعادة تأهيل الموقع وتسليمه رسمياً",
          "تقارير الحضور والإقبال وسجلات العمليات",
          "حزمة توثيق فوتوغرافي وفيديو بجودة عالية"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Discover & Feasibility",
        titleAr: "الاستكشاف والجدوى",
        descriptionEn: "Audience demographic analysis, site surveys, environmental factors, and baseline capacity modeling.",
        descriptionAr: "تحليل طبيعة الجمهور، والمعاينة الميدانية للموقع، وتحديد الطاقة الاستيعابية الأساسية.",
        outputsEn: ["Site Feasibility Matrix", "Initial Creative Direction"],
        outputsAr: ["مصفوفة جدوى الموقع", "التوجه الإبداعي المبدئي"]
      },
      {
        id: "design",
        stageNumber: "02",
        titleEn: "Design & Spatial BIM",
        titleAr: "التصميم والنمذجة المكانية",
        descriptionEn: "3D visual storytelling, acoustic simulation, structural calculations, and authority permit filings.",
        descriptionAr: "التصميم الإبداعي ثلاثي الأبعاد، والمحاكاة الصوتية، والحسابات الإنشائية وملفات التراخيص.",
        outputsEn: ["Full 3D Visual Dossier", "Permit Clearance Package"],
        outputsAr: ["ملف التصاميم ثلاثية الأبعاد", "حزمة مستندات التراخيص"]
      },
      {
        id: "develop",
        stageNumber: "03",
        titleEn: "Fabricate & Rehearse",
        titleAr: "التصنيع والبروفات",
        descriptionEn: "Precision manufacturing in E3's Doha atelier, timecode programming, and safety dry-runs.",
        descriptionAr: "التصنيع في ورش إي ثري بالدوحة، وبرمجة الأنظمة الزمنية، والتجارب التشغيلية.",
        outputsEn: ["Off-Site Quality Check", "Show Control Program"],
        outputsAr: ["فحص الجودة المسبق", "برمجة أنظمة التحكم"]
      },
      {
        id: "deliver",
        stageNumber: "04",
        titleEn: "Live Execution",
        titleAr: "التنفيذ الحي",
        descriptionEn: "Flawless live show calling, real-time crowd telemetry, and rapid-response technical director oversight.",
        descriptionAr: "إدارة احترافية للعرض الحي، ومراقبة حركة الحشود، وإشراف مباشر من مديري الإنتاج.",
        outputsEn: ["Flawless Live Show", "Real-Time Telemetry Logs"],
        outputsAr: ["عرض حي منضبط", "سجلات العمليات اللحظية"]
      },
      {
        id: "measure",
        stageNumber: "05",
        titleEn: "Debrief & Reinstatement",
        titleAr: "التقييم وتسليم الموقع",
        descriptionEn: "Site teardown, post-event analytics, stakeholder reporting, and archival asset delivery.",
        descriptionAr: "تفكيك الموقع بأمان، وتحليل النتائج والإقبال، وتقديم التقارير النهائية للشركاء.",
        outputsEn: ["Final Debrief Dossier", "Site Handover Certificate"],
        outputsAr: ["ملف التقييم الختامي", "شهادة تسليم الموقع"]
      }
    ],
    serviceSpecificModule: {
      type: "scale-explorer",
      titleEn: "Scale & Complexity Explorer",
      titleAr: "مستكشف حجم الفعالية ودرجة التعقيد",
      subtitleEn: "Select your project scale to see typical production requirements and timelines.",
      subtitleAr: "اختر نطاق فعاليتك للتعرف على المتطلبات الفنية والجدول الزمني المعتاد.",
      data: {
        scales: [
          {
            id: "boutique",
            labelEn: "Executive / Gala (Up to 1,000 Guests)",
            labelAr: "فعاليات كبار الشخصيات (حتى ١,٠٠٠ ضيف)",
            leadTimeEn: "3 - 6 Weeks",
            leadTimeAr: "٣ - ٦ أسابيع",
            featuresEn: ["Bespoke Scenic Carpentry", "Intimate High-CRI Lighting", "VIP Host Concierge", "Ultra-Low Noise Generators"],
            featuresAr: ["تصنيع ديكورات مخصصة", "إضاءة راقية عالية الوضوح", "طواقم ضيافة لكبار الشخصيات", "مولدات كهربائية فائقة الهدوء"]
          },
          {
            id: "arena",
            labelEn: "Arena / Festival (1,000 - 15,000 Guests)",
            labelAr: "المهرجانات والمجمعات (١,٠٠٠ - ١٥,٠٠٠ ضيف)",
            leadTimeEn: "6 - 12 Weeks",
            leadTimeAr: "٦ - ١٢ أسبوعاً",
            featuresEn: ["Heavy-Duty Ground Support Staging", "Line-Array Audio Grids", "Multi-Gate RFID Access", "Dedicated Civil Defence Liaisons"],
            featuresAr: ["مسارح أرضية ذات أحمال ثقيلة", "أنظمة صوتية موزعة line-array", "بوابات دخول ذكية RFID", "تنسيق مخصص مع الدفاع المدني"]
          },
          {
            id: "landmark",
            labelEn: "National Landmark / Stadium (15,000+ Guests)",
            labelAr: "الفعاليات الوطنية الكبرى (أكثر من ١٥,٠٠٠ ضيف)",
            leadTimeEn: "12 - 24 Weeks",
            leadTimeAr: "١٢ - ٢٤ أسبوعاً",
            featuresEn: ["Multi-Acre Spatial Masterplanning", "360-Degree Broadcast Feeds", "Dual-Redundant Power Substations", "Real-Time Crowd Density Radar"],
            featuresAr: ["تخطيط فضائي للمواقع المفتوحة", "تغطية بث مباشر ٣٦٠ درجة", "محطات طاقة كهربائية مزدوجة", "مراقبة لحظية لكثافة الحشود"]
          }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "hse-1",
        titleEn: "Formal HSE & RAMS Documentation",
        titleAr: "توثيق السلامة والصحة المهنية (RAMS)",
        descriptionEn: "Every project includes certified Risk Assessments, Safe Working Method Statements, and structural engineer load calculations.",
        descriptionAr: "يتضمن كل مشروع تقييمات مخاطر معتمدة، وبيانات منهجية للعمل الآمن، وشهادات أحمال هندسية معتمدة."
      },
      {
        id: "auth-1",
        titleEn: "Direct Qatar Authority Permitting",
        titleAr: "استخراج التراخيص والتنسيق الحكومي",
        descriptionEn: "Established protocols with Qatar Civil Defence, Ministry of Interior, Municipalities, and relevant regulatory bodies.",
        descriptionAr: "إجراءات عمل معتمدة مع الدفاع المدني ووزارة الداخلية والبلديات والجهات التنظيمية في قطر."
      }
    ],
    relatedServiceSlugs: ["shows-performances", "av-stage-rentals", "fabrication-branding", "attraction-operations", "ticketing-solutions"]
  },

  // 2. FAMILY ENTERTAINMENT CENTRE DEVELOPMENT
  {
    id: "family-entertainment-centers",
    slug: "family-entertainment-centers",
    aliases: ["fec", "fec-development", "fec-design", "family-entertainment-center"],
    titleEn: "Family Entertainment Centre Development",
    titleAr: "تطوير مراكز الترفيه العائلي",
    categoryEn: "Venues & Attractions",
    categoryAr: "المراكز والوجهات الترفيهية",
    taglineEn: "Comprehensive masterplanning, attraction curation, turnkey fit-out, and commercial operations for FECs.",
    taglineAr: "تخطيط شامل واختيار الألعاب والتجهيز المتكامل والتشغيل التجاري لمراكز الترفيه العائلي.",
    heroOutcomeEn: "High-Yield Family Entertainment Venues Designed for Longevity and Repeat Visitation.",
    heroOutcomeAr: "وجهات ترفيه عائلية عالية المردود مصممة لضمان استدامة الزيارات وولاء العائلات.",
    supportingStatementEn: "E3 guides developers and retail destinations from concept feasibility and zoning to attraction procurement, thematic interior build, and day-to-day venue management.",
    supportingStatementAr: "تقود إي ثري المطورين والوجهات التجارية من دراسات الجدوى واختيار الألعاب إلى التصنيع الداخلي والتشغيل اليومي للمركز.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "Turnkey",
        labelEn: "Design-to-Operate Model",
        labelAr: "نموذج متكامل من التصميم للتشغيل",
        sourceEn: "Proven commercial FEC delivery in Qatar",
        sourceAr: "مراكز ترفيهية قائمة في قطر"
      },
      {
        value: "Zero-Gap",
        labelEn: "Integrated Retail Synergy",
        labelAr: "تكامل مع حركة التسوق في المول",
        sourceEn: "Footfall optimization for retail landlords",
        sourceAr: "رفع معدلات الإقبال للمجمعات التجارية"
      },
      {
        value: "Full Safety",
        labelEn: "EN/ASTM Attraction Standards",
        labelAr: "معايير سلامة عالمية معتمدة",
        sourceEn: "Safety-certified play equipment sourcing",
        sourceAr: "معدات ألعاب مطابقة للمواصفات الدولية"
      }
    ],
    wowHow: [
      {
        id: "fec-1",
        titleEn: "Captivating Thematic Environments",
        titleAr: "بيئات ترفيهية غامرة ومميزة",
        wowEn: "Families enter an imaginative, sensory-rich playground where custom lighting, tactile materials, and themed zones keep children engaged for hours.",
        wowAr: "تدخل العائلات عالماً تفاعلياً غنياً بالمؤثرات الحسية والمواد الآمنة والمناطق المصممة لإسعاد الأطفال لساعات.",
        howEn: "E3 masterplans clear sightlines for parents, acoustic dampening, durable commercial-grade materials, and modular attraction zones.",
        howAr: "نصمم خطوط رؤية مريحة لأولياء الأمور، وعزل الصوت، واستخدام مواد تجارية متينة، وتقسيم مرن لمناطق الألعاب."
      },
      {
        id: "fec-2",
        titleEn: "Seamless Guest Flow & Secondary Spend",
        titleAr: "انسيابية التشغيل والمبيعات الإضافية",
        wowEn: "Parents enjoy comfortable café vantage points, effortless cashless digital wristbands, and easy birthday party hosting.",
        wowAr: "يستمتع الآباء بمقاهٍ مريحة تطل على الألعاب، وسوار رقمي للدفع السهل، وحجوزات سلسة لأعياد الميلاد.",
        howEn: "We integrate POS and BookingQube ticketing, staff rotation matrices, optimized F&B kitchen workflows, and party room scheduling engines.",
        howAr: "ندمج نقاط البيع مع نظام تذاكر BookingQube، وجداول مناوبات الكوادر، وتدفقات الضيافة والمطاعم، وغرف الاحتفالات."
      }
    ],
    objectives: [
      {
        id: "obj-mall-anchor",
        labelEn: "Develop a New Mall Entertainment Anchor",
        labelAr: "تطوير وجهة ترفيه رئيسية داخل مجمع تجاري",
        descriptionEn: "High-density family attraction designed to drive retail footfall and recurring seasonal memberships.",
        descriptionAr: "وجهة ترفيه عائلية تجذب المتسوقين وتدعم الاشتراكات الدورية وزيارات المجمعات التجارية.",
        highlightedCapabilityIds: ["cap-fec-masterplanning", "cap-fec-procurement", "cap-fec-fitout"],
        recommendedDeliverableIds: ["del-fec-concept", "del-fec-build"]
      },
      {
        id: "obj-venue-retrofit",
        labelEn: "Upgrade or Re-Concept an Existing FEC",
        labelAr: "تحديث أو إعادة تصميم مركز ترفيهي قائم",
        descriptionEn: "Refreshed game zoning, enhanced spatial theming, digital ticketing upgrades, and improved operational efficiency.",
        descriptionAr: "تحديث توزيع الألعاب، وتحسين الديكورات، وترقية بوابات التذاكر الرقمية ورفع كفاءة التشغيل.",
        highlightedCapabilityIds: ["cap-fec-fitout", "cap-fec-operations"],
        recommendedDeliverableIds: ["del-fec-build", "del-fec-ops"]
      }
    ],
    capabilities: [
      {
        id: "cap-fec-masterplanning",
        titleEn: "Concept & Spatial Masterplanning",
        titleAr: "التخطيط العام وتصميم المفهوم",
        descriptionEn: "Theme development, capacity modeling, retail adjacency planning, and parent-child sightline engineering.",
        descriptionAr: "تطوير الثيمة، وحساب الطاقة الاستيعابية، والتنسيق مع المتاجر المحيطة، وهندسة خطوط الرؤية.",
        deliverablesEn: ["Thematic Concept Book", "BIM Architectural Layout", "Flow & Capacity Study"],
        deliverablesAr: ["كتيب المفهوم الإبداعي", "المخططات المعمارية BIM", "دراسة التدفق والطاقة الاستيعابية"],
        suitableForEn: ["Shopping Malls", "Stand-Alone Pavilions", "Mixed-Use Resorts"],
        suitableForAr: ["المجمعات التجارية", "المباني المستقلة", "المنتجعات متعددة الاستخدامات"],
        tagEn: "Masterplanning",
        tagAr: "التخطيط الفضائي",
        colSpan: 2
      },
      {
        id: "cap-fec-procurement",
        titleEn: "Attraction Sourcing & Certification",
        titleAr: "توريد الألعاب واعتماد شهادات السلامة",
        descriptionEn: "Direct procurement of international-standard play structures, inflatables, and soft play with ASTM/EN certifications.",
        descriptionAr: "توريد هياكل الألعاب الترفيهية والمطاطية واللعب الآمن المطابقة للمواصفات القياسية ASTM/EN.",
        deliverablesEn: ["Equipment Spec Dossier", "Safety & Compliance Certificates", "Maintenance Manuals"],
        deliverablesAr: ["ملف مواصفات المعدات", "شهادات السلامة والامتثال", "كتيبات الصيانة الدورية"],
        suitableForEn: ["Indoor Playgrounds", "Trampoline Parks", "Adventure Hubs"],
        suitableForAr: ["الملاعب المغلقة", "صالات الترامبولين", "مراكز المغامرات"],
        tagEn: "Equipment",
        tagAr: "المعدات والألعاب"
      },
      {
        id: "cap-fec-fitout",
        titleEn: "Turnkey Thematic Fit-Out & Fabrication",
        titleAr: "التجهيز الداخلي والتصنيع الفضائي",
        descriptionEn: "In-house manufacturing of thematic facades, acoustic paneling, customized party rooms, reception desks, and safety padding.",
        descriptionAr: "تصنيع الواجهات الديكورية، والعوازل الصوتية، وغرف الاحتفالات المخصصة، ومكاتب الاستقبال ومصدات الأمان.",
        deliverablesEn: ["Fabrication Drawings", "Material Sample Boards", "Turnkey Fit-Out Execution"],
        deliverablesAr: ["مخططات التصنيع التنفيذية", "عينات المواد والتشطيبات", "التجهيز الداخلي المتكامل"],
        suitableForEn: ["Commercial Retail Spaces"],
        suitableForAr: ["المساحات التجارية"],
        tagEn: "Fit-Out",
        tagAr: "التجهيز والتصنيع"
      }
    ],
    engagementModels: [
      {
        id: "eng-fec-design-build",
        titleEn: "Design & Build (Turnkey Delivery)",
        titleAr: "التصميم والتنفيذ الشامل (Design & Build)",
        subtitleEn: "Concept to Grand Opening",
        subtitleAr: "من الفكرة حتى الافتتاح الرسمي",
        descriptionEn: "E3 handles all architectural design, attraction sourcing, municipal permits, interior fit-out, and initial launch marketing.",
        descriptionAr: "تتولى إي ثري التصميم المعماري، وتوريد الألعاب، والتراخيص، والتنفيذ الداخلي، والحملة التسويقية للافتتاح.",
        bestForEn: "Developers and mall owners seeking a complete venue solution",
        bestForAr: "المطورون والمجمعات الراغبون في مشروع متكامل وجاهز للتشغيل",
        typicalDurationEn: "16 to 36 Weeks",
        typicalDurationAr: "١٦ إلى ٣٦ أسبوعاً"
      },
      {
        id: "eng-fec-operator",
        titleEn: "Long-Term Operating Partnership",
        titleAr: "شراكة التشغيل والإدارة طويلة المدى",
        subtitleEn: "Operations & Revenue Management",
        subtitleAr: "إدارة العمليات والإيرادات المستدامة",
        descriptionEn: "E3 manages staffing, daily maintenance, safety audits, marketing campaigns, and ticketing under a performance-based partnership.",
        descriptionAr: "تدير إي ثري الكوادر البشرية، والصيانة الدورية، وتدقيق السلامة، والتسويق والتذاكر بنموذج شراكة مبني على الأداء.",
        bestForEn: "Landlords wanting passive entertainment yield with expert operations",
        bestForAr: "أصحاب العقارات الراغبون في عوائد مستدامة بقيادة تشغيلية محترفة",
        typicalDurationEn: "1 to 5 Year Contracts",
        typicalDurationAr: "عقود من سنة إلى ٥ سنوات"
      }
    ],
    deliverables: [
      {
        id: "del-fec-concept",
        titleEn: "Strategy & Masterplan",
        titleAr: "الاستراتيجية والمخطط العام",
        itemsEn: [
          "Commercial Feasibility & Revenue Modeling",
          "Thematic Narrative & 3D Spatial Walkthroughs",
          "Attraction Mix & Capacity Sizing Plan"
        ],
        itemsAr: [
          "دراسة الجدوى المالية وتوقعات الإيرادات",
          "المفهوم الإبداعي وجولات المحاكاة ثلاثية الأبعاد",
          "مزيج الألعاب وتوزيع الطاقة الاستيعابية"
        ]
      },
      {
        id: "del-fec-build",
        titleEn: "Fit-Out & Attraction Installation",
        titleAr: "التنفيذ وتركيب الألعاب",
        itemsEn: [
          "Certified ASTM/EN Play Structure Installation",
          "Thematic Interior Architectural Fit-Out",
          "Cashless RFID & BookingQube POS Integration",
          "Civil Defence & Municipal Completion Certificates"
        ],
        itemsAr: [
          "تركيب الألعاب المطابقة للمواصفات الدولية",
          "التجهيز الداخلي والديكورات المعمارية",
          "ربط بوابات التذاكر الرقمية ونقاط البيع",
          "شهادات إتمام البناء والدفاع المدني"
        ]
      },
      {
        id: "del-fec-ops",
        titleEn: "Operations & Handover",
        titleAr: "التشغيل والتدريب والتسليم",
        itemsEn: [
          "Standard Operating Procedures (SOP) Manuals",
          "Staff Training & Customer Service Playbooks",
          "Preventive Maintenance & Daily Safety Checklists"
        ],
        itemsAr: [
          "أدلة إجراءات التشغيل القياسية (SOPs)",
          "تدريب طواقم العمل وخدمة العملاء",
          "جداول الصيانة الوقائية وفحص السلامة اليومي"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Market & Feasibility",
        titleAr: "دراسة السوق والجدوى",
        descriptionEn: "Catchment area demographics, competitor analysis, revenue modeling, and space allocation.",
        descriptionAr: "تحليل النطاق الجغرافي والسوق والمنافسين ونمذجة الإيرادات المتوقعة.",
        outputsEn: ["Feasibility Report", "High-Level Financial Model"],
        outputsAr: ["تقرير الجدوى", "النموذج المالي المبدئي"]
      },
      {
        id: "design",
        stageNumber: "02",
        titleEn: "Concept & Spatial BIM",
        titleAr: "التصميم والنمذجة المعمارية",
        descriptionEn: "Attraction layout, interior theming, acoustic treatment, MEP coordination, and permit packages.",
        descriptionAr: "توزيع الألعاب، التصميم الداخلي، العزل الصوتي، والمخططات الكهروميكانيكية والتراخيص.",
        outputsEn: ["3D Concept Visuals", "Tender Construction Drawings"],
        outputsAr: ["تصاميم بصرية ثلاثية الأبعاد", "المخططات التنفيذية للمناقصة"]
      },
      {
        id: "develop",
        stageNumber: "03",
        titleEn: "Build & Attraction Setup",
        titleAr: "التنفيذ وتجهيز الألعاب",
        descriptionEn: "Custom in-house fabrication, international equipment logistics, assembly, and compliance testing.",
        descriptionAr: "التصنيع الداخلي المخصص، وشحن الألعاب وتركيبها وفحص السلامة الميداني.",
        outputsEn: ["Completed Fit-Out", "Safety Inspection Certificates"],
        outputsAr: ["اكتمال التجهيز الداخلي", "شهادات الفحص والسلامة"]
      },
      {
        id: "operate",
        stageNumber: "04",
        titleEn: "Operational Launch",
        titleAr: "التشغيل والافتتاح",
        descriptionEn: "Staff training, POS ticketing integration, marketing launch, soft-opening testing, and grand opening.",
        descriptionAr: "تدريب الكوادر، وتفعيل بوابات الدخول، والإطلاق التسويقي والافتتاح التجريبي والرسمي.",
        outputsEn: ["Grand Opening Event", "Live Operational Dashboard"],
        outputsAr: ["فعالية الافتتاح الرسمي", "لوحة المتابعة التشغيلية الحية"]
      }
    ],
    serviceSpecificModule: {
      type: "fec-lifecycle",
      titleEn: "FEC Lifecycle Roadmap",
      titleAr: "خارطة طريق تطوير مراكز الترفيه",
      subtitleEn: "A transparent lifecycle model from initial white-box space to commercial profitability.",
      subtitleAr: "نموذج واضح ومرحلي من المساحة الخام حتى تحقيق أعلى مستويات الربحية التشغيلية.",
      data: {
        milestones: [
          { phase: "Phase 1", titleEn: "Zoning & Feasibility", titleAr: "المخطط والجدوى", durationEn: "Weeks 1-4", durationAr: "الأسابيع ١-٤", descEn: "Space layout, footfall projections, and equipment budget alignment." },
          { phase: "Phase 2", titleEn: "BIM & Thematic Design", titleAr: "التصميم والنمذجة", durationEn: "Weeks 5-8", durationAr: "الأسابيع ٥-٨", descEn: "Full 3D modeling, material specs, and authority submissions." },
          { phase: "Phase 3", titleEn: "Fabrication & Fit-Out", titleAr: "التصنيع والتنفيذ", durationEn: "Weeks 9-20", durationAr: "الأسابيع ٩-٢٠", descEn: "Atelier manufacturing, equipment delivery, and on-site mechanical build." },
          { phase: "Phase 4", titleEn: "Training & Soft Launch", titleAr: "التدريب والافتتاح", durationEn: "Weeks 21-24", durationAr: "الأسابيع ٢١-٢٤", descEn: "Staff playbooks, ticketing dry-runs, and commercial opening." }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "fec-safe",
        titleEn: "ASTM F2970 / EN 1176 Compliance",
        titleAr: "مطابقة معايير السلامة الدولية ASTM / EN",
        descriptionEn: "All play structures, foam pits, netting, and inflatable modules are sourced and installed under international safety standards.",
        descriptionAr: "كافة هياكل الألعاب والمطاط والشبكات مطابقة للمواصفات الدولية ومفحوصة بالكامل."
      },
      {
        id: "fec-ops-audit",
        titleEn: "Audited Daily Safety Checklists",
        titleAr: "سجلات فحص السلامة اليومية المعتمدة",
        descriptionEn: "Standardized inspection logs, emergency response protocols, and automated maintenance tracking.",
        descriptionAr: "سجلات فحص دورية موثقة، وإجراءات طوارئ معتمدة، وتتبع آلي للصيانة الوقائية."
      }
    ],
    relatedServiceSlugs: ["kids-concepts", "attraction-operations", "ticketing-solutions", "fabrication-branding", "feasibility-design-research"]
  },

  // 3. KIDS' PLAY CONCEPTS
  {
    id: "kids-concepts",
    slug: "kids-concepts",
    aliases: ["kids-play", "children-entertainment", "kids"],
    titleEn: "Kids’ Play Concepts & Attractions",
    titleAr: "مفاهيم وتجارب لعب الأطفال",
    categoryEn: "Kids & Family",
    categoryAr: "الأطفال والعائلة",
    taglineEn: "Imaginative, educational, and active play environments tailored for young adventurers and family destinations.",
    taglineAr: "بيئات لعب تفاعلية وتعليمية وحركية مبتكرة مصممة للمستكشفين الصغار والوجهات العائلية.",
    heroOutcomeEn: "Safe, High-Energy Play Concepts that Delight Children and Reassure Parents.",
    heroOutcomeAr: "مفاهيم لعب آمنة ومبهجة تنمي مهارات الأطفال وتمنح الآباء راحة البال التامة.",
    supportingStatementEn: "From modular soft play and sensory exploration zones to mega inflatables and edutainment hubs, E3 designs child-centric worlds built to international safety standards.",
    supportingStatementAr: "من الملاعب الرغوية ومناطق الاستكشاف الحسي إلى الألعاب المطاطية الكبرى والمراكز التعليمية، تبني إي ثري عوالم استثنائية للأطفال.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09277-2.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "Non-Toxic",
        labelEn: "Certified Child-Safe Materials",
        labelAr: "مواد معتمدة آمنة وصديقة للأطفال",
        sourceEn: "Tested commercial finishes and impact foam",
        sourceAr: "مواد تشطيب ومطاط ممتص للصدمات معتمد"
      },
      {
        value: "Ages 2-14",
        labelEn: "Targeted Developmental Zones",
        labelAr: "مناطق مخصصة للفئات العمرية ٢-١٤",
        sourceEn: "Structured sensory, gross motor, and active play",
        sourceAr: "تنمية المهارات الحركية والحسية والبدنية"
      },
      {
        value: "Modular",
        labelEn: "Reconfigurable Configurations",
        labelAr: "تصاميم مرنة قابلة للتعديل والتطوير",
        sourceEn: "Adaptable for seasonal campaigns and pop-ups",
        sourceAr: "مرونة عالية في النقل والتجديد الموسمي"
      }
    ],
    wowHow: [
      {
        id: "kp-1",
        titleEn: "Pure Joy & Active Discovery",
        titleAr: "متعة استكشافية ونشاط بدني مبهج",
        wowEn: "Children navigate obstacle courses, giant slides, and interactive projection floors with boundless excitement and laughter.",
        wowAr: "يتحرك الأطفال عبر مسارات التحدي والمنزلقات الكبرى والشاشات الأرضية التفاعلية بحماس وبهجة غامرة.",
        howEn: "E3 calculates fall zones, impact attenuation, anti-pinch joints, and rounded structural edges to guarantee total child safety.",
        howAr: "نحسب مسافات السقوط الآمنة، وامتصاص الصدمات، والفواصل الآمنة بدون زوايا حادة لضمان الحماية القصوى."
      },
      {
        id: "kp-2",
        titleEn: "Parent Peace of Mind & Cleanliness",
        titleAr: "راحة بال تامة ونظافة فائقة",
        wowEn: "Parents observe their children with unobstructed sightlines in an impeccably sanitized, bright, and welcoming environment.",
        wowAr: "يشاهد الآباء أطفالهم براحة تامة عبر رؤية واضحة في بيئة نظيفة ومشرقة ومرحبة بالجميع.",
        howEn: "We install antimicrobial surfaces, structured check-in/check-out security gates, and dedicated hygienic shoe/sock exchange stations.",
        howAr: "نوظف أسطحاً مضادة للبكتيريا، وبوابات دخول وخروج آمنة لمنع المغادرة الفردية، ومحطات تعقيم وتبديل مخصصة."
      }
    ],
    objectives: [
      {
        id: "obj-mall-play-zone",
        labelEn: "Add a Dedicated Kids Play Zone in a Commercial Mall",
        labelAr: "إضافة منطقة لعب أطفال داخل مجمع تجاري",
        descriptionEn: "Turn underutilized atrium or tenant space into a high-draw family magnet.",
        descriptionAr: "تحويل المساحات المتاحة إلى وجهة جاذبة للعائلات تزيد مدة إقامة المتسوقين.",
        highlightedCapabilityIds: ["cap-kp-softplay", "cap-kp-inflatables"],
        recommendedDeliverableIds: ["del-kp-design", "del-kp-delivery"]
      },
      {
        id: "obj-pop-up-kids",
        labelEn: "Launch a Pop-Up Children's Festival Concept",
        labelAr: "إطلاق مفهوم مهرجان ترفيهي مؤقت للأطفال",
        descriptionEn: "High-capacity, fast-install obstacle courses and giant inflatable adventure arenas for seasonal holidays.",
        descriptionAr: "مسارات عقبات وألعاب مطاطية ضخمة سريعة التركيب مناسبة للإجازات والمواسم.",
        highlightedCapabilityIds: ["cap-kp-inflatables", "cap-kp-edutainment"],
        recommendedDeliverableIds: ["del-kp-delivery"]
      }
    ],
    capabilities: [
      {
        id: "cap-kp-softplay",
        titleEn: "Modular Soft Play & Adventure Mazes",
        titleAr: "الملاعب الرغوية ومتاهات المغامرة الآمنة",
        descriptionEn: "Multi-level climbing structures, crawl tunnels, ball pits, and slide complexes with heavy-duty safety netting.",
        descriptionAr: "هياكل تسلق متعددة الطوابق، وأنفاق استكشافية، وأحواض كرات، وشبكات حماية فائقة القوة.",
        deliverablesEn: ["Custom Soft Play Layout", "Impact Foam Certification", "Sanitization Protocol"],
        deliverablesAr: ["مخطط اللعب الرغوي المخصص", "شهادة مطاط امتصاص الصدمات", "بروتوكول التعقيم الدوري"],
        suitableForEn: ["Indoor FECs", "Daycares", "Retail Hubs"],
        suitableForAr: ["مراكز الترفيه المغلقة", "المجمعات التجارية"],
        tagEn: "Indoor Play",
        tagAr: "اللعب الداخلي",
        colSpan: 2
      },
      {
        id: "cap-kp-inflatables",
        titleEn: "Custom Inflatables & Obstacle Parks",
        titleAr: "الألعاب المطاطية ومسارات التحدي المخصصة",
        descriptionEn: "Commercial double-stitched TPU/PVC inflatables, giant climbing domes, wipeout courses, and toddler bounce arenas.",
        descriptionAr: "ألعاب مطاطية تجارية بخياطة مزدوجة، وقباب تسلق عملاقة، ومسارات تحديات ومناطق قفز للصغار.",
        deliverablesEn: ["Bespoke Inflatable Design", "EN 14960 Safety Inspection", "Blower & Power Rigging Spec"],
        deliverablesAr: ["تصميم مطاطي مخصص", "فحص السلامة EN 14960", "مخطط مولدات الهواء والطاقة"],
        suitableForEn: ["Arenas", "Outdoor Lawns", "Pop-Ups"],
        suitableForAr: ["الصالات الرياضية", "المساحات المفتوحة"],
        tagEn: "Active Inflatables",
        tagAr: "الألعاب المطاطية"
      },
      {
        id: "cap-kp-edutainment",
        titleEn: "Edutainment & Sensory Interactive Zones",
        titleAr: "المناطق التعليمية والتفاعلية الحسية",
        descriptionEn: "Stem activity tables, wall games, digital floor projection mapping, and kinetic sand discovery labs.",
        descriptionAr: "طاولات أنشطة العلوم والابتكار، وألعاب الجدران، والشاشات الأرضية التفاعلية ومختبرات الاكتشاف.",
        deliverablesEn: ["Interactive Software Modules", "Tactile Activity Stations", "Educational Guide"],
        deliverablesAr: ["برمجيات تفاعلية تعليمية", "محطات أنشطة حسية", "دليل البرامج التعليمية"],
        suitableForEn: ["Museums", "Schools", "Malls"],
        suitableForAr: ["المتاحف", "المدارس", "المولات"],
        tagEn: "Edutainment",
        tagAr: "التعليم الترفيهي"
      }
    ],
    engagementModels: [
      {
        id: "eng-kp-turnkey",
        titleEn: "Turnkey Play Zone Package",
        titleAr: "باقة منطقة اللعب المتكاملة",
        subtitleEn: "Design, Supply & Install",
        subtitleAr: "التصميم والتوريد والتركيب",
        descriptionEn: "Complete conceptualization, international equipment supply, certified installation, and initial staff training.",
        descriptionAr: "تصميم المفهوم وتوريد الألعاب المعتمدة وتركيبها وتدريب المشرفين على إدارة الموقع.",
        bestForEn: "Malls, leisure resorts, family clubs",
        bestForAr: "المجمعات، المنتجعات، والنوادي العائلية",
        typicalDurationEn: "6 to 14 Weeks",
        typicalDurationAr: "٦ إلى ١٤ أسبوعاً"
      },
      {
        id: "eng-kp-seasonal-rental",
        titleEn: "Seasonal Play Attraction Rental",
        titleAr: "استئجار مناطق الألعاب الموسمية",
        subtitleEn: "Fast Pop-Up Deployment",
        subtitleAr: "تركيب وتشغيل فوري للفعاليات",
        descriptionEn: "Short-to-medium term hire of E3's premier inflatable parks and modular soft play activations with full operational crew.",
        descriptionAr: "تأجير ألعاب ومسارات إي ثري المطاطية مع طواقم التشغيل والسلامة للإجازات والمهرجانات.",
        bestForEn: "Festivals, Eid holidays, National Day events",
        bestForAr: "المهرجانات، الأعياد، وفعاليات اليوم الوطني",
        typicalDurationEn: "1 to 8 Weeks",
        typicalDurationAr: "أسبوع إلى ٨ أسابيع"
      }
    ],
    deliverables: [
      {
        id: "del-kp-design",
        titleEn: "Concept & Safety Layout",
        titleAr: "المفهوم الإبداعي ومخططات الأمان",
        itemsEn: [
          "Age-Zoned 3D Spatial Renders",
          "Capacity & Turnaround Calculations",
          "Material & Flame-Retardant Certification Data"
        ],
        itemsAr: [
          "تصاميم ثلاثية الأبعاد مقسمة حسب الفئات العمرية",
          "حسابات الطاقة الاستيعابية وتدوير اللاعبين",
          "شهادات مقاومة الحريق وجودة المواد"
        ]
      },
      {
        id: "del-kp-delivery",
        titleEn: "Supply, Setup & Certification",
        titleAr: "التوريد والتركيب والاعتماد",
        itemsEn: [
          "Delivered & Tested Equipment Modules",
          "Safety Fall Zone & Impact Padding Certification",
          "Operator Daily Safety & Sanitization Manual"
        ],
        itemsAr: [
          "توريد واختبار معدات الألعاب المعتمدة",
          "فحص مساحات السقوط وشهادة مصدات الصدمات",
          "دليل المشغل اليومي لإجراءات السلامة والتعقيم"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Demographics & Target Age",
        titleAr: "تحديد الفئة العمرية والجمهور",
        descriptionEn: "Matching play intensity and learning outcomes to target age brackets (Toddler, Early Childhood, Tweens).",
        descriptionAr: "مواءمة طبيعة الألعاب ومستوى الحركة مع الفئات المستهدفة (الصغار، الأطفال، اليافعين).",
        outputsEn: ["Age Segment Strategy"],
        outputsAr: ["استراتيجية الفئات العمرية"]
      },
      {
        id: "design",
        stageNumber: "02",
        titleEn: "3D Play Design & Safety BIM",
        titleAr: "التصميم ثلاثي الأبعاد ومعايير الأمان",
        descriptionEn: "Custom visual theming, fall zone calculations, barrier heights, and parent visibility sightlines.",
        descriptionAr: "التصميم البصري، وحسابات مسافات السقوط، وارتفاع الحواجز ووضوح الرؤية لأولياء الأمور.",
        outputsEn: ["Safety-Validated CAD Layout"],
        outputsAr: ["مخطط هندسي معتمد للأمان"]
      },
      {
        id: "deliver",
        stageNumber: "03",
        titleEn: "Installation & Commissioning",
        titleAr: "التركيب والتشغيل التجريبي",
        descriptionEn: "Assembly by certified technicians, anchor load testing, and hygiene sign-off.",
        descriptionAr: "التركيب بواسطة فنيين معتمدين، واختبار نقاط التثبيت، واعتماد النظافة والجاهزية.",
        outputsEn: ["Commissioning Certificate"],
        outputsAr: ["شهادة الجاهزية والتشغيل"]
      }
    ],
    serviceSpecificModule: {
      type: "kids-age-matrix",
      titleEn: "Age & Activity Matrix",
      titleAr: "مصفوفة الفئات العمرية وطبيعة الأنشطة",
      subtitleEn: "Designed to match children's developmental stages with tailored sensory and active play.",
      subtitleAr: "مصممة لتلائم المراحل التطورية للطفل عبر تجارب حسية وحركية مخصصة.",
      data: {
        brackets: [
          { ageEn: "Toddlers (2-4 Years)", ageAr: "الصغار (٢ - ٤ سنوات)", focusEn: "Sensory & Soft Exploration", focusAr: "الاستكشاف الحسي واللعب اللطيف", itemsEn: ["Low-Height Foam Shapes", "Tactile Wall Panels", "Mini Soft Slides", "Padded Enclosures"] },
          { ageEn: "Juniors (5-8 Years)", ageAr: "الأطفال (٥ - ٨ سنوات)", focusEn: "Agility & Social Play", focusAr: "الرشاقة واللعب الجماعي", itemsEn: ["Obstacle Mazes", "Ball Blaster Arenas", "Interactive Floor Projections", "Moderate Inflatable Climbs"] },
          { ageEn: "Tweens (9-14 Years)", ageAr: "اليافعين (٩ - ١٤ سنة)", focusEn: "High-Energy Challenge", focusAr: "التحدي والطاقة العالية", itemsEn: ["Wipeout Obstacle Tracks", "Giant Drop Slides", "Ninja Warrior Rigging", "Digital Tag Arenas"] }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "kr-1",
        titleEn: "Strict European & US Child Safety Compliance",
        titleAr: "مطابقة معايير أمان الأطفال الأوروبية والأمريكية",
        descriptionEn: "Manufactured strictly in accordance with EN 1176, EN 14960, and ASTM child recreation standards.",
        descriptionAr: "تصنيع ومطابقة تامة للمواصفات الدولية لألعاب الأطفال EN 1176 و EN 14960 و ASTM."
      }
    ],
    relatedServiceSlugs: ["fec-development", "attraction-operations", "ticketing-solutions", "fabrication-branding"]
  },

  // 4. EXPERIENTIAL ACTIVATIONS
  {
    id: "experiential-activations",
    slug: "experiential-activations",
    aliases: ["activations", "brand-activations", "pop-ups"],
    titleEn: "Experiential Activations & Brand Pavilions",
    titleAr: "التفعيلات والتجارب التفاعلية",
    categoryEn: "Branding & Immersive",
    categoryAr: "العلامات التجارية والتجارب",
    taglineEn: "Immersive pop-up pavilions, interactive kinetic installations, and memorable brand storytelling in Qatar.",
    taglineAr: "أجنحة تفاعلية، وتركيبات بصرية حركية، وتجارب استثنائية للعلامات التجارية في قطر.",
    heroOutcomeEn: "High-Impact Brand Experiences that Drive Real-World Engagement and Digital Virality.",
    heroOutcomeAr: "تجارب علامات تجارية مبهرة تحقق أعلى معدلات التفاعل والانتشار الرقمي.",
    supportingStatementEn: "E3 bridges high-concept creative design with rapid physical fabrication and digital interactivity, delivering bespoke pavilions and pop-up activations that captivate audiences.",
    supportingStatementAr: "تجمع إي ثري بين التصميم الابتكاري وسرعة التصنيع والتفاعل الرقمي لتقديم أجنحة وتفعيلات تجذب أنظار الجميع.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "Custom",
        labelEn: "Bespoke Spatial Architecture",
        labelAr: "تصاميم معمارية فريدة",
        sourceEn: "Tailored brand pavilions in Qatar",
        sourceAr: "أجنحة مخصصة للعلامات التجارية في قطر"
      },
      {
        value: "Interactive",
        labelEn: "Physical-to-Digital Interactivity",
        labelAr: "دمج التقنيات الرقمية والحسية",
        sourceEn: "Touch, motion, and sensor-driven activations",
        sourceAr: "تفعيلات ذكية تعتمد على الحركة واللمس"
      },
      {
        value: "Turnkey",
        labelEn: "Rapid Atelier Build",
        labelAr: "تصنيع محلي سريع ودقيق",
        sourceEn: "Fabricated in E3's Doha production facility",
        sourceAr: "تصنيع في منشآت إي ثري بالدوحة"
      }
    ],
    wowHow: [
      {
        id: "act-1",
        titleEn: "Memorable Multi-Sensory Stories",
        titleAr: "قصص متعددة الحواس تترك أثراً",
        wowEn: "Visitors step into futuristic pavilions with kinetic light sculptures, reactive sound walls, and personalized digital photo moments.",
        wowAr: "يدخل الزوار أجنحة مستقبلية تحتوي على مجسمات إضاءة حركية، وجدران صوتية متفاعلة، ومحطات تصوير تذكارية فريدة.",
        howEn: "We code custom sensor integrations, design precision acrylic/metal fabrications, and orchestrate seamless guest walkthrough timing.",
        howAr: "نبرمج الحساسات التفاعلية المخصصة، ونصنع الهياكل المعدنية والأكريليك بدقة، وننظم تدفق الزوار بسلاسة."
      },
      {
        id: "act-2",
        titleEn: "Seamless Data Capture & Lead Generation",
        titleAr: "جمع البيانات وبناء العلاقات مع العملاء",
        wowEn: "Guests receive instant branded digital souvenirs on their smartphones while interacting naturally with the installation.",
        wowAr: "يحصل الزوار فوراً على هدايا تذكارية رقمية تحمل هوية العلامة التجارية على هواتفهم أثناء تفاعلهم مع التجربة.",
        howEn: "We build frictionless QR registration flows, automated WhatsApp/Email dispatch systems, and compliant GDPR/PDPL lead capture engines.",
        howAr: "نطور بوابات تسجيل سريعة عبر الـ QR، وأنظمة إرسال تلقائية عبر الواتساب، وحفظ بيانات متوافق مع قوانين الخصوصية."
      }
    ],
    objectives: [
      {
        id: "obj-brand-launch",
        labelEn: "Launch a Product or Brand in Qatar",
        labelAr: "إطلاق منتج أو علامة تجارية في قطر",
        descriptionEn: "Create an iconic temporary or semi-permanent pavilion that dominates public attention and social media.",
        descriptionAr: "بناء جناح استثنائي مؤقت أو دائم يجذب اهتمام الجمهور ووسائل التواصل الاجتماعي.",
        highlightedCapabilityIds: ["cap-act-pavilion", "cap-act-interactive"],
        recommendedDeliverableIds: ["del-act-design", "del-act-build"]
      },
      {
        id: "obj-mall-activation",
        labelEn: "Activate a High-Traffic Mall Atrium",
        labelAr: "تفعيل بهو مجمع تجاري عالي الإقبال",
        descriptionEn: "High-throughput, photogenic experiential installation that encourages footfall and dwell time.",
        descriptionAr: "تجربة تفاعلية جذابة بصرياً تشجع المتسوقين على المشاركة والتفاعل وزيادة مدة الزيارة.",
        highlightedCapabilityIds: ["cap-act-interactive", "cap-act-fabrication"],
        recommendedDeliverableIds: ["del-act-build"]
      }
    ],
    capabilities: [
      {
        id: "cap-act-pavilion",
        titleEn: "Brand Pavilions & Pop-Up Architecture",
        titleAr: "الأجنحة المعمارية والمتاجر المؤقتة",
        descriptionEn: "Turnkey temporary and semi-permanent structures featuring customized geometric facades, climate-controlled interiors, and VIP lounge areas.",
        descriptionAr: "هياكل معمارية مؤقتة ودائمة ذات واجهات هندسية مبتكرة، ومساحات مكيفة ومناطق استضافة لكبار الشخصيات.",
        deliverablesEn: ["Architectural 3D Model", "Structural Stability Certificate", "Turnkey Fabrication"],
        deliverablesAr: ["نموذج معماري ثلاثي الأبعاد", "شهادة السلامة الإنشائية", "التصنيع والتركيب المتكامل"],
        suitableForEn: ["Lusail Boulevard", "Katara", "Msheireb", "Doha Exhibition Centers"],
        suitableForAr: ["درب لوسيل", "كتارا", "مشيرب", "مركز الدوحة للمعارض"],
        tagEn: "Spatial Build",
        tagAr: "البناء الفضائي",
        colSpan: 2
      },
      {
        id: "cap-act-interactive",
        titleEn: "Interactive Tech & Kinetic Installations",
        titleAr: "التقنيات التفاعلية والتركيبات الحركية",
        descriptionEn: "Motion sensors, touch surfaces, gesture tracking, motorized kinetic lights, and real-time generative visual displays.",
        descriptionAr: "حساسات الحركة، والأسطح التفاعلية، والإضاءة الحركية الآلية، والشاشات البصرية المتفاعلة لحظياً.",
        deliverablesEn: ["Custom Software Codebase", "Hardware Integration Map", "Operator Tablet Interface"],
        deliverablesAr: ["برمجيات تفاعلية مخصصة", "مخطط ربط الأجهزة التقنية", "واجهة تحكم لوحية للمشغلين"],
        suitableForEn: ["Brand Activations", "Sponsor Zones"],
        suitableForAr: ["تفعيلات العلامات التجارية", "مناطق الرعاة"],
        tagEn: "Creative Tech",
        tagAr: "التقنيات الإبداعية"
      },
      {
        id: "cap-act-fabrication",
        titleEn: "Precision Finishing & Brand Signage",
        titleAr: "التشطيبات الدقيقة والهوية البصرية",
        descriptionEn: "CNC routing, laser cutting, metal powder coating, illuminated 3D logos, and high-resolution print graphics.",
        descriptionAr: "القص الدقيق بالليزر وCNC، والدهانات المعدنية، والشعارات المضيئة ثلاثية الأبعاد والمطبوعات عالية الدقة.",
        deliverablesEn: ["Material Finish Swatches", "Illuminated Signage", "Graphic Application"],
        deliverablesAr: ["عينات تشطيب المواد", "شعارات مضيئة", "تركيب الهوية الرسومية"],
        suitableForEn: ["Exhibitions", "Retail Hubs"],
        suitableForAr: ["المعارض", "المراكز التجارية"],
        tagEn: "Fabrication",
        tagAr: "التصنيع والإنتاج"
      }
    ],
    engagementModels: [
      {
        id: "eng-act-turnkey",
        titleEn: "Turnkey Activation Delivery",
        titleAr: "تنفيذ التفعيل المتكامل",
        subtitleEn: "From Ideation to On-Site Brand Ambassadors",
        subtitleAr: "من الفكرة إلى طواقم ممثلي العلامة التجارية",
        descriptionEn: "Comprehensive design, atelier fabrication, technology development, staff recruitment, and daily operational management.",
        descriptionAr: "تصميم شامل، وتصنيع في الورش، وتطوير التقنيات، وتوفير المشرفين والتشغيل اليومي للفعالية.",
        bestForEn: "Brand launches, corporate roadshows, festival sponsorships",
        bestForAr: "إطلاق العلامات التجارية، الحملات المتنقلة، ورعايات المهرجانات",
        typicalDurationEn: "4 to 12 Weeks",
        typicalDurationAr: "٤ إلى ١٢ أسبوعاً"
      }
    ],
    deliverables: [
      {
        id: "del-act-design",
        titleEn: "Spatial & Interaction Design",
        titleAr: "التصميم الفضائي والتفاعلي",
        itemsEn: [
          "Photorealistic 3D Concept Renders",
          "Guest User-Journey & Interaction Storyboards",
          "Technical Fabrication & Electrical Drawings"
        ],
        itemsAr: [
          "تصاميم ثلاثية الأبعاد واقعية",
          "مخطط رحلة الزائر والتفاعل",
          "المخططات التنفيذية والكهربائية"
        ]
      },
      {
        id: "del-act-build",
        titleEn: "Fabrication, Tech & Operation",
        titleAr: "التصنيع والتقنية والتشغيل",
        itemsEn: [
          "Installed & Painted Pavilion Structure",
          "Configured Interactive Hardware & Displays",
          "Trained Brand Ambassadors & Technical Support",
          "Analytics Report on Guest Impressions & Leads"
        ],
        itemsAr: [
          "هيكل الجناح مصنع ومدهون ومركب بالكامل",
          "أجهزة وشاشات تفاعلية مبرمجة وجاهزة",
          "طاقم ممثلي علامة تجارية ودعم فني",
          "تقرير تحليلي للتفاعل وانطباعات الزوار"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Brand Brief & Objective",
        titleAr: "فهم أهداف العلامة التجارية",
        descriptionEn: "Defining the core brand message, key audience, target impressions, and spatial footprint.",
        descriptionAr: "تحديد رسالة العلامة التجارية، والجمهور المستهدف، ومعدل المشاهدات والمساحة المتاحة.",
        outputsEn: ["Creative Brief Alignment"],
        outputsAr: ["وثيقة التوجه الإبداعي"]
      },
      {
        id: "design",
        stageNumber: "02",
        titleEn: "3D Visualization & UX",
        titleAr: "التصميم ثلاثي الأبعاد وتجربة الزائر",
        descriptionEn: "Detailed spatial modeling, interactive software wireframing, and material selection.",
        descriptionAr: "التصميم المعماري، وتخطيط البرمجيات التفاعلية واختيار المواد والتشطيبات.",
        outputsEn: ["3D Concept & Interaction Flow"],
        outputsAr: ["التصميم ثلاثي الأبعاد وتدفق التفاعل"]
      },
      {
        id: "develop",
        stageNumber: "03",
        titleEn: "Fabrication & Coding",
        titleAr: "التصنيع والبرمجة",
        descriptionEn: "In-house joinery, metalwork, graphic print, and software engineering.",
        descriptionAr: "أعمال النجارة والحدادة والطباعة وبرمجة التطبيقات التفاعلية في ورش إي ثري.",
        outputsEn: ["Fabricated Modules & Tested Code"],
        outputsAr: ["هياكل مصنعة وبرمجيات مختبرة"]
      },
      {
        id: "deliver",
        stageNumber: "04",
        titleEn: "On-Site Live Activation",
        titleAr: "التشغيل الميداني الحي",
        descriptionEn: "Rapid overnight setup, brand ambassador briefing, live queue management, and technical supervision.",
        descriptionAr: "التركيب السريع، وتوجيه طواقم العمل، وإدارة الطوابير والإشراف التقني المستمر.",
        outputsEn: ["Live Activation & Footfall Report"],
        outputsAr: ["تفعيل حي وتقرير الإقبال"]
      }
    ],
    serviceSpecificModule: {
      type: "activation-mapper",
      titleEn: "Activation Objective & Engagement Mapper",
      titleAr: "خارطة أهداف التفعيل والتفاعل",
      subtitleEn: "Tailoring the physical and digital footprint to your strategic marketing outcomes.",
      subtitleAr: "مواءمة التجربة الميدانية والرقمية مع أهدافك التسويقية الاستراتيجية.",
      data: {
        dimensions: [
          { goalEn: "Social Media Buzz & Virality", goalAr: "الانتشار عبر وسائل التواصل", formatEn: "Immersive Optical Illusions & 360 Video Booths", formatAr: "خدع بصرية غامرة ومحطات تصوير ٣٦٠ درجة" },
          { goalEn: "Direct Product Trial & Sampling", goalAr: "تجربة المنتج وتوزيع العينات", formatEn: "Tactile Product Display Bars with Smart Sensor Feedback", formatAr: "طاولات عرض تفاعلية بحساسات ذكية" },
          { goalEn: "Enterprise Lead Generation", goalAr: "استقطاب عملاء وشركاء أعمال", formatEn: "Private Lounge Pavilions with Interactive RFID Briefcases", formatAr: "أجنحة استضافة مغلقة بحقائب تعريفية ذكية" }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "act-mall-rules",
        titleEn: "Qatar Commercial Venue & Mall Clearances",
        titleAr: "تصاريح المجمعات والوجهات التجارية في قطر",
        descriptionEn: "Deep experience with mall fit-out restrictions, overnight logistics windows, electrical load certifications, and fire safety norms.",
        descriptionAr: "خبرة واسعة في اشتراطات المجمعات التجارية، وساعات العمل الليلية، وشهادات الأحمال الكهربائية ومعايير الحريق."
      }
    ],
    relatedServiceSlugs: ["fabrication-branding", "av-stage-rentals", "shows-performances", "mega-events"]
  },

  // 5. SHOWS & PERFORMANCES
  {
    id: "shows-performances",
    slug: "shows-performances",
    aliases: ["shows", "performances", "theatrical-shows"],
    titleEn: "Shows, Entertainment & Live Performances",
    titleAr: "العروض الفنية والاستعراضية",
    categoryEn: "Entertainment & Talent",
    categoryAr: "الترفيه والعروض",
    taglineEn: "Curated international theatrical productions, drone light spectacles, roaming artists, and bespoke cultural ceremonies.",
    taglineAr: "عروض مسرحية عالمية، واستعراضات طائرات الدرون الضوئية، وفنانين متجولين واحتفالات ثقافية حية.",
    heroOutcomeEn: "Spellbinding Stage Performances and Theatrical Wonders that Captivate Audiences of All Ages.",
    heroOutcomeAr: "عروض استعراضية وفنية ساحرة تأسر قلوب الجماهير وتخلد في الذاكرة.",
    supportingStatementEn: "E3 books, choreographs, and produces world-class live entertainment acts—from high-flying aerialists and international circus troupes to cultural music ensembles and night-sky drone choreography.",
    supportingStatementAr: "تستقطب إي ثري وتصمم عروضاً ترفيهية عالمية — من الاستعراضات الهوائية والفرق المسرحية إلى العروض الثقافية وسيمفونيات طائرات الدرون المضيئة.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "Global",
        labelEn: "International Talent Network",
        labelAr: "شبكة فنانين واستعراضيين عالمية",
        sourceEn: "Direct booking relationships across Europe, Americas & Asia",
        sourceAr: "شراكات مباشرة مع وكالات العروض الدولية"
      },
      {
        value: "Custom",
        labelEn: "Bespoke Thematic Costuming",
        labelAr: "أزياء واستعراضات مصممة خصيصاً",
        sourceEn: "Tailored to Qatar cultural and event themes",
        sourceAr: "مصممة وفق الهوية الثقافية والمناسبات في قطر"
      },
      {
        value: "100%",
        labelEn: "Full Rider & Hospitality Logistics",
        labelAr: "إدارة لوجستية متكاملة للطواقم",
        sourceEn: "Visas, flights, accommodation, and rehearsal coordination",
        sourceAr: "تأشيرات وإقامة وبروفات متكاملة"
      }
    ],
    wowHow: [
      {
        id: "sh-1",
        titleEn: "Theatrical Grandeur & Emotion",
        titleAr: "إبهار مسرحي وعاطفي استثنائي",
        wowEn: "Audiences are mesmerized by breathtaking acrobatics, synchronized fire/water effects, and captivating narratives that resonate deeply.",
        wowAr: "تنبهر الجماهير بالحركات الأكروباتية المدهشة، ومؤثرات النار والماء المتزامنة، والسرد القصصي المشوق.",
        howEn: "E3 orchestrates certified aerial rigging safety lines, SMPTE timecode audio-lighting triggers, and rehearsals in dedicated local facilities.",
        howAr: "نشرف على خطوط أمان الاستعراضات الهوائية، وتزامن المؤثرات مع الإضاءة والصوت، والبروفات المكثفة."
      },
      {
        id: "sh-2",
        titleEn: "Vibrant Festival Atmosphere",
        titleAr: "أجواء احتفالية حيوية متواصلة",
        wowEn: "Streets and plazas burst into life with colorful roaming puppets, stilt walkers, and interactive musical parades.",
        wowAr: "تمتلئ الساحات والممرات بالحيوية مع الدمى العملاقة المضيئة، والمهرجين، والاستعراضات الموسيقية التفاعلية.",
        howEn: "We develop rotational routing schedules, dedicated performer rest zones, and crowd safety escort teams.",
        howAr: "نضع جداول مسارات دورية منظمة، ومناطق استراحة مخصصة للفرق، وطواقم مرافقة لحماية الزوار والفنانين."
      }
    ],
    objectives: [
      {
        id: "obj-headline-show",
        labelEn: "Stage a Headline Stage Spectacle",
        labelAr: "تنظيم عرض مسرحي رئيسي واستثنائي",
        descriptionEn: "Multi-performer theatrical arena production with custom music, choreography, and kinetic stage elements.",
        descriptionAr: "إنتاج استعراضي مسرحي ضخم بموسيقى مخصصة وأزياء واستعراضات متزامنة مع خشبة المسرح.",
        highlightedCapabilityIds: ["cap-sh-stage", "cap-sh-aerial"],
        recommendedDeliverableIds: ["del-sh-curation", "del-sh-stage"]
      },
      {
        id: "obj-roaming-entertainment",
        labelEn: "Curate Roaming Entertainment for a Festival",
        labelAr: "توفير عروض جوالة لمهرجان أو مجمع تجاري",
        descriptionEn: "High-energy, photo-worthy strolling acts and cultural troupes that circulate seamlessly among crowds.",
        descriptionAr: "عروض متجولة جذابة للتصوير وفرق فلكلورية تتفاعل مباشرة وبسلاسة مع الزوار.",
        highlightedCapabilityIds: ["cap-sh-roaming"],
        recommendedDeliverableIds: ["del-sh-curation"]
      }
    ],
    capabilities: [
      {
        id: "cap-sh-stage",
        titleEn: "Bespoke Theatrical & Arena Productions",
        titleAr: "الإنتاج المسرحي والاستعراضي المخصص",
        descriptionEn: "Custom written scripts, original musical scoring, costume design, and dynamic stage direction for major opening ceremonies.",
        descriptionAr: "كتابة سيناريو العرض، والتأليف الموسيقي، وتصميم الأزياء والإخراج المسرحي لحفلات الافتتاح الكبرى.",
        deliverablesEn: ["Story Script & Storyboards", "Original Music Master Track", "Rehearsal Schedule"],
        deliverablesAr: ["سيناريو العرض والمخطط البصري", "المقطوعات الموسيقية الأصلية", "جدول البروفات الفنية"],
        suitableForEn: ["Ceremonies", "Stadiums", "Theatres"],
        suitableForAr: ["الاحتفالات الكبرى", "الملاعب", "المسارح"],
        tagEn: "Theatrical Production",
        tagAr: "الإنتاج المسرحي",
        colSpan: 2
      },
      {
        id: "cap-sh-roaming",
        titleEn: "International Roaming Acts & Parades",
        titleAr: "العروض المتجولة والمسيرات الاستعراضية",
        descriptionEn: "Illuminated giant puppets, acrobat troupes, musical marching bands, living statues, and interactive character artists.",
        descriptionAr: "دمى مضيئة عملاقة، وفرق أكروبات، وفرق موسيقية استعراضية، وتماثيل حية وشخصيات تفاعلية.",
        deliverablesEn: ["Talent Lookbook & Video Auditions", "Route & Schedule Matrix", "Performer Liaison Crew"],
        deliverablesAr: ["كتيب العروض ومقاطع الفيديو", "جدول المسارات والمواعيد", "طاقم مرافقة الفنانين"],
        suitableForEn: ["Malls", "Boulevards", "Public Parks"],
        suitableForAr: ["المجمعات", "الشوارع المفتوحة", "الحدائق"],
        tagEn: "Roaming Talent",
        tagAr: "العروض الجوالة"
      },
      {
        id: "cap-sh-drone",
        titleEn: "Night-Sky Drone Light Shows",
        titleAr: "عروض طائرات الدرون الضوئية",
        descriptionEn: "Hundreds of synchronized illuminated drones painting 3D dynamic logos, national emblems, and animated stories across the night sky.",
        descriptionAr: "مئات طائرات الدرون المضيئة المتزامنة ترسم شعارات ثلاثية الأبعاد ولوحات وطنية في سماء الليل.",
        deliverablesEn: ["3D Drone Formation Animation", "Aviation Authority Approvals", "Flight Safety Plan"],
        deliverablesAr: ["محاكاة ثلاثية الأبعاد لتشكيلات الدرون", "تصاريح الطيران المدني", "خطة السلامة الجوية"],
        suitableForEn: ["National Days", "Waterfronts", "Arenas"],
        suitableForAr: ["الأعياد الوطنية", "الواجهات البحرية", "الملاعب"],
        tagEn: "Drone Spectacles",
        tagAr: "عروض الدرون"
      }
    ],
    engagementModels: [
      {
        id: "eng-sh-curation",
        titleEn: "Turnkey Entertainment Programming",
        titleAr: "البرمجة الترفيهية المتكاملة",
        subtitleEn: "Curation, Logistics & Show Calling",
        subtitleAr: "الاختيار واللوجستيات والإشراف الميداني",
        descriptionEn: "E3 sources international talent, manages flights/visas/catering, coordinates local rehearsal venues, and directs live stage execution.",
        descriptionAr: "تتولى إي ثري استقطاب المواهب، وإدارة التأشيرات والتذاكر والإقامة، وتجهيز البروفات، وإخراج العروض الحية.",
        bestForEn: "Multi-day festivals, mall entertainment calendars, public holidays",
        bestForAr: "المهرجانات متعددة الأيام، وجداول فعاليات المجمعات، والأعياد",
        typicalDurationEn: "4 to 16 Weeks",
        typicalDurationAr: "٤ إلى ١٦ أسبوعاً"
      }
    ],
    deliverables: [
      {
        id: "del-sh-curation",
        titleEn: "Talent Curation & Logistics",
        titleAr: "استقطاب المواهب واللوجستيات",
        itemsEn: [
          "Approved Talent Roster & Performance Videos",
          "Visa, Travel & Accommodation Management",
          "Cultural & Dress Code Clearance Certification"
        ],
        itemsAr: [
          "قائمة العروض المعتمدة ومقاطع الأداء",
          "إدارة التأشيرات والسفر والإقامة",
          "اعتماد مطابقة الأزياء للقيم الثقافية المحلية"
        ]
      },
      {
        id: "del-sh-stage",
        titleEn: "Show Execution & Technical Support",
        titleAr: "التنفيذ الفني وإدارة المسرح",
        itemsEn: [
          "Stage Dressing, Technical Rider Rigging & Sound",
          "Professional Show Caller & Green Room Management",
          "Safety Briefings & Daily Performance Reports"
        ],
        itemsAr: [
          "تجهيز المسرح والمتطلبات الفنية والصوت",
          "مدير عرض محترف وإدارة غرف الفنانين",
          "إحاطات السلامة والتقارير اليومية للأداء"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Theme & Audience Alignment",
        titleAr: "تحديد الفكرة والجمهور",
        descriptionEn: "Selecting show genres, pacing, and cultural suitability for the occasion.",
        descriptionAr: "اختيار نمط العرض والإيقاع وملاءمته لطبيعة الفعالية وجمهورها.",
        outputsEn: ["Entertainment Concept Brief"],
        outputsAr: ["وثيقة المفهوم الترفيهي"]
      },
      {
        id: "develop",
        stageNumber: "02",
        titleEn: "Talent Contracting & Logistics",
        titleAr: "التعاقد مع الفرق واللوجستيات",
        descriptionEn: "Booking artists, visa processing, technical rider validation, and custom music production.",
        descriptionAr: "التعاقد مع الفرق، واستخراج التأشيرات، واعتماد المتطلبات الفنية وإنتاج الموسيقى.",
        outputsEn: ["Confirmed Talent Schedule"],
        outputsAr: ["جدول العروض المؤكد"]
      },
      {
        id: "deliver",
        stageNumber: "03",
        titleEn: "Rehearsals & Live Show",
        titleAr: "البروفات والعرض المباشر",
        descriptionEn: "On-site dry-runs, safety checks, live show calling, and audience flow management.",
        descriptionAr: "البروفات الميدانية، وفحوصات الأمان، والإخراج الحي وإدارة تفاعل الحشود.",
        outputsEn: ["Live Performance Delivery"],
        outputsAr: ["تنفيذ العرض الحي"]
      }
    ],
    serviceSpecificModule: {
      type: "performance-catalogue",
      titleEn: "Performance Portfolio & Rider Request",
      titleAr: "دليل العروض وطلب المتطلبات الفنية",
      subtitleEn: "Explore performance categories available for deployment across Qatar.",
      subtitleAr: "استكشف فئات العروض المتاحة للتنفيذ في مختلف مناطق وفعاليات قطر.",
      data: {
        categories: [
          { nameEn: "Aerial & Acrobatic Acts", nameAr: "عروض الاستعراضات الهوائية والأكروبات", descEn: "High-rigging silk artists, hoop performers, and balance masters." },
          { nameEn: "Illuminated Night Spectacles", nameAr: "عروض الإضاءة والمجسمات الليلية", descEn: "LED drum troupes, laser illusionists, and glowing parade floats." },
          { nameEn: "Cultural & Heritage Shows", nameAr: "العروض التراثية والفلكلورية", descEn: "Authentic Ardha troupes, live oud ensembles, and falconry presentations." },
          { nameEn: "Stage Magic & Illusion", nameAr: "عروض الخدع البصرية والمسرح", descEn: "Grand stage illusions, interactive close-up sleight of hand, and mentalism." }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "sh-safety",
        titleEn: "Certified Aerial & Pyro Rigging Protocols",
        titleAr: "بروتوكولات الأمان للاستعراضات الهوائية والمؤثرات",
        descriptionEn: "Rigorous load tests, secondary safety wire backups, and licensed pyrotechnic handlers.",
        descriptionAr: "اختبارات أحمال دقيقة، وأسلاك أمان احتياطية، وفنيون مرخصون للمؤثرات الخاصة."
      }
    ],
    relatedServiceSlugs: ["mega-events", "av-stage-rentals", "fabrication-branding", "experiential-activations"]
  },

  // 6. AV, STAGE EQUIPMENT & RENTALS
  {
    id: "av-stage-rentals",
    slug: "av-stage-rentals",
    aliases: ["audio-visual-stage", "av-rentals", "equipment-rentals", "stage-equipment", "audio-visual", "stage-lighting", "sound-light"],
    titleEn: "AV, Stage Equipment & Rentals",
    titleAr: "تجهيزات الصوت والضوء وتأجير المسارح",
    categoryEn: "Technical Production",
    categoryAr: "الإنتاج الفني والتقني",
    taglineEn: "High-spec sound reinforcement, intelligent dynamic lighting, LED video screens, and structural staging rentals.",
    taglineAr: "أنظمة صوتية متطورة، وإضاءة ذكية، وشاشات عرض LED عملاقة، وهياكل مسارح معتمدة للتأجير.",
    heroOutcomeEn: "Crystal-Clear Acoustic Power and Visually Stunning Stage Production Grids.",
    heroOutcomeAr: "قوة صوتية فائقة النقاء وعروض بصرية وإضاءة مسرحية مبهرة بأعلى المعايير.",
    supportingStatementEn: "E3 supplies, rigs, and operates professional-grade audio, lighting, video, and staging equipment in Qatar, backed by certified sound engineers and technical riggers.",
    supportingStatementAr: "توفر إي ثري وتركب وتشغل أحدث معدات الصوت والإضاءة والشاشات وهياكل المسارح في قطر، بقيادة مهندسين وفنيين معتمدين.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "Pro-Grade",
        labelEn: "Tier-1 Equipment Inventory",
        labelAr: "معدات وتجهيزات احترافية متطورة",
        sourceEn: "Maintained in Qatar technical warehouses",
        sourceAr: "محفوظة ومفحوصة في مستودعات إي ثري بقطر"
      },
      {
        value: "Redundant",
        labelEn: "Dual-Line Signal & Power Backups",
        labelAr: "أنظمة إشارة وطاقة مزدوجة مانعة للانقطاع",
        sourceEn: "Zero single points of failure for live shows",
        sourceAr: "تأمين كامل ضد انقطاع الإشارات أو التيار"
      },
      {
        value: "Certified",
        labelEn: "Structural Rigging Engineers",
        labelAr: "مهندسو تركيب وأحمال معتمدون",
        sourceEn: "Certified load calculations and method statements",
        sourceAr: "حسابات أحمال وشهادات تركيب معتمدة"
      }
    ],
    wowHow: [
      {
        id: "av-1",
        titleEn: "Flawless Acoustic & Visual Clarity",
        titleAr: "وضوح صوتي وبصري فائق النقاء",
        wowEn: "Audiences hear every musical note and speech nuance clearly, surrounded by vibrant, high-contrast LED video walls that remain bright even in daylight.",
        wowAr: "يستمع الحضور لكل نبرة صوت ومقطوعة موسيقية بوضوح تام، محاطين بشاشات LED ساطعة وواضحة حتى في ضوء النهار المباشر.",
        howEn: "We utilize line-array acoustic prediction software, precision beam-steering, calibrated video processors, and high-refresh-rate outdoor LED panels.",
        howAr: "نعتمد برمجيات المحاكاة الصوتية وتوجيه الترددات، ومعالجات الفيديو الرقمية، وشاشات العرض الخارجية ذات التردد العالي."
      },
      {
        id: "av-2",
        titleEn: "Dynamic Kinetic Light Show Atmosphere",
        titleAr: "أجواء إضاءة حركية مبهرة ومتزامنة",
        wowEn: "Stages transform continuously with synchronized moving beams, atmospheric haze, and subtle architectural color washes.",
        wowAr: "تتحول المسارح بتناغم مستمر مع حزم الإضاءة المتحركة، ومؤثرات الضباب، وتوزيع الألوان المعمارية الراقية.",
        howEn: "Our lighting designers program synchronized cues via dedicated digital control consoles, with full electrical isolation and surge protection.",
        howAr: "يبرمج مصممو الإضاءة مشاهد متزامنة عبر لوحات تحكم رقمية حديثة، مع حماية كهربائية متكاملة ضد الترددات المفاجئة."
      }
    ],
    objectives: [
      {
        id: "obj-concert-rig",
        labelEn: "Rent Full Staging & AV for a Live Concert or Gala",
        labelAr: "استئجار مسرح وأنظمة صوت وضوء لحفل جماهيري",
        descriptionEn: "Turnkey outdoor or indoor arena staging with high-capacity line arrays, moving lights, and central LED backdrop.",
        descriptionAr: "مسرح متكامل للصالات المفتوحة أو المغلقة مع أنظمة صوتية قوية وإضاءة متحركة وشاشات خلفية.",
        highlightedCapabilityIds: ["cap-av-audio", "cap-av-lighting", "cap-av-video"],
        recommendedDeliverableIds: ["del-av-rigging", "del-av-ops"]
      },
      {
        id: "obj-corporate-av",
        labelEn: "Equip a Conference or Exhibition Hall",
        labelAr: "تجهيز قاعة مؤتمرات أو معرض بالأنظمة الذكية",
        descriptionEn: "Ultra-crisp presentation video walls, discrete wireless microphones, and multilingual translation headsets.",
        descriptionAr: "شاشات عرض عالية الدقة للعروض التقديمية، وميكروفونات لاسلكية، وأنظمة ترجمة فورية متعددة اللغات.",
        highlightedCapabilityIds: ["cap-av-audio", "cap-av-video"],
        recommendedDeliverableIds: ["del-av-rigging"]
      }
    ],
    capabilities: [
      {
        id: "cap-av-audio",
        titleEn: "Concert Audio & Speech Reinforcement",
        titleAr: "أنظمة الصوت للحفلات والمؤتمرات",
        descriptionEn: "Line-array loudspeaker systems, digital mixing consoles, wireless RF microphone management, and acoustic simulation.",
        descriptionAr: "أنظمة السماعات الخطية line-array، ومكسرات الصوت الرقمية، وإدارة الترددات اللاسلكية والمحاكاة الصوتية.",
        deliverablesEn: ["Acoustic Simulation Report", "Audio Rigging Plan", "Wireless Frequency Clearance"],
        deliverablesAr: ["تقرير المحاكاة الصوتية", "مخطط تعليق السماعات", "اعتماد الترددات اللاسلكية"],
        suitableForEn: ["Stadiums", "Arenas", "Hotel Ballrooms"],
        suitableForAr: ["الملاعب", "الصالات الرياضية", "قاعات الفنادق"],
        tagEn: "Audio",
        tagAr: "الصوتيات",
        colSpan: 2
      },
      {
        id: "cap-av-video",
        titleEn: "High-Resolution LED Video Screens",
        titleAr: "شاشات العرض العملاقة LED",
        descriptionEn: "Indoor and outdoor fine-pitch LED video panels (P2.6, P3.9), curved configurations, and high-lumen laser projection.",
        descriptionAr: "شاشات LED داخلية وخارجية عالية الوضوح، بتشكيلات منحنية أو مستقيمة، وأجهزة عرض ليزرية عملاقة.",
        deliverablesEn: ["Screen Resolution Matrix", "Video Switching Plot", "Content Playback Rig"],
        deliverablesAr: ["مصفوفة دقة الشاشات", "مخطط تحويل الإشارات المرئية", "أجهزة تشغيل المحتوى"],
        suitableForEn: ["Keynotes", "Exhibitions", "Live Broadcasts"],
        suitableForAr: ["المؤتمرات", "المعارض", "البث المباشر"],
        tagEn: "Video",
        tagAr: "الشاشات والفيديو"
      },
      {
        id: "cap-av-lighting",
        titleEn: "Intelligent Moving Stage Lighting",
        titleAr: "الإضاءة المسرحية الذكية والمتحركة",
        descriptionEn: "Profile moving heads, wash fixtures, beam lights, kinetic light bars, and atmospheric haze generators.",
        descriptionAr: "كشافات إضاءة متحركة، وإضاءة غامرة، وأنابيب ضوئية حركية، وأجهزة ضباب مسرحية.",
        deliverablesEn: ["DMX Patch Schedule", "Lighting Cue Plots", "Power Distribution Layout"],
        deliverablesAr: ["جدول قنوات DMX", "مخططات مشاهد الإضاءة", "مخطط توزيع الطاقة"],
        suitableForEn: ["Ceremonies", "Concerts", "Architectural Highlights"],
        suitableForAr: ["الاحتفالات", "الحفلات الموسيقية", "الإضاءة المعمارية"],
        tagEn: "Lighting",
        tagAr: "الإضاءة"
      }
    ],
    engagementModels: [
      {
        id: "eng-av-rental-crew",
        titleEn: "Dry Hire & Full Technical Crew",
        titleAr: "تأجير المعدات مع الطاقم الفني المتخصص",
        subtitleEn: "Delivered, Rigged & Operated",
        subtitleAr: "توصيل وتركيب وتشغيل كامل",
        descriptionEn: "Equipment delivery to venue, safe truss rigging, sound engineer/lighting programmer operation, and post-event teardown.",
        descriptionAr: "توصيل المعدات للموقع، والتركيب الهندسي، وتشغيل مهندسي الصوت والإضاءة والتفكيك بعد انتهاء الفعالية.",
        bestForEn: "Concerts, conferences, sporting ceremonies, corporate galas",
        bestForAr: "الحفلات، المؤتمرات، البطولات الرياضية، والاحتفالات",
        typicalDurationEn: "1 Day to 4 Weeks",
        typicalDurationAr: "يوم واحد إلى ٤ أسابيع"
      }
    ],
    deliverables: [
      {
        id: "del-av-rigging",
        titleEn: "Setup & Sound Check",
        titleAr: "التركيب وفحص الصوت والضوء",
        itemsEn: [
          "Rigged and Safety-Certified Lighting & Audio Trusses",
          "Sound Check & Acoustic Fine-Tuning",
          "Calibrated LED Video Display Grids"
        ],
        itemsAr: [
          "هياكل إضاءة وصوت مركبة ومعتمدة السلامة",
          "فحص وضبط الترددات الصوتية",
          "شاشات عرض LED معايرة ومجهزة"
        ]
      },
      {
        id: "del-av-ops",
        titleEn: "Live Show Audio/Visual Engineering",
        titleAr: "التشغيل الهندسي المباشر للفعالية",
        itemsEn: [
          "On-Site Senior Sound Engineers & Lighting Directors",
          "Live Video Switching & Recording Feeds",
          "Emergency Standby Equipment & Power Redundancy"
        ],
        itemsAr: [
          "مهندسو صوت وإضاءة محترفون للإشراف المباشر",
          "تحويل إشارات الفيديو المباشرة والتسجيل",
          "أجهزة ومصادر طاقة احتياطية جاهزة للطوارئ"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Venue Inspection & Spec",
        titleAr: "معاينة القاعة وتحديد المواصفات",
        descriptionEn: "Evaluating room acoustics, ceiling rigging points, power availability, and cable runs.",
        descriptionAr: "فحص صوتيات القاعة، ونقاط التعليق بالسقف، ومصادر الطاقة ومسارات الكابلات.",
        outputsEn: ["Technical Spec Document"],
        outputsAr: ["وثيقة المواصفات الفنية"]
      },
      {
        id: "design",
        stageNumber: "02",
        titleEn: "Lighting & Acoustic Plots",
        titleAr: "مخططات الإضاءة وتوزيع الصوت",
        descriptionEn: "CAD truss rigging plots, DMX universe patch tables, and acoustic coverage heatmaps.",
        descriptionAr: "مخططات تعليق الهياكل، وجداول قنوات التحكم، وخرائط التغطية الصوتية.",
        outputsEn: ["Rigging & Patch Plan"],
        outputsAr: ["مخطط التوزيع الهندسي"]
      },
      {
        id: "deliver",
        stageNumber: "03",
        titleEn: "Live Operation",
        titleAr: "التشغيل الميداني الحي",
        descriptionEn: "Flawless real-time mixing, lighting cue execution, and video signal switching.",
        descriptionAr: "تحكم صوتي دقيق، وتنفيذ مشاهد الإضاءة، وإدارة إشارات الفيديو الحية.",
        outputsEn: ["Flawless Technical Delivery"],
        outputsAr: ["أداء فني متكامل"]
      }
    ],
    serviceSpecificModule: {
      type: "av-venue-selector",
      titleEn: "Venue Scale & Equipment Estimator",
      titleAr: "حاسبة متطلبات القاعات والمعدات",
      subtitleEn: "Explore recommended sound and lighting setups based on your event venue scale.",
      subtitleAr: "استكشف التجهيزات الصوتية والضوئية الموصى بها حسب حجم ومساحة موقع الفعالية.",
      data: {
        venues: [
          { typeEn: "Conference Ballroom (Up to 500 Pax)", typeAr: "قاعات المؤتمرات (حتى ٥٠٠ ضيف)", audioEn: "Discrete Column Speakers + 4 Wireless Handhelds", lightingEn: "Warm Stage Wash + LED Room Perimeter Uplights", videoEn: "Central 6m x 3.5m Ultra-Fine Pitch LED Wall" },
          { typeEn: "Arena / Auditorium (500 - 3,000 Pax)", typeAr: "الصالات الكبرى (٥٠٠ - ٣,٠٠٠ ضيف)", audioEn: "Compact Line Array System + Subwoofers + IEM Monitors", lightingEn: "Truss Moving Heads + Stage Blinders + Followspots", videoEn: "Main 12m x 5m Screen + Dual Side Relay Displays" },
          { typeEn: "Outdoor Festival / Stadium (3,000+ Pax)", typeAr: "المهرجانات المفتوحة والملاعب (٣,٠٠٠+ ضيف)", audioEn: "Heavy-Duty Line Array Towers + Delay Stacks", lightingEn: "High-Output IP65 Outdoor Moving Beams & Strobes", videoEn: "Daylight-Viewable High-Lumen Outdoor LED Wall" }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "av-safety",
        titleEn: "Certified Truss & Rigging Load Verification",
        titleAr: "اعتماد أحمال الهياكل ونقاط التعليق",
        descriptionEn: "Certified rigging hardware, dual-safety steel wire backups, and engineer load calculations on every flown structure.",
        descriptionAr: "معدات تعليق معتمدة، وأسلاك فولاذية احتياطية، وحسابات أحمال هندسية دقيقة لكل هيكل معلق."
      }
    ],
    relatedServiceSlugs: ["mega-events", "shows-performances", "fabrication-branding", "experiential-activations"]
  },

  // 7. ATTRACTION OPERATIONS SUPPORT
  {
    id: "attraction-operations",
    slug: "attraction-operations",
    aliases: ["operations", "venue-operations", "facility-management"],
    titleEn: "Attraction Operations & Management Support",
    titleAr: "الدعم والتشغيل للمرافق الترفيهية",
    categoryEn: "Operations & Management",
    categoryAr: "التشغيل والإدارة",
    taglineEn: "Turnkey frontline staffing, standard operating procedures, guest safety management, and facility maintenance for venues.",
    taglineAr: "طواقم تشغيل مدربة، وأدلة إجراءات قياسية، وإدارة سلامة الزوار، وصيانة المرافق الترفيهية.",
    heroOutcomeEn: "Seamless Daily Facility Operations Delivering High Customer Satisfaction and Zero Safety Incidents.",
    heroOutcomeAr: "تشغيل يومي منضبط للمرافق يحقق أعلى معدلات رضا الزوار ومعايير أمان تامة.",
    supportingStatementEn: "E3 deploys experienced venue managers, trained guest-service crews, daily safety inspectors, and maintenance technicians to run entertainment venues smoothly 365 days a year.",
    supportingStatementAr: "توفر إي ثري مديري مرافق ذوي خبرة، وطواقم خدمة زوار، وفنيي صيانة وفحص سلامة لتشغيل الوجهات الترفيهية بانضباط طوال العام.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "365-Day",
        labelEn: "Continuous Facility Operations",
        labelAr: "تشغيل مستمر على مدار العام",
        sourceEn: "Permanent entertainment destination management",
        sourceAr: "إدارة وجهات ومرافق ترفيهية دائمة في قطر"
      },
      {
        value: "Full SOP",
        labelEn: "Standardized Playbooks",
        labelAr: "أدلة إجراءات تشغيلية معتمدة",
        sourceEn: "Comprehensive opening, closing, safety, and cash audits",
        sourceAr: "إجراءات موثقة للافتتاح والإغلاق والسلامة والمبيعات"
      },
      {
        value: "Trained",
        labelEn: "Bilingual Guest Service Staff",
        labelAr: "كوادر خدمة زوار ثنائية اللغة",
        sourceEn: "Customer-service and first-aid certified personnel",
        sourceAr: "طواقم مدربة على خدمة العملاء والإسعافات الأولية"
      }
    ],
    wowHow: [
      {
        id: "ops-1",
        titleEn: "Warm Hospitality & Fast Queues",
        titleAr: "ضيافة دافئة وسرعة في خدمة الزوار",
        wowEn: "Visitors experience welcoming staff, swift ticketing entry, pristine hygiene throughout the venue, and prompt assistance whenever needed.",
        wowAr: "يستمتع الزوار باستقبال مرحب، ودخول سريع عبر البوابات، ونظافة فائقة في كل ركن، ومساعدة فورية عند الحاجة.",
        howEn: "E3 implements strict crowd pacing protocols, continuous sanitation rotations, daily staff briefings, and automated ticket scanning stations.",
        howAr: "نطبق بروتوكولات تنظيم تدفق الزوار، وجولات تعقيم دورية، وإحاطات يومية للطواقم، وبوابات مسح تذاكر سريعة."
      },
      {
        id: "ops-2",
        titleEn: "Proactive Facility Care & Longevity",
        titleAr: "صيانة وقائية تحافظ على الأصول",
        wowEn: "Attractions, soundscapes, lighting, and games operate at 100% functionality day after day without visible wear or downtime.",
        wowAr: "تعمل الألعاب والأنظمة الصوتية والضوئية بكفاءة تامة يومياً دون أعطال أو تراجع في الجودة.",
        howEn: "Our technical team executes scheduled preventive maintenance checklists, overnight repairs, and certified safety inspections.",
        howAr: "ينفذ فريقنا الفني جداول صيانة وقائية معتمدة، وإصلاحات ليلية، وفحوصات سلامة دورية موثقة."
      }
    ],
    objectives: [
      {
        id: "obj-full-management",
        labelEn: "Outsource Full Venue Operations to an Expert Team",
        labelAr: "إسناد تشغيل المرفق بالكامل لفريق متخصص",
        descriptionEn: "End-to-end management covering staffing, ticketing, maintenance, hygiene, and daily financial reconciliation.",
        descriptionAr: "إدارة متكاملة تشمل التوظيف، والتذاكر، والصيانة، والنظافة، والمطابقة المالية اليومية.",
        highlightedCapabilityIds: ["cap-ops-staffing", "cap-ops-sop", "cap-ops-maintenance"],
        recommendedDeliverableIds: ["del-ops-framework", "del-ops-reporting"]
      },
      {
        id: "obj-staffing-support",
        labelEn: "Deploy Trained Temporary Staff for High Seasons",
        labelAr: "توفير كوادر تشغيل مؤهلة للمواسم والإجازات",
        descriptionEn: "Fast scaling of customer service hosts, ride operators, and cashiers during peak holiday periods.",
        descriptionAr: "زيادة سريعة في طواقم خدمة العملاء ومشغلي الألعاب والمحاسبين خلال فترات الذروة والمواسم.",
        highlightedCapabilityIds: ["cap-ops-staffing"],
        recommendedDeliverableIds: ["del-ops-framework"]
      }
    ],
    capabilities: [
      {
        id: "cap-ops-staffing",
        titleEn: "Turnkey Frontline Staffing & Management",
        titleAr: "توفير وإدارة الكوادر الميدانية",
        descriptionEn: "Recruitment, uniforming, customer service training, schedule management, and supervisory oversight for venue staff.",
        descriptionAr: "استقطاب وتدريب وتوحيد الزي وإدارة جداول الورديات والإشراف الميداني على موظفي الوجهة.",
        deliverablesEn: ["Staffing Roster & Schedule", "Customer Service Playbook", "Daily Attendance Logs"],
        deliverablesAr: ["جدول مناوبات الكوادر", "دليل خدمة العملاء", "سجلات الحضور والانضباط اليومية"],
        suitableForEn: ["Theme Parks", "FECs", "Exhibition Centers"],
        suitableForAr: ["المدن الترفيهية", "مراكز الترفيه العائلي", "المعارض"],
        tagEn: "Staffing",
        tagAr: "الكوادر البشرية",
        colSpan: 2
      },
      {
        id: "cap-ops-sop",
        titleEn: "Standard Operating Procedures (SOPs)",
        titleAr: "أدلة وإجراءات التشغيل القياسية",
        descriptionEn: "Comprehensive written manuals covering daily opening/closing, safety inspections, lost children protocols, and cash audits.",
        descriptionAr: "أدلة تشغيلية مفصلة تغطي إجراءات الافتتاح والإغلاق، وفحص السلامة، وحالات الطوارئ والمطابقة المالية.",
        deliverablesEn: ["Complete SOP Manual", "Emergency Action Plan (EAP)", "Incident Report Templates"],
        deliverablesAr: ["دليل إجراءات التشغيل الكامل", "خطة الاستجابة للطوارئ", "نماذج توثيق البلاغات والحوادث"],
        suitableForEn: ["All Public Venues"],
        suitableForAr: ["كافة المرافق العامة"],
        tagEn: "SOPs",
        tagAr: "إجراءات التشغيل"
      },
      {
        id: "cap-ops-maintenance",
        titleEn: "Preventive Maintenance & Facility Audits",
        titleAr: "الصيانة الوقائية والفحص الدوري للمرافق",
        descriptionEn: "Daily mechanical checks, inflatable pressure logging, electrical inspections, and rapid-response repair crews.",
        descriptionAr: "فحص ميكانيكي يومي، ومراقبة ضغط الألعاب المطاطية، وفحص الدوائر الكهربائية وفرق إصلاح سريعة.",
        deliverablesEn: ["Daily Maintenance Logs", "Spare Parts Inventory", "Monthly Safety Audit Report"],
        deliverablesAr: ["سجلات الصيانة اليومية", "إدارة قطع الغيار", "تقرير تدقيق السلامة الشهري"],
        suitableForEn: ["Permanent & Pop-Up Venues"],
        suitableForAr: ["الوجهات الدائمة والمؤقتة"],
        tagEn: "Maintenance",
        tagAr: "الصيانة الوقائية"
      }
    ],
    engagementModels: [
      {
        id: "eng-ops-contract",
        titleEn: "Turnkey Operational Management Contract",
        titleAr: "عقد الإدارة والتشغيل المتكامل للمرفق",
        subtitleEn: "Complete Peace of Mind for Venue Owners",
        subtitleAr: "إدارة متكاملة تمنح المطورين راحة البال",
        descriptionEn: "E3 manages 100% of staff, customer service, cleaning oversight, ticketing, maintenance, and monthly financial reporting.",
        descriptionAr: "تدير إي ثري كافة الكوادر، وخدمة العملاء، والنظافة، والتذاكر، والصيانة والتقارير المالية الشهرية.",
        bestForEn: "Malls, leisure developers, amusement attractions",
        bestForAr: "المجمعات، المطورون العقاريون، والوجهات الترفيهية",
        typicalDurationEn: "6 Month to 3 Year Contracts",
        typicalDurationAr: "عقود من ٦ أشهر إلى ٣ سنوات"
      }
    ],
    deliverables: [
      {
        id: "del-ops-framework",
        titleEn: "Operational Framework & Setup",
        titleAr: "إعداد الإطار التشغيلي والهيكلي",
        itemsEn: [
          "Venue-Specific SOP Manuals & Emergency Plans",
          "Recruited, Vetted & Uniformed Staff Roster",
          "POS & Cashless Ticketing Setup and Integration"
        ],
        itemsAr: [
          "أدلة التشغيل القياسية وخطط الطوارئ الخاصة بالوجهة",
          "طاقم عمل مدرب ومجهز بالزي الموحد",
          "تجهيز وربط نقاط البيع وبوابات التذاكر الرقمية"
        ]
      },
      {
        id: "del-ops-reporting",
        titleEn: "Daily Management & Analytics",
        titleAr: "الإدارة اليومية والتقارير الدورية",
        itemsEn: [
          "Daily Operational & Financial Settlement Logs",
          "Monthly Footfall, Revenue & Incident Reporting",
          "Continuous Preventative Maintenance Certification"
        ],
        itemsAr: [
          "سجلات التسوية المالية والتشغيلية اليومية",
          "تقارير شهرية للإقبال والإيرادات والسلامة",
          "شهادات وتقارير الصيانة الوقائية المستمرة"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Operational Audit",
        titleAr: "التدقيق والتقييم التشغيلي",
        descriptionEn: "Reviewing existing layout, footfall patterns, pain points, and staffing requirements.",
        descriptionAr: "دراسة المرفق الحالي، ومعدلات الإقبال، وتحديد احتياجات الكوادر ونقاط التحسين.",
        outputsEn: ["Operational Gap Analysis"],
        outputsAr: ["تحليل الفجوات التشغيلية"]
      },
      {
        id: "develop",
        stageNumber: "02",
        titleEn: "SOPs & Staff Deployment",
        titleAr: "إعداد الأدلة وتعيين الكوادر",
        descriptionEn: "Drafting venue-specific SOPs, onboarding bilingual hosts, and conducting safety drills.",
        descriptionAr: "صياغة أدلة العمل، وتدريب الموظفين وإجراء تجارب السلامة والإخلاء.",
        outputsEn: ["Trained Team & Complete SOPs"],
        outputsAr: ["فريق عمل مدرب وأدلة تشغيل جاهزة"]
      },
      {
        id: "operate",
        stageNumber: "03",
        titleEn: "Daily Operational Excellence",
        titleAr: "التشغيل اليومي وإدارة الجودة",
        descriptionEn: "Smooth daily opening, customer service leadership, routine safety maintenance, and reconciled reporting.",
        descriptionAr: "الافتتاح اليومي المنضبط، وقيادة خدمة العملاء، والصيانة الدورية والتقارير المالية.",
        outputsEn: ["Monthly Operational Report"],
        outputsAr: ["التقرير التشغيلي الشهري"]
      }
    ],
    serviceSpecificModule: {
      type: "operations-sop-model",
      titleEn: "Operations Hierarchy & SOP Structure",
      titleAr: "الهيكل التشغيلي ونموذج الإجراءات القياسية",
      subtitleEn: "Clear organizational accountability for venue safety, hospitality, and revenue.",
      subtitleAr: "هيكل تنظيمي واضح يضمن السلامة وجودة الضيافة وحماية الإيرادات.",
      data: {
        roles: [
          { titleEn: "Duty Venue Manager", titleAr: "مدير المرفق المناوب", dutiesEn: "Overall site leadership, authority coordination, incident management, and daily financial reconciliation." },
          { titleEn: "Guest Experience Supervisor", titleAr: "مشرف تجربة الزوار", dutiesEn: "Floor hospitality, queue management, birthday party coordination, and customer feedback resolution." },
          { titleEn: "Safety & Maintenance Technician", titleAr: "فني السلامة والصيانة", dutiesEn: "Hourly pressure checks, emergency electrical readiness, and immediate ride/equipment maintenance." },
          { titleEn: "Cashier & Access Host", titleAr: "موظف التذاكر والاستقبال", dutiesEn: "Fast ticket scanning, POS transactions, wristband assignment, and entry flow control." }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "ops-safety",
        titleEn: "First-Aid Certified Staff & Safety Protocol",
        titleAr: "كوادر حاصلة على شهادات الإسعافات الأولية",
        descriptionEn: "Trained venue floor supervisors with active first-aid certifications and direct lines to emergency healthcare response.",
        descriptionAr: "مشرفون ميدانيون حاصلون على شهادات إسعاف معتمدة وبروتوكول اتصال فوري مع الطوارئ."
      }
    ],
    relatedServiceSlugs: ["fec-development", "kids-concepts", "ticketing-solutions", "mega-events"]
  },

  // 8. TICKETING & ACCREDITATION SOLUTIONS
  {
    id: "ticketing-solutions",
    slug: "ticketing-solutions",
    aliases: ["ticketing", "accreditation", "bookingqube", "access-control"],
    titleEn: "Ticketing & Accreditation Solutions",
    titleAr: "حلول التذاكر وإدارة الدخول والاعتمادات",
    categoryEn: "Digital & Access Control",
    categoryAr: "الأنظمة الرقمية وإدارة الدخول",
    taglineEn: "Proprietary BookingQube platform, multi-gate RFID access control, cashless wristbands, and VIP accreditation.",
    taglineAr: "منصة BookingQube للتذاكر، وبوابات الدخول الذكية RFID، والأساور الرقمية وإدارة تصاريح الوفود.",
    heroOutcomeEn: "Frictionless Digital Ticket Sales and Sub-Second Event Gate Access with Zero Scalping.",
    heroOutcomeAr: "مبيعات تذاكر رقمية سلسة ودخول سريع للبوابات في أجزاء من الثانية مع حماية تامة ضد التزوير.",
    supportingStatementEn: "Powered by E3's proprietary BookingQube ecosystem, we deliver seamless online booking, instant QR ticketing, cashless in-venue spending, and multi-tier accreditation badges for Qatar's premier events.",
    supportingStatementAr: "مدعومة بنظام BookingQube المتطور من إي ثري، نقدم حلول حجز التذاكر عبر الإنترنت، والمسح الذكي الفوري، والأساور الرقمية للدفع، وبطاقات الاعتماد الرسمية.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "< 1 Sec",
        labelEn: "Gate Scanning Throughput",
        labelAr: "سرعة مسح التذاكر عند البوابات",
        sourceEn: "High-speed optical turnstile and handheld scanners",
        sourceAr: "أجهزة مسح بصرية وبوابات ذكية فائقة السرعة"
      },
      {
        value: "QPay / Apple",
        labelEn: "Local & Global Payment Gateways",
        labelAr: "دعم بوابات الدفع المحلية والعالمية",
        sourceEn: "Integrated NAPS/Debit, Visa, Mastercard, Apple Pay",
        sourceAr: "دعم بطاقات الخصم المباشر وفيزا وماستركارد وآبل باي"
      },
      {
        value: "Real-Time",
        labelEn: "Live Attendance Analytics Dashboard",
        labelAr: "لوحة تحليلات الحضور اللحظية",
        sourceEn: "Instant capacity tracking and fraud prevention",
        sourceAr: "تتبع الطاقة الاستيعابية ومنع التزوير فورياً"
      }
    ],
    wowHow: [
      {
        id: "tix-1",
        titleEn: "Instant Mobile Booking & Zero Lines",
        titleAr: "حجز فوري عبر الهاتف وبدون طوابير",
        wowEn: "Guests select seats, choose time slots, pay seamlessly with Apple Pay in 3 clicks, and walk through access turnstiles without waiting.",
        wowAr: "يختار الزائر المقعد والوقت ويدفع بسهولة عبر آبل باي في ٣ نقرات، ويعبر البوابات فوراً دون انتظار.",
        howEn: "BookingQube leverages cloud-native microservices, offline-capable handheld validation scanners, and dynamic QR anti-screenshot security.",
        howAr: "يعتمد نظام BookingQube على خوادم سحابية سريعة، وأجهزة مسح تعمل دون انقطاع حتى بدون إنترنت، ورموز QR متغيرة تمنع نسخ الشاشة."
      },
      {
        id: "tix-2",
        titleEn: "Cashless In-Venue Freedom",
        titleAr: "دفع رقمي ذكي داخل الوجهة",
        wowEn: "Visitors tap their RFID wristband to buy food, play games, and claim photos without carrying wallets or cash.",
        wowAr: "يستخدم الزوار أساورهم الرقمية لشراء الوجبات والمشاركة في الألعاب والحصول على الصور دون الحاجة لحمل النقود.",
        howEn: "We sync wristbands with central venue wallets, enabling real-time balance top-ups, family grouping, and instant POS reconciliation.",
        howAr: "نربط الأساور بالمحافظ الرقمية المركزية مع إمكانية الشحن الفوري ومطابقة مبيعات نقاط البيع لحظياً."
      }
    ],
    objectives: [
      {
        id: "obj-event-ticketing",
        labelEn: "Sell Tickets & Manage Entry for a Major Festival",
        labelAr: "بيع التذاكر وإدارة بوابات الدخول لمهرجان كبير",
        descriptionEn: "Branded online booking portal with time-slot management, VIP tiers, and multi-lane turnstile access.",
        descriptionAr: "بوابة حجز رقمية متطورة بهوية الفعالية، وإدارة فئات التذاكر وبوابات الدخول متعددة المسارات.",
        highlightedCapabilityIds: ["cap-tix-platform", "cap-tix-gates"],
        recommendedDeliverableIds: ["del-tix-online", "del-tix-hardware"]
      },
      {
        id: "obj-vip-accreditation",
        labelEn: "Issue Accreditation Passes for Media & Delegates",
        labelAr: "إصدار بطاقات وتصاريح الدخول للوفود والإعلام",
        descriptionEn: "Secure portal for photo registration, credential validation, multi-zone security zoning, and holographic RFID badges.",
        descriptionAr: "نظام آمن لتسجيل البيانات والصور، واعتماد التصاريح، وتحديد مناطق الوصول ببطاقات ذكية.",
        highlightedCapabilityIds: ["cap-tix-accreditation"],
        recommendedDeliverableIds: ["del-tix-hardware"]
      }
    ],
    capabilities: [
      {
        id: "cap-tix-platform",
        titleEn: "BookingQube Online Ticketing Engine",
        titleAr: "منصة BookingQube لحجز التذاكر عبر الإنترنت",
        descriptionEn: "Custom-branded booking pages, interactive seat maps, promo codes, bundle pricing, and real-time sales reporting.",
        descriptionAr: "صفحات حجز مخصصة بهوية الفعالية، وخرائط مقاعد تفاعلية، وأكواد خصم وتقارير مبيعات لحظية.",
        deliverablesEn: ["Branded Web Booking Portal", "Payment Gateway Integration", "Live Sales Dashboard"],
        deliverablesAr: ["بوابة حجز رقمية مخصصة", "ربط بوابات الدفع الإلكتروني", "لوحة تحليلات المبيعات الحية"],
        suitableForEn: ["Festivals", "FECs", "Concerts", "Conferences"],
        suitableForAr: ["المهرجانات", "مراكز الترفيه", "الحفلات", "المؤتمرات"],
        tagEn: "Online Ticketing",
        tagAr: "التذاكر الرقمية",
        colSpan: 2
      },
      {
        id: "cap-tix-gates",
        titleEn: "Turnstiles & Handheld Gate Access Control",
        titleAr: "بوابات الدخول الذكية وأجهزة المسح السريع",
        descriptionEn: "High-speed optical scanners, NFC/RFID wristband readers, automated pedestrian turnstiles, and offline validation failover.",
        descriptionAr: "أجهزة مسح بصرية فائقة السرعة، وقارئات أساور RFID، وبوابات دخول ذكية تدعم العمل دون إنترنت في حال الطوارئ.",
        deliverablesEn: ["Scanning Hardware Fleet", "Turnstile Entry Lanes", "On-Site Technical Support Team"],
        deliverablesAr: ["أجهزة وقارئات مسح التذاكر", "مسارات بوابات الدخول", "فريق دعم فني ميداني للبوابات"],
        suitableForEn: ["Stadiums", "Exhibitions", "Theme Parks"],
        suitableForAr: ["الملاعب", "المعارض", "المدن الترفيهية"],
        tagEn: "Gate Hardware",
        tagAr: "أجهزة البوابات"
      },
      {
        id: "cap-tix-accreditation",
        titleEn: "VIP & Delegate Accreditation Systems",
        titleAr: "أنظمة الاعتمادات وبطاقات كبار الشخصيات",
        descriptionEn: "Online credential submission portal, background check verification workflow, high-durability holographic badge printing, and access zoning.",
        descriptionAr: "بوابة إلكترونية لتقديم البيانات، وإصدار وطباعة البطاقات الذكية، وتحديد صلاحيات الدخول للمناطق المختلفة.",
        deliverablesEn: ["Accreditation Registration Portal", "Printed Smart Badges", "Zone Access Readers"],
        deliverablesAr: ["بوابة تسجيل الاعتمادات", "بطاقات ذكية مطبوعة", "قارئات التصاريح للمناطق المغلقة"],
        suitableForEn: ["Summits", "Sports Tournaments", "National Events"],
        suitableForAr: ["القمم والمؤتمرات", "البطولات الرياضية", "الفعاليات الرسمية"],
        tagEn: "Accreditation",
        tagAr: "الاعتمادات والتصاريح"
      }
    ],
    engagementModels: [
      {
        id: "eng-tix-turnkey",
        titleEn: "Turnkey Ticketing & Gate Service",
        titleAr: "خدمة التذاكر وإدارة البوابات المتكاملة",
        subtitleEn: "Software, Hardware & On-Site Gate Staff",
        subtitleAr: "المنصة والأجهزة وطواقم تنظيم البوابات",
        descriptionEn: "Full deployment of BookingQube ticketing portal, gate hardware rental, network setup, and on-site supervisor support.",
        descriptionAr: "توفير المنصة الرقمية، وتأجير أجهزة البوابات، وشبكة الاتصال، وتوفير المشرفين الميدانيين على الدخول.",
        bestForEn: "Public festivals, ticketed concerts, theme attractions",
        bestForAr: "المهرجانات الجماهيرية، الحفلات، والوجهات الترفيهية",
        typicalDurationEn: "Per-Event or Multi-Year Contract",
        typicalDurationAr: "لكل فعالية أو عقود سنوية"
      }
    ],
    deliverables: [
      {
        id: "del-tix-online",
        titleEn: "Digital Ticketing & Commercial Setup",
        titleAr: "إعداد المنصة والتذاكر الرقمية",
        itemsEn: [
          "Custom Branded Online Booking Portal",
          "Merchant Payment Settlement & Local Currency Gateways",
          "Tiered Ticket Inventory & Time-Slot Configuration"
        ],
        itemsAr: [
          "بوابة حجز رقمية متكاملة بهوية المشروع",
          "ربط الحسابات البنكية وبوابات الدفع بالريال القطري",
          "تحديد فئات التذاكر وتوزيع المواعيد والقدرة الاستيعابية"
        ]
      },
      {
        id: "del-tix-hardware",
        titleEn: "Gate Deployment & Live Entry Reports",
        titleAr: "تجهيز البوابات والتقارير اللحظية",
        itemsEn: [
          "Delivered & Configured Optical Scanning Terminals",
          "On-Site Gate Coordinator & Help Desk",
          "Post-Event Audit Report on Attendance, Scans & Revenue"
        ],
        itemsAr: [
          "أجهزة وبوابات مسح تذاكر مبرمجة ومختبرة",
          "مشرفو بوابات ومكتب مساعدة فنية للزوار",
          "تقرير تدقيق ختامي للحضور والمبيعات والمسح"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Capacity & Pricing Strategy",
        titleAr: "استراتيجية التسعير والطاقة الاستيعابية",
        descriptionEn: "Setting ticket categories, pricing tiers, time slots, and access gate throughput targets.",
        descriptionAr: "تحديد فئات التذاكر، والأسعار، والأوقات، ومعدل تدفق الزوار المطلوب عند البوابات.",
        outputsEn: ["Inventory & Gate Matrix"],
        outputsAr: ["مصفوفة التذاكر والبوابات"]
      },
      {
        id: "develop",
        stageNumber: "02",
        titleEn: "Platform Configuration",
        titleAr: "إعداد وبرمجة المنصة",
        descriptionEn: "Setting up online portals, payment gateways, and custom branded e-tickets.",
        descriptionAr: "برمجة صفحة الحجز، وربط بوابات الدفع، وتصميم التذاكر الإلكترونية بهوية الفعالية.",
        outputsEn: ["Live Booking URL"],
        outputsAr: ["رابط الحجز المفعل"]
      },
      {
        id: "deliver",
        stageNumber: "03",
        titleEn: "On-Site Gate Operations",
        titleAr: "التشغيل الميداني للبوابات",
        descriptionEn: "Deploying hardware, staff gate briefing, sub-second scanning, and fraud prevention.",
        descriptionAr: "تركيب الأجهزة، وتوجيه موظفي البوابات، ومسح التذاكر السريع ومنع الدخول المكرر.",
        outputsEn: ["Final Attendance & Audit Report"],
        outputsAr: ["تقرير الحضور والتدقيق النهائي"]
      }
    ],
    serviceSpecificModule: {
      type: "ticketing-flow",
      titleEn: "BookingQube Architecture & Demo",
      titleAr: "بنية نظام BookingQube وطلب تجربة حية",
      subtitleEn: "Enterprise-grade ticketing infrastructure built for Qatar's premier live destinations.",
      subtitleAr: "بنية تحتية رقمية متطورة لإدارة التذاكر صُممت لأرقى الوجهات والفعاليات في قطر.",
      data: {
        steps: [
          { step: "01", titleEn: "Multi-Channel Sales", titleAr: "قنوات بيع متعددة", descEn: "Online portal, mobile app, partner resale APIs, and on-site box office POS." },
          { step: "02", titleEn: "Secure Instant Pass", titleAr: "تذاكر آمنة فورية", descEn: "Dynamic anti-screenshot QR codes, Apple Wallet integration, and RFID wristbands." },
          { step: "03", titleEn: "Sub-Second Gate Scan", titleAr: "مسح فوري عند البوابات", descEn: "Optical turnstiles validating tickets in < 800ms with offline caching." },
          { step: "04", titleEn: "Audited Financial Settlement", titleAr: "مطابقة مالية معتمدة", descEn: "Daily reconciled reports, merchant bank payouts, and audit-ready data." }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "tix-sec",
        titleEn: "Qatar PDPL & Financial Data Security",
        titleAr: "الامتثال لقانون حماية البيانات الشخصية والمدفوعات",
        descriptionEn: "PCI-DSS compliant payment tokenization and full compliance with Qatar's Personal Data Privacy Law (PDPL).",
        descriptionAr: "حماية تامة لبيانات المدفوعات والامتثال الكامل لقانون حماية خصوصية البيانات الشخصية في قطر."
      }
    ],
    relatedServiceSlugs: ["mega-events", "fec-development", "attraction-operations", "shows-performances"]
  },

  // 9. FABRICATION & BRANDING
  {
    id: "fabrication-branding",
    slug: "fabrication-branding",
    aliases: ["fabrication", "branding", "scenic-build", "carpentry", "stage-build"],
    titleEn: "Fabrication, Scenic Build & Branding",
    titleAr: "التصنيع والإنتاج الفضائي والهوية",
    categoryEn: "Creative Engineering",
    categoryAr: "الهندسة الإبداعية والتصنيع",
    taglineEn: "In-house joinery, steel framing, 3D foam sculpting, architectural acrylics, and large-format print production in Doha.",
    taglineAr: "أعمال نجارة وهياكل معدنية ونحت ثلاثي الأبعاد وأكريليك معماري وطباعة عملاقة في مصانعنا بالدوحة.",
    heroOutcomeEn: "Flawlessly Finished Physical Environments and Custom Thematic Structures Built with In-House Precision.",
    heroOutcomeAr: "بيئات واقعية فائقة التشطيب وهياكل استثنائية مصنعة بدقة في ورشنا المحلية.",
    supportingStatementEn: "Operating our own dedicated fabrication atelier in Qatar, E3 produces bespoke stage sets, exhibition pavilions, immersive photo moments, and architectural signage with uncompromised craftsmanship.",
    supportingStatementAr: "من خلال ورشنا الإنتاجية المتكاملة في قطر، تصنع إي ثري المسارح، وأجنحة المعارض، والمجسمات التفاعلية، واللوحات الإرشادية بأعلى معايير الحرفية.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "In-House",
        labelEn: "Dedicated Doha Atelier",
        labelAr: "مصانع وورش إنتاجية متكاملة بالدوحة",
        sourceEn: "Direct control over joinery, metalwork & finishing",
        sourceAr: "تحكم كامل في النجارة والحدادة والدهانات"
      },
      {
        value: "Rapid",
        labelEn: "Local Turnaround & Customization",
        labelAr: "سرعة تنفيذ وتعديل محلي مباشر",
        sourceEn: "Zero international shipping delays for urgent builds",
        sourceAr: "تفادي تأخيرات الشحن الدولي للمشاريع العاجلة"
      },
      {
        value: "Precision",
        labelEn: "CNC & Laser Manufacturing",
        labelAr: "تصنيع دقيق عبر أجهزة CNC والليزر",
        sourceEn: "Computer-controlled millimeter accuracy",
        sourceAr: "دقة متناهية مطابقة للمخططات الهندسية"
      }
    ],
    wowHow: [
      {
        id: "fab-1",
        titleEn: "Museum-Grade Finishes & Scale",
        titleAr: "تشطيبات فاخرة بمستوى المتاحف الكبرى",
        wowEn: "Guests admire smooth automotive-grade lacquer finishes, massive sculptural arches, and illuminated 3D brand symbols that look flawless up close.",
        wowAr: "ينبهر الزوار بنعومة الدهانات الفاخرة، والأقواس المعمارية الضخمة، والشعارات المضيئة المتقنة من مسافات قريبة.",
        howEn: "E3 combines multi-axis CNC routing, structural internal steel skeletons, seamless joint sanding, and dust-free paint booth finishing.",
        howAr: "نجمع بين القص الآلي متعدد المحاور، والهياكل الفولاذية الداخلية، ومعالجة الفواصل، والدهان في غرف معزولة خالية من الغبار."
      },
      {
        id: "fab-2",
        titleEn: "Structural Strength & Public Safety",
        titleAr: "متانة إنشائية وأمان معتمد للجمهور",
        wowEn: "Massive outdoor installations withstand desert winds, heavy crowds, and seasonal weather without shifting or vibrating.",
        wowAr: "تصمد التركيبات الخارجية العملاقة أمام الرياح وعوامل الطقس وكثافة الحشود بثبات تام وأمان مطلق.",
        howEn: "Our structural engineers calculate wind load ballast, anchor weight distribution, non-toxic fire-rated treatments, and rounded safety contact points.",
        howAr: "يحسب مهندسونا أوزان التثبيت ومقاومة الرياح، والمعالجات المقاومة للحريق، وحواف الأمان الآمنة للمس."
      }
    ],
    objectives: [
      {
        id: "obj-stage-set",
        labelEn: "Build a Custom Stage Backdrop or Scenic Set",
        labelAr: "تصنيع ديكورات وخلفيات مسرحية مخصصة",
        descriptionEn: "Multi-layered illuminated scenic carpentry with integrated LED screens and acoustic cladding.",
        descriptionAr: "ديكورات مسرحية خشبية متعددة الطبقات مدمجة مع شاشات LED وعوازل صوتية.",
        highlightedCapabilityIds: ["cap-fab-joinery", "cap-fab-finishing"],
        recommendedDeliverableIds: ["del-fab-cad", "del-fab-install"]
      },
      {
        id: "obj-exhibition-stand",
        labelEn: "Fabricate a Bespoke Exhibition Pavilion or Kiosk",
        labelAr: "تصنيع جناح معرض فاخر أو كشك تفاعلي",
        descriptionEn: "High-end corporate pavilion with premium lacquer counters, backlit acrylic signage, and integrated display vitrines.",
        descriptionAr: "جناح عرض راقٍ بأسطح دهانات ممتازة وشعارات أكريليك مضيئة ومساحات عرض ذكية.",
        highlightedCapabilityIds: ["cap-fab-joinery", "cap-fab-signage"],
        recommendedDeliverableIds: ["del-fab-install"]
      }
    ],
    capabilities: [
      {
        id: "cap-fab-joinery",
        titleEn: "Custom Joinery & Structural Carpentry",
        titleAr: "النجارة المعمارية والهياكل الخشبية",
        descriptionEn: "Bespoke stage podiums, exhibition counters, geometric archways, curved reception desks, and modular wall partitioning.",
        descriptionAr: "منصات المسارح، وطاولات العرض، والأقواس الهندسية، ومكاتب الاستقبال المنحنية، والجدران الفاصلة.",
        deliverablesEn: ["Shop Drawings", "CNC Cutting Files", "Structural Joinery Build"],
        deliverablesAr: ["المخططات التنفيذية", "ملفات القص الآلي CNC", "التصنيع الخشبي المعتمد"],
        suitableForEn: ["Stages", "Exhibitions", "Retail Centers"],
        suitableForAr: ["المسارح", "المعارض", "المراكز التجارية"],
        tagEn: "Carpentry",
        tagAr: "النجارة المعمارية",
        colSpan: 2
      },
      {
        id: "cap-fab-finishing",
        titleEn: "Specialty Finishes & Paint Treatments",
        titleAr: "الدهانات والتشطيبات التخصصية",
        descriptionEn: "Automotive-grade high-gloss lacquering, faux stone texturing, metal patinas, and flame-retardant coatings.",
        descriptionAr: "دهانات لامعة فاخرة، وتعتيق الحجر والمعادن، ومعالجات مقاومة الحريق المعتمدة.",
        deliverablesEn: ["Sample Finish Boards", "Flame Retardant Certificate"],
        deliverablesAr: ["عينات التشطيبات", "شهادة مقاومة الحريق"],
        suitableForEn: ["VIP Pavilions", "Photo Moments"],
        suitableForAr: ["أجنحة كبار الشخصيات", "محطات التصوير"],
        tagEn: "Finishing",
        tagAr: "التشطيبات الفاخرة"
      },
      {
        id: "cap-fab-signage",
        titleEn: "3D Illuminated Brand Signage & Large Print",
        titleAr: "الشعارات المضيئة ثلاثية الأبعاد والطباعة الكبرى",
        descriptionEn: "Edge-lit acrylic letters, fabricated steel logos, neon flex installations, and large-format UV direct-to-substrate printing.",
        descriptionAr: "حروف أكريليك مضيئة، وشعارات معدنية، وإضاءات النيون، والطباعة المباشرة بالأشعة فوق البنفسجية UV.",
        deliverablesEn: ["Illuminated 3D Letters", "Large Format Banners", "Electrical Transformer Spec"],
        deliverablesAr: ["حروف ثلاثية الأبعاد مضيئة", "مطبوعات وبانرات عملاقة", "مخطط المحولات الكهربائية"],
        suitableForEn: ["Wayfinding", "Facades", "Backdrops"],
        suitableForAr: ["اللوحات الإرشادية", "الواجهات", "الخلفيات"],
        tagEn: "Signage & Print",
        tagAr: "الشعارات والطباعة"
      }
    ],
    engagementModels: [
      {
        id: "eng-fab-build-install",
        titleEn: "Atelier Fabrication & On-Site Installation",
        titleAr: "التصنيع بالورش والتركيب الميداني",
        subtitleEn: "Off-Site Manufacturing with Zero Venue Disruption",
        subtitleAr: "تصنيع خارجي مع تركيب سريع بالموقع",
        descriptionEn: "We pre-build and test all structures inside our Doha workshop, transporting finished modules to venue for rapid overnight assembly.",
        descriptionAr: "نقوم بتصنيع وتجربة كافة الهياكل مسبقاً في ورشنا بالدوحة ونقلها للتركيب السريع في الموقع.",
        bestForEn: "Exhibitions, conferences, stage backdrops, brand pop-ups",
        bestForAr: "المعارض، المؤتمرات، خلفيات المسارح، والمتاجر المؤقتة",
        typicalDurationEn: "1 to 6 Weeks",
        typicalDurationAr: "أسبوع إلى ٦ أسابيع"
      }
    ],
    deliverables: [
      {
        id: "del-fab-cad",
        titleEn: "Design & Technical Drawings",
        titleAr: "المخططات الهندسية والتنفيذية",
        itemsEn: [
          "Detailed 3D CAD Shop Drawings & Exploded Assemblies",
          "Material Specification & Finish Sample Approvals",
          "Structural Stability & Ballast Calculation"
        ],
        itemsAr: [
          "مخططات CAD تفصيلية وخرائط تجميع القطع",
          "اعتماد مواصفات المواد وعينات التشطيب",
          "حسابات الأوزان ومقاومة الرياح والتثبيت"
        ]
      },
      {
        id: "del-fab-install",
        titleEn: "Fabrication & Venue Handover",
        titleAr: "التصنيع والتسليم الميداني",
        itemsEn: [
          "Fully Fabricated, Painted and Wired Physical Structures",
          "Professional On-Site Assembly & Rigging Team",
          "Final Snagging, Cleaning and Authority Handover"
        ],
        itemsAr: [
          "هياكل مصنعة ومدهونة ومجهزة بالتوصيلات الكهربائية",
          "فريق تركيب متخصص وسريع في الموقع",
          "معالجة الملاحظات النهائية والتنظيف والتسليم"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "design",
        stageNumber: "01",
        titleEn: "Shop Drawings & Material Approval",
        titleAr: "المخططات التنفيذية واعتماد العينات",
        descriptionEn: "Translating creative concepts into millimetric fabrication CAD files and selecting wood, metal, acrylic, and paint samples.",
        descriptionAr: "تحويل الأفكار إلى مخططات تنفيذية بالمليمتر واعتماد عينات الخشب والمعدن والأكريليك والدهانات.",
        outputsEn: ["Approved Shop Drawings"],
        outputsAr: ["المخططات التنفيذية المعتمدة"]
      },
      {
        id: "develop",
        stageNumber: "02",
        titleEn: "Atelier Manufacturing & Pre-Fit",
        titleAr: "التصنيع والتركيب التجريبي بالورشة",
        descriptionEn: "CNC cutting, welding, joinery, surface sanding, spray booth painting, and complete pre-assembly check.",
        descriptionAr: "القص الآلي، واللحام، والنجارة، والدهان، والتركيب المسبق للتأكد من مطابقة المقاسات.",
        outputsEn: ["Quality Inspected Modules"],
        outputsAr: ["قطع مفحوصة ومطابقة للجودة"]
      },
      {
        id: "deliver",
        stageNumber: "03",
        titleEn: "On-Site Installation",
        titleAr: "التركيب والتسليم الميداني",
        descriptionEn: "Protected logistics transport, rapid on-site erection, electrical hookup, touch-ups, and handover.",
        descriptionAr: "نقل آمن للموقع، وتركيب سريع، وتوصيل الكهرباء واللمسات النهائية والتسليم.",
        outputsEn: ["Completed Physical Installation"],
        outputsAr: ["تسليم الموقع بالكامل"]
      }
    ],
    serviceSpecificModule: {
      type: "fabrication-materials",
      titleEn: "Materials, Finishes & Craftsmanship",
      titleAr: "المواد والتشطيبات والحرفية الإنتاجية",
      subtitleEn: "Explore our in-house material capabilities across carpentry, metals, plastics, and lighting.",
      subtitleAr: "استكشف قدراتنا التصنيعية في الأخشاب والمعادن والأكريليك والإضاءة المدمجة.",
      data: {
        materials: [
          { nameEn: "Structural Timber & Joinery", nameAr: "الأخشاب المعمارية والنجارة", descEn: "Commercial MDF, birch plywood, solid hardwoods, and laminated fire-rated panels." },
          { nameEn: "Architectural Metals", nameAr: "المعادن والهياكل الفولاذية", descEn: "TIG/MIG welded steel trussing, lightweight aluminum framing, and powder-coated metalwork." },
          { nameEn: "Specialty Acrylics & Resins", nameAr: "الأكريليك والبوليمرات التخصصية", descEn: "Laser-cut diffuser acrylic, frosted light panels, high-density carved foam, and cast resin." },
          { nameEn: "Integrated LED Illumination", nameAr: "الإضاءة الذكية المدمجة", descEn: "Concealed LED strip channels, neon flex contouring, and automated DMX driver boxes." }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "fab-flame",
        titleEn: "Civil Defence Flame-Retardant Certification",
        titleAr: "شهادات مقاومة الحريق المعتمدة",
        descriptionEn: "All fabrics, paints, and wood treatments comply with Qatar Civil Defence fire resistance and smoke toxicity standards.",
        descriptionAr: "كافة الأقمشة والأخشاب والدهانات معالجة ومطابقة لمعايير الدفاع المدني لمقاومة الحريق."
      }
    ],
    relatedServiceSlugs: ["experiential-activations", "mega-events", "av-stage-rentals", "fec-development"]
  },

  // 10. FEASIBILITY, DESIGN & RESEARCH
  {
    id: "feasibility-design-research",
    slug: "feasibility-design-research",
    aliases: ["feasibility-research", "design-research", "research", "feasibility", "entertainment-consulting"],
    titleEn: "Feasibility, Design & Research",
    titleAr: "دراسات الجدوى والتصميم والأبحاث",
    categoryEn: "Strategy & Advisory",
    categoryAr: "الاستشارات والتخطيط الاستراتيجي",
    taglineEn: "Commercial feasibility studies, entertainment masterplanning, guest demographic research, and concept benchmarking in Qatar.",
    taglineAr: "دراسات الجدوى المالية، والتخطيط الاستراتيجي للترفيه، وأبحاث الجمهور والمقارنات المعيارية في قطر.",
    heroOutcomeEn: "Actionable, Data-Driven Entertainment Strategies that De-Risk Capital Investment.",
    heroOutcomeAr: "استراتيجيات ترفيهية دقيقة مبنية على البيانات تحمي الاستثمارات وتعظم عوائد المشاريع.",
    supportingStatementEn: "E3 provides institutional investors, tourism authorities, and real estate developers with comprehensive commercial feasibility models, audience demand forecasts, and masterplanned design concepts grounded in Qatar's real market dynamics.",
    supportingStatementAr: "تقدم إي ثري للمستثمرين والجهات السياحية والمطورين العقاريين دراسات جدوى مالية متكاملة وتوقعات للطلب مدعومة بالبيانات الواقعية للسوق القطري.",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09277-2.jpg",
    heroMediaType: "IMAGE",
    verifiedProofPoints: [
      {
        value: "Data-Led",
        labelEn: "Qatar Market Intelligence",
        labelAr: "بيانات وتحليلات السوق القطري",
        sourceEn: "Real historical footfall and pricing benchmarks",
        sourceAr: "بيانات واقعية لمعدلات الإقبال والإنفاق في قطر"
      },
      {
        value: "Bankable",
        labelEn: "Investor & Tender-Ready Reports",
        labelAr: "تقارير مالية جاهزة للمستثمرين والممولين",
        sourceEn: "Structured 5-year and 10-year pro-forma financial models",
        sourceAr: "نماذج مالية وتدفقات نقدية لخمس وعشر سنوات"
      },
      {
        value: "Bespoke",
        labelEn: "Integrated Spatial Concepts",
        labelAr: "مفاهيم معمارية وتخطيطية متكاملة",
        sourceEn: "Concept designs ready for immediate architectural handover",
        sourceAr: "تصاميم مفاهيمية قابلة للتنفيذ المعماري الفوري"
      }
    ],
    wowHow: [
      {
        id: "res-1",
        titleEn: "Inspiring Vision & Tangible Business Reality",
        titleAr: "رؤية طموحة مدعومة بجدوى تجارية ملموسة",
        wowEn: "Stakeholders and investment boards see a compelling 3D vision of an extraordinary destination, supported by undeniable commercial logic and revenue projections.",
        wowAr: "يرى المستثمرون رؤية بصرية ثلاثية الأبعاد لوجهة ترفيه استثنائية، مدعومة بأرقام وتوقعات مالية دقيقة وموثوقة.",
        howEn: "E3 reconciles creative imagination with local spending power, tourist influx forecasts, operational OPEX realities, and attraction asset lifespan.",
        howAr: "نوازن بين الابتكار الإبداعي والقدرة الشرائية المحلية، وحركة السياحة، وتكاليف التشغيل (OPEX) ودورة حياة الأصول."
      },
      {
        id: "res-2",
        titleEn: "Clear Decision Gates & Risk Mitigation",
        titleAr: "محطات اتخاذ قرار واضحة وحماية الاستثمار",
        wowEn: "Clients proceed through each project milestone with complete certainty, knowing that every square meter and capital dollar is optimized.",
        wowAr: "يمضي العميل في مراحل المشروع بثقة تامة، مع التأكد من تحقيق أعلى عائد استثماري لكل متر مربع.",
        howEn: "We structure phased decision gates, sensitivity stress-tests (best/base/worst case), and attraction vendor price benchmarking.",
        howAr: "نصمم مراحل قرار واضحة، ونماذج اختبار الحساسية المالية (أفضل/أسوأ التوقعات)، ومقارنات أسعار الموردين الدوليين."
      }
    ],
    objectives: [
      {
        id: "obj-new-destination-study",
        labelEn: "Commission a Feasibility Study for a New Entertainment Venue",
        labelAr: "طلب دراسة جدوى لوجهة ترفيهية أو سياحية جديدة",
        descriptionEn: "Comprehensive financial modeling, attraction mix selection, Capex/Opex budgeting, and space sizing.",
        descriptionAr: "نمذجة مالية شاملة، واختيار مزيج الألعاب، وتحديد ميزانيات التأسيس والتشغيل والمساحات المطلوبة.",
        highlightedCapabilityIds: ["cap-res-feasibility", "cap-res-concept"],
        recommendedDeliverableIds: ["del-res-report", "del-res-model"]
      },
      {
        id: "obj-market-research",
        labelEn: "Conduct Audience & Competitor Market Research in Qatar",
        labelAr: "إجراء دراسة سوق وتحليل للمنافسين وسلوك الجمهور",
        descriptionEn: "Deep-dive analysis into target family demographics, willingness to pay, gap analysis, and seasonal trends.",
        descriptionAr: "تحليل دقيق لشرائح العائلات، ومستوى الإنفاق، والفجوات الترفيهية والمواسم في السوق المحلي.",
        highlightedCapabilityIds: ["cap-res-market"],
        recommendedDeliverableIds: ["del-res-report"]
      }
    ],
    capabilities: [
      {
        id: "cap-res-feasibility",
        titleEn: "Commercial Feasibility & Pro-Forma Modeling",
        titleAr: "دراسات الجدوى الاقتصادية والنمذجة المالية",
        descriptionEn: "10-year revenue and expense forecasts, IRR/NPV calculations, dynamic ticket pricing models, and F&B/retail spend ratios.",
        descriptionAr: "توقعات الإيرادات والمصروفات لعشر سنوات، وحسابات العائد الداخلي IRR، ومعدلات إنفاق التذاكر والمطاعم.",
        deliverablesEn: ["Comprehensive Feasibility Report", "Dynamic Excel Financial Model", "Executive Summary Deck"],
        deliverablesAr: ["تقرير الجدوى الشامل", "نموذج مالي تفاعلي Excel", "عرض تنفيذي لأصحاب القرار"],
        suitableForEn: ["New Destinations", "Mall Expansions", "Resort Attractions"],
        suitableForAr: ["الوجهات الجديدة", "توسعات المجمعات", "المنتجعات السياحية"],
        tagEn: "Financial Advisory",
        tagAr: "الاستشارات المالية",
        colSpan: 2
      },
      {
        id: "cap-res-concept",
        titleEn: "Concept Masterplanning & Attraction Mix",
        titleAr: "المخطط الرئيسي ومزيج الألعاب والتجارب",
        descriptionEn: "Spatial zoning, throughput modeling, attraction category curation (soft play, kinetic, VR, retail, dining), and thematic narrative.",
        descriptionAr: "التوزيع المكاني، ونمذجة الطاقة الاستيعابية، واختيار مزيج الألعاب (حركية، افتراضية، مطاعم، تسوق) والفكرة العامة.",
        deliverablesEn: ["Attraction Mix Matrix", "Spatial Zoning Masterplan", "Thematic Mood Boards"],
        deliverablesAr: ["مصفوفة مزيج الألعاب", "المخطط العام لتوزيع المناطق", "لوحات الإلهام البصري"],
        suitableForEn: ["Theme Parks", "FECs", "Waterfronts"],
        suitableForAr: ["المدن الترفيهية", "مراكز الترفيه العائلي", "الواجهات البحرية"],
        tagEn: "Concept Strategy",
        tagAr: "التخطيط الاستراتيجي"
      },
      {
        id: "cap-res-market",
        titleEn: "Audience Research & Benchmarking",
        titleAr: "أبحاث الجمهور والمقارنات المعيارية",
        descriptionEn: "Quantitative family survey data, regional GCC entertainment benchmarking, and local spend capacity analysis.",
        descriptionAr: "استطلاعات رأي العائلات، ومقارنات معيارية مع أبرز مراكز الترفيه في الخليج، وتحليل القدرة الشرائية.",
        deliverablesEn: ["Market Benchmarking Dossier", "Consumer Persona Profiles", "Competitive Gap Analysis"],
        deliverablesAr: ["ملف المقارنات المعيارية", "شخصيات وسلوكيات المستهلكين", "تحليل الفجوات التنافسية"],
        suitableForEn: ["Tourism Authorities", "Investors"],
        suitableForAr: ["الهيئات السياحية", "المستثمرون"],
        tagEn: "Market Research",
        tagAr: "أبحاث السوق"
      }
    ],
    engagementModels: [
      {
        id: "eng-res-study",
        titleEn: "Comprehensive Feasibility & Masterplan Study",
        titleAr: "دراسة الجدوى والمخطط العام المتكامل",
        subtitleEn: "Independent Advisory for Investment Decision-Making",
        subtitleAr: "استشارات مستقلة لدعم القرارات الاستثمارية",
        descriptionEn: "E3 delivers complete market research, 10-year pro-forma financial models, attraction mix strategies, and visual concept books ready for funding boards.",
        descriptionAr: "تقدم إي ثري دراسة سوقية متكاملة، ونموذجاً مالياً مفصلاً لعشر سنوات، ومزيج الألعاب وكتيب المفهوم البصري.",
        bestForEn: "Developers, institutional funds, mall owners, government entities",
        bestForAr: "المطورون، الصناديق الاستثمارية، أصحاب المولات، والجهات الحكومية",
        typicalDurationEn: "4 to 8 Weeks",
        typicalDurationAr: "٤ إلى ٨ أسابيع"
      }
    ],
    deliverables: [
      {
        id: "del-res-report",
        titleEn: "Feasibility Study & Market Dossier",
        titleAr: "تقرير دراسة الجدوى وأبحاث السوق",
        itemsEn: [
          "Comprehensive Market & Competitive Analysis",
          "Attraction Mix Recommendations & Capacity Sizing",
          "Concept Thematic Narrative & Spatial Zoned Masterplan"
        ],
        itemsAr: [
          "تحليل شامل للسوق والمنافسين ونقاط القوة",
          "توصيات مزيج الألعاب وحسابات الطاقة الاستيعابية",
          "المفهوم الإبداعي والمخطط العام لتوزيع المساحات"
        ]
      },
      {
        id: "del-res-model",
        titleEn: "Financial Pro-Forma & Investment Deck",
        titleAr: "النموذج المالي والعرض الاستثماري",
        itemsEn: [
          "Dynamic 10-Year Pro-Forma Financial Model (Capex/Opex/IRR/NPV)",
          "Sensitivity & Stress-Test Risk Scenarios",
          "Executive Board Investment Presentation Deck"
        ],
        itemsAr: [
          "نموذج مالي تفاعلي لعشر سنوات (Capex/Opex/IRR/NPV)",
          "سيناريوهات تحليل الحساسية واختبارات المخاطر",
          "عرض تقديمي تنفيذي موجه لمجلس الإدارة والمستثمرين"
        ]
      }
    ],
    lifecycleStages: [
      {
        id: "discover",
        stageNumber: "01",
        titleEn: "Market Baseline & Data Gathering",
        titleAr: "جمع البيانات وتحليل السوق",
        descriptionEn: "Analyzing site location, demographics, local spending patterns, and competitive offerings.",
        descriptionAr: "تحليل موقع المشروع، والتركيبة السكانية، وأنماط الإنفاق والعروض المنافسة.",
        outputsEn: ["Market Baseline Brief"],
        outputsAr: ["ملف بيانات السوق الأساسية"]
      },
      {
        id: "design",
        stageNumber: "02",
        titleEn: "Financial Modeling & Mix",
        titleAr: "النمذجة المالية وتحديد الألعاب",
        descriptionEn: "Structuring Capex and Opex assumptions, sizing attraction zones, and running sensitivity tests.",
        descriptionAr: "وضع فرضيات التكاليف الرأسمالية والتشغيلية، وتوزيع المساحات، واختبار السيناريوهات.",
        outputsEn: ["Draft Financial Model"],
        outputsAr: ["مسودة النموذج المالي"]
      },
      {
        id: "deliver",
        stageNumber: "03",
        titleEn: "Final Study & Board Presentation",
        titleAr: "التقرير النهائي وعرض مجلس الإدارة",
        descriptionEn: "Delivering the bankable study dossier, concept visual book, and executive presentation.",
        descriptionAr: "تسليم ملف الدراسة المعتمدة، وكتيب التصاميم المفاهيمية والعرض التنفيذي النهائي.",
        outputsEn: ["Final Feasibility Dossier"],
        outputsAr: ["ملف الجدوى المعتمد"]
      }
    ],
    serviceSpecificModule: {
      type: "research-study-gates",
      titleEn: "Feasibility Study Gates & Methodology",
      titleAr: "محطات دراسة الجدوى ومنهجية العمل",
      subtitleEn: "A transparent four-gate decision structure to evaluate entertainment investments with precision.",
      subtitleAr: "هيكل منهجي من ٤ محطات لتقييم الاستثمارات الترفيهية بدقة وموثوقية.",
      data: {
        gates: [
          { gate: "Gate 1", titleEn: "Market Demand & Catchment", titleAr: "الطلب السوقي والنطاق الجغرافي", descEn: "Demographics, disposable income, and competitor footfall." },
          { gate: "Gate 2", titleEn: "Attraction Mix & Masterplanning", titleAr: "مزيج الألعاب والمخطط العام", descEn: "Spatial sizing, guest dwell time, and capacity optimization." },
          { gate: "Gate 3", titleEn: "Financial Pro-Forma & ROI", titleAr: "النموذج المالي والعائد الاستثماري", descEn: "Capex budgets, operational margins, IRR, and payback period." },
          { gate: "Gate 4", titleEn: "Execution Roadmap & Procurement", titleAr: "خطة التنفيذ والتوريد", descEn: "Vendor shortlist, timeline to opening, and operational risk mitigation." }
        ]
      }
    },
    enterpriseReadiness: [
      {
        id: "res-bank",
        titleEn: "Bankable & Institutional Advisory Standards",
        titleAr: "معايير استشارية معتمدة للبنوك والمستثمرين",
        descriptionEn: "All financial models, market assumptions, and Capex estimates are structured to meet institutional due-diligence requirements.",
        descriptionAr: "كافة النماذج والفرضيات المالية مصممة لتلبية متطلبات التدقيق المالي للمؤسسات التمويلية."
      }
    ],
    relatedServiceSlugs: ["fec-development", "kids-concepts", "attraction-operations", "mega-events"]
  }
];

/**
 * Resolves any service slug or legacy alias to its CanonicalService definition.
 */
export function getCanonicalService(slug: string): CanonicalService | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return CANONICAL_SERVICES.find(s => s.slug === clean || s.aliases.includes(clean));
}

/**
 * Returns all 10 canonical service definitions.
 */
export function getAllCanonicalServices(): CanonicalService[] {
  return CANONICAL_SERVICES;
}

/**
 * Normalizes any legacy alias to the canonical primary slug.
 */
export function resolveServiceSlug(slug: string): string {
  const service = getCanonicalService(slug);
  return service ? service.slug : slug;
}
