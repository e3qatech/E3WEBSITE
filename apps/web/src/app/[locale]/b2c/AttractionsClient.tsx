"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAttractionsStore, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { Activity, ChevronDown, ChevronUp, Ticket, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  useB2CTheme, 
  B2CCard, 
  B2CButton, 
  B2CStatusBadge, 
  B2CBadge, 
  B2CEmptyState 
} from '@/components/ui/B2CThemeComponents';
import { MaskedVideoHero } from '@/components/b2c/hero/MaskedVideoHero';
import { formatLocalizedText } from '@/lib/utils';

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
  const { isAr } = useB2CTheme();
  
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
  const [_, setIsSearchFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
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

  const filterChips = ['All', 'Active Now', 'Coming Soon', 'Special Events'];
  
  const _hero = cmsData?.hero || {};
  const cta = cmsData?.cta || {};
  const subscribe = cmsData?.subscribe || {};
  const faqs = cmsData?.faqs || [];
  const careersCta = cmsData?.careersCta || {};
  const footer = cmsData?.footer || {};

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `}} />
      <div className="w-full relative text-[var(--text-primary)] font-poppins selection:bg-[rgba(26,31,214,0.3)]" dir={isAr ? 'rtl' : 'ltr'}>

        {/* E3 Pulse Masked Worlds Hero Section */}
        <MaskedVideoHero
          locale={locale}
          cmsData={cmsData}
          localSearch={localSearch}
          onSearchChange={setLocalSearch}
          onSearchFocus={() => setIsSearchFocused(true)}
          onSearchBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
        />

        {/* Main Content Area */}
                
                {/* Custom Filters Wrapper */}
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {filterChips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => setStatusFilter(chip as any)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold border tracking-wide uppercase transition-all duration-300 select-none active:scale-[0.98] outline-none ${
                        statusFilter === chip 
                          ? 'bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-purple)] text-white border-transparent shadow-[0_4px_15px_rgba(26,31,214,0.3)]' 
                          : 'bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:border-[var(--e3-royal-blue)]'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Location and Sorting Tools */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                  <button
                    onClick={requestLocation}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border uppercase tracking-wider transition-all duration-300 ${
                      userLocation 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                        : 'bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:border-[var(--e3-royal-blue)]'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {isAr ? (userLocation ? 'الموقع مفعل' : 'استخدم موقعي') : (userLocation ? 'Location Active' : 'Use My Location')}
                  </button>
                  <div className="relative flex items-center">
                    <select
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value as any)}
                      className="appearance-none bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl ps-4 pe-10 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] transition-colors cursor-pointer"
                    >
                      <option value="Recommended">{isAr ? 'موصى به' : 'Recommended'}</option>
                      <option value="Distance">{isAr ? 'المسافة' : 'Distance'}</option>
                      <option value="PriceLowToHigh">{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                      <option value="PriceHighToLow">{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                    </select>
                </div>
              </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 space-y-24">
          
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-full h-80 bg-[var(--surface-default)] rounded-3xl animate-pulse border border-[var(--border-level-1)]" />
              ))}
            </div>
          )}

          {!isLoading && (
            <>
              {/* Featured Attraction Section */}
              {featuredAttraction && (
                <section className="w-full">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-8 bg-[var(--e3-magenta)] rounded-full shadow-[0_0_10px_rgba(176,19,184,0.5)]" />
                    <h2 className="text-3xl md:text-4xl font-black font-righteous uppercase tracking-wide">
                      {isAr ? (cmsData?.featuredTitleAr || "أبرز التجارب") : (cmsData?.featuredTitleEn || "Featured Attractions")}
                    </h2>
                  </div>
                  
                  <B2CCard hoverable className="overflow-hidden">
                    <Link href={`/${locale}/b2c/attractions/${featuredAttraction.slug}`} className="w-full flex flex-col md:flex-row min-h-[400px]">
                      <div className="w-full md:w-3/5 h-72 md:h-auto relative overflow-hidden bg-zinc-950">
                        {featuredAttraction.heroMediaType === 'VIDEO' && featuredAttraction.heroMediaUrl ? (
                          <video src={featuredAttraction.heroMediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        ) : featuredAttraction.heroThumbnailUrl || featuredAttraction.heroMediaUrl || featuredAttraction.heroFallbackUrl || featuredAttraction.gallery?.[0]?.url ? (
                          <img 
                            src={featuredAttraction.heroThumbnailUrl || featuredAttraction.heroMediaUrl || featuredAttraction.heroFallbackUrl || featuredAttraction.gallery?.[0]?.url} 
                            alt={featuredAttraction.nameEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--e3-deep-blue)] to-[var(--e3-purple)]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[rgba(8,10,42,0.95)] via-[rgba(8,10,42,0.4)] to-transparent z-10" />
                      </div>
                      
                      <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center relative z-20">
                        <div className="flex items-center gap-3 mb-6 flex-wrap">
                          <B2CStatusBadge status={featuredAttraction.computedStatus || ""} />
                          {featuredAttraction.isSpecialEvent && (
                            <B2CBadge variant="accent">★ Special Event</B2CBadge>
                          )}
                          <span className="text-[var(--e3-magenta)] text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ml-auto">
                            <Activity className="w-3.5 h-3.5 animate-pulse" /> Featured
                          </span>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-black mb-4 font-display uppercase leading-tight">
                          {formatLocalizedText(isAr ? (featuredAttraction.nameAr || featuredAttraction.nameEn) : (featuredAttraction.nameEn || featuredAttraction.nameAr), locale)}
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-8 line-clamp-3 font-medium text-sm md:text-base leading-relaxed">
                          {formatLocalizedText(isAr ? (featuredAttraction.descriptionAr || featuredAttraction.descriptionEn) : (featuredAttraction.descriptionEn || featuredAttraction.descriptionAr), locale)}
                        </p>

                        <div className="mt-auto">
                          <B2CButton variant="primary" size="md" className="w-full flex items-center justify-center gap-2 uppercase font-black">
                            <Ticket className="w-5 h-5" />
                            Get Ticket
                          </B2CButton>
                        </div>
                      </div>
                    </Link>
                  </B2CCard>
                </section>
              )}

              {/* Grid Section */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-[var(--e3-royal-blue)] rounded-full shadow-[0_0_10px_rgba(26,31,214,0.5)]" />
                  <h2 className="text-3xl md:text-4xl font-black font-righteous uppercase tracking-wide">
                    {isAr ? (cmsData?.gridTitleAr || "استكشف جميع التجارب") : (cmsData?.gridTitleEn || "Explore All Attractions")}
                  </h2>
                </div>

                <AnimatePresence mode="popLayout">
                  {filteredAttractions.length === 0 ? (
                    <B2CEmptyState 
                      title={isAr ? "لا توجد تجارب" : "No experiences found"}
                      description={isAr ? "يرجى تغيير معايير البحث أو التصفية" : "Try adjusting your search query or filters."}
                    />
                  ) : (
                    <motion.div layout className="flex flex-col gap-6">
                      
                      {/* Bento Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {filteredAttractions.slice(0, 5).map((attraction, index) => {
                          const total = Math.min(filteredAttractions.length, 5);
                          let bentoClass = "w-full transition-all duration-300";
                          if (total === 1) bentoClass += " md:col-span-4 h-[400px] md:h-[550px]";
                          else if (total === 2) bentoClass += " md:col-span-2 h-[350px] md:h-[480px]";
                          else if (total === 3) {
                            if (index === 0) bentoClass += " md:col-span-2 md:row-span-2 h-[350px] md:h-[480px]";
                            else bentoClass += " md:col-span-2 h-[220px]";
                          }
                          else if (total === 4) {
                            if (index === 0) bentoClass += " md:col-span-2 md:row-span-2 h-[350px] md:h-[480px]";
                            else if (index === 1) bentoClass += " md:col-span-2 h-[220px]";
                            else bentoClass += " md:col-span-1 h-[220px]";
                          }
                          else {
                            if (index === 0) bentoClass += " md:col-span-2 md:row-span-2 h-[350px] md:h-[480px]";
                            else bentoClass += " md:col-span-1 h-[220px]";
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
                      
                      {/* Slider Grid (> 5 items) */}
                      {filteredAttractions.length > 5 && (
                        <div className="mt-12">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black font-righteous uppercase tracking-wide">
                              {isAr ? "المزيد من التجارب" : "More Experiences"}
                            </h3>
                            <div className="flex gap-2" dir="ltr">
                               <button 
                                 onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                                 className="w-12 h-12 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] flex items-center justify-center transition-all duration-300 active:scale-95 text-[var(--text-primary)] cursor-pointer"
                                 aria-label="Scroll left"
                               >
                                 <ChevronLeft size={20} />
                               </button>
                               <button 
                                 onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                                 className="w-12 h-12 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] flex items-center justify-center transition-all duration-300 active:scale-95 text-[var(--text-primary)] cursor-pointer"
                                 aria-label="Scroll right"
                               >
                                 <ChevronRight size={20} className="rtl:-scale-x-100" />
                               </button>
                            </div>
                          </div>
                          <div 
                            ref={scrollRef}
                            className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-8 scrollbar-hide scroll-smooth"
                          >
                            {filteredAttractions.slice(5).map((attraction, index) => (
                              <div key={attraction.id} className="min-w-[290px] md:min-w-[340px] h-[380px] snap-center shrink-0">
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

              {/* Newsletter Subscriptions */}
              <B2CCard hoverable glow className="w-full relative overflow-hidden p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 border-[rgba(75,0,143,0.3)]">
                <div className="absolute top-0 end-0 w-64 h-64 bg-[var(--e3-purple)]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 start-0 w-64 h-64 bg-[var(--e3-magenta)]/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 w-full md:w-1/2 text-start">
                  <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight font-display uppercase leading-tight">
                    {isAr ? subscribe.titleAr || "" : subscribe.titleEn || ""}
                  </h2>
                  <p className="text-[var(--text-secondary)] font-medium">
                    {isAr ? subscribe.subtitleAr : subscribe.subtitleEn}
                  </p>
                </div>
                <div className="relative z-10 w-full md:w-1/2">
                  <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md md:ms-auto" onSubmit={e => { e.preventDefault(); }}>
                    <input 
                      type="email" 
                      placeholder={isAr ? "عنوان بريدك الإلكتروني" : "Your email address"}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="flex-1 bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 min-h-[48px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--e3-royal-blue)] focus:ring-2 focus:ring-[var(--e3-royal-blue)]/20 transition-all"
                    />
                    <B2CButton type="submit" variant="primary" size="md">
                      {isAr ? "اشترك" : "Subscribe"}
                    </B2CButton>
                  </form>
                </div>
              </B2CCard>

              {/* FAQ Section */}
              {faqs && faqs.length > 0 && (
                <section className="max-w-3xl mx-auto w-full">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-black mb-4 font-righteous uppercase tracking-wide">
                      {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
                    </h2>
                    <p className="text-[var(--text-secondary)] font-medium">
                      {isAr ? "كل ما تحتاج لمعرفته حول تجاربنا" : "Everything you need to know about our experiences."}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {faqs.map((faq: any, i: number) => (
                      <div key={i} className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--e3-purple)]">
                        <button 
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between p-6 text-start focus:outline-none focus:ring-2 focus:ring-[var(--e3-royal-blue)]/50"
                        >
                          <span className="font-bold text-lg text-[var(--text-primary)]">{isAr ? faq.questionAr : faq.questionEn}</span>
                          {openFaq === i 
                            ? <ChevronUp className="w-5 h-5 text-[var(--e3-royal-blue)]" /> 
                            : <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
                          }
                        </button>
                        <AnimatePresence>
                          {openFaq === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 pt-0 text-[var(--text-secondary)] leading-relaxed font-medium">
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
              <section className="w-full py-12 text-center flex flex-col items-center">
                <h2 className="text-3xl font-black mb-6 font-display uppercase">{isAr ? cta.titleAr || "" : cta.titleEn || ""}</h2>
                <B2CButton href={cta.buttonUrl || ""} variant="primary" size="lg">
                  {isAr ? cta.buttonTextAr || "" : cta.buttonTextEn || ""}
                </B2CButton>
              </section>

              {/* Careers CTA Section */}
              <B2CCard hoverable className="w-full p-8 md:p-16 flex flex-col items-center justify-center text-center border-[rgba(75,0,143,0.3)]">
                <h2 className="text-3xl md:text-4xl font-black mb-4 font-display uppercase tracking-wide">
                  {isAr ? careersCta.titleAr || "" : careersCta.titleEn || ""}
                </h2>
                <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-xl font-medium">
                  {isAr ? careersCta.subtitleAr || "" : careersCta.subtitleEn || ""}
                </p>
                <B2CButton href={careersCta.buttonUrl || "/careers"} variant="secondary" size="md">
                  {isAr ? careersCta.buttonTextAr || "" : careersCta.buttonTextEn || ""}
                </B2CButton>
              </B2CCard>

            </>
          )}
        </div>

        {/* Landing Page Cinematic Footer Background */}
        <section className="relative w-full min-h-[50vh] flex flex-col items-center justify-center overflow-hidden border-t border-[var(--border-level-2)]">
          <div className="absolute inset-0 z-0">
            {footer.mediaType === 'IMAGE' && footer.mediaUrl && (
              <img src={footer.mediaUrl} alt="Footer" className="w-full h-full object-cover opacity-30 dark:opacity-40" />
            )}
            {footer.mediaType === 'VIDEO' && footer.mediaUrl && (
              <video src={footer.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40 dark:opacity-50" />
            )}
            {footer.mediaType === 'IFRAME' && footer.mediaUrl && (
              <iframe 
                src={extractUrl(footer.mediaUrl)} 
                className="w-full h-full border-none opacity-40 dark:opacity-50 pointer-events-none" 
                allow="autoplay; fullscreen; xr-spatial-tracking"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            )}
            {footer.mediaType === 'MODEL_3D' && footer.mediaUrl && (
              <iframe 
                src={extractUrl(footer.mediaUrl)} 
                className="w-full h-full border-none opacity-50 dark:opacity-60" 
                allow="autoplay; fullscreen; xr-spatial-tracking"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            )}
            {(!footer.mediaUrl || !footer.mediaType) && (
              <div className="w-full h-full bg-[var(--bg-level-1)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-transparent to-[var(--bg-level-1)]" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-24 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-[var(--text-primary)] font-display uppercase tracking-wide">
              {isAr ? 'عش اللحظة.' : 'Live the Moment.'}
            </h2>
            <p className="text-[var(--text-secondary)] text-lg font-bold">
              {isAr ? 'نصنع ذكريات لا تُنسى في قطر' : 'Creating unforgettable memories in Qatar.'}
            </p>
          </div>
        </section>
      </div>
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
      className="w-full h-full"
    >
      <B2CCard className="flex flex-col h-full relative group overflow-hidden border-[rgba(75,0,143,0.3)]">
        <Link href={`/${locale}/b2c/attractions/${attraction.slug}`} className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-[var(--e3-royal-blue)]/50">
          <div className="absolute inset-0 z-0 bg-zinc-950">
            {attraction.heroThumbnailUrl || attraction.heroMediaUrl || attraction.heroFallbackUrl || attraction.gallery?.[0]?.url ? (
              <img 
                src={attraction.heroThumbnailUrl || attraction.heroMediaUrl || attraction.heroFallbackUrl || attraction.gallery?.[0]?.url} 
                alt={isNameAr ? attraction.nameAr : attraction.nameEn}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-75 group-hover:opacity-90"
              />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop" 
                alt={isNameAr ? attraction.nameAr : attraction.nameEn}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-75 group-hover:opacity-90"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,10,42,0.95)] via-[rgba(8,10,42,0.4)] to-transparent" />
          </div>

          <div className="relative z-10 p-6 flex flex-col h-full justify-end min-h-[220px]">
              <div className="absolute top-6 start-6 flex flex-col gap-2 items-start">
                <B2CStatusBadge status={attraction.computedStatus || ""} />
                {attraction.isSpecialEvent && (
                  <B2CBadge variant="accent">★ Special</B2CBadge>
                )}
              </div>
              
              <div className="absolute top-6 end-6 flex flex-col gap-2 items-end text-right">
                 {attraction.distanceKm !== undefined && (
                   <div className="flex items-center gap-1.5 bg-[var(--surface-default)]/80 backdrop-blur-md text-[var(--text-primary)] px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-level-2)]">
                     <MapPin className="w-3.5 h-3.5 text-[var(--e3-magenta)]" />
                     {attraction.distanceKm < 1 ? 'Nearby' : `${attraction.distanceKm.toFixed(1)} km`}
                   </div>
                 )}
                 {attraction.timingStatus && attraction.timingStatus.status !== 'UNKNOWN' && (
                   <div className={`flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      attraction.timingStatus.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                      attraction.timingStatus.status === 'CLOSING_SOON' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                   }`}>
                     <Clock className="w-3.5 h-3.5" />
                     {attraction.timingStatus.label}
                   </div>
                 )}
              </div>
              
            <div className="mt-auto text-start">
              <h3 className={`font-black mb-2 text-white group-hover:text-[var(--e3-royal-blue)] transition-colors line-clamp-1 font-display uppercase ${isLarge ? 'text-3xl' : 'text-xl'}`}>
                {formatLocalizedText(isNameAr ? (attraction.nameAr || attraction.nameEn) : (attraction.nameEn || attraction.nameAr), locale)}
              </h3>
              
              <p className="text-zinc-300 text-sm mb-4 line-clamp-2 font-medium">
                {formatLocalizedText(isNameAr ? (attraction.descriptionAr || attraction.descriptionEn) : (attraction.descriptionEn || attraction.descriptionAr), locale)}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="font-mono text-xs font-bold text-white bg-[rgba(26,31,214,0.3)] px-3 py-1.5 rounded-lg backdrop-blur-md border border-[var(--e3-royal-blue)]/30 group-hover:border-[var(--e3-magenta)]/50 transition-colors uppercase tracking-wide">
                  {attraction.pricing?.[0] ? `From QAR ${attraction.pricing[0].price}` : 'Free'}
                </span>
                <span className="w-8 h-8 rounded-full bg-[var(--e3-midnight)]/80 flex items-center justify-center text-white border border-[var(--border-level-2)] group-hover:bg-[var(--e3-royal-blue)] group-hover:border-transparent transition-colors backdrop-blur-md font-bold">
                  →
                </span>
              </div>
            </div>
          </div>
        </Link>
      </B2CCard>
    </motion.div>
  );
}
