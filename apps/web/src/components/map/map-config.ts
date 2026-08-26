import type { StyleSpecification } from 'maplibre-gl';

export const ALLOWED_MAP_STYLE_ORIGINS = [
  'tiles.openfreemap.org',
  'demotiles.maplibre.org',
  'server.arcgisonline.com',
  'services.arcgisonline.com',
  'tile.openstreetmap.org',
  'basemaps.cartocdn.com',
  'a.basemaps.cartocdn.com',
  'b.basemaps.cartocdn.com',
  'c.basemaps.cartocdn.com',
  'd.basemaps.cartocdn.com'
];

// Pristine OpenFreeMap Dark Style (100% Free, Zero API Key, Zero Watermark, Hardware Accelerated Vector Tiles)
export const OPENFREEMAP_DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

// Pristine OpenFreeMap Bright Style (100% Free, Zero API Key, Zero Watermark)
export const OPENFREEMAP_BRIGHT_STYLE = 'https://tiles.openfreemap.org/styles/bright';

// ESRI Dark Gray Canvas Raster Spec (100% Free Public CDN, Zero Watermark, Zero API Key)
export const ESRI_DARK_GRAY_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-dark': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'esri-dark-layer',
      type: 'raster',
      source: 'esri-dark',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

// OpenStreetMap Standard Raster Spec (100% Free, Zero Watermark, Zero API Key)
export const OSM_STANDARD_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-standard': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm-standard-layer',
      type: 'raster',
      source: 'osm-standard',
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

// Backward-compatible style aliases pointing to clean, non-watermarked providers
export const CARTO_DARK_MAP_STYLE = ESRI_DARK_GRAY_MAP_STYLE;
export const VOYAGER_ENGLISH_MAP_STYLE = OSM_STANDARD_MAP_STYLE;

// Default dark and light map styles (Inlined StyleSpecification for 0ms instant render & zero watermark)
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
