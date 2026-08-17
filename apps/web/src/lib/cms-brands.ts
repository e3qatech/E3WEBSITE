export type BrandRelationship = 'OWNED' | 'SUBSIDIARY' | 'OPERATED' | 'LICENSED' | 'DELIVERED'

export interface OurBrandRecord {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  taglineEn: string
  taglineAr: string
  descriptionEn: string
  descriptionAr: string
  relationship: BrandRelationship
  logoPrimary: string
  logoLight?: string
  logoDark?: string
  logoMonochrome?: string
  logoMobile?: string
  squareIcon?: string
  brandMark?: string
  logoAltEn?: string
  logoAltAr?: string
  desktopFeatureMedia?: string
  mobileFeatureMedia?: string
  backgroundMedia?: string
  mediaType?: string
  brandColor: string
  secondaryColor?: string
  textColorPref?: 'LIGHT' | 'DARK'
  relatedAttractionSlug?: string
  relatedEventSlug?: string
  relatedCaseStudySlug?: string
  internalRoute?: string
  externalUrl?: string
  bookingUrl?: string
  socialLinks?: Record<string, string>
  featureOnB2CLanding: boolean
  featureOnB2BPartners: boolean
  priority: number
  sortOrder: number
  isVisible: boolean
  status: 'DRAFT' | 'PUBLISHED'
}

export const DEFAULT_OUR_BRANDS: OurBrandRecord[] = [
  {
    id: "brand-bookingqube",
    slug: "bookingqube",
    nameEn: "BookingQube",
    nameAr: "بوكينج كيوب",
    taglineEn: "Wholly Owned Ticketing & Spatial Engine",
    taglineAr: "منظومة حجز التذاكر والتسجيل الرقمي المملوكة لـ E3",
    descriptionEn: "E3's proprietary digital ticketing platform powering venue access, RFID wristbands, and automated guest flow across all destinations.",
    descriptionAr: "منظومة حجز التذاكر الرقمية المبتكرة المملوكة لـ E3 والتي تدير دخول الزوار والتسجيل الرقمي في كافة الوجهات.",
    relationship: "SUBSIDIARY",
    logoPrimary: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
    brandColor: "#8b5cf6",
    secondaryColor: "#6d28d9",
    externalUrl: "https://bookingqube.e3qatar.com",
    bookingUrl: "/b2c/tickets",
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 1,
    sortOrder: 1,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-crayons-bricks",
    slug: "crayons-bricks",
    nameEn: "Crayons & Bricks",
    nameAr: "كرايونز آند بريكس",
    taglineEn: "Owned Creative Workshops & STEM Play Labs",
    taglineAr: "فكرة مملوكة — ورش الإبداع والبناء والابتكار للأطفال",
    descriptionEn: "An owned E3 child-development realm for children to build, sculpt, draw, and experiment with spatial building blocks and STEM labs.",
    descriptionAr: "مساحة إبداعية مملوكة لـ E3 مخصصة للأطفال للاكتشاف والبناء والتلوين وورش العمل التفاعلية.",
    relationship: "OWNED",
    logoPrimary: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg",
    brandColor: "#f59e0b",
    secondaryColor: "#b45309",
    relatedAttractionSlug: "crayons-and-bricks-place-vendome",
    internalRoute: "/b2c/attractions/crayons-and-bricks-place-vendome",
    bookingUrl: "/b2c/attractions/crayons-and-bricks-place-vendome#booking",
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 2,
    sortOrder: 2,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-kids-city",
    slug: "kids-city-driving-school",
    nameEn: "Kidz Driving School",
    nameAr: "مدرسة القيادة للأطفال",
    taglineEn: "Owned Interactive Traffic City Concept",
    taglineAr: "فكرة مملوكة — مدينة المرور التفاعلية الأولى للأطفال",
    descriptionEn: "An owned immersive traffic city concept empowering children with miniature electric vehicles, traffic signals, driving licenses, and safety education.",
    descriptionAr: "تجربة واقعية مملوكة لـ E3 للأطفال لقيادة السيارات الكهربائية الصغيرة وتعلم قواعد المرور ورخص القيادة.",
    relationship: "OWNED",
    logoPrimary: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e6016d8f-1b8e-4099-95b7-fb9acd1169eb.png",
    brandColor: "#10b981",
    secondaryColor: "#047857",
    relatedAttractionSlug: "kidz-driving-school-city-center-doha",
    internalRoute: "/b2c/attractions/kidz-driving-school-city-center-doha",
    bookingUrl: "/b2c/attractions/kidz-driving-school-city-center-doha#booking",
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 3,
    sortOrder: 3,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-inflatapark",
    slug: "inflatapark",
    nameEn: "InflataPark",
    nameAr: "إنفلاتا بارك",
    taglineEn: "Operated Indoor Inflatable Playground",
    taglineAr: "مفهوم مُشغّل — أكبر مدينة ألعاب هوائية مطاطية مغلقة",
    descriptionEn: "An E3 operated indoor inflatable park covering continuous obstacle courses, giant slides, and bounce zones.",
    descriptionAr: "مجمع الألعاب الهوائية المطاطية المُدار بواسطة E3 ويمتد على مساحات واسعة من المسارات التنافسية.",
    relationship: "OPERATED",
    logoPrimary: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop",
    brandColor: "#ec4899",
    secondaryColor: "#be185d",
    relatedAttractionSlug: "inflata-park-city-center-doha",
    internalRoute: "/b2c/attractions/inflata-park-city-center-doha",
    bookingUrl: "/b2c/attractions/inflata-park-city-center-doha#booking",
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 4,
    sortOrder: 4,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-urban-arena",
    slug: "urban-arena",
    nameEn: "Urban Arena",
    nameAr: "أوربان أرينا",
    taglineEn: "Operated High-Octane Kinetic & Laser Arena",
    taglineAr: "مفهوم مُشغّل — حلبة المنافسات التفاعلية والليزر",
    descriptionEn: "Qatar's premier kinetic entertainment arena operated by E3, featuring laser tag, high-impact esports tournaments, mixed-reality karting, and interactive obstacle courses.",
    descriptionAr: "الساحة الأولى في قطر للترفيه التفاعلي والمُدارة بواسطة E3، وتضم حلبات منافسات الليزر والرياضات الإلكترونية والكارتينغ.",
    relationship: "OPERATED",
    logoPrimary: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png",
    brandColor: "#3b82f6",
    secondaryColor: "#1d4ed8",
    relatedAttractionSlug: "urban-arena",
    internalRoute: "/b2c/attractions/urban-arena",
    bookingUrl: "/b2c/attractions/urban-arena#booking",
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 5,
    sortOrder: 5,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-spongebob",
    slug: "spongebob-paw-patrol",
    nameEn: "SpongeBob & PAW Patrol",
    nameAr: "سبونج بوب وباو باترول",
    taglineEn: "Official Character Water Activation",
    taglineAr: "فعالية الشخصيات العالمية المائية الرسمية",
    descriptionEn: "A splash-filled character experience bringing Bikini Bottom and Adventure Bay to Qatar at Meryal Waterpark.",
    descriptionAr: "تجربة مائية مليئة بالمرح تجمع بين شخصيات سبونج بوب وباو باترول في قطر بحديقة مريال المائية.",
    relationship: "DELIVERED",
    logoPrimary: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/2809137c-b6cd-48f0-94d4-80e19c038e4e.JPG",
    brandColor: "#06b6d4",
    secondaryColor: "#0e7490",
    relatedAttractionSlug: "spongebob-squarepants-paw-patrol-activation-meryal",
    internalRoute: "/b2c/attractions/spongebob-squarepants-paw-patrol-activation-meryal",
    bookingUrl: "/b2c/attractions/spongebob-squarepants-paw-patrol-activation-meryal#booking",
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 6,
    sortOrder: 6,
    isVisible: true,
    status: "PUBLISHED"
  }
]
