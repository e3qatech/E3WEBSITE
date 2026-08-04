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

export interface GatewayContentEn {
  eyebrowEn: string;
  headlineEn: string;
  supportingTextEn: string;
  b2cLabelEn: string;
  b2cTitleEn: string;
  b2cDescEn: string;
  b2cCtaLabelEn: string;
  b2cStatLabelEn: string;
  b2bLabelEn: string;
  b2bTitleEn: string;
  b2bDescEn: string;
  b2bCtaLabelEn: string;
  b2bStatLabelEn: string;
  accessibilityLabelsEn: string;
}

export interface GatewayContentAr {
  eyebrowAr: string;
  headlineAr: string;
  supportingTextAr: string;
  b2cLabelAr: string;
  b2cTitleAr: string;
  b2cDescAr: string;
  b2cCtaLabelAr: string;
  b2cStatLabelAr: string;
  b2bLabelAr: string;
  b2bTitleAr: string;
  b2bDescAr: string;
  b2bCtaLabelAr: string;
  b2bStatLabelAr: string;
  accessibilityLabelsAr: string;
}

export interface GatewayVisualSettings {
  defaultPortal: 'b2c' | 'b2b' | 'none';
  fastRoutingEnabled: boolean;
  backgroundStyle: 'wireframe' | 'glass' | 'gradient' | 'custom_media';
  soundEffectsEnabled: boolean;
  reducedMotionDefault: boolean;
  themeMode: 'dark' | 'light' | 'auto';
}

export interface GatewaySeoAccess {
  seoTitleEn: string;
  seoTitleAr: string;
  seoDescEn: string;
  seoDescAr: string;
  ogImage: string;
  ariaGatewayLabelEn: string;
  ariaGatewayLabelAr: string;
}

export interface GatewayCustomizationPayload {
  english: GatewayContentEn;
  arabic: GatewayContentAr;
  b2cDesktopMedia: MediaHolderConfig;
  b2cMobileMedia: MediaHolderConfig;
  b2bDesktopMedia: MediaHolderConfig;
  b2bMobileMedia: MediaHolderConfig;
  visual: GatewayVisualSettings;
  seoAccess: GatewaySeoAccess;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt?: string;
}

export const DEFAULT_GATEWAY_CMS_PAYLOAD: GatewayCustomizationPayload = {
  english: {
    eyebrowEn: 'E3 QATAR PLATFORM GATEWAY',
    headlineEn: 'WE BUILD EXPERIENCES',
    supportingTextEn: "Qatar's premier live entertainment, permanent attractions, and enterprise event engineering portal.",
    b2cLabelEn: 'Public Experiences',
    b2cTitleEn: 'PRISTINE SNOW',
    b2cDescEn: "Discover Qatar's premier live events, permanent attractions, and immersive entertainment destinations.",
    b2cCtaLabelEn: 'Enter B2C Experiences',
    b2cStatLabelEn: '1.2M+ Annual Visitors',
    b2bLabelEn: 'Enterprise Solutions',
    b2bTitleEn: 'COSMIC VOID',
    b2bDescEn: 'End-to-end event engineering, stage fabrication, kinetic lighting, and spatial technologies.',
    b2bCtaLabelEn: 'Enter B2B Engineering',
    b2bStatLabelEn: '450+ Corporate Activations',
    accessibilityLabelsEn: 'E3 Qatar Portal Selection Gateway',
  },
  arabic: {
    eyebrowAr: 'بوابة منصة إي ثري قطر',
    headlineAr: 'نحن نصنع التجارب والاستثنائية',
    supportingTextAr: 'المنصة الرائدة في قطر للفعاليات الحية والمرافق الترفيهية وهندسة الفعاليات الكبرى.',
    b2cLabelAr: 'تجارب الأفراد والجمهور',
    b2cTitleAr: 'عالم المغامرة والثلج',
    b2cDescAr: 'استكشف أفضل الفعاليات الحية والوجهات الترفيهية والتجارب التفاعلية الغامضة في قطر.',
    b2cCtaLabelAr: 'دخول بوابة الأفراد',
    b2cStatLabelAr: '+١.٢ مليون زائر سنوياً',
    b2bLabelAr: 'حلول الشركات والمؤسسات',
    b2bTitleAr: 'الفضاء التكنولوجي الهندسي',
    b2bDescAr: 'هندسة الفعاليات المتكاملة، وتصنيع المسارح، والتقنيات التفاعلية، والإضاءة الحركية.',
    b2bCtaLabelAr: 'دخول بوابة الشركات',
    b2bStatLabelAr: '+٤٥٠ مشروع مؤسسي',
    accessibilityLabelsAr: 'بوابة اختيار وجهة منصة إي ثري قطر',
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
    defaultPortal: 'none',
    fastRoutingEnabled: false,
    backgroundStyle: 'wireframe',
    soundEffectsEnabled: false,
    reducedMotionDefault: false,
    themeMode: 'dark',
  },
  seoAccess: {
    seoTitleEn: 'E3 Qatar - We Build Experiences | B2C & B2B Gateway',
    seoTitleAr: 'إي ثري قطر - نحن نصنع التجارب والاستثنائية | البوابة الرئيسية',
    seoDescEn: "Qatar's premier event engineering and entertainment agency portal.",
    seoDescAr: 'البوابة الرئيسية لشركة إي ثري قطر للهندسة والترفيه وإدارة الفعاليات الكبرى.',
    ogImage: 'https://e3.qa/og-image-gateway.jpg',
    ariaGatewayLabelEn: 'E3 Qatar main gateway portal selection',
    ariaGatewayLabelAr: 'بوابة الاختيار الرئيسية لمنصة إي ثري قطر',
  },
  status: 'PUBLISHED',
};
