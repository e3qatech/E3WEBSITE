"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAttractionsStore, AttractionStatus, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { Search, MapPin, Clock, CalendarDays, Activity } from 'lucide-react';

export default function AttractionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params);
  // Connect to realtime socket
  useLiveOccupancy();
  
  const { 
    attractions, 
    featuredAttraction, 
    searchQuery, 
    statusFilter, 
    setSearchQuery, 
    setStatusFilter,
    setAttractions,
    isLoading
  } = useAttractionsStore();

  const [localSearch, setLocalSearch] = useState('');
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Initial Fetch (Mocking the fetch since we are in a client component, 
  // ideally this would be a server component passing initialData, 
  // but the prompt specifies "Fetch from /api/attractions?isVisible=true" 
  // and "Store in Zustand")
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const res = await fetch('/api/attractions?isPublished=true&limit=50');
        const json = await res.json();
        if (json.data) {
          setAttractions(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch attractions", error);
        setAttractions([]);
      }
    };
    fetchAttractions();
  }, [setAttractions]);

  const filteredAttractions = useMemo(() => {
    return attractions.filter(a => {
      const matchSearch = 
        a.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.nameAr.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchStatus = true;
      if (statusFilter === 'Active Now') matchStatus = !!a.isOpenNow;
      if (statusFilter === 'Coming Soon') matchStatus = !a.isOpenNow; // naive
      // Special Events not natively supported by basic boolean yet
      
      return matchSearch && matchStatus && (a.id !== featuredAttraction?.id);
    });
  }, [attractions, searchQuery, statusFilter, featuredAttraction]);

  const filterChips: AttractionStatus[] = ['All', 'Active Now', 'Coming Soon', 'Special Events'];

  return (
    <main className="min-h-screen bg-[#0C0C0C] text-[#FAFAFA] font-sans selection:bg-[#F59E0B] selection:text-[#0C0C0C] relative overflow-hidden">
      
      {/* Industrial Grain Texture (gstack) */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Animated ambient mesh */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              background: [
                'radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.15) 0%, rgba(12, 12, 12, 1) 50%)',
                'radial-gradient(circle at 80% 70%, rgba(245, 158, 11, 0.15) 0%, rgba(12, 12, 12, 1) 50%)',
                'radial-gradient(circle at 20% 30%, rgba(245, 158, 11, 0.15) 0%, rgba(12, 12, 12, 1) 50%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-8 mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-black tracking-tight"
            style={{ fontFamily: 'var(--font-satoshi, inherit)' }}
          >
            Discover Experiences
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl font-medium"
          >
            Explore Qatar's most exciting attractions, powered by real-time telemetry and industrial precision.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl relative"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#A1A1AA] peer-focus:text-[#F59E0B] transition-colors" />
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search attractions..."
                className="w-full bg-[#141414] border border-[#27272A] rounded-xl py-4 pl-12 pr-4 text-[#FAFAFA] placeholder-[#A1A1AA] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all"
                dir="auto"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {filterChips.map(chip => (
                <button
                  key={chip}
                  onClick={() => setStatusFilter(chip)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 ${
                    statusFilter === chip 
                      ? 'bg-[#F59E0B] border-[#F59E0B] text-[#0C0C0C]' 
                      : 'bg-[#141414] border-[#27272A] text-[#A1A1AA] hover:border-[#52525B]'
                  }`}
                  style={{ minHeight: '44px' }} // UI-UX-Pro-Max 44pt touch target rule
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 text-[#52525B]"
        >
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-current rounded-full" />
          </div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-24 space-y-16">
        
        {/* Loading State */}
        {isLoading && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-full h-80 bg-[#141414] rounded-2xl animate-pulse border border-[#27272A]" />
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {/* Featured Attraction */}
            {featuredAttraction && (
              <motion.section 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full"
              >
                <div className="w-full bg-[#141414] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col md:flex-row group">
                  <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent z-10 md:bg-gradient-to-r" />
                    {featuredAttraction.gallery?.[0] ? (
                      <img 
                        src={featuredAttraction.gallery[0].url} 
                        alt={featuredAttraction.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#27272A]" />
                    )}
                  </div>
                  
                  <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-20">
                    <div className="flex items-center gap-3 mb-4">
                      {featuredAttraction.isOpenNow ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-emerald-500/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE NOW
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#27272A] text-[#A1A1AA] px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                          CLOSED
                        </div>
                      )}
                      <span className="text-[#F59E0B] text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Featured
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-3">{featuredAttraction.nameEn}</h2>
                    <p className="text-[#A1A1AA] mb-8 line-clamp-3">
                      {featuredAttraction.descriptionEn || "Experience the pinnacle of engineering and entertainment."}
                    </p>

                    {/* Capacity Meter */}
                    {featuredAttraction.liveOccupancy && (
                      <div className="mb-8">
                        <div className="flex justify-between text-xs font-mono text-[#A1A1AA] mb-2">
                          <span>OCCUPANCY</span>
                          <span>{featuredAttraction.liveOccupancy.currentCount} / {featuredAttraction.liveOccupancy.maxCapacity}</span>
                        </div>
                        <div className="w-full h-2 bg-[#27272A] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (featuredAttraction.liveOccupancy.currentCount / featuredAttraction.liveOccupancy.maxCapacity) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#F59E0B]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="font-mono text-xl">
                        {featuredAttraction.pricing?.[0] ? (
                          <>QAR {featuredAttraction.pricing[0].price}</>
                        ) : (
                          <span className="text-[#A1A1AA] text-sm">Free Entry</span>
                        )}
                      </div>
                      <Link 
                        href={`/${locale}/b2c/attractions/${featuredAttraction.slug}`}
                        className="bg-[#FAFAFA] text-[#0C0C0C] px-6 py-3 rounded-lg font-bold hover:bg-[#F59E0B] hover:text-[#0C0C0C] transition-colors active:scale-95 flex items-center justify-center min-h-[44px]"
                      >
                        Explore
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Attractions Grid */}
            <section>
              <AnimatePresence mode="popLayout">
                {filteredAttractions.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-[#27272A] rounded-2xl"
                  >
                    <Search className="w-12 h-12 text-[#52525B] mb-4" />
                    <h3 className="text-xl font-bold mb-2">No attractions found</h3>
                    <p className="text-[#A1A1AA]">Try adjusting your search or filters.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredAttractions.map((attraction, index) => (
                      <AttractionCard 
                        key={attraction.id} 
                        attraction={attraction} 
                        index={index} 
                        locale={locale} 
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function AttractionCard({ attraction, index, locale }: { attraction: Attraction; index: number; locale: string }) {
  const isNameAr = locale === 'ar';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bg-[#141414] border border-[#27272A] rounded-2xl overflow-hidden group hover:border-[#52525B] hover:shadow-2xl hover:shadow-[#F59E0B]/5 transition-all flex flex-col"
    >
      <Link href={`/${locale}/b2c/attractions/${attraction.slug}`} className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
        <div className="w-full h-48 relative overflow-hidden bg-[#27272A]">
          {attraction.gallery?.[0] && (
            <img 
              src={attraction.gallery[0].url} 
              alt={isNameAr ? attraction.nameAr : attraction.nameEn}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-4 left-4">
             {attraction.isOpenNow ? (
                <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md text-[#A1A1AA] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border border-white/10">
                  CLOSED
                </div>
              )}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold mb-2 group-hover:text-[#F59E0B] transition-colors line-clamp-1">
            {isNameAr ? attraction.nameAr : attraction.nameEn}
          </h3>
          
          <p className="text-[#A1A1AA] text-sm mb-6 line-clamp-2 flex-grow">
            {isNameAr ? attraction.descriptionAr : attraction.descriptionEn}
          </p>

          {/* Occupancy Indicator in Grid */}
          {attraction.liveOccupancy && (
             <div className="w-full flex items-center gap-3 mb-6">
               <div className="text-[10px] text-[#A1A1AA] font-mono w-8">
                 {Math.round((attraction.liveOccupancy.currentCount / attraction.liveOccupancy.maxCapacity) * 100)}%
               </div>
               <div className="flex-grow h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-[#F59E0B]" 
                    style={{ width: `${(attraction.liveOccupancy.currentCount / attraction.liveOccupancy.maxCapacity) * 100}%` }}
                 />
               </div>
             </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
            <span className="font-mono text-sm text-[#A1A1AA]">
              {attraction.pricing?.[0] ? `From QAR ${attraction.pricing[0].price}` : 'Free'}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center group-hover:bg-[#F59E0B] group-hover:text-[#0C0C0C] transition-colors">
              →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
