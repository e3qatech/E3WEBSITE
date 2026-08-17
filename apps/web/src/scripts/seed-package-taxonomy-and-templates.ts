import { db } from "../lib/db";

export const CANONICAL_CATEGORIES = [
  {
    slug: "celebrate",
    nameEn: "Celebrate",
    nameAr: "أعياد الميلاد والاحتفالات",
    descriptionEn: "Unforgettable birthday parties, VIP celebrations, milestones, and exclusive venue buyouts.",
    descriptionAr: "حفلات أعياد ميلاد لا تُنسى، احتفالات خاصة، وحجوزات حصرية في أرقى الوجهات.",
    icon: "PartyPopper",
    coverMediaUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    theme: "purple",
    audience: "Families, Kids & VIPs",
    sortOrder: 1,
    isActive: true,
    isFeatured: true
  },
  {
    slug: "learn-explore",
    nameEn: "Learn & Explore",
    nameAr: "التعليم والاستكشاف",
    descriptionEn: "Curriculum-aligned school excursions, nursery visits, STEM workshops, and road-safety learning.",
    descriptionAr: "رحلات مدرسية تفاعلية، زيارات الحضانات، ورش عمل تعليمية وتجارب استكشافية مميزة.",
    icon: "GraduationCap",
    coverMediaUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    theme: "amber",
    audience: "Schools, Nurseries & Educational Groups",
    sortOrder: 2,
    isActive: true,
    isFeatured: true
  },
  {
    slug: "play-together",
    nameEn: "Play Together",
    nameAr: "المجموعات والأصدقاء",
    descriptionEn: "Action-packed group bookings for friends, family reunions, youth clubs, and community sports teams.",
    descriptionAr: "باقات المجموعات وتجمعات الأصدقاء والعائلات والأندية الرياضية والشبابية.",
    icon: "Users",
    coverMediaUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80",
    theme: "emerald",
    audience: "Friends, Teens & Family Groups",
    sortOrder: 3,
    isActive: true,
    isFeatured: true
  },
  {
    slug: "corporate",
    nameEn: "Corporate",
    nameAr: "الشركات وبناء الفرق",
    descriptionEn: "High-impact team building, corporate family days, brand activations, and employee reward outings.",
    descriptionAr: "تطوير روح الفريق وتحديات الشركات والفعاليات العائلية للمؤسسات وحفلات التكريم.",
    icon: "Briefcase",
    coverMediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    theme: "blue",
    audience: "Corporate Teams, Government & Enterprises",
    sortOrder: 4,
    isActive: true,
    isFeatured: true
  },
  {
    slug: "events",
    nameEn: "Events",
    nameAr: "الفعاليات والمهرجانات",
    descriptionEn: "Large-scale private events, school carnivals, mall activations, and bespoke entertainment packages.",
    descriptionAr: "مهرجانات المدارس، الفعاليات المجتمعية الكبرى، وتجهيزات الترفيه والإنتاج المتكاملة.",
    icon: "Sparkles",
    coverMediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    theme: "rose",
    audience: "Event Organizers, Malls & Communities",
    sortOrder: 5,
    isActive: true,
    isFeatured: false
  },
  {
    slug: "seasonal",
    nameEn: "Seasonal",
    nameAr: "الباقات الموسمية",
    descriptionEn: "Summer camps, winter holidays, Ramadan activities, National Day specials, and Eid programmes.",
    descriptionAr: "المخيمات الصيفية والشتوية، برامج رمضان، واحتفالات اليوم الوطني والأعياد.",
    icon: "CalendarRange",
    coverMediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    theme: "teal",
    audience: "Holiday Camps, Youth & Families",
    sortOrder: 6,
    isActive: true,
    isFeatured: true
  },
  {
    slug: "custom",
    nameEn: "Custom Experiences",
    nameAr: "تجارب حسب الطلب",
    descriptionEn: "Tailored multi-attraction packages, off-site popups, and bespoke entertainment engineering.",
    descriptionAr: "باقات مصممة خصيصاً تجمع عدة وجهات وتجارب خارجية حسب متطلباتكم الخاصة.",
    icon: "Wand2",
    coverMediaUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
    theme: "indigo",
    audience: "Bespoke Requests & Large Groups",
    sortOrder: 7,
    isActive: true,
    isFeatured: false
  }
];

export const CANONICAL_TEMPLATES = [
  {
    slug: "template-basic-birthday",
    code: "TPL-BDAY-BASIC",
    titleEn: "Basic Birthday Package Template",
    titleAr: "قالب باقة عيد الميلاد الأساسية",
    category: "BIRTHDAY",
    packageType: "READY_TO_BOOK",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 1200,
    minGuests: 10,
    maxGuests: 25,
    durationMinutes: 90,
    priceDisplayMode: "STARTING_FROM",
    inclusions: [
      { id: "inc-1", titleEn: "60 Mins Play Area Access", titleAr: "٦٠ دقيقة دخول منطقة الألعاب", icon: "Clock", status: "INCLUDED" },
      { id: "inc-2", titleEn: "30 Mins Private Party Room", titleAr: "٣٠ دقيقة في غرفة الحفلات الخاصة", icon: "Sparkles", status: "INCLUDED" },
      { id: "inc-3", titleEn: "Dedicated Party Host", titleAr: "مضيف حفل مخصص", icon: "Users", status: "INCLUDED" },
      { id: "inc-4", titleEn: "Digital Invitations", titleAr: "بطاقات دعوة إلكترونية", icon: "Mail", status: "INCLUDED" }
    ],
    addOns: [
      { id: "add-1", titleEn: "Themed Cake", titleAr: "كعكة بثيم مخصص", price: 300, priceType: "FIXED" },
      { id: "add-2", titleEn: "Mascot Appearance", titleAr: "حضور شخصية كرتونية", price: 350, priceType: "FIXED" }
    ]
  },
  {
    slug: "template-premium-birthday",
    code: "TPL-BDAY-PREMIUM",
    titleEn: "Premium Birthday Celebration Template",
    titleAr: "قالب حفل عيد الميلاد الفاخر",
    category: "BIRTHDAY",
    packageType: "READY_TO_BOOK",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 2200,
    minGuests: 15,
    maxGuests: 40,
    durationMinutes: 120,
    priceDisplayMode: "STARTING_FROM",
    inclusions: [
      { id: "inc-1", titleEn: "90 Mins Multi-Zone Access", titleAr: "٩٠ دقيقة دخول لكافة المناطق الترفيهية", icon: "Sparkles", status: "INCLUDED" },
      { id: "inc-2", titleEn: "45 Mins Decorated Party Suite", titleAr: "٤٥ دقيقة في جناح الحفلات المزين", icon: "Building", status: "INCLUDED" },
      { id: "inc-3", titleEn: "Kids Meals & Juice Boxes", titleAr: "وجبات أطفال وعصائر طازجة", icon: "Utensils", status: "INCLUDED" },
      { id: "inc-4", titleEn: "Party Favor Bags for All Kids", titleAr: "حقائب هدايا تذكارية لجميع الأطفال", icon: "Gift", status: "INCLUDED" }
    ]
  },
  {
    slug: "template-ultimate-birthday",
    code: "TPL-BDAY-ULTIMATE",
    titleEn: "Ultimate All-Inclusive VIP Birthday Template",
    titleAr: "قالب باقة عيد الميلاد VIP الشاملة",
    category: "BIRTHDAY",
    packageType: "READY_TO_BOOK",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 3800,
    minGuests: 20,
    maxGuests: 60,
    durationMinutes: 150,
    priceDisplayMode: "STARTING_FROM",
    inclusions: [
      { id: "inc-1", titleEn: "Unlimited Attraction Access", titleAr: "دخول غير محدود لكافة الألعاب والوجهة", icon: "Sparkles", status: "INCLUDED" },
      { id: "inc-2", titleEn: "Private VIP Lounge & Decor", titleAr: "صالة VIP خاصة مع تزيين كامل", icon: "Building", status: "INCLUDED" },
      { id: "inc-3", titleEn: "Gourmet Catering & Custom Cake", titleAr: "بوفيه ضيافة فاخر وكعكة مصممة", icon: "Utensils", status: "INCLUDED" },
      { id: "inc-4", titleEn: "Pro Photographer & Photo Album", titleAr: "مصور محترف وألبوم صور رقمي", icon: "Camera", status: "INCLUDED" }
    ]
  },
  {
    slug: "template-school-trip",
    code: "TPL-SCHOOL-TRIP",
    titleEn: "School Educational Field Trip Template",
    titleAr: "قالب رحلة المدارس التعليمية الترفيهية",
    category: "SCHOOL",
    packageType: "SCHOOL",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 1200,
    minGuests: 25,
    maxGuests: 200,
    durationMinutes: 150,
    priceDisplayMode: "PER_GUEST",
    inclusions: [
      { id: "inc-1", titleEn: "Curriculum-Linked Interactive Workshop", titleAr: "ورشة عمل تفاعلية مرتبطة بالمنهج", icon: "GraduationCap", status: "INCLUDED" },
      { id: "inc-2", titleEn: "Dedicated Safety Marshals", titleAr: "مرشدين ومشرفين سلامة متخصصين", icon: "ShieldCheck", status: "INCLUDED" },
      { id: "inc-3", titleEn: "Teachers & Supervisors Free Entry", titleAr: "دخول مجاني للمعلمين والمشرفين", icon: "Users", status: "INCLUDED" }
    ]
  },
  {
    slug: "template-nursery-visit",
    code: "TPL-NURSERY-VISIT",
    titleEn: "Nursery & Toddler Play Morning Template",
    titleAr: "قالب زيارة الحضانات والأطفال الصغار",
    category: "SCHOOL",
    packageType: "SCHOOL",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 850,
    minGuests: 15,
    maxGuests: 60,
    durationMinutes: 90,
    priceDisplayMode: "PER_GUEST",
    inclusions: [
      { id: "inc-1", titleEn: "Soft Play & Sensory Area Access", titleAr: "دخول منطقة الألعاب الرخوة والتجارب الحسية", icon: "Sparkles", status: "INCLUDED" },
      { id: "inc-2", titleEn: "Gentle Music & Story Session", titleAr: "جلسة قراءة قصص وموسيقى هادئة", icon: "Music", status: "INCLUDED" }
    ]
  },
  {
    slug: "template-group-booking",
    code: "TPL-GROUP-BOOKING",
    titleEn: "Group Adventure & Play Booking Template",
    titleAr: "قالب حجز المجموعات والأصدقاء",
    category: "GROUP",
    packageType: "GROUP",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 1500,
    minGuests: 12,
    maxGuests: 80,
    durationMinutes: 120,
    priceDisplayMode: "STARTING_FROM"
  },
  {
    slug: "template-summer-camp",
    code: "TPL-SUMMER-CAMP",
    titleEn: "Summer Camp Multi-Day Pass Template",
    titleAr: "قالب المخيم الصيفي الأسبوعي",
    category: "SEASONAL",
    packageType: "CAMP_COURSE",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 750,
    minGuests: 10,
    maxGuests: 100,
    durationMinutes: 240,
    priceDisplayMode: "PER_GUEST"
  },
  {
    slug: "template-corporate-team-building",
    code: "TPL-CORP-TEAMBUILDING",
    titleEn: "Corporate Team Building Challenge Template",
    titleAr: "قالب تحدي بناء الفرق والمؤسسات",
    category: "CORPORATE",
    packageType: "CORPORATE",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 3500,
    minGuests: 15,
    maxGuests: 150,
    durationMinutes: 180,
    priceDisplayMode: "STARTING_FROM"
  },
  {
    slug: "template-corporate-family-day",
    code: "TPL-CORP-FAMILYDAY",
    titleEn: "Corporate Family Day Venue Buyout Template",
    titleAr: "قالب يوم العائلة للشركات والمؤسسات",
    category: "CORPORATE",
    packageType: "CORPORATE",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 12000,
    minGuests: 50,
    maxGuests: 500,
    durationMinutes: 300,
    priceDisplayMode: "STARTING_FROM"
  },
  {
    slug: "template-event-activation",
    code: "TPL-EVENT-ACTIVATION",
    titleEn: "Bespoke Event Activation Package Template",
    titleAr: "قالب تجهيز الفعاليات والمهرجانات الخاصة",
    category: "PRIVATE_EVENT",
    packageType: "EVENT",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 8500,
    minGuests: 100,
    maxGuests: 1000,
    durationMinutes: 360,
    priceDisplayMode: "FIXED"
  },
  {
    slug: "template-kids-zone",
    code: "TPL-KIDS-ZONE",
    titleEn: "Pop-Up Kids Zone & Inflatables Template",
    titleAr: "قالب منطقة ألعاب الأطفال المؤقتة والمطاطيات",
    category: "PRIVATE_EVENT",
    packageType: "EVENT",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 4500,
    minGuests: 30,
    maxGuests: 200,
    durationMinutes: 240,
    priceDisplayMode: "STARTING_FROM"
  },
  {
    slug: "template-custom-blank",
    code: "TPL-CUSTOM-BLANK",
    titleEn: "Custom Blank Package Template",
    titleAr: "قالب مخصص فارغ لإنشاء الباقات",
    category: "CUSTOM",
    packageType: "CUSTOM_TEMPLATE",
    isTemplate: true,
    status: "DRAFT",
    startingPrice: 0,
    minGuests: 1,
    maxGuests: 500,
    durationMinutes: 60,
    priceDisplayMode: "PRICE_ON_REQUEST"
  }
];

export const DEFAULT_LEAD_FORMS = [
  {
    slug: "general-package-inquiry",
    nameEn: "General Package Inquiry Form",
    nameAr: "نموذج استفسار الباقات العام",
    formType: "GENERAL",
    descriptionEn: "Default inquiry form for all public package inquiries",
    descriptionAr: "النموذج الافتراضي لاستفسارات وتفاصيل الباقات",
    fields: [
      { id: "f_name", name: "customerName", labelEn: "Full Name", labelAr: "الاسم الكامل", type: "text", required: true },
      { id: "f_email", name: "email", labelEn: "Email Address", labelAr: "البريد الإلكتروني", type: "email", required: true },
      { id: "f_phone", name: "phone", labelEn: "Phone / Mobile", labelAr: "رقم الهاتف / الجوال", type: "phone", required: true },
      { id: "f_whatsapp", name: "whatsApp", labelEn: "WhatsApp Number", labelAr: "رقم الواتساب", type: "phone", required: false },
      { id: "f_guests", name: "expectedGuests", labelEn: "Expected Guests", labelAr: "عدد الضيوف المتوقع", type: "number", required: true, defaultValue: "15" },
      { id: "f_date", name: "preferredDate", labelEn: "Preferred Date", labelAr: "التاريخ المفضل", type: "date", required: true },
      { id: "f_time", name: "preferredTimeSlot", labelEn: "Preferred Time", labelAr: "الوقت المفضل", type: "select", options: ["Morning (10 AM - 1 PM)", "Afternoon (1 PM - 5 PM)", "Evening (5 PM - 9 PM)", "Night (9 PM - 12 AM)"], required: false },
      { id: "f_requests", name: "specialRequests", labelEn: "Special Requests / Notes", labelAr: "ملاحظات أو متطلبات خاصة", type: "textarea", required: false }
    ]
  },
  {
    slug: "birthday-inquiry",
    nameEn: "Birthday Party Inquiry Form",
    nameAr: "نموذج حجز واستفسار حفلات أعياد الميلاد",
    formType: "BIRTHDAY",
    descriptionEn: "Specialized birthday inquiry with celebrant details",
    descriptionAr: "نموذج مخصص لحفلات أعياد الميلاد مع تفاصيل المحتفى به",
    fields: [
      { id: "f_name", name: "customerName", labelEn: "Parent / Contact Name", labelAr: "اسم ولي الأمر / جهة الاتصال", type: "text", required: true },
      { id: "f_celebrant", name: "celebrationName", labelEn: "Birthday Child Name", labelAr: "اسم صاحب / صاحبة العيد", type: "text", required: true },
      { id: "f_age", name: "ageGroup", labelEn: "Turning Age", labelAr: "العمر المحتفى به", type: "text", required: true },
      { id: "f_email", name: "email", labelEn: "Email Address", labelAr: "البريد الإلكتروني", type: "email", required: true },
      { id: "f_phone", name: "phone", labelEn: "Mobile Phone", labelAr: "رقم الجوال", type: "phone", required: true },
      { id: "f_children", name: "expectedChildren", labelEn: "Number of Children", labelAr: "عدد الأطفال", type: "number", required: true, defaultValue: "12" },
      { id: "f_adults", name: "expectedAdults", labelEn: "Number of Adults", labelAr: "عدد الكبار", type: "number", required: false, defaultValue: "4" },
      { id: "f_date", name: "preferredDate", labelEn: "Party Date", labelAr: "تاريخ الحفل", type: "date", required: true },
      { id: "f_theme", name: "themePreference", labelEn: "Theme Preference", labelAr: "الثيم المفضل للحفل", type: "text", required: false },
      { id: "f_notes", name: "specialRequests", labelEn: "Special Requests (Cake, Mascot, Photography)", labelAr: "طلبات خاصة (كعكة، شخصيات، تصوير)", type: "textarea", required: false }
    ]
  },
  {
    slug: "corporate-inquiry",
    nameEn: "Corporate & Team Building Inquiry Form",
    nameAr: "نموذج فعاليات وتحديات الشركات",
    formType: "CORPORATE",
    descriptionEn: "Corporate booking brief with procurement and group sizing",
    descriptionAr: "نموذج لحجوزات وفعاليات الشركات وتحديات بناء الفرق",
    fields: [
      { id: "f_name", name: "customerName", labelEn: "Contact Person", labelAr: "اسم المسؤول", type: "text", required: true },
      { id: "f_company", name: "companyOrOrg", labelEn: "Company / Organization", labelAr: "اسم الشركة / المؤسسة", type: "text", required: true },
      { id: "f_email", name: "email", labelEn: "Corporate Email", labelAr: "البريد الإلكتروني المهني", type: "email", required: true },
      { id: "f_phone", name: "phone", labelEn: "Mobile / Phone", labelAr: "رقم الهاتف", type: "phone", required: true },
      { id: "f_guests", name: "expectedGuests", labelEn: "Number of Attendees", labelAr: "عدد الحضور المتوقع", type: "number", required: true, defaultValue: "25" },
      { id: "f_budget", name: "budgetRange", labelEn: "Estimated Budget (QAR)", labelAr: "الميزانية التقديرية (ر.ق)", type: "select", options: ["Under 5,000 QAR", "5,000 - 15,000 QAR", "15,000 - 30,000 QAR", "30,000+ QAR"], required: false },
      { id: "f_date", name: "preferredDate", labelEn: "Target Event Date", labelAr: "التاريخ المستهدف للفعالية", type: "date", required: true },
      { id: "f_notes", name: "specialRequests", labelEn: "Event Objectives & Scope (Catering, AV, Buyout)", labelAr: "أهداف الفعالية والمتطلبات (ضيافة، صوتيات، حجز حصري)", type: "textarea", required: false }
    ]
  }
];

async function main() {
  console.log("=== SEEDING PACKAGE TAXONOMY, TEMPLATES & LEAD FORMS ===");

  // 1. Seed Categories
  const categoryMap = new Map<string, string>();
  for (const cat of CANONICAL_CATEGORIES) {
    const upserted = await db.packageCategory.upsert({
      where: { slug: cat.slug },
      update: {
        nameEn: cat.nameEn,
        nameAr: cat.nameAr,
        descriptionEn: cat.descriptionEn,
        descriptionAr: cat.descriptionAr,
        icon: cat.icon,
        coverMediaUrl: cat.coverMediaUrl,
        theme: cat.theme,
        audience: cat.audience,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        isFeatured: cat.isFeatured
      },
      create: cat
    });
    categoryMap.set(cat.slug, upserted.id);
    console.log(`✓ Category seeded: ${cat.nameEn} (${upserted.id})`);
  }

  // 2. Link existing packages to categories and enrich metadata
  const existingPackages = await db.package.findMany();
  console.log(`Checking ${existingPackages.length} existing packages for category relations...`);

  for (const p of existingPackages) {
    let targetCatSlug = "celebrate";
    if (p.category === "CORPORATE" || p.slug.includes("corporate") || p.slug.includes("urban-arena")) {
      targetCatSlug = "corporate";
    } else if (p.category === "SCHOOL" || p.slug.includes("school") || p.slug.includes("kids-city")) {
      targetCatSlug = "learn-explore";
    } else if (p.category === "GROUP") {
      targetCatSlug = "play-together";
    } else if (p.category === "PRIVATE_EVENT" || p.category === "EVENTS") {
      targetCatSlug = "events";
    } else if (p.category === "SEASONAL") {
      targetCatSlug = "seasonal";
    } else if (p.category === "CUSTOM") {
      targetCatSlug = "custom";
    }

    const catId = categoryMap.get(targetCatSlug);
    if (catId) {
      await db.package.update({
        where: { id: p.id },
        data: {
          categoryId: catId,
          packageType: targetCatSlug === "corporate" ? "CORPORATE" : targetCatSlug === "learn-explore" ? "SCHOOL" : "READY_TO_BOOK",
          status: p.isPublished ? "PUBLISHED" : "DRAFT",
          audienceTypes: targetCatSlug === "corporate" ? ["CORPORATE", "ADULTS"] : targetCatSlug === "learn-explore" ? ["SCHOOLS", "NURSERIES", "KIDS"] : ["FAMILIES", "KIDS", "TEENS"]
        }
      });
      console.log(`✓ Linked package ${p.slug} to category ${targetCatSlug}`);
    }
  }

  // 3. Seed Templates
  for (const tpl of CANONICAL_TEMPLATES) {
    const existing = await db.package.findUnique({ where: { slug: tpl.slug } });
    if (!existing) {
      const catSlug = tpl.category === "CORPORATE" ? "corporate" : tpl.category === "SCHOOL" ? "learn-explore" : tpl.category === "GROUP" ? "play-together" : tpl.category === "SEASONAL" ? "seasonal" : tpl.category === "CUSTOM" ? "custom" : "celebrate";
      const catId = categoryMap.get(catSlug);
      await db.package.create({
        data: {
          ...tpl,
          categoryId: catId,
          isPublished: false,
        }
      });
      console.log(`✓ Template created: ${tpl.titleEn}`);
    }
  }

  // 4. Seed Lead Form Templates
  for (const form of DEFAULT_LEAD_FORMS) {
    await db.leadFormTemplate.upsert({
      where: { slug: form.slug },
      update: {
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        descriptionEn: form.descriptionEn,
        descriptionAr: form.descriptionAr,
        formType: form.formType,
        fields: form.fields,
        isActive: true
      },
      create: form
    });
    console.log(`✓ Lead Form Template seeded: ${form.nameEn}`);
  }

  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
}

if (process.argv[1] && process.argv[1].includes("seed-package")) {
  main().catch(console.error).finally(() => process.exit(0));
}
