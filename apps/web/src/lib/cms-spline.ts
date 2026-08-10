export interface SplineMediaRecord {
  id: string
  name: string
  provider: 'SPLINE_VIEWER' | 'SPLINE_IFRAME'
  sceneUrl: string
  desktopSceneUrl?: string
  mobileSceneUrl?: string
  lightSceneUrl?: string
  darkSceneUrl?: string
  posterUrl?: string
  staticFallbackUrl?: string
  transparentBg: boolean
  followMouse: boolean
  scrollInteraction: boolean
  orbitEnabled: boolean
  panEnabled: boolean
  zoomEnabled: boolean
  pointerEventMode: 'none' | 'auto' | 'passthrough'
  loadingMode: 'lazy' | 'eager'
  qualityLevel: 'low' | 'medium' | 'high'
  accessibilityTitleEn?: string
  accessibilityTitleAr?: string
  reducedMotionFallbackUrl?: string
  status: 'DRAFT' | 'PUBLISHED'
}

export const ALLOWED_SPLINE_HOSTS = [
  'prod.spline.design',
  'my.spline.design',
  'cdn.spline.design'
]

export function validateSplineUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return ALLOWED_SPLINE_HOSTS.some(host => parsed.hostname.endsWith(host))
  } catch (_e) {
    return false
  }
}

export const DEFAULT_HERO_SPLINE: SplineMediaRecord = {
  id: "spline-hero-arrow",
  name: "Interactive E3 Hero Arrow 3D Scene",
  provider: "SPLINE_VIEWER",
  sceneUrl: "https://prod.spline.design/6Wq1Q7YGyM-m897C/scene.splinecode",
  posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
  transparentBg: true,
  followMouse: true,
  scrollInteraction: true,
  orbitEnabled: true,
  panEnabled: false,
  zoomEnabled: false,
  pointerEventMode: "passthrough",
  loadingMode: "lazy",
  qualityLevel: "high",
  accessibilityTitleEn: "3D Interactive E3 Brand Arrow",
  accessibilityTitleAr: "سهم إي ثري التفاعلي ثلاثي الأبعاد",
  status: "PUBLISHED"
}

export const DEFAULT_FOOTER_SPLINE: SplineMediaRecord = {
  id: "spline-footer-arrow",
  name: "Footer Floating E3 Arrow Mark",
  provider: "SPLINE_VIEWER",
  sceneUrl: "https://prod.spline.design/6Wq1Q7YGyM-m897C/scene.splinecode",
  posterUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop",
  transparentBg: true,
  followMouse: true,
  scrollInteraction: false,
  orbitEnabled: false,
  panEnabled: false,
  zoomEnabled: false,
  pointerEventMode: "passthrough",
  loadingMode: "lazy",
  qualityLevel: "medium",
  accessibilityTitleEn: "3D E3 Floating Footer Mark",
  accessibilityTitleAr: "علامة إي ثري العائمة في أسفل الصفحة",
  status: "PUBLISHED"
}
