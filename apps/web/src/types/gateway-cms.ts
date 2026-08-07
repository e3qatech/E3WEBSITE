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

// ---------------------------------------------------------
// E3 Living Threshold & Experience Composer Additions
// ---------------------------------------------------------

export type AtmosphereRendererType =
  | 'clear-day'
  | 'sunset'
  | 'night'
  | 'heat'
  | 'rain'
  | 'heavy-rain'
  | 'wind'
  | 'fog'
  | 'dust'
  | 'sandstorm'
  | 'snow'
  | 'static-fallback'
  | 'lego-modular';

export type GatewayGlobalMode = 'LIVE_DOHA' | 'MANUAL_OVERRIDE' | 'CUSTOM_CAMPAIGN';

export type CampaignAnimationBehavior =
  | 'fall_like_rain'
  | 'fall_like_snow'
  | 'drift_in_wind'
  | 'float'
  | 'orbit'
  | 'assemble'
  | 'build'
  | 'scatter'
  | 'burst'
  | 'bounce'
  | 'slide'
  | 'swirl'
  | 'accumulate_at_bottom'
  | 'follow_cursor'
  | 'scroll_reactive'
  | 'pulse'
  | 'slow_rotate'
  | 'static';

export interface GatewayLogoItem {
  url: string;
  altEn: string;
  altAr: string;
  type: 'image' | 'svg';
  width?: number;
  height?: number;
}

export interface GatewayLogos {
  mainLogo: GatewayLogoItem;
  lightLogo: GatewayLogoItem;
  darkLogo: GatewayLogoItem;
  mobileLogo: GatewayLogoItem;
  campaignLogo: GatewayLogoItem;
  favicon?: GatewayLogoItem;
}

export interface CampaignElement {
  id: string;
  name: string;
  assetUrl: string;
  assetType: 'image' | 'video' | 'transparent_png' | 'svg' | 'glb' | 'spline' | 'particle' | 'audio';
  animationBehavior: CampaignAnimationBehavior;
  density: 'low' | 'medium' | 'high';
  speed: number;
  scale: number;
  rotation: number;
  opacity: number;
  depthLayer: 'background' | 'behind_content' | 'foreground_overlay';
  mobileMultiplier: number;
  accumulationEnabled: boolean;
  maxAccumulation: number;
  interactionEnabled: boolean;
  weatherResponse: 'blend' | 'replace' | 'override' | 'ignore';
  startDelay: number;
  loop: boolean;
}

export interface CampaignAssetPlaceholders {
  logo?: MediaHolderConfig;
  backgroundImage?: MediaHolderConfig;
  backgroundVideo?: MediaHolderConfig;
  foregroundTransparentImage?: MediaHolderConfig;
  svgElement?: MediaHolderConfig;
  glbObject?: MediaHolderConfig;
  splineScene?: MediaHolderConfig;
  particleElement?: MediaHolderConfig;
  audio?: MediaHolderConfig;
  poster?: MediaHolderConfig;
  mobileFallback?: MediaHolderConfig;
  reducedMotionFallback?: MediaHolderConfig;
}

export interface GatewayExperienceConfig {
  systemEnabled: boolean;
  dohaLatitude: number;
  dohaLongitude: number;
  weatherRefreshIntervalMin: number;
  cacheTtlMin: number;
  staleCacheTtlHours: number;
  defaultScenePreset: AtmosphereRendererType;
  emergencyDisableAll: boolean;
  fallbackMode: 'STATIC_POSTER' | 'TIME_OF_DAY' | 'CSS_PARTICLES';
}

export interface GatewayAtmospherePreset {
  id: string;
  internalName: string;
  labelEn: string;
  labelAr: string;
  rendererType: AtmosphereRendererType;
  enabled: boolean;
  skyColorTop: string;
  skyColorBottom: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  particleCount: number;
  particleSpeed: number;
  particleSize: number;
  particleOpacity: number;
  mobileParticleMultiplier: number; // 0.1 - 1.0
  reducedMotionFallback: string;
  sortOrder: number;
}

export interface GatewayWeatherRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number; // 1 (highest) to 100
  tempMinC?: number;
  tempMaxC?: number;
  apparentTempMinC?: number;
  apparentTempMaxC?: number;
  rainMinMm?: number;
  rainMaxMm?: number;
  windMinKmh?: number;
  windMaxKmh?: number;
  pm10Min?: number;
  pm25Min?: number;
  presetId: AtmosphereRendererType;
  blendIntensity: number; // 0.1 to 1.0
}

export interface GatewayWaterAndSandPhysics {
  waterEnabled: boolean;
  waterFillRate: number;
  waterMaxHeightPercent: number; // Max safety ceiling <= 40%
  waterRefraction: number;
  waterDrainDurationSec: number;
  sandEnabled: boolean;
  sandAccumulationRate: number;
  sandMaxHeightPercent: number; // Max safety ceiling <= 30%
  sandDuneSmoothness: number;
  windChannelEnabled: boolean;
}

export interface GatewayCampaignItem {
  id: string;
  internalName: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  portalScope: 'SHARED' | 'B2B' | 'B2C';
  priority: 'EMERGENCY' | 'CAMPAIGN' | 'SCHEDULED' | 'WEATHER' | 'TIME' | 'FALLBACK';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  startAt?: string;
  endAt?: string;
  scenePreset: AtmosphereRendererType;
  ctaTextEn?: string;
  ctaTextAr?: string;
  ctaUrl?: string;
  weatherBlendMode: 'OVERRIDE' | 'BLEND' | 'DISABLE_WEATHER';
  weatherBlendChoice?: 'campaign_only' | 'weather_only' | 'blend_with_weather' | 'weather_as_background' | 'replace_weather_particles' | 'campaign_foreground_only';
  animationIntensity: number;
  emergencyDisable: boolean;
  bannerUrl?: string;
  media3dUrl?: string;
  elements?: CampaignElement[];
  assetHolders?: CampaignAssetPlaceholders;
}

export interface GatewayAnnouncementItem {
  id: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  severity: 'INFO' | 'PROMOTION' | 'WARNING' | 'CRITICAL';
  portalScope: 'SHARED' | 'B2B' | 'B2C';
  ctaTextEn?: string;
  ctaTextAr?: string;
  ctaUrl?: string;
  startAt?: string;
  endAt?: string;
  dismissible: boolean;
  enabled: boolean;
  priority: number;
}

export interface GatewayExperienceVersion {
  version: number;
  publishedAt: string;
  publishedBy: string;
  releaseNotes: string;
  snapshot: any;
}

export interface PreviewSimulationState {
  temperature: number;
  apparentTemperature: number;
  precipitation: number;
  rain: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  visibility: number;
  pm10: number;
  pm25: number;
  cloudCover: number;
  isDay: boolean;
  weatherCode: number;
  heavyRainOverride: boolean;
  selectedCampaignId?: string;
  selectedAnnouncementId?: string;
  locale: 'en' | 'ar';
  theme: 'dark' | 'light';
  viewport: 'desktop-1440' | 'laptop-1280' | 'tablet-768' | 'mobile-390' | 'small-mobile-320';
  capabilityTier: 'cinematic' | 'balanced' | 'lightweight';
  reducedMotion: boolean;
  webglAvailable: boolean;
  weatherApiAvailable: boolean;
  emergencyDisable: boolean;
}

export interface GatewayFocusProtectionSettings {
  selectionFocusProtection: 'always_on';
  atmosphereAroundCards: 'off' | 'low' | 'medium';
  contentReaction: 'off' | 'ambient' | 'expressive';
  focusModeEnabled: boolean;
  reduceEffectsOnHover: boolean;
  campaignDominance: 'background_only' | 'balanced' | 'strong_protected';
  cardContrastProtection: boolean;
  allowAccumulationNearCards: 'never' | 'outer_edges_only';
}

export interface GatewayCustomizationPayload {
  english: GatewayContentEn;
  arabic: GatewayContentAr;
  b2cDesktopMedia: MediaHolderConfig;
  b2cMobileMedia: MediaHolderConfig;
  b2bDesktopMedia: MediaHolderConfig;
  b2bMobileMedia: MediaHolderConfig;
  gatewayDesktopBackgroundMedia?: MediaHolderConfig;
  gatewayMobileBackgroundMedia?: MediaHolderConfig;
  staticFallbackMedia?: MediaHolderConfig;
  reducedMotionFallbackMedia?: MediaHolderConfig;
  logos?: GatewayLogos;
  globalMode?: GatewayGlobalMode;
  manualOverride?: {
    scenePreset: AtmosphereRendererType;
    intensity: 'low' | 'medium' | 'high';
    startAt?: string;
    endAt?: string;
    portalScope?: 'BOTH' | 'B2B' | 'B2C';
  };
  visual: GatewayVisualSettings;
  seoAccess: GatewaySeoAccess;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt?: string;

  // Living Threshold & Experience Composer extensions
  experienceConfig?: GatewayExperienceConfig;
  atmospherePresets?: GatewayAtmospherePreset[];
  weatherRules?: GatewayWeatherRule[];
  waterAndSandPhysics?: GatewayWaterAndSandPhysics;
  campaigns?: GatewayCampaignItem[];
  announcements?: GatewayAnnouncementItem[];
  versions?: GatewayExperienceVersion[];
  focusProtection?: GatewayFocusProtectionSettings;
}

export const DEFAULT_GATEWAY_CMS_PAYLOAD: GatewayCustomizationPayload = {
  globalMode: 'LIVE_DOHA',
  logos: {
    mainLogo: { url: '/images/logo.svg', altEn: 'E3 Qatar Logo', altAr: 'شعار إي ثري قطر', type: 'svg' },
    lightLogo: { url: '/images/logo-light.svg', altEn: 'E3 Qatar Light Logo', altAr: 'شعار إi ثري قطر - فاتح', type: 'svg' },
    darkLogo: { url: '/images/logo-dark.svg', altEn: 'E3 Qatar Dark Logo', altAr: 'شعار إي ثري قطر - داكن', type: 'svg' },
    mobileLogo: { url: '/images/logo-mobile.svg', altEn: 'E3 Mobile Logo', altAr: 'شعار الجوال', type: 'svg' },
    campaignLogo: { url: '/images/campaign-logo.png', altEn: 'Campaign World Logo', altAr: 'شعار العالم التفاعلي', type: 'image' },
  },
  manualOverride: {
    scenePreset: 'rain',
    intensity: 'medium',
    portalScope: 'BOTH',
  },
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

  // Living Threshold & Experience Composer defaults
  experienceConfig: {
    systemEnabled: true,
    dohaLatitude: 25.2854,
    dohaLongitude: 51.5310,
    weatherRefreshIntervalMin: 30,
    cacheTtlMin: 30,
    staleCacheTtlHours: 24,
    defaultScenePreset: 'clear-day',
    emergencyDisableAll: false,
    fallbackMode: 'STATIC_POSTER',
  },
  atmospherePresets: [
    { id: 'p-1', internalName: 'Clear Day Sunshine', labelEn: 'Clear Day', labelAr: 'سماء صافية', rendererType: 'clear-day', enabled: true, skyColorTop: '#0ea5e9', skyColorBottom: '#38bdf8', fogColor: '#0ea5e9', fogNear: 10, fogFar: 100, particleCount: 30, particleSpeed: 2, particleSize: 2, particleOpacity: 0.3, mobileParticleMultiplier: 0.3, reducedMotionFallback: 'Static Clear Day Image', sortOrder: 1 },
    { id: 'p-2', internalName: 'Sunset Mirage', labelEn: 'Sunset Mirage', labelAr: 'غروب الشفق', rendererType: 'sunset', enabled: true, skyColorTop: '#f43f5e', skyColorBottom: '#fb923c', fogColor: '#f43f5e', fogNear: 8, fogFar: 80, particleCount: 50, particleSpeed: 3, particleSize: 3, particleOpacity: 0.4, mobileParticleMultiplier: 0.3, reducedMotionFallback: 'Static Sunset Image', sortOrder: 2 },
    { id: 'p-3', internalName: 'Doha Night Constellation', labelEn: 'Qatar Night Sky', labelAr: 'سماء قطر الليلية', rendererType: 'night', enabled: true, skyColorTop: '#090b10', skyColorBottom: '#1e1b4b', fogColor: '#090b10', fogNear: 5, fogFar: 50, particleCount: 100, particleSpeed: 1, particleSize: 2, particleOpacity: 0.7, mobileParticleMultiplier: 0.4, reducedMotionFallback: 'Static Night Sky Image', sortOrder: 3 },
    { id: 'p-4', internalName: 'Extreme Heat Mirage', labelEn: 'Extreme Heat', labelAr: 'حرارة شديدة', rendererType: 'heat', enabled: true, skyColorTop: '#78350f', skyColorBottom: '#f59e0b', fogColor: '#b45309', fogNear: 12, fogFar: 70, particleCount: 40, particleSpeed: 4, particleSize: 3, particleOpacity: 0.3, mobileParticleMultiplier: 0.2, reducedMotionFallback: 'Static Heat Mirage Image', sortOrder: 4 },
    { id: 'p-5', internalName: 'Coastal Rain Droplets', labelEn: 'Coastal Rain', labelAr: 'أمطار ساحلية', rendererType: 'rain', enabled: true, skyColorTop: '#1e293b', skyColorBottom: '#475569', fogColor: '#334155', fogNear: 5, fogFar: 40, particleCount: 150, particleSpeed: 10, particleSize: 1.5, particleOpacity: 0.5, mobileParticleMultiplier: 0.3, reducedMotionFallback: 'Static Rain Image', sortOrder: 5 },
    { id: 'p-6', internalName: 'Heavy Rain Storm', labelEn: 'Heavy Rain Storm', labelAr: 'عاصفة مطرية', rendererType: 'heavy-rain', enabled: true, skyColorTop: '#0f172a', skyColorBottom: '#1e293b', fogColor: '#0f172a', fogNear: 2, fogFar: 30, particleCount: 300, particleSpeed: 18, particleSize: 2, particleOpacity: 0.6, mobileParticleMultiplier: 0.3, reducedMotionFallback: 'Static Heavy Rain Image', sortOrder: 6 },
    { id: 'p-7', internalName: 'Desert Dust & Sandstorm', labelEn: 'Desert Sandstorm', labelAr: 'عاصفة رملية غبارية', rendererType: 'sandstorm', enabled: true, skyColorTop: '#451a03', skyColorBottom: '#d97706', fogColor: '#92400e', fogNear: 2, fogFar: 20, particleCount: 200, particleSpeed: 8, particleSize: 3, particleOpacity: 0.6, mobileParticleMultiplier: 0.2, reducedMotionFallback: 'Static Sandstorm Image', sortOrder: 7 },
  ],
  weatherRules: [
    { id: 'r-1', name: 'Heavy Rain Rule', enabled: true, priority: 1, rainMinMm: 5, presetId: 'heavy-rain', blendIntensity: 1.0 },
    { id: 'r-2', name: 'Rain Rule', enabled: true, priority: 2, rainMinMm: 0.5, presetId: 'rain', blendIntensity: 0.8 },
    { id: 'r-3', name: 'Sandstorm Rule', enabled: true, priority: 3, pm10Min: 100, presetId: 'sandstorm', blendIntensity: 0.9 },
    { id: 'r-4', name: 'Extreme Heat Rule', enabled: true, priority: 4, apparentTempMinC: 38, presetId: 'heat', blendIntensity: 0.7 },
  ],
  waterAndSandPhysics: {
    waterEnabled: true,
    waterFillRate: 0.05,
    waterMaxHeightPercent: 15, // Hard code safety limit capped at <= 40%
    waterRefraction: 1.2,
    waterDrainDurationSec: 3,
    sandEnabled: true,
    sandAccumulationRate: 0.03,
    sandMaxHeightPercent: 10, // Hard code safety limit capped at <= 30%
    sandDuneSmoothness: 0.8,
    windChannelEnabled: true,
  },
  campaigns: [
    {
      id: 'c-1',
      internalName: 'LEGO® Modular Experiential World',
      titleEn: 'LEGO® Experiential Event World',
      titleAr: 'عالم ليجو® التفاعلي والمعماري',
      descriptionEn: "Experience Qatar's largest modular brick activation constructed through spatial engineering.",
      descriptionAr: 'استكشف أضخم مجسم معماري تفاعلي في قطر مصمم بقطع ليجو® التركيبية.',
      portalScope: 'SHARED',
      priority: 'CAMPAIGN',
      status: 'PUBLISHED',
      scenePreset: 'lego-modular',
      ctaTextEn: 'Discover LEGO World',
      ctaTextAr: 'استكشف عالم ليجو',
      ctaUrl: '/b2c',
      weatherBlendMode: 'BLEND',
      animationIntensity: 0.8,
      emergencyDisable: false,
    },
  ],
  announcements: [
    {
      id: 'a-1',
      titleEn: 'Qatar Summer Festival 2026 Season Open',
      titleAr: 'افتتاح موسم مهرجان صيف قطر 2026',
      bodyEn: 'Book tickets for all major attractions and live corporate stage activations.',
      bodyAr: 'احجز تذاكرك الآن لجميع الوجهات والفعاليات الحية والمرافق الترفيهية.',
      severity: 'PROMOTION',
      portalScope: 'SHARED',
      ctaTextEn: 'View Festival Schedule',
      ctaTextAr: 'عرض جدول المهرجان',
      ctaUrl: '/b2c/calendar',
      dismissible: true,
      enabled: true,
      priority: 1,
    },
  ],
  focusProtection: {
    selectionFocusProtection: 'always_on',
    atmosphereAroundCards: 'low',
    contentReaction: 'ambient',
    focusModeEnabled: true,
    reduceEffectsOnHover: true,
    campaignDominance: 'strong_protected',
    cardContrastProtection: true,
    allowAccumulationNearCards: 'outer_edges_only',
  },
};
