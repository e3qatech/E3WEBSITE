import type { StyleSpecification } from 'maplibre-gl';

export const ALLOWED_MAP_STYLE_ORIGINS = [
  'tiles.openfreemap.org',
  'demotiles.maplibre.org',
  'basemaps.cartocdn.com',
  'a.basemaps.cartocdn.com',
  'b.basemaps.cartocdn.com',
  'c.basemaps.cartocdn.com',
  'd.basemaps.cartocdn.com'
];

// High-contrast, bright, crystal-clear basemap with English international labels
export const VOYAGER_ENGLISH_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-voyager': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  },
  layers: [
    {
      id: 'carto-voyager-layer',
      type: 'raster',
      source: 'carto-voyager',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export const DARK_MAP_STYLE: StyleSpecification = VOYAGER_ENGLISH_MAP_STYLE;
export const LIGHT_MAP_STYLE: StyleSpecification = VOYAGER_ENGLISH_MAP_STYLE;

export function validateMapStyleUrl(url?: string): string | StyleSpecification {
  if (!url) return VOYAGER_ENGLISH_MAP_STYLE;

  try {
    const parsed = new URL(url);
    const originAllowed = ALLOWED_MAP_STYLE_ORIGINS.some(allowed => parsed.hostname === allowed || parsed.hostname.endsWith('.' + allowed));
    if (originAllowed) {
      return url;
    }
  } catch (_e) {
    console.warn(`[MAP_CONFIG_WARN] Invalid map style URL format: ${url}. Falling back to default English Voyager style.`);
  }

  return VOYAGER_ENGLISH_MAP_STYLE;
}
