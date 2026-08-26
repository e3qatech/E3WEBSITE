"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapGeoJSONCollection, MapLocationProperties } from './map-types';
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE, CARTO_DARK_MAP_STYLE, VOYAGER_ENGLISH_MAP_STYLE } from './map-config';
import { MapUnavailableFallback } from './MapUnavailableFallback';
import { Maximize, Box, Eye, Loader2, Sun, Moon } from 'lucide-react';
import { isMapLibreSupported, isValidLngLat } from '@/lib/webgl-capability';

interface AttractionMapCanvasProps {
  geoJson: MapGeoJSONCollection;
  selectedLocationId?: string;
  onSelectLocation: (location: MapLocationProperties) => void;
  locale: string;
}

type MapLifecycleState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

export function AttractionMapCanvas({
  geoJson,
  selectedLocationId,
  onSelectLocation,
  locale,
}: AttractionMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isMountedRef = useRef<boolean>(true);
  const maplibreglRef = useRef<any>(null);

  const [lifecycleState, setLifecycleState] = useState<MapLifecycleState>('idle');
  const [pitch3d, setPitch3d] = useState(true);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');

  const isAr = locale === 'ar';

  // Helper to check for user's reduced motion preference
  const isReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Safe idempotent cleanup helper
  const performSafeCleanup = useCallback(() => {
    // 1. Remove markers
    if (markersRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach((marker) => {
        try {
          if (marker && typeof marker.remove === 'function') {
            marker.remove();
          }
        } catch (_e) {
          // Ignore marker cleanup exceptions
        }
      });
      markersRef.current = [];
    }

    // 2. Remove map instance
    if (mapInstanceRef.current) {
      try {
        if (typeof mapInstanceRef.current.remove === 'function') {
          mapInstanceRef.current.remove();
        }
      } catch (_e) {
        // Prevent 'Cannot read properties of undefined reading destroy' from propagating
      }
      mapInstanceRef.current = null;
    }
  }, []);

  // Fit all pins within visible bounding box
  const fitAllLocations = useCallback(() => {
    const map = mapInstanceRef.current;
    const maplibregl = maplibreglRef.current;
    if (!map || !maplibregl || lifecycleState !== 'ready') return;
    if (!geoJson?.features || geoJson.features.length === 0) return;

    try {
      const bounds = new maplibregl.LngLatBounds();
      let validPointsCount = 0;

      geoJson.features.forEach((feat) => {
        const [lng, lat] = feat.geometry.coordinates;
        if (isValidLngLat(lng, lat)) {
          bounds.extend([lng, lat]);
          validPointsCount++;
        }
      });

      if (validPointsCount > 0) {
        const reducedMotion = isReducedMotion();
        map.fitBounds(bounds, {
          padding: { top: 70, bottom: 70, left: 60, right: 60 },
          maxZoom: 13.5,
          pitch: pitch3d ? 50 : 0,
          duration: reducedMotion ? 0 : 1200,
        });
      }
    } catch (e) {
      console.warn('[MAP_FIT_BOUNDS_WARN]', e);
    }
  }, [geoJson, lifecycleState, pitch3d, isReducedMotion]);

  // Progressive Lazy Initialization with Capability Check & Error Boundary
  useEffect(() => {
    isMountedRef.current = true;

    // Step 1: Pre-flight WebGL/WebGL2 Capability Check
    if (!isMapLibreSupported()) {
      setLifecycleState('fallback');
      return;
    }

    let mapInstance: any = null;

    async function initializeMap() {
      if (!mapContainerRef.current || !isMountedRef.current) return;

      // Clean any stale instances
      performSafeCleanup();
      setLifecycleState('loading');

      try {
        // Dynamic import of maplibre-gl and its CSS to optimize bundle and isolate runtime
        const maplibreglModule = await import('maplibre-gl');
        await import('maplibre-gl/dist/maplibre-gl.css' as any);
        
        const maplibregl = (maplibreglModule as any).default || maplibreglModule;
        maplibreglRef.current = maplibregl;

        // Verify maplibregl runtime capability check
        if (typeof maplibregl.supported === 'function' && !maplibregl.supported({ failIfMajorPerformanceCaveat: false })) {
          if (isMountedRef.current) setLifecycleState('fallback');
          return;
        }

        mapInstance = new maplibregl.Map({
          container: mapContainerRef.current,
          style: mapTheme === 'dark' ? DARK_MAP_STYLE : LIGHT_MAP_STYLE,
          center: [51.48, 25.35],
          zoom: 10.5,
          pitch: pitch3d ? 50 : 0,
          bearing: pitch3d ? -15 : 0,
          cooperativeGestures: true,
          attributionControl: false,
          maxBounds: [
            [50.50, 24.40],
            [52.00, 26.20],
          ],
        });

        mapInstance.addControl(
          new maplibregl.NavigationControl({ showCompass: true, showZoom: false }),
          'bottom-right'
        );

        mapInstance.on('load', () => {
          if (!isMountedRef.current) {
            try {
              mapInstance.remove();
            } catch (_) {}
            return;
          }
          mapInstanceRef.current = mapInstance;
          setLifecycleState('ready');
          try {
            mapInstance.resize();
          } catch (_) {}
        });

        mapInstance.on('error', (e: any) => {
          console.warn('[MAPLIBRE_RUNTIME_WARN]', e);
        });

      } catch (err) {
        console.error('[MAP_INIT_FAILED]', err);
        if (isMountedRef.current) {
          setLifecycleState('fallback');
        }
        if (mapInstance) {
          try {
            mapInstance.remove();
          } catch (_) {}
        }
      }
    }

    initializeMap();

    return () => {
      isMountedRef.current = false;
      performSafeCleanup();
    };
  }, [performSafeCleanup, pitch3d, mapTheme]);

  // Render HTML Custom High-Visibility Pins on Map (Only when ready)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const maplibregl = maplibreglRef.current;
    if (!map || !maplibregl || lifecycleState !== 'ready' || !isMountedRef.current) return;

    // Clear existing markers safely
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch (_) {}
    });
    markersRef.current = [];

    if (!geoJson?.features || geoJson.features.length === 0) return;

    geoJson.features.forEach((feat) => {
      const props = feat.properties;
      const [lng, lat] = feat.geometry.coordinates;

      if (!isValidLngLat(lng, lat)) return;

      const isSelected = props.locationId === selectedLocationId;

      let accentBg = 'bg-blue-600';
      let shadowGlow = 'shadow-blue-500/50';

      if (props.pinColorToken === 'GOLD') {
        accentBg = 'bg-amber-500';
        shadowGlow = 'shadow-amber-500/50';
      } else if (props.pinColorToken === 'PURPLE') {
        accentBg = 'bg-purple-600';
        shadowGlow = 'shadow-purple-500/50';
      } else if (props.pinColorToken === 'AMBER') {
        accentBg = 'bg-orange-500';
        shadowGlow = 'shadow-orange-500/50';
      }

      const el = document.createElement('div');
      el.className = `group relative cursor-pointer z-20 transition-all duration-300 ${
        isSelected ? 'z-40 scale-110' : 'hover:z-30 hover:scale-105'
      }`;
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${isAr ? props.nameAr || props.nameEn : props.nameEn || props.nameAr}`);

      const titleText = isAr ? props.nameAr || props.nameEn : props.nameEn || props.nameAr;

      el.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="px-2.5 py-1 rounded-full bg-slate-900/95 text-white border border-white/20 text-[10px] font-bold font-sans tracking-wide shadow-2xl backdrop-blur-md mb-1 flex items-center gap-1.5 max-w-[130px] group-hover:max-w-[200px] transition-all duration-300 ${
            isSelected ? 'ring-2 ring-amber-400 text-amber-300 max-w-[200px]' : ''
          }">
            <span class="w-2 h-2 rounded-full ${accentBg} shrink-0"></span>
            <span class="truncate">${titleText}</span>
          </div>

          <div class="relative w-8 h-8 rounded-full ${accentBg} border-2 border-white shadow-xl ${shadowGlow} flex items-center justify-center text-white shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div class="absolute -inset-1 rounded-full ${accentBg} opacity-30 animate-ping"></div>
          </div>
        </div>
      `;

      const handleSelect = (e: Event) => {
        e.stopPropagation();
        onSelectLocation(props);
      };

      el.addEventListener('click', handleSelect);
      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectLocation(props);
        }
      });

      try {
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map);

        markersRef.current.push(marker);
      } catch (err) {
        console.warn('[MAP_MARKER_ADD_WARN]', err);
      }
    });

    fitAllLocations();
  }, [geoJson, lifecycleState, selectedLocationId, isAr, onSelectLocation, fitAllLocations]);

  // Safe Camera Movement on Selection
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || lifecycleState !== 'ready' || !selectedLocationId || !geoJson?.features) return;

    const targetFeature = geoJson.features.find(
      (f) => f.properties.locationId === selectedLocationId || f.id === selectedLocationId
    );

    if (targetFeature) {
      const [lng, lat] = targetFeature.geometry.coordinates;
      if (isValidLngLat(lng, lat)) {
        const reducedMotion = isReducedMotion();
        try {
          if (reducedMotion) {
            map.jumpTo({
              center: [lng, lat],
              zoom: 14,
              pitch: pitch3d ? 55 : 0,
            });
          } else {
            map.flyTo({
              center: [lng, lat],
              zoom: 14,
              pitch: pitch3d ? 55 : 0,
              speed: 1.3,
              curve: 1.4,
              essential: true,
            });
          }
        } catch (e) {
          console.warn('[MAP_FLYTO_WARN]', e);
        }
      }
    }
  }, [selectedLocationId, geoJson, lifecycleState, pitch3d, isReducedMotion]);

  const toggle3D = () => {
    const map = mapInstanceRef.current;
    if (!map || lifecycleState !== 'ready') return;
    const next = !pitch3d;
    setPitch3d(next);
    const reducedMotion = isReducedMotion();
    try {
      map.easeTo({
        pitch: next ? 55 : 0,
        bearing: next ? -15 : 0,
        duration: reducedMotion ? 0 : 1000,
      });
    } catch (_) {}
  };

  const toggleMapTheme = () => {
    setMapTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Render Fallback if WebGL/MapLibre is unavailable or errored
  if (lifecycleState === 'fallback' || lifecycleState === 'error') {
    return (
      <MapUnavailableFallback
        locale={locale}
        geoJson={geoJson}
        selectedLocationId={selectedLocationId}
        onSelectLocation={onSelectLocation}
      />
    );
  }

  return (
    <div
      role="region"
      aria-label={isAr ? "خريطة قطر التفاعلية" : "Interactive Qatar Map"}
      className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[#07151b] shadow-2xl"
    >
      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

      {/* Loading Overlay */}
      {lifecycleState === 'loading' && (
        <div className="absolute inset-0 bg-[#07151b]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
          <span className="text-xs font-mono font-semibold text-zinc-300">
            {isAr ? "جاري تهيئة الخريطة التفاعلية..." : "Initializing Vector Cartography..."}
          </span>
        </div>
      )}

      {/* Top Action Controls */}
      <div className="absolute top-3 start-3 end-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
          <button
            type="button"
            onClick={fitAllLocations}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-[var(--e3-royal-blue)] text-white text-[11px] font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md transition-all shadow-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{isAr ? "عرض الكل" : "Show All Pins"}</span>
          </button>

          <button
            type="button"
            onClick={toggle3D}
            className={`px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all shadow-xl flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer ${
              pitch3d ? 'bg-[var(--e3-royal-blue)] text-white border-[var(--e3-royal-blue)]' : 'bg-slate-900/90 text-zinc-300 border-white/20'
            }`}
          >
            <Box className="w-3.5 h-3.5 shrink-0" />
            <span>{pitch3d ? '3D' : '2D'}</span>
          </button>

          <button
            type="button"
            onClick={toggleMapTheme}
            title={isAr ? "تبديل مظهر الخريطة (داكن / فاتح)" : "Toggle Map Style (Dark / Light)"}
            className="px-3 py-1.5 rounded-xl border border-white/20 bg-slate-900/90 hover:bg-slate-800 text-zinc-300 hover:text-white backdrop-blur-md transition-all shadow-xl flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer"
          >
            {mapTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-sky-300" />}
            <span>{mapTheme === 'dark' ? (isAr ? "فاتح" : "Light") : (isAr ? "داكن" : "Dark")}</span>
          </button>
        </div>

        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={fitAllLocations}
            title={isAr ? "إعادة ضبط المعاينة" : "Fit All Locations Bounds"}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-[var(--e3-royal-blue)] text-white border border-white/20 backdrop-blur-md transition-all shadow-lg cursor-pointer"
          >
            <Maximize className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Bottom Overlay Frame: Hides map branding & provides live status overlay */}
      <div className="absolute bottom-0 start-0 end-0 z-20 h-14 bg-gradient-to-t from-[#07151b] via-[#07151b]/95 to-[#07151b]/40 backdrop-blur-md border-t border-white/10 px-5 flex items-center justify-between pointer-events-auto rounded-b-3xl">
        {/* Left / Start: Live Grid Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            {isAr ? "شبكة قطر للترفيه التفاعلي" : "LIVE QATAR ENTERTAINMENT GRID"}
          </span>
        </div>

        {/* Right / End: Active Pin Count Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-[11px] font-mono font-extrabold text-[var(--e3-royal-blue)] uppercase tracking-wider backdrop-blur-md shadow-xs">
            {geoJson?.features?.length || 0} {isAr ? "وجهات نشطة" : "ACTIVE DESTINATIONS"}
          </div>
        </div>
      </div>
    </div>
  );
}

