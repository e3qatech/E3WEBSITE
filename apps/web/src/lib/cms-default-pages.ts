/**
 * Default Content seeds for CMS Pages.
 * Prevents form clearing / empty text inputs on cold starts, empty DBs, or deployments.
 */

export const DEFAULT_B2C_LANDING_CONTENT = {
  hero: {
    mediaType: "VIDEO",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    headerEn: "E3 PULSE ENTERTAINMENT WORLDS",
    headerAr: "استكشف عالم إي ثري الترفيهي",
    subHeaderEn: "Qatar premier immersive attractions and kinetic entertainment.",
    subHeaderAr: "تجارب ترفيهية غامرة ومدن ألعاب فضائية في قطر",
    showSearch: true,
  },
  maskedVideo: {
    enabled: true,
    defaultPortal: "customer",
    preset: "ORGANIC_WINDOW",
    rendererMode: "STANDARD",
    scale: 1,
    positionX: 0,
    positionY: 0,
    edgeSoftness: 12,
    distortionAmount: 0,
    idleBreathe: true,
    cursorResponse: true,
    customSvgMask: "",
    customerDesktopVideo: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    customerMobileVideo: "",
    customerPoster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    customerFallbackImage: "",
    customerMaskPreset: "ORGANIC_WINDOW",
    customerAccent: "#10b981",
    customerAltEn: "E3 Pulse Customer Attractions Video",
    customerAltAr: "فيديو تجارب زوار إي ثري الترفيهية",
    organizerDesktopVideo: "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
    organizerMobileVideo: "",
    organizerPoster: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop",
    organizerFallbackImage: "",
    organizerMaskPreset: "PORTAL_ARCH",
    organizerAccent: "#3b82f6",
    organizerAltEn: "E3 Atelier Event Engineering Video",
    organizerAltAr: "فيديو هندسة وإنتاج الفعاليات",
  },
  featuredTitleEn: "FEATURED EXPERIENCES & ATTRACTIONS",
  featuredTitleAr: "التجارب والوجهات المميزة",
  gridTitleEn: "EXPLORE ALL QATAR ATTRACTIONS",
  gridTitleAr: "استكشف جميع الوجهات الترفيهية",
  subscribe: {
    titleEn: "JOIN THE E3 PULSE INSIDERS",
    titleAr: "انضم إلى النشرة البريدية لـ إي ثري",
    subtitleEn: "Get exclusive access to VIP attraction launches, secret pop-ups, and early ticket drops.",
    subtitleAr: "احصل على وصول حصري لإطلاق الوجهات الجديدة وتذاكر الفعاليات القادمة.",
  },
  cta: {
    titleEn: "READY TO EXPERIENCE E3 QATAR?",
    titleAr: "هل أنت مستعد لخوض تجربة إي ثري؟",
    buttonTextEn: "EXPLORE ALL ATTRACTIONS",
    buttonTextAr: "استكشف كافة الوجهات",
    buttonUrl: "/b2c/attractions",
  },
  careersCta: {
    titleEn: "HOST YOUR BIRTHDAY PARTY OR CORPORATE EVENT",
    titleAr: "احجز حفل عيد ميلادك أو فعاليتك الخاصة",
    subtitleEn: "Discover all-inclusive VIP birthday packages, corporate team-building outings, and exclusive venue buyouts across Qatar.",
    subtitleAr: "وفرنا لك أفضل الباقات الشاملة للأطفال والشركات مع غرف حفلات خاصة، صالات VIP، وتجارب استثنائية.",
    buttonTextEn: "EXPLORE PACKAGES & PRICING",
    buttonTextAr: "استكشف الباقات والحجوزات",
    buttonUrl: "/b2c/packages",
  },
  motion: {
    motionEnabled: true,
    motionPreset: "MEDIA_CINEMATIC",
    motionIntensity: "MEDIUM",
    heroSceneType: "CINEMATIC_MEDIA",
    particleDensity: 50,
    ctaEmphasisStyle: "SHIMMER",
  },
  portalSwitcher: {
    customerLabelEn: "Customer",
    customerLabelAr: "الزائر",
    organizerLabelEn: "Organizer",
    organizerLabelAr: "المنظّم",
    customerUrl: "/b2c",
    organizerUrl: "/b2b",
    organizerLoginLabelEn: "Organizer Login",
    organizerLoginLabelAr: "تسجيل دخول المنظم",
    organizerLoginUrl: "/login/business",
    switcherVisible: true,
    organizerLoginVisible: true,
  },
  faqs: [
    {
      questionEn: "How do I book tickets for E3 attractions?",
      questionAr: "كيف يمكنني حجز تذاكر تجارب إي ثري؟",
      answerEn: "You can easily browse all attractions on this portal and click 'Book Tickets' to purchase digital passes directly.",
      answerAr: "يمكنك تصفح جميع الوجهات في البوابة والضغط على 'احجز التذاكر' لشراء التذاكر الرقمية فوراً.",
    },
    {
      questionEn: "Are attractions suitable for families and kids?",
      questionAr: "هل الوجهات مناسبة للعائلات والأطفال؟",
      answerEn: "Yes! E3 Qatar provides experiences designed for all age groups, including dedicated family zones and immersive kids areas.",
      answerAr: "نعم! توفر إي ثري قطر تجارب مصممة لجميع الفئات العمرية بما في ذلك مناطق عائلية ومناطق أطفال مخصصة.",
    }
  ],
  footer: {
    mediaType: "IMAGE",
    mediaUrl: "",
  }
};

export const DEFAULT_B2C_PACKAGES_CONTENT = {
  hero: {
    titleEn: "Group & Birthday Packages",
    titleAr: "باقات الحفلات والشركات وأعياد الميلاد",
    subtitleEn: "Host unforgettable milestone birthday celebrations, team-building outings, and exclusive venue buyouts across Qatar.",
    subtitleAr: "احتفل بأجمل اللحظات وحفلات أعياد الميلاد والفعاليات الخاصة بشركتك في أفضل الوجهات الترفيهية في قطر.",
    badgeEn: "VIP PACKAGES & EVENTS",
    badgeAr: "باقات الفعاليات والاحتفالات",
  },
  packages: [
    {
      id: "birthday-silver",
      titleEn: "Silver Birthday Party",
      titleAr: "باقة أعياد الميلاد الفضية",
      badgeEn: "Kids & Teens",
      badgeAr: "الأطفال واليافعين",
      descriptionEn: "Perfect choice for intimate celebrations. Includes 2 hours of park access, private party room, and dedicated host.",
      descriptionAr: "الخيار الأمثل للاحتفالات الخاصة. يشمل ساعتين من الألعاب، غرفة حفلات خاصة، ومضيف مخصص.",
      priceEn: "From QAR 1,800",
      priceAr: "ابتداءً من 1,800 ر.ق",
      accentColor: "#10b981",
      popular: false,
      perksEn: [
        "Up to 10 Participating Guests",
        "2 Hours Full Attraction Access",
        "Private Decorated Party Room (1 Hr)",
        "Dedicated Event Host",
        "Custom Digital Invitations",
        "Signature Birthday Cake"
      ],
      perksAr: [
        "حتى 10 ضيوف مشاركين",
        "ساعتان دخول شامل لجميع الألعاب",
        "غرفة حفلات خاصة ومزينة (ساعة واحدة)",
        "مضيف فعاليات مخصص للحفلة",
        "دعوات إلكترونية مخصصة",
        "كعكة عيد ميلاد خاصة"
      ]
    },
    {
      id: "birthday-gold-vip",
      titleEn: "Gold VIP Birthday World",
      titleAr: "باقة أعياد الميلاد الذهبية الـ VIP",
      badgeEn: "Most Popular",
      badgeAr: "الأكثر طلباً",
      descriptionEn: "The ultimate birthday extravaganza with full park access, VIP lounge, gourmet catering, and arcade credits for everyone.",
      descriptionAr: "التجربة المتكاملة الأكثر روعة لأعياد الميلاد مع صالة VIP، وجبات فاخرة، ورصيد ألعاب إضافي للجميع.",
      priceEn: "From QAR 3,500",
      priceAr: "ابتداءً من 3,500 ر.ق",
      accentColor: "#b013b8",
      popular: true,
      perksEn: [
        "Up to 20 Participating Guests",
        "3 Hours Unlimited Attraction Access",
        "VIP Private Lounge & Party Zone",
        "Gourmet Meal & Drinks Package",
        "QAR 100 Arcade Credit per Guest",
        "Professional Photographer (1 Hr)",
        "Custom Theme Styling & Balloon Arch"
      ],
      perksAr: [
        "حتى 20 ضيفاً مشاركاً",
        "3 ساعات دخول غير محدود للألعاب",
        "صالة VIP خاصة وحصرية",
        "وجبات ومشروبات فاخرة للجميع",
        "رصيد ألعاب بقيمة 100 ر.ق لكل ضيف",
        "مصور محترف (ساعة واحدة)",
        "تنسيق بالونات وديكور حسب الثيمة"
      ]
    },
    {
      id: "corporate-outing",
      titleEn: "Corporate Team Building & Outing",
      titleAr: "باقة الشركات وبناء فرق العمل",
      badgeEn: "Corporate B2B",
      badgeAr: "مخصص للشركات",
      descriptionEn: "Energize your team with tailored competitions, privatized arenas, customized leaderboards, and executive catering.",
      descriptionAr: "حفّز فريق عملك بمسابقات حصرية، حلبات خاصة، لوحة نتائج تفاعلية، وخدمات ضيافة رفيعة المستوى.",
      priceEn: "From QAR 6,000",
      priceAr: "ابتداءً من 6,000 ر.ق",
      accentColor: "#3b82f6",
      popular: false,
      perksEn: [
        "Up to 50 Team Members (Expandable)",
        "Exclusive Arena Competition Access",
        "Custom Team Leaderboard & Trophies",
        "Executive Buffet Catering & Coffee Station",
        "Dedicated Corporate Event Planner",
        "Branded Digital Welcome Screen"
      ],
      perksAr: [
        "حتى 50 موظفاً (قابل للزيادة)",
        "دخول حصري لحلبات التنافس",
        "لوحة نتائج مخصصة للشركة وكؤوس",
        "بوفيه فاخر ومحطة قهوة مختصة",
        "منسق فعاليات شركات مخصص",
        "شاشات ترحيبية بهوية الشركة"
      ]
    },
    {
      id: "private-buyout",
      titleEn: "Exclusive 100% Venue Buyout",
      titleAr: "حجز المرفق بالكامل (Exclusive Buyout)",
      badgeEn: "VIP Privatization",
      badgeAr: "خصوصية تامة 100%",
      descriptionEn: "Complete privatization of our flagship entertainment centers for product launches, VIP galas, and large family days.",
      descriptionAr: "إغلاق حصير للمرفق بالكامل لصالح مبيعاتك، إطلاق المنتجات، أو اليوم العائلي الخاص لشركتك.",
      priceEn: "Custom Quote",
      priceAr: "حسب الطلب والعدد",
      accentColor: "#f59e0b",
      popular: false,
      perksEn: [
        "Unlimited Guests (Up to Venue Capacity)",
        "100% Private Venue Access (Closed to Public)",
        "Full Stage, Audio & Kinetic Light Systems",
        "Bespoke Catering & VIP Red Carpet Service",
        "Full Security, Technical & Operations Staff",
        "Complete Custom Branding Integration"
      ],
      perksAr: [
        "عدد غير محدود من الضيوف (حسب الطاقة الاستيعابية)",
        "دخول خاص 100% (مغلق أمام الجمهور)",
        "أنظمة صوت وإضاءة ومسرح كاملة",
        "ضيافة مخصصة وسجاد أحمر كبار الشخصيات",
        "طاقم أمني وفني وتشغيلي كامل",
        "دمج كامل لهوية فعاليتك في المرفق"
      ]
    }
  ],
  inquiryForm: {
    titleEn: "Plan Your Event With E3 Experts",
    titleAr: "احجز حفلهم أو فعاليتك القادمة",
    subtitleEn: "Our VIP event planners will contact you within 24 hours to confirm dates, themes, and arrangements.",
    subtitleAr: "سيعاود فريق تنظيم الحفلات والشركات التواصل معك خلال 24 ساعة لتأكيد التفاصيل.",
  }
};

/**
 * Deeply merges target object with default fallback values.
 * Keeps user-provided values if non-empty, otherwise falls back to defaults.
 */
export function getMergedCMSPageContent(slug: string, rawContent?: any) {
  if (slug === 'b2c-packages') {
    const defaults = DEFAULT_B2C_PACKAGES_CONTENT;
    const raw = rawContent || {};
    return {
      ...defaults,
      ...raw,
      hero: {
        ...defaults.hero,
        ...(raw.hero || {}),
      },
      packages: (raw.packages && raw.packages.length > 0) ? raw.packages : defaults.packages,
      inquiryForm: {
        ...defaults.inquiryForm,
        ...(raw.inquiryForm || {}),
      }
    };
  }

  if (slug !== 'b2c-landing') return rawContent || {};

  const defaults = DEFAULT_B2C_LANDING_CONTENT;
  const raw = rawContent || {};

  return {
    ...defaults,
    ...raw,
    hero: {
      ...defaults.hero,
      ...(raw.hero || {}),
    },
    maskedVideo: {
      ...defaults.maskedVideo,
      ...(raw.maskedVideo || {}),
    },
    featuredTitleEn: raw.featuredTitleEn ?? defaults.featuredTitleEn,
    featuredTitleAr: raw.featuredTitleAr ?? defaults.featuredTitleAr,
    gridTitleEn: raw.gridTitleEn ?? defaults.gridTitleEn,
    gridTitleAr: raw.gridTitleAr ?? defaults.gridTitleAr,
    subscribe: {
      ...defaults.subscribe,
      ...(raw.subscribe || {}),
    },
    cta: {
      ...defaults.cta,
      ...(raw.cta || {}),
    },
    careersCta: {
      ...defaults.careersCta,
      ...(raw.careersCta || {}),
    },
    portalSwitcher: {
      ...defaults.portalSwitcher,
      ...(raw.portalSwitcher || {}),
    },
    faqs: (raw.faqs && raw.faqs.length > 0) ? raw.faqs : defaults.faqs,
  };
}
