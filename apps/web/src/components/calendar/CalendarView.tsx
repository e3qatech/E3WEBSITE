'use client';

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { TopFilterBar, EventType, AvailabilityType } from './TopFilterBar';
import { EventList } from './EventList';
import { SubscribeSection } from './SubscribeSection';
import { TicketSelectionModal } from './TicketSelectionModal';
import { BulkBookingModal } from './BulkBookingModal';
import { CalendarEvent } from './EventCard';
import { HeroViewer } from '@/components/attractions/detail/HeroViewer';

interface CalendarViewProps {
  initialAttractions: { id: string; nameEn: string; nameAr: string }[];
  heroMediaType?: string;
  heroMediaUrl?: string;
  title?: string;
  tagline?: string;
  discounts?: any[];
}

export function CalendarView({ initialAttractions, heroMediaType, heroMediaUrl, title, tagline, discounts = [] }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  
  // New Filter States
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isBulkBookingOpen, setIsBulkBookingOpen] = useState(false);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const { format, startOfMonth, endOfMonth } = await import('date-fns');
        const month = format(currentDate, 'MM');
        const year = format(currentDate, 'yyyy');
        
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', startOfMonth(currentDate).toISOString());
        queryParams.append('endDate', endOfMonth(currentDate).toISOString());
        
        selectedAttractions.forEach(id => queryParams.append('attractions', id));
        selectedEventTypes.forEach(type => queryParams.append('types', type));
        if (isDiscountActive) queryParams.append('discount', 'true');

        const res = await fetch(`/api/calendar?${queryParams.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch events');
        
        const data = await res.json();
        setEvents(data);
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
  }, [currentDate, selectedAttractions, selectedEventTypes, isDiscountActive]);

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

  return (
    <div className="min-h-screen bg-[#0C0C0C] font-sans text-zinc-50 relative selection:bg-amber-500 selection:text-black">
      
      {/* Dynamic Hero Viewer or Fallback Background */}
      {heroMediaUrl ? (
        <div className="absolute inset-0 z-0 h-[100vh] w-full">
          <HeroViewer 
            title={title || "Events Calendar"}
            tagline={tagline || "Find your next experience. Browse upcoming special events, festivals, and exclusive private sessions."}
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

          <div className="pt-24 pb-8 text-center max-w-4xl mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tight mb-6 font-satoshi drop-shadow-lg">
              {title ? title : <>Events <span className="text-amber-500">Calendar</span></>}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto font-sans leading-relaxed drop-shadow-lg">
              {tagline || "Find your next experience. Browse upcoming special events, festivals, and exclusive private sessions across all our attractions."}
            </p>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className={`relative z-10 ${heroMediaUrl ? 'pt-[70vh]' : ''}`}>
        <TopFilterBar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          attractions={initialAttractions}
          selectedAttractions={selectedAttractions}
          onAttractionToggle={toggleAttraction}
          selectedEventTypes={selectedEventTypes}
          onEventTypeToggle={toggleEventType}
          isDiscountActive={isDiscountActive}
          onDiscountToggle={() => setIsDiscountActive(!isDiscountActive)}
          onResetFilters={resetFilters}
          onBulkBookingClick={() => setIsBulkBookingOpen(true)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          
          {/* Partner Discounts Section (Scroll Ticker) */}
          {discounts && discounts.length > 0 && (
            <div className="mb-12 w-full overflow-hidden bg-amber-500/10 border-y border-amber-500/20 py-4 relative">
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
              <motion.div 
                className="flex gap-16 w-max px-8"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: discounts.length * 5, repeat: Infinity }}
              >
                {[...discounts, ...discounts, ...discounts, ...discounts].map((discount: any, idx) => (
                  <div key={`${discount.id}-${idx}`} className="flex items-center gap-4 shrink-0">
                    <span className="text-amber-500 font-bold uppercase tracking-widest">{discount.title}</span>
                    <span className="text-zinc-600 font-black">/</span>
                    <span className="text-white font-black text-lg">{discount.discount}</span>
                    <span className="text-zinc-600 font-black">/</span>
                    <span className="text-zinc-400 text-sm tracking-wider uppercase">Code: <span className="text-white font-mono bg-white/10 px-2 py-1 rounded ml-1 border border-white/20">{discount.promoCode}</span></span>
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
        </div>

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
          attractions={initialAttractions}
        />
      </div>
    </div>
  );
}
