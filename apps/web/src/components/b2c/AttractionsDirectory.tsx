"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  Compass, 
  Locate, 
  Sparkles, 
  ArrowRight, 
  Ticket, 
  ChevronRight,
  Map as MapIcon
} from 'lucide-react';
import Link from 'next/link';
import { AttractionMapCanvas } from '@/components/map/AttractionMapCanvas';
import { AttractionMapFilters } from '@/components/map/AttractionMapFilters';
import { AttractionLocationCard } from '@/components/map/AttractionLocationCard';
import { useNearestLocations } from '@/hooks/useNearestLocations';
import { MapGeoJSONCollection, MapLocationProperties } from '@/components/map/map-types';

export interface AttractionItem {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  taglineEn?: string;
  taglineAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  heroMediaUrl?: string;
  logoUrl?: string;
  ticketingUrl?: string;
  mapUrl?: string;
  coordinates?: { lat: number; lng: number };
  operations?: {
    openingTime?: string;
    closingTime?: string;
    locationNameEn?: string;
    locationNameAr?: string;
    is247?: boolean;
    openingSoon?: boolean;
    lat?: number;
    lng?: number;
  };
  features?: string[];
  category?: string;
}

interface AttractionsDirectoryProps {
  initialAttractions: AttractionItem[];
  locale: string;
}

export const FALLBACK_ATTRACTIONS: AttractionItem[] = [
  {
    id: "attr-inflatarun",
    slug: "inflatarun",
    nameEn: "InflataRUN World Record Course",
    nameAr: "مسار إنفلاتا ران للأرقام القياسية",
    taglineEn: "Guinness World Record 1,055m Inflatable Obstacle Course",
    taglineAr: "مسار العقبات المنفوخة الأطول في العالم بموسوعة جينيس",
    category: "INFLATABLE & OBSTACLE",
    heroMediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
    ticketingUrl: "/en/b2c/calendar",
    coordinates: { lat: 25.4180, lng: 51.5305 },
    operations: {
      openingTime: "15:00",
      closingTime: "23:00",
      locationNameEn: "Lusail Boulevard, Qatar",
      locationNameAr: "شارع لوسيل التجاري، قطر",
      lat: 25.4180,
      lng: 51.5305
    }
  },
  {
    id: "attr-kidscity",
    slug: "kids-city-driving-school",
    nameEn: "Kids City Driving Academy",
    nameAr: "أكاديمية قيادة مدينة الأطفال",
    taglineEn: "Interactive Junior Transport Simulation World",
    taglineAr: "عالم المحاكاة التفاعلية لقيادة الصغار في قطر",
    category: "THEME PARK & CARNIVAL",
    heroMediaUrl: "https://images.unsplash.com/photo-1566454825485-6923f545f111?q=80&w=1200&auto=format&fit=crop",
    ticketingUrl: "/en/b2c/calendar",
    coordinates: { lat: 25.3855, lng: 51.4550 },
    operations: {
      openingTime: "10:00",
      closingTime: "22:00",
      locationNameEn: "Doha Festival City, Qatar",
      locationNameAr: "دوحة فستيفال سيتي، قطر",
      lat: 25.3855,
      lng: 51.4550
    }
  },
  {
    id: "attr-cyberdome",
    slug: "cyberdome-vr",
    nameEn: "Cyberdome VR & Esports Arena",
    nameAr: "ساحة السايبردوم للواقع الافتراضي والألعاب",
    taglineEn: "Next-Gen 4D Haptic Motion Simulator Hub",
    taglineAr: "مركز أجهزة المحاكاة الحركية رباعية الأبعاد",
    category: "VR & CYBERSPORT",
    heroMediaUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop",
    ticketingUrl: "/en/b2c/calendar",
    coordinates: { lat: 25.4210, lng: 51.5230 },
    operations: {
      openingTime: "14:00",
      closingTime: "00:00",
      locationNameEn: "Place Vendôme Mall, Qatar",
      locationNameAr: "مول بلاس فاندوم، لوسيل",
      lat: 25.4210,
      lng: 51.5230
    }
  },
  {
    id: "attr-adrenaline",
    slug: "adrenaline-racing-circuit",
    nameEn: "Adrenaline Pro Karting Circuit",
    nameAr: "حلبة أدرينالين لسباقات الكارتينج",
    taglineEn: "High-Speed Electric Go-Karting Track",
    taglineAr: "حلبة كارتينج كهربائية عالية السرعة والإثارة",
    category: "KARTING & RACING",
    heroMediaUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop",
    ticketingUrl: "/en/b2c/calendar",
    coordinates: { lat: 25.2950, lng: 51.5120 },
    operations: {
      openingTime: "16:00",
      closingTime: "01:00",
      locationNameEn: "Al Bidda Park, Doha",
      locationNameAr: "حديقة البدع، الدوحة",
      lat: 25.2950,
      lng: 51.5120
    }
  },
  {
    id: "attr-splash",
    slug: "splash-kingdom",
    nameEn: "Splash Kingdom Water Experience",
    nameAr: "مملكة سبلاش للألعاب المائية",
    taglineEn: "Inflatable Ocean Waterpark & Aqua Tower",
    taglineAr: "مدينة الألعاب المائية والأبراج التفاعلية في الشاطئ",
    category: "WATER & SPLASH",
    heroMediaUrl: "https://images.unsplash.com/photo-1582650625119-3a31f8418b0d?q=80&w=1200&auto=format&fit=crop",
    ticketingUrl: "/en/b2c/calendar",
    coordinates: { lat: 25.3600, lng: 51.5250 },
    operations: {
      openingTime: "10:00",
      closingTime: "19:00",
      locationNameEn: "Katara Beach, Qatar",
      locationNameAr: "شاطئ كتارا، قطر",
      lat: 25.3600,
      lng: 51.5250
    }
  },
  {
    id: "attr-superpark",
    slug: "superpark-msheireb",
    nameEn: "SuperPark Msheireb Active Hub",
    nameAr: "سوبربارك مشيرب للنشاط والمغامرات",
    taglineEn: "All-in-One Indoor Multi-Sport & Trampoline Park",
    taglineAr: "مجمع الألعاب والأنشطة الرياضية والترامبولين المغطى",
    category: "THEME PARK & CARNIVAL",
    heroMediaUrl: "https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=1200&auto=format&fit=crop",
    ticketingUrl: "/en/b2c/calendar",
    coordinates: { lat: 25.2870, lng: 51.5280 },
    operations: {
      openingTime: "12:00",
      closingTime: "22:00",
      locationNameEn: "Msheireb Downtown Doha",
      locationNameAr: "مشيرب قلب الدوحة",
      lat: 25.2870,
      lng: 51.5280
    }
  }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getTimingStatus(attraction: AttractionItem, isAr: boolean) {
  const ops = attraction.operations || {};
  const openTime = ops.openingTime || "14:00";
  const closeTime = ops.closingTime || "23:00";
  const is24h = ops.is247 || (openTime === "00:00" && closeTime === "23:59");
  const openingSoon = ops.openingSoon;

  if (openingSoon) {
    return {
      status: "OPENING_SOON",
      label: isAr ? "افتتاح قريباً" : "OPENING SOON",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      dotClass: "bg-purple-400"
    };
  }

  if (is24h) {
    return {
      status: "ALWAYS_OPEN",
      label: isAr ? "متاح ٢٤/٧" : "OPEN 24/7",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      dotClass: "bg-emerald-400 animate-ping"
    };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  
  const openMinutes = (openH || 14) * 60 + (openM || 0);
  const closeMinutes = (closeH || 23) * 60 + (closeM || 0);

  const formattedOpen = new Date(2000, 0, 1, openH || 14, openM || 0).toLocaleTimeString(
    isAr ? 'ar-QA' : 'en-US', 
    { hour: 'numeric', minute: '2-digit' }
  );

  if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
    const minutesLeft = closeMinutes - currentMinutes;
    if (minutesLeft <= 90) {
      return {
        status: "CLOSING_SOON",
        label: isAr ? `يغلق قريباً (${Math.max(10, minutesLeft)} دقيقة)` : `CLOSING SOON (${Math.max(10, minutesLeft)}m left)`,
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        dotClass: "bg-amber-400 animate-pulse"
      };
    }
    return {
      status: "OPEN_NOW",
      label: isAr ? "مفتوح الآن" : "OPEN NOW",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      dotClass: "bg-emerald-400 animate-ping"
    };
  } else {
    return {
      status: "OPENS_AT",
      label: isAr ? `يفتح اليوم في ${formattedOpen}` : `OPENS AT ${formattedOpen}`,
      badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      dotClass: "bg-sky-400"
    };
  }
}

// -------------------------------------------------------------
// SECTION 2: ALL ATTRACTIONS AVAILABLE GRID SECTION
// -------------------------------------------------------------
export function AttractionsGridSection({ initialAttractions, locale }: AttractionsDirectoryProps) {
  const isAr = locale === 'ar';
  const list = initialAttractions.length > 0 ? initialAttractions : FALLBACK_ATTRACTIONS;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const categories = [
    { id: 'ALL', labelEn: 'All Attractions', labelAr: 'جميع الوجهات' },
    { id: 'INFLATABLE & OBSTACLE', labelEn: 'Inflatable & Obstacle', labelAr: 'عقبات منفوخة' },
    { id: 'THEME PARK & CARNIVAL', labelEn: 'Theme Parks & Cities', labelAr: 'مدن ترفيهية' },
    { id: 'VR & CYBERSPORT', labelEn: 'VR & Esports', labelAr: 'واقع افتراضي وألعاب' },
    { id: 'KARTING & RACING', labelEn: 'Karting & Racing', labelAr: 'كارتينج وسباقات' },
    { id: 'WATER & SPLASH', labelEn: 'Water & Splash', labelAr: 'ألعاب مائية' }
  ];

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert(isAr ? "خدمة تحديد الموقع غير مدعومة في متصفحك" : "Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setLocating(false);
      }
    );
  };

  const filteredAttractions = useMemo(() => {
    return list.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const nameEn = (item.nameEn || '').toLowerCase();
      const nameAr = (item.nameAr || '').toLowerCase();
      const tagEn = (item.taglineEn || '').toLowerCase();
      const tagAr = (item.taglineAr || '').toLowerCase();
      const locEn = (item.operations?.locationNameEn || '').toLowerCase();
      const locAr = (item.operations?.locationNameAr || '').toLowerCase();

      const matchSearch =
        !q ||
        nameEn.includes(q) ||
        nameAr.includes(q) ||
        tagEn.includes(q) ||
        tagAr.includes(q) ||
        locEn.includes(q) ||
        locAr.includes(q);

      return matchCat && matchSearch;
    });
  }, [list, selectedCategory, searchQuery]);

  return (
    <section id="all-attractions-grid" className="relative py-20 bg-[var(--bg-level-1)] text-white border-t border-[var(--border-level-2)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[var(--border-level-2)] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] mb-3">
              <Compass className="w-3.5 h-3.5 text-[var(--e3-royal-blue)]" />
              <span>{isAr ? "دليل وجهات إي ثري قطر" : "E3 QATAR ATTRACTIONS DIRECTORY"}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "الوجهات والفعاليات المتاحة" : "Available Attractions & Worlds"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium max-w-2xl mt-2">
              {isAr
                ? "تصفح كافة الوجهات الترفيهية الحية، ساعات العمل، المسافة من موقعك، وحجز التذاكر المباشر."
                : "Explore all active attraction worlds, live operating hours, visitor distance, and direct ticketing."}
            </p>
          </div>

          <button
            onClick={handleRequestLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] text-xs font-mono font-extrabold uppercase tracking-wider text-[var(--text-primary)] transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Locate className={`w-4 h-4 text-[var(--e3-royal-blue)] ${locating ? 'animate-spin' : ''}`} />
            <span>
              {locating
                ? (isAr ? "جاري التحديد..." : "Locating...")
                : userCoords
                ? (isAr ? "موقعك نشط" : "Location Active")
                : (isAr ? "تحديد موقعي" : "Near Me")}
            </span>
          </button>
        </div>

        {/* Category Pills & Search Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--e3-royal-blue)] text-white shadow-lg'
                      : 'bg-[var(--surface-default)] text-[var(--text-secondary)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] hover:text-white'
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[260px] md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute top-3 start-3 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder={isAr ? "ابحث عن وجهة أو موقع..." : "Search attraction or venue..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-9 pe-4 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] placeholder:text-[var(--text-tertiary)] shadow-inner"
            />
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attr) => {
            const timing = getTimingStatus(attr, isAr);
            const ops = attr.operations || {};
            const lat = ops.lat || attr.coordinates?.lat || 25.418;
            const lng = ops.lng || attr.coordinates?.lng || 51.530;
            
            const dist = userCoords 
              ? `${calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng)} km`
              : (isAr ? (ops.locationNameAr || "قطر") : (ops.locationNameEn || "Qatar"));

            return (
              <motion.div
                key={attr.id}
                layout
                className="group relative rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:border-[var(--e3-royal-blue)]/60 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-gradient-to-br from-[var(--e3-deep-blue)] to-black shrink-0">
                  {attr.heroMediaUrl ? (
                    <img 
                      src={attr.heroMediaUrl} 
                      alt={attr.nameEn} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--e3-royal-blue)]/20">
                      <Sparkles className="w-10 h-10 text-[var(--e3-royal-blue)]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className={`absolute top-4 start-4 flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-extrabold uppercase backdrop-blur-md shadow-md z-10 ${timing.badgeClass}`}>
                    <span className={`w-2 h-2 rounded-full ${timing.dotClass}`} />
                    <span>{timing.label}</span>
                  </div>

                  <div className="absolute top-4 end-4 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono font-bold text-white uppercase backdrop-blur-md">
                    {attr.category?.split('&')[0] || "E3 WORLD"}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] font-display uppercase group-hover:text-[var(--e3-royal-blue)] transition-colors">
                      {isAr ? attr.nameAr : attr.nameEn}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2 leading-relaxed">
                      {isAr ? (attr.taglineAr || attr.descriptionAr) : (attr.taglineEn || attr.descriptionEn)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-level-2)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--e3-royal-blue)]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[160px]">{dist}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[var(--text-tertiary)]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{ops.openingTime || "14:00"} - {ops.closingTime || "23:00"}</span>
                    </div>
                  </div>

                  <Link
                    href={attr.ticketingUrl || `/en/b2c/calendar`}
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
      try {
        const res = await fetch(`/api/public/locations/map?locale=${locale}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.features) {
            setGeoJson(json);
            if (json.features.length > 0 && !selectedLocationId) {
              setSelectedLocationId(json.features[0].properties.locationId);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load public map GeoJSON', e);
      }
    }
    loadMapData();
  }, [locale]);

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
              <span>{isAr ? "الخريطة التفاعلية الحية" : "MAPLIBRE & OPENFREEMAP SPATIAL HUB"}</span>
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
