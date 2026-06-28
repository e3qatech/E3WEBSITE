'use client';

import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { CalendarSidebar, EventType, AvailabilityType } from './CalendarSidebar';
import { EventList } from './EventList';
import { SubscribeSection } from './SubscribeSection';
import { TicketSelectionModal } from './TicketSelectionModal';
import { CalendarEvent } from './EventCard';

interface CalendarViewProps {
  initialAttractions: { id: string; nameEn: string; nameAr: string }[];
}

export function CalendarView({ initialAttractions }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityType>('ALL');
  
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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

  return (
    <div className="min-h-screen bg-[#0C0C0C] font-sans text-zinc-50 relative selection:bg-amber-500 selection:text-black">
      
      {/* Industrial Grain Texture */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Mobile Header / Filter Toggle */}
      <div className="md:hidden sticky top-20 z-30 bg-[#0C0C0C]/80 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center justify-between">
        <h1 className="text-xl font-black text-white uppercase tracking-widest font-satoshi">Calendar</h1>
        <button 
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm font-bold text-white uppercase"
        >
          <Filter className="w-4 h-4" /> Filters
          {(selectedAttractions.length > 0 || selectedEventTypes.length > 0) && (
            <span className="w-5 h-5 flex items-center justify-center bg-amber-500 text-black rounded-full text-xs font-mono font-bold">
              {selectedAttractions.length + selectedEventTypes.length}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        
        {/* Desktop Header */}
        <div className="hidden md:block mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4 font-satoshi">
            Events <span className="text-amber-500">Calendar</span>
          </h1>
          <p className="text-lg text-zinc-400 font-medium max-w-2xl font-sans">
            Find your next experience. Browse upcoming special events, festivals, and exclusive private sessions across all our attractions.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative">
          
          {/* Sidebar */}
          <div className="md:w-80 shrink-0">
            <div className="md:sticky md:top-32">
              <CalendarSidebar 
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                attractions={initialAttractions}
                selectedAttractions={selectedAttractions}
                onAttractionToggle={toggleAttraction}
                selectedEventTypes={selectedEventTypes}
                onEventTypeToggle={toggleEventType}
                availabilityFilter={availabilityFilter}
                onAvailabilityChange={setAvailabilityFilter}
                isMobileFilterOpen={isMobileFilterOpen}
                setMobileFilterOpen={setMobileFilterOpen}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <EventList 
              currentDate={currentDate}
              selectedAttractions={selectedAttractions}
              selectedEventTypes={selectedEventTypes}
              availabilityFilter={availabilityFilter}
              onSelectTickets={setSelectedEvent}
            />
          </div>

        </div>

        <SubscribeSection />

      </div>

      <TicketSelectionModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </div>
  );
}
