'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from "framer-motion";
import { TopFilterBar, EventType } from './TopFilterBar';
import { EventList } from './EventList';
import { SubscribeSection } from './SubscribeSection';
import { TicketSelectionModal } from './TicketSelectionModal';
import { BulkBookingModal } from './BulkBookingModal';
import { CalendarEvent } from './EventCard';
import { HeroViewer } from '@/components/attractions/detail/HeroViewer';
import { useLocale } from '@/components/layout/LocaleProvider';

interface CalendarViewProps {
  initialAttractions?: { id: string; nameEn: string; nameAr: string }[];
  heroMediaType?: string;
  heroMediaUrl?: string;
  footerMediaType?: string;
  footerMediaUrl?: string;
  footerPosterUrl?: string;
  eyebrowEn?: string;
  eyebrowAr?: string;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  title?: string;
  tagline?: string;
  discounts?: any[];
}

export function CalendarView({
  heroMediaType,
  heroMediaUrl,
  eyebrowEn,
  eyebrowAr,
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  title,
  tagline,
  discounts = []
}: CalendarViewProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  
  // Filter States
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isBulkBookingOpen, setIsBulkBookingOpen] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch only eligible published events for the selected date in Qatar
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const { format } = await import('date-fns');
        
        const queryParams = new URLSearchParams();
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        queryParams.append('startDate', dateStr);
        queryParams.append('endDate', dateStr);
        queryParams.append('locale', locale);
        queryParams.append('t', Date.now().toString());
        
        selectedAttractions.forEach(id => queryParams.append('attractions', id));
        selectedEventTypes.forEach(type => queryParams.append('types', type));
        if (isDiscountActive) queryParams.append('discount', 'true');

        const res = await fetch(`/api/calendar?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch events');
        
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [currentDate, selectedAttractions, selectedEventTypes, isDiscountActive, locale]);

  // QF-04-C: Only include destinations having at least one eligible published occurrence on visible date
  const scheduledDestinations = useMemo(() => {
    const map = new Map<string, { id: string; nameEn: string; nameAr: string }>();
    events.forEach(ev => {
      if (ev.attractionId) {
        const nameEn = ev.attractionNameEn || 'Destination';
        const nameAr = ev.attractionNameAr || ev.attractionNameEn || 'وجهة';
        map.set(ev.attractionId, {
          id: ev.attractionId,
          nameEn,
          nameAr,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }, [events]);

  const effectiveSelectedAttractions = useMemo(() => {
    if (selectedAttractions.length === 0 || scheduledDestinations.length === 0) return [];
    const validIds = new Set(scheduledDestinations.map(d => d.id));
    return selectedAttractions.filter(id => validIds.has(id));
  }, [selectedAttractions, scheduledDestinations]);

  const toggleAttraction = (id: string) => {
    setSelectedAttractions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleEventType = (type: EventType) => {
    setSelectedEventTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSelectedAttractions([]);
    setSelectedEventTypes([]);
    setIsDiscountActive(false);
    setCurrentDate(new Date());
  };

  // QF-04-C: Resolve strict locale-aware Hero Copy
  const heroEyebrow = isAr
    ? (eyebrowAr || "جدول الفعاليات")
    : (eyebrowEn || "EVENTS CALENDAR");

  const heroTitle = isAr
    ? (titleAr || (title && /[\u0600-\u06FF]/.test(title) ? title : null) || "اكتشف تجربتك القادمة مع إي ثري")
    : (titleEn || title || "Find Your Next E3 Experience");

  const heroDescription = isAr
    ? (descriptionAr || (tagline && /[\u0600-\u06FF]/.test(tagline) ? tagline : null) || "استكشف الفعاليات القادمة والتجارب العائلية والمهرجانات الموسمية والأنشطة المميزة في قطر.")
    : (descriptionEn || tagline || "Find your next experience. Browse upcoming special events, festivals, and exclusive private sessions across all our attractions.");

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-righteous { font-family: 'Righteous', cursive; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}} />
      <div className="min-h-screen font-poppins bg-[#0F0F23] text-zinc-50 relative selection:bg-[#F43F5E]/30 selection:text-zinc-950" dir={isAr ? 'rtl' : 'ltr'}>
      
        {/* Interactive Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-64 -start-64 w-[800px] h-[800px] bg-[#7C3AED] rounded-full mix-blend-screen filter blur-[128px] opacity-20"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 -end-64 w-[600px] h-[600px] bg-[#F43F5E] rounded-full mix-blend-screen filter blur-[128px] opacity-20"
          />
        </div>

        {/* Dynamic Hero Viewer or Semantic Text Hero */}
        {heroMediaUrl ? (
          <div className="absolute inset-0 z-0 h-[100vh] w-full">
            <HeroViewer 
              title={heroTitle}
              tagline={heroDescription}
              mediaType={heroMediaType || 'IMAGE'}
              mediaUrl={heroMediaUrl}
            />
          </div>
        ) : (
          <>
            {/* Industrial Grain Texture */}
            <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <filter id="noise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noise)" />
              </svg>
            </div>

            {/* QF-04-C: Semantic, Accessible Hero Header with Separate Eyebrow, Title & Description */}
            <header className="pt-28 pb-10 text-center max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
              {/* 1. Semantic Eyebrow Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{heroEyebrow}</span>
              </div>

              {/* 2. Semantic Display Headline (H1) */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-5 font-syne drop-shadow-xl break-words">
                {heroTitle}
              </h1>

              {/* 3. Semantic Descriptive Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-zinc-300 font-medium max-w-2xl mx-auto font-sans leading-relaxed drop-shadow-md">
                {heroDescription}
              </p>
            </header>
          </>
        )}

        {/* Main Content Area */}
        <div className={`relative z-10 ${heroMediaUrl ? 'pt-[70vh]' : ''}`}>
          <TopFilterBar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            attractions={scheduledDestinations}
            selectedAttractions={effectiveSelectedAttractions}
            onAttractionToggle={toggleAttraction}
            selectedEventTypes={selectedEventTypes}
            onEventTypeToggle={toggleEventType}
            isDiscountActive={isDiscountActive}
            onDiscountToggle={() => setIsDiscountActive(!isDiscountActive)}
            onResetFilters={resetFilters}
            onBulkBookingClick={() => setIsBulkBookingOpen(true)}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            
            {/* Partner Discounts Section (Scroll Ticker) */}
            {discounts && discounts.length > 0 && (
              <div className="mb-10 w-full overflow-hidden bg-emerald-500/10 border-y border-emerald-500/20 py-3.5 relative">
                <div className="absolute start-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10 rtl:bg-gradient-to-l" />
                <div className="absolute end-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10 rtl:bg-gradient-to-r" />
                <motion.div 
                  className="flex gap-16 w-max px-8"
                  animate={{ x: isAr ? ["0%", "50%"] : ["0%", "-50%"] }}
                  transition={{ ease: "linear", duration: discounts.length * 5, repeat: Infinity }}
                >
                  {[...discounts, ...discounts, ...discounts, ...discounts].map((discount: any, idx) => (
                    <div key={`${discount.id}-${idx}`} className="flex items-center gap-4 shrink-0">
                      <span className="text-emerald-500 font-bold uppercase tracking-widest text-sm">{discount.title}</span>
                      <span className="text-zinc-600 font-black">/</span>
                      <span className="text-white font-black text-base">{discount.discount}</span>
                      <span className="text-zinc-600 font-black">/</span>
                      <span className="text-zinc-400 text-xs tracking-wider uppercase">
                        {isAr ? 'الرمز:' : 'Code:'} <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded ms-1 border border-white/20">{discount.promoCode}</span>
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            <div className="w-full">
              <EventList 
                currentDate={currentDate}
                events={events}
                loading={loading}
                onSelectTickets={setSelectedEvent}
              />
            </div>
            <SubscribeSection />
          </main>

          <TicketSelectionModal 
            isOpen={!!selectedEvent} 
            onClose={() => setSelectedEvent(null)}
            event={selectedEvent}
            onOpenBulkBooking={() => {
              setSelectedEvent(null);
              setIsBulkBookingOpen(true);
            }}
          />

          <BulkBookingModal
            isOpen={isBulkBookingOpen}
            onClose={() => setIsBulkBookingOpen(false)}
            attractions={scheduledDestinations}
          />
        </div>
      </div>
    </>
  );
}
