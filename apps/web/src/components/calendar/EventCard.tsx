import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { MapPin, Clock, Tag, ChevronRight } from 'lucide-react';
import { EventType } from './CalendarSidebar';

export interface CalendarEvent {
  id: string;
  attractionId: string;
  attractionNameEn: string;
  attractionNameAr: string;
  attractionSlug: string;
  thumbnail: string | null;
  startTime: string | Date;
  endTime: string | Date;
  eventType: EventType;
  price: string | null;
  capacityGate: number;
  currentCount: number;
  isAvailable: boolean;
}

interface EventCardProps {
  event: CalendarEvent;
  onSelectTickets: (event: CalendarEvent) => void;
}

export function EventCard({ event, onSelectTickets }: EventCardProps) {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  
  const remaining = event.capacityGate - event.currentCount;
  
  // Status logic
  let statusBadge = null;
  if (remaining <= 0) {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-500 rounded-md border border-red-500/30">Sold Out</div>;
  } else if (remaining < 20) {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 rounded-md border border-amber-500/30">Limited: {remaining} Left</div>;
  } else {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-500 rounded-md border border-emerald-500/30">Available</div>;
  }

  // Type badge colors
  const typeColors = {
    REGULAR: 'bg-zinc-800 text-zinc-300',
    SPECIAL: 'bg-indigo-500 text-white font-bold',
    FESTIVAL: 'bg-fuchsia-500 text-white font-bold',
    PRIVATE: 'bg-rose-500 text-white font-bold',
  };

  return (
    <div className="group relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden transition-all hover:bg-zinc-900 hover:border-zinc-700">
      
      {/* Type Badge Floating */}
      <div className={`absolute top-4 left-4 z-10 px-2 py-1 text-[10px] uppercase tracking-widest rounded-md ${typeColors[event.eventType] || typeColors.REGULAR}`}>
        {event.eventType}
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* Left: Thumbnail & Date Block */}
        <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-zinc-950">
          {event.thumbnail ? (
            <img 
              src={event.thumbnail} 
              alt={event.attractionNameEn}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <span className="text-zinc-700 font-bold uppercase tracking-widest">No Image</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent md:bg-gradient-to-r" />

          {/* Date Block Overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <div className="text-sm font-medium text-emerald-400 uppercase tracking-widest">
              {format(startDate, 'MMM')}
            </div>
            <div className="text-3xl font-black leading-none">
              {format(startDate, 'dd')}
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-6 flex flex-col justify-between relative z-10 bg-gradient-to-b from-transparent to-zinc-950/50">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                <Link href={`/en/b2c/attractions/${event.attractionSlug}`} className="hover:text-emerald-400 transition-colors">
                  {event.attractionNameEn}
                </Link>
              </h3>
              {statusBadge}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-medium mb-6">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-500" />
                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-500" />
                Doha, Qatar
              </div>
              {event.price && (
                <div className="flex items-center gap-1.5 text-white bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  From {event.price}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/60 pt-5 mt-auto">
            <Link 
              href={`/en/b2c/attractions/${event.attractionSlug}`}
              className="text-sm font-bold text-zinc-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              View Detail <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              disabled={remaining <= 0}
              onClick={() => onSelectTickets(event)}
              className="px-6 py-2.5 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              {remaining <= 0 ? 'Sold Out' : 'Select Tickets'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
