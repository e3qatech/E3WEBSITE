"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapGeoJSONCollection, MapGeoJSONFeature, MapLocationProperties } from './map-types';
import { Compass, Layers, Maximize2, Minus, Plus } from 'lucide-react';

const DEFAULT_DARK_STYLE = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/dark';
const DEFAULT_LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/bright';

interface AttractionMapCanvasProps {
  geoJson: MapGeoJSONCollection;
  selectedLocationId?: string;
  onSelectLocation: (location: MapLocationProperties) => void;
  locale: string;
}

export function AttractionMapCanvas({ geoJson, selectedLocationId, onSelectLocation, locale }: AttractionMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  const [currentStyle, setCurrentStyle] = useState(DEFAULT_DARK_STYLE);
  const [pitch3d, setPitch3d] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: currentStyle,
      center: [51.48, 25.35], // Center Qatar
      zoom: 10.5,
      pitch: pitch3d ? 45 : 0,
      bearing: 0,
      maxBounds: [
        [50.50, 24.40], // SW Qatar bounds
        [52.00, 26.20]  // NE Qatar bounds
      ]
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentStyle]);

  // Update Vector GeoJSON Source & Pin Layers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;

    // Remove existing layers & source if present
    if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
    if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
    if (map.getLayer('clusters')) map.removeLayer('clusters');
    if (map.getSource('locations')) map.removeSource('locations');

    map.addSource('locations', {
      type: 'geojson',
      data: geoJson as any,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Clusters Layer
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'locations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#1a1fd6',
          3,
          '#8b5cf6',
          7,
          '#f59e0b'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18,
          3,
          24,
          7,
          30
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Cluster Count Label
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'locations',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Individual Vector Pins
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'locations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'pinColorToken'],
          'GOLD', '#f59e0b',
          'PURPLE', '#8b5cf6',
          'AMBER', '#d97706',
          '#1a1fd6' // default E3 cyan/blue
        ],
        'circle-radius': 10,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Inspect Cluster on Click
    map.on('click', 'clusters', (e: any) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      const source = map.getSource('locations') as maplibregl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom
        });
      }).catch(() => {});
    });

    // Select Pin on Click
    map.on('click', 'unclustered-point', (e: any) => {
      if (!e.features || e.features.length === 0) return;
      const props = e.features[0].properties as unknown as MapLocationProperties;
      onSelectLocation(props);
    });

    // Cursor Styling
    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });

  }, [geoJson, mapLoaded]);

  // Fly to Selected Location Coordinates
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocationId || !geoJson?.features) return;

    const targetFeature = geoJson.features.find((f) => f.properties.locationId === selectedLocationId || f.id === selectedLocationId);
    if (targetFeature) {
      const [lng, lat] = targetFeature.geometry.coordinates;
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 13.5,
        speed: 1.2,
        curve: 1.4,
        essential: true
      });
    }
  }, [selectedLocationId, geoJson]);

  const toggle3D = () => {
    if (!mapInstanceRef.current) return;
    const next = !pitch3d;
    setPitch3d(next);
    mapInstanceRef.current.easeTo({ pitch: next ? 45 : 0, duration: 1000 });
  };

  const toggleStyle = () => {
    const nextStyle = currentStyle === DEFAULT_DARK_STYLE ? DEFAULT_LIGHT_STYLE : DEFAULT_DARK_STYLE;
    setCurrentStyle(nextStyle);
  };

  const resetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ center: [51.48, 25.35], zoom: 10.5, pitch: 0 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[#050110] shadow-2xl">
      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-0" />

      {/* Floating Interactive Map Tools */}
      <div className="absolute top-4 end-4 z-10 flex flex-col gap-2">
        <button
          onClick={resetCenter}
          title="Reset Qatar Camera"
          className="p-2.5 rounded-xl bg-black/80 hover:bg-[var(--e3-royal-blue)] text-white border border-white/10 backdrop-blur-md transition-all shadow-lg cursor-pointer"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={toggle3D}
          title="Toggle 3D Pitch View"
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-lg cursor-pointer font-mono text-xs font-bold ${
            pitch3d ? 'bg-[var(--e3-royal-blue)] text-white border-[var(--e3-royal-blue)]' : 'bg-black/80 text-white border-white/10'
          }`}
        >
          3D
        </button>

        <button
          onClick={toggleStyle}
          title="Toggle Map Style (Dark/Bright)"
          className="p-2.5 rounded-xl bg-black/80 hover:bg-zinc-800 text-white border border-white/10 backdrop-blur-md transition-all shadow-lg cursor-pointer"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* OpenFreeMap Attribution Footer */}
      <div className="absolute bottom-2 start-2 z-10 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-zinc-400">
        &copy; <a href="https://openfreemap.org" target="_blank" rel="noreferrer" className="underline hover:text-white">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-white">OpenStreetMap</a>
      </div>
    </div>
  );
}
