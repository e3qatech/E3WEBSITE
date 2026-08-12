/**
 * Default Content seeds for CMS Pages.
 * Prevents form clearing / empty text inputs on cold starts, empty DBs, or deployments.
 */

export const DEFAULT_B2C_LANDING_CONTENT = {
  heroMedia: {
    mediaType: "IMAGE",
    mediaUrl: "",
    fallbackImage: "",
    posterUrl: "",
  },
  act1: {
    headlineEn: "Some days pass. Others become stories.",
    headlineAr: "أيام تمرّ… وأيام تتحول إلى حكايات.",
    subtextEn: "Enter a world of attractions, live experiences and unforgettable moments created by E3.",
    subtextAr: "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية واللحظات التي لا تُنسى مع E3.",
    primaryCtaEn: "Begin Your Story",
    primaryCtaAr: "ابدأ حكايتك",
    primaryCtaUrl: "#bring-it-to-life",
    secondaryCtaEn: "See What's On Today",
    secondaryCtaAr: "اكتشف فعاليات اليوم",
    secondaryCtaUrl: "#living-day",
  },
  act2: {
    headlineEn: "We don’t just imagine fun. We bring it to life.",
    headlineAr: "لا نكتفي بتخيّل المتعة… بل نحوّلها إلى واقع.",
    steps: [
      { id: 1, titleEn: "1. A Thin Sketch", titleAr: "١. رسم أولي", descEn: "The initial creative spark drawn from pure imagination.", mediaUrl: "" },
      { id: 2, titleEn: "2. Spatial Depth", titleAr: "٢. عمق هندسي", descEn: "Translating blueprints into architectural engineering.", mediaUrl: "" },
      { id: 3, titleEn: "3. Materials & Light", titleAr: "٣. مواد وإضاءة", descEn: "Infusing kinetic dome surfaces and vibrant stage lighting.", mediaUrl: "" },
      { id: 4, titleEn: "4. Physical Assembly", titleAr: "٤. البناء الحقيقي", descEn: "E3 atelier teams fabricating the real-world attraction.", mediaUrl: "" },
      { id: 5, titleEn: "5. Guests Enter", titleAr: "٥. دخول الزوار", descEn: "The doors open to welcome families and thrill-seekers.", mediaUrl: "" },
      { id: 6, titleEn: "6. Fully Alive", titleAr: "٦. نبض متكامل", descEn: "Everlasting memories created every second.", mediaUrl: "" }
    ]
  },
  act3Worlds: [
    {
      id: "kids-driving-school",
      slug: "kids-city-driving-school",
      nameEn: "Kids City Driving School",
      nameAr: "مدينة قيادة الأطفال",
      taglineEn: "Take the wheel in Qatar's premier miniature traffic city",
      taglineAr: "تولَّ القيادة في مدينة المرور المصغرة الأولى بقطر",
      locationEn: "Doha Festival City, Level 1",
      locationAr: "دوحة فستيفال سيتي، الطابق الأول",
      audienceEn: "Ages 4 - 12",
      audienceAr: "الأعمار ٤ - ١٢ سنة",
      statusEn: "Open Now",
      statusAr: "مفتوح الآن",
      timingsEn: "10:00 AM - 10:00 PM",
      timingsAr: "١٠:٠٠ ص - ١٠:٠٠ م",
      price: 65,
      currency: "QAR",
      ctaEn: "Take the Wheel",
      ctaAr: "تولَّ القيادة",
      accentColor: "#38bdf8",
      materialType: "ROAD_MARKING",
      mediaUrl: ""
    },
    {
      id: "inflatapark-doha",
      slug: "inflatapark",
      nameEn: "InflataPark Doha",
      nameAr: "إنفلاتا بارك الدوحة",
      taglineEn: "Jump into 5,000 sqm of soft-body giant inflatable dunes",
      taglineAr: "قفز ومغامرات في أكبر حديقة ثلجية ومطاطية مغلقة",
      locationEn: "Place Vendôme Mall, North Wing",
      locationAr: "بلَاس فاندوم، الجناح الشمالي",
      audienceEn: "All Ages",
      audienceAr: "جميع الأعمار",
      statusEn: "Open Now",
      statusAr: "مفتوح الآن",
      timingsEn: "12:00 PM - 11:00 PM",
      timingsAr: "١٢:٠٠ م - ١١:٠٠ م",
      price: 90,
      currency: "QAR",
      ctaEn: "Jump Into the Fun",
      ctaAr: "اقفز إلى المتعة",
      accentColor: "#a855f7",
      materialType: "INFLATABLE_SEAM",
      mediaUrl: ""
    },
    {
      id: "urban-arena",
      slug: "urban-arena-doha",
      nameEn: "Urban Arena & Tactical Combat",
      nameAr: "أوربان أرينا للتحدي والتكتيك",
      taglineEn: "High-octane spatial sound, laser tag, and esports competitions",
      taglineAr: "ساحة معارك الليزر والتكنولوجيا التفاعلية والرياضات الإلكترونية",
      locationEn: "West Bay Kinetic Dome",
      locationAr: "قبة الخليج الغربي التفاعلية",
      audienceEn: "Teens & Adults",
      audienceAr: "الشباب والكبار",
      statusEn: "Filling Fast",
      statusAr: "التذاكر تنفذ سريعا",
      timingsEn: "02:00 PM - 12:00 AM",
      timingsAr: "٠٢:٠٠ م - ١٢:٠٠ ص",
      price: 110,
      currency: "QAR",
      ctaEn: "Enter the Challenge",
      ctaAr: "يدخل التحدي",
      accentColor: "#10b981",
      materialType: "LUMINOUS_TRAIL",
      mediaUrl: ""
    },
    {
      id: "live-festivals",
      slug: "doha-winter-live-events",
      nameEn: "E3 Live Festivals & Light Shows",
      nameAr: "مهرجانات وعروض إي ثري الحية",
      taglineEn: "Seasonal parades, drone light shows, and international artists",
      taglineAr: "عروض الطائرات المضيئة، الفعاليات الموسمية، والعروض الفنية العالمية",
      locationEn: "Al Rayyan Event Arena",
      locationAr: "ساحة الفعاليات بالريان",
      audienceEn: "Family & Friends",
      audienceAr: "العائلات والأصدقاء",
      statusEn: "Special Event",
      statusAr: "حدث خاص",
      timingsEn: "05:00 PM - 01:00 AM",
      timingsAr: "٠٥:٠٠ م - ٠١:٠٠ ص",
      price: 150,
      currency: "QAR",
      ctaEn: "Be Part of the Moment",
      ctaAr: "كن جزءًا من اللحظة",
      accentColor: "#f43f5e",
      materialType: "STAGE_RIBBON",
      mediaUrl: ""
    }
  ],
  intentSelector: {
    titleEn: "What Kind of Story Do You Want Today?",
    titleAr: "أي نوع من الحكايات تريد أن تعيشها اليوم؟",
    options: [
      { id: "drive", labelEn: "Drive", labelAr: "قيادة", category: "kids", mediaUrl: "" },
      { id: "bounce", labelEn: "Bounce", labelAr: "قفز", category: "active", mediaUrl: "" },
      { id: "compete", labelEn: "Compete", labelAr: "تحدي", category: "arena", mediaUrl: "" },
      { id: "explore", labelEn: "Explore", labelAr: "استكشاف", category: "discovery", mediaUrl: "" },
      { id: "celebrate", labelEn: "Celebrate", labelAr: "احتفال", category: "events", mediaUrl: "" },
      { id: "family", labelEn: "Family Time", labelAr: "عائلي", category: "family", mediaUrl: "" }
    ]
  },
  qatarMap: {
    headlineEn: "A Journey Across Qatar",
    headlineAr: "رحلة عبر أنحاء قطر",
    subtextEn: "Discover E3's permanent attraction worlds and temporary event arenas across Doha.",
    subtextAr: "استكشف وجهات إي ثري الترفيهية وصالات الفعاليات في كافة مناطق الدوحة.",
    venues: [
      {
        id: "v-dfc",
        nameEn: "Doha Festival City Arena",
        nameAr: "ساحة دوحة فستيفال سيتي",
        areaEn: "North Doha",
        areaAr: "شمال الدوحة",
        experiencesEn: "Kids City Driving School & Snow Dunes",
        experiencesAr: "مدينة قيادة الأطفال وتلال الثلج",
        hoursEn: "10:00 AM - 10:00 PM",
        hoursAr: "١٠:٠٠ ص - ١٠:٠٠ م",
        statusEn: "Open Now",
        statusAr: "مفتوح الآن",
        lat: 25.3852,
        lng: 51.4428,
        directionsUrl: "https://maps.google.com/?q=Doha+Festival+City"
      },
      {
        id: "v-vendome",
        nameEn: "Place Vendôme Inflatable World",
        nameAr: "عالم المطاط بلاس فاندوم",
        areaEn: "Lusail City",
        areaAr: "مدينة لوسيل",
        experiencesEn: "InflataPark Doha & Giant Dunes",
        experiencesAr: "إنفلاتا بارك والزلاجات العملاقة",
        hoursEn: "12:00 PM - 11:00 PM",
        hoursAr: "١٢:٠٠ م - ١١:٠٠ م",
        statusEn: "Open Now",
        statusAr: "مفتوح الآن",
        lat: 25.3945,
        lng: 51.5276,
        directionsUrl: "https://maps.google.com/?q=Place+Vendome+Lusail"
      },
      {
        id: "v-westbay",
        nameEn: "West Bay Kinetic Dome",
        nameAr: "قبة الخليج الغربي التفاعلية",
        areaEn: "West Bay Financial District",
        areaAr: "الخليج الغربي",
        experiencesEn: "Urban Arena & Laser Combat",
        experiencesAr: "أوربان أرينا ومعارك الليزر",
        hoursEn: "02:00 PM - 12:00 AM",
        hoursAr: "٠٢:٠٠ م - ١٢:٠٠ ص",
        statusEn: "Filling Fast",
        statusAr: "التذاكر تنفذ سريعا",
        lat: 25.3215,
        lng: 51.5304,
        directionsUrl: "https://maps.google.com/?q=West+Bay+Doha"
      },
      {
        id: "v-rayyan",
        nameEn: "Al Rayyan Event Grounds",
        nameAr: "ميدان الفعاليات بالريان",
        areaEn: "Al Rayyan",
        areaAr: "الريان",
        experiencesEn: "E3 Live Festivals & Drone Light Parade",
        experiencesAr: "عروض الدرون ومهرجانات إي ثري الحية",
        hoursEn: "05:00 PM - 01:00 AM",
        hoursAr: "٠٥:٠٠ م - ٠١:٠٠ ص",
        statusEn: "Special Event",
        statusAr: "حدث خاص",
        lat: 25.2919,
        lng: 51.4244,
        directionsUrl: "https://maps.google.com/?q=Al+Rayyan+Doha"
      }
    ]
  },
  guestMemories: {
    headlineEn: "The Moment Becomes a Memory",
    headlineAr: "اللحظة تتحول إلى ذكرى تدوم",
    subtextEn: "Real smiles, real reactions, and everlasting memories captured at E3 Qatar destinations.",
    subtextAr: "ابتسامات حقيقية، مشاعر صادقة، وذكريات دائمة من زوار وجهات إي ثري.",
    moments: [
      { id: "m1", titleEn: "First License Earned", titleAr: "أول رخصة قيادة", captionEn: "Kids City Driving School victory moment", captionAr: "لحظة استلام رخصة قيادة الأطفال", mediaUrl: "" },
      { id: "m2", titleEn: "Family Bounce Challenge", titleAr: "تحدي القفز العائلي", captionEn: "InflataPark Doha giant dunes", captionAr: "تحدي القفز في إنفلاتا بارك", mediaUrl: "" },
      { id: "m3", titleEn: "Laser Arena Champions", titleAr: "أبطال ساحة الليزر", captionEn: "Urban Arena team competition", captionAr: "فوز الفريق في ساحة الليزر", mediaUrl: "" },
      { id: "m4", titleEn: "Nocturnal Drone Light Show", titleAr: "عروض الدرون المضيئة", captionEn: "Al Rayyan outdoor festival night", captionAr: "ليلة العروض المضيئة في سماء الريان", mediaUrl: "" },
      { id: "m5", titleEn: "Unforgettable Birthdays", titleAr: "أعياد ميلاد لا تُنسى", captionEn: "VIP party room celebrations", captionAr: "احتفالات خاصة في غرف VIP", mediaUrl: "" }
    ]
  },
  act7Ticket: {
    headlineEn: "Your next story is waiting.",
    headlineAr: "حكايتك القادمة بانتظارك.",
    subtextEn: "Choose an experience, book your place and turn today into a memory.",
    subtextAr: "اختر تجربتك، احجز مكانك، واجعل من اليوم ذكرى لا تُنسى.",
    primaryCtaEn: "Book an Experience",
    primaryCtaAr: "احجز تجربتك الآن",
    secondaryActions: [
      { labelEn: "Explore All Attractions", labelAr: "استكشف كافة الوجهات", url: "/b2c/attractions" },
      { labelEn: "See Upcoming Events", labelAr: "جدول الفعاليات القادمة", url: "/b2c/calendar" },
      { labelEn: "Find a Location", labelAr: "عناوين الوجهات", url: "#qatar-map" }
    ]
  },
  hero: {
    mediaType: "VIDEO",
    mediaUrl: "",
    posterUrl: "",
    headerEn: "E3 PULSE ENTERTAINMENT WORLDS",
    headerAr: "استكشف عالم إي ثري الترفيهي",
    subHeaderEn: "Qatar premier immersive attractions and kinetic entertainment.",
    subHeaderAr: "تجارب ترفيهية غامرة ومدن ألعاب فضائية في قطر",
    showSearch: true,
    streamMediaUrl: "",
    streamPosterUrl: "",
    streamBadgeEn: "LIVE STREAM",
    streamBadgeAr: "مباشر الآن",
    streamTitleEn: "E3 KINETIC EXPERIENCE",
    streamTitleAr: "عالم إي ثري الترفيهي",
    streamSubtitleEn: "Doha Flagship Attractions & Events",
    streamSubtitleAr: "تجارب تفاعلية فريدة في الدوحة",
    streamButtonUrl: "/b2c/attractions",
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
    customerDesktopVideo: "",
    customerMobileVideo: "",
    customerPoster: "",
    customerFallbackImage: "",
    customerMaskPreset: "ORGANIC_WINDOW",
    customerAccent: "#10b981",
    customerAltEn: "E3 Pulse Customer Attractions Video",
    customerAltAr: "فيديو تجارب زوار إي ثري الترفيهية",
    organizerDesktopVideo: "",
    organizerMobileVideo: "",
    organizerPoster: "",
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

export const DEFAULT_PULSE_ORBIT_CONTENT = {
  titleEn: "PULSE ORBIT DESTINATIONS",
  titleAr: "وجهات مدار إي ثري",
  navButtonTextEn: "PULSE ORBIT",
  navButtonTextAr: "القائمة",
  logoUrl: "",
  bookTicketsUrl: "/b2c/tickets",
  bookTicketsLabelEn: "BOOK TICKETS",
  bookTicketsLabelAr: "احجز التذاكر",
  bookTicketsEnabled: true,
  bookTicketsExternal: false,
  destinations: [
    {
      id: "attractions",
      labelEn: "Attractions",
      labelAr: "المرافق والوجهات",
      href: "/b2c/attractions",
      descEn: "Pristine Snow Park, Urban Arena, Kids City, and kinetic entertainment.",
      descAr: "حديقة الثلج النقي، والساحة التفاعلية، وعالم الأطفال.",
      mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
      enabled: true,
    },
    {
      id: "calendar",
      labelEn: "Calendar",
      labelAr: "جدول الفعاليات والتذاكر",
      href: "/b2c/calendar",
      descEn: "Live concerts, seasonal festivals, passes, and exclusive entertainment shows.",
      descAr: "الحفلات الحية والمهرجانات الموسمية والتذاكر والعروض الترفيهية.",
      mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      enabled: true,
    },
    {
      id: "discover",
      labelEn: "Discover",
      labelAr: "استكشف قطر",
      href: "/b2c/discover",
      descEn: "Curated visitor guides, dining, and spatial technology showcases.",
      descAr: "دليل الزوار، المطاعم، والتكنولوجيا التفاعلية.",
      mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      enabled: true,
    },
    {
      id: "packages",
      labelEn: "Packages",
      labelAr: "الباقات",
      href: "/b2c/packages",
      descEn: "VIP Birthday parties, corporate team outings, and private venue buyouts.",
      descAr: "حفلات أعياد الميلاد، الفعاليات الخاصة، وحجوزات الشركات.",
      mediaUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      enabled: true,
    },
    {
      id: "contact",
      labelEn: "Contact",
      labelAr: "تواصل معنا",
      href: "/b2c/contact",
      descEn: "24/7 guest support, venue location, and concierge services.",
      descAr: "خدمة الزوار، مواقع الفعاليات، واستفسارات الحجز.",
      mediaUrl: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1200&q=80",
      enabled: true,
    },
  ]
};

export const DEFAULT_B2B_PULSE_ORBIT_CONTENT = {
  titleEn: "B2B ENTERPRISE ORBIT",
  titleAr: "مدار إي ثري لقطاع الأعمال",
  navButtonTextEn: "B2B ORBIT",
  navButtonTextAr: "قطاع الأعمال",
  logoUrl: "",
  bookTicketsUrl: "/b2b/contact",
  bookTicketsLabelEn: "REQUEST PROPOSAL",
  bookTicketsLabelAr: "اطلب عرض سعر",
  bookTicketsEnabled: true,
  bookTicketsExternal: false,
  destinations: [
    {
      id: "services",
      labelEn: "Services & Solutions",
      labelAr: "الخدمات والحلول المتكاملة",
      href: "/b2b/services",
      descEn: "Turnkey event engineering, spatial design, kinetic AV, and production.",
      descAr: "هندسة الفعاليات، التصميم الفضائي، الحلول الصوتية والضوئية والإنتاج.",
      mediaUrl: "",
      enabled: true,
    },
    {
      id: "cases",
      labelEn: "Case Studies & Portfolio",
      labelAr: "دراسات الحالة والمشاريع",
      href: "/b2b/cases",
      descEn: "Flagship national ceremonies, summits, and mega entertainment builds in Qatar.",
      descAr: "الاحتفالات الوطنية، القمم، والمشاريع الترفيهية الكبرى في قطر.",
      mediaUrl: "",
      enabled: true,
    },
    {
      id: "team",
      labelEn: "Leadership & Atelier Team",
      labelAr: "القيادة وفريق الإنتاج",
      href: "/b2b/team",
      descEn: "Meet the executive visionaries, technical directors, and spatial architects.",
      descAr: "تعرف على القادة والمهندسين ومخرجي الفعاليات في إي ثري.",
      mediaUrl: "",
      enabled: true,
    },
    {
      id: "careers",
      labelEn: "HR & Talent Careers",
      labelAr: "الوظائف والكوادر البشرية",
      href: "/b2b/careers",
      descEn: "Join E3's world-class event production team or apply for open roles.",
      descAr: "انضم إلى فريق إنتاج الفعاليات العالمي في إي ثري أو قدم على الوظائف.",
      mediaUrl: "",
      enabled: true,
    },
    {
      id: "b2b-contact",
      labelEn: "B2B Proposal & Contact",
      labelAr: "تقديم الطلبات والتواصل",
      href: "/b2b/contact",
      descEn: "24/7 corporate inquiry desk, venue booking, and RFP submission.",
      descAr: "مكتب استفسارات الشركات، حجوزات المقرات، وتقديم المناقصات.",
      mediaUrl: "",
      enabled: true,
    },
  ]
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

export const DEFAULT_B2C_DISCOVER_CONTENT = {
  sectionOrder: [
    "hero",
    "about",
    "leadership",
    "visionMissionValues",
    "recordBreaking",
    "impactMilestones",
    "bookingQube",
    "connect",
    "trustedAcrossQatar",
    "latestInsights",
    "faqs",
    "finalGateway"
  ],
  hero: {
    id: "hero",
    enabled: true,
    eyebrowEn: "E3 CORPORATE STORY & ECOSYSTEM",
    eyebrowAr: "قصة إي ثري الترفيهية والتنفيذية",
    titleEn: "The Wow & The How",
    titleAr: "الإبهار والتنفيذ الاحترافي",
    subtitleEn: "Pioneering landmark entertainment, kinetic staging, and Qatar's premier spatial technology ecosystem.",
    subtitleAr: "نبتكر تجارب ترفيهية استثنائية، عروض حية، ومنظومة تكنولوجية متكاملة في قطر.",
    supportingTextEn: "From creative concepts to crowd flow, fabrication, ticketing, staffing, and live operations.",
    supportingTextAr: "من الفكرة الإبداعية إلى التصنيع، التذاكر، إدارة الجماهير، والعمليات الحية.",
    mediaType: "IMAGE",
    mediaUrl: "",
    posterUrl: "",
    altEn: "E3 Qatar Immersive Entertainment",
    altAr: "إي ثري قطر للترفيه الغامر",
    contentAlignment: "CENTER",
    minimumHeight: "MIN_SCREEN",
    motionPreset: "FADE_UP",
    motionIntensity: "MEDIUM",
    theme: "DARK",
    primaryCta: {
      labelEn: "Explore Ecosystem",
      labelAr: "استكشف المنظومة",
      destinationType: "INTERNAL",
      customUrl: "#about"
    },
    secondaryCta: {
      labelEn: "Leadership Message",
      labelAr: "كلمة القيادة",
      destinationType: "INTERNAL",
      customUrl: "#leadership"
    },
    scrollIndicatorEnabled: true
  },
  about: {
    id: "about",
    enabled: true,
    eyebrowEn: "ABOUT E3",
    eyebrowAr: "عن إي ثري",
    headingEn: "Transforming Ideas Into Living Landmarks",
    headingAr: "تحويل الأفكار إلى معالم واقعية حية",
    summaryEn: "Founded in Doha, E3 designs, builds, operates, and scales world-class spatial entertainment experiences across Qatar.",
    summaryAr: "تأسست إي ثري في الدوحة لابتكار وتنفيذ وتشغيل أكبر الوجهات الترفيهية والفعاليات الغامرة في قطر.",
    fullStoryEn: "Deeply rooted in Qatar's Vision, E3 bridges creative imagination with rigorous operational engineering. We handle every aspect of entertainment landmark creation from conceptual design to live operations.",
    fullStoryAr: "انطلاقاً من رؤية قطر الوطنية، تجمع إي ثري بين الإبداع الفني والهندسة التشغيلية الدقيقة في تقديم الوجهات الترفيهية.",
    establishedYear: 2020,
    ownershipStatementEn: "100% Qatari Owned & Operated",
    ownershipStatementAr: "ملكية قطرية ١٠٠٪ وإدارة وطنية",
    headquartersEn: "Lusail City, Qatar",
    headquartersAr: "مدينة لوسيل، قطر",
    marketsServed: ["Qatar", "GCC", "International"],
    companyProfileFileUrl: "",
    companyProfileLabelEn: "Download Corporate Profile",
    companyProfileLabelAr: "تحميل الملف التعريفي للشركة",
    factItems: [
      { id: "f1", value: "50+", labelEn: "Years Combined Experience", labelAr: "سنوات من الخبرة المشتركة", verifiedAt: "2026-01-01", verificationStatus: "VERIFIED", enabled: true, sortOrder: 1 },
      { id: "f2", value: "9+", labelEn: "Core Specializations", labelAr: "التخصصات الأساسية", verifiedAt: "2026-01-01", verificationStatus: "VERIFIED", enabled: true, sortOrder: 2 },
      { id: "f3", value: "100%", labelEn: "Qatari Owned", labelAr: "ملكية قطرية 100%", verifiedAt: "2026-01-01", verificationStatus: "VERIFIED", enabled: true, sortOrder: 3 },
      { id: "f4", value: "3+", labelEn: "Regional Markets", labelAr: "أسواق إقليمية", verifiedAt: "2026-01-01", verificationStatus: "VERIFIED", enabled: true, sortOrder: 4 }
    ],
    theme: "INHERIT"
  },
  leadership: {
    id: "leadership",
    enabled: true,
    eyebrowEn: "LEADERSHIP PERSPECTIVES",
    eyebrowAr: "رؤية القيادة",
    headingEn: "Guided By Vision & Engineering Mastery",
    headingAr: "قيادة طموحة ورؤية استراتيجية",
    introductionEn: "Hear directly from E3's executive leadership on national alignment, global standards, and operational excellence.",
    introductionAr: "تعرف على كلمة القيادة التنفيذية في إي ثري ورؤيتنا للتطوير المستمر.",
    messages: [
      {
        id: "msg-chairman",
        teamMemberId: "",
        messageType: "CHAIRMAN_PERSPECTIVE",
        messageTitleEn: "Chairman's Perspective",
        messageTitleAr: "رؤية رئيس مجلس الإدارة",
        pullQuoteEn: "Aligning creative spatial entertainment with Qatar's strategic tourism vision.",
        pullQuoteAr: "نحقق التناغم بين الترفيه الإبداعي ورؤية قطر السياحية الاستراتيجية.",
        shortMessageEn: "Our mission is to build everlasting entertainment landmarks that elevate Qatar's regional profile.",
        shortMessageAr: "مهمتنا هي ابتكار وجهات ترفيهية استثنائية تعزز مكانة قطر الإقليمية.",
        fullMessageEn: "At E3, we believe entertainment is an infrastructure of joy. By coupling national alignment with world-class engineering, we deliver physical landmarks that inspire memories.",
        fullMessageAr: "في إي ثري، نؤمن بأن الترفيه هو بنية تحتية للسعادة والابتكار.",
        ctaLabelEn: "Learn More",
        ctaLabelAr: "اقرأ المزيد",
        enabled: true,
        sortOrder: 1,
        publishStatus: "PUBLISHED"
      },
      {
        id: "msg-ceo",
        teamMemberId: "",
        messageType: "FROM_THE_CEO",
        messageTitleEn: "From the CEO's Desk",
        messageTitleAr: "كلمة الرئيس التنفيذي",
        pullQuoteEn: "Operational engineering is what turns ambitious sketches into safe, flawless guest experiences.",
        pullQuoteAr: "الهندسة التشغيلية هي المفتاح لتحويل الأفكار الجريئة إلى واقع ملموس وآمن.",
        shortMessageEn: "Every E3 attraction is engineered for crowd safety, flow precision, and unforgettable guest moments.",
        shortMessageAr: "تُصمم كل وجهة في إي ثري بدقة عالية لضمان السلامة وأعلى مستويات الجودة.",
        fullMessageEn: "Execution is our signature. We manage every detail—from custom AV rigging to real-time ticketing—ensuring our partners and guests experience pure magic without operational friction.",
        fullMessageAr: "التنفيذ هو توقيعنا الخاص. ندير كافة التفاصيل الدقيقة لتقديم أفضل التجارب.",
        ctaLabelEn: "Read Strategy",
        ctaLabelAr: "اقرأ الاستراتيجية",
        enabled: true,
        sortOrder: 2,
        publishStatus: "PUBLISHED"
      }
    ],
    theme: "DARK"
  },
  visionMissionValues: {
    id: "visionMissionValues",
    enabled: true,
    sectionTitleEn: "Our Core Spine",
    sectionTitleAr: "ركائزنا الأساسية",
    sectionDescriptionEn: "The principles guiding every project, event, and spatial creation across the E3 ecosystem.",
    sectionDescriptionAr: "المبادئ التي توجه كل مشروع وحدث وابتكار في منظومة إي ثري.",
    vision: {
      titleEn: "Vision",
      titleAr: "الرؤية",
      descriptionEn: "To be the premier spatial technology and landmark entertainment engineering powerhouse in the MENA region.",
      descriptionAr: "أن نكون القوة الرائدة في تقنيات الفعاليات وتصاميم الترفيه التفاعلي في المنطقة.",
      icon: "Target",
      enabled: true
    },
    mission: {
      titleEn: "Mission",
      titleAr: "المهمة",
      descriptionEn: "Delivering safe, world-class kinetic attractions, seamless ticketing technology, and everlasting memories.",
      descriptionAr: "تقديم وجهات ترفيهية آمنة عالمية المستوى وتقنيات تذاكر متكاملة وذكريات تدوم.",
      icon: "Building",
      enabled: true
    },
    values: [
      { id: "v1", titleEn: "Spatial Excellence", titleAr: "التميز الفضائي والهندسي", descriptionEn: "Mastering light, rigging, scale, and sound.", descriptionAr: "إتقان الضوء والإضاءة والمساحة والصوت.", icon: "Sparkles", accentToken: "BLUE", enabled: true, sortOrder: 1 },
      { id: "v2", titleEn: "Uncompromising Safety", titleAr: "السلامة المطلقة", descriptionEn: "Adhering to strict international safety and structural standards.", descriptionAr: "الالتزام بأعلى معايير السلامة والأمان العالمية.", icon: "ShieldCheck", accentToken: "PURPLE", enabled: true, sortOrder: 2 },
      { id: "v3", titleEn: "Operational Integrity", titleAr: "النزاهة التشغيلية", descriptionEn: "Direct relationships and transparent execution.", descriptionAr: "الشفافية الكاملة والتنفيذ الاحترافي المباشر.", icon: "CheckCircle2", accentToken: "CYAN", enabled: true, sortOrder: 3 }
    ],
    theme: "INHERIT"
  },
  recordBreaking: {
    id: "recordBreaking",
    enabled: true,
    eyebrowEn: "GUINNESS WORLD RECORDS™ MILESTONE",
    eyebrowAr: "إنجاز عالمي مسجل رسميًا",
    titleEn: "1,055-Metre Guinness World Records™ Achievement",
    titleAr: "إنجاز غينيس للأرقام القياسية بطول ١,٠٥٥ متراً",
    summaryEn: "E3 engineered and operated InflataRUN, setting the official world record for the longest inflatable obstacle course at 1,055 metres.",
    summaryAr: "صممت ونفذت إي ثري إنفلاتا ران، محققة الرقم القياسي العالمي لأطول مضمار ألعاب مطاطية بطول ١,٠٥٥ متراً.",
    fullDescriptionEn: "Welcoming over 760,000 attendees, this landmark spatial project showcased E3's capabilities in custom fabrication, crowd management, and international event logistics.",
    fullDescriptionAr: "استقبلت الفعالية مئات الآلاف من الزوار، مستعرضة قدرات إي ثري في التصنيع والتدفق الجماهيري.",
    officialRecordTitleEn: "Longest Inflatable Obstacle Course",
    officialRecordTitleAr: "أطول مضمار ألعاب مطاطية في العالم",
    measurementValue: "1,055",
    measurementUnitEn: "Metres",
    measurementUnitAr: "متر",
    achievementDate: "2023-03-15",
    locationEn: "Lusail City, Doha, Qatar",
    locationAr: "مدينة لوسيل، الدوحة، قطر",
    certificateNumber: "",
    officialVerificationUrl: "",
    certificateMediaId: "",
    approvedBadgeMediaId: "",
    brandingUsageApproved: false,
    sourceLabel: "E3 Official Statement & Verification",
    sourceUrl: "https://e3.qa/b2c/discover",
    verificationStatus: "VERIFIED",
    verifiedBy: "Guinness World Records Ltd",
    verifiedAt: "2023-03-15",
    ctaLabelEn: "View Case Study",
    ctaLabelAr: "عرض دراسة الحالة",
    ctaDestination: "/en/b2b/case-studies/inflatarun",
    theme: "DARK"
  },
  impactMilestones: {
    id: "impactMilestones",
    enabled: true,
    eyebrowEn: "PROVEN METRICS & JOURNEY",
    eyebrowAr: "أرقام وإنجازات موثقة",
    headingEn: "Measuring E3's National Impact",
    headingAr: "قياس أثر إي ثري على المستوى الوطني",
    descriptionEn: "Key operational figures verified across E3's tourism, festival, and attraction developments.",
    descriptionAr: "إحصائيات تشغيلية موثقة في مشاريع وفعاليات إي ثري.",
    metrics: [
      { id: "m1", value: "760K+", labelEn: "Total Event Attendees", labelAr: "إجمالي زوار الفعاليات", verifiedAt: "2026-01-01", verificationStatus: "VERIFIED", enabled: true, sortOrder: 1 },
      { id: "m2", value: "1,055m", labelEn: "Record Course Length", labelAr: "طول المضمار القياسي", verifiedAt: "2026-01-01", verificationStatus: "VERIFIED", enabled: true, sortOrder: 2 },
      { id: "m3", value: "100%", labelEn: "Safety Compliance", labelAr: "نسبة الالتزام بالسلامة", verifiedAt: "2026-01-01", verificationStatus: "VERIFIED", enabled: true, sortOrder: 3 },
      { id: "m4", value: "15+", labelEn: "Major Landmark Events", labelAr: "فعاليات كبرى منفذة", verifiedAt: "2026-01-01", verificationStatus: "VERIFIED", enabled: true, sortOrder: 4 }
    ],
    milestones: [
      { id: "ms1", yearOrDate: "2021", titleEn: "Company Foundation", titleAr: "تأسيس الشركة", descriptionEn: "E3 established in Lusail City to pioneer kinetic entertainment.", descriptionAr: "تأسيس إي ثري في لوسيل لتطوير الترفيه التفاعلي.", enabled: true, sortOrder: 1 },
      { id: "ms2", yearOrDate: "2023", titleEn: "Guinness World Record™", titleAr: "رقم غينيس القياسي", descriptionEn: "InflataRUN 1,055m course verified globally.", descriptionAr: "توثيق مضمار إنفلاتا ران عالمياً.", enabled: true, sortOrder: 2 },
      { id: "ms3", yearOrDate: "2024", titleEn: "BookingQube Platform Launch", titleAr: "إطلاق منصة بوكينج كيوب", descriptionEn: "Proprietary ticketing and access control ecosystem deployed.", descriptionAr: "إطلاق منصة التذاكر وإدارة الدخول الذكية.", enabled: true, sortOrder: 3 }
    ],
    theme: "INHERIT"
  },
  bookingQube: {
    id: "bookingQube",
    enabled: true,
    eyebrowEn: "PROPRIETARY ECOSYSTEM TECH",
    eyebrowAr: "تكنولوجيا المنظومة الخاصة",
    headingEn: "Powered By BookingQube™",
    headingAr: "مدعوم بنظام بوكينج كيوب™",
    summaryEn: "BookingQube is E3's intelligent ticketing, registration, gate access, and crowd analytics platform.",
    summaryAr: "منصة بوكينج كيوب هي النظام الذكي لإصدار التذاكر وإدارة البوابات والتحليلات.",
    fullDescriptionEn: "Engineered specifically for high-capacity physical venues and festivals, BookingQube provides seamless digital passes, VIP wristbands, POS integration, and real-time attendance dashboards.",
    fullDescriptionAr: "صُممت المنصة خصيصاً للمرافق والفعاليات ذات السعة العالية لتقديم تجربة دخول سلسة ومتابعة مباشرة.",
    websiteUrl: "https://bookingqube.com",
    featureItems: [
      { id: "bq1", titleEn: "Instant Mobile Ticketing", titleAr: "تذاكر رقمية فورية", descriptionEn: "QR & NFC entry passes with apple wallet support.", descriptionAr: "تذاكر عبر الهاتف تدعم المحفظة الرقمية.", icon: "Smartphone", enabled: true, sortOrder: 1 },
      { id: "bq2", titleEn: "Turnstile & Gate Control", titleAr: "إدارة البوابات والدخول", descriptionEn: "Sub-second scan validation for thousands of guests per hour.", descriptionAr: "تحقق سريع للغاية للآلاف من الزوار.", icon: "ShieldCheck", enabled: true, sortOrder: 2 },
      { id: "bq3", titleEn: "Live Capacity Analytics", titleAr: "تحليلات السعة المباشرة", descriptionEn: "Real-time crowd heatmaps and operational alerts.", descriptionAr: "خرائط حرارية وتنبيهات تشغيلية مباشرة.", icon: "BarChart3", enabled: true, sortOrder: 3 }
    ],
    journeySteps: [
      { id: "js1", titleEn: "1. Select Attraction", titleAr: "١. اختيار الوجهة", descriptionEn: "Guest chooses experience & time slot.", descriptionAr: "يقوم الزائر باختيار التوقيت والفعالية.", enabled: true, sortOrder: 1 },
      { id: "js2", titleEn: "2. Instant Pass", titleAr: "٢. التذكرة الفورية", descriptionEn: "Receive QR pass with zero friction.", descriptionAr: "استلام التذكرة مباشرة دون تعقيد.", enabled: true, sortOrder: 2 },
      { id: "js3", titleEn: "3. Fast Turnstile Access", titleAr: "٣. الدخول السريع", descriptionEn: "Tap and enter the arena seamlessly.", descriptionAr: "مسح التذكرة والدخول السلس.", enabled: true, sortOrder: 3 }
    ],
    theme: "DARK"
  },
  connect: {
    id: "connect",
    enabled: true,
    eyebrowEn: "OPPORTUNITIES & COLLABORATION",
    eyebrowAr: "فرص التعاون والشراكة",
    headingEn: "Connect With The E3 Ecosystem",
    headingAr: "تواصل مع منظومة إي ثري",
    descriptionEn: "Whether you are planning a corporate buyout, hiring equipment, or joining our team—discover your gateway below.",
    descriptionAr: "سواء كنت تخطط لفعالية شركات، تأجير معدات، أو الانضمام لفريقنا—اختر مسارك التالي.",
    items: [
      {
        id: "c1",
        connectionType: "ORGANISER",
        tabLabelEn: "Organise With E3",
        tabLabelAr: "تنظيم الفعاليات",
        titleEn: "School Trips, Group Buyouts & Corporate Hospitality",
        titleAr: "رحلات المدارس، حجز الفعاليات، وضيافة الشركات",
        descriptionEn: "Partner with E3 to host custom group experiences, VIP birthday buyouts, or private brand activations.",
        descriptionAr: "شريكك المثالي لتنظيم الفعاليات الجماعية والخاصة وحفلات الشركات.",
        ctaLabelEn: "Visit Organiser Portal",
        ctaLabelAr: "زيارة بوابة التنظيم",
        customUrl: "/en/b2c/packages",
        enabled: true,
        sortOrder: 1
      },
      {
        id: "c2",
        connectionType: "RENTALS",
        tabLabelEn: "E3 Rentals",
        tabLabelAr: "تأجير المعدات",
        titleEn: "AV Rigging, Kinetic Lighting & Inflatable Structures",
        titleAr: "تأجير الإضاءة، الشاشات، والمطاطيات الترفيهية",
        descriptionEn: "Rent professional stage production equipment, inflatable obstacle courses, and kinetic lighting rigs.",
        descriptionAr: "معدات إنتاج المسارح الاحترافية والشاشات التفاعلية المتاحة للتأجير.",
        ctaLabelEn: "Explore Rental Catalogue",
        ctaLabelAr: "استكشف كتالوج التأجير",
        customUrl: "/en/b2b/services",
        enabled: true,
        sortOrder: 2
      },
      {
        id: "c3",
        connectionType: "CAREERS",
        tabLabelEn: "Join The Crew",
        tabLabelAr: "انضم للفريق",
        titleEn: "Event Staffing, Production Engineers & Talent Pool",
        titleAr: "فرص العمل، مهندسو الإنتاج، وفريق الفعاليات",
        descriptionEn: "E3 is expanding. Join our freelance event database or apply for corporate roles in Lusail.",
        descriptionAr: "انضم لشبكة مواهب وخبراء الفعاليات لدى إي ثري في قطر.",
        ctaLabelEn: "View Open Careers",
        ctaLabelAr: "عرض الوظائف المتاحة",
        customUrl: "/en/careers",
        enabled: true,
        sortOrder: 3
      }
    ],
    theme: "INHERIT"
  },
  trustedAcrossQatar: {
    id: "trustedAcrossQatar",
    enabled: true,
    eyebrowEn: "CLIENTS & PARTNERS",
    eyebrowAr: "شركاؤنا في النجاح",
    headingEn: "Trusted Across Qatar",
    headingAr: "ثقة كبرى المؤسسات في قطر",
    descriptionEn: "We collaborate with leading government entities, venue developers, and global brands.",
    descriptionAr: "نتعاون مع أبرز الجهات الحكومية والشركات الوطنية والعالمية.",
    selectedPartnerIds: [],
    selectedClientIds: [],
    logoTreatment: "ORIGINAL",
    ctaLabelEn: "View All Partners",
    ctaLabelAr: "عرض جميع الشركاء",
    ctaDestination: "/en/b2b/clients",
    theme: "INHERIT"
  },
  latestInsights: {
    id: "latestInsights",
    enabled: true,
    eyebrowEn: "E3 INSIGHTS & PRESS",
    eyebrowAr: "أحدث الأخبار والمقالات",
    headingEn: "Latest From E3",
    headingAr: "جديد إي ثري",
    descriptionEn: "Discover our recent project breakdowns, event recaps, and spatial engineering articles.",
    descriptionAr: "اقرأ أحدث المقالات والتقارير عن مشاريعنا وفعالياتنا الترفيهية.",
    sourceMode: "LATEST",
    maximumPosts: 3,
    selectedArticleIds: [],
    ctaLabelEn: "Explore All Articles",
    ctaLabelAr: "عرض كافة المقالات",
    ctaDestination: "/en/b2b/case-studies",
    theme: "INHERIT"
  },
  finalGateway: {
    id: "finalGateway",
    enabled: true,
    eyebrowEn: "NEXT STEPS",
    eyebrowAr: "الخطوة التالية",
    headingEn: "Ready To Bring Your Experience To Life?",
    headingAr: "جاهز لتحويل فكرتك إلى واقع ترفيهي؟",
    descriptionEn: "Select a pathway below to explore attractions or launch a commercial project with E3.",
    descriptionAr: "اختر المسار الذي يناسبك لاستكشاف الوجهات أو بدء مشروعك القادم.",
    gatewayItems: [
      { id: "g1", titleEn: "Explore Attractions", titleAr: "استكشف الوجهات", descriptionEn: "Browse all active E3 entertainment worlds in Qatar.", descriptionAr: "تصفح جميع عوالم وتجارب إي ثري في قطر.", ctaLabelEn: "View Attractions", ctaLabelAr: "عرض الوجهات", customUrl: "/en/b2c/attractions", enabled: true, sortOrder: 1 },
      { id: "g2", titleEn: "Start a Commercial Project", titleAr: "ابدأ مشروعاً تجارياً", descriptionEn: "Work with E3 on spatial design, fabrication, or operation.", descriptionAr: "تعاون معنا لتصميم وتنفيذ وجهتك الترفيهية.", ctaLabelEn: "Contact B2B Team", ctaLabelAr: "تواصل مع فريق الأعمال", customUrl: "/en/b2b/contact", enabled: true, sortOrder: 2 }
    ],
    theme: "DARK"
  },
  seo: {
    metaTitleEn: "Discover E3 Qatar | Immersive Entertainment & Engineering",
    metaTitleAr: "استكشف إي ثري قطر | الهندسة والترفيه التفاعلي الغامر",
    metaDescriptionEn: "Discover the E3 story, leadership, record-breaking InflataRUN achievement, BookingQube tech, and group packages in Qatar.",
    metaDescriptionAr: "تعرف على قصة إي ثري قطر، قيادتها، رقم غينيس القياسي، وتكنولوجيا بوكينج كيوب والفعاليات.",
    indexingDirective: "INDEX",
    followDirective: "FOLLOW"
  }
};

/**
 * Deeply merges target object with default fallback values.
 * Keeps user-provided values if non-empty, otherwise falls back to defaults.
 */
export function getMergedCMSPageContent(slug: string, rawContent?: any) {
  if (slug === 'b2c-discover' || slug === 'discover') {
    const discoverDefaults = DEFAULT_B2C_DISCOVER_CONTENT;
    const raw = rawContent || {};
    return {
      ...discoverDefaults,
      ...raw,
      hero: {
        ...discoverDefaults.hero,
        ...(raw.hero || {})
      },
      about: {
        ...discoverDefaults.about,
        ...(raw.about || raw.heritage || {})
      },
      leadership: {
        ...discoverDefaults.leadership,
        ...(raw.leadership || {})
      },
      visionMissionValues: {
        ...discoverDefaults.visionMissionValues,
        ...(raw.visionMissionValues || {})
      },
      recordBreaking: {
        ...discoverDefaults.recordBreaking,
        ...(raw.recordBreaking || {})
      },
      impactMilestones: {
        ...discoverDefaults.impactMilestones,
        ...(raw.impactMilestones || {})
      },
      bookingQube: {
        ...discoverDefaults.bookingQube,
        ...(raw.bookingQube || {})
      },
      connect: {
        ...discoverDefaults.connect,
        ...(raw.connect || {})
      },
      trustedAcrossQatar: {
        ...discoverDefaults.trustedAcrossQatar,
        ...(raw.trustedAcrossQatar || {})
      },
      latestInsights: {
        ...discoverDefaults.latestInsights,
        ...(raw.latestInsights || {})
      },
      finalGateway: {
        ...discoverDefaults.finalGateway,
        ...(raw.finalGateway || {})
      },
      seo: {
        ...discoverDefaults.seo,
        ...(raw.seo || {})
      }
    };
  }

  if (slug === 'pulse-orbit') {
    const raw = rawContent || {};
    const defaultDestinations = [
      { id: 'attractions', labelEn: 'Attractions', mediaUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1200&auto=format&fit=crop' },
      { id: 'packages', labelEn: 'Packages', mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop' }
    ];
    return {
      ...raw,
      destinations: (raw.destinations && raw.destinations.length > 0)
        ? raw.destinations.map((d: any, idx: number) => {
            const match = defaultDestinations[idx] || defaultDestinations[0];
            return {
              ...match,
              ...d,
              mediaUrl: (d.mediaUrl && d.mediaUrl.trim().length > 0) ? d.mediaUrl : match.mediaUrl
            };
          })
        : defaultDestinations
    };
  }

  if (slug !== 'b2c-landing') return rawContent || {};

  const defaults = DEFAULT_B2C_LANDING_CONTENT;
  const raw = rawContent || {};

  const resolvedHeroMediaUrl = (
    raw.heroMedia?.mediaUrl ||
    raw.hero?.mediaUrl ||
    raw.act1Hero?.desktopVideoUrl ||
    raw.act1Hero?.mediaUrl ||
    ''
  ).trim();

  const resolvedHeroMediaType = raw.heroMedia?.mediaType || raw.hero?.mediaType || raw.act1Hero?.mediaType || 'IMAGE';
  const resolvedHeroPosterUrl = (raw.heroMedia?.posterUrl || raw.heroMedia?.fallbackImage || raw.hero?.posterUrl || '').trim();

  const heroMediaObj = {
    mediaUrl: resolvedHeroMediaUrl,
    mediaType: resolvedHeroMediaType,
    posterUrl: resolvedHeroPosterUrl,
    fallbackImage: resolvedHeroPosterUrl,
  };

  return {
    ...defaults,
    ...raw,
    heroMedia: {
      ...defaults.heroMedia,
      ...(raw.heroMedia || {}),
      ...heroMediaObj,
    },
    hero: {
      ...defaults.hero,
      ...(raw.hero || {}),
      ...heroMediaObj,
    },
    act1Hero: {
      ...defaults.hero,
      ...(raw.act1Hero || {}),
      ...heroMediaObj,
      desktopVideoUrl: resolvedHeroMediaUrl,
    },
    act1: {
      ...defaults.act1,
      ...(raw.act1 || {}),
    },
    act2: {
      ...defaults.act2,
      ...(raw.act2 || {}),
      steps: (raw.act2?.steps && raw.act2.steps.length > 0)
        ? raw.act2.steps.map((s: any, idx: number) => {
            const match = defaults.act2.steps[idx] || {};
            return {
              ...match,
              ...s,
              mediaUrl: (s.mediaUrl !== undefined ? s.mediaUrl : (match.mediaUrl || '')).trim()
            };
          })
        : defaults.act2.steps,
    },
    act3Worlds: (raw.act3Worlds && raw.act3Worlds.length > 0)
      ? raw.act3Worlds.map((w: any, idx: number) => {
          const match = defaults.act3Worlds[idx] || {};
          return { ...match, ...w, mediaUrl: w.mediaUrl !== undefined ? String(w.mediaUrl).trim() : (match.mediaUrl || '') };
        })
      : defaults.act3Worlds,
    intentSelector: {
      ...defaults.intentSelector,
      ...(raw.intentSelector || {}),
      options: (raw.intentSelector?.options && raw.intentSelector.options.length > 0)
        ? raw.intentSelector.options.map((o: any, idx: number) => {
            const match = defaults.intentSelector.options[idx] || {};
            return { ...match, ...o, mediaUrl: o.mediaUrl !== undefined ? String(o.mediaUrl).trim() : (match.mediaUrl || '') };
          })
        : defaults.intentSelector.options,
    },
    qatarMap: {
      ...defaults.qatarMap,
      ...(raw.qatarMap || {}),
      venues: (raw.qatarMap?.venues && raw.qatarMap.venues.length > 0) ? raw.qatarMap.venues : defaults.qatarMap.venues,
    },
    guestMemories: {
      ...defaults.guestMemories,
      ...(raw.guestMemories || {}),
      moments: (raw.guestMemories?.moments && raw.guestMemories.moments.length > 0)
        ? raw.guestMemories.moments.map((m: any, idx: number) => {
            const match = defaults.guestMemories.moments[idx] || {};
            return { ...match, ...m, mediaUrl: m.mediaUrl !== undefined ? String(m.mediaUrl).trim() : (match.mediaUrl || '') };
          })
        : defaults.guestMemories.moments,
    },
    ourBrands: {
      headlineEn: "Worlds created by E3",
      headlineAr: "عوالم من ابتكار E3",
      subtextEn: "Explore flagship entertainment worlds, kinetic arenas, and digital platforms created and operated by E3.",
      subtextAr: "استكشف منظومة الوجهات والساحات الترفيهية والتطبيقات الرقمية التي ابتكرتها وطوّرتها E3.",
      ...(raw.ourBrands || {}),
    },
    coreTeam: {
      headlineEn: "The people behind the experience",
      headlineAr: "الفريق الذي يصنع التجربة",
      subtextEn: "The visionary directors, spatial designers, and operational leaders bringing E3 experiences to life.",
      subtextAr: "المبدعون والمهندسون والمصممون القائمون على ابتكار وتشغيل وجهات إي ثري الترفيهية.",
      ...(raw.coreTeam || {}),
    },
    socialFeed: {
      headlineEn: "E3 Happening Now — Live Moments",
      headlineAr: "إي ثري الآن — لحظات حية مباشرة",
      subtextEn: "Real-time moments, live event highlights, and guest stories streaming across official E3 channels.",
      subtextAr: "تابع أحدث الفعاليات واللحظات الترفيهية الحية عبر حساباتنا الرسمية.",
      ...(raw.socialFeed || {}),
    },
    act7Ticket: {
      ...defaults.act7Ticket,
      ...(raw.act7Ticket || {}),
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
