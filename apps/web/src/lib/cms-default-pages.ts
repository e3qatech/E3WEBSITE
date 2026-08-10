/**
 * Default Content seeds for CMS Pages.
 * Prevents form clearing / empty text inputs on cold starts, empty DBs, or deployments.
 */

export const DEFAULT_B2C_LANDING_CONTENT = {
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
      { id: 1, titleEn: "1. A Thin Sketch", titleAr: "١. رسم أولي", descEn: "The initial creative spark drawn from pure imagination." },
      { id: 2, titleEn: "2. Spatial Depth", titleAr: "٢. عمق هندسي", descEn: "Translating blueprints into architectural engineering." },
      { id: 3, titleEn: "3. Materials & Light", titleAr: "٣. مواد وإضاءة", descEn: "Infusing kinetic dome surfaces and vibrant stage lighting." },
      { id: 4, titleEn: "4. Physical Assembly", titleAr: "٤. البناء الحقيقي", descEn: "E3 atelier teams fabricating the real-world attraction." },
      { id: 5, titleEn: "5. Guests Enter", titleAr: "٥. دخول الزوار", descEn: "The doors open to welcome families and thrill-seekers." },
      { id: 6, titleEn: "6. Fully Alive", titleAr: "٦. نبض متكامل", descEn: "Everlasting memories created every second." }
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
      mediaUrl: "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?q=80&w=1200&auto=format&fit=crop"
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
      mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop"
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
      mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
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
      mediaUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop"
    }
  ],
  intentSelector: {
    titleEn: "What Kind of Story Do You Want Today?",
    titleAr: "أي نوع من الحكايات تريد أن تعيشها اليوم؟",
    options: [
      { id: "drive", labelEn: "Drive", labelAr: "قيادة", category: "kids", mediaUrl: "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?q=80&w=800&auto=format&fit=crop" },
      { id: "bounce", labelEn: "Bounce", labelAr: "قفز", category: "active", mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop" },
      { id: "compete", labelEn: "Compete", labelAr: "تحدي", category: "arena", mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop" },
      { id: "explore", labelEn: "Explore", labelAr: "استكشاف", category: "discovery", mediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop" },
      { id: "celebrate", labelEn: "Celebrate", labelAr: "احتفال", category: "events", mediaUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop" },
      { id: "family", labelEn: "Family Time", labelAr: "عائلي", category: "family", mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop" }
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
      { id: "m1", titleEn: "First License Earned", titleAr: "أول رخصة قيادة", captionEn: "Kids City Driving School victory moment", captionAr: "لحظة استلام رخصة قيادة الأطفال", mediaUrl: "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?q=80&w=800&auto=format&fit=crop" },
      { id: "m2", titleEn: "Family Bounce Challenge", titleAr: "تحدي القفز العائلي", captionEn: "InflataPark Doha giant dunes", captionAr: "تحدي القفز في إنفلاتا بارك", mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop" },
      { id: "m3", titleEn: "Laser Arena Champions", titleAr: "أبطال ساحة الليزر", captionEn: "Urban Arena team competition", captionAr: "فوز الفريق في ساحة الليزر", mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop" },
      { id: "m4", titleEn: "Nocturnal Drone Light Show", titleAr: "عروض الدرون المضيئة", captionEn: "Al Rayyan outdoor festival night", captionAr: "ليلة العروض المضيئة في سماء الريان", mediaUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop" },
      { id: "m5", titleEn: "Unforgettable Birthdays", titleAr: "أعياد ميلاد لا تُنسى", captionEn: "VIP party room celebrations", captionAr: "احتفالات خاصة في غرف VIP", mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop" }
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
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    headerEn: "E3 PULSE ENTERTAINMENT WORLDS",
    headerAr: "استكشف عالم إي ثري الترفيهي",
    subHeaderEn: "Qatar premier immersive attractions and kinetic entertainment.",
    subHeaderAr: "تجارب ترفيهية غامرة ومدن ألعاب فضائية في قطر",
    showSearch: true,
    streamMediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
    streamPosterUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop",
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

export const DEFAULT_PULSE_ORBIT_CONTENT = {
  titleEn: "PULSE ORBIT DESTINATIONS",
  titleAr: "وجهات مدار إي ثري",
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
      mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
      enabled: true,
    },
    {
      id: "calendar",
      labelEn: "Calendar",
      labelAr: "جدول الفعاليات والتذاكر",
      href: "/b2c/calendar",
      descEn: "Live concerts, seasonal festivals, passes, and exclusive entertainment shows.",
      descAr: "الحفلات الحية والمهرجانات الموسمية والتذاكر والعروض الترفيهية.",
      mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
      enabled: true,
    },
    {
      id: "discover",
      labelEn: "Discover",
      labelAr: "استكشف قطر",
      href: "/b2c/discover",
      descEn: "Curated visitor guides, dining, and spatial technology showcases.",
      descAr: "دليل الزوار، المطاعم، والتكنولوجيا التفاعلية.",
      mediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop",
      enabled: true,
    },
    {
      id: "packages",
      labelEn: "Packages",
      labelAr: "الباقات",
      href: "/b2c/packages",
      descEn: "VIP Birthday parties, corporate team outings, and private venue buyouts.",
      descAr: "حفلات أعياد الميلاد، الفعاليات الخاصة، وحجوزات الشركات.",
      mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop",
      enabled: true,
    },
    {
      id: "contact",
      labelEn: "Contact",
      labelAr: "تواصل معنا",
      href: "/b2c/contact",
      descEn: "24/7 guest support, venue location, and concierge services.",
      descAr: "خدمة الزوار، مواقع الفعاليات، واستفسارات الحجز.",
      mediaUrl: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=800&auto=format&fit=crop",
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

  if (slug === 'pulse-orbit' || slug === 'b2c-pulse-orbit') {
    const defaults = DEFAULT_PULSE_ORBIT_CONTENT;
    const raw = rawContent || {};
    const rawDestinations = Array.isArray(raw.destinations) && raw.destinations.length > 0
      ? raw.destinations
      : defaults.destinations;

    const mergedDestinations = rawDestinations.map((rawDest: any, idx: number) => {
      const match = defaults.destinations.find((d: any) => d.id === rawDest.id) || defaults.destinations[idx] || {};
      return {
        id: rawDest.id || match.id || `dest-${idx}`,
        labelEn: (rawDest.labelEn !== undefined && rawDest.labelEn !== null) ? rawDest.labelEn : (match.labelEn || ""),
        labelAr: (rawDest.labelAr !== undefined && rawDest.labelAr !== null) ? rawDest.labelAr : (match.labelAr || ""),
        href: (rawDest.href !== undefined && rawDest.href !== null) ? rawDest.href : (match.href || ""),
        descEn: (rawDest.descEn !== undefined && rawDest.descEn !== null) ? rawDest.descEn : (match.descEn || ""),
        descAr: (rawDest.descAr !== undefined && rawDest.descAr !== null) ? rawDest.descAr : (match.descAr || ""),
        mediaUrl: (rawDest.mediaUrl && String(rawDest.mediaUrl).trim() !== '') ? rawDest.mediaUrl : (match.mediaUrl || ""),
        enabled: rawDest.enabled !== undefined ? Boolean(rawDest.enabled) : (match.enabled ?? true),
      };
    });

    return {
      ...defaults,
      ...raw,
      titleEn: raw.titleEn || defaults.titleEn,
      titleAr: raw.titleAr || defaults.titleAr,
      destinations: mergedDestinations,
    };
  }

  if (slug !== 'b2c-landing') return rawContent || {};

  const defaults = DEFAULT_B2C_LANDING_CONTENT;
  const raw = rawContent || {};

  return {
    ...defaults,
    ...raw,
    act1: {
      ...defaults.act1,
      ...(raw.act1 || {}),
    },
    act2: {
      ...defaults.act2,
      ...(raw.act2 || {}),
      steps: (raw.act2?.steps && raw.act2.steps.length > 0) ? raw.act2.steps : defaults.act2.steps,
    },
    act3Worlds: (raw.act3Worlds && raw.act3Worlds.length > 0)
      ? raw.act3Worlds.map((w: any, idx: number) => {
          const match = defaults.act3Worlds[idx] || {};
          return { ...match, ...w, mediaUrl: (w.mediaUrl && String(w.mediaUrl).trim() !== '') ? w.mediaUrl : (match.mediaUrl || '') };
        })
      : defaults.act3Worlds,
    intentSelector: {
      ...defaults.intentSelector,
      ...(raw.intentSelector || {}),
      options: (raw.intentSelector?.options && raw.intentSelector.options.length > 0)
        ? raw.intentSelector.options.map((o: any, idx: number) => {
            const match = defaults.intentSelector.options[idx] || {};
            return { ...match, ...o, mediaUrl: (o.mediaUrl && String(o.mediaUrl).trim() !== '') ? o.mediaUrl : (match.mediaUrl || '') };
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
            return { ...match, ...m, mediaUrl: (m.mediaUrl && String(m.mediaUrl).trim() !== '') ? m.mediaUrl : (match.mediaUrl || '') };
          })
        : defaults.guestMemories.moments,
    },
    act7Ticket: {
      ...defaults.act7Ticket,
      ...(raw.act7Ticket || {}),
    },
    hero: {
      ...defaults.hero,
      ...(raw.hero || {}),
      mediaUrl: (raw.hero?.mediaUrl && raw.hero.mediaUrl.trim() !== '') ? raw.hero.mediaUrl : defaults.hero.mediaUrl,
      streamMediaUrl: (raw.hero?.streamMediaUrl && raw.hero.streamMediaUrl.trim() !== '') ? raw.hero.streamMediaUrl : defaults.hero.streamMediaUrl,
      posterUrl: (raw.hero?.posterUrl && raw.hero.posterUrl.trim() !== '') ? raw.hero.posterUrl : defaults.hero.posterUrl,
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
