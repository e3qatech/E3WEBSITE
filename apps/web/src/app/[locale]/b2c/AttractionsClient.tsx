"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAttractionsStore, AttractionStatus, Attraction } from '@/store/useAttractionsStore';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { Search, Activity, ChevronDown, ChevronUp, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    isLoading
  } = useAttractionsStore();

  const [localSearch, setLocalSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  
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

  const filteredAttractions = useMemo(() => {
    return attractions.filter(a => {
      const matchSearch = 
        a.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.nameAr.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchStatus = true;
      if (statusFilter === 'Active Now') matchStatus = !!a.isOpenNow;
      if (statusFilter === 'Coming Soon') matchStatus = !a.isOpenNow;
      
      return matchSearch && matchStatus && (a.id !== featuredAttraction?.id);
    });
  }, [attractions, searchQuery, statusFilter, featuredAttraction]);

  const filterChips: AttractionStatus[] = ['All', 'Active Now', 'Coming Soon', 'Special Events'];
  const isAr = locale === 'ar';
  
  const hero = cmsData?.hero || {};
  const cta = cmsData?.cta || {};
  const subscribe = cmsData?.subscribe || {};
  const faqs = cmsData?.faqs || [];
  const careersCta = cmsData?.careersCta || {};
  const footer = cmsData?.footer || {};

  return (
    <main className="min-h-screen bg-[#0C0C0C] text-[#FAFAFA] font-sans selection:bg-[#F59E0B] selection:text-[#0C0C0C] relative overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      
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
        <div className="absolute inset-0 z-0 bg-[#141414]">
          {hero.mediaType === 'IMAGE' && hero.mediaUrl && (
            <img src={hero.mediaUrl} alt="Hero" className="w-full h-full object-cover opacity-60" />
          )}
          {hero.mediaType === 'VIDEO' && hero.mediaUrl && (
            <video src={hero.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60" />
          )}
          {hero.mediaType === 'IFRAME' && hero.mediaUrl && (
            <iframe src={hero.mediaUrl} className="w-full h-full border-none opacity-60 pointer-events-none" />
          )}
          {hero.mediaType === 'MODEL_3D' && hero.mediaUrl && (
            <iframe src={hero.mediaUrl} className="w-full h-full border-none opacity-80" />
          )}
          {/* Default ambient mesh if no media */}
          {(!hero.mediaUrl || !hero.mediaType) && (
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
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-8 mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-black tracking-tight"
            style={{ fontFamily: 'var(--font-satoshi, inherit)' }}
          >
            {isAr ? hero.headerAr || "اكتشف التجارب" : hero.headerEn || "Discover Experiences"}
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
              <div className="relative flex items-center">
                <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} w-5 h-5 text-[#A1A1AA] peer-focus:text-[#F59E0B] transition-colors`} />
                <input
                  type="search"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={isAr ? "ابحث عن التجارب..." : "Search attractions..."}
                  className={`w-full bg-[#141414]/80 backdrop-blur-md border border-[#27272A] rounded-xl py-4 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-[#FAFAFA] placeholder-[#A1A1AA] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all`}
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
                        : 'bg-[#141414]/80 backdrop-blur-md border-[#27272A] text-[#A1A1AA] hover:border-[#52525B]'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {chip}
                  </button>
                ))}
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
              <div key={i} className="w-full h-80 bg-[#141414] rounded-2xl animate-pulse border border-[#27272A]" />
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {/* Featured Attractions */}
            {featuredAttraction && (
              <section className="w-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  <h2 className="text-3xl font-black">{isAr ? cmsData?.featuredTitleAr || "التجارب المميزة" : cmsData?.featuredTitleEn || "Featured Experiences"}</h2>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full bg-[#141414] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col md:flex-row group"
                >
                  <Link href={`/${locale}/b2c/attractions/${featuredAttraction.slug}`} className="w-full flex flex-col md:flex-row h-full focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
                  <div className="w-full md:w-3/5 h-72 md:h-auto relative overflow-hidden bg-[#0C0C0C]">
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#141414] to-transparent z-10" />
                    {featuredAttraction.heroMediaType === 'VIDEO' ? (
                      <video src={featuredAttraction.heroMediaUrl || ''} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
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

                    <h3 className="text-3xl md:text-4xl font-bold mb-3">{isAr ? featuredAttraction.nameAr : featuredAttraction.nameEn}</h3>
                    <p className="text-[#A1A1AA] mb-8 line-clamp-3">
                      {isAr ? featuredAttraction.descriptionAr : featuredAttraction.descriptionEn || "Experience the pinnacle of entertainment."}
                    </p>

                    <div className="flex items-center gap-4 mt-auto">
                      <div className="flex-1 bg-[#FAFAFA] text-[#0C0C0C] px-6 py-3 rounded-xl font-bold hover:bg-[#F59E0B] hover:text-[#0C0C0C] transition-colors active:scale-95 flex items-center justify-center min-h-[48px] gap-2">
                        <Ticket className="w-5 h-5" /> Get Ticket
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
                <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                <h2 className="text-3xl font-black">{isAr ? cmsData?.gridTitleAr || "جميع التجارب" : cmsData?.gridTitleEn || "All Experiences"}</h2>
              </div>
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[300px] gap-4"
                  >
                    {filteredAttractions.map((attraction, index) => {
                      // Make every 4th item span 2 columns and 2 rows for a brick layout
                      const isLarge = index % 5 === 0;
                      return (
                        <AttractionBrick 
                          key={attraction.id} 
                          attraction={attraction} 
                          index={index} 
                          locale={locale} 
                          isLarge={isLarge}
                        />
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Subscribe Section */}
            <section className="w-full bg-gradient-to-br from-[#141414] to-[#0a0a0a] border border-[#27272A] rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F59E0B]/5 rounded-full blur-3xl" />
              
              <div className="relative z-10 w-full md:w-1/2">
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                  {isAr ? subscribe.titleAr || "لا تفوت المرح!" : subscribe.titleEn || "Never Miss the Fun!"}
                </h2>
                <p className="text-[#A1A1AA] text-lg">
                  {isAr ? subscribe.subtitleAr : subscribe.subtitleEn || "Subscribe to get exclusive access to early-bird tickets and announcements."}
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
                    className="flex-1 bg-[#0C0C0C] border border-[#27272A] rounded-xl px-4 py-3 min-h-[48px] text-[#FAFAFA] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all"
                  />
                  <button type="submit" className="bg-[#F59E0B] text-[#0C0C0C] font-bold px-6 py-3 rounded-xl min-h-[48px] hover:bg-[#D97706] active:scale-95 transition-all whitespace-nowrap">
                    {isAr ? "اشترك" : "Subscribe"}
                  </button>
                </form>
              </div>
            </section>

            {/* FAQ Section */}
            {faqs && faqs.length > 0 && (
              <section className="max-w-3xl mx-auto w-full">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-black mb-4">{isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</h2>
                  <p className="text-[#A1A1AA]">{isAr ? "كل ما تحتاج لمعرفته حول تجاربنا" : "Everything you need to know about our experiences."}</p>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq: any, i: number) => (
                    <div key={i} className="bg-[#141414] border border-[#27272A] rounded-2xl overflow-hidden transition-colors hover:border-[#52525B]">
                      <button 
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      >
                        <span className="font-bold text-lg">{isAr ? faq.questionAr : faq.questionEn}</span>
                        {openFaq === i ? <ChevronUp className="w-5 h-5 text-[#F59E0B]" /> : <ChevronDown className="w-5 h-5 text-[#A1A1AA]" />}
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
              <h2 className="text-3xl font-black mb-6">{isAr ? cta.titleAr || "هل لديك سؤال؟" : cta.titleEn || "Have a question?"}</h2>
              <Link 
                href={cta.buttonUrl || "/contact"}
                className="bg-[#27272A] text-[#FAFAFA] border border-[#3F3F46] hover:bg-[#3F3F46] px-8 py-4 rounded-xl font-bold transition-colors min-h-[48px] inline-flex items-center"
              >
                {isAr ? cta.buttonTextAr || "اتصل بنا" : cta.buttonTextEn || "Contact Us"}
              </Link>
            </section>

            {/* Careers CTA Section */}
            <section className="w-full bg-[#141414] border border-[#27272A] rounded-3xl p-8 md:p-16 flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-4">{isAr ? careersCta.titleAr || "انضم لفريقنا" : careersCta.titleEn || "Join Our Team"}</h2>
              <p className="text-[#A1A1AA] text-lg mb-8 max-w-xl">
                {isAr ? careersCta.subtitleAr || "نحن نبحث دائماً عن الموهوبين." : careersCta.subtitleEn || "We're always looking for talented individuals to join our crew."}
              </p>
              <Link 
                href={careersCta.buttonUrl || "/careers"}
                className="bg-[#FAFAFA] text-[#0C0C0C] px-8 py-4 rounded-xl font-bold hover:bg-[#F59E0B] hover:text-[#0C0C0C] transition-colors active:scale-95 min-h-[48px] inline-flex items-center"
              >
                {isAr ? careersCta.buttonTextAr || "عرض الوظائف" : careersCta.buttonTextEn || "View Careers"}
              </Link>
            </section>

          </>
        )}
      </div>

      {/* Landing Page Footer Background */}
      <section className="relative w-full min-h-[50vh] flex flex-col items-center justify-center overflow-hidden border-t border-[#27272A]">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 bg-[#0C0C0C]">
          {footer.mediaType === 'IMAGE' && footer.mediaUrl && (
            <img src={footer.mediaUrl} alt="Footer" className="w-full h-full object-cover opacity-60" />
          )}
          {footer.mediaType === 'VIDEO' && footer.mediaUrl && (
            <video src={footer.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60" />
          )}
          {footer.mediaType === 'IFRAME' && footer.mediaUrl && (
            <iframe src={footer.mediaUrl} className="w-full h-full border-none opacity-60 pointer-events-none" />
          )}
          {footer.mediaType === 'MODEL_3D' && footer.mediaUrl && (
            <iframe src={footer.mediaUrl} className="w-full h-full border-none opacity-80" />
          )}
          {(!footer.mediaUrl || !footer.mediaType) && (
            <div className="w-full h-full bg-[#0C0C0C]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-[#0C0C0C]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white drop-shadow-lg">
            {isAr ? 'عش اللحظة.' : 'Live the Moment.'}
          </h2>
          <p className="text-[#A1A1AA] text-lg font-medium drop-shadow">
            {isAr ? 'نصنع ذكريات لا تُنسى في قطر' : 'Creating unforgettable memories in Qatar.'}
          </p>
        </div>
      </section>
    </main>
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
      className={`bg-[#141414] border border-[#27272A] rounded-3xl overflow-hidden group hover:border-[#52525B] hover:shadow-2xl hover:shadow-[#F59E0B]/5 transition-all flex flex-col relative ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      <Link href={`/${locale}/b2c/attractions/${attraction.slug}`} className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-[#F59E0B]">
        <div className="absolute inset-0 z-0 bg-[#27272A]">
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
          ) : attraction.gallery?.[0] ? (
            <img 
              src={attraction.gallery[0].url} 
              alt={isNameAr ? attraction.nameAr : attraction.nameEn}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/50 to-transparent" />
        </div>

        <div className="relative z-10 p-6 flex flex-col h-full justify-end">
          <div className="absolute top-6 left-6">
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

          <div className="mt-auto">
            <h3 className={`font-bold mb-2 text-[#FAFAFA] group-hover:text-[#F59E0B] transition-colors line-clamp-1 ${isLarge ? 'text-3xl' : 'text-xl'}`}>
              {isNameAr ? attraction.nameAr : attraction.nameEn}
            </h3>
            
            <p className="text-[#A1A1AA] text-sm mb-4 line-clamp-2">
              {isNameAr ? attraction.descriptionAr : attraction.descriptionEn}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="font-mono text-sm text-[#FAFAFA] bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md">
                {attraction.pricing?.[0] ? `From QAR ${attraction.pricing[0].price}` : 'Free'}
              </span>
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[#F59E0B] group-hover:text-[#0C0C0C] transition-colors backdrop-blur-md">
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
