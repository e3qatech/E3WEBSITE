import { PrismaClient } from '@prisma/client';

export const e3ServicesSeed = [
  {
    slug: "mega-events",
    title_en: "Mega Events",
    title_ar: "الفعاليات الكبرى",
    tagline_en: "Built for scale. Designed for wonder.",
    tagline_ar: "مصممة للضخامة، ومبنية لصناعة الدهشة.",
    category_eyebrow_en: "Large-Scale Event Delivery",
    category_eyebrow_ar: "تنفيذ الفعاليات واسعة النطاق",
    metric_label_en: "Audience Scale",
    metric_label_ar: "حجم الجمهور",
    metric_value: "760K+",
    card_thumbnail_description_en: "Cinematic aerial crowd scene with event lights, stage zones, branded activations, and large public gathering energy.",
    card_thumbnail_description_ar: "مشهد سينمائي من الأعلى لجمهور كبير مع إضاءة فعاليات، مناطق عروض، وتفعيل براندات بأجواء جماهيرية قوية.",
    description_en: "E3 plans, designs, produces, staffs, tickets, operates, and reports large-scale public and private events across Qatar. From tourism festivals and fan zones to city-wide parades and indoor entertainment destinations, E3 connects creative ambition with operational control.",
    description_ar: "تقوم E3 بتخطيط وتصميم وإنتاج وتشغيل الفعاليات الكبرى في قطر، مع إدارة التذاكر، التوظيف، حركة الجمهور، والتقارير التشغيلية. من المهرجانات السياحية والفان زون إلى المسيرات والوجهات الترفيهية الداخلية، تجمع E3 بين الفكرة الإبداعية والتنفيذ المنظم.",
    process_stepper: [
      { phase_title_en: "Discovery", phase_title_ar: "اكتشاف المتطلبات" },
      { phase_title_en: "Feasibility", phase_title_ar: "دراسة الجدوى" },
      { phase_title_en: "Creative Direction", phase_title_ar: "التوجه الإبداعي" },
      { phase_title_en: "Production Planning", phase_title_ar: "تخطيط الإنتاج" },
      { phase_title_en: "Fabrication & Setup", phase_title_ar: "التصنيع والتركيب" },
      { phase_title_en: "Live Operations", phase_title_ar: "التشغيل المباشر" },
      { phase_title_en: "Reporting & Recap", phase_title_ar: "التقارير والملخص النهائي" }
    ]
  },
  {
    slug: "family-entertainment-centers",
    title_en: "Family Entertainment Centers",
    title_ar: "مراكز الترفيه العائلي",
    tagline_en: "Permanent attractions with repeatable family value.",
    tagline_ar: "وجهات ترفيهية مستدامة بقيمة عائلية متجددة.",
    category_eyebrow_en: "FEC Development & Operations",
    category_eyebrow_ar: "تطوير وتشغيل مراكز الترفيه",
    metric_label_en: "Concept Formats",
    metric_label_ar: "أنواع المفاهيم",
    metric_value: "4+",
    card_thumbnail_description_en: "Premium indoor FEC with neon attraction zones, kids play structures, arcade experiences, party area, café, and controlled guest flow.",
    card_thumbnail_description_ar: "مركز ترفيه داخلي راقٍ يضم مناطق ألعاب، أركيد، منطقة حفلات، كافيه، ومسارات حركة واضحة للزوار.",
    description_en: "E3 develops and operates Family Entertainment Center concepts that combine attraction planning, guest journey design, themed environments, safety, staffing, ticketing, and daily operations. These spaces are built to attract families, increase dwell time, and support long-term venue value.",
    description_ar: "تطوّر E3 وتدير مفاهيم مراكز الترفيه العائلي من خلال تخطيط الألعاب، تصميم رحلة الزائر، البيئة الترفيهية، السلامة، التوظيف، التذاكر، والتشغيل اليومي. صُممت هذه الوجهات لجذب العائلات وزيادة مدة الزيارة وتعزيز قيمة الموقع.",
    process_stepper: [
      { phase_title_en: "Site Study", phase_title_ar: "دراسة الموقع" },
      { phase_title_en: "Concept Mix", phase_title_ar: "تحديد مزيج الألعاب" },
      { phase_title_en: "Guest Journey", phase_title_ar: "تصميم رحلة الزائر" },
      { phase_title_en: "Attraction Integration", phase_title_ar: "دمج الألعاب والتجارب" },
      { phase_title_en: "Operations Setup", phase_title_ar: "تجهيز التشغيل" },
      { phase_title_en: "Launch", phase_title_ar: "الإطلاق" },
      { phase_title_en: "Optimization", phase_title_ar: "التحسين المستمر" }
    ]
  },
  {
    slug: "kids-play-concepts",
    title_en: "Kids Play Concepts",
    title_ar: "مفاهيم لعب الأطفال",
    tagline_en: "Where play, learning, and imagination meet.",
    tagline_ar: "حيث يلتقي اللعب بالتعلم والخيال.",
    category_eyebrow_en: "Edutainment & Play Design",
    category_eyebrow_ar: "تصميم اللعب والترفيه التعليمي",
    metric_label_en: "Play Styles",
    metric_label_ar: "أنماط اللعب",
    metric_value: "Indoor + Outdoor",
    card_thumbnail_description_en: "Colorful kids play zone with activity tables, ball pits, soft play structures, driving school details, creative workshops, and branded décor.",
    card_thumbnail_description_ar: "منطقة لعب أطفال ملونة تضم طاولات أنشطة، مسبح كرات، ألعاب ناعمة، مدرسة قيادة، ورش إبداعية، وديكور براند مخصص.",
    description_en: "E3 creates custom kids play environments, edutainment concepts, activity zones, inflatable play areas, driving schools, creative workshops, and branded family spaces. Each concept balances fun, safety, learning, movement, and strong visual storytelling.",
    description_ar: "تصمم E3 بيئات لعب مخصصة للأطفال تشمل مفاهيم ترفيه تعليمي، مناطق أنشطة، ألعاب نفخ، مدارس قيادة للأطفال، ورش إبداعية، ومساحات عائلية تحمل هوية مميزة. كل مفهوم يوازن بين المتعة، السلامة، التعلم، الحركة، والسرد البصري.",
    process_stepper: [
      { phase_title_en: "Audience Mapping", phase_title_ar: "تحديد الفئة العمرية" },
      { phase_title_en: "Play Concept", phase_title_ar: "تطوير فكرة اللعب" },
      { phase_title_en: "Safety Planning", phase_title_ar: "تخطيط السلامة" },
      { phase_title_en: "Spatial Design", phase_title_ar: "تصميم المساحة" },
      { phase_title_en: "Build & Branding", phase_title_ar: "البناء والهوية" },
      { phase_title_en: "Staff Training", phase_title_ar: "تدريب الفريق" },
      { phase_title_en: "Live Experience", phase_title_ar: "تشغيل التجربة" }
    ]
  },
  {
    slug: "experiential-activations",
    title_en: "Experiential Activations",
    title_ar: "التجارب التفاعلية",
    tagline_en: "Turn passive visitors into active participants.",
    tagline_ar: "حوّل الزوار من مشاهدين إلى مشاركين.",
    category_eyebrow_en: "Brand, Mall & Public Activations",
    category_eyebrow_ar: "تفعيل البراندات والمولات والوجهات العامة",
    metric_label_en: "Engagement Focus",
    metric_label_ar: "تركيز التجربة",
    metric_value: "Participation",
    card_thumbnail_description_en: "Interactive brand activation with game stations, digital screens, product touchpoints, photo moments, and guest participation.",
    card_thumbnail_description_ar: "تفعيل تفاعلي لعلامة تجارية يضم ألعاب، شاشات رقمية، نقاط تجربة المنتج، لحظات تصوير، ومشاركة الزوار.",
    description_en: "E3 designs and delivers experiential activations for brands, malls, launches, sports moments, public campaigns, and seasonal events. The goal is to create memorable touchpoints that drive participation, social sharing, brand recall, and measurable engagement.",
    description_ar: "تصمم E3 وتنفذ تجارب تفاعلية للعلامات التجارية، المولات، إطلاق المنتجات، الفعاليات الرياضية، الحملات العامة، والمواسم. الهدف هو خلق نقاط تفاعل مميزة تزيد المشاركة، التفاعل الاجتماعي، تذكر البراند، وقياس النتائج.",
    process_stepper: [
      { phase_title_en: "Brand Brief", phase_title_ar: "استلام موجز البراند" },
      { phase_title_en: "Experience Strategy", phase_title_ar: "استراتيجية التجربة" },
      { phase_title_en: "Interaction Design", phase_title_ar: "تصميم التفاعل" },
      { phase_title_en: "Prototype & Test", phase_title_ar: "النموذج والاختبار" },
      { phase_title_en: "Fabrication", phase_title_ar: "التصنيع" },
      { phase_title_en: "Activation Delivery", phase_title_ar: "تنفيذ التفعيل" },
      { phase_title_en: "Engagement Report", phase_title_ar: "تقرير التفاعل" }
    ]
  },
  {
    slug: "shows-performances",
    title_en: "Shows & Performances",
    title_ar: "العروض والفقرات الترفيهية",
    tagline_en: "Programmed entertainment that keeps audiences moving.",
    tagline_ar: "برامج ترفيهية تحافظ على تفاعل الجمهور.",
    category_eyebrow_en: "Stage, Roaming & Live Entertainment",
    category_eyebrow_ar: "العروض المسرحية والجوالة والمباشرة",
    metric_label_en: "Performance Formats",
    metric_label_ar: "أنواع العروض",
    metric_value: "Stage + Roaming",
    card_thumbnail_description_en: "Live stage show with performers, mascots, roaming acts, LED backdrop, audience interaction, and programmed entertainment flow.",
    card_thumbnail_description_ar: "عرض مباشر على المسرح مع مؤدين، شخصيات، عروض جوالة، خلفية LED، تفاعل الجمهور، وبرنامج ترفيهي منظم.",
    description_en: "E3 curates and manages stage shows, mascot performances, roaming entertainment, family shows, live acts, and programmed entertainment calendars. Each performance plan is designed around audience timing, venue flow, theme, production value, and guest engagement.",
    description_ar: "تنظم E3 العروض المسرحية، الشخصيات الترفيهية، العروض الجوالة، عروض العائلات، الفقرات الحية، والجداول الترفيهية. يتم تصميم كل برنامج حسب توقيت الجمهور، حركة الموقع، الثيم، جودة الإنتاج، وتفاعل الزوار.",
    process_stepper: [
      { phase_title_en: "Entertainment Brief", phase_title_ar: "موجز الترفيه" },
      { phase_title_en: "Talent Selection", phase_title_ar: "اختيار المواهب" },
      { phase_title_en: "Show Programming", phase_title_ar: "برمجة العروض" },
      { phase_title_en: "Technical Planning", phase_title_ar: "التخطيط التقني" },
      { phase_title_en: "Rehearsal", phase_title_ar: "البروفات" },
      { phase_title_en: "Live Show Control", phase_title_ar: "إدارة العرض المباشر" },
      { phase_title_en: "Performance Review", phase_title_ar: "مراجعة الأداء" }
    ]
  },
  {
    slug: "e3-rentals",
    title_en: "E3 Rentals",
    title_ar: "تأجير معدات وتجارب E3",
    tagline_en: "Ready-to-deploy attractions, games, and event equipment.",
    tagline_ar: "تجارب وألعاب ومعدات جاهزة للتشغيل.",
    category_eyebrow_en: "Attractions, Games & Equipment Rental",
    category_eyebrow_ar: "تأجير الألعاب والتجارب والمعدات",
    metric_label_en: "Rental Scope",
    metric_label_ar: "نطاق التأجير",
    metric_value: "Multi-Category",
    card_thumbnail_description_en: "Premium rental lineup showing inflatables, VR simulator, LED games, arcade units, interactive sports games, and event equipment.",
    card_thumbnail_description_ar: "مجموعة تأجير احترافية تضم ألعاب نفخ، محاكاة VR، ألعاب LED، أركيد، ألعاب رياضية تفاعلية، ومعدات فعاليات.",
    description_en: "E3 provides rental solutions for inflatables, VR 360 simulators, Multiball LED, arcade games, sports challenges, interactive attractions, event equipment, and entertainment systems. Rentals can be supplied as standalone items or delivered as a managed activation package.",
    description_ar: "توفر E3 حلول تأجير لألعاب النفخ، محاكيات VR 360، Multiball LED، ألعاب الأركيد، التحديات الرياضية، التجارب التفاعلية، معدات الفعاليات، وأنظمة الترفيه. يمكن تقديمها كعناصر منفصلة أو كحزمة تشغيل متكاملة.",
    process_stepper: [
      { phase_title_en: "Requirement Check", phase_title_ar: "تحديد الاحتياج" },
      { phase_title_en: "Asset Selection", phase_title_ar: "اختيار المعدات" },
      { phase_title_en: "Site Readiness", phase_title_ar: "جاهزية الموقع" },
      { phase_title_en: "Logistics", phase_title_ar: "اللوجستيات" },
      { phase_title_en: "Installation", phase_title_ar: "التركيب" },
      { phase_title_en: "Operation Support", phase_title_ar: "دعم التشغيل" },
      { phase_title_en: "Dismantle & Return", phase_title_ar: "الفك والإرجاع" }
    ]
  },
  {
    slug: "ticketing-solutions",
    title_en: "Ticketing Solutions",
    title_ar: "حلول التذاكر",
    tagline_en: "From booking to access control, every guest flow matters.",
    tagline_ar: "من الحجز إلى الدخول، كل خطوة في رحلة الزائر مهمة.",
    category_eyebrow_en: "Booking, Access & Reporting",
    category_eyebrow_ar: "الحجز والدخول والتقارير",
    metric_label_en: "Flow Coverage",
    metric_label_ar: "تغطية الرحلة",
    metric_value: "End-to-End",
    card_thumbnail_description_en: "Ticketing control setup with mobile booking screen, handheld scanners, entry gates, wristbands, dashboards, and crowd flow lines.",
    card_thumbnail_description_ar: "نظام تذاكر يشمل شاشة حجز، أجهزة مسح، بوابات دخول، أساور، لوحات بيانات، ومسارات حركة الجمهور.",
    description_en: "E3 supports ticketing solutions through BookingQube integration, ticket categories, access control, capacity planning, guest flow, scan points, daily reports, and on-ground ticketing support. The system is designed to reduce friction and improve operational visibility.",
    description_ar: "تدعم E3 حلول التذاكر من خلال تكامل BookingQube، فئات التذاكر، التحكم بالدخول، تخطيط السعة، حركة الزوار، نقاط المسح، التقارير اليومية، والدعم الميداني للتذاكر. النظام مصمم لتسهيل الدخول وتحسين وضوح التشغيل.",
    process_stepper: [
      { phase_title_en: "Ticket Strategy", phase_title_ar: "استراتيجية التذاكر" },
      { phase_title_en: "Category Setup", phase_title_ar: "إعداد الفئات" },
      { phase_title_en: "Booking Integration", phase_title_ar: "تكامل الحجز" },
      { phase_title_en: "Access Planning", phase_title_ar: "تخطيط الدخول" },
      { phase_title_en: "On-Ground Setup", phase_title_ar: "التجهيز الميداني" },
      { phase_title_en: "Live Monitoring", phase_title_ar: "المراقبة المباشرة" },
      { phase_title_en: "Sales & Attendance Report", phase_title_ar: "تقرير المبيعات والحضور" }
    ]
  },
  {
    slug: "fabrication-branding",
    title_en: "Fabrication & Branding",
    title_ar: "التصنيع والبراندنج",
    tagline_en: "Physical builds that carry the experience identity.",
    tagline_ar: "تصاميم واقعية تحمل هوية التجربة.",
    category_eyebrow_en: "Scenic Build, Signage & Event Identity",
    category_eyebrow_ar: "البناء الديكوري واللوحات وهوية الفعالية",
    metric_label_en: "Build Type",
    metric_label_ar: "نوع التنفيذ",
    metric_value: "Custom",
    card_thumbnail_description_en: "Workshop and event site scene with custom booths, signage, props, scenic structures, branded arches, stage elements, and installation team.",
    card_thumbnail_description_ar: "مشهد ورشة وموقع فعالية يضم أكشاك مخصصة، لوحات، مجسمات، هياكل ديكورية، بوابات براند، عناصر مسرح، وفريق تركيب.",
    description_en: "E3 fabricates custom structures, booths, signage, props, scenic builds, stage elements, mall branding, photo moments, and event identity assets. The service connects creative design with practical buildability, installation, durability, and venue requirements.",
    description_ar: "تنفذ E3 الهياكل المخصصة، الأكشاك، اللوحات، المجسمات، الديكورات، عناصر المسرح، براندنج المولات، نقاط التصوير، وعناصر هوية الفعالية. تربط هذه الخدمة بين التصميم الإبداعي وقابلية التنفيذ والتركيب والمتانة ومتطلبات الموقع.",
    process_stepper: [
      { phase_title_en: "Design Intent", phase_title_ar: "تحديد نية التصميم" },
      { phase_title_en: "Material Planning", phase_title_ar: "تخطيط المواد" },
      { phase_title_en: "Technical Drawings", phase_title_ar: "الرسومات الفنية" },
      { phase_title_en: "Fabrication", phase_title_ar: "التصنيع" },
      { phase_title_en: "Brand Application", phase_title_ar: "تطبيق الهوية" },
      { phase_title_en: "Site Installation", phase_title_ar: "التركيب في الموقع" },
      { phase_title_en: "Handover", phase_title_ar: "التسليم" }
    ]
  },
  {
    slug: "design-research",
    title_en: "Design & Research",
    title_ar: "التصميم والدراسات",
    tagline_en: "Every strong experience starts with a sharp idea and a clear plan.",
    tagline_ar: "كل تجربة قوية تبدأ بفكرة واضحة وخطة دقيقة.",
    category_eyebrow_en: "Concept, Feasibility & Guest Journey",
    category_eyebrow_ar: "المفهوم والجدوى ورحلة الزائر",
    metric_label_en: "Planning Output",
    metric_label_ar: "مخرجات التخطيط",
    metric_value: "Concept → Feasibility",
    card_thumbnail_description_en: "Premium planning desk with moodboards, venue layouts, feasibility notes, 3D sketches, guest journey map, and concept presentation screens.",
    card_thumbnail_description_ar: "طاولة تخطيط احترافية تضم لوحات إلهام، مخططات موقع، ملاحظات جدوى، اسكتشات ثلاثية الأبعاد، خريطة رحلة الزائر، وشاشات عرض للمفهوم.",
    description_en: "E3 develops concepts, feasibility studies, creative direction, spatial plans, visitor journeys, operational logic, proposal narratives, and design research. This service helps clients understand what can be built, why it works, how it operates, and what experience it creates.",
    description_ar: "تقوم E3 بتطوير المفاهيم، دراسات الجدوى، التوجه الإبداعي، التخطيط المكاني، رحلة الزائر، منطق التشغيل، محتوى العروض، وأبحاث التصميم. تساعد هذه الخدمة العملاء على فهم ما يمكن تنفيذه، ولماذا ينجح، وكيف يعمل، وما التجربة التي يصنعها.",
    process_stepper: [
      { phase_title_en: "Research", phase_title_ar: "البحث" },
      { phase_title_en: "Benchmarking", phase_title_ar: "دراسة المراجع" },
      { phase_title_en: "Concept Development", phase_title_ar: "تطوير المفهوم" },
      { phase_title_en: "Feasibility Study", phase_title_ar: "دراسة الجدوى" },
      { phase_title_en: "Spatial Planning", phase_title_ar: "التخطيط المكاني" },
      { phase_title_en: "Guest Journey Mapping", phase_title_ar: "رسم رحلة الزائر" },
      { phase_title_en: "Proposal Pack", phase_title_ar: "حزمة العرض" }
    ]
  }
];

export async function seedServices(prisma: PrismaClient) {
  console.log('Seeding B2B Services...');
  for (const s of e3ServicesSeed) {
    const processArr = s.process_stepper.map((step) => ({
      title: step.phase_title_en,
      desc: step.phase_title_ar, 
      icon: "CheckCircle2"
    }));

    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        titleEn: s.title_en,
        titleAr: s.title_ar,
        taglineEn: s.tagline_en,
        taglineAr: s.tagline_ar,
        category: s.category_eyebrow_en,
        successMetricLabel: s.metric_label_en,
        successMetricValue: s.metric_value,
        contentEn: s.description_en,
        contentAr: s.description_ar,
        process: processArr,
        isFeatured: true,
        isVisible: true
      },
      create: {
        slug: s.slug,
        titleEn: s.title_en,
        titleAr: s.title_ar,
        taglineEn: s.tagline_en,
        taglineAr: s.tagline_ar,
        category: s.category_eyebrow_en,
        successMetricLabel: s.metric_label_en,
        successMetricValue: s.metric_value,
        contentEn: s.description_en,
        contentAr: s.description_ar,
        process: processArr,
        isFeatured: true,
        isVisible: true
      }
    });
    console.log(`Upserted service: ${s.slug}`);
  }
}
