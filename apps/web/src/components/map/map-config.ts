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

// Pristine OpenFreeMap Dark Style (100% free, zero watermark, hardware accelerated vector tiles)
export const OPENFREEMAP_DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

// Pristine OpenFreeMap Bright Style
export const OPENFREEMAP_BRIGHT_STYLE = 'https://tiles.openfreemap.org/styles/bright';

// Fallback Dark Raster Spec (OpenStreetMap Carto tiles)
export const CARTO_DARK_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
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

// Fallback Bright Raster Spec
export const VOYAGER_ENGLISH_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-voyager': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
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

export const DARK_MAP_STYLE = OPENFREEMAP_DARK_STYLE;
export const LIGHT_MAP_STYLE = OPENFREEMAP_BRIGHT_STYLE;

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
