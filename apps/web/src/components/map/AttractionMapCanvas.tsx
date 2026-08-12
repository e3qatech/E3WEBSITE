"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapGeoJSONCollection, MapLocationProperties } from './map-types';
import { VOYAGER_ENGLISH_MAP_STYLE } from './map-config';
import { MapUnavailableFallback } from './MapUnavailableFallback';
import { Compass, Layers, Maximize, Box, MapPin, Eye } from 'lucide-react';

interface AttractionMapCanvasProps {
  geoJson: MapGeoJSONCollection;
  selectedLocationId?: string;
  onSelectLocation: (location: MapLocationProperties) => void;
  locale: string;
}

export function AttractionMapCanvas({ geoJson, selectedLocationId, onSelectLocation, locale }: AttractionMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [pitch3d, setPitch3d] = useState(true); // Default 3D perspective enabled
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const isAr = locale === 'ar';

  // Initialize MapLibre GL Canvas with 3D Perspective
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: VOYAGER_ENGLISH_MAP_STYLE,
        center: [51.48, 25.35], // Qatar Center
        zoom: 10.5,
        pitch: pitch3d ? 50 : 0, // 3D Pitch
        bearing: pitch3d ? -15 : 0, // 3D Bearing Angle
        cooperativeGestures: true, // Enable cooperative mobile scrolling (two fingers for map pan)
        maxBounds: [
          [50.50, 24.40],
          [52.00, 26.20]
        ]
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), 'bottom-right');

      map.on('load', () => {
        setMapLoaded(true);
        setMapError(false);
        map.resize();
      });

      map.on('error', (e) => {
        console.warn('[MAPLIBRE_TILE_WARN]', e);
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('[MAP_INIT_ERROR]', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fit All Pins Bounds Function
  const fitAllLocations = () => {
    if (!mapInstanceRef.current || !geoJson?.features || geoJson.features.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    geoJson.features.forEach((feat) => {
      bounds.extend(feat.geometry.coordinates as [number, number]);
    });

    mapInstanceRef.current.fitBounds(bounds, {
      padding: { top: 70, bottom: 70, left: 60, right: 60 },
      maxZoom: 13.5,
      pitch: pitch3d ? 50 : 0,
      duration: 1200
    });
  };

  // Render HTML Custom High-Visibility Pins on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!geoJson?.features || geoJson.features.length === 0) return;

    const map = mapInstanceRef.current;

    geoJson.features.forEach((feat) => {
      const props = feat.properties;
      const [lng, lat] = feat.geometry.coordinates;
      const isSelected = props.locationId === selectedLocationId;

      // Color Token Determination
      let accentBg = 'bg-blue-600';
      let accentBorder = 'border-blue-400';
      let shadowGlow = 'shadow-blue-500/50';

      if (props.pinColorToken === 'GOLD') {
        accentBg = 'bg-amber-500';
        accentBorder = 'border-amber-300';
        shadowGlow = 'shadow-amber-500/50';
      } else if (props.pinColorToken === 'PURPLE') {
        accentBg = 'bg-purple-600';
        accentBorder = 'border-purple-300';
        shadowGlow = 'shadow-purple-500/50';
      } else if (props.pinColorToken === 'AMBER') {
        accentBg = 'bg-orange-500';
        accentBorder = 'border-orange-300';
        shadowGlow = 'shadow-orange-500/50';
      }

      // Build DOM Pin Element
      const el = document.createElement('div');
      el.className = `group relative cursor-pointer z-20 transition-transform duration-300 ${isSelected ? 'scale-125 z-30' : 'hover:scale-115'}`;

      const titleText = isAr ? (props.nameAr || props.nameEn) : (props.nameEn || props.nameAr);
      const venueText = isAr ? (props.venue || props.address) : (props.venue || props.address);

      el.innerHTML = `
        <div class="flex flex-col items-center">
          <!-- Label Pill Badge -->
          <div class="px-2.5 py-1 rounded-full bg-slate-900/90 text-white border border-white/20 text-[11px] font-bold font-sans tracking-wide shadow-2xl backdrop-blur-md mb-1.5 whitespace-nowrap flex items-center gap-1.5 ${isSelected ? 'ring-2 ring-amber-400 text-amber-300' : ''}">
            <span class="w-2 h-2 rounded-full ${accentBg}"></span>
            <span>${titleText}</span>
          </div>

          <!-- Pin Pointer Circle -->
          <div class="relative w-9 h-9 rounded-full ${accentBg} border-2 border-white shadow-xl ${shadowGlow} flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div class="absolute -inset-1 rounded-full ${accentBg} opacity-30 animate-ping"></div>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectLocation(props);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Auto-fit all pins on first load
    fitAllLocations();

  }, [geoJson, mapLoaded, selectedLocationId]);

  // Camera FlyTo Selected Pin
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocationId || !geoJson?.features) return;

    const targetFeature = geoJson.features.find((f) => f.properties.locationId === selectedLocationId || f.id === selectedLocationId);
    if (targetFeature) {
      const [lng, lat] = targetFeature.geometry.coordinates;
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        pitch: pitch3d ? 55 : 0,
        speed: 1.3,
        curve: 1.4,
        essential: true
      });
    }
  }, [selectedLocationId, geoJson]);

  const toggle3D = () => {
    if (!mapInstanceRef.current) return;
    const next = !pitch3d;
    setPitch3d(next);
    mapInstanceRef.current.easeTo({
      pitch: next ? 55 : 0,
      bearing: next ? -15 : 0,
      duration: 1000
    });
  };

  if (mapError) {
    return <MapUnavailableFallback locale={locale} />;
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[#090514] shadow-2xl">
      {/* MapLibre WebGL Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

      {/* Top Action Bar: Show All Pins & 3D Toggle */}
      <div className="absolute top-4 start-4 z-20 flex items-center gap-2">
        <button
          onClick={fitAllLocations}
          className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-[var(--e3-royal-blue)] text-white text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md transition-all shadow-xl flex items-center gap-2 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span>{isAr ? "عرض كافة الوجهات على الخريطة" : "Show All Locations on Map"}</span>
        </button>

        <button
          onClick={toggle3D}
          className={`px-3.5 py-2 rounded-xl border backdrop-blur-md transition-all shadow-xl flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer ${
            pitch3d ? 'bg-[var(--e3-royal-blue)] text-white border-[var(--e3-royal-blue)]' : 'bg-slate-900/90 text-zinc-300 border-white/20'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>{pitch3d ? '3D Active' : '2D Flat'}</span>
        </button>
      </div>

      {/* Floating Controls Right */}
      <div className="absolute top-4 end-4 z-20 flex flex-col gap-2">
        <button
          onClick={fitAllLocations}
          title="Fit All Locations Bounds"
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-[var(--e3-royal-blue)] text-white border border-white/20 backdrop-blur-md transition-all shadow-lg cursor-pointer"
        >
          <Maximize className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-2 start-2 z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300">
        &copy; <a href="https://carto.com" target="_blank" rel="noreferrer" className="underline hover:text-white">CARTO Voyager</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-white">OpenStreetMap</a>
      </div>
    </div>
  );
}
