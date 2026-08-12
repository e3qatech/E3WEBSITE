import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { format, isPast, differenceInMinutes } from 'date-fns';
import { MapPin, Clock, Tag, ExternalLink } from 'lucide-react';
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
  locationNameEn?: string | null;
  locationNameAr?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
}

interface EventCardProps {
  events: CalendarEvent[];
  onSelectTickets: (event: CalendarEvent) => void;
}

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop';

export function EventCard({ events }: EventCardProps) {
  const mounted = (React.useSyncExternalStore || useSyncExternalStore)(() => () => {}, () => true, () => false);

  const event = events[0];
  if (!event) return null;

  const startDate = new Date(event.startTime);
  const endDate = new Date(events[events.length - 1].endTime);
  
  if (!mounted) return <div className="h-48 w-full bg-[#1A1A2E]/50 animate-pulse rounded-2xl"></div>;

  const totalRemaining = events.reduce((sum, e) => sum + (e.capacityGate - e.currentCount), 0);
  let statusBadge = null;
  const now = new Date();
  const minsLeft = differenceInMinutes(endDate, now);

  if (minsLeft < 0) {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-500/20 text-zinc-400 rounded-sm border border-zinc-500/30">Not Available</div>;
  } else if (minsLeft <= 90) {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-500/20 text-amber-400 rounded-sm border border-amber-500/30">Closing Soon</div>;
  } else if (totalRemaining <= 0) {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-red-500/20 text-red-500 rounded-sm border border-red-500/30">Sold Out</div>;
  } else {
    statusBadge = <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-500 rounded-sm border border-emerald-500/30">Available</div>;
  }

  const typeColors = {
    REGULAR: 'bg-zinc-800 text-zinc-300',
    SPECIAL: 'bg-emerald-500 text-zinc-950 font-bold',
    FESTIVAL: 'bg-indigo-500 text-white font-bold',
    PRIVATE: 'bg-rose-500 text-white font-bold',
  };

  const coverImg = event.thumbnail || DEFAULT_COVER_IMAGE;
  const locationText = event.locationNameEn || 'Lusail Boulevard, Qatar';

  return (
    <div className="group relative bg-[#1A1A2E]/80 backdrop-blur-md/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden transition-all hover:bg-[#1A1A2E]/80 backdrop-blur-md hover:border-zinc-700">
      
      {/* Type Badge Floating */}
      <div className={`absolute top-4 start-4 z-10 px-2 py-1 text-[10px] uppercase tracking-widest rounded-md ${typeColors[event.eventType] || typeColors.REGULAR}`}>
        {event.eventType}
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* Left: Thumbnail Image & Date Block */}
        <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-[#0F0F23] overflow-hidden">
          <img 
            src={coverImg} 
            alt={event.attractionNameEn || "Attraction"}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-500"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_COVER_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

          {/* Date Block Overlay */}
          <div className="absolute bottom-4 start-4 text-white">
            <div className="text-sm font-medium text-emerald-500 font-mono uppercase tracking-widest">
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
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight font-satoshi mb-1">
                  {event.attractionNameEn}
                </h3>
                {event.description && (
                  <p className="text-xs text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 ms-4 shrink-0">
                {statusBadge}
                {event.hasOffer && (
                  <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-500 rounded-sm border border-emerald-500/30">
                    Offer
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-medium my-4 font-mono">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{event.openingTime || format(startDate, 'h:mm a')} - {event.closingTime || format(endDate, 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>{locationText}</span>
              </div>
              {event.price && (
                <div className="flex items-center gap-1.5 text-white bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700 font-bold text-xs">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{event.price.startsWith('From') ? event.price : `From ${event.price}`}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 mt-auto">
            <Link 
              href={`/en/b2c/attractions/${event.attractionSlug}`}
              className="px-5 py-2 text-xs font-bold text-zinc-200 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 rounded-xl uppercase tracking-wider transition-all"
            >
              Explore
            </Link>

            <a
              href={event.ticketingUrl || `/en/b2c/calendar`}
              className="px-6 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border flex items-center gap-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 border-emerald-500 shadow-md"
            >
              Book Now <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
