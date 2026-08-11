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
    logoPrimary: "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?q=80&w=400&auto=format&fit=crop",
    brandColor: "#f59e0b",
    secondaryColor: "#b45309",
    relatedAttractionSlug: "crayons-bricks",
    internalRoute: "/b2c/attractions/crayons-bricks",
    bookingUrl: "/b2c/tickets?attraction=crayons-bricks",
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
    nameEn: "Kids City Driving School",
    nameAr: "مدينة قيادة الأطفال",
    taglineEn: "Owned Interactive Traffic City Concept",
    taglineAr: "فكرة مملوكة — مدينة المرور التفاعلية الأولى للأطفال",
    descriptionEn: "An owned immersive traffic city concept empowering children with miniature electric vehicles, traffic signals, driving licenses, and safety education.",
    descriptionAr: "تجربة واقعية مملوكة لـ E3 للأطفال لقيادة السيارات الكهربائية الصغيرة وتعلم قواعد المرور ورخص القيادة.",
    relationship: "OWNED",
    logoPrimary: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
    brandColor: "#10b981",
    secondaryColor: "#047857",
    relatedAttractionSlug: "kids-driving-school",
    internalRoute: "/b2c/attractions/kids-driving-school",
    bookingUrl: "/b2c/tickets?attraction=kids-driving-school",
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
    nameAr: "إنفلاتابارك",
    taglineEn: "Operated Indoor Inflatable Playground",
    taglineAr: "مفهوم مُشغّل — أكبر مدينة ألعاب هوائية مطاطية مغلقة",
    descriptionEn: "An E3 operated indoor inflatable park covering over 5,000 sqm of continuous obstacle courses, giant slides, and bounce zones.",
    descriptionAr: "مجمع الألعاب الهوائية المطاطية المُدار بواسطة E3 ويمتد على مساحة تزيد عن ٥٠٠٠ متر مربع من المسارات التنافسية.",
    relationship: "OPERATED",
    logoPrimary: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop",
    brandColor: "#ec4899",
    secondaryColor: "#be185d",
    relatedAttractionSlug: "inflatapark",
    internalRoute: "/b2c/attractions/inflatapark",
    bookingUrl: "/b2c/tickets?attraction=inflatapark",
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
    nameAr: "الساحة الحضرية",
    taglineEn: "Operated High-Octane Kinetic & Laser Arena",
    taglineAr: "مفهوم مُشغّل — حلبة المنافسات التفاعلية والليزر",
    descriptionEn: "Qatar's premier kinetic entertainment arena operated by E3, featuring laser tag, high-impact esports tournaments, and interactive obstacle courses.",
    descriptionAr: "الساحة الأولى في قطر للترفيه التفاعلي والمُدارة بواسطة E3، وتضم حلبات منافسات الليزر والرياضات الإلكترونية.",
    relationship: "OPERATED",
    logoPrimary: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop",
    brandColor: "#3b82f6",
    secondaryColor: "#1d4ed8",
    relatedAttractionSlug: "urban-arena",
    internalRoute: "/b2c/attractions/urban-arena",
    bookingUrl: "/b2c/tickets?attraction=urban-arena",
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 5,
    sortOrder: 5,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-inflatasplash",
    slug: "inflatasplash",
    nameEn: "InflataSplash",
    nameAr: "إنفلاتاسبلاش المائية",
    taglineEn: "Delivered Beach Aqua Park Experience",
    taglineAr: "تجربة منفّذة — حديقة الألعاب المائية الشاطئية",
    descriptionEn: "A signature beach FEC attraction delivered by E3 featuring giant floating water obstacles, launch pads, and slides.",
    descriptionAr: "وجهة الألعاب المائية الشاطئية المنفّذة بواسطة E3 والتي تضم عقبات هوائية مائية عائمة وزلاقات عملاقة.",
    relationship: "DELIVERED",
    logoPrimary: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
    brandColor: "#06b6d4",
    secondaryColor: "#0e7490",
    relatedAttractionSlug: "inflatasplash",
    internalRoute: "/b2c/attractions/inflatasplash",
    bookingUrl: "/b2c/tickets?attraction=inflatasplash",
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 6,
    sortOrder: 6,
    isVisible: true,
    status: "PUBLISHED"
  }
]
