export const ALLOWED_MAP_STYLE_ORIGINS = [
  'tiles.openfreemap.org',
  'demotiles.maplibre.org',
  'basemaps.cartocdn.com'
];

export const DEFAULT_MAP_STYLE_DARK = process.env.NEXT_PUBLIC_MAP_STYLE_DARK || 'https://tiles.openfreemap.org/styles/dark';
export const DEFAULT_MAP_STYLE_LIGHT = process.env.NEXT_PUBLIC_MAP_STYLE_LIGHT || 'https://tiles.openfreemap.org/styles/positron';

export function validateMapStyleUrl(url?: string): string {
  if (!url) return DEFAULT_MAP_STYLE_DARK;

  try {
    const parsed = new URL(url);
    const originAllowed = ALLOWED_MAP_STYLE_ORIGINS.some(allowed => parsed.hostname === allowed || parsed.hostname.endsWith('.' + allowed));
    if (originAllowed) {
      return url;
    }
  } catch (_e) {
    console.warn(`[MAP_CONFIG_WARN] Invalid map style URL format: ${url}. Falling back to default dark style.`);
  }

  return DEFAULT_MAP_STYLE_DARK;
}
