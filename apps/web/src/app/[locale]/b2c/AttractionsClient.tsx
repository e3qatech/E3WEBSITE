"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAttractionsStore, AttractionStatus, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { Search, Activity, ChevronDown, ChevronUp, Ticket, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const extractUrl = (raw: string | null | undefined) => {
  if (!raw) return '';
  if (raw.includes('iframe') && raw.includes('src=')) {
    const match = raw.match(/src=["'](.*?)["']/);
    if (match) return match[1];
  }
  return raw;
};

export function AttractionsClient({ locale, cmsData, initialAttractions = [] }: { locale: string, cmsData: any, initialAttractions?: Attraction[] }) {
  useLiveOccupancy();
  
  const { 
    attractions, 
    featuredAttraction, 
    searchQuery, 
    statusFilter, 
    setSearchQuery, 
    setStatusFilter,
    setAttractions,
    isLoading,
    sortMode,
    setSortMode,
    userLocation,
    setUserLocation
  } = useAttractionsStore();

  const [localSearch, setLocalSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const dropdownResults = useMemo(() => {
    if (!localSearch.trim()) return [];
    const lowerSearch = localSearch.toLowerCase();
    return attractions.filter(a => {
      return (a.nameEn?.toLowerCase() || '').includes(lowerSearch) || 
             (a.nameAr?.toLowerCase() || '').includes(lowerSearch);
    }).slice(0, 5);
  }, [attractions, localSearch]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    if (initialAttractions.length > 0) {
      setAttractions(initialAttractions);
    } else {
      const fetchAttractions = async () => {
        try {
          const res = await fetch('/api/attractions?isPublished=true&limit=50');
          const json = await res.json();
          if (json.data) {
            setAttractions(json.data);
          }
        } catch (error) {
          console.error("Failed to fetch attractions", error);
        }
      };
      fetchAttractions();
    }
  }, [setAttractions, initialAttractions]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error obtaining location", error);
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const filteredAttractions = useMemo(() => {
    const result = attractions.filter(a => {
      const matchSearch = 
        (a.nameEn?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (a.nameAr?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      let matchStatus = true;
      if (statusFilter === 'Active Now') matchStatus = a.computedStatus === 'ACTIVE';
      if (statusFilter === 'Coming Soon') matchStatus = a.computedStatus === 'COMING SOON';
      if (statusFilter === 'Special Events') matchStatus = !!a.isSpecialEvent;
      if (statusFilter === 'Past') matchStatus = a.computedStatus === 'PAST';
      
      return matchSearch && matchStatus && (a.id !== featuredAttraction?.id);
    });
    
    // Sort logic
    if (sortMode === 'Distance') {
      result.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else if (sortMode === 'PriceLowToHigh') {
      result.sort((a, b) => (a.pricing?.[0]?.price ?? 0) - (b.pricing?.[0]?.price ?? 0));
    } else if (sortMode === 'PriceHighToLow') {
      result.sort((a, b) => (b.pricing?.[0]?.price ?? 0) - (a.pricing?.[0]?.price ?? 0));
    }
    
    return result;
  }, [attractions, searchQuery, statusFilter, featuredAttraction, sortMode]);

  const filterChips: AttractionStatus[] = ['All', 'Active Now', 'Coming Soon', 'Special Events'];
  const isAr = locale === 'ar';
  
  const hero = cmsData?.hero || {};
  const cta = cmsData?.cta || {};
  const subscribe = cmsData?.subscribe || {};
  const faqs = cmsData?.faqs || [];
  const careersCta = cmsData?.careersCta || {};
  const footer = cmsData?.footer || {};

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-righteous { font-family: 'Righteous', cursive; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}} />
      <main className="min-h-screen bg-[#0F0F23] text-[#FAFAFA] font-poppins selection:bg-[#F43F5E]/30 selection:text-[#FAFAFA] relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
        
        {/* Interactive Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-64 -left-64 w-[800px] h-[800px] bg-[#7C3AED] rounded-full mix-blend-screen filter blur-[128px] opacity-20"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 -right-64 w-[600px] h-[600px] bg-[#F43F5E] rounded-full mix-blend-screen filter blur-[128px] opacity-20"
          />
        </div>

        {/* Industrial Grain Texture */}
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex flex-col items-center justify-center px-4 overflow-hidden border-b border-[#27272A]">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 bg-[#0F0F23]">
          {hero.mediaType === 'IMAGE' && hero.mediaUrl && (
            <img src={hero.mediaUrl} alt="Hero" className="w-full h-full object-cover opacity-50" />
          )}
          {hero.mediaType === 'VIDEO' && hero.mediaUrl && (
            <video src={hero.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60" />
          )}
          {hero.mediaType === 'IFRAME' && hero.mediaUrl && (
            <iframe 
              src={extractUrl(hero.mediaUrl)} 
              className="w-full h-full border-none opacity-60 pointer-events-none" 
              allow="autoplay; fullscreen; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
          {hero.mediaType === 'MODEL_3D' && hero.mediaUrl && (
            <iframe 
              src={extractUrl(hero.mediaUrl)} 
              className="w-full h-full border-none opacity-80" 
              allow="autoplay; fullscreen; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
          {/* Default ambient mesh if no media */}
          {(!hero.mediaUrl || !hero.mediaType) && (
             <motion.div 
               animate={{ 
                 background: [
                   'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.15) 0%, rgba(15, 15, 35, 1) 50%)',
                   'radial-gradient(circle at 80% 70%, rgba(244, 63, 94, 0.15) 0%, rgba(15, 15, 35, 1) 50%)',
                   'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.15) 0%, rgba(15, 15, 35, 1) 50%)'
                 ]
               }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="w-full h-full"
             />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F23] via-[#0F0F23]/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-8 mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#F43F5E] font-righteous"
          >
            {isAr ? hero.headerAr || "" : hero.headerEn || ""}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl font-medium"
          >
            {isAr ? hero.subHeaderAr : hero.subHeaderEn}
          </motion.p>

          {(hero.showSearch ?? true) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl relative"
            >
              <div className="relative flex items-center w-full">
                <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} w-5 h-5 text-[#A1A1AA] peer-focus:text-[#F43F5E] transition-colors z-20`} />
                <input
                  type="search"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder={isAr ? "ابحث عن التجارب..." : "Search attractions..."}
                  className={`w-full bg-[#1A1A2E]/80 backdrop-blur-md border border-[#7C3AED]/30 rounded-xl py-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-[#FAFAFA] placeholder-[#A1A1AA] focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all shadow-[0_0_20px_rgba(124,58,237,0.1)] relative z-10 peer`}
                  dir="auto"
                />

                {/* Search Dropdown */}
                <AnimatePresence>
                  {isSearchFocused && localSearch.trim() && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A2E] border border-[#7C3AED]/30 rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.2)] z-50 overflow-hidden text-left"
                    >
                      {dropdownResults.length > 0 ? (
                        <ul className="flex flex-col">
                          {dropdownResults.map(attr => (
                            <li key={attr.id} className="border-b border-[#7C3AED]/20 last:border-b-0">
                              <Link 
                                href={`/${locale}/b2c/attractions/${attr.slug}`}
                                className={`flex items-center gap-4 px-4 py-3 hover:bg-[#7C3AED]/10 transition-colors ${isAr ? 'text-right' : ''}`}
                              >
                                {attr.heroThumbnailUrl || attr.gallery?.[0]?.url ? (
                                  <img src={attr.heroThumbnailUrl || attr.gallery?.[0]?.url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-[#27272A] flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-[#A1A1AA]" />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="text-[#FAFAFA] font-bold text-sm">
                                    {isAr ? attr.nameAr : attr.nameEn}
                                  </span>
                                  {attr.computedStatus === 'ACTIVE' && (
                                    <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Live Now</span>
                                  )}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-6 text-center text-[#A1A1AA] text-sm">
                          {isAr ? "لا توجد نتائج" : "No results found"}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {filterChips.map(chip => (
                  <button
                    key={chip}
                    onClick={() => setStatusFilter(chip)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 ${
                      statusFilter === chip 
                        ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                        : 'bg-[#1A1A2E]/80 backdrop-blur-md border-[#7C3AED]/30 text-[#A1A1AA] hover:border-[#F43F5E]/50'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Sorting and Location Tools */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                <button
                  onClick={requestLocation}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${userLocation ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#1A1A2E]/80 border-[#7C3AED]/30 text-[#A1A1AA] hover:border-[#F43F5E]/50'}`}
                >
                  <MapPin className="w-4 h-4" />
                  {isAr ? (userLocation ? 'الموقع مفعل' : 'استخدم موقعي') : (userLocation ? 'Location Active' : 'Use My Location')}
                </button>
                <div className="relative flex items-center">
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as any)}
                    className="appearance-none bg-[#1A1A2E]/80 border border-[#7C3AED]/30 rounded-xl pl-4 pr-10 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#F43F5E] transition-colors"
                  >
                    <option value="Recommended">{isAr ? 'موصى به' : 'Recommended'}</option>
                    <option value="Distance">{isAr ? 'المسافة' : 'Distance'}</option>
                    <option value="PriceLowToHigh">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                    <option value="PriceHighToLow">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                  </select>
                  <ChevronDown className="absolute right-3 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-24 space-y-24">
        
        {/* Loading State */}
        {isLoading && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-full h-80 bg-[#1A1A2E] rounded-2xl animate-pulse border border-[#7C3AED]/20" />
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {/* Featured Attractions */}
            {featuredAttraction && (
              <section className="w-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-8 bg-[#F43F5E] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  <h2 className="text-3xl font-black font-righteous">{isAr ? cmsData?.featuredTitleAr || "" : cmsData?.featuredTitleEn || ""}</h2>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full bg-[#1A1A2E]/50 backdrop-blur-md border border-[#7C3AED]/30 hover:border-[#F43F5E]/50 rounded-2xl overflow-hidden flex flex-col md:flex-row group transition-colors shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]"
                >
                  <Link href={`/${locale}/b2c/attractions/${featuredAttraction.slug}`} className="w-full flex flex-col md:flex-row h-full focus:outline-none focus:ring-2 focus:ring-[#F43F5E]">
                  <div className="w-full md:w-3/5 h-72 md:h-auto relative overflow-hidden bg-[#0F0F23]">
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#1A1A2E]/90 to-transparent z-10" />
                    {featuredAttraction.heroMediaType === 'VIDEO' && featuredAttraction.heroMediaUrl ? (
                      <video src={featuredAttraction.heroMediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    ) : featuredAttraction.heroThumbnailUrl ? (
                      <img 
                        src={featuredAttraction.heroThumbnailUrl} 
                        alt={featuredAttraction.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : featuredAttraction.heroFallbackUrl ? (
                      <img 
                        src={featuredAttraction.heroFallbackUrl} 
                        alt={featuredAttraction.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : featuredAttraction.heroMediaType === 'IMAGE' && featuredAttraction.heroMediaUrl ? (
                      <img 
                        src={featuredAttraction.heroMediaUrl} 
                        alt={featuredAttraction.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : featuredAttraction.gallery?.[0] ? (
                      <img 
                        src={featuredAttraction.gallery[0].url} 
                        alt={featuredAttraction.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#27272A]" />
                    )}
                  </div>
                  
                  <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center relative z-20">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      {featuredAttraction.computedStatus === 'ACTIVE' && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-emerald-500/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE NOW
                        </div>
                      )}
                      {featuredAttraction.computedStatus === 'COMING SOON' && (
                        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-amber-500/20">
                          COMING SOON
                        </div>
                      )}
                      {featuredAttraction.computedStatus === 'PAST' && (
                        <div className="flex items-center gap-2 bg-gray-500/10 text-gray-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-gray-500/20">
                          PAST
                        </div>
                      )}
                      {featuredAttraction.isSpecialEvent && (
                        <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-purple-500/20">
                          ★ SPECIAL EVENT
                        </div>
                      )}
                      <span className="text-[#F43F5E] text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Featured
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold mb-3 font-righteous">{isAr ? featuredAttraction.nameAr : featuredAttraction.nameEn}</h3>
                    <p className="text-[#A1A1AA] mb-8 line-clamp-3">
                      {isAr ? featuredAttraction.descriptionAr : featuredAttraction.descriptionEn}
                    </p>

                    <div className="flex items-center gap-4 mt-auto">
                      <div className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(244,63,94,0.6)] transition-all duration-300 active:scale-95 flex items-center justify-center min-h-[48px] gap-2 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <Ticket className="w-5 h-5 relative z-10" /> <span className="relative z-10">Get Ticket</span>
                      </div>
                    </div>
                  </div>
                  </Link>
                </motion.div>
              </section>
            )}

            {/* Attractions Brick Grid */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-[#7C3AED] rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                <h2 className="text-3xl font-black font-righteous">{isAr ? cmsData?.gridTitleAr || "" : cmsData?.gridTitleEn || ""}</h2>
              </div>
              <AnimatePresence mode="popLayout">
                {filteredAttractions.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-[#7C3AED]/30 rounded-2xl bg-[#1A1A2E]/50"
                  >
                    <Search className="w-12 h-12 text-[#52525B] mb-4" />
                    <h3 className="text-xl font-bold mb-2">No attractions found</h3>
                    <p className="text-[#A1A1AA]">Try adjusting your search or filters.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    layout
                    className="flex flex-col gap-6"
                  >
                    {/* Bento Grid for up to 5 items */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {filteredAttractions.slice(0, 5).map((attraction, index) => {
                        const total = Math.min(filteredAttractions.length, 5);
                        let bentoClass = "w-full transition-all duration-300";
                        if (total === 1) bentoClass += " md:col-span-4 h-[400px] md:h-[600px]";
                        else if (total === 2) bentoClass += " md:col-span-2 h-[350px] md:h-[500px]";
                        else if (total === 3) {
                          if (index === 0) bentoClass += " md:col-span-2 md:row-span-2 h-[350px] md:h-[500px]";
                          else bentoClass += " md:col-span-2 h-[250px] md:h-[242px]";
                        }
                        else if (total === 4) {
                          if (index === 0) bentoClass += " md:col-span-2 md:row-span-2 h-[350px] md:h-[500px]";
                          else if (index === 1) bentoClass += " md:col-span-2 h-[250px] md:h-[242px]";
                          else bentoClass += " md:col-span-1 h-[250px] md:h-[242px]";
                        }
                        else {
                          if (index === 0) bentoClass += " md:col-span-2 md:row-span-2 h-[350px] md:h-[500px]";
                          else bentoClass += " md:col-span-1 h-[250px] md:h-[242px]";
                        }

                        return (
                          <div key={attraction.id} className={bentoClass}>
                            <AttractionBrick 
                              attraction={attraction} 
                              index={index} 
                              locale={locale} 
                              isLarge={index === 0}
                            />
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Slider for the rest (> 5) */}
                    {filteredAttractions.length > 5 && (
                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold font-righteous">{isAr ? "المزيد من التجارب" : "More Experiences"}</h3>
                          <div className="flex gap-2" dir="ltr">
                             <button 
                               onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                               className="w-12 h-12 rounded-full bg-[#1A1A2E] border border-[#7C3AED]/30 flex items-center justify-center hover:bg-[#7C3AED]/20 hover:border-[#F43F5E]/50 transition-all active:scale-95 text-[#FAFAFA]"
                               aria-label="Scroll left"
                             >
                               <ChevronLeft className="w-5 h-5 text-[#FAFAFA]" />
                             </button>
                             <button 
                               onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                               className="w-12 h-12 rounded-full bg-[#1A1A2E] border border-[#7C3AED]/30 flex items-center justify-center hover:bg-[#7C3AED]/20 hover:border-[#F43F5E]/50 transition-all active:scale-95 text-[#FAFAFA]"
                               aria-label="Scroll right"
                             >
                               <ChevronRight className="w-5 h-5 text-[#FAFAFA]" />
                             </button>
                          </div>
                        </div>
                        <div 
                          ref={scrollRef}
                          className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-8 scrollbar-hide scroll-smooth"
                        >
                          {filteredAttractions.slice(5).map((attraction, index) => (
                            <div key={attraction.id} className="min-w-[280px] md:min-w-[320px] h-[350px] md:h-[400px] snap-center shrink-0">
                              <AttractionBrick 
                                attraction={attraction} 
                                index={index + 5} 
                                locale={locale} 
                                isLarge={false}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Subscribe Section */}
            <section className="w-full bg-[#1A1A2E]/50 border border-[#7C3AED]/30 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.1)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F43F5E]/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 w-full md:w-1/2">
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight font-righteous">
                  {isAr ? subscribe.titleAr || "" : subscribe.titleEn || ""}
                </h2>
                <p className="text-purple-200">
                  {isAr ? subscribe.subtitleAr : subscribe.subtitleEn}
                </p>
              </div>
              <div className="relative z-10 w-full md:w-1/2">
                <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md ml-auto" onSubmit={e => { e.preventDefault(); /* Handle submit */ }}>
                  <input 
                    type="email" 
                    placeholder={isAr ? "عنوان بريدك الإلكتروني" : "Your email address"}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 min-h-[48px] text-[#FAFAFA] focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all"
                  />
                  <button type="submit" className="bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white font-bold px-6 py-3 rounded-xl min-h-[48px] hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] active:scale-95 transition-all whitespace-nowrap">
                    {isAr ? "اشترك" : "Subscribe"}
                  </button>
                </form>
              </div>
            </section>

            {/* FAQ Section */}
            {faqs && faqs.length > 0 && (
              <section className="max-w-3xl mx-auto w-full">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-black mb-4 font-righteous">{isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</h2>
                  <p className="text-[#A1A1AA]">{isAr ? "كل ما تحتاج لمعرفته حول تجاربنا" : "Everything you need to know about our experiences."}</p>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq: any, i: number) => (
                    <div key={i} className="bg-[#1A1A2E]/50 border border-[#7C3AED]/30 rounded-2xl overflow-hidden transition-colors hover:border-[#F43F5E]/50">
                      <button 
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#F43F5E]"
                      >
                        <span className="font-bold text-lg">{isAr ? faq.questionAr : faq.questionEn}</span>
                        {openFaq === i ? <ChevronUp className="w-5 h-5 text-[#F43F5E]" /> : <ChevronDown className="w-5 h-5 text-[#A1A1AA]" />}
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-0 text-[#A1A1AA] leading-relaxed">
                              {isAr ? faq.answerAr : faq.answerEn}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA Section */}
            <section className="w-full py-16 text-center flex flex-col items-center">
              <h2 className="text-3xl font-black mb-6 font-righteous">{isAr ? cta.titleAr || "" : cta.titleEn || ""}</h2>
              <Link 
                href={cta.buttonUrl || ""}
                className="bg-[#1A1A2E] text-[#FAFAFA] border border-[#7C3AED]/50 hover:bg-[#7C3AED]/20 px-8 py-4 rounded-xl font-bold transition-colors min-h-[48px] inline-flex items-center"
              >
                {isAr ? cta.buttonTextAr || "" : cta.buttonTextEn || ""}
              </Link>
            </section>

            {/* Careers CTA Section */}
            <section className="w-full bg-[#1A1A2E]/50 border border-[#7C3AED]/30 rounded-3xl p-8 md:p-16 flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4 font-righteous">{isAr ? careersCta.titleAr || "" : careersCta.titleEn || ""}</h2>
              <p className="text-[#A1A1AA] text-lg mb-8 max-w-xl">
                {isAr ? careersCta.subtitleAr || "" : careersCta.subtitleEn || ""}
              </p>
              <Link 
                href={careersCta.buttonUrl || "/careers"}
                className="bg-[#F43F5E] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#E11D48] transition-colors shadow-[0_0_20px_rgba(244,63,94,0.3)] min-h-[48px] inline-flex items-center"
              >
                {isAr ? careersCta.buttonTextAr || "" : careersCta.buttonTextEn || ""}
              </Link>
            </section>

          </>
        )}
      </div>

      {/* Landing Page Footer Background */}
      <section className="relative w-full min-h-[50vh] flex flex-col items-center justify-center overflow-hidden border-t border-[#7C3AED]/20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 bg-[#0F0F23]">
          {footer.mediaType === 'IMAGE' && footer.mediaUrl && (
            <img src={footer.mediaUrl} alt="Footer" className="w-full h-full object-cover opacity-60" />
          )}
          {footer.mediaType === 'VIDEO' && footer.mediaUrl && (
            <video src={footer.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60" />
          )}
          {footer.mediaType === 'IFRAME' && footer.mediaUrl && (
            <iframe 
              src={extractUrl(footer.mediaUrl)} 
              className="w-full h-full border-none opacity-60 pointer-events-none" 
              allow="autoplay; fullscreen; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
          {footer.mediaType === 'MODEL_3D' && footer.mediaUrl && (
            <iframe 
              src={extractUrl(footer.mediaUrl)} 
              className="w-full h-full border-none opacity-80" 
              allow="autoplay; fullscreen; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
          {(!footer.mediaUrl || !footer.mediaType) && (
            <div className="w-full h-full bg-[#0F0F23]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F23] via-transparent to-[#0F0F23]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white drop-shadow-lg font-righteous">
            {isAr ? 'عش اللحظة.' : 'Live the Moment.'}
          </h2>
          <p className="text-[#A1A1AA] text-lg font-medium drop-shadow">
            {isAr ? 'نصنع ذكريات لا تُنسى في قطر' : 'Creating unforgettable memories in Qatar.'}
          </p>
        </div>
      </section>
    </main>
    </>
  );
}

function AttractionBrick({ attraction, index, locale, isLarge }: { attraction: Attraction; index: number; locale: string, isLarge: boolean }) {
  const isNameAr = locale === 'ar';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`bg-[#1A1A2E]/50 backdrop-blur-md border border-[#7C3AED]/30 rounded-3xl overflow-hidden group hover:border-[#F43F5E]/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] transition-all flex flex-col relative w-full h-full`}
    >
      <Link href={`/${locale}/b2c/attractions/${attraction.slug}`} className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-[#F43F5E]">
        <div className="absolute inset-0 z-0 bg-[#0F0F23]">
          {attraction.heroThumbnailUrl ? (
            <img 
              src={attraction.heroThumbnailUrl} 
              alt={isNameAr ? attraction.nameAr : attraction.nameEn}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : attraction.heroMediaType === 'VIDEO' && attraction.heroMediaUrl ? (
             <video src={attraction.heroMediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : attraction.heroFallbackUrl ? (
            <img 
              src={attraction.heroFallbackUrl} 
              alt={isNameAr ? attraction.nameAr : attraction.nameEn}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : attraction.heroMediaType === 'IMAGE' && attraction.heroMediaUrl ? (
            <img 
              src={attraction.heroMediaUrl} 
              alt={isNameAr ? attraction.nameAr : attraction.nameEn}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : attraction.gallery?.[0] ? (
            <img 
              src={attraction.gallery[0].url} 
              alt={isNameAr ? attraction.nameAr : attraction.nameEn}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F23] via-[#0F0F23]/50 to-transparent" />
        </div>

        <div className="relative z-10 p-6 flex flex-col h-full justify-end">
            <div className="absolute top-6 left-6 flex flex-col gap-2 items-start">
             {attraction.computedStatus === 'ACTIVE' && (
                <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              )}
             {attraction.computedStatus === 'COMING SOON' && (
                <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-md text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-amber-500/30">
                  INCOMING
                </div>
              )}
             {attraction.computedStatus === 'PAST' && (
                <div className="flex items-center gap-2 bg-gray-500/20 backdrop-blur-md text-gray-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-gray-500/30">
                  PAST
                </div>
              )}
             {attraction.isSpecialEvent && (
                <div className="flex items-center gap-2 bg-purple-500/20 backdrop-blur-md text-purple-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-purple-500/30">
                  ★ SPECIAL EVENT
                </div>
              )}
            </div>
            
            <div className="absolute top-6 right-6 flex flex-col gap-2 items-end text-right">
               {attraction.distanceKm !== undefined && (
                 <div className="flex items-center gap-1.5 bg-[#1A1A2E]/80 backdrop-blur-md text-[#FAFAFA] px-3 py-1.5 rounded-xl text-xs font-bold border border-[#7C3AED]/30">
                   <MapPin className="w-3.5 h-3.5 text-[#F43F5E]" />
                   {attraction.distanceKm < 1 ? 'Nearby' : `${attraction.distanceKm.toFixed(1)} km`}
                 </div>
               )}
               {attraction.timingStatus && attraction.timingStatus.status !== 'UNKNOWN' && (
                 <div className={`flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    attraction.timingStatus.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    attraction.timingStatus.status === 'CLOSING_SOON' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                 }`}>
                   <Clock className="w-3.5 h-3.5" />
                   {attraction.timingStatus.label}
                 </div>
               )}
            </div>
            
          <div className="mt-auto">
            <h3 className={`font-bold mb-2 text-[#FAFAFA] group-hover:text-[#F43F5E] transition-colors line-clamp-1 font-righteous ${isLarge ? 'text-3xl' : 'text-xl'}`}>
              {isNameAr ? attraction.nameAr : attraction.nameEn}
            </h3>
            
            <p className="text-[#A1A1AA] text-sm mb-4 line-clamp-2">
              {isNameAr ? attraction.descriptionAr : attraction.descriptionEn}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="font-mono text-sm text-[#FAFAFA] bg-[#7C3AED]/20 px-3 py-1 rounded-lg backdrop-blur-md border border-[#7C3AED]/30 group-hover:border-[#F43F5E]/50 transition-colors">
                {attraction.pricing?.[0] ? `From QAR ${attraction.pricing[0].price}` : 'Free'}
              </span>
              <span className="w-8 h-8 rounded-full bg-[#1A1A2E] flex items-center justify-center text-white border border-[#7C3AED]/30 group-hover:bg-[#F43F5E] group-hover:border-[#F43F5E] transition-colors backdrop-blur-md">
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
