'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, CalendarX2 } from 'lucide-react';
import { EventCard, CalendarEvent } from './EventCard';
import { EventType, AvailabilityType } from './CalendarSidebar';

interface EventListProps {
  currentDate: Date;
  selectedAttractions: string[];
  selectedEventTypes: EventType[];
  availabilityFilter: AvailabilityType;
  onSelectTickets: (event: CalendarEvent) => void;
}

export function EventList({
  currentDate,
  selectedAttractions,
  selectedEventTypes,
  availabilityFilter,
  onSelectTickets
}: EventListProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const month = format(currentDate, 'MM');
        const year = format(currentDate, 'yyyy');
        
        let url = `/api/calendar?month=${month}&year=${year}`;
        
        if (selectedAttractions.length === 1) {
          url += `&attractionId=${selectedAttractions[0]}`;
        }
        
        if (selectedEventTypes.length === 1) {
           url += `&eventType=${selectedEventTypes[0]}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        
        let data: CalendarEvent[] = await res.json();

        // Client-side filtering for multiple selections and availability
        if (selectedAttractions.length > 0) {
          data = data.filter(e => selectedAttractions.includes(e.attractionId));
        }

        if (selectedEventTypes.length > 0) {
          data = data.filter(e => selectedEventTypes.includes(e.eventType));
        }

        if (availabilityFilter !== 'ALL') {
          data = data.filter(e => {
            const remaining = e.capacityGate - e.currentCount;
            if (availabilityFilter === 'SOLD_OUT') return remaining <= 0;
            if (availabilityFilter === 'LIMITED') return remaining > 0 && remaining < 20;
            if (availabilityFilter === 'AVAILABLE') return remaining >= 20;
            return true;
          });
        }

        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    // Debounce slightly to prevent rapid fetching on filter spam
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [currentDate, selectedAttractions, selectedEventTypes, availabilityFilter]);

  // Group events by day
  const groupedEvents = events.reduce((acc, event) => {
    const day = format(new Date(event.startTime), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDays = Object.keys(groupedEvents).sort();

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-bold uppercase tracking-widest text-sm">Loading Events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-lg bg-[#141414] shadow-inner">
        <CalendarX2 className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-zinc-300 mb-2 font-satoshi">No Events Found</h3>
        <p className="text-sm font-medium">Try adjusting your filters or selecting a different month.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {sortedDays.map(dayStr => {
        const dayEvents = groupedEvents[dayStr];
        const dateObj = new Date(dayStr);
        
        return (
          <div key={dayStr} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-white font-satoshi">
                {format(dateObj, 'EEEE, MMMM d')}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {dayEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onSelectTickets={onSelectTickets} 
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
