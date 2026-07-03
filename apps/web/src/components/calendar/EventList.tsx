'use client';

import React from 'react';
import { format } from 'date-fns';
import { Loader2, CalendarX2 } from 'lucide-react';
import { EventCard, CalendarEvent } from './EventCard';

interface EventListProps {
  currentDate: Date;
  events: CalendarEvent[];
  loading: boolean;
  onSelectTickets: (event: CalendarEvent) => void;
}

export function EventList({
  currentDate,
  events,
  loading,
  onSelectTickets
}: EventListProps) {



  // Group events by day, ONLY for the currentDate
  const targetDayStr = format(currentDate, 'yyyy-MM-dd');
  
  const targetDateStart = new Date(currentDate);
  targetDateStart.setHours(0, 0, 0, 0);
  const targetDateEnd = new Date(currentDate);
  targetDateEnd.setHours(23, 59, 59, 999);

  const groupedEvents = events.reduce((acc, event) => {
    const evStart = new Date(event.startTime);
    evStart.setHours(0, 0, 0, 0);
    const evEnd = new Date(event.endTime);
    evEnd.setHours(23, 59, 59, 999);

    if (targetDateStart.getTime() <= evEnd.getTime() && targetDateEnd.getTime() >= evStart.getTime()) {
      if (!acc[targetDayStr]) acc[targetDayStr] = [];
      acc[targetDayStr].push(event);
    }
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
        const [year, month, day] = dayStr.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        return (
          <div key={dayStr} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-white font-satoshi">
                {format(dateObj, 'EEEE, MMMM d')}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {Object.values(
                dayEvents.reduce((acc, ev) => {
                  if (!acc[ev.attractionId]) acc[ev.attractionId] = [];
                  acc[ev.attractionId].push(ev);
                  return acc;
                }, {} as Record<string, CalendarEvent[]>)
              ).map(groupedEvents => (
                <EventCard 
                  key={groupedEvents[0].id} 
                  events={groupedEvents} 
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
