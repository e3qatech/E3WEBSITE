export interface OurBrandRecord {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  taglineEn: string
  taglineAr: string
  descriptionEn: string
  descriptionAr: string
  classification: 'OUR_BRAND' | 'CLIENT' | 'PARTNER'
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
  isOwned: boolean
  featureOnB2CLanding: boolean
  featureOnB2BPartners: boolean
  priority: number
  sortOrder: number
  isVisible: boolean
  status: 'DRAFT' | 'PUBLISHED'
}

export const DEFAULT_OUR_BRANDS: OurBrandRecord[] = [
  {
    id: "brand-urban-arena",
    slug: "urban-arena",
    nameEn: "Urban Arena",
    nameAr: "الساحة الحضرية",
    taglineEn: "High-Octane Kinetic Action & Esports",
    taglineAr: "منافسات الحركة التفاعلية والرياضات الإلكترونية",
    descriptionEn: "Qatar's premier kinetic entertainment arena featuring laser tag, esports tournaments, and obstacle courses.",
    descriptionAr: "الساحة الأولى في قطر للترفيه التفاعلي والرياضات الإلكترونية ومنافسات الليزر.",
    classification: "OUR_BRAND",
    logoPrimary: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop",
    brandColor: "#3b82f6",
    secondaryColor: "#1d4ed8",
    relatedAttractionSlug: "urban-arena",
    internalRoute: "/b2c/attractions/urban-arena",
    bookingUrl: "/b2c/tickets?attraction=urban-arena",
    isOwned: true,
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 1,
    sortOrder: 1,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-inflatapark",
    slug: "inflatapark",
    nameEn: "InflataPark",
    nameAr: "إنفلاتابارك",
    taglineEn: "World's Largest Inflatable Playground",
    taglineAr: "أكبر عالم للألعاب الهوائية المطاطية في العالم",
    descriptionEn: "Over 5,000 sqm of continuous inflatable obstacle courses, giant slides, and gravity-defying bounce zones.",
    descriptionAr: "أكثر من ٥٠٠٠ متر مربع من مسارات العوائق الهوائية والتزحلق القافز لجميع الأعمار.",
    classification: "OUR_BRAND",
    logoPrimary: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop",
    brandColor: "#ec4899",
    secondaryColor: "#be185d",
    relatedAttractionSlug: "inflatapark",
    internalRoute: "/b2c/attractions/inflatapark",
    bookingUrl: "/b2c/tickets?attraction=inflatapark",
    isOwned: true,
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
    taglineEn: "Interactive Traffic City & Early Driving",
    taglineAr: "مدينة المرور التفاعلية الأولى للأطفال",
    descriptionEn: "Empowering children with real miniature electric vehicles, traffic signs, driving licenses, and safety education.",
    descriptionAr: "تجربة واقعية للأطفال لقيادة السيارات الكهربائية الصغيرة وتعلم قواعد المرور ورخص القيادة.",
    classification: "OUR_BRAND",
    logoPrimary: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
    brandColor: "#10b981",
    secondaryColor: "#047857",
    relatedAttractionSlug: "kids-driving-school",
    internalRoute: "/b2c/attractions/kids-driving-school",
    bookingUrl: "/b2c/tickets?attraction=kids-driving-school",
    isOwned: true,
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 3,
    sortOrder: 3,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-inflatasplash",
    slug: "inflatasplash",
    nameEn: "InflataSplash",
    nameAr: "إنفلاتاسبلاش المائية",
    taglineEn: "Floating Aqua Park & Water Challenge",
    taglineAr: "أكبر حديقة مائية هوائية على شواطئ قطر",
    descriptionEn: "Qatar's ultimate beach attraction featuring giant floating water obstacles, launch pads, and slides.",
    descriptionAr: "الوجهة المائية الشاطئية الأولى للألعاب المائية المطاطية والتحديات الشيقة.",
    classification: "OUR_BRAND",
    logoPrimary: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
    brandColor: "#06b6d4",
    secondaryColor: "#0e7490",
    relatedAttractionSlug: "inflatasplash",
    internalRoute: "/b2c/attractions/inflatasplash",
    bookingUrl: "/b2c/tickets?attraction=inflatasplash",
    isOwned: true,
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 4,
    sortOrder: 4,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-crayons-bricks",
    slug: "crayons-bricks",
    nameEn: "Crayons & Bricks",
    nameAr: "كرايونز آند بريكس",
    taglineEn: "Creative Workshops & STEM Play Labs",
    taglineAr: "ورش الإبداع والبناء والابتكار للأطفال",
    descriptionEn: "A vibrant imaginative realm for children to build, sculpt, draw, and experiment with spatial building blocks.",
    descriptionAr: "مساحة إبداعية مخصصة للأطفال للاكتشاف والبناء والتلوين وورش العمل التفاعلية.",
    classification: "OUR_BRAND",
    logoPrimary: "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?q=80&w=400&auto=format&fit=crop",
    brandColor: "#f59e0b",
    secondaryColor: "#b45309",
    relatedAttractionSlug: "crayons-bricks",
    internalRoute: "/b2c/attractions/crayons-bricks",
    bookingUrl: "/b2c/tickets?attraction=crayons-bricks",
    isOwned: true,
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 5,
    sortOrder: 5,
    isVisible: true,
    status: "PUBLISHED"
  },
  {
    id: "brand-bookingqube",
    slug: "bookingqube",
    nameEn: "BookingQube",
    nameAr: "بوكينج كيوب",
    taglineEn: "E3's Proprietary Ticketing & Spatial Engine",
    taglineAr: "منظومة حجز التذاكر والتسجيل الرقمي الذكي من E3",
    descriptionEn: "The next-generation digital ticketing system powering venue access, RFID wristbands, and seamless guest entry.",
    descriptionAr: "منظومة حجز التذاكر الرقمية المبتكرة التي تدير دخول الزوار والأرقام التفاعلية في كافة الوجهات.",
    classification: "OUR_BRAND",
    logoPrimary: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
    brandColor: "#8b5cf6",
    secondaryColor: "#6d28d9",
    externalUrl: "https://bookingqube.e3qatar.com",
    bookingUrl: "/b2c/tickets",
    isOwned: true,
    featureOnB2CLanding: true,
    featureOnB2BPartners: true,
    priority: 6,
    sortOrder: 6,
    isVisible: true,
    status: "PUBLISHED"
  }
]
