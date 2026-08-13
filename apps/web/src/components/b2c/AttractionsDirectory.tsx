"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Ticket, 
  ArrowRight,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  Compass,
  Navigation
} from 'lucide-react';
import Link from 'next/link';
import { Attraction } from '@/store/useAttractionsStore';
import { AttractionMapCanvas } from '../map/AttractionMapCanvas';
import { AttractionMapFilters } from '../map/AttractionMapFilters';
import { AttractionLocationCard } from '../map/AttractionLocationCard';
import { useNearestLocations } from '@/hooks/useNearestLocations';
import { MapGeoJSONCollection, MapGeoJSONFeature } from '../map/map-types';

interface AttractionsDirectoryProps {
  initialAttractions: Attraction[];
  locale: string;
}

import { FALLBACK_ATTRACTIONS } from '@/lib/fallback-attractions';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// -------------------------------------------------------------
// SECTION 2: AVAILABLE ATTRACTIONS GRID
// -------------------------------------------------------------
export function AttractionsGridSection({ initialAttractions, locale }: AttractionsDirectoryProps) {
  const isAr = locale === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayList = useMemo(() => {
    return (initialAttractions && initialAttractions.length > 0) ? initialAttractions : FALLBACK_ATTRACTIONS;
  }, [initialAttractions]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    displayList.forEach(a => { if ((a as any).category) set.add((a as any).category); });
    return ['ALL', ...Array.from(set)];
  }, [displayList]);

  const filteredAttractions = useMemo(() => {
    return displayList.filter(item => {
      const matchCategory = selectedCategory === 'ALL' || (item as any).category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        (item.nameEn || '').toLowerCase().includes(q) ||
        (item.nameAr || '').toLowerCase().includes(q) ||
        (item.taglineEn || '').toLowerCase().includes(q) ||
        (item.taglineAr || '').toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [displayList, selectedCategory, searchQuery]);

  return (
    <section className="relative py-16 bg-[#05020c] border-b border-[var(--border-level-2)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[var(--e3-royal-blue)]" />
              <span>{isAr ? "جميع الوجهات والفعاليات" : "EXPLORE ALL ATTRACTIONS"}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "الوجهات الترفيهية المتاحة" : "Available Entertainment Worlds"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium max-w-2xl mt-2">
              {isAr
                ? "تصفح أحدث تجارب إي ثري الترفيهية والتفاعلية في قطر واكتشف المواعيد والأسعار والتفاصيل."
                : "Discover cutting-edge interactive entertainment, inflatable obstacle courses, VR arenas, and karting tracks."}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-tertiary)] bg-[var(--surface-default)] px-4 py-2 rounded-xl border border-[var(--border-level-2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{filteredAttractions.length} {isAr ? "وجهة نشطة" : "Active Worlds"}</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--surface-default)] p-4 rounded-2xl border border-[var(--border-level-2)]">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute top-3 start-3.5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "بحث عن وجهة أو تجربة..." : "Search attractions..."}
              className="w-full ps-10 pe-4 py-2.5 bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[var(--e3-royal-blue)] text-white shadow-lg shadow-[var(--e3-royal-blue)]/20'
                      : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-level-2)]'
                  }`}
                >
                  {cat === 'ALL' ? (isAr ? 'الكل' : 'ALL WORLDS') : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attractions Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAttractions.map((attr) => {
            const name = isAr ? attr.nameAr : attr.nameEn;
            const tagline = isAr ? attr.taglineAr : attr.taglineEn;
            const ops = attr.operations || {};
            const locationName = (isAr ? ops.locationNameAr : ops.locationNameEn) || ops.locationNameEn || "Lusail, Qatar";

            return (
              <motion.div
                key={attr.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] overflow-hidden shadow-xl hover:border-[var(--e3-royal-blue)] transition-all flex flex-col justify-between"
              >
                {/* Media Image Holder */}
                <div className="relative h-60 w-full overflow-hidden bg-black">
                  <img
                    src={attr.heroMediaUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176'}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-black/20 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 start-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold uppercase text-[var(--e3-royal-blue)]">
                    {(attr as any).category || "ATTRACTION"}
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 end-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-mono font-bold uppercase text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{isAr ? "مفتوح الآن" : "OPEN NOW"}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-display uppercase tracking-tight text-[var(--text-primary)] group-hover:text-[var(--e3-royal-blue)] transition-colors">
                      {name}
                    </h3>
                    {tagline && (
                      <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2 leading-relaxed">
                        {tagline}
                      </p>
                    )}
                  </div>

                  {/* Operational Details Bar */}
                  <div className="pt-3 border-t border-[var(--border-level-2)] grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[var(--e3-royal-blue)] shrink-0" />
                      <span className="truncate">{locationName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{ops.openingTime || "14:00"} - {ops.closingTime || "23:00"}</span>
                    </div>
                  </div>

                  <Link
                    href={attr.ticketingUrl || `/${locale}/b2c/calendar`}
                    className="w-full py-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-[var(--text-primary)] hover:text-white border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group/btn"
                  >
                    <Ticket className="w-3.5 h-3.5 text-[var(--e3-royal-blue)] group-hover/btn:text-white transition-colors" />
                    <span>{isAr ? "حجز التذاكر والمواعيد" : "Book Passes & Tickets"}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// SECTION 3: MAPLIBRE GL JS + OPENFREEMAP VECTOR CARTOGRAPHY SECTION
// -------------------------------------------------------------
export function AttractionsMapSection({ initialAttractions, locale }: AttractionsDirectoryProps) {
  const isAr = locale === 'ar';
  const { userCoords, loading: locating, requestLocation, calculateDistance } = useNearestLocations();

  const [geoJson, setGeoJson] = useState<MapGeoJSONCollection>({ type: 'FeatureCollection', features: [] });
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    async function loadMapData() {
      const attractionsList = (initialAttractions && initialAttractions.length > 0) ? initialAttractions : FALLBACK_ATTRACTIONS;

      try {
        const res = await fetch(`/api/public/locations/map?locale=${locale}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.features && json.features.length > 0) {
            setGeoJson(json);
            if (!selectedLocationId) {
              setSelectedLocationId(json.features[0].properties.locationId);
            }
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load public map GeoJSON', e);
      }

      // Guaranteed Fallback: Construct GeoJSON from attractions list so pins ALWAYS render
      const fallbackFeatures: MapGeoJSONFeature[] = attractionsList.map((attr, idx) => ({
        type: 'Feature',
        id: attr.id || `attr-${idx}`,
        geometry: {
          type: 'Point',
          coordinates: [
            attr.operations?.lng || attr.coordinates?.lng || (51.5305 + idx * 0.01),
            attr.operations?.lat || attr.coordinates?.lat || (25.4180 - idx * 0.01)
          ]
        },
        properties: {
          locationId: attr.id || `attr-${idx}`,
          slug: attr.slug || 'attraction',
          name: (locale === 'ar' ? attr.nameAr : attr.nameEn) || attr.nameEn || 'Attraction',
          nameEn: attr.nameEn || 'Attraction',
          nameAr: attr.nameAr || 'وجهة ترفيهية',
          venue: (locale === 'ar' ? attr.operations?.locationNameAr : attr.operations?.locationNameEn) || attr.operations?.locationNameEn || 'Qatar',
          address: (locale === 'ar' ? attr.operations?.locationNameAr : attr.operations?.locationNameEn) || 'Qatar',
          locationType: 'PERMANENT_ATTRACTION',
          operationalStatus: 'OPEN',
          thumbnailUrl: attr.heroMediaUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176',
          pinColorToken: idx === 0 ? 'CYAN' : idx === 1 ? 'GOLD' : idx === 2 ? 'PURPLE' : 'AMBER',
          featured: true,
          attractionCount: 1,
          latitude: attr.operations?.lat || attr.coordinates?.lat || (25.4180 - idx * 0.01),
          longitude: attr.operations?.lng || attr.coordinates?.lng || (51.5305 + idx * 0.01),
          ticketingUrl: attr.ticketingUrl || `/${locale}/b2c/calendar`,
          googleMapsUrl: `https://maps.google.com/?q=${attr.operations?.lat || 25.4180},${attr.operations?.lng || 51.5305}`
        }
      }));

      setGeoJson({ type: 'FeatureCollection', features: fallbackFeatures });
      if (fallbackFeatures.length > 0 && !selectedLocationId) {
        setSelectedLocationId(fallbackFeatures[0].properties.locationId);
      }
    }
    loadMapData();
  }, [locale, initialAttractions]);

  const filteredFeatures = useMemo(() => {
    if (!geoJson?.features) return [];
    return geoJson.features.filter((feat) => {
      const p = feat.properties;
      const q = searchQuery.toLowerCase().trim();

      const matchCategory =
        selectedCategory === 'ALL' ||
        (selectedCategory === 'OPEN_NOW' && p.operationalStatus === 'OPEN') ||
        p.locationType === selectedCategory;

      const matchSearch =
        !q ||
        (p.nameEn || '').toLowerCase().includes(q) ||
        (p.nameAr || '').toLowerCase().includes(q) ||
        (p.venue || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q);

      return matchCategory && matchSearch;
    }).map((feat) => {
      if (userCoords) {
        const dist = calculateDistance(feat.geometry.coordinates[1], feat.geometry.coordinates[0]);
        return {
          ...feat,
          properties: {
            ...feat.properties,
            distanceKm: dist ?? undefined
          }
        };
      }
      return feat;
    });
  }, [geoJson, searchQuery, selectedCategory, userCoords, calculateDistance]);

  const filteredGeoJson: MapGeoJSONCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: filteredFeatures
  }), [filteredFeatures]);

  const selectedLocation = useMemo(() => {
    const feat = filteredFeatures.find((f) => f.properties.locationId === selectedLocationId || f.id === selectedLocationId);
    return feat ? feat.properties : filteredFeatures[0]?.properties;
  }, [filteredFeatures, selectedLocationId]);

  return (
    <section id="interactive-attractions-map" className="relative py-20 bg-[var(--bg-level-2)] text-white border-t border-[var(--border-level-2)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[var(--border-level-2)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] mb-3">
              <MapIcon className="w-3.5 h-3.5 text-[var(--e3-royal-blue)]" />
              <span>{isAr ? "الخريطة التفاعلية الحية" : "INTERACTIVE ATTRACTIONS MAP"}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "خريطة الوجهات التفاعلية" : "Interactive Attractions Map"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium max-w-2xl mt-2">
              {isAr
                ? "تتبع كافة الوجهات الحية في قطر عبر الخريطة التفاعلية مع دعم تحديد الموقع وحساب المسافة المباشر."
                : "Explore all live entertainment destinations across Qatar powered by high-performance vector cartography."}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <AttractionMapFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onNearMeClick={requestLocation}
          locating={locating}
          userCoordsActive={Boolean(userCoords)}
          locale={locale}
        />

        {/* Split Grid: Map Canvas Right/Top & Location Cards Left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Location Cards Side Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4 max-h-[640px] overflow-y-auto pe-2 no-scrollbar">
            {filteredFeatures.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-[var(--text-tertiary)] font-medium">
                {isAr ? "لا توجد نتائج مطابقة لمحددات البحث." : "No matching location points found."}
              </div>
            ) : (
              filteredFeatures.map((feat) => (
                <AttractionLocationCard
                  key={feat.properties.locationId}
                  location={feat.properties}
                  isSelected={feat.properties.locationId === selectedLocation?.locationId}
                  onSelect={() => setSelectedLocationId(feat.properties.locationId)}
                  locale={locale}
                />
              ))
            )}
          </div>

          {/* MapLibre GL Vector Canvas (7 cols) */}
          <div className="lg:col-span-7 h-[640px] sticky top-24">
            <AttractionMapCanvas
              geoJson={filteredGeoJson}
              selectedLocationId={selectedLocation?.locationId}
              onSelectLocation={(locProps) => setSelectedLocationId(locProps.locationId)}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Backward compatibility export
export function AttractionsDirectory(props: AttractionsDirectoryProps) {
  return (
    <>
      <AttractionsGridSection {...props} />
      <AttractionsMapSection {...props} />
    </>
  );
}
