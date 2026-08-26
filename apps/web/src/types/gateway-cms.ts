export type MediaType = 'IMAGE' | 'VIDEO' | 'MODEL_3D' | 'IFRAME';

export interface MediaHolderConfig {
  mediaType: MediaType;
  mediaUrl: string;
  fallbackImageUrl: string; // Mandatory fallback image
  posterImageUrl?: string;
  mediaTitle?: string;
  altEn: string;
  altAr: string;
  captionEn?: string;
  captionAr?: string;
  focalPointX: number; // 0 - 100 (%)
  focalPointY: number; // 0 - 100 (%)
  objectFit: 'cover' | 'contain' | 'fill';
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  interactionEnabled: boolean;
  loadingStrategy: 'lazy' | 'eager';
  isVisible: boolean;
}

export interface GatewayLogoConfig {
  defaultLogoUrl?: string;
  lightLogoUrl?: string;
  darkLogoUrl?: string;
  mobileLogoUrl?: string;
  destinationUrl?: string;
  altEn?: string;
  altAr?: string;
}

export interface GatewayContentEn {
  eyebrowEn: string;
  headlineEn: string;
  supportingTextEn: string;
  b2cNumberTagEn?: string;
  b2cLabelEn: string;
  b2cTitleEn: string;
  b2cTaglineEn?: string;
  b2cDescEn: string;
  b2cCtaLabelEn: string;
  b2cDestinationUrl?: string;
  b2cStatLabelEn?: string;
  b2cStatVisible?: boolean;
  b2cAriaLabelEn?: string;
  b2bNumberTagEn?: string;
  b2bLabelEn: string;
  b2bTitleEn: string;
  b2bTaglineEn?: string;
  b2bDescEn: string;
  b2bCtaLabelEn: string;
  b2bDestinationUrl?: string;
  b2bStatLabelEn?: string;
  b2bStatVisible?: boolean;
  b2bAriaLabelEn?: string;
  accessibilityLabelsEn?: string;
}

export interface GatewayContentAr {
  eyebrowAr: string;
  headlineAr: string;
  supportingTextAr: string;
  b2cNumberTagAr?: string;
  b2cLabelAr: string;
  b2cTitleAr: string;
  b2cTaglineAr?: string;
  b2cDescAr: string;
  b2cCtaLabelAr: string;
  b2cDestinationUrl?: string;
  b2cStatLabelAr?: string;
  b2cStatVisible?: boolean;
  b2cAriaLabelAr?: string;
  b2bNumberTagAr?: string;
  b2bLabelAr: string;
  b2bTitleAr: string;
  b2bTaglineAr?: string;
  b2bDescAr: string;
  b2bCtaLabelAr: string;
  b2bDestinationUrl?: string;
  b2bStatLabelAr?: string;
  b2bStatVisible?: boolean;
  b2bAriaLabelAr?: string;
  accessibilityLabelsAr?: string;
}

export interface GatewayVisualSettings {
  gatewayEnabled: boolean;
  initialSplitRatio: number; // 50 (50/50 split)
  selectedPortalWidth: number; // 63 (%)
  defaultPortal: 'b2c' | 'b2b' | 'none';
  splitExpansionEnabled: boolean;
  entryTransition: 'smooth' | 'fade' | 'slide';
  motionEnabled: boolean;
  motionIntensity: 'low' | 'moderate' | 'high';
  mobilePortalOrder: 'b2c_first' | 'b2b_first';
  languageSwitcherVisible: boolean;
  themeSwitcherVisible: boolean;
  statisticsVisible: boolean;
  reducedMotionDefault: boolean;
  themeMode: 'dark' | 'light' | 'auto';
  overlayColor?: string;
  overlayStrength?: number; // 0 to 1
  backgroundStyle: 'wireframe' | 'glass' | 'gradient' | 'custom_media';
}

export interface GatewaySeoAccess {
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescEn: string;
  seoDescAr: string;
  ogImage: string;
  ariaGatewayLabelEn: string;
  ariaGatewayLabelAr: string;
  b2cAriaLabelEn?: string;
  b2cAriaLabelAr?: string;
  b2bAriaLabelEn?: string;
  b2bAriaLabelAr?: string;
  b2cCtaAriaLabelEn?: string;
  b2cCtaAriaLabelAr?: string;
  b2bCtaAriaLabelEn?: string;
  b2bCtaAriaLabelAr?: string;
}

export interface GatewayExperienceVersion {
  version: number;
  publishedAt: string;
  publishedBy: string;
  releaseNotes: string;
  checksum?: string;
  snapshot: any;
}

export interface GatewayPreviewSimulationState {
  locale: 'en' | 'ar';
  theme: 'dark' | 'light';
  viewport: 'desktop-1440' | 'laptop-1280' | 'tablet-768' | 'mobile-390' | 'small-mobile-320';
  portalFocus: 'none' | 'b2c' | 'b2b';
  reducedMotion: boolean;
  useFallbackMedia: boolean;
}

export interface GatewayCustomizationPayload {
  english: GatewayContentEn;
  arabic: GatewayContentAr;
  logo?: GatewayLogoConfig;
  b2cDesktopMedia: MediaHolderConfig;
  b2cMobileMedia: MediaHolderConfig;
  b2bDesktopMedia: MediaHolderConfig;
  b2bMobileMedia: MediaHolderConfig;
  visual: GatewayVisualSettings;
  seoAccess: GatewaySeoAccess;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt?: string;
  versions?: GatewayExperienceVersion[];
}

export const DEFAULT_GATEWAY_CMS_PAYLOAD: GatewayCustomizationPayload = {
  english: {
    eyebrowEn: 'WELCOME TO E3',
    headlineEn: 'TWO WORLDS. ONE E3.',
    supportingTextEn: 'Whether you’re looking for your next unforgettable experience or a trusted partner to create one, your journey starts here.',
    b2cNumberTagEn: '01',
    b2cLabelEn: 'EXPERIENCES & ATTRACTIONS',
    b2cTitleEn: 'EXPERIENCE WHAT’S NEXT',
    b2cTaglineEn: 'Events, attractions & tickets',
    b2cDescEn: 'Discover live events, family attractions and unforgettable entertainment experiences across Qatar.',
    b2cCtaLabelEn: 'Explore Experiences',
    b2cDestinationUrl: '/b2c',
    b2cStatLabelEn: '1.2M+ Annual Visitors',
    b2cStatVisible: true,
    b2cAriaLabelEn: 'E3 B2C Experiences Portal',
    b2bNumberTagEn: '02',
    b2bLabelEn: 'FOR BRANDS & ORGANIZATIONS',
    b2bTitleEn: 'BUILD WHAT’S NEXT',
    b2bTaglineEn: 'Production, brands & partnerships',
    b2bDescEn: 'Partner with E3 to design, produce and operate remarkable events, destinations and immersive brand experiences.',
    b2bCtaLabelEn: 'Work With E3',
    b2bDestinationUrl: '/b2b',
    b2bStatLabelEn: '450+ Corporate Activations',
    b2bStatVisible: true,
    b2bAriaLabelEn: 'E3 B2B Enterprise Solutions Portal',
    accessibilityLabelsEn: 'E3 Qatar Portal Selection Gateway',
  },
  arabic: {
    eyebrowAr: 'مرحباً بكم في E3',
    headlineAr: 'عالمان. وجهة واحدة: E3',
    supportingTextAr: 'سواء كنت تبحث عن تجربتك القادمة أو عن شريك موثوق لصناعتها، رحلتك تبدأ من هنا.',
    b2cNumberTagAr: '01',
    b2cLabelAr: 'التجارب والوجهات',
    b2cTitleAr: 'عِش التجربة القادمة',
    b2cTaglineAr: 'الفعاليات والوجهات والتذاكر',
    b2cDescAr: 'اكتشف الفعاليات الحية والوجهات العائلية وتجارب الترفيه الاستثنائية في مختلف أنحاء قطر.',
    b2cCtaLabelAr: 'استكشف التجارب',
    b2cDestinationUrl: '/ar/b2c',
    b2cStatLabelAr: '+١.٢ مليون زائر سنوياً',
    b2cStatVisible: true,
    b2cAriaLabelAr: 'بوابة تجارب الأفراد والجمهور',
    b2bNumberTagAr: '02',
    b2bLabelAr: 'للعلامات التجارية والمؤسسات',
    b2bTitleAr: 'لنصنع القادم',
    b2bTaglineAr: 'الإنتاج والشراكات المؤسسية',
    b2bDescAr: 'تعاون مع E3 لتصميم وإنتاج وتشغيل فعاليات ووجهات وتجارب غامرة تترك أثراً استثنائياً.',
    b2bCtaLabelAr: 'تعاون مع E3',
    b2bDestinationUrl: '/ar/b2b',
    b2bStatLabelAr: '+٤٥٠ مشروع مؤسسي',
    b2bStatVisible: true,
    b2bAriaLabelAr: 'بوابة حلول الشركات والمؤسسات',
    accessibilityLabelsAr: 'بوابة اختيار وجهة منصة إي ثري قطر',
  },
  logo: {
    defaultLogoUrl: '',
    lightLogoUrl: '',
    darkLogoUrl: '',
    mobileLogoUrl: '',
    destinationUrl: '/',
    altEn: 'Official E3 Qatar Logo',
    altAr: 'شعار إي ثري قطر الرسمي',
  },
  b2cDesktopMedia: {
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    mediaTitle: 'B2C Live Experiences Showcase',
    altEn: 'Immersive B2C live entertainment experience in Qatar',
    altAr: 'تجربة ترفيهية حية للأفراد في قطر',
    focalPointX: 50,
    focalPointY: 50,
    objectFit: 'cover',
    autoplay: true,
    loop: true,
    muted: true,
    interactionEnabled: true,
    loadingStrategy: 'lazy',
    isVisible: true,
  },
  b2cMobileMedia: {
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    mediaTitle: 'B2C Live Mobile Media',
    altEn: 'Mobile view of B2C experience',
    altAr: 'عرض للهاتف الجوال لتجارب الأفراد',
    focalPointX: 50,
    focalPointY: 50,
    objectFit: 'cover',
    autoplay: true,
    loop: true,
    muted: true,
    interactionEnabled: true,
    loadingStrategy: 'lazy',
    isVisible: true,
  },
  b2bDesktopMedia: {
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    mediaTitle: 'B2B Stage Engineering Showcase',
    altEn: 'Enterprise stage engineering setup for B2B clients in Qatar',
    altAr: 'تجهيزات هندسة المسارح الكبرى للشركات في قطر',
    focalPointX: 50,
    focalPointY: 50,
    objectFit: 'cover',
    autoplay: true,
    loop: true,
    muted: true,
    interactionEnabled: true,
    loadingStrategy: 'lazy',
    isVisible: true,
  },
  b2bMobileMedia: {
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop',
    mediaTitle: 'B2B Stage Mobile Media',
    altEn: 'Mobile view of B2B engineering solution',
    altAr: 'عرض للهاتف الجوال لهندسة المسارح',
    focalPointX: 50,
    focalPointY: 50,
    objectFit: 'cover',
    autoplay: true,
    loop: true,
    muted: true,
    interactionEnabled: true,
    loadingStrategy: 'lazy',
    isVisible: true,
  },
  visual: {
    gatewayEnabled: true,
    initialSplitRatio: 50,
    selectedPortalWidth: 63,
    defaultPortal: 'none',
    splitExpansionEnabled: true,
    entryTransition: 'smooth',
    motionEnabled: true,
    motionIntensity: 'moderate',
    mobilePortalOrder: 'b2c_first',
    languageSwitcherVisible: true,
    themeSwitcherVisible: true,
    statisticsVisible: true,
    reducedMotionDefault: false,
    themeMode: 'dark',
    overlayStrength: 0.6,
    backgroundStyle: 'wireframe',
  },
  seoAccess: {
    seoTitleEn: 'E3 Qatar | Experiences, Attractions & Event Solutions',
    seoTitleAr: 'إي ثري قطر | التجارب والوجهات وحلول الفعاليات',
    seoDescEn: 'Explore E3 attractions and entertainment experiences across Qatar, or partner with our team for event production, fabrication and immersive solutions.',
    seoDescAr: 'اكتشف وجهات E3 وتجاربها الترفيهية في قطر، أو تعاون معنا لإنتاج الفعاليات وتنفيذ التجارب والبيئات الغامرة.',
    ogImage: 'https://e3.qa/og-image-gateway.jpg',
    ariaGatewayLabelEn: 'E3 Qatar main gateway portal selection',
    ariaGatewayLabelAr: 'بوابة الاختيار الرئيسية لمنصة إي ثري قطر',
    b2cAriaLabelEn: 'E3 B2C Experiences Portal selection',
    b2cAriaLabelAr: 'اختيار بوابة تجارب الأفراد',
    b2bAriaLabelEn: 'E3 B2B Enterprise Solutions Portal selection',
    b2bAriaLabelAr: 'اختيار بوابة حلول الشركات والمؤسسات',
    b2cCtaAriaLabelEn: 'Navigate to E3 Experiences & Attractions',
    b2cCtaAriaLabelAr: 'الانتقال إلى تجارب ووجهات إي ثري',
    b2bCtaAriaLabelEn: 'Navigate to E3 Enterprise Event Solutions',
    b2bCtaAriaLabelAr: 'الانتقال إلى حلول إي ثري للشركات',
  },
  status: 'PUBLISHED',
};
