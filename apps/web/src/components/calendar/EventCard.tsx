import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { format, differenceInMinutes } from 'date-fns';
import { MapPin, Clock, Tag, ExternalLink } from 'lucide-react';
import { useLocale } from '@/components/layout/LocaleProvider';
import { BookingAction, resolveBookingAction } from '@/lib/qatar-calendar';

export type EventType = 'REGULAR' | 'SPECIAL' | 'FESTIVAL' | 'PRIVATE';

export interface CalendarEvent {
  id: string;
  attractionId: string;
  attractionNameEn: string;
  attractionNameAr: string;
  attractionSlug: string;
  ticketingUrl?: string | null;
  title: string | null;
  titleEn?: string | null;
  titleAr?: string | null;
  description: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
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
  bookingAction?: BookingAction;
}

interface EventCardProps {
  events: CalendarEvent[];
  onSelectTickets?: (event: CalendarEvent) => void;
  isFeatured?: boolean;
  spanClass?: string;
}

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop';

export function EventCard({ events, isFeatured = false, spanClass = "" }: EventCardProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
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
    statusBadge = (
      <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 rounded-sm border border-zinc-500/30">
        {isAr ? 'غير متاح' : 'Not Available'}
      </div>
    );
  } else if (minsLeft <= 90) {
    statusBadge = (
      <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-sm border border-amber-500/30">
        {isAr ? 'ينتهي قريباً' : 'Closing Soon'}
      </div>
    );
  } else if (totalRemaining <= 0) {
    statusBadge = (
      <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 rounded-sm border border-red-500/30">
        {isAr ? 'نفدت التذاكر' : 'Sold Out'}
      </div>
    );
  } else {
    statusBadge = (
      <div className="px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded-sm border border-emerald-500/30">
        {isAr ? 'متاح' : 'Available'}
      </div>
    );
  }

  const typeColors = {
    REGULAR: 'bg-[var(--surface-default)]/90 text-[var(--text-primary)] border border-[var(--border-level-2)] shadow-sm',
    SPECIAL: 'bg-emerald-500 text-white dark:text-zinc-950 font-bold shadow-sm',
    FESTIVAL: 'bg-indigo-500 text-white font-bold shadow-sm',
    PRIVATE: 'bg-rose-500 text-white font-bold shadow-sm',
  };

  const coverImg = event.thumbnail || DEFAULT_COVER_IMAGE;
  const displayTitle = isAr
    ? event.titleAr || event.attractionNameAr || event.title || event.attractionNameEn
    : event.titleEn || event.attractionNameEn || event.title || 'Event';

  const displayDescription = isAr
    ? event.descriptionAr || event.description
    : event.descriptionEn || event.description;

  const displayLocation = isAr
    ? event.locationNameAr || 'الدوحة، قطر'
    : event.locationNameEn || 'Doha, Qatar';

  const bookingAction = event.bookingAction || resolveBookingAction(
    event.ticketingUrl,
    event.attractionSlug,
    locale,
    displayTitle
  );

  const isWide = spanClass.includes('col-span-4') || spanClass.includes('col-span-6');

  return (
    <div className={`group relative bg-[var(--surface-default)] backdrop-blur-xl border border-[var(--border-level-2)] rounded-3xl overflow-hidden transition-all duration-300 hover:border-[var(--border-level-3)] hover:shadow-2xl flex flex-col justify-between ${spanClass} ${isFeatured ? 'ring-1 ring-emerald-500/40 bg-gradient-to-br from-[var(--surface-default)] via-[var(--surface-hover)] to-[var(--surface-default)]' : ''}`}>
      
      {/* Type Badge Floating */}
      <div className="absolute top-4 start-4 z-20 flex items-center gap-2">
        <div className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-white/10 ${typeColors[event.eventType] || typeColors.REGULAR}`}>
          {event.eventType}
        </div>
        {isFeatured && (
          <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 backdrop-blur-md">
            {isAr ? 'فعالية مميزة' : 'FEATURED EVENT'}
          </div>
        )}
      </div>

      <div className={`flex flex-col ${isWide ? 'lg:flex-row' : 'flex-col'} h-full min-h-[220px]`}>
        {/* Thumbnail Image & Date Block */}
        <div className={`relative shrink-0 bg-black overflow-hidden ${isWide ? 'w-full lg:w-80 h-64 lg:h-auto' : 'w-full h-52 md:h-56'}`}>
          <img 
            src={coverImg} 
            alt={displayTitle}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_COVER_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

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
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between relative z-10">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className={`font-black text-[var(--text-primary)] leading-tight font-satoshi group-hover:text-emerald-500 transition-colors ${isWide ? 'text-2xl lg:text-3xl' : 'text-lg md:text-xl'}`}>
                  {displayTitle}
                </h3>
                {displayDescription && (
                  <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-2 leading-relaxed mt-1">
                    {displayDescription}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {statusBadge}
                {event.hasOffer && (
                  <div className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/30">
                    {isAr ? 'عرض خاص' : 'Offer'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] font-mono pt-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{event.openingTime || format(startDate, 'h:mm a')} - {event.closingTime || format(endDate, 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="truncate">{displayLocation}</span>
              </div>
              {event.price && (
                <div className="flex items-center gap-1 text-[var(--text-primary)] bg-[var(--surface-hover)] px-2 py-0.5 rounded-lg border border-[var(--border-level-2)] font-bold shrink-0">
                  <Tag className="w-3 h-3 text-emerald-500" />
                  <span>{isAr ? (event.price.startsWith('من') ? event.price : `تبدأ من ${event.price}`) : (event.price.startsWith('From') ? event.price : `From ${event.price}`)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border-level-2)] pt-4 mt-4 gap-2 flex-wrap sm:flex-nowrap">
            {event.attractionSlug ? (
              <Link 
                href={`/${locale}/b2c/attractions/${event.attractionSlug}`}
                className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] border border-[var(--border-level-2)] rounded-xl uppercase tracking-wider transition-all shrink-0 text-center"
              >
                {isAr ? 'استكشف' : 'Explore'}
              </Link>
            ) : (
              <span />
            )}

            {bookingAction.isExternal ? (
              <a
                href={bookingAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
              >
                {isAr ? bookingAction.labelAr : bookingAction.labelEn} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Link
                href={bookingAction.url}
                className="px-5 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 shadow-md shadow-emerald-500/20 shrink-0 text-center"
              >
                {isAr ? bookingAction.labelAr : bookingAction.labelEn}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
