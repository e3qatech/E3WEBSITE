import type { StyleSpecification } from 'maplibre-gl';

export const ALLOWED_MAP_STYLE_ORIGINS = [
  'tiles.openfreemap.org',
  'demotiles.maplibre.org',
  'basemaps.cartocdn.com',
  'a.basemaps.cartocdn.com',
  'b.basemaps.cartocdn.com',
  'c.basemaps.cartocdn.com',
  'd.basemaps.cartocdn.com',
  'tile.openstreetmap.org'
];

// Dark Matter Map Style (Direct inlined StyleSpecification for instant 0ms load without network JSON blocking)
export const CARTO_DARK_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

// High-contrast Light Map Style
export const VOYAGER_ENGLISH_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-voyager': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
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

export const DARK_MAP_STYLE = CARTO_DARK_MAP_STYLE;
export const LIGHT_MAP_STYLE = VOYAGER_ENGLISH_MAP_STYLE;

export function validateMapStyleUrl(url?: string): string | StyleSpecification {
  if (!url) return DARK_MAP_STYLE;

  try {
    const parsed = new URL(url);
    const originAllowed = ALLOWED_MAP_STYLE_ORIGINS.some(
      (allowed) => parsed.hostname === allowed || parsed.hostname.endsWith('.' + allowed)
    );
    if (originAllowed) {
      return url;
    }
  } catch (_e) {
    console.warn(`[MAP_CONFIG_WARN] Invalid map style URL format: ${url}. Falling back to default style.`);
  }

  return DARK_MAP_STYLE;
}
