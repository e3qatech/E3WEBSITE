export type SpatialMediaType = 'IMAGE' | 'VIDEO' | 'MODEL';
export type SpatialTextAlignment = 'LEFT' | 'CENTER' | 'RIGHT';
export type SpatialThemeMode = 'DARK' | 'LIGHT' | 'AUTO';

export interface SpatialMediaConfig {
  type: SpatialMediaType;
  url: string;
  posterUrl?: string;
  altEn?: string;
  altAr?: string;
  aspectRatio?: string;
}

export interface SpatialStatItem {
  valueEn: string;
  valueAr: string;
  labelEn: string;
  labelAr: string;
}

export interface SpatialTagItem {
  labelEn: string;
  labelAr: string;
  color?: string;
}

export interface SpatialSection {
  id: string;
  slug: string;
  sectionNumber: string; // e.g. "01", "02", ... "08"
  eyebrowEn: string;
  eyebrowAr: string;
  headingEn: string;
  headingAr: string;
  descriptionEn: string;
  descriptionAr: string;
  primaryCtaLabelEn: string;
  primaryCtaLabelAr: string;
  primaryCtaUrl: string;
  secondaryCtaLabelEn?: string;
  secondaryCtaLabelAr?: string;
  secondaryCtaUrl?: string;
  media?: SpatialMediaConfig;
  backgroundColor: string;
  accentColor: string;
  haloColor: string;
  textAlignment: SpatialTextAlignment;
  themeMode: SpatialThemeMode;
  visibility: boolean;
  sortOrder: number;
  stats?: SpatialStatItem[];
  tags?: SpatialTagItem[];
}

export interface SpatialScrollState {
  progress: number; // 0.0 to 1.0 across the entire scroll sequence
  activeIndex: number; // 0 to 7
  targetRotationX: number; // in radians (activeIndex * (2*PI/8))
  currentRotationX: number; // smoothed/damped rotation in radians
  scrollVelocity: number; // normalized velocity
  isPinned: boolean;
  isSettled: boolean;
  isReducedMotion: boolean;
}

export interface SpatialOctagonConfig {
  faceCount: number; // 8
  angleStep: number; // (2 * Math.PI) / 8 = Math.PI / 4 = 45 degrees
  radius: number; // 5.2 units from central axle
  faceWidth: number; // 12.0 units along X-axis
  faceHeight: number; // 4.31 units (2 * radius * tan(PI/8))
  hubCounterRotationRatio: number; // -0.30 (counter-rotates at 30% speed)
  cameraZ: number; // 7.8 units
  cameraFov: number; // 48 degrees
  pinHeightVh: number; // e.g. 700vh total scroll distance for 8 faces
}
