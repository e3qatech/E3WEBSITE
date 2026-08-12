"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  Compass, 
  Grid, 
  Map as MapIcon, 
  Locate, 
  Sparkles, 
  ArrowRight, 
  Ticket, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    L: any;
  }
}

interface AttractionItem {
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

// Fallback attraction data for Qatar if database list is empty
const FALLBACK_ATTRACTIONS: AttractionItem[] = [
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

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

function getTimingStatus(attraction: AttractionItem, isAr: boolean) {
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

export function AttractionsDirectory({ initialAttractions, locale }: AttractionsDirectoryProps) {
  const isAr = locale === 'ar';
  const list = initialAttractions.length > 0 ? initialAttractions : FALLBACK_ATTRACTIONS;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'MAP' | 'SPLIT'>('SPLIT');
  const [selectedAttrId, setSelectedAttrId] = useState<string>(list[0]?.id || '');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const categories = [
    { id: 'ALL', labelEn: 'All Attractions', labelAr: 'جميع الوجهات' },
    { id: 'INFLATABLE & OBSTACLE', labelEn: 'Inflatable & Obstacle', labelAr: 'عقبات منفوخة' },
    { id: 'THEME PARK & CARNIVAL', labelEn: 'Theme Parks & Cities', labelAr: 'مدن ترفيهية' },
    { id: 'VR & CYBERSPORT', labelEn: 'VR & Esports', labelAr: 'واقع افتراضي وألعاب' },
    { id: 'KARTING & RACING', labelEn: 'Karting & Racing', labelAr: 'كارتينج وسباقات' },
    { id: 'WATER & SPLASH', labelEn: 'Water & Splash', labelAr: 'ألعاب مائية' }
  ];

  // Dynamically load Leaflet JS & CSS for real interactive map cartography
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert(isAr ? "خدمة تحديد الموقع غير مدعومة في متصفحك" : "Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserCoords(coords);
        setLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 12);
        }
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

  const selectedAttraction = useMemo(() => {
    return list.find((a) => a.id === selectedAttrId) || filteredAttractions[0] || list[0];
  }, [list, filteredAttractions, selectedAttrId]);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !window.L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = window.L;
    const map = L.map(mapContainerRef.current, {
      center: [25.35, 51.48],
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, viewMode]);

  // Update Markers on Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredAttractions.forEach((attr) => {
      const ops = attr.operations || {};
      const lat = ops.lat || attr.coordinates?.lat || 25.418;
      const lng = ops.lng || attr.coordinates?.lng || 51.530;

      const isSelected = attr.id === selectedAttraction?.id;
      const bgColor = isSelected ? '#1a1fd6' : 'rgba(9, 3, 20, 0.9)';
      const bdColor = isSelected ? '#ffffff' : '#8b5cf6';
      const size = isSelected ? 44 : 36;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;"><div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${bgColor}; border: 2px solid ${bdColor}; display: flex; items-center: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.8); transition: all 0.3s ease;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const title = isAr ? attr.nameAr : attr.nameEn;
      const locName = isAr ? (ops.locationNameAr || "قطر") : (ops.locationNameEn || "Qatar");
      const bookText = isAr ? "حجز التذاكر" : "Book Tickets";
      const ticketUrl = attr.ticketingUrl || "/en/b2c/calendar";
      const imgHtml = attr.heroMediaUrl ? `<img src="${attr.heroMediaUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />` : '';

      const popupContent = `
        <div style="font-family: inherit; padding: 4px; max-width: 200px; text-align: ${isAr ? 'right' : 'left'};">
          ${imgHtml}
          <div style="font-weight: 800; font-size: 12px; text-transform: uppercase; color: #fff; margin-bottom: 2px;">${title}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 6px;">${locName}</div>
          <a href="${ticketUrl}" style="display: block; width: 100%; text-align: center; padding: 5px 10px; background: #1a1fd6; color: #fff; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; text-decoration: none;">${bookText}</a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'e3-leaflet-popup'
      });

      marker.on('click', () => {
        setSelectedAttrId(attr.id);
      });

      markersRef.current.push(marker);
    });
  }, [filteredAttractions, selectedAttraction, leafletLoaded, isAr]);

  return (
    <section id="attractions-directory" className="relative py-20 bg-[var(--bg-level-1)] text-white border-t border-[var(--border-level-2)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        {/* Header & Controls Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[var(--border-level-2)] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] mb-3">
              <Compass className="w-3.5 h-3.5 text-[var(--e3-royal-blue)]" />
              <span>{isAr ? "دليل وجهات إي ثري قطر" : "E3 QATAR ATTRACTIONS DIRECTORY"}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "دليل الوجهات الخريطة التفاعلية" : "Attractions & Interactive Map"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium max-w-2xl mt-2">
              {isAr
                ? "تصفح كافة الوجهات الترفيهية الحية، ساعات العمل، المسافة من موقعك، وحجز التذاكر المباشر."
                : "Explore all active attraction worlds, live operating hours, visitor distance, and direct ticketing."}
            </p>
          </div>

          {/* View Toggle & Geolocation Action */}
          <div className="flex flex-wrap items-center gap-3">
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

            <div className="flex items-center p-1 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-md">
              <button
                onClick={() => setViewMode('SPLIT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'SPLIT' ? 'bg-[var(--e3-royal-blue)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isAr ? "مزدوج" : "Split View"}</span>
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'GRID' ? 'bg-[var(--e3-royal-blue)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{isAr ? "شبكة" : "Grid"}</span>
              </button>
              <button
                onClick={() => setViewMode('MAP')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'MAP' ? 'bg-[var(--e3-royal-blue)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{isAr ? "خريطة" : "Map"}</span>
              </button>
            </div>
          </div>
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

          {/* Search Bar Input */}
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

        {/* Main Content Layout (Grid vs Split vs Map) */}
        <div className="w-full">
          {filteredAttractions.length === 0 ? (
            <div className="p-16 text-center rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] space-y-4">
              <Compass className="w-12 h-12 text-[var(--text-tertiary)] mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-display uppercase">
                {isAr ? "لم نجد وجهات مطابقة للبحث" : "No Matching Attractions Found"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto font-medium">
                {isAr ? "جرب تصفية الفئات الأخرى أو البحث بكلمات مختلفة." : "Try clearing your search query or selecting another category filter above."}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                className="px-5 py-2.5 rounded-xl bg-[var(--e3-royal-blue)] text-white text-xs font-bold uppercase tracking-wider"
              >
                {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Attraction Cards Grid */}
              {(viewMode === 'GRID' || viewMode === 'SPLIT') && (
                <div className={`${viewMode === 'GRID' ? 'lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'lg:col-span-6 grid grid-cols-1 gap-6'}`}>
                  {filteredAttractions.map((attr) => {
                    const timing = getTimingStatus(attr, isAr);
                    const ops = attr.operations || {};
                    const lat = ops.lat || attr.coordinates?.lat || 25.418;
                    const lng = ops.lng || attr.coordinates?.lng || 51.530;
                    
                    const dist = userCoords 
                      ? `${calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng)} km`
                      : (isAr ? (ops.locationNameAr || "قطر") : (ops.locationNameEn || "Qatar"));

                    const isSelected = attr.id === selectedAttraction?.id;

                    return (
                      <motion.div
                        key={attr.id}
                        layout
                        onClick={() => setSelectedAttrId(attr.id)}
                        className={`group relative rounded-3xl overflow-hidden border transition-all cursor-pointer shadow-xl flex flex-col justify-between ${
                          isSelected 
                            ? 'border-[var(--e3-royal-blue)] bg-[var(--surface-hover)] ring-2 ring-[var(--e3-royal-blue)]/50'
                            : 'border-[var(--border-level-2)] bg-[var(--surface-default)] hover:border-[var(--e3-royal-blue)]/60'
                        }`}
                      >
                        {/* Cover Image */}
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

                          {/* Dynamic Timing Status Badge */}
                          <div className={`absolute top-4 start-4 flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-extrabold uppercase backdrop-blur-md shadow-md z-10 ${timing.badgeClass}`}>
                            <span className={`w-2 h-2 rounded-full ${timing.dotClass}`} />
                            <span>{timing.label}</span>
                          </div>

                          {/* Category Tag */}
                          <div className="absolute top-4 end-4 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono font-bold text-white uppercase backdrop-blur-md">
                            {attr.category?.split('&')[0] || "E3 WORLD"}
                          </div>
                        </div>

                        {/* Card Info Body */}
                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] font-display uppercase group-hover:text-[var(--e3-royal-blue)] transition-colors">
                              {isAr ? attr.nameAr : attr.nameEn}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2 leading-relaxed">
                              {isAr ? (attr.taglineAr || attr.descriptionAr) : (attr.taglineEn || attr.descriptionEn)}
                            </p>
                          </div>

                          {/* Location / Geolocation Visitor Distance */}
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

                          {/* Action Button */}
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
              )}

              {/* Right Column: Real Leaflet Interactive Map Container */}
              {(viewMode === 'MAP' || viewMode === 'SPLIT') && (
                <div className={`${viewMode === 'MAP' ? 'lg:col-span-12' : 'lg:col-span-6'} sticky top-24`}>
                  <div className="relative aspect-[4/3] rounded-3xl border border-[var(--border-level-2)] bg-[#050110] overflow-hidden shadow-2xl flex flex-col justify-between">
                    {/* Actual Leaflet Map Canvas Container */}
                    <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-0" />

                    {/* Selected Attraction Floating Info Card */}
                    {selectedAttraction && (
                      <motion.div 
                        key={selectedAttraction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-[var(--surface-default)]/95 border border-[var(--border-level-2)] backdrop-blur-md shadow-2xl flex items-center justify-between gap-4 absolute bottom-4 left-4 right-4 z-10"
                      >
                        <div className="flex items-center gap-3">
                          {selectedAttraction.heroMediaUrl && (
                            <img 
                              src={selectedAttraction.heroMediaUrl} 
                              alt={selectedAttraction.nameEn} 
                              className="w-14 h-14 rounded-xl object-cover border border-[var(--border-level-2)] shrink-0" 
                            />
                          )}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-[var(--e3-royal-blue)] uppercase block">SELECTED MAP PIN</span>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] font-display uppercase">{isAr ? selectedAttraction.nameAr : selectedAttraction.nameEn}</h4>
                            <p className="text-[11px] text-[var(--text-secondary)] font-medium truncate max-w-[200px]">{selectedAttraction.operations?.locationNameEn || "Qatar"}</p>
                          </div>
                        </div>

                        <Link
                          href={selectedAttraction.ticketingUrl || "/en/b2c/calendar"}
                          className="px-4 py-2 rounded-xl bg-[var(--e3-royal-blue)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 shadow-md"
                        >
                          <span>{isAr ? "حجز" : "Book Pass"}</span>
                          <ChevronRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
