export type CapabilityTier = 'CINEMATIC' | 'BALANCED' | 'LIGHTWEIGHT';

export type MotionPresetType =
  | 'SOFT_BODY'
  | 'KINETIC_GRID'
  | 'ROAD_NETWORK'
  | 'SPATIAL_PORTAL'
  | 'PARTICLE_WORLD'
  | 'LIGHT_TRAILS'
  | 'MEDIA_CINEMATIC'
  | 'STATIC_PREMIUM';

export type HeroSceneType =
  | 'CINEMATIC_MEDIA'
  | 'DEPTH_WORLD'
  | 'PARTICLE_WORLD'
  | 'OBJECT_REVEAL'
  | 'SPATIAL_PORTAL'
  | 'STATIC_PREMIUM';

export type SectionRevealStyle =
  | 'FADE'
  | 'MASK'
  | 'SLIDE'
  | 'DEPTH'
  | 'STAGGER'
  | 'LINE_DRAW'
  | 'STATIC';

export type CardInteractionStyle =
  | 'ELEVATE'
  | 'DEPTH_SHIFT'
  | 'IMAGE_CROP'
  | 'LIGHT_RESPONSE'
  | 'BORDER_PULSE'
  | 'STATIC';

export type PageTransitionStyle =
  | 'SHARED_MEDIA'
  | 'DIRECTIONAL_WIPE'
  | 'DEPTH_FADE'
  | 'COLOR_BRIDGE'
  | 'NONE';

export interface B2CMotionSettings {
  motionEnabled: boolean;
  motionPreset: MotionPresetType;
  motionIntensity: 'LOW' | 'MEDIUM' | 'HIGH';
  heroSceneType: HeroSceneType;
  hero3dAsset?: string;
  heroSplineScene?: string;
  heroPoster?: string;
  particleAsset?: string;
  particleDensity: number;
  interactionType: CardInteractionStyle;
  scrollBehavior: 'SMOOTH' | 'PARALLAX' | 'NATIVE';
  sectionRevealStyle: SectionRevealStyle;
  galleryTransitionStyle: 'SLIDE' | 'CROSSFADE' | 'ZOOM';
  ctaEmphasisStyle: 'PULSE' | 'SHIMMER' | 'STATIC';
  pageTransitionStyle: PageTransitionStyle;
  backgroundTreatment: 'AMBIENT_GLOW' | 'DARK_VOID' | 'WEATHER_FRAGMENT' | 'STATIC';
  mobilePreset: 'LIGHTWEIGHT_SHADER' | 'WEBM_LOOP' | 'CSS_DEPTH' | 'STATIC_POSTER';
  mobileFallback: string;
  reducedMotionFallback: string;
  webglFallback: string;
  performanceBudget: {
    maxParticleCount: number;
    maxDpr: number;
    max3dAssetSizeMb: number;
  };
}

export const DEFAULT_B2C_MOTION_SETTINGS: B2CMotionSettings = {
  motionEnabled: true,
  motionPreset: 'MEDIA_CINEMATIC',
  motionIntensity: 'MEDIUM',
  heroSceneType: 'CINEMATIC_MEDIA',
  particleDensity: 50,
  interactionType: 'ELEVATE',
  scrollBehavior: 'SMOOTH',
  sectionRevealStyle: 'FADE',
  galleryTransitionStyle: 'SLIDE',
  ctaEmphasisStyle: 'SHIMMER',
  pageTransitionStyle: 'SHARED_MEDIA',
  backgroundTreatment: 'AMBIENT_GLOW',
  mobilePreset: 'CSS_DEPTH',
  mobileFallback: '/images/b2c/hero-mobile-poster.jpg',
  reducedMotionFallback: '/images/b2c/hero-static-poster.jpg',
  webglFallback: '/images/b2c/hero-static-poster.jpg',
  performanceBudget: {
    maxParticleCount: 100,
    maxDpr: 1.5,
    max3dAssetSizeMb: 2.0,
  },
};

export type TelemetryEventType =
  | 'menu_opened'
  | 'destination_selected'
  | 'attraction_card_viewed'
  | 'attraction_selected'
  | 'filter_used'
  | 'ticket_cta_visible'
  | 'ticket_cta_clicked'
  | 'download_profile_clicked'
  | 'event_selected'
  | 'motion_fallback_used'
  | 'capability_tier_changed'
  | 'reduced_motion_triggered'
  | 'webgl_unavailable_triggered'
  | 'scene_load_failure';

export interface TelemetryEvent {
  event: TelemetryEventType;
  timestamp: string;
  payload?: Record<string, any>;
}
