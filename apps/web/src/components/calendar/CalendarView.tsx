'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from "framer-motion";
import { TopFilterBar, EventType } from './TopFilterBar';
import { EventList } from './EventList';
import { SubscribeSection } from './SubscribeSection';
import { TicketSelectionModal } from './TicketSelectionModal';
import { BulkBookingModal } from './BulkBookingModal';
import { CalendarEvent } from './EventCard';
import { useLocale } from '@/components/layout/LocaleProvider';
import { E3LivingHero } from '@/components/b2c/hero/E3LivingHero';

interface CalendarViewProps {
  initialAttractions?: { id: string; nameEn: string; nameAr: string }[];
  cmsContent?: any;
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
  cmsContent,
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

  // QF-04-D: Sanitize title to guarantee no concatenation with eyebrow
  const sanitizeHeroTitle = (raw: string | undefined | null): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    let cleaned = raw.trim();
    // Strip leading English eyebrow variations
    cleaned = cleaned.replace(/^Events\s*Calendar\s*:?\s*/i, '');
    cleaned = cleaned.replace(/^EVENTS\s*CALENDAR\s*:?\s*/i, '');
    // Strip leading Arabic eyebrow variations
    cleaned = cleaned.replace(/^جدول\s*الفعاليات\s*:?\s*/, '');
    cleaned = cleaned.replace(/^الفعاليات\s*والعروض\s*:?\s*/, '');
    cleaned = cleaned.trim();
    return cleaned.length > 0 ? cleaned : null;
  };

  // QF-04-D: Resolve strict locale-aware Hero Copy & Separate Eyebrow
  const rawTitle = isAr
    ? (titleAr || (title && /[\u0600-\u06FF]/.test(title) ? title : null))
    : (titleEn || title);

  const heroTitle = isAr
    ? (sanitizeHeroTitle(rawTitle) || "اكتشف تجربتك القادمة مع إي ثري")
    : (sanitizeHeroTitle(rawTitle) || "Find Your Next E3 Experience");

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
      <div className="min-h-screen font-poppins bg-[var(--bg-level-1)] text-[var(--text-primary)] relative transition-colors duration-300 selection:bg-[#F43F5E]/30" dir={isAr ? 'rtl' : 'ltr'}>
      
        {/* Interactive Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-64 -start-64 w-[800px] h-[800px] bg-[#7C3AED] rounded-full mix-blend-screen filter blur-[128px] opacity-15"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 -end-64 w-[600px] h-[600px] bg-[#F43F5E] rounded-full mix-blend-screen filter blur-[128px] opacity-15"
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

        {/* QF-04-D: E3 Living Hero System for Calendar */}
        <E3LivingHero
          eyebrowEn={eyebrowEn || cmsContent?.hero?.eyebrowEn || cmsContent?.eyebrowEn || "Events Calendar"}
          eyebrowAr={eyebrowAr || cmsContent?.hero?.eyebrowAr || cmsContent?.eyebrowAr || "جدول الفعاليات"}
          fixedHeadlineEn={cmsContent?.hero?.fixedHeadlineEn || cmsContent?.fixedHeadlineEn || (titleEn || title ? sanitizeHeroTitle(titleEn || title) : null) || heroTitle}
          fixedHeadlineAr={cmsContent?.hero?.fixedHeadlineAr || cmsContent?.fixedHeadlineAr || (titleAr || title ? sanitizeHeroTitle(titleAr || title) : null) || heroTitle}
          headlineTemplateEn={cmsContent?.hero?.headlineTemplateEn || cmsContent?.headlineTemplateEn || cmsContent?.hero?.fixedHeadlineEn || cmsContent?.fixedHeadlineEn}
          headlineTemplateAr={cmsContent?.hero?.headlineTemplateAr || cmsContent?.headlineTemplateAr || cmsContent?.hero?.fixedHeadlineAr || cmsContent?.fixedHeadlineAr}
          rotatingWordsEn={
            Array.isArray(cmsContent?.hero?.rotatingWordsEn || cmsContent?.rotatingWordsEn) && (cmsContent?.hero?.rotatingWordsEn || cmsContent?.rotatingWordsEn).length > 0
              ? (cmsContent?.hero?.rotatingWordsEn || cmsContent?.rotatingWordsEn)
              : ["TODAY", "THIS WEEK", "THIS WEEKEND", "SOON"]
          }
          rotatingWordsAr={
            Array.isArray(cmsContent?.hero?.rotatingWordsAr || cmsContent?.rotatingWordsAr) && (cmsContent?.hero?.rotatingWordsAr || cmsContent?.rotatingWordsAr).length > 0
              ? (cmsContent?.hero?.rotatingWordsAr || cmsContent?.rotatingWordsAr)
              : ["اليوم", "هذا الأسبوع", "عطلة نهاية الأسبوع", "قريباً"]
          }
          descriptionEn={descriptionEn || cmsContent?.hero?.subtitleEn || cmsContent?.descriptionEn || heroDescription}
          descriptionAr={descriptionAr || cmsContent?.hero?.subtitleAr || cmsContent?.descriptionAr || heroDescription}
          primaryCta={{
            labelEn: isAr ? "تصفح الجدول" : "Browse Schedule",
            labelAr: "تصفح الجدول",
            url: "#calendar-schedule"
          }}
          secondaryCta={{
            labelEn: isAr ? "باقات المجموعات" : "Book Group Pass",
            labelAr: "باقات المجموعات",
            url: "/{locale}/b2c/packages"
          }}
          media={{
            mediaType: (heroMediaType || cmsContent?.hero?.mediaType || cmsContent?.heroMedia?.mediaType || "IMAGE").toUpperCase(),
            mediaUrl: heroMediaUrl || cmsContent?.hero?.mediaUrl || cmsContent?.heroMedia?.mediaUrl || "",
            posterUrl: cmsContent?.hero?.posterUrl || cmsContent?.heroMedia?.posterUrl || ""
          }}
          preset={cmsContent?.preset || "living-timeline"}
          animationSpeed={cmsContent?.hero?.animationSpeed || cmsContent?.animationSpeed || 2800}
          animationDuration={cmsContent?.hero?.animationDuration || cmsContent?.animationDuration || 600}
          animationType={cmsContent?.hero?.animationType || cmsContent?.animationType || "blur-morph"}
          wordStyle={cmsContent?.hero?.wordStyle || cmsContent?.wordStyle || "static-gradient"}
          alignmentEn={cmsContent?.hero?.alignmentEn || cmsContent?.alignmentEn || cmsContent?.alignment || "center"}
          alignmentAr={cmsContent?.hero?.alignmentAr || cmsContent?.alignmentAr || cmsContent?.alignmentAr || "center"}
          alignment={cmsContent?.hero?.alignment || cmsContent?.alignment}
          enableRotatingWords={Boolean(cmsContent?.enableRotatingWords || (cmsContent?.hero?.rotatingWordsEn && cmsContent.hero.rotatingWordsEn.length > 0))}
          locale={locale}
          scrollIndicator={false}
          eyebrowTestId="calendar-hero-eyebrow"
          titleTestId="calendar-hero-title"
          descriptionTestId="calendar-hero-description"
          className="min-h-[48vh] pt-24 pb-8"
        />

        {/* Main Content Area */}
        <div className="relative z-10">
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
                <div className="absolute start-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--bg-level-1)] to-transparent z-10 rtl:bg-gradient-to-l" />
                <div className="absolute end-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--bg-level-1)] to-transparent z-10 rtl:bg-gradient-to-r" />
                <motion.div 
                  className="flex gap-16 w-max px-8"
                  animate={{ x: isAr ? ["0%", "50%"] : ["0%", "-50%"] }}
                  transition={{ ease: "linear", duration: discounts.length * 5, repeat: Infinity }}
                >
                  {[...discounts, ...discounts, ...discounts, ...discounts].map((discount: any, idx) => (
                    <div key={`${discount.id}-${idx}`} className="flex items-center gap-4 shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-sm">{discount.title}</span>
                      <span className="text-[var(--text-tertiary)] font-black">/</span>
                      <span className="text-[var(--text-primary)] font-black text-base">{discount.discount}</span>
                      <span className="text-[var(--text-tertiary)] font-black">/</span>
                      <span className="text-[var(--text-secondary)] text-xs tracking-wider uppercase">
                        {isAr ? 'الرمز:' : 'Code:'} <span className="text-[var(--text-primary)] font-mono bg-[var(--surface-default)] px-2 py-0.5 rounded ms-1 border border-[var(--border-level-2)] shadow-sm">{discount.promoCode}</span>
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
