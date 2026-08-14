export type CapabilityTier = 'full' | 'balanced' | 'minimal';

export interface ViewportCapability {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
}

export interface MotionCapabilityState {
  tier: CapabilityTier;
  isWebGLAvailable: boolean;
  isWebGL2Available: boolean;
  isReducedMotion: boolean;
  isDataSaver: boolean;
  isTouch: boolean;
  isLowPower: boolean;
  viewport: ViewportCapability;
  isHydrated: boolean;
  setTierOverride: (tier: CapabilityTier | null) => void;
}

export type RevealDirection =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-start'
  | 'slide-end'
  | 'scale';

export interface MotionTokenConfig {
  duration: {
    fast: number;
    base: number;
    smooth: number;
    cinematic: number;
    slow: number;
  };
  ease: {
    smooth: [number, number, number, number];
    snappy: [number, number, number, number];
    cinematic: [number, number, number, number];
    bounce: [number, number, number, number];
    gsapSmooth: string;
    gsapSnappy: string;
    gsapCinematic: string;
  };
  spring: {
    snappy: { stiffness: number; damping: number; mass?: number };
    gentle: { stiffness: number; damping: number; mass?: number };
    bouncy: { stiffness: number; damping: number; mass?: number };
  };
  stagger: {
    fast: number;
    base: number;
    slow: number;
  };
}
