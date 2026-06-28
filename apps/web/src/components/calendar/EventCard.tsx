import React from 'react';
import Link from 'next/link';
import { format, isPast, differenceInMinutes } from 'date-fns';
import { MapPin, Clock, Tag, ChevronRight, ExternalLink } from 'lucide-react';
export type EventType = 'REGULAR' | 'SPECIAL' | 'FESTIVAL' | 'PRIVATE';

export interface CalendarEvent {
  id: string;
  attractionId: string;
  attractionNameEn: string;
  attractionNameAr: string;
  attractionSlug: string;
  ticketingUrl?: string | null;
  title: string | null;
  description: string | null;
  thumbnail: string | null;
  startTime: string | Date;
  endTime: string | Date;
  eventType: EventType;
  price: string | null;
  capacityGate: number;
  currentCount: number;
  isAvailable: boolean;
  hasOffer?: boolean;
}

interface EventCardProps {
  events: CalendarEvent[];
  onSelectTickets: (event: CalendarEvent) => void;
}

export function EventCard({ events, onSelectTickets }: EventCardProps) {
  const event = events[0]; // Base details on the first event
  const startDate = new Date(event.startTime);
  const endDate = new Date(events[events.length - 1].endTime);
  
  // Status logic for overall availability
  const totalRemaining = events.reduce((sum, e) => sum + (e.capacityGate - e.currentCount), 0);
  let statusBadge = null;
  const now = new Date();
  const minsLeft = differenceInMinutes(endDate, now);

  if (minsLeft < 0) {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-500/20 text-zinc-400 rounded-sm border border-zinc-500/30">Not Available</div>;
  } else if (minsLeft <= 60) {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-rose-500/20 text-rose-500 rounded-sm border border-rose-500/30">Closing Soon</div>;
  } else if (totalRemaining <= 0) {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-red-500/20 text-red-500 rounded-sm border border-red-500/30">Sold Out</div>;
  } else {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-500 rounded-sm border border-emerald-500/30">Available</div>;
  }

  // Type badge colors
  const typeColors = {
    REGULAR: 'bg-zinc-800 text-zinc-300',
    SPECIAL: 'bg-amber-500 text-black font-bold',
    FESTIVAL: 'bg-indigo-500 text-white font-bold',
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
            <div className="text-sm font-medium text-amber-500 font-mono uppercase tracking-widest">
              {format(startDate, 'MMM')}
            </div>
            <div className="text-3xl font-black leading-none font-satoshi">
              {format(startDate, 'dd')}
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-6 flex flex-col justify-between relative z-10 bg-gradient-to-b from-transparent to-zinc-950/50">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex flex-col">
                {event.title && (
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-tight font-satoshi mb-1">
                    {event.title}
                  </h3>
                )}
                <Link href={`/en/b2c/attractions/${event.attractionSlug}`} className={`hover:text-amber-500 transition-colors ${event.title ? 'text-sm text-zinc-400 font-medium' : 'text-xl md:text-2xl font-bold text-white leading-tight font-satoshi'}`}>
                  {event.attractionNameEn}
                </Link>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                {statusBadge}
                {event.hasOffer && (
                  <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-500/20 text-amber-500 rounded-sm border border-amber-500/30">
                    Offer
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-medium mb-6 font-mono">
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
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  From {event.price}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/60 pt-5 mt-auto">
            <Link 
              href={`/en/b2c/attractions/${event.attractionSlug}`}
              className="px-5 py-2 text-sm font-bold text-zinc-300 hover:text-black hover:bg-white bg-zinc-900 border border-zinc-700 rounded-lg uppercase tracking-widest transition-all"
            >
              Explore
            </Link>

            <div className="flex gap-2">
              <a
                href={event.ticketingUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-lg transition-all border flex items-center gap-2
                  ${isPast(endDate) || totalRemaining <= 0
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed pointer-events-none' 
                    : 'bg-amber-500 text-black hover:bg-white border-amber-500'}
                `}
              >
                Book Now <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
