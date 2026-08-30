import { DEFAULT_SPATIAL_SECTIONS } from "@/components/spatial/spatial-experience.config";
import { DEFAULT_SOCIAL_CHANNELS, DEFAULT_SOCIAL_POSTS } from "@/lib/cms-social";

export interface B2CSectionItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  enabled: boolean;
  order: number;
}

export const DEFAULT_B2C_SECTION_SEQUENCE: B2CSectionItem[] = [
  {
    id: "hero",
    nameEn: "Cinematic Hero (Act 1)",
    nameAr: "الهيرو السينمائي (الفصل الأول)",
    descriptionEn: "Main headline, tagline, and immersive hero media",
    descriptionAr: "العنوان الرئيسي والشعار والوسائط التفاعلية",
    enabled: true,
    order: 1
  },
  {
    id: "ideasToLife",
    nameEn: "Ideas To Life (Act 2)",
    nameAr: "من الفكرة إلى الواقع (الفصل الثاني)",
    descriptionEn: "Interactive step-by-step concept-to-reality process comparison",
    descriptionAr: "مقارنة تفاعلية لمراحل تحويل الأفكار إلى واقع",
    enabled: true,
    order: 2
  },
  {
    id: "storyDiscovery",
    nameEn: "Story Taxonomy & Portals (Act 3)",
    nameAr: "استكشاف التجارب والوجهات (الفصل الثالث)",
    descriptionEn: "Filterable portals for attractions, live shows, dining, and play",
    descriptionAr: "بوابات تصنيف التجارب والأنشطة والفعاليات",
    enabled: true,
    order: 3
  },
  {
    id: "ourBrands",
    nameEn: "Our Brands Constellation",
    nameAr: "علاماتنا التجارية",
    descriptionEn: "Showcase of E3 created IP brands and experience concepts",
    descriptionAr: "استعراض العلامات التجارية والابتكارات المملوكة لإي ثري",
    enabled: true,
    order: 4
  },
  {
    id: "experienceWorlds",
    nameEn: "Featured Attraction Worlds",
    nameAr: "عوالِم الوجهات المميزة",
    descriptionEn: "3D interactive stage showcasing top attraction destinations",
    descriptionAr: "منصة ثلاثية الأبعاد لوجهات وألعاب إي ثري الرئيسية",
    enabled: true,
    order: 5
  },
  {
    id: "coreTeam",
    nameEn: "Core Team & Leadership",
    nameAr: "فريق العمل والقيادة",
    descriptionEn: "Spotlight on executive team members shaping the experiences",
    descriptionAr: "إبراز الكوادر والخبرات البشرية خلف تجارب إي ثري",
    enabled: true,
    order: 6
  },
  {
    id: "livingDay",
    nameEn: "The Living Day (Act 4)",
    nameAr: "يومك مع إي ثري (الفصل الرابع)",
    descriptionEn: "Dynamic time-of-day timeline guide for visitors",
    descriptionAr: "جدول زمني تفاعلي لتجارب اليوم عبر الساعات",
    enabled: true,
    order: 7
  },
  {
    id: "qatarMap",
    nameEn: "Qatar Interactive Map",
    nameAr: "خريطة قطر التفاعلية",
    descriptionEn: "Spatial map pinpointing E3 attraction locations in Qatar",
    descriptionAr: "خريطة تفاعلية لتحديد مواقع وجهات إي ثري في قطر",
    enabled: true,
    order: 8
  },
  {
    id: "socialFeed",
    nameEn: "Happening Now / Social Feed",
    nameAr: "يحدث الآن / البث الحي",
    descriptionEn: "Live pulse stream of guest photos, videos and updates",
    descriptionAr: "تغطية حية وتفاعلية لفعاليات ولحظات الزوار",
    enabled: true,
    order: 9
  },
  {
    id: "parallaxGallery",
    nameEn: "Everlasting Memories Gallery",
    nameAr: "معرض ذكريات لا تُنسى",
    descriptionEn: "GPU-accelerated horizontal photo memory wall",
    descriptionAr: "معرض صور أفقي تفاعلي عالي السرعة للذكريات",
    enabled: true,
    order: 10
  },
  {
    id: "digitalTicket",
    nameEn: "Digital Ticket / Story CTA",
    nameAr: "التذكرة الرقمية والدعوة للحجز",
    descriptionEn: "Tactile digital ticket experience and final booking conversion CTA",
    descriptionAr: "بطاقة التذكرة التفاعلية ودعوة حجز التجارب",
    enabled: true,
    order: 11
  }
];

export const DEFAULT_B2C_LANDING_CONTENT = {
  sectionSequence: DEFAULT_B2C_SECTION_SEQUENCE,
  e3LivingHero: {
    eyebrowEn: "E3 QATAR ENTERTAINMENT WORLDS",
    eyebrowAr: "عالم إي ثري الترفيهي بقطر",
    fixedHeadlineEn: "SOME DAYS PASS. OTHERS BECOME {{animated}}",
    fixedHeadlineAr: "بعض الأيام تمضي. وأخرى تصبح {{animated}}",
    headlineTemplateEn: "SOME DAYS PASS. OTHERS BECOME {{animated}}",
    headlineTemplateAr: "بعض الأيام تمضي. وأخرى تصبح {{animated}}",
    rotatingWordsEn: ["STORIES", "ADVENTURES", "MOMENTS", "MEMORIES"],
    rotatingWordsAr: ["حكايات", "مغامرات", "لحظات", "ذكريات"],
    descriptionEn: "Enter a world of attractions, live experiences and unforgettable moments created by E3.",
    descriptionAr: "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية واللحظات التي لا تُنسى مع E3.",
    primaryCta: {
      labelEn: "Begin Your Story",
      labelAr: "ابدأ حكايتك",
      url: "#bring-it-to-life"
    },
    secondaryCta: {
      labelEn: "See What's On Today",
      labelAr: "اكتشف فعاليات اليوم",
      url: "#living-day"
    },
    preset: "memory-engine",
    animationSpeed: 2800,
    animationDuration: 600,
    enableRotatingWords: true,
    animationType: "blur-morph" as const,
    wordStyle: "static-gradient" as const,
    alignmentEn: "center" as const,
    alignmentAr: "center" as const,
  },
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
  act2Curtain: {
    badgeEn: "E3 BRAND PHILOSOPHY & MANIFESTO",
    badgeAr: "بيان وفلسفة العلامة التجارية",
    headingEn: "We don’t just imagine fun. We bring it to life.",
    headingAr: "لا نكتفي بتخيّل المتعة… بل نحوّلها إلى واقع.",
    subtextEn: "Enter a world of attractions, live experiences and unforgettable moments created by E3 in Qatar. We engineer spatial worlds where imagination and human joy converge.",
    subtextAr: "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية واللحظات التي لا تُنسى مع E3 في قطر. نصمم ونبني مساحات تفاعلية يلتقي فيها الخيال مع البهجة الإنسانية.",
    quoteEn: "Some days pass. Others become stories.",
    quoteAr: "أيام تمرّ… وأيام تتحول إلى حكايات.",
    quoteAuthorEn: "E3 Creative & Engineering Atelier",
    quoteAuthorAr: "استوديو إي ثري للإبداع والهندسة",
    mediaUrl: "",
    mediaType: "IMAGE",
    posterUrl: "",
    ctaLabelEn: "Explore Our Worlds",
    ctaLabelAr: "استكشف وجهاتنا",
    ctaUrl: "#bring-it-to-life"
  },
  brandManifesto: {
    badgeEn: "E3 BRAND PHILOSOPHY & MANIFESTO",
    badgeAr: "بيان وفلسفة العلامة التجارية",
    headingEn: "We don’t just imagine fun. We bring it to life.",
    headingAr: "لا نكتفي بتخيّل المتعة… بل نحوّلها إلى واقع.",
    subtextEn: "Enter a world of attractions, live experiences and unforgettable moments created by E3 in Qatar. We engineer spatial worlds where imagination and human joy converge.",
    subtextAr: "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية واللحظات التي لا تُنسى مع E3 في قطر. نصمم ونبني مساحات تفاعلية يلتقي فيها الخيال مع البهجة الإنسانية.",
    quoteEn: "Some days pass. Others become stories.",
    quoteAr: "أيام تمرّ… وأيام تتحول إلى حكايات.",
    quoteAuthorEn: "E3 Creative & Engineering Atelier",
    quoteAuthorAr: "استوديو إي ثري للإبداع والهندسة",
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
      slug: "kidz-driving-school-city-center-doha",
      nameEn: "Kidz Driving School",
      nameAr: "مدرسة القيادة للأطفال",
      taglineEn: "Where Young Drivers Learn Safety, Responsibility, and Confidence Through Play",
      taglineAr: "حيث يتعلم السائقون الصغار السلامة والمسؤولية والثقة من خلال اللعب",
      locationEn: "City Center Doha, 3rd Floor",
      locationAr: "ستي سنتر الدوحة، الطابق الثالث",
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
      accentColor: "#10b981",
      materialType: "ROAD_MARKING",
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e6016d8f-1b8e-4099-95b7-fb9acd1169eb.png"
    },
    {
      id: "urban-arena",
      slug: "urban-arena",
      nameEn: "Urban Arena",
      nameAr: "أوربان أرينا",
      taglineEn: "A High-Energy Indoor Arena for Games, Challenges, and Urban Entertainment",
      taglineAr: "ساحة داخلية مليئة بالحماس للألعاب والتحديات والترفيه الحضري",
      locationEn: "Doha Mall, P Floor",
      locationAr: "الدوحة مول، الطابق P",
      audienceEn: "Teens & Adults",
      audienceAr: "الشباب والكبار",
      statusEn: "Open Now",
      statusAr: "مفتوح الآن",
      timingsEn: "02:00 PM - 12:00 AM",
      timingsAr: "٠٢:٠٠ م - ١٢:٠٠ ص",
      price: 45,
      currency: "QAR",
      ctaEn: "Enter the Challenge",
      ctaAr: "يدخل التحدي",
      accentColor: "#3b82f6",
      materialType: "LUMINOUS_TRAIL",
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png"
    },
    {
      id: "inflatapark-doha",
      slug: "inflata-park-city-center-doha",
      nameEn: "InflataPark",
      nameAr: "إنفلاتا بارك",
      taglineEn: "Qatar’s Indoor Inflatable Adventure Park for Active Family Fun",
      taglineAr: "حديقة مغامرات داخلية قابلة للنفخ في قطر للمتعة العائلية النشطة",
      locationEn: "City Center Doha",
      locationAr: "ستي سنتر الدوحة",
      audienceEn: "All Ages",
      audienceAr: "جميع الأعمار",
      statusEn: "Open Now",
      statusAr: "مفتوح الآن",
      timingsEn: "12:00 PM - 11:00 PM",
      timingsAr: "١٢:٠٠ م - ١١:٠٠ م",
      price: 35,
      currency: "QAR",
      ctaEn: "Jump Into the Fun",
      ctaAr: "اقفز إلى المتعة",
      accentColor: "#ec4899",
      materialType: "INFLATABLE_SEAM",
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg"
    },
    {
      id: "crayons-bricks",
      slug: "crayons-and-bricks-place-vendome",
      nameEn: "Crayons & Bricks",
      nameAr: "كرايونز آند بريكس",
      taglineEn: "A Creative Play Studio Where Art, Bricks, and Imagination Come Together",
      taglineAr: "استوديو لعب إبداعي يجمع بين الفن والمكعبات والخيال",
      locationEn: "Place Vendôme Mall, Lusail",
      locationAr: "بلاس فاندوم، لوسيل",
      audienceEn: "Kids & Families",
      audienceAr: "الأطفال والعائلات",
      statusEn: "Open Now",
      statusAr: "مفتوح الآن",
      timingsEn: "10:00 AM - 10:00 PM",
      timingsAr: "١٠:٠٠ ص - ١٠:٠٠ م",
      price: 50,
      currency: "QAR",
      ctaEn: "Explore Workshops",
      ctaAr: "استكشف الورش",
      accentColor: "#f59e0b",
      materialType: "STEM_STUDIO",
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg"
    },
    {
      id: "spongebob-paw-patrol",
      slug: "spongebob-squarepants-paw-patrol-activation-meryal",
      nameEn: "SpongeBob & PAW Patrol Activation",
      nameAr: "فعالية سبونج بوب وباو باترول",
      taglineEn: "A Splash-Filled Character Experience Bringing Bikini Bottom to Qatar",
      taglineAr: "تجربة شخصيات مائية تجمع بين بيكيني بوتوم وأدفنتشر باي في قطر",
      locationEn: "Meryal Waterpark, Qetaifan Island",
      locationAr: "حديقة مريال المائية، جزيرة قطيفان",
      audienceEn: "Kids & Families",
      audienceAr: "الأطفال والعائلات",
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
    badgeEn: "EVERLASTING MEMORIES — GPU PARALLAX",
    badgeAr: "ذكريات لا تُنسى — EVERLASTING MEMORIES",
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
  coreTeam: {
    headlineEn: "The people behind the experience",
    headlineAr: "الفريق الذي يصنع التجربة",
    subtextEn: "The visionary directors, spatial designers, and operational leaders bringing E3 experiences to life.",
    subtextAr: "المبدعون والمهندسون والمصممون القائمون على ابتكار وتشغيل وجهات إي ثري الترفيهية.",
    selectedMemberIds: [],
    members: []
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
    backgroundImage: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    mediaType: "IMAGE",
    posterMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
  },
  footerMedia: {
    mediaType: "IMAGE",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    posterMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    backgroundImage: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    descriptionEn: "Pioneering the future of events and entertainment in Qatar. Creating unforgettable moments through innovation.",
    descriptionAr: "ريادة مستقبل الفعاليات والترفيه في قطر. صناعة لحظات لا تُنسى من خلال الابتكار.",
  },
  footerMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
  footerMediaType: "IMAGE",
  footerPosterUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
  footerBackgroundMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
  footerBackgroundMediaType: "IMAGE",
  footerBackgroundPosterUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
  footerDescriptionEn: "Pioneering the future of events and entertainment in Qatar. Creating unforgettable moments through innovation.",
  footerDescriptionAr: "ريادة مستقبل الفعاليات والترفيه في قطر. صناعة لحظات لا تُنسى من خلال الابتكار.",
  socialFeed: {
    eyebrowEn: "LIVE MEMORY WALL — HAPPENING NOW",
    eyebrowAr: "جدار الذكريات التفاعلي — LIVE MEMORY WALL",
    headlineEn: "E3 Happening Now — Live Moments",
    headlineAr: "إي ثري الآن — لحظات حية مباشرة",
    subtextEn: "Real-time moments, live event highlights, and guest stories streaming across official E3 channels.",
    subtextAr: "تابع أحدث الفعاليات واللحظات الترفيهية الحية عبر حساباتنا الرسمية.",
    channels: DEFAULT_SOCIAL_CHANNELS,
    posts: DEFAULT_SOCIAL_POSTS,
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
  liveFeed: {
    titleEn: "LIVE EVENT FEED & BROADCASTS",
    titleAr: "البث المباشر للفعاليات والمهرجانات",
    streamUrl: "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
    isLiveNow: true,
    recentHighlights: [
      {
        id: "hl-1",
        titleEn: "Nocturnal Drone Parade in Lusail",
        titleAr: "عروض طائرات الدرون المضيئة في لوسيل",
        mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
        dateLabelEn: "Tonight in Doha",
        dateLabelAr: "الليلة في الدوحة"
      }
    ]
  },
  footer: {
    mediaType: "IMAGE",
    mediaUrl: "",
  },
  spatialExperience: {
    enabled: false,
    faces: DEFAULT_SPATIAL_SECTIONS,
  }
};

export const DEFAULT_B2B_TEAM_PAGE_CONTENT = {
  eyebrowEn: "The Masterminds — E3 Leadership",
  eyebrowAr: "العقول المدبرة — قيادة وفريق عمل إي ثري",
  fixedHeadlineEn: "MEET THE PEOPLE WHO BUILD",
  fixedHeadlineAr: "تعرّف على الأشخاص الذين يصنعون",
  rotatingWordsEn: ["EXPERIENCES", "DESTINATIONS", "MOMENTS", "THE IMPOSSIBLE"],
  rotatingWordsAr: ["التجارب", "الوجهات", "اللحظات", "المستحيل"],
  descriptionEn: "Meet the engineers, creatives, and tacticians who make the impossible happen every day.",
  descriptionAr: "تعرف على المهندسين والمبدعين والمخططين الذين يجعلون المستحيل ممكناً كل يوم.",
  primaryCta: {
    labelEn: "Join Our Team",
    labelAr: "انضم لفريقنا",
    url: "/{locale}/careers"
  },
  secondaryCta: {
    labelEn: "Explore Departments",
    labelAr: "استكشف الأقسام",
    url: "#department-navigator"
  },
  heroMedia: {
    mediaType: "IMAGE",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC01674.jpg",
    posterUrl: ""
  },
  footerMedia: {
    mediaType: "VIDEO",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    posterUrl: ""
  },
  preset: "team-constellation" as const,
  animationSpeed: 2800,
  enableRotatingWords: true,
  seoTitle: "Our Team & Leadership | E3 Qatar B2B",
  seoDescription: "Meet the executive leadership, spatial engineers, and event atelier directors at E3."
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
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg",
      enabled: true,
    },
    {
      id: "calendar",
      labelEn: "Calendar",
      labelAr: "جدول الفعاليات والتذاكر",
      href: "/b2c/calendar",
      descEn: "Live concerts, seasonal festivals, passes, and exclusive entertainment shows.",
      descAr: "الحفلات الحية والمهرجانات الموسمية والتذاكر والعروض الترفيهية.",
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
      enabled: true,
    },
    {
      id: "discover",
      labelEn: "Discover",
      labelAr: "استكشف قطر",
      href: "/b2c/discover",
      descEn: "Curated visitor guides, dining, and spatial technology showcases.",
      descAr: "دليل الزوار، المطاعم، والتكنولوجيا التفاعلية.",
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09277-2.jpg",
      enabled: true,
    },
    {
      id: "packages",
      labelEn: "Packages",
      labelAr: "الباقات",
      href: "/b2c/packages",
      descEn: "VIP Birthday parties, corporate team outings, and private venue buyouts.",
      descAr: "حفلات أعياد الميلاد، الفعاليات الخاصة، وحجوزات الشركات.",
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC06321.jpg",
      enabled: true,
    },
    {
      id: "contact",
      labelEn: "Contact",
      labelAr: "تواصل معنا",
      href: "/b2c/contact",
      descEn: "24/7 guest support, venue location, and concierge services.",
      descAr: "خدمة الزوار، مواقع الفعاليات، واستفسارات الحجز.",
      mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
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
  bookTicketsUrl: "",
  bookTicketsLabelEn: "DOWNLOAD PROFILE",
  bookTicketsLabelAr: "تحميل الملف التعريفي",
  bookTicketsEnabled: true,
  bookTicketsExternal: false,
  destinations: [
    {
      id: "discover",
      labelEn: "Discover E3",
      labelAr: "استكشف إي ثري",
      href: "/b2b/discover",
      descEn: "Discover the E3 story, leadership, record-breaking achievements, and technology.",
      descAr: "تعرف على قصة إي ثري قطر، قيادتها، أرقامها القياسية، وتكنولوجيا الفعاليات.",
      mediaUrl: "",
      enabled: true,
    },
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
    "e3Rentals",
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
    fixedHeadlineEn: "CHOOSE HOW YOU WANT TO",
    fixedHeadlineAr: "اختر كيف ترغب في أن",
    rotatingWordsEn: ["EXPLORE", "COMPETE", "CREATE", "DISCOVER"],
    rotatingWordsAr: ["تستكشف", "تنافس", "تبتكر", "تكتشف"],
    preset: "story-portal",
    animationSpeed: 2800,
    enableRotatingWords: true,
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
      {
        id: "bq1",
        titleEn: "Instant Mobile Ticketing",
        titleAr: "تذاكر رقمية فورية",
        descriptionEn: "QR & NFC entry passes with Apple Wallet and Google Wallet sync.",
        descriptionAr: "تذاكر عبر الهاتف تدعم المحفظة الرقمية والدخول السريع.",
        architectureLabelEn: "BOOKINGQUBE™ ARCHITECTURE",
        architectureLabelAr: "هندسة بوكينج كيوب™",
        icon: "Smartphone",
        imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
        detailedTextEn: "BookingQube streamlines the complete ticketing journey—from online purchase to venue admission. Guests receive a secure QR-coded mobile ticket immediately after booking, eliminating physical collection points and reducing queues. The system supports multiple ticket types, timed sessions, promotional codes, group bookings and real-time ticket validation. Each ticket can be scanned directly from a smartphone, helping operators accelerate entry, reduce duplication and maintain accurate attendance records across every sales channel.",
        detailedTextAr: "يعمل نظام بوكينج كيوب على تسهيل رحلة شراء التذاكر والدخول بشكل كامل. يستلم الزائر تذكرة مشفرة فور الحجز مما يلغي نقاط الانتظار ويسرع عمليات الدخول عبر بوابات ذكية معتمدة.",
        specs: [
          { keyEn: "LATENCY & VALIDATION", keyAr: "سرعة الاستجابة والتحقق", valueEn: "Sub-200ms NFC & Offline Token Scanning", valueAr: "مسح فوري للرموز وتقنية NFC بدون إنترنت" },
          { keyEn: "WALLET INTEGRATION", keyAr: "التوافق مع المحافظ الرقمية", valueEn: "Native Apple Wallet & Google Pass Sync", valueAr: "مزامنة مباشرة مع Apple Wallet و Google Pass" },
          { keyEn: "SECURITY PROTOCOL", keyAr: "بروتوكول الأمان والحماية", valueEn: "Dynamic Encrypted QR Code Anti-Screenshot", valueAr: "رمز QR ديناميكي مشفر لمنع لقطات الشاشة" },
          { keyEn: "ANALYTICS ENGINE", keyAr: "محرك التحليلات والبيانات", valueEn: "Real-Time Heatmaps & Density Telemetry", valueAr: "خرائط حرارية ومؤشرات كثافة لحظية" }
        ],
        enabled: true,
        sortOrder: 1
      },
      {
        id: "bq2",
        titleEn: "Turnstile & Gate Control",
        titleAr: "إدارة البوابات والدخول",
        descriptionEn: "Sub-second scan validation for thousands of guests per hour.",
        descriptionAr: "تحقق سريع للغاية للآلاف من الزوار عبر بوابات الدخول.",
        architectureLabelEn: "BOOKINGQUBE™ ACCESS CONTROL",
        architectureLabelAr: "منظومة التحكم بالبوابات",
        icon: "ShieldCheck",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        detailedTextEn: "High-throughput turnstiles and handheld scanners with offline local validation clusters, ensuring zero delay even during peak influx or network disruption.",
        detailedTextAr: "بوابات دخول ذكية وأجهزة فحص يدوية تعمل حتى في حال انقطاع الشبكة مع التحقق المحلي التلقائي.",
        specs: [
          { keyEn: "THROUGHPUT RATE", keyAr: "معدل التدفق", valueEn: "5,000+ Guests / Hour / Lane", valueAr: "أكثر من ٥٠٠٠ زائر / ساعة / مسار" },
          { keyEn: "ANTI-PASSBACK", keyAr: "منع إعادة الاستخدام", valueEn: "Hardware-Enforced Multi-Entry Prevention", valueAr: "حماية عتادية تمنع تمرير التذكرة لأكثر من شخص" },
          { keyEn: "FAILSAFE MODE", keyAr: "استمرارية التشغيل", valueEn: "Automatic Battery Backup & Manual Override", valueAr: "بطاريات طوارئ وتحويل يدوي فوري" },
          { keyEn: "DIAGNOSTICS", keyAr: "المراقبة عن بعد", valueEn: "Continuous Ping & Remote Gate Telemetry", valueAr: "مراقبة مباشرة لحالة البوابات اللحظية" }
        ],
        enabled: true,
        sortOrder: 2
      },
      {
        id: "bq3",
        titleEn: "Live Capacity Analytics",
        titleAr: "تحليلات السعة المباشرة",
        descriptionEn: "Real-time crowd heatmaps and operational alerts.",
        descriptionAr: "خرائط حرارية وتنبيهات تشغيلية مباشرة لإدارة الحشود.",
        architectureLabelEn: "BOOKINGQUBE™ TELEMETRY",
        architectureLabelAr: "محرك تحليلات الكثافة والحشود",
        icon: "BarChart3",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        detailedTextEn: "Unified venue operations dashboard displaying real-time occupancy, peak hour distribution, zone density, and automated alerts for venue managers.",
        detailedTextAr: "لوحة تحكم موحدة تعرض الكثافة اللحظية وتوزيع الزوار في مختلف المناطق مع تنبيهات تلقائية لفرق التشغيل والسلامة.",
        specs: [
          { keyEn: "DENSITY TELEMETRY", keyAr: "قياس الكثافة", valueEn: "Real-Time Geo-Spatial Crowd Heatmaps", valueAr: "خرائط جغرافية حرارية لكثافة الحشود" },
          { keyEn: "ZONE BALANCING", keyAr: "توازن المناطق", valueEn: "Automated Egress & Ingress Throttling", valueAr: "توجيه ذكي لمسارات الدخول والخروج" },
          { keyEn: "FLOW PREDICTION", keyAr: "التنبؤ بالتدفق", valueEn: "ML-Driven Surge & Queue Forecasting", valueAr: "تنبؤ فوري بأوقات الذروة والانتظار" },
          { keyEn: "INCIDENT DISPATCH", keyAr: "إدارة البلاغات", valueEn: "Instant Warden & Security Paging", valueAr: "إرسال فوري لفرق الأمن والسلامة" }
        ],
        enabled: true,
        sortOrder: 3
      },
      {
        id: "bq-rentals",
        titleEn: "E3 Rentals™ Fleet & Asset Hub",
        titleAr: "منظومة إي ثري لإدارة وتأجير المعدات",
        descriptionEn: "Real-time rental availability, load-calculation telemetry, and rapid staging deployment for Qatar's landmark productions.",
        descriptionAr: "تتبع لحظي لجاهزية المعدات، ونمذجة الأحمال الإنشائية، والنشر السريع للفعاليات الكبرى في قطر.",
        architectureLabelEn: "E3 RENTALS™ ASSET & RIGGING HUB",
        architectureLabelAr: "منظومة إي ثري لتأجير وتجهيز الفعاليات",
        icon: "Boxes",
        imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
        detailedTextEn: "E3 Rentals Hub provides dynamic inventory allocation, digital structural load calculations, and automated maintenance tracking for lighting, staging, audio, and inflatable assets across Qatar.",
        detailedTextAr: "توفر منصة إي ثري لإدارة وتأجير المعدات تخصيصاً ديناميكياً للمخزون، وحسابات أحمال هندسية رقمية، ومتابعة صيانة فورية لكافة معدات الإضاءة والمسارح والصوت والمطاطيات.",
        specs: [
          { keyEn: "FLEET TELEMETRY", keyAr: "تتبع الأصول والمعدات", valueEn: "Real-Time RFID & GPS Asset Tracking", valueAr: "تتبع رقمي دقيق لكافة الأصول والمعدات" },
          { keyEn: "RIGGING & LOAD SAFETY", keyAr: "أمان التحميل والتعليق", valueEn: "Automated Structural Load & Wind Simulation", valueAr: "محاكاة رقمية للأحمال الإنشائية وسرعة الرياح" },
          { keyEn: "POWER REDUNDANCY", keyAr: "استمرارية الطاقة", valueEn: "Dual-Grid Synchronized Distribution Telemetry", valueAr: "توزيع طاقة مزدوج متزامن يمنع انقطاع التيار" },
          { keyEn: "DISPATCH TIMELINE", keyAr: "سرعة التجهيز والتوريد", valueEn: "24-Hour Rapid Staging & Mobilization Protocol", valueAr: "جاهزية تشغيلية وتوريد سريع خلال ٢٤ ساعة" }
        ],
        enabled: true,
        sortOrder: 4
      }
    ],
    journeySteps: [
      { id: "js1", titleEn: "1. Select Attraction", titleAr: "١. اختيار الوجهة", descriptionEn: "Guest chooses experience & time slot.", descriptionAr: "يقوم الزائر باختيار التوقيت والفعالية.", enabled: true, sortOrder: 1 },
      { id: "js2", titleEn: "2. Instant Pass", titleAr: "٢. التذكرة الفورية", descriptionEn: "Receive QR pass with zero friction.", descriptionAr: "استلام التذكرة مباشرة دون تعقيد.", enabled: true, sortOrder: 2 },
      { id: "js3", titleEn: "3. Fast Turnstile Access", titleAr: "٣. الدخول السريع", descriptionEn: "Tap and enter the arena seamlessly.", descriptionAr: "مسح التذكرة والدخول السلس.", enabled: true, sortOrder: 3 }
    ],
    theme: "DARK"
  },
  e3Rentals: {
    id: "e3Rentals",
    enabled: true,
    eyebrowEn: "PROPRIETARY FLEET & STAGING TECH",
    eyebrowAr: "تكنولوجيا أسطول ومعدات الفعاليات الحصرية",
    headingEn: "Powered By E3 Rentals™",
    headingAr: "مدعوم بمنظومة إي ثري للتأجير والتجهيز™",
    summaryEn: "E3 Rentals is Qatar's advanced equipment, staging, AV rigging, inflatable asset, and rapid production logistics ecosystem.",
    summaryAr: "منظومة إي ثري لتأجير وتجهيز أحدث معدات الصوت والضوء والمسارح والأصول الترفيهية في قطر.",
    fullDescriptionEn: "Engineered for Qatar's high-stakes landmark activations, E3 Rentals delivers verified structural rigging, synchronized power grids, concert-grade acoustic line arrays, and rapid mobilization fleets.",
    fullDescriptionAr: "صُممت المنظومة خصيصاً للفعاليات الوطنية الكبرى لتقديم أعلى معايير الأمان الإنشائي وتجهيز المسارح والصوتيات والإضاءة بكفاءة عالية.",
    websiteUrl: "https://e3.qa",
    logoUrl: "",
    featureItems: [
      {
        id: "rent1",
        titleEn: "Rapid Asset & Fleet Deployment",
        titleAr: "تجهيز وتوريد الأصول والأسطول",
        descriptionEn: "24/7 rapid mobilization fleet with live GPS and automated inventory allocation.",
        descriptionAr: "أسطول توريد ونشر سريع على مدار الساعة مع تتبع GPS وتخصيص آلي للمخزون.",
        architectureLabelEn: "E3 RENTALS™ FLEET LOGISTICS",
        architectureLabelAr: "لوجستيات أسطول إي ثري للتأجير",
        icon: "Truck",
        imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
        detailedTextEn: "E3 Rentals operates a centralized logistics hub in Doha with a dedicated transport fleet, digital inventory allocation, and 24/7 on-call dispatch protocols. Every staging, seating, and inflatable asset is tracked end-to-end to ensure zero delay on-site.",
        detailedTextAr: "تدير منظومة إي ثري مركزاً لوجستياً متطوراً في الدوحة مع أسطول نقل مخصص ونظام تتبع رقمي فوري يضمن وصول وتركيب كافة المعدات والمسارح في الوقت المحدد.",
        specs: [
          { keyEn: "FLEET TELEMETRY", keyAr: "تتبع الأسطول والأصول", valueEn: "Real-Time RFID & GPS Asset Tracking", valueAr: "تتبع رقمي دقيق لكافة الأصول والمعدات" },
          { keyEn: "DISPATCH TIMELINE", keyAr: "سرعة التجهيز والتوريد", valueEn: "24-Hour Rapid Staging & Mobilization Protocol", valueAr: "جاهزية تشغيلية وتوريد سريع خلال ٢٤ ساعة" },
          { keyEn: "MAINTENANCE AUDIT", keyAr: "فحص الجودة والسلامة", valueEn: "ISO-Certified Cycle Inspection & Load Testing", valueAr: "فحص دوري معتمد واختبارات للأحمال والتحمل" },
          { keyEn: "WAREHOUSE INVENTORY", keyAr: "إدارة المخزون الفوري", valueEn: "Real-Time Centralized ERP Cloud Sync", valueAr: "مزامنة سحابية مباشرة لحالة وتوفر الأصول" }
        ],
        enabled: true,
        sortOrder: 1
      },
      {
        id: "rent2",
        titleEn: "Concert Audio, Lighting & FX",
        titleAr: "أنظمة الصوت والإضاءة والمؤثرات",
        descriptionEn: "Concert-grade line arrays, moving heads, and weather-sealed IP65 luminaires.",
        descriptionAr: "أنظمة صوتية متطورة للحفلات الكبرى وإضاءة تفاعلية مقاومة للعوامل الجوية.",
        architectureLabelEn: "E3 RENTALS™ ACOUSTIC & LIGHTING TECH",
        architectureLabelAr: "تكنولوجيا الصوت والإضاءة الاحترافية",
        icon: "Volume2",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        detailedTextEn: "From high-SPL outdoor festival line arrays to dynamic kinetic winches and stadium-grade beam luminaires, E3 Rentals delivers end-to-end AV infrastructure with multi-protocol DMX, Art-Net, and Dante network integration.",
        detailedTextAr: "توفر إي ثري أحدث أنظمة الصوت المحيطية والإضاءة المتحركة وشاشات LED العملاقة مع شبكات تحكم متزامنة تلبي متطلبات أضخم المهرجانات والحفلات العالمية.",
        specs: [
          { keyEn: "ACOUSTIC COVERAGE", keyAr: "التغطية الصوتية", valueEn: "110dB+ Uniform SPL Stadium Arrays", valueAr: "توزيع صوتي متجانس ومثالي للساحات الكبرى" },
          { keyEn: "LIGHTING PROTOCOLS", keyAr: "بروتوكولات التحكم", valueEn: "GrandMA3 / Art-Net / sACN Dual Redundancy", valueAr: "تحكم رقمي مزدوج يمنع أي انقطاع في العرض" },
          { keyEn: "WEATHER RESISTANCE", keyAr: "مقاومة العوامل الجوية", valueEn: "IP65 Desert & Humidity Shielded Fixtures", valueAr: "حماية متكاملة ضد درجات الحرارة والرطوبة والغبار" },
          { keyEn: "SPECIAL EFFECTS", keyAr: "المؤثرات الخاصة", valueEn: "Cold Spark, Cryo Jets & Laser Array Sync", valueAr: "شرر بارد وأعمدة كربونات وليزر متزامن آمن" }
        ],
        enabled: true,
        sortOrder: 2
      },
      {
        id: "rent3",
        titleEn: "Structural Rigging & Load Safety",
        titleAr: "هندسة التعليق والسلامة الإنشائية",
        descriptionEn: "Engineered aluminum trussing, certified chain hoists, and real-time wind telemetry.",
        descriptionAr: "هياكل مسارح ألمنيوم ومحركات تعليق معتمدة ومراقبة لحظية لسرعة الرياح.",
        architectureLabelEn: "E3 RENTALS™ STRUCTURAL RIGGING",
        architectureLabelAr: "منظومة الأمان الإنشائي والتعليق",
        icon: "ShieldAlert",
        imageUrl: "https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=1200&q=80",
        detailedTextEn: "Safety is non-negotiable. Every roof grid, ground support system, and kinetic suspension structure is engineered with computerized finite element analysis and monitored by real-time load-cell sensors and wind anemometers.",
        detailedTextAr: "السلامة هي أساس كل مشروع. تخضع كافة هياكل المسارح وأنظمة التعليق لحسابات هندسية دقيقة مع مجسات قياس الوزن وسرعة الرياح لضمان أقصى درجات الأمان.",
        specs: [
          { keyEn: "RIGGING & LOAD SAFETY", keyAr: "أمان التحميل والتعليق", valueEn: "Automated Structural Load & Wind Simulation", valueAr: "محاكاة رقمية للأحمال الإنشائية وسرعة الرياح" },
          { keyEn: "REGULATORY COMPLIANCE", keyAr: "الاعتمادات والتراخيص", valueEn: "TÜV Rheinland & Qatar Civil Defense Certified", valueAr: "شهادات اعتماد من TÜV والدفاع المدني القطري" },
          { keyEn: "HOIST REDUNDANCY", keyAr: "محركات الرفع الذكية", valueEn: "Variable Speed D8+ Motorized Hoists", valueAr: "محركات رفع ذكية فائقة الأمان بمعايير D8+" },
          { keyEn: "LOAD CELL TELEMETRY", keyAr: "مراقبة الأوزان اللحظية", valueEn: "Wireless Continuous Tension & Weight Telemetry", valueAr: "مراقبة لاسلكية مستمرة لتوزيع الأوزان على الهيكل" }
        ],
        enabled: true,
        sortOrder: 3
      },
      {
        id: "rent4",
        titleEn: "Synchronized Power & Grid Distribution",
        titleAr: "شبكات الطاقة والتوزيع المتزامن",
        descriptionEn: "Twin-pack silenced generators with automatic failover and power telemetry.",
        descriptionAr: "مولدات طاقة صامتة مزدوجة مع تحويل تلقائي لحظي عند الطوارئ.",
        architectureLabelEn: "E3 RENTALS™ POWER GRIDS",
        architectureLabelAr: "شبكات الطاقة وتوزيع الأحمال",
        icon: "Zap",
        imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
        detailedTextEn: "Continuous, uninterrupted power for high-intensity activations. E3 Rentals deploys twin-pack synchronized diesel generators with automatic transfer switches (ATS) and real-time load telemetry to prevent voltage drops or blackouts.",
        detailedTextAr: "توفير طاقة كهربائية مستمرة ومستقرة بدون انقطاع عبر مولدات متزامنة مزدوجة وأنظمة تحويل تلقائي فورية تضمن عمل كافة التجهيزات الحساسة بكفاءة تامة.",
        specs: [
          { keyEn: "POWER REDUNDANCY", keyAr: "استمرارية الطاقة", valueEn: "Dual-Grid Synchronized Distribution Telemetry", valueAr: "توزيع طاقة مزدوج متزامن يمنع انقطاع التيار" },
          { keyEn: "AUTOMATIC FAILOVER", keyAr: "التحويل التلقائي", valueEn: "Sub-Cycle ATS Seamless Switchover", valueAr: "تحويل فوري بدون انقطاع للتيار (Sub-Cycle ATS)" },
          { keyEn: "ACOUSTIC DAMPING", keyAr: "العزل الصوتي للمولدات", valueEn: "Super-Silenced Enclosures (<65dB @ 7m)", valueAr: "كواتم صوت فائقة الكفاءة لا تؤثر على الفعالية" },
          { keyEn: "TELEMETRY MONITORING", keyAr: "مراقبة التردد والجهد", valueEn: "Real-Time Phase Balance & Voltage Alerting", valueAr: "مراقبة لحظية للجهد الكهربائي والتوازن بين الأطوار" }
        ],
        enabled: true,
        sortOrder: 4
      }
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

export const DEFAULT_B2B_HOME_CONTENT = {
  hero: {
    titleEn: "Ideas to Life",
    titleAr: "تحويل الأفكار إلى واقع",
    subtitleEn: "We design, build, operate, and scale immersive entertainment experiences across Qatar.",
    subtitleAr: "نحن نصمم ونبني ونشغل ونوسع تجارب الترفيه الغامرة في جميع أنحاء قطر.",
    descriptionEn: "From creative concepts to crowd flow, fabrication, ticketing, staffing, and live operations.",
    descriptionAr: "من المفاهيم الإبداعية إلى تدفق الجماهير والتصنيع وإصدار التذاكر والتوظيف والعمليات المباشرة.",
    primaryCtaEn: "Explore Services",
    primaryCtaAr: "استكشف الخدمات",
    primaryLink: "/b2b/services",
    secondaryCtaEn: "Start a Project",
    secondaryCtaAr: "ابدأ مشروعاً",
    secondaryLink: "/b2b/contact",
    mediaType: "IMAGE",
    mediaUrl: ""
  },
  stats: [
    { value: '50+', labelEn: 'Years Combined Experience', labelAr: 'سنوات من الخبرة المشتركة' },
    { value: '9+', labelEn: 'Core Specializations', labelAr: 'التخصصات الأساسية' },
    { value: '100%', labelEn: 'Qatari Owned', labelAr: 'ملكية قطرية 100%' },
    { value: '3+', labelEn: 'Regional Markets', labelAr: 'أسواق إقليمية' }
  ],
  wowAndHow: {
    titleEn: "The WOW & The HOW",
    titleAr: "الإبهار والتنفيذ الاحترافي",
    descriptionEn: "Creative ideas need operational engineering. We don't just design experiences—we build, staff, operate, and monitor them.",
    descriptionAr: "الأفكار الإبداعية تتطلب هندسة تشغيلية. نحن لا نصمم التجارب فحسب — بل نبنيها ونوظف طواقمها ونشغلها ونراقبها.",
    wowBulletsEn: ['Creative concepts', 'Immersive entertainment', 'Themed environments', 'Storytelling'],
    wowBulletsAr: ['المفاهيم الإبداعية', 'الترفيه الغامر', 'البيئات المنسقة', 'سرد القصص'],
    howBulletsEn: ['Feasibility & Safety', 'Fabrication & Staging', 'Crowd flow & Staffing', 'Live Operations & Ticketing'],
    howBulletsAr: ['جدوى وسلامة المشاريع', 'التصنيع والإخراج المنصي', 'تدفق الجماهير والتوظيف', 'العمليات المباشرة والتذاكر']
  },
  capabilities: {
    titleEn: "Core Capabilities",
    titleAr: "القدرات الأساسية",
    descriptionEn: "Everything required to deliver landmark experiences.",
    descriptionAr: "كل ما يلزم لتقديم تجارب ترفيهية وإخراج مسرحي استثنائي.",
    ctaEn: "View All Services",
    ctaAr: "عرض جميع الخدمات"
  },
  caseStudies: {
    titleEn: "Featured Work",
    titleAr: "أعمالنا المميزة",
    descriptionEn: "Landmark projects delivered across the region.",
    descriptionAr: "مشاريع استثنائية تم تسليمها في جميع أنحاء المنطقة.",
    ctaEn: "View All Case Studies",
    ctaAr: "عرض جميع دراسات الحالة"
  },
  blueprintDepth: {
    enabled: true,
    eyebrowEn: "SPATIAL ARCHITECTURE & DEPTH",
    eyebrowAr: "الهندسة المعمارية التفاعلية",
    titleEn: "From Blueprint to Landmark Reality",
    titleAr: "من المخطط الهندسي إلى الواقع الحي",
    descriptionEn: "Explore how rigorous structural engineering, spatial telemetry, and crowd logistics transform into world-class entertainment destinations.",
    descriptionAr: "شاهد كيف تتحول الحسابات الإنشائية ومخططات تدفق الجماهير ثلاثية الأبعاد إلى تجارب ترفيهية متكاملة تنبض بالحياة.",
    cadTabLabelEn: "01. CAD Blueprint",
    cadTabLabelAr: "01. المخطط الهيكلي",
    splitTabLabelEn: "02. Interactive Split",
    splitTabLabelAr: "02. المقارنة التفاعلية",
    liveTabLabelEn: "03. Live Experience",
    liveTabLabelAr: "03. الإنتاج الواقعي",
    schematicTitleEn: "E3 SPATIAL SCHEMATIC // QATAR",
    schematicTitleAr: "المخطط المكاني لإي ثري // قطر",
    schematicSpec1En: "TOLERANCE: ±0.5mm | LOAD: 4.8 kN/m²",
    schematicSpec1Ar: "نسبة التسامح: ±0.5 مم | الحمل: 4.8 كيلو نيوتن/م²",
    schematicSpec2En: "CROWD CAPACITY: 12,500 PAX/HR",
    schematicSpec2Ar: "السعة الاستيعابية: 12,500 زائر/ساعة",
    systemId: "SYSTEM ID: E3-B2B-ENG-2026",
    liveBadgeTextEn: "LIVE COMMISSIONED VENUE",
    liveBadgeTextAr: "الإنتاج المباشر — جاهز للتشغيل",
    liveImageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80",
    features: [
      {
        icon: "Compass",
        titleEn: "Structural Precision",
        titleAr: "دقة التصميم الإنشائي",
        descEn: "Full engineering blueprints certified for municipal and crowd safety compliance.",
        descAr: "مخططات هندسية متكاملة تتوافق مع أعلى معايير السلامة القطرية."
      },
      {
        icon: "Layers",
        titleEn: "Acoustic & Lighting Staging",
        titleAr: "محاكاة الإضاءة والصوت",
        descEn: "Advanced ray-traced spatial audio and DMX lighting simulations.",
        descAr: "محاكاة بصرية وصوتية متقدمة تضمن تجربة استثنائية في كل نقطة."
      },
      {
        icon: "ShieldCheck",
        titleEn: "Turnkey Commissioning",
        titleAr: "تسليم تشغيلي متكامل",
        descEn: "Zero-gap handover with live crowd telemetry, staff operations, and ticketing.",
        descAr: "من الفكرة إلى حفل الافتتاح وإدارة العمليات اليومية وإصدار التذاكر."
      }
    ]
  },
  deliveryProcess: {
    titleEn: "Delivery Process",
    titleAr: "منظومة مرحلية للتسليم التشغيلي",
    steps: [
      { stepNumber: "01", nameEn: "Discover", nameAr: "اكتشاف", descEn: "Strategic feasibility, concept development & risk audit", descAr: "دراسات الجدوى الاستراتيجية، تطوير المفاهيم وتدقيق المخاطر" },
      { stepNumber: "02", nameEn: "Design", nameAr: "تصميم", descEn: "3D spatial masterplanning, kinetic AV & architectural blueprints", descAr: "التخطيط الفضائي ثلاثي الأبعاد والخرائط المعمارية الهندسية" },
      { stepNumber: "03", nameEn: "Build", nameAr: "بناء", descEn: "Turnkey fabrication, stage rigging & safety certification", descAr: "التصنيع الشامل، التركيبات المنصية واعتمادات السلامة" },
      { stepNumber: "04", nameEn: "Operate", nameAr: "تشغيل", descEn: "Live crowd control, staffing, ticketing & real-time telemetry", descAr: "إدارة الحشود الحية، التوظيف، التذاكر والتحليلات المباشرة" },
      { stepNumber: "05", nameEn: "Report", nameAr: "تقرير", descEn: "Post-event reconciliation, ROI analysis & continuous scaling", descAr: "تقارير ما بعد الفعالية، تحليل العائد على الاستثمار والتطوير" }
    ]
  },
  partnerRibbon: {
    titleEn: "Trusted by Industry Leaders",
    titleAr: "شركاء النجاح"
  },
  featuredServiceIds: [],
  featuredCaseStudyIds: []
};

export const DEFAULT_B2B_SERVICES_CONTENT = {
  hero: {
    enabled: true,
    eyebrowEn: "E3 ENTERPRISE CAPABILITIES",
    eyebrowAr: "قدرات إي ثري لقطاع الأعمال",
    titleEn: "Services That Build Living Experience Landmarks.",
    titleAr: "كل ما تحتاجه لبناء تجارب استثنائية",
    subtitleEn: "From feasibility, strategy and spatial design to fabrication, ticketing, technical production and live operations, E3 brings every layer of the experience together.",
    subtitleAr: "من الجدوى والتخطيط الاستراتيجي والتصميم الفضائي إلى التصنيع والتذاكر والإنتاج الحي والعمليات التشغيلية.",
    descriptionEn: "We don't outsource the hard parts. E3 retains in-house expertise across creative, engineering, fabrication, and operations to ensure flawless delivery.",
    descriptionAr: "نحن لا نستعين بمصادر خارجية للأجزاء الصعبة. نحتفظ بالخبرات الداخلية لتصميم وتنفيذ وتشغيل المشاريع الكبرى.",
    mediaType: "IMAGE",
    mediaUrl: "",
    mobileMediaUrl: "",
    overlayStrength: 70,
    primaryCtaEn: "Explore Capabilities",
    primaryCtaAr: "استكشف القدرات",
    primaryLink: "#capability-navigator",
    secondaryCtaEn: "Start a Project",
    secondaryCtaAr: "ابدأ مشروعاً",
    secondaryLink: "/b2b/contact"
  },
  capabilityCount: {
    enabled: true,
    templateEn: "{{count}} Specialised Capabilities. One Integrated Partner.",
    templateAr: "{{count}} قدرات تخصصية متكاملة. شريك واحد."
  },
  philosophy: {
    enabled: true,
    eyebrowEn: "OUR PHILOSOPHY",
    eyebrowAr: "فلسفة التنفيذ",
    titleEn: "Creative Ideas Need Operational Engineering.",
    titleAr: "الأفكار الإبداعية تتطلب هندسة تشغيلية",
    subtitleEn: "We don't just sketch concepts—we masterplan, fabricate, staff, operate, and continuously monitor physical assets.",
    subtitleAr: "نحن لا نصمم التجارب فحسب — بل نخططها ونبنيها ونوظف طواقمها ونشغلها ونضمن أعلى مستويات السلامة.",
    creativeTitleEn: "Creative Vision",
    creativeTitleAr: "التصميم وسرد القصص",
    creativeSubEn: "CREATIVE CONCEPTUALIZATION",
    creativeSubAr: "الابتكار الإبداعي",
    creativeBullets: [
      { id: "c1", textEn: "Immersive Masterplanning", textAr: "المفاهيم الفضائية المبتكرة" },
      { id: "c2", textEn: "Spatial Concept Design", textAr: "الهوية المرئية الغامرة" },
      { id: "c3", textEn: "Entertainment Storytelling", textAr: "سرد القصص الترفيهية" },
      { id: "c4", textEn: "Kinetic Environment Architecture", textAr: "التجارب التفاعلية" }
    ],
    engineeringTitleEn: "Operational Engineering",
    engineeringTitleAr: "التصنيع والعمليات",
    engineeringSubEn: "OPERATIONAL STAGING",
    engineeringSubAr: "الهندسة والتشغيل",
    engineeringBullets: [
      { id: "e1", textEn: "Structural Safety & Feasibility", textAr: "دراسات الجدوى والسلامة" },
      { id: "e2", textEn: "Turnkey Fabrication & Rigging", textAr: "التصنيع والإخراج المنصي" },
      { id: "e3", textEn: "Kinetic AV & Systems Integration", textAr: "التأجير والأنظمة الصوتية والضوئية" },
      { id: "e4", textEn: "Crowd Analytics & Live Operations", textAr: "إدارة الحشود والعمليات المباشرة" }
    ]
  },
  navigator: {
    enabled: true,
    eyebrowEn: "CAPABILITY NAVIGATOR",
    eyebrowAr: "استكشف كافة الخدمات",
    titleEn: "Specialised Capabilities",
    titleAr: "دليل القدرات التخصصية",
    descriptionEn: "Explore turnkey event engineering, kinetic AV, spatial fabrication, and live crowd management.",
    descriptionAr: "تصفح كافة حلول الإنتاج والتشغيل المصممة للمشاريع الكبرى في قطر والمنطقة.",
    sourceMode: "ALL",
    selectedServiceIds: [],
    manualOrdering: [],
    cardCtaEn: "Explore Capability",
    cardCtaAr: "عرض التفاصيل والخدمات",
    viewAllCtaEn: "View All Services",
    viewAllCtaAr: "عرض كافة الخدمات",
    viewAllLink: "/b2b/services"
  },
  featuredSpotlights: {
    enabled: true,
    eyebrowEn: "FEATURED SPOTLIGHTS",
    eyebrowAr: "القدرات المميزة",
    titleEn: "Landmark Discipline Spotlights",
    titleAr: "تخصصات الاستجابة الفورية",
    descriptionEn: "Deep dives into E3 flagship operational disciplines.",
    descriptionAr: "استعراض تفصيلي لأبرز تخصصات إي ثري التشغيلية.",
    selectionMode: "FEATURED_FLAG",
    selectedServiceIds: [],
    spotlightCtaEn: "View Service Scope",
    spotlightCtaAr: "عرض تفاصيل الخدمة",
    requestCtaEn: "Request This Discipline",
    requestCtaAr: "اطلب هذا التخصص"
  },
  deliveryMethodology: {
    enabled: true,
    eyebrowEn: "DELIVERY PIPELINE",
    eyebrowAr: "منهجية التنفيذ",
    titleEn: "End-to-End Delivery Methodology",
    titleAr: "خطوات التسليم التنفيذي",
    descriptionEn: "Our 5-stage framework ensuring safety, precision, and operational excellence.",
    descriptionAr: "إطار عملنا المكون من 5 مراحل لضمان السلامة والدقة والتميز التشغيلي.",
    steps: [
      { id: "s1", stepNumber: "01", nameEn: "Discover & Define", nameAr: "اكتشاف وتحديد", descEn: "Strategic feasibility, safety compliance audit & commercial objective mapping", descAr: "دراسات الجدوى الاستراتيجية وتحديد متطلبات السلامة والأهداف التجارية" },
      { id: "s2", stepNumber: "02", nameEn: "Research & Design", nameAr: "بحث وتصميم", descEn: "3D spatial masterplanning, kinetic AV integration & architectural blueprints", descAr: "التخطيط الفضائي ثلاثي الأبعاد والخرائط المعمارية وأنظمة الإضاءة والصوت" },
      { id: "s3", stepNumber: "03", nameEn: "Engineer & Plan", nameAr: "هندسة وتخطيط", descEn: "Load calculations, structural engineering & regulatory safety certification", descAr: "حسابات الأحمال، التراخيص الحكومية واعتمادات الهياكل القابلة للنفخ والتركيب" },
      { id: "s4", stepNumber: "04", nameEn: "Build & Activate", nameAr: "بناء وتفعيل", descEn: "Turnkey fabrication, stage rigging, gate turnstiles & system commissioning", descAr: "التصنيع الشامل، التركيبات المنصية، واختبار الأنظمة الذكية للتذاكر والبوابات" },
      { id: "s5", stepNumber: "05", nameEn: "Operate & Optimize", nameAr: "تشغيل وتحسين", descEn: "Live crowd flow, staffing, real-time ticketing telemetry & post-event scaling", descAr: "التوظيف المباشر، إدارة تدفق الزوار، والتحليلات الفورية لتحسين العائد" }
    ]
  },
  caseStudies: {
    enabled: true,
    eyebrowEn: "VERIFIED PROOF",
    eyebrowAr: "نتائج تنفيذية موثقة",
    titleEn: "Delivered Case Studies",
    titleAr: "مشاريع ودراسات حالة حية",
    descriptionEn: "Real case studies demonstrating E3 execution capabilities.",
    descriptionAr: "دراسات حالة حقيقية تم تسليمها في جميع أنحاء المنطقة.",
    selectionMode: "LATEST",
    selectedCaseStudyIds: [],
    maxItems: 3,
    viewAllCtaEn: "View All Case Studies",
    viewAllCtaAr: "عرض جميع المشاريع",
    viewAllLink: "/b2b/cases"
  },
  partnerRibbon: {
    enabled: true,
    titleEn: "Trusted by Industry Leaders",
    titleAr: "شركاء النجاح"
  },
  cta: {
    enabled: true,
    eyebrowEn: "COMMERCIAL PROPOSALS",
    eyebrowAr: "تقديم طلبات المشاريع",
    titleEn: "Ready to Bring Your Experience to Life?",
    titleAr: "مستعد لبناء تجربتك القادمة؟",
    descriptionEn: "Tell us what you are planning. We will assemble the right combination of strategy, creativity, technology, production and operations.",
    descriptionAr: "تواصل مع فريق الأعمال لتحديد الحزمة المناسبة لمشروعك.",
    mediaType: "IMAGE",
    mediaUrl: "",
    primaryCtaEn: "Request a Proposal",
    primaryCtaAr: "طلب عرض سعر (RFP)",
    primaryLink: "/b2b/contact"
  },
  seo: {
    metaTitleEn: "Services & Capabilities — E3 Enterprise Atelier",
    metaTitleAr: "الخدمات والقدرات — إي ثري لقطاع الأعمال",
    metaDescriptionEn: "Turnkey spatial design, event engineering, kinetic AV, live production, and landmark attraction operations in Qatar.",
    metaDescriptionAr: "خدمات التصميم الفضائي، هندسة الفعاليات، الأنظمة الصوتية والضوئية، والإنتاج الحي في قطر.",
    ogTitleEn: "Services & Capabilities — E3 Enterprise Atelier",
    ogTitleAr: "الخدمات والقدرات — إي ثري لقطاع الأعمال",
    ogDescriptionEn: "Turnkey spatial design, event engineering, kinetic AV, live production, and landmark attraction operations in Qatar.",
    ogDescriptionAr: "خدمات التصميم الفضائي، هندسة الفعاليات، الأنظمة الصوتية والضوئية، والإنتاج الحي في قطر.",
    ogImage: "",
    canonicalUrl: "https://e3.qa/b2b/services"
  }
};

export const DEFAULT_B2B_CASES_CONTENT = {
  hero: {
    enabled: true,
    eyebrowEn: "The Vault",
    eyebrowAr: "سجل الإنجازات",
    titleEn: "Ideas Are Powerful. Results Make Them Real.",
    titleAr: "الأفكار تصنع الإمكانات. والنتائج تثبتها.",
    subtitleEn: "Explore the experiences, destinations and landmark events E3 has transformed from ambitious ideas into measurable impact.",
    subtitleAr: "اكتشف التجارب والوجهات والفعاليات الاستثنائية التي حولتها إي ثري من أفكار طموحة إلى إنجازات ذات أثر ملموس.",
    descriptionEn: "Masterplanned zones, kinetic staging, and turnkey live operations delivered across Qatar.",
    descriptionAr: "هندسة فضائية متكاملة وإدارة حشود وتجهيز منصات لأبرز المشاريع الترفيهية.",
    mediaType: "IMAGE",
    mediaUrl: "",
    mobileMediaUrl: "",
    posterImage: "",
    overlayStrength: 70,
    primaryCtaEn: "Explore Our Work",
    primaryCtaAr: "استكشف أعمالنا",
    primaryLink: "#archive",
    secondaryCtaEn: "Start a Project",
    secondaryCtaAr: "ابدأ مشروعك",
    secondaryLink: "/b2b/contact"
  },
  showreel: {
    enabled: true,
    eyebrowEn: "CINEMATIC SHOWCASE",
    eyebrowAr: "عرض مرئي استثنائي",
    titleEn: "A Glimpse Inside the Experiences We Build",
    titleAr: "نظرة إلى التجارب التي نصنعها",
    descriptionEn: "High-definition highlight reel of E3 mega builds, kinetic AV stages, and landmark operations across Qatar.",
    descriptionAr: "لقطات عالية الدقة لأبرز مشاريع إي ثري، منصات الإضاءة والصوت الحركية، والعمليات التشغيلية المباشرة.",
    mediaType: "YOUTUBE",
    mediaUrl: "",
    posterImage: "",
    autoplay: true,
    muted: true,
    primaryCtaEn: "Watch Full Showreel",
    primaryCtaAr: "شاهد العرض الكامل",
    primaryLink: "/b2b/contact"
  },
  factStream: {
    enabled: true,
    labelEn: "Did You Know?",
    labelAr: "هل تعلم؟",
    titleEn: "Every Project Leaves a Bigger Story Behind.",
    titleAr: "وراء كل مشروع قصة أكبر من الأرقام.",
    descriptionEn: "Live performance telemetry and spatial engineering metrics derived from published projects.",
    descriptionAr: "مؤشرات حية وتغطية استثنائية لأبرز المشاريع.",
    maxFacts: 5,
    rotationDuration: 5,
    showProjectTitle: true,
    showProjectMedia: true,
    displayOrder: "FEATURED_FIRST",
    selectedCaseStudyIds: []
  },
  featuredCases: {
    enabled: true,
    eyebrowEn: "FEATURED LANDMARKS",
    eyebrowAr: "المشاريع الرئيسية",
    titleEn: "Landmark Experience Spotlights",
    titleAr: "إنجازات رئيسية ذات أثر ملموس",
    descriptionEn: "In-depth case studies demonstrating E3 turnkey execution capacity.",
    descriptionAr: "استعراض تفصيلي لأبرز المشاريع الوطنية والتجارب الترفيهية.",
    selectionMode: "FEATURED_FLAG",
    selectedCaseStudyIds: [],
    maxItems: 3,
    cardCtaEn: "Read Case Study",
    cardCtaAr: "عرض تفاصيل المشروع",
    viewAllCtaEn: "Explore All Work",
    viewAllCtaAr: "استكشف كافة الأعمال",
    viewAllLink: "#archive"
  },
  archive: {
    enabled: true,
    titleEn: "Explore the Work",
    titleAr: "استكشف أعمالنا",
    descriptionEn: "Filter by category, year, client, or service discipline.",
    descriptionAr: "تصفح حسب الفئة، السنة، العميل، أو التخصص التشغيلي."
  },
  teamStories: {
    enabled: true,
    eyebrowEn: "Behind the Build",
    eyebrowAr: "خلف الكواليس",
    titleEn: "The Stories You Don’t See on Stage.",
    titleAr: "قصص لا يراها الجمهور على المسرح.",
    descriptionEn: "Meet the people, decisions and defining moments behind E3’s landmark experiences.",
    descriptionAr: "تعرّف على الأشخاص والقرارات واللحظات التي تقف خلف أبرز تجارب إي ثري.",
    selectionMode: "FEATURED",
    stories: []
  },
  timeline: {
    enabled: true,
    titleEn: "Timeline of Milestones",
    titleAr: "محطات الإنجاز والتطور",
    descriptionEn: "Chronological milestone journey across Qatar landmark projects.",
    descriptionAr: "مسار زمني حافل بالإنجازات في مختلف مناطق قطر."
  },
  transformations: {
    enabled: true,
    titleEn: "Before & After Transformations",
    titleAr: "التحول الفضائي قبل وبعد التنفيذ",
    items: [
      {
        id: "trans-lego-world",
        beforeUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC04842.jpg",
        afterUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/9927c4f3-ac81-4cc9-9e6b-8e944102cf38.jpg",
        titleEn: "LEGO® Shows Qatar",
        titleAr: "عروض ليغو قطر",
        beforeLabelEn: "Empty Exhibition Halls",
        beforeLabelAr: "قاعات المعرض قبل التنفيذ",
        afterLabelEn: "An Immersive LEGO® World",
        afterLabelAr: "عالم LEGO® غامر",
        captionEn: "Transformation from bare exhibition halls to dynamic brick-built universe with 4M+ bricks",
        captionAr: "التحول من قاعات فارغة إلى فضاء ترفيهي وتفاعلي متكامل يضم أكثر من 4 ملايين قطعة ليغو"
      },
      {
        id: "trans-balloon-parade",
        beforeUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/8.webp",
        afterUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DJI_0132.jpg",
        titleEn: "Doha Balloon Parade",
        titleAr: "مهرجان المنطاد بالدوحة",
        beforeLabelEn: "The Corniche Before Build",
        beforeLabelAr: "الكورنيش قبل التجهيز",
        afterLabelEn: "Qatar’s Landmark Parade",
        afterLabelAr: "استعراض جماهيري استثنائي في قطر",
        captionEn: "Transforming 2.5km of open coastline into a national festival parade route with live telemetry",
        captionAr: "تحويل 2.5 كم من الواجهة البحرية إلى مسار استعراضي وطني متكامل مع مراقبة حية للرياح"
      },
      {
        id: "trans-inflatapark",
        beforeUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/af64d2a7-af84-4e08-83c7-5d12791f094c.avif",
        afterUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DG8A5873.jpg",
        titleEn: "InflataPark Doha",
        titleAr: "إنفلاتا بارك الدوحة",
        beforeLabelEn: "30,000 sqm of Possibility",
        beforeLabelAr: "30,000 متر مربع من الإمكانات",
        afterLabelEn: "The World’s Largest Indoor Inflatable Event",
        afterLabelAr: "أكبر فعالية ألعاب هوائية داخلية في العالم",
        captionEn: "Fabrication & staging of world-record obstacle infrastructure and turnkey crowd control",
        captionAr: "تصنيع وتجهيز بنية تحتية عملاقة للألعاب الهوائية مع إدارة حشود تشغيلية متكاملة"
      }
    ]
  },
  impactOverview: {
    enabled: true,
    titleEn: "Impact You Can Measure",
    titleAr: "أثر يمكن قياسه بالأرقام",
    sourceMode: "CURATED",
    stats: [
      { prefix: "", value: "760,000+", suffix: "", labelEn: "Attendees at a Single Landmark Event", labelAr: "زائر في فعالية جماهيرية استثنائية واحدة" },
      { prefix: "", value: "30,000", suffix: " sqm", labelEn: "Large-Scale Indoor Event Footprint", labelAr: "مساحة فعالية داخلية واسعة النطاق" },
      { prefix: "", value: "23M+", suffix: "", labelEn: "Marketing Impressions for InflataCity", labelAr: "ظهور للحملة التسويقية لإنفلاتا سيتي" },
      { prefix: "", value: "1,055", suffix: " m", labelEn: "Guinness World Record Inflatable Course", labelAr: "مسار ألعاب هوائية حائز على رقم قياسي من غينيس" }
    ]
  },
  servicesSection: {
    enabled: true,
    titleEn: "Services Behind the Work",
    titleAr: "الخدمات والتخصصات المطبقة",
    descriptionEn: "Explore which E3 core disciplines powered these landmark projects.",
    descriptionAr: "تعرف على التخصصات التي ساهمت في إنجاز هذه المشاريع."
  },
  cta: {
    enabled: true,
    eyebrowEn: "Your Project Could Be Next",
    eyebrowAr: "قد يكون مشروعك هو القادم",
    headlineEn: "Let’s Create the Next Landmark Experience.",
    headlineAr: "لنصنع معاً التجربة الاستثنائية القادمة.",
    descriptionEn: "Collaborate with E3's turnkey masterplanning, fabrication, and live operations teams in Qatar.",
    descriptionAr: "تواصل مع فريق الهندسة والتصنيع والتشغيل في إي ثري لبناء وتفعيل تجربتك القادمة.",
    mediaType: "IMAGE",
    mediaUrl: "",
    primaryCtaEn: "Start a Project",
    primaryCtaAr: "ابدأ مشروعك",
    primaryLink: "/b2b/contact",
    secondaryCtaEn: "Download Company Profile",
    secondaryCtaAr: "حمّل الملف التعريفي",
    secondaryLink: "/b2b/contact"
  },
  seo: {
    metaTitleEn: "Case Studies & Landmark Projects — E3 Enterprise",
    metaTitleAr: "دراسات الحالة والمشاريع — إي ثري لقطاع الأعمال",
    metaDescriptionEn: "Explore our portfolio of mega events, immersive installations, and landmark entertainment destinations delivered across Qatar.",
    metaDescriptionAr: "استكشف قائمة الفعاليات الكبرى والوجهات الترفيهية والتجارب الغامرة المنفذة في قطر.",
    ogTitleEn: "Case Studies & Landmark Projects — E3 Enterprise",
    ogTitleAr: "دراسات الحالة والمشاريع — إي ثري لقطاع الأعمال",
    ogDescriptionEn: "Explore our portfolio of mega events, immersive installations, and landmark entertainment destinations delivered across Qatar.",
    ogDescriptionAr: "استكشف قائمة الفعاليات الكبرى والوجهات الترفيهية والتجارب الغامرة المنفذة في قطر.",
    ogImage: "",
    canonicalUrl: "https://e3.qa/b2b/cases"
  }
};

export const DEFAULT_B2C_PACKAGES_PAGE_CONTENT = {
  eyebrowEn: "E3 CELEBRATIONS & GROUP PACKAGES",
  eyebrowAr: "باقات الفعاليات والاحتفالات الاستثنائية",
  titleEn: "Big Moments Deserve Bigger Experiences",
  titleAr: "لحظاتكم الكبيرة تستحق تجارب استثنائية",
  fixedHeadlineEn: "BUILD A DAY FILLED WITH",
  fixedHeadlineAr: "اصنع يوماً مليئاً بـ",
  rotatingWordsEn: ["PLAY", "CELEBRATION", "DISCOVERY", "MEMORIES"],
  rotatingWordsAr: ["المرح", "الاحتفال", "الاكتشاف", "الذكريات"],
  preset: "day-builder",
  animationSpeed: 2800,
  enableRotatingWords: true,
  descEn: "Discover birthday celebrations, group adventures, school experiences and corporate packages across E3's entertainment destinations.",
  descAr: "اكتشفوا باقات أعياد الميلاد والمجموعات والمدارس والشركات في وجهات E3 الترفيهية.",
  primaryCtaEn: "Find Your Package",
  primaryCtaAr: "اختر باقتك",
  secondaryCtaEn: "Plan a Custom Event",
  secondaryCtaAr: "خطط لفعاليتك الخاصة",
  campaignBadgeEn: "VIP PACKAGES & EVENTS",
  campaignBadgeAr: "باقات كبار الشخصيات",
  heroMedia: {
    mediaType: "IMAGE",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC06321.jpg",
  },
  footerMedia: {
    mediaType: "VIDEO",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
  },
  seoTitle: "Packages & Birthdays | E3 Qatar",
  seoDescription: "Book custom birthday packages, VIP party rooms, and group events across Qatar with E3.",
};

export const DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT = {
  eyebrowEn: "ALL-ACCESS ENTERTAINMENT DIRECTORY",
  eyebrowAr: "دليل الوجهات والتجارب الترفيهية الشامل",
  fixedHeadlineEn: "STEP INTO A WORLD OF {{animated}}",
  fixedHeadlineAr: "ادخل إلى عالم من {{animated}}",
  headlineTemplateEn: "STEP INTO A WORLD OF {{animated}}",
  headlineTemplateAr: "ادخل إلى عالم من {{animated}}",
  titleEn: "STEP INTO A WORLD OF {{animated}}",
  titleAr: "ادخل إلى عالم من {{animated}}",
  rotatingWordsEn: ["PLAY", "WONDER", "ADVENTURE", "DISCOVERY"],
  rotatingWordsAr: ["اللعب", "الإبهار", "المغامرة", "الاكتشاف"],
  descriptionEn: "Search, filter, and book world-class entertainment attractions, indoor kinetic parks, and live character activations across Qatar.",
  descriptionAr: "استكشف واحجز أفضل تجارب الترفيه العائلي والمدن الحركية المغلقة والفعاليات الحية في قطر.",
  descEn: "Search, filter, and book world-class entertainment attractions, indoor kinetic parks, and live character activations across Qatar.",
  descAr: "استكشف واحجز أفضل تجارب الترفيه العائلي والمدن الحركية المغلقة والفعاليات الحية في قطر.",
  primaryCtaEn: "Explore Attractions",
  primaryCtaAr: "استكشف الوجهات",
  primaryCtaUrl: "#attractions-grid",
  secondaryCtaEn: "View Live Calendar",
  secondaryCtaAr: "عرض جدول الفعاليات",
  secondaryCtaUrl: "/{locale}/b2c/calendar",
  preset: "e3-universe",
  animationType: "blur-morph",
  wordStyle: "static-gradient",
  alignmentEn: "center",
  alignmentAr: "center",
  alignment: "center",
  animationSpeed: 2800,
  animationDuration: 600,
  enableRotatingWords: true,
  showFilters: true,
  showSearchBar: true,
  heroMedia: {
    mediaType: "VIDEO",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    posterUrl: ""
  },
  footerMedia: {
    mediaType: "IMAGE",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
  },
  seoTitle: "Experiences & Attractions | E3 Qatar",
  seoDescription: "Discover live events, family attractions, InflataPark, and tactical arenas."
};

export const DEFAULT_B2C_CALENDAR_PAGE_CONTENT = {
  eyebrowEn: "EVENTS & OCCURRENCES TIMELINE",
  eyebrowAr: "جدول الفعاليات والمواعيد الحية",
  fixedHeadlineEn: "YOUR NEXT MOMENT STARTS",
  fixedHeadlineAr: "لحظتك القادمة تبدأ",
  rotatingWordsEn: ["TODAY", "THIS WEEK", "THIS WEEKEND", "SOON"],
  rotatingWordsAr: ["اليوم", "هذا الأسبوع", "عطلة نهاية الأسبوع", "قريباً"],
  descriptionEn: "Browse upcoming events, family experiences, seasonal festivals, and exclusive activities across Qatar with real-time schedule checks.",
  descriptionAr: "استكشف الفعاليات القادمة والتجارب العائلية والمهرجانات الموسمية والأنشطة المميزة في قطر بمواعيد مؤكدة.",
  primaryCtaEn: "Browse Schedule",
  primaryCtaAr: "تصفح الجدول",
  primaryCtaUrl: "#calendar-schedule",
  secondaryCtaEn: "Book Group Pass",
  secondaryCtaAr: "حجز باقات المجموعات",
  secondaryCtaUrl: "/{locale}/b2c/packages",
  preset: "living-timeline",
  animationSpeed: 2800,
  enableRotatingWords: true,
  heroMedia: {
    mediaType: "IMAGE",
    mediaUrl: "",
    posterUrl: ""
  }
};

export const DEFAULT_B2B_CONTACT_CONTENT = {
  header: {
    titleEn: "Contact Us / Submit RFP",
    titleAr: "تواصل معنا / تقديم طلب عروض",
    subtitleEn: "Planning a major event, venue, or activation? Let us help you engineer a successful delivery plan.",
    subtitleAr: "هل لديك مشروع أو فعاليات كبرى تخطط لها؟ دعنا نساعدك في بناء خطة تنفيذ ناجحة.",
    mediaType: "IMAGE",
    mediaUrl: "",
    eyebrowEn: "DIRECT ENGAGEMENT & RFP INTAKE",
    eyebrowAr: "التواصل المباشر وتقديم طلبات العروض"
  },
  inquiries: {
    business: "info@eeeqa.com",
    careers: "info@eeeqa.com",
    press: "info@eeeqa.com",
    phone: "+974 3048 9955",
    whatsapp: "+974 3048 9955",
    workingHoursEn: "Sunday - Thursday: 8:00 AM - 5:00 PM AST",
    workingHoursAr: "الأحد - الخميس: 8:00 صباحاً - 5:00 مساءً بتوقيت الدوحة"
  },
  headquarters: {
    addressEn: "Doha, State of Qatar",
    addressAr: "الدوحة، دولة قطر",
    mapLink: "https://maps.google.com"
  },
  formConfig: {
    inquiryTypes: [
      { id: "rfp", value: "RFP Submission", labelEn: "RFP Submission", labelAr: "تقديم طلب عروض" },
      { id: "business", value: "General Business", labelEn: "General Business", labelAr: "أعمال عامة" },
      { id: "partnership", value: "Partnership", labelEn: "Partnership", labelAr: "شراكة" },
      { id: "other", value: "Other", labelEn: "Other", labelAr: "أخرى" }
    ],
    labels: {
      inquiryTypeEn: "Inquiry Type",
      inquiryTypeAr: "نوع الاستفسار",
      fullNameEn: "Full Name",
      fullNameAr: "الاسم الكامل",
      fullNamePlaceholderEn: "Jane Doe",
      fullNamePlaceholderAr: "فلان الفلاني",
      companyEn: "Company / Organization",
      companyAr: "الشركة / المنظمة",
      companyPlaceholderEn: "Organization Name",
      companyPlaceholderAr: "اسم المنظمة",
      emailEn: "Corporate Email Address",
      emailAr: "البريد الإلكتروني للعمل",
      emailPlaceholderEn: "name@company.com",
      emailPlaceholderAr: "name@company.com",
      phoneEn: "Phone / WhatsApp Number",
      phoneAr: "رقم الهاتف / الواتساب",
      phonePlaceholderEn: "+974 XXXX XXXX",
      phonePlaceholderAr: "+974 XXXX XXXX",
      messageEn: "Project Details or Scope Brief",
      messageAr: "تفاصيل المشروع أو نطاق العمل",
      messagePlaceholderEn: "Tell us about your requirements, timeline, and scale...",
      messagePlaceholderAr: "أخبرنا عن متطلباتك والجدول الزمني والنطاق...",
      uploadTitleEn: "RFP Document / Brief (Optional)",
      uploadTitleAr: "وثيقة طلب العروض / المرفقات (اختياري)",
      uploadHelpEn: "PDF, DOCX up to 25MB (Encrypted & Qatar PDPL Compliant)",
      uploadHelpAr: "ملفات PDF, DOCX حتى 25 ميجابايت (مشفرة ومتوافقة مع قانون حماية البيانات القطري)",
      privacyNoticeEn: "By submitting this form, you agree to our Privacy Policy and consent to us storing your data to process this inquiry.",
      privacyNoticeAr: "من خلال إرسال هذا النموذج، فإنك توافق على سياسة الخصوصية الخاصة بنا وتوافق على تخزين بياناتك لمعالجة هذا الاستفسار.",
      submitButtonEn: "Submit Inquiry / RFP",
      submitButtonAr: "إرسال الاستفسار / طلب العروض",
      submittingButtonEn: "Submitting Request...",
      submittingButtonAr: "جاري إرسال الطلب..."
    },
    successState: {
      titleEn: "Request Received",
      titleAr: "تم استلام الطلب بنجاح",
      messageEn: "Our executive enterprise team will review your inquiry and connect with you within 24 hours.",
      messageAr: "سيقوم فريقنا التنفيذي بمراجعة استفسارك والتواصل معك خلال 24 ساعة.",
      buttonEn: "Submit Another Inquiry",
      buttonAr: "إرسال استفسار آخر"
    }
  },
  careersCta: {
    enabled: true,
    titleEn: "Join Our Team",
    titleAr: "انضم لفريقنا",
    descriptionEn: "Discover new opportunities to build extraordinary entertainment and attraction experiences.",
    descriptionAr: "اكتشف فرصاً جديدة لبناء تجارب ترفيهية ووجهات جذب استثنائية.",
    ctaTextEn: "Explore Careers",
    ctaTextAr: "استكشف الوظائف",
    ctaLink: "/b2b/careers",
    mediaType: "IMAGE",
    mediaUrl: ""
  },
  feedbackCta: {
    enabled: true,
    titleEn: "Suggestions & Feedback",
    titleAr: "اقتراحات وملاحظات",
    descriptionEn: "Help us refine our operations and elevate visitor standards by sharing your thoughts.",
    descriptionAr: "ساعدنا في الارتقاء بمعايير التشغيل وتجارب الزوار من خلال مشاركة أفكارك.",
    ctaTextEn: "Share Feedback",
    ctaTextAr: "شارك الملاحظات",
    ctaLink: "/b2b/feedback",
    mediaType: "IMAGE",
    mediaUrl: ""
  },
  faqCta: {
    enabled: true,
    titleEn: "B2B FAQs",
    titleAr: "الأسئلة الشائعة",
    descriptionEn: "Find comprehensive answers to commonly asked questions about our engineering, procurement, and turnkey delivery.",
    descriptionAr: "ابحث عن إجابات وافية للأسئلة الشائعة حول خدماتنا وعملياتنا الهندسية والتوريد والإدارة المتكاملة.",
    ctaTextEn: "View FAQs",
    ctaTextAr: "عرض الأسئلة",
    ctaLink: "/b2b/faqs",
    mediaType: "IMAGE",
    mediaUrl: ""
  },
  seo: {
    metaTitleEn: "Contact & RFP Intake | E3 Qatar B2B",
    metaTitleAr: "تواصل معنا وتقديم طلب العروض | إي ثري قطر",
    metaDescriptionEn: "Partner with E3 Qatar for world-class entertainment engineering, live activations, and turnkey attractions.",
    metaDescriptionAr: "تواصل مع إي ثري قطر لتنفيذ المشاريع الترفيهية الكبرى والفعاليات الحية والوجهات السياحية في قطر.",
    keywordsEn: "E3 contact, RFP submission, entertainment procurement Qatar, event production Doha",
    keywordsAr: "تواصل مع إي ثري, طلب عروض, فعاليات قطر, ترفيه الدوحة"
  }
};

export const DEFAULT_B2B_ABOUT_CONTENT = {
  header: {
    eyebrowEn: "WHO WE ARE & OUR HERITAGE",
    eyebrowAr: "من نحن وإرثنا الريادي",
    titleEn: "We Are E3.",
    titleAr: "نحن إي ثري.",
    subtitleEn: "Event Engineering & Destination Experts. We turn ambitious creative visions into flawless operational reality across Qatar and the region.",
    subtitleAr: "خبراء هندسة الفعاليات وتطوير الوجهات. نحول الرؤى الإبداعية الطموحة إلى واقع تشغيلي استثنائي في قطر والمنطقة.",
    mediaType: "IMAGE",
    mediaUrl: "",
    fallbackImageUrl: ""
  },
  story: {
    eyebrowEn: "OUR STORY & JOURNEY",
    eyebrowAr: "مسيرتنا وقصة التأسيس",
    titleEn: "Engineering Landmark Experiences",
    titleAr: "هندسة تجارب رائدة لا تُنسى",
    contentEn: "E3 was founded in Doha with a clear purpose: the region's rapidly expanding entertainment and events ecosystem required an engineering-grade partner capable of executing mega-scale concepts with flawless operational rigor.\n\nOver the past decade, we have evolved from a specialized staging and structural powerhouse into an end-to-end turnkey experiential enterprise—delivering immersive technology, world-class family attractions, kinetic arenas, and major public parades.\n\nToday, we operate with a dedicated team of over 120 cross-functional specialists, state-of-the-art staging assets, and certified safety protocols powering Qatar's most memorable landmark moments.",
    contentAr: "تأسست إي ثري في الدوحة برؤية واضحة: قطاع الترفيه والفعاليات المتنامي في المنطقة بحاجة إلى شريك هندسي متكامل يجمع بين الطموح الإبداعي للفعاليات الضخمة والدقة التشغيلية الصارمة.\n\nعلى مدار العقد الماضي، تطورنا من شركة متخصصة في تنفيذ الهياكل والمسارح إلى منظومة شاملة لهندسة التجارب الترفيهية—نقدم التكنولوجيا التفاعلية، مدن الألعاب العائلية، الوجهات الحركية، والاستعراضات الجماهيرية الكبرى.\n\nاليوم، يضم فريقنا أكثر من 120 متخصصاً وخبيراً يديرون كبرى الوجهات والفعاليات في قطر بأعلى معايير السلامة والجودة العالمية.",
    mediaType: "IMAGE",
    mediaUrl: "",
    fallbackImageUrl: ""
  },
  stats: {
    enabled: true,
    eyebrowEn: "BY THE NUMBERS",
    eyebrowAr: "إنجازاتنا بالأرقام",
    titleEn: "Operational Scale & Milestone Impact",
    titleAr: "حجم العمليات والأثر المحقق",
    items: [
      { id: "stat_1", value: "10+", labelEn: "Years in MENA", labelAr: "سنوات من الريادة في المنطقة", prefix: "", suffix: "" },
      { id: "stat_2", value: "120+", labelEn: "Industry Specialists", labelAr: "خبير ومتخصص", prefix: "", suffix: "" },
      { id: "stat_3", value: "25+", labelEn: "Mega Landmarks Delivered", labelAr: "مشروع ووجهة كبرى", prefix: "", suffix: "" },
      { id: "stat_4", value: "1M+", labelEn: "Visitors Hosted", labelAr: "زائر استمتع بتجاربنا", prefix: "", suffix: "" }
    ]
  },
  values: [
    {
      titleEn: "Engineering Precision",
      titleAr: "الدقة الهندسية",
      descEn: "We treat creativity with the rigor of structural engineering. No detail is too small, no safety margin compromised.",
      descAr: "نتعامل مع الإبداع بصرامة الهندسة الإنشائية. لا تفاصيل صغيرة جداً، ولا مساومة على معايير الأمان والسلامة."
    },
    {
      titleEn: "Operational Excellence",
      titleAr: "التميز التشغيلي",
      descEn: "Visionary designs create lasting impact through flawless live execution. We take complete ownership of the guest journey.",
      descAr: "التصاميم الإبداعية تكتسب قيمتها بالتنفيذ المتقن. نتحمل المسؤولية الكاملة عن سير العمليات وتجربة الضيوف."
    },
    {
      titleEn: "Cultural Resonance",
      titleAr: "الأصالة الثقافية",
      descEn: "Rooted in Qatar, built for the world. Our experiences honor local identity while setting international industry benchmarks.",
      descAr: "جذورنا في قطر، وصنعنا للعالم. نحترم الهوية والسياق المحلي مع وضع معايير عالمية المستوى."
    }
  ],
  leadership: {
    enabled: true,
    eyebrowEn: "EXECUTIVE TEAM",
    eyebrowAr: "فريق القيادة",
    titleEn: "The Visionaries Behind E3",
    titleAr: "القيادة والخبرات خلف إي ثري",
    subtitleEn: "A multidisciplinary leadership team combining global experiential knowledge with local execution precision.",
    subtitleAr: "فريق قيادي متعدد التخصصات يجمع بين الخبرة الترفيهية العالمية والدقة التنفيذية المحلية.",
    maxProfiles: 6
  },
  cta: {
    enabled: true,
    eyebrowEn: "COLLABORATION & PROCUREMENT",
    eyebrowAr: "التعاون والشراكات",
    headlineEn: "Ready to Engineer Your Next Landmark Project?",
    headlineAr: "هل أنت مستعد لتنفيذ مشروعك الترفيهي القادم؟",
    descriptionEn: "Partner with E3 Qatar to conceptualize, engineer, and operate unforgettable entertainment destinations.",
    descriptionAr: "شارك إي ثري قطر لتصميم وهندسة وتشغيل وجهات وفعاليات ترفيهية استثنائية تلهم الجماهير.",
    primaryCtaTextEn: "Submit RFP Inquiry",
    primaryCtaTextAr: "تقديم طلب عروض",
    primaryCtaUrl: "/b2b/contact",
    secondaryCtaTextEn: "Explore Our Case Studies",
    secondaryCtaTextAr: "استكشف دراسات الحالة",
    secondaryCtaUrl: "/b2b/cases"
  },
  seo: {
    metaTitleEn: "About Us | E3 Qatar Event Engineering & Attractions",
    metaTitleAr: "من نحن | إي ثري قطر لهندسة الفعاليات والوجهات",
    metaDescriptionEn: "Learn about E3 Qatar, our story, leadership, core values, and our mission to engineer mega-scale entertainment destinations.",
    metaDescriptionAr: "تعرف على إي ثري قطر، مسيرتنا، فريق القيادة، قيمنا ورؤيتنا في هندسة وتطوير كبرى الوجهات الترفيهية.",
    keywordsEn: "about E3, entertainment company Qatar, event engineering Doha, experiential leadership",
    keywordsAr: "عن إي ثري, شركة ترفيه قطر, هندسة فعاليات الدوحة, إدارة الوجهات"
  }
};

export const DEFAULT_B2B_CAREERS_CONTENT = {
  hero: {
    eyebrowEn: "CAREERS AT E3 QATAR",
    eyebrowAr: "فرص العمل في إي ثري قطر",
    titleEn: "Build the Future of Live Experiences",
    titleAr: "اصنع مستقبل الفعاليات والتجارب الحية",
    subtitleEn: "Join an elite collective of spatial architects, technical directors, AV systems engineers, and live experience pioneers in Qatar.",
    subtitleAr: "انضم إلى نخبة مهندسي التجارب، مصممي المسارح الحركية، ومخرجي أضخم الفعاليات الترفيهية والثقافية في دولة قطر.",
    descriptionEn: "Join an elite collective of spatial architects, technical directors, AV systems engineers, and live experience pioneers in Qatar.",
    descriptionAr: "انضم إلى نخبة مهندسي التجارب، مصممي المسارح الحركية، ومخرجي أضخم الفعاليات الترفيهية والثقافية في دولة قطر.",
    mediaType: "IMAGE",
    mediaUrl: "",
    fallbackImageUrl: ""
  },
  activeJobs: {
    eyebrowEn: "OPEN POSITIONS",
    eyebrowAr: "الوظائف المتاحة حالياً",
    titleEn: "Explore Available Opportunities",
    titleAr: "استكشف الفرص المتاحة",
    emptyStateTitleEn: "No Open Vacancies Right Now",
    emptyStateTitleAr: "لا توجد شواغر معلنة حالياً",
    emptyStateDescEn: "We are always scouting exceptional talent. Submit your general application below to join our talent pool.",
    emptyStateDescAr: "نحن نبحث دائماً عن الكفاءات المتميزة. يمكنك تقديم طلبك العام وسيرتك الذاتية أدناه للانضمام لبنك المواهب."
  },
  generalApplication: {
    enabled: true,
    eyebrowEn: "GENERAL INQUIRY & TALENT POOL",
    eyebrowAr: "بنك الكفاءات والتقديم العام",
    titleEn: "Don't See the Right Role?",
    titleAr: "لم تجد التخصص المناسب؟",
    descriptionEn: "Submit your resume to our executive talent pool for future mega projects, kinetic productions, and attraction launches.",
    descriptionAr: "أرسل سيرتك الذاتية إلى قاعدة بيانات الكفاءات للمشاريع الكبرى والعروض الحركية والوجهات القادمة.",
    buttonTextEn: "Submit General CV",
    buttonTextAr: "تقديم السيرة الذاتية العامة"
  },
  portalBanner: {
    enabled: true,
    eyebrowEn: "CANDIDATE TRACKING PORTAL",
    eyebrowAr: "بوابة المترشحين والمتابعة الفورية",
    titleEn: "Already Applied to E3?",
    titleAr: "هل تقدمت بطلب وظيفي مسبقاً؟",
    descriptionEn: "Sign in to track your submission progress, evaluation stage, and update your uploaded credentials in real time.",
    descriptionAr: "سجّل الدخول إلى بوابة المترشحين للاطلاع الفوري على حالة طلبك، مرحلة التقييم، وتحديث ملفك الشخصي.",
    signInTextEn: "Already Applied? Sign In",
    signInTextAr: "تسجيل الدخول لمتابعة الطلب"
  },
  lifeAtE3: {
    enabled: true,
    eyebrowEn: "ATELIER CULTURE & PRODUCTION",
    eyebrowAr: "بيئة العمل وكواليس الإنجاز",
    titleEn: "Life Inside the Engineering Atelier",
    titleAr: "الحياة والابتكار في إي ثري",
    subtitleEn: "Where architectural rigor meets boundless creative ambition. Experience the disciplines that power our landmark productions.",
    subtitleAr: "نحن نجمع بين أحدث التقنيات الهندسية وأرفع معايير الإبداع الفني لنصنع ذكريات لا تُنسى في قطر والمنطقة.",
    items: [
      {
        id: "kinetic-production",
        titleEn: "Master Kinetic Stage Engineering",
        titleAr: "هندسة المسارح والعروض الحركية الكبرى",
        categoryEn: "Technical Production",
        categoryAr: "الإنتاج التقني والهندسي",
        descriptionEn: "Our engineers design and deploy synchronized kinetic rigs, projection mapping, and ultra-high-definition laser systems across Qatar's flagship venues.",
        descriptionAr: "يقوم مهندسونا بتصميم وتنفيذ مسارح حركية متزامنة، عروض إسقاط ضوئي متطورة، وأنظمة ليزر فائقة الدقة في أبرز وجهات قطر.",
        icon: "cpu",
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"
      },
      {
        id: "spatial-architecture",
        titleEn: "Spatial & Multisensory Narrative Design",
        titleAr: "التصميم المكاني والتجارب متعددة الحواس",
        categoryEn: "Creative Architecture",
        categoryAr: "العمارة الإبداعية",
        descriptionEn: "Atelier teams transform raw spaces into living, breathing emotional environments connecting audiences with rich cultural stories.",
        descriptionAr: "يحول استوديو التصميم المساحات الصامتة إلى بيئات حسية غامرة تربط الجماهير بروايات ثقافية وتجارب استثنائية.",
        icon: "compass",
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
      },
      {
        id: "live-event-ops",
        titleEn: "Mega-Scale Live Event Synchronization",
        titleAr: "تزامن وإدارة الفعاليات الجماهيرية الكبرى",
        categoryEn: "Operations & Logistics",
        categoryAr: "العمليات الميدانية واللوجستية",
        descriptionEn: "Operating live with zero margin for error — synchronizing high-throughput crowd dynamics, protocol dignitary hospitality, and site safety.",
        descriptionAr: "إدارة العمليات الميدانية الحية بدقة متناهية تشمل بروتوكولات كبار الشخصيات، حركة الحشود، والسلامة الهندسية المتكاملة.",
        icon: "layers",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
      },
      {
        id: "creative-direction",
        titleEn: "World-Class Show Direction & Media Production",
        titleAr: "الإخراج الفني والإنتاج الإعلامي العالمي",
        categoryEn: "Creative Direction",
        categoryAr: "الإخراج الإبداعي",
        descriptionEn: "Conceptualizing original musical scores, volumetric holographic visuals, and international protocol opening ceremonies.",
        descriptionAr: "ابتكار المقطوعات الموسيقية الأصلية، المؤثرات الهولوغرافية ثلاثية الأبعاد، وإخراج حفلات الافتتاح الرسمية العالمية.",
        icon: "clapperboard",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745"
      }
    ]
  },
  hiringJourney: {
    enabled: true,
    eyebrowEn: "TRANSPARENT PROCESS",
    eyebrowAr: "رحلة المترشح والتقييم",
    titleEn: "Our Four-Step Hiring Journey",
    titleAr: "مراحل وخطوات الانضمام إلى إي ثري",
    subtitleEn: "From initial credential submission to your first live activation — clear milestones at every step.",
    subtitleAr: "مسار واضح وشفاف يضمن اختيار أفضل الكفاءات وتوفير تجربة انضمام سلسة ومهنية.",
    steps: [
      {
        number: "01",
        titleEn: "Application & CV Submission",
        titleAr: "التقديم وإرسال السيرة الذاتية",
        descEn: "Submit your resume for an active vacancy or join our general talent pool. Your candidate profile is generated instantly.",
        descAr: "قدّم سيرتك الذاتية لشواغرنا الحالية أو سجّل في قاعدة الكفاءات العامة ليتم إنشاء ملف المترشح فوراً.",
        icon: "file"
      },
      {
        number: "02",
        titleEn: "Technical & Creative Screening",
        titleAr: "التقييم الفني والإبداعي",
        descEn: "Our practice leads evaluate your portfolio, technical proficiency, and past project execution track record.",
        descAr: "يقوم قادة الأقسام بمراجعة سابقة أعمالك وخبراتك الهندسية والميدانية لتقييم ملاءمتها لمشاريعنا الكبرى.",
        icon: "search"
      },
      {
        number: "03",
        titleEn: "Interactive Specialist Interview",
        titleAr: "المقابلة التخصصية التفاعلية",
        descEn: "A deep-dive technical conversation and situational problem solving session with department directors.",
        descAr: "جلسة نقاش معمقة مع مديري الإنتاج والتصميم لاستعراض التحديات الهندسية وطرق حل المشكلات الميدانية.",
        icon: "users"
      },
      {
        number: "04",
        titleEn: "Executive Offer & Onboarding",
        titleAr: "العرض الوظيفي والانضمام للفريق",
        descEn: "Finalize terms, complete verified credential checks, and begin orchestrating Qatar's premier live experiences.",
        descAr: "اعتماد العرض الوظيفي، إنهاء إجراءات الانضمام، والبدء فوراً في قيادة أضخم الفعاليات والتجارب الحية.",
        icon: "sparkles"
      }
    ]
  },
  enquiries: {
    enabled: true,
    eyebrowEn: "TALENT ACQUISITION SUPPORT",
    eyebrowAr: "التواصل واستفسارات التوظيف",
    titleEn: "Have a Career Enquiry?",
    titleAr: "هل لديك استفسار لفريق التوظيف؟",
    subtitleEn: "Directly reach our Talent Acquisition team regarding role specifics, executive searches, or academic internships.",
    subtitleAr: "تواصل مباشرة مع فريق الموارد البشرية واستقطاب الكفاءات لأي استفسار يخص الشواغر، التدريب التعاوني، أو الشراكات الأكاديمية."
  },
  seo: {
    metaTitleEn: "Careers & Opportunities | E3 Qatar",
    metaTitleAr: "الوظائف وفرص الانضمام | إي ثري قطر",
    metaDescriptionEn: "Join an elite collective of spatial architects, technical directors, AV systems engineers, and live experience pioneers in Qatar.",
    metaDescriptionAr: "انضم إلى نخبة مهندسي التجارب، مصممي المسارح الحركية، ومخرجي أضخم الفعاليات الترفيهية والثقافية في دولة قطر.",
    keywordsEn: "careers at E3, event jobs Qatar, entertainment engineering jobs Doha, live production careers",
    keywordsAr: "وظائف إي ثري, وظائف فعاليات قطر, وظائف ترفيه الدوحة, مهندس صوت وإضاءة"
  }
};

export const DEFAULT_B2B_FAQS_CONTENT = {
  header: {
    eyebrowEn: "KNOWLEDGE & PARTNER FAQ",
    eyebrowAr: "الأسئلة الشائعة والمعلومات",
    titleEn: "Frequently Asked Questions",
    titleAr: "الأسئلة الشائعة",
    subtitleEn: "Everything you need to know about partnering with E3, procurement timelines, safety certifications, and live production scope.",
    subtitleAr: "كل ما تحتاج لمعرفته حول الشراكة مع إي ثري، الجداول الزمنية لتنفيذ المشاريع، اعتمادات السلامة، ونطاق الإنتاج والتشغيل.",
    mediaType: "IMAGE",
    mediaUrl: "",
    fallbackImageUrl: ""
  },
  items: [
    {
      id: "faq_1",
      questionEn: "What scale of events and destinations does E3 engineer?",
      questionAr: "ما هو حجم الفعاليات والوجهات التي تقوم إي ثري بهندستها؟",
      answerEn: "E3 engineers turnkey projects ranging from mega stadium opening ceremonies and national parades to permanent family entertainment centers and kinetic interactive pavilions across Qatar and the GCC.",
      answerAr: "تقوم إي ثري بتنفيذ مشاريع متكاملة تشمل حفلات افتتاح الاستادات والمسيرات الوطنية الكبرى، وصولاً إلى مدن الألعاب العائلية الدائمة والأجنحة التفاعلية في قطر ودول الخليج."
    },
    {
      id: "faq_2",
      questionEn: "How does the RFP and procurement process work with E3?",
      questionAr: "كيف تسير آلية تقديم طلبات العروض والشراكة مع إي ثري؟",
      answerEn: "Enterprise clients can submit preliminary briefs via our B2B RFP portal. Our technical team conducts feasibility and spatial audits within 48-72 hours to deliver comprehensive production timelines and budget models.",
      answerAr: "يمكن للجهات والشركات تقديم ملخصات المشاريع عبر بوابة طلبات العروض. يقوم فريقنا الهندسي بدراسة الجدوى والمخططات المكانية خلال 48-72 ساعة لتقديم جداول زمنية ونماذج ميزانية متكاملة."
    },
    {
      id: "faq_3",
      questionEn: "What international safety and engineering certifications does E3 hold?",
      questionAr: "ما هي اعتمادات السلامة والهندسة الدولية التي تحملها إي ثري؟",
      answerEn: "All kinetic rigging, structural fabrication, and crowd management systems comply with ISO 9001/45001 standards and Qatar Civil Defence safety regulations.",
      answerAr: "تلتزم جميع أنظمة التعليق الحركي، الهياكل الإنشائية، وإدارة الحشود بمعايير ISO 9001/45001 واشتراطات الدفاع المدني القطري."
    }
  ],
  seo: {
    metaTitleEn: "B2B Frequently Asked Questions | E3 Qatar",
    metaTitleAr: "الأسئلة الشائعة للشركات | إي ثري قطر",
    metaDescriptionEn: "Find detailed answers about E3 procurement, event engineering services, safety protocols, and technical staging capabilities.",
    metaDescriptionAr: "اعثر على إجابات مفصلة حول التعاقد مع إي ثري، خدمات هندسة الفعاليات، بروتوكولات السلامة، وقدرات الإنتاج المسرحي.",
    keywordsEn: "E3 FAQ, event procurement Qatar, staging FAQ Doha, entertainment engineering questions",
    keywordsAr: "أسئلة إي ثري, تعاقد فعاليات قطر, أسئلة شائعة ترفيه الدوحة"
  }
};

export const DEFAULT_B2B_FEEDBACK_CONTENT = {
  header: {
    eyebrowEn: "PARTNER SATISFACTION & AUDIT",
    eyebrowAr: "تقييم الشركاء وجودة الخدمة",
    titleEn: "Partner Suggestions & Feedback",
    titleAr: "الاقتراحات وملاحظات الشركاء",
    subtitleEn: "We value our enterprise collaborations. Your feedback empowers us to continuously elevate operational benchmarks.",
    subtitleAr: "نحن نعتز بشراكاتنا المؤسسية. تساهم ملاحظاتكم في الارتقاء المستمر بمعاييرنا التشغيلية وجودة مشاريعنا.",
    mediaType: "IMAGE",
    mediaUrl: "",
    fallbackImageUrl: ""
  },
  success: {
    titleEn: "Thank you for your feedback!",
    titleAr: "شكراً لملاحظاتك القيمة!",
    messageEn: "Your feedback has been logged securely and forwarded directly to our Executive Quality & Operations board.",
    messageAr: "تم تسجيل ملاحظاتك بأمان وتحويلها مباشرة إلى مجلس الجودة والعمليات التنفيذية لدينا."
  },
  seo: {
    metaTitleEn: "Partner Feedback & Survey | E3 Qatar",
    metaTitleAr: "نموذج تقييم وملاحظات الشركاء | إي ثري قطر",
    metaDescriptionEn: "Share your experience and feedback on E3 Qatar event engineering, project management, and live operations.",
    metaDescriptionAr: "شاركنا تجربتك وملاحظاتك حول خدمات هندسة الفعاليات وإدارة المشاريع والعمليات المباشرة مع إي ثري قطر.",
    keywordsEn: "E3 feedback, partner survey Qatar, event quality feedback Doha",
    keywordsAr: "تقييم إي ثري, استبيان الشركاء قطر, جودة الفعاليات"
  }
};

export const DEFAULT_B2B_PARTNERS_CONTENT = {
  hero: {
    eyebrowEn: "GOVERNMENT & ENTERPRISE ALLIANCES",
    eyebrowAr: "تحالفات حكومية ومؤسسية رائدة",
    titleEn: "Trusted by the Best.",
    titleAr: "يحظى بثقة الأفضل.",
    subtitleEn: "We partner with ambitious government entities, global brands, and premier destinations to deliver landmark experiences that matter.",
    subtitleAr: "نحن نتشارك مع هيئات حكومية طموحة، وعلامات تجارية عالمية، ووجهات رائدة لتقديم تجارب استثنائية.",
    mediaType: "IMAGE",
    mediaUrl: "",
    fallbackImageUrl: ""
  },
  seo: {
    metaTitleEn: "Corporate Partners & Clients | E3 Qatar",
    metaTitleAr: "شركاء وعملاء إي ثري قطر للشركات",
    metaDescriptionEn: "Explore E3 Qatar government and enterprise partnerships, landmark projects, and client testimonials.",
    metaDescriptionAr: "استكشف شراكات إي ثري قطر مع الجهات الحكومية والمؤسسات الكبرى وأبرز المشاريع المشتركة.",
    keywordsEn: "E3 clients, corporate partners Qatar, enterprise event partners Doha",
    keywordsAr: "عملاء إي ثري, شركاء قطر, تنظيم فعاليات حكومية"
  }
};

/**
 * Deeply merges target object with default fallback values.
 * Keeps user-provided values if non-empty, otherwise falls back to defaults.
 */
export function getMergedCMSPageContent(slug: string, rawContent?: any) {
  if (slug === 'pulse-orbit') {
    const defaultDestinations = [
      {
        id: 'attractions',
        labelEn: 'Flagship Attractions',
        labelAr: 'الوجهات الترفيهية الكبرى',
        href: '/b2c/attractions',
        descEn: 'Explore our world-class entertainment destinations across Qatar.',
        descAr: 'استكشف وجهاتنا الترفيهية العالمية في قطر.',
        mediaUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        enabled: true,
      }
    ];
    const raw = rawContent || {};
    const rawDests = Array.isArray(raw.destinations) ? raw.destinations : [];
    const mergedDests = rawDests.length > 0
      ? rawDests.map((d: any, idx: number) => {
          const match = defaultDestinations[idx] || defaultDestinations[0];
          return {
            ...match,
            ...d,
            mediaUrl: (d.mediaUrl && typeof d.mediaUrl === 'string' && d.mediaUrl.trim() !== '') ? d.mediaUrl.trim() : match.mediaUrl
          };
        })
      : defaultDestinations;

    return {
      titleEn: raw.titleEn || 'E3 PULSE ORBIT',
      titleAr: raw.titleAr || 'مدار نبض إي ثري',
      ...raw,
      destinations: mergedDests,
    };
  }

  if (slug === 'b2c-packages-page' || slug === 'b2c-packages') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2C_PACKAGES_PAGE_CONTENT;
    return {
      ...defaults,
      ...raw,
      heroMedia: { ...defaults.heroMedia, ...(raw.heroMedia || {}) },
      footerMedia: { ...defaults.footerMedia, ...(raw.footerMedia || {}) },
    };
  }
  if (slug === 'b2c-attractions-page' || slug === 'b2c-attractions') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT;
    const mergedHeroMedia = { ...defaults.heroMedia, ...(raw.heroMedia || {}) };
    const mergedFooterMedia = { ...(defaults.footerMedia || {}), ...(raw.footerMedia || {}) };

    const eyebrowEn = raw.eyebrowEn || raw.e3LivingHero?.eyebrowEn || defaults.eyebrowEn;
    const eyebrowAr = raw.eyebrowAr || raw.e3LivingHero?.eyebrowAr || defaults.eyebrowAr;
    const fixedHeadlineEn = raw.fixedHeadlineEn || raw.headlineTemplateEn || raw.e3LivingHero?.fixedHeadlineEn || defaults.fixedHeadlineEn;
    const fixedHeadlineAr = raw.fixedHeadlineAr || raw.headlineTemplateAr || raw.e3LivingHero?.fixedHeadlineAr || defaults.fixedHeadlineAr;
    const headlineTemplateEn = raw.headlineTemplateEn || raw.fixedHeadlineEn || raw.e3LivingHero?.headlineTemplateEn || defaults.headlineTemplateEn;
    const headlineTemplateAr = raw.headlineTemplateAr || raw.fixedHeadlineAr || raw.e3LivingHero?.headlineTemplateAr || defaults.headlineTemplateAr;
    const rotatingWordsEn = Array.isArray(raw.rotatingWordsEn) && raw.rotatingWordsEn.length > 0
      ? raw.rotatingWordsEn
      : (Array.isArray(raw.e3LivingHero?.rotatingWordsEn) && raw.e3LivingHero.rotatingWordsEn.length > 0
          ? raw.e3LivingHero.rotatingWordsEn
          : defaults.rotatingWordsEn);
    const rotatingWordsAr = Array.isArray(raw.rotatingWordsAr) && raw.rotatingWordsAr.length > 0
      ? raw.rotatingWordsAr
      : (Array.isArray(raw.e3LivingHero?.rotatingWordsAr) && raw.e3LivingHero.rotatingWordsAr.length > 0
          ? raw.e3LivingHero.rotatingWordsAr
          : defaults.rotatingWordsAr);
    const descriptionEn = raw.descriptionEn || raw.descEn || raw.e3LivingHero?.descriptionEn || defaults.descriptionEn;
    const descriptionAr = raw.descriptionAr || raw.descAr || raw.e3LivingHero?.descriptionAr || defaults.descriptionAr;
    const preset = raw.preset || raw.e3LivingHero?.preset || defaults.preset;
    const animationType = raw.animationType || raw.e3LivingHero?.animationType || defaults.animationType;
    const wordStyle = raw.wordStyle || raw.e3LivingHero?.wordStyle || defaults.wordStyle;
    const alignmentEn = raw.alignmentEn || raw.e3LivingHero?.alignmentEn || defaults.alignmentEn;
    const alignmentAr = raw.alignmentAr || raw.e3LivingHero?.alignmentAr || defaults.alignmentAr;
    const alignment = raw.alignment || raw.e3LivingHero?.alignment || defaults.alignment;
    const animationSpeed = raw.animationSpeed || raw.e3LivingHero?.animationSpeed || defaults.animationSpeed;
    const animationDuration = raw.animationDuration || raw.e3LivingHero?.animationDuration || defaults.animationDuration;
    const enableRotatingWords = raw.enableRotatingWords !== undefined
      ? raw.enableRotatingWords
      : (raw.e3LivingHero?.enableRotatingWords !== undefined ? raw.e3LivingHero.enableRotatingWords : defaults.enableRotatingWords);

    const primaryCta = raw.primaryCta || {
      labelEn: raw.primaryCtaEn || raw.e3LivingHero?.primaryCta?.labelEn || defaults.primaryCtaEn,
      labelAr: raw.primaryCtaAr || raw.e3LivingHero?.primaryCta?.labelAr || defaults.primaryCtaAr,
      url: raw.primaryCtaUrl || raw.e3LivingHero?.primaryCta?.url || defaults.primaryCtaUrl,
    };
    const secondaryCta = raw.secondaryCta || {
      labelEn: raw.secondaryCtaEn || raw.e3LivingHero?.secondaryCta?.labelEn || defaults.secondaryCtaEn,
      labelAr: raw.secondaryCtaAr || raw.e3LivingHero?.secondaryCta?.labelAr || defaults.secondaryCtaAr,
      url: raw.secondaryCtaUrl || raw.e3LivingHero?.secondaryCta?.url || defaults.secondaryCtaUrl,
    };

    return {
      ...defaults,
      ...raw,
      eyebrowEn,
      eyebrowAr,
      fixedHeadlineEn,
      fixedHeadlineAr,
      headlineTemplateEn,
      headlineTemplateAr,
      titleEn: headlineTemplateEn || fixedHeadlineEn,
      titleAr: headlineTemplateAr || fixedHeadlineAr,
      rotatingWordsEn,
      rotatingWordsAr,
      descriptionEn,
      descriptionAr,
      descEn: descriptionEn,
      descAr: descriptionAr,
      preset,
      animationType,
      wordStyle,
      alignmentEn,
      alignmentAr,
      alignment,
      animationSpeed,
      animationDuration,
      enableRotatingWords,
      primaryCta,
      secondaryCta,
      primaryCtaEn: primaryCta.labelEn,
      primaryCtaAr: primaryCta.labelAr,
      primaryCtaUrl: primaryCta.url,
      secondaryCtaEn: secondaryCta.labelEn,
      secondaryCtaAr: secondaryCta.labelAr,
      secondaryCtaUrl: secondaryCta.url,
      heroMedia: mergedHeroMedia,
      footerMedia: mergedFooterMedia,
      e3LivingHero: {
        eyebrowEn,
        eyebrowAr,
        fixedHeadlineEn,
        fixedHeadlineAr,
        headlineTemplateEn,
        headlineTemplateAr,
        rotatingWordsEn,
        rotatingWordsAr,
        descriptionEn,
        descriptionAr,
        preset,
        animationType,
        wordStyle,
        alignmentEn,
        alignmentAr,
        alignment,
        animationSpeed,
        animationDuration,
        enableRotatingWords,
        primaryCta,
        secondaryCta,
        ...(raw.e3LivingHero || {}),
        media: (raw.heroMedia && raw.heroMedia.mediaUrl !== undefined) ? mergedHeroMedia : (raw.e3LivingHero?.media || mergedHeroMedia)
      }
    };
  }
  if (slug === 'b2c-calendar-page' || slug === 'b2c-calendar') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2C_CALENDAR_PAGE_CONTENT;
    return {
      ...defaults,
      ...raw,
      heroMedia: { ...defaults.heroMedia, ...(raw.heroMedia || {}) },
    };
  }
  if (slug === 'b2b-cases' || slug === 'cases') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_CASES_CONTENT;
    return {
      ...defaults,
      ...raw,
      hero: { ...defaults.hero, ...(raw.hero || {}) },
      showreel: { ...defaults.showreel, ...(raw.showreel || {}) },
      factStream: { 
        ...defaults.factStream, 
        ...(raw.factStream || {}),
        selectedCaseStudyIds: Array.isArray(raw.factStream?.selectedCaseStudyIds)
          ? raw.factStream.selectedCaseStudyIds
          : (defaults.factStream?.selectedCaseStudyIds || [])
      },
      featuredCases: { 
        ...defaults.featuredCases, 
        ...(raw.featuredCases || {}),
        selectedCaseStudyIds: Array.isArray(raw.featuredCases?.selectedCaseStudyIds)
          ? raw.featuredCases.selectedCaseStudyIds
          : (defaults.featuredCases?.selectedCaseStudyIds || [])
      },
      archive: { ...defaults.archive, ...(raw.archive || {}) },
      teamStories: { 
        ...defaults.teamStories, 
        ...(raw.teamStories || {}),
        stories: Array.isArray(raw.teamStories?.stories) ? raw.teamStories.stories : []
      },
      timeline: { ...defaults.timeline, ...(raw.timeline || {}) },
      transformations: { 
        ...defaults.transformations, 
        ...(raw.transformations || {}),
        items: Array.isArray(raw.transformations?.items) ? raw.transformations.items : []
      },
      impactOverview: { 
        ...defaults.impactOverview, 
        ...(raw.impactOverview || {}),
        stats: Array.isArray(raw.impactOverview?.stats) ? raw.impactOverview.stats : []
      },
      servicesSection: { ...defaults.servicesSection, ...(raw.servicesSection || {}) },
      cta: { ...defaults.cta, ...(raw.cta || {}) },
      seo: { ...defaults.seo, ...(raw.seo || {}) }
    };
  }
  if (slug === 'b2b-services') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_SERVICES_CONTENT;
    return {
      ...defaults,
      ...raw,
      hero: { ...defaults.hero, ...(raw.hero || {}) },
      capabilityCount: { ...defaults.capabilityCount, ...(raw.capabilityCount || {}) },
      philosophy: { ...defaults.philosophy, ...(raw.philosophy || {}) },
      navigator: { ...defaults.navigator, ...(raw.navigator || {}) },
      featuredSpotlights: { ...defaults.featuredSpotlights, ...(raw.featuredSpotlights || {}) },
      deliveryMethodology: { 
        ...defaults.deliveryMethodology, 
        ...(raw.deliveryMethodology || {}),
        steps: (raw.deliveryMethodology?.steps && raw.deliveryMethodology.steps.length > 0)
          ? raw.deliveryMethodology.steps
          : defaults.deliveryMethodology.steps
      },
      caseStudies: { ...defaults.caseStudies, ...(raw.caseStudies || {}) },
      partnerRibbon: { ...defaults.partnerRibbon, ...(raw.partnerRibbon || {}) },
      cta: { ...defaults.cta, ...(raw.cta || {}) },
      seo: { ...defaults.seo, ...(raw.seo || {}) }
    };
  }
  if (slug === 'b2b-contact' || slug === 'contact') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_CONTACT_CONTENT;
    return {
      ...defaults,
      ...raw,
      header: { ...defaults.header, ...(raw.header || {}) },
      inquiries: { ...defaults.inquiries, ...(raw.inquiries || {}) },
      headquarters: { ...defaults.headquarters, ...(raw.headquarters || {}) },
      formConfig: {
        ...defaults.formConfig,
        ...(raw.formConfig || {}),
        inquiryTypes: Array.isArray(raw.formConfig?.inquiryTypes) && raw.formConfig.inquiryTypes.length > 0
          ? raw.formConfig.inquiryTypes
          : defaults.formConfig.inquiryTypes,
        labels: { ...defaults.formConfig.labels, ...(raw.formConfig?.labels || {}) },
        successState: { ...defaults.formConfig.successState, ...(raw.formConfig?.successState || {}) }
      },
      careersCta: { ...defaults.careersCta, ...(raw.careersCta || {}) },
      feedbackCta: { ...defaults.feedbackCta, ...(raw.feedbackCta || {}) },
      faqCta: { ...defaults.faqCta, ...(raw.faqCta || {}) },
      seo: { ...defaults.seo, ...(raw.seo || {}) }
    };
  }
  if (slug === 'b2b-about' || slug === 'about') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_ABOUT_CONTENT;
    return {
      ...defaults,
      ...raw,
      header: { ...defaults.header, ...(raw.header || {}) },
      story: { ...defaults.story, ...(raw.story || {}) },
      stats: {
        ...defaults.stats,
        ...(raw.stats || {}),
        items: Array.isArray(raw.stats?.items) && raw.stats.items.length > 0
          ? raw.stats.items
          : defaults.stats.items,
      },
      values: Array.isArray(raw.values) && raw.values.length > 0
        ? raw.values
        : defaults.values,
      leadership: { ...defaults.leadership, ...(raw.leadership || {}) },
      cta: { ...defaults.cta, ...(raw.cta || {}) },
      seo: { ...defaults.seo, ...(raw.seo || {}) }
    };
  }
  if (slug === 'b2b-careers' || slug === 'careers') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_CAREERS_CONTENT;
    return {
      ...defaults,
      ...raw,
      hero: { ...defaults.hero, ...(raw.hero || {}) },
      activeJobs: { ...defaults.activeJobs, ...(raw.activeJobs || {}) },
      generalApplication: { ...defaults.generalApplication, ...(raw.generalApplication || {}) },
      portalBanner: { ...defaults.portalBanner, ...(raw.portalBanner || {}) },
      lifeAtE3: {
        ...defaults.lifeAtE3,
        ...(raw.lifeAtE3 || {}),
        items: Array.isArray(raw.lifeAtE3?.items) && raw.lifeAtE3.items.length > 0
          ? raw.lifeAtE3.items
          : defaults.lifeAtE3.items,
      },
      hiringJourney: {
        ...defaults.hiringJourney,
        ...(raw.hiringJourney || {}),
        steps: Array.isArray(raw.hiringJourney?.steps) && raw.hiringJourney.steps.length > 0
          ? raw.hiringJourney.steps
          : defaults.hiringJourney.steps,
      },
      enquiries: { ...defaults.enquiries, ...(raw.enquiries || {}) },
      seo: { ...defaults.seo, ...(raw.seo || {}) }
    };
  }
  if (slug === 'b2b-faqs' || slug === 'faqs') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_FAQS_CONTENT;
    return {
      ...defaults,
      ...raw,
      header: { ...defaults.header, ...(raw.header || {}) },
      items: Array.isArray(raw.items) && raw.items.length > 0
        ? raw.items
        : defaults.items,
      seo: { ...defaults.seo, ...(raw.seo || {}) }
    };
  }
  if (slug === 'b2b-feedback' || slug === 'feedback') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_FEEDBACK_CONTENT;
    return {
      ...defaults,
      ...raw,
      header: { ...defaults.header, ...(raw.header || {}) },
      success: { ...defaults.success, ...(raw.success || {}) },
      seo: { ...defaults.seo, ...(raw.seo || {}) }
    };
  }
  if (slug === 'b2b-partners' || slug === 'partners') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_PARTNERS_CONTENT;
    return {
      ...defaults,
      ...raw,
      hero: { ...defaults.hero, ...(raw.hero || {}) },
      seo: { ...defaults.seo, ...(raw.seo || {}) }
    };
  }
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

  if (slug === 'b2b-pulse-orbit') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_PULSE_ORBIT_CONTENT;
    const rawDests = Array.isArray(raw.destinations) && raw.destinations.length > 0 ? raw.destinations : defaults.destinations;
    const hasDiscover = rawDests.some((d: any) => d.href === '/b2b/discover' || d.id === 'discover');
    let mergedDests = [...rawDests];
    if (!hasDiscover) {
      const discoverDefault = defaults.destinations.find((d: any) => d.id === 'discover') || {
        id: "discover",
        labelEn: "Discover E3",
        labelAr: "استكشف إي ثري",
        href: "/b2b/discover",
        descEn: "Discover the E3 story, leadership, record-breaking achievements, and technology.",
        descAr: "تعرف على قصة إي ثري قطر، قيادتها، أرقامها القياسية، وتكنولوجيا الفعاليات.",
        mediaUrl: "",
        enabled: true,
      };
      const servicesIdx = mergedDests.findIndex((d: any) => d.href?.includes('/services') || d.id === 'services');
      if (servicesIdx >= 0) {
        mergedDests.splice(servicesIdx, 0, discoverDefault);
      } else {
        mergedDests.unshift(discoverDefault);
      }
    }
    return {
      ...defaults,
      ...raw,
      destinations: mergedDests,
    };
  }

  if (slug === 'b2c-pulse-orbit' || slug === 'pulse-orbit') {
    const raw = rawContent || {};
    const defaults = DEFAULT_PULSE_ORBIT_CONTENT;
    return {
      ...defaults,
      ...raw,
      destinations: (raw.destinations && raw.destinations.length > 0) ? raw.destinations : defaults.destinations,
    };
  }

  if (slug === 'b2b-home') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_HOME_CONTENT;
    return {
      ...defaults,
      ...raw,
      hero: {
        ...defaults.hero,
        ...(raw.hero || {})
      },
      stats: (raw.stats && raw.stats.length > 0) ? raw.stats : defaults.stats,
      wowAndHow: {
        ...defaults.wowAndHow,
        ...(raw.wowAndHow || {})
      },
      capabilities: {
        ...defaults.capabilities,
        ...(raw.capabilities || {})
      },
      caseStudies: {
        ...defaults.caseStudies,
        ...(raw.caseStudies || {})
      },
      deliveryProcess: {
        ...defaults.deliveryProcess,
        ...(raw.deliveryProcess || {}),
        steps: (raw.deliveryProcess?.steps && raw.deliveryProcess.steps.length > 0)
          ? raw.deliveryProcess.steps
          : defaults.deliveryProcess.steps
      },
      partnerRibbon: {
        ...defaults.partnerRibbon,
        ...(raw.partnerRibbon || {})
      },
      featuredServiceIds: raw.featuredServiceIds || defaults.featuredServiceIds,
      featuredCaseStudyIds: raw.featuredCaseStudyIds || defaults.featuredCaseStudyIds,
    };
  }

  if (slug === 'b2b-team-page' || slug === 'b2b-team') {
    const raw = rawContent || {};
    const defaults = DEFAULT_B2B_TEAM_PAGE_CONTENT;
    return {
      ...defaults,
      ...raw,
      eyebrowEn: raw.eyebrowEn || raw.hero?.eyebrowEn || defaults.eyebrowEn,
      eyebrowAr: raw.eyebrowAr || raw.hero?.eyebrowAr || defaults.eyebrowAr,
      fixedHeadlineEn: raw.fixedHeadlineEn || raw.titleEn || raw.hero?.fixedHeadlineEn || defaults.fixedHeadlineEn,
      fixedHeadlineAr: raw.fixedHeadlineAr || raw.titleAr || raw.hero?.fixedHeadlineAr || defaults.fixedHeadlineAr,
      rotatingWordsEn: Array.isArray(raw.rotatingWordsEn) && raw.rotatingWordsEn.length > 0
        ? raw.rotatingWordsEn
        : (Array.isArray(raw.hero?.rotatingWordsEn) && raw.hero.rotatingWordsEn.length > 0 ? raw.hero.rotatingWordsEn : defaults.rotatingWordsEn),
      rotatingWordsAr: Array.isArray(raw.rotatingWordsAr) && raw.rotatingWordsAr.length > 0
        ? raw.rotatingWordsAr
        : (Array.isArray(raw.hero?.rotatingWordsAr) && raw.hero.rotatingWordsAr.length > 0 ? raw.hero.rotatingWordsAr : defaults.rotatingWordsAr),
      descriptionEn: raw.descriptionEn || raw.descEn || raw.hero?.descriptionEn || defaults.descriptionEn,
      descriptionAr: raw.descriptionAr || raw.descAr || raw.hero?.descriptionAr || defaults.descriptionAr,
      hero: {
        ...defaults,
        ...(raw.hero || {}),
        fixedHeadlineEn: raw.fixedHeadlineEn || raw.titleEn || raw.hero?.fixedHeadlineEn || defaults.fixedHeadlineEn,
        fixedHeadlineAr: raw.fixedHeadlineAr || raw.titleAr || raw.hero?.fixedHeadlineAr || defaults.fixedHeadlineAr,
        rotatingWordsEn: Array.isArray(raw.rotatingWordsEn) && raw.rotatingWordsEn.length > 0
          ? raw.rotatingWordsEn
          : (Array.isArray(raw.hero?.rotatingWordsEn) && raw.hero.rotatingWordsEn.length > 0 ? raw.hero.rotatingWordsEn : defaults.rotatingWordsEn),
        rotatingWordsAr: Array.isArray(raw.rotatingWordsAr) && raw.rotatingWordsAr.length > 0
          ? raw.rotatingWordsAr
          : (Array.isArray(raw.hero?.rotatingWordsAr) && raw.hero.rotatingWordsAr.length > 0 ? raw.hero.rotatingWordsAr : defaults.rotatingWordsAr),
        descriptionEn: raw.descriptionEn || raw.descEn || raw.hero?.descriptionEn || defaults.descriptionEn,
        descriptionAr: raw.descriptionAr || raw.descAr || raw.hero?.descriptionAr || defaults.descriptionAr,
      },
      heroMedia: {
        ...defaults.heroMedia,
        ...(raw.heroMedia || {}),
      },
      footerMedia: {
        ...defaults.footerMedia,
        ...(raw.footerMedia || {}),
      },
    };
  }

  if (slug === 'pulse-orbit') {
    const defaultDestinations = [
      {
        id: 'attractions',
        labelEn: 'Flagship Attractions',
        labelAr: 'الوجهات الترفيهية الكبرى',
        href: '/b2c/attractions',
        descEn: 'Explore our world-class entertainment destinations across Qatar.',
        descAr: 'استكشف وجهاتنا الترفيهية العالمية في قطر.',
        mediaUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        enabled: true,
      }
    ];
    const raw = rawContent || {};
    const rawDests = Array.isArray(raw.destinations) ? raw.destinations : [];
    const mergedDests = rawDests.length > 0
      ? rawDests.map((d: any, idx: number) => {
          const match = defaultDestinations[idx] || defaultDestinations[0];
          return {
            ...match,
            ...d,
            mediaUrl: (d.mediaUrl && typeof d.mediaUrl === 'string' && d.mediaUrl.trim() !== '') ? d.mediaUrl.trim() : match.mediaUrl
          };
        })
      : defaultDestinations;

    return {
      titleEn: raw.titleEn || 'E3 PULSE ORBIT',
      titleAr: raw.titleAr || 'مدار نبض إي ثري',
      ...raw,
      destinations: mergedDests,
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
      moments: Array.isArray(raw.guestMemories?.moments)
        ? raw.guestMemories.moments.map((m: any, idx: number) => ({
            id: m.id || `m-${Date.now()}-${idx}`,
            titleEn: m.titleEn !== undefined ? m.titleEn : '',
            titleAr: m.titleAr !== undefined ? m.titleAr : '',
            captionEn: m.captionEn !== undefined ? m.captionEn : '',
            captionAr: m.captionAr !== undefined ? m.captionAr : '',
            tagEn: m.tagEn !== undefined ? m.tagEn : 'E3 GUEST MOMENT',
            tagAr: m.tagAr !== undefined ? m.tagAr : 'لحظات زوار إي ثري',
            mediaUrl: m.mediaUrl !== undefined ? String(m.mediaUrl).trim() : '',
            mediaType: m.mediaType || 'IMAGE'
          }))
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
      eyebrowEn: "LIVE MEMORY WALL — HAPPENING NOW",
      eyebrowAr: "جدار الذكريات التفاعلي — LIVE MEMORY WALL",
      headlineEn: "E3 Happening Now — Live Moments",
      headlineAr: "إي ثري الآن — لحظات حية مباشرة",
      subtextEn: "Real-time moments, live event highlights, and guest stories streaming across official E3 channels.",
      subtextAr: "تابع أحدث الفعاليات واللحظات الترفيهية الحية عبر حساباتنا الرسمية.",
      channels: (Array.isArray(raw.socialFeed?.channels) && raw.socialFeed.channels.length > 0) ? raw.socialFeed.channels : DEFAULT_SOCIAL_CHANNELS,
      posts: (Array.isArray(raw.socialFeed?.posts) && raw.socialFeed.posts.length > 0) ? raw.socialFeed.posts : DEFAULT_SOCIAL_POSTS,
      ...(raw.socialFeed || {}),
    },
    liveFeed: {
      ...defaults.liveFeed,
      ...(raw.liveFeed || {}),
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
    sectionSequence: (() => {
      const rawSeq: any[] = Array.isArray(raw.sectionSequence) && raw.sectionSequence.length > 0
        ? raw.sectionSequence
        : (Array.isArray(raw.sequence) && raw.sequence.length > 0 ? raw.sequence : []);
      if (rawSeq.length === 0) return DEFAULT_B2C_SECTION_SEQUENCE;

      const userOrdered: B2CSectionItem[] = [];
      const seenIds = new Set<string>();

      for (let i = 0; i < rawSeq.length; i++) {
        const item = rawSeq[i];
        if (item && typeof item.id === 'string' && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          const defaultSec = DEFAULT_B2C_SECTION_SEQUENCE.find((d) => d.id === item.id);
          userOrdered.push({
            ...(defaultSec || {}),
            ...item,
            id: item.id,
            enabled: item.enabled !== undefined
              ? Boolean(item.enabled)
              : (item.isVisible !== undefined ? Boolean(item.isVisible) : (defaultSec?.enabled ?? true)),
            order: userOrdered.length + 1,
          });
        }
      }

      DEFAULT_B2C_SECTION_SEQUENCE.forEach((defaultSec) => {
        if (!seenIds.has(defaultSec.id)) {
          userOrdered.push({
            ...defaultSec,
            order: userOrdered.length + 1,
          });
        }
      });

      return userOrdered;
    })(),
    sequence: (() => {
      const rawSeq: any[] = Array.isArray(raw.sectionSequence) && raw.sectionSequence.length > 0
        ? raw.sectionSequence
        : (Array.isArray(raw.sequence) && raw.sequence.length > 0 ? raw.sequence : []);
      if (rawSeq.length === 0) return DEFAULT_B2C_SECTION_SEQUENCE;

      const userOrdered: B2CSectionItem[] = [];
      const seenIds = new Set<string>();

      for (let i = 0; i < rawSeq.length; i++) {
        const item = rawSeq[i];
        if (item && typeof item.id === 'string' && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          const defaultSec = DEFAULT_B2C_SECTION_SEQUENCE.find((d) => d.id === item.id);
          userOrdered.push({
            ...(defaultSec || {}),
            ...item,
            id: item.id,
            enabled: item.enabled !== undefined
              ? Boolean(item.enabled)
              : (item.isVisible !== undefined ? Boolean(item.isVisible) : (defaultSec?.enabled ?? true)),
            order: userOrdered.length + 1,
          });
        }
      }

      DEFAULT_B2C_SECTION_SEQUENCE.forEach((defaultSec) => {
        if (!seenIds.has(defaultSec.id)) {
          userOrdered.push({
            ...defaultSec,
            order: userOrdered.length + 1,
          });
        }
      });

      return userOrdered;
    })(),
    spatialExperience: {
      enabled: raw.spatialExperience?.enabled ?? defaults.spatialExperience?.enabled ?? false,
      faces: (Array.isArray(raw.spatialExperience?.faces) && raw.spatialExperience.faces.length > 0)
        ? raw.spatialExperience.faces.map((f: any, idx: number) => {
            const defaultFace = DEFAULT_SPATIAL_SECTIONS[idx] || DEFAULT_SPATIAL_SECTIONS[0];
            return {
              ...defaultFace,
              ...f,
              sortOrder: f.sortOrder !== undefined ? Number(f.sortOrder) : idx,
            };
          })
        : DEFAULT_SPATIAL_SECTIONS,
    },
  };
}
