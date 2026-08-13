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
  onSelectTickets?: (event: CalendarEvent) => void;
  isFeatured?: boolean;
  spanClass?: string;
}

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop';

export function EventCard({ events, isFeatured = false, spanClass = "" }: EventCardProps) {
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

  // Only wide hero banners (spanning 4 or 6 columns) use side-by-side flex layout on desktop.
  // 50% width cards (col-span-3) and 33% width cards (col-span-2) use clean vertical stacked layout so text never gets squeezed.
  const isWide = spanClass.includes('col-span-4') || spanClass.includes('col-span-6');

  return (
    <div className={`group relative bg-[#1A1A2E]/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden transition-all duration-300 hover:border-zinc-600 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between ${spanClass} ${isFeatured ? 'ring-1 ring-emerald-500/30 bg-gradient-to-br from-[#1A1A2E]/90 via-[#121226] to-[#1A1A2E]' : ''}`}>
      
      {/* Type Badge Floating */}
      <div className="absolute top-4 start-4 z-20 flex items-center gap-2">
        <div className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-white/10 ${typeColors[event.eventType] || typeColors.REGULAR}`}>
          {event.eventType}
        </div>
        {isFeatured && (
          <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
            FEATURED EVENT
          </div>
        )}
      </div>

      <div className={`flex flex-col ${isWide ? 'lg:flex-row' : 'flex-col'} h-full min-h-[220px]`}>
        {/* Thumbnail Image & Date Block */}
        <div className={`relative shrink-0 bg-[#0F0F23] overflow-hidden ${isWide ? 'w-full lg:w-80 h-64 lg:h-auto' : 'w-full h-52 md:h-56'}`}>
          <img 
            src={coverImg} 
            alt={event.attractionNameEn || "Attraction"}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_COVER_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

          {/* Date Block Overlay */}
          <div className="absolute bottom-4 start-4 text-white">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              {format(startDate, 'MMM')}
            </div>
            <div className="text-3xl font-black leading-none font-satoshi">
              {format(startDate, 'dd')}
            </div>
          </div>
        </div>

        {/* Right Content Details */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between relative z-10 bg-gradient-to-b from-transparent to-zinc-950/60">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className={`font-black text-white leading-tight font-satoshi group-hover:text-emerald-400 transition-colors ${isWide ? 'text-2xl lg:text-3xl' : 'text-lg md:text-xl'}`}>
                  {event.attractionNameEn}
                </h3>
                {event.description && (
                  <p className="text-xs text-zinc-400 font-medium line-clamp-2 leading-relaxed mt-1">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {statusBadge}
                {event.hasOffer && (
                  <div className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                    Offer
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono pt-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{event.openingTime || format(startDate, 'h:mm a')} - {event.closingTime || format(endDate, 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
              {event.price && (
                <div className="flex items-center gap-1 text-white bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-700 font-bold shrink-0">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>{event.price.startsWith('From') ? event.price : `From ${event.price}`}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-4 gap-2 flex-wrap sm:flex-nowrap">
            <Link 
              href={`/en/b2c/attractions/${event.attractionSlug}`}
              className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 rounded-xl uppercase tracking-wider transition-all shrink-0 text-center"
            >
              Explore
            </Link>

            <a
              href={event.ticketingUrl || `/en/b2c/calendar`}
              className="px-5 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/20 shrink-0"
            >
              Book Now <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
