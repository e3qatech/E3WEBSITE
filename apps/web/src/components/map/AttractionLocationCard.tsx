"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Ticket, Compass } from 'lucide-react';
import Link from 'next/link';
import { MapLocationProperties } from './map-types';
import { localizeHref } from '@/lib/url-helper';

interface AttractionLocationCardProps {
  location: MapLocationProperties;
  isSelected?: boolean;
  onSelect?: () => void;
  locale: string;
}

const DEFAULT_CARD_FALLBACK_IMAGE = 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e6016d8f-1b8e-4099-95b7-fb9acd1169eb.png';

export function AttractionLocationCard({ location, isSelected, onSelect, locale }: AttractionLocationCardProps) {
  const isAr = locale === 'ar';
  const name = isAr ? location.nameAr || location.name : location.nameEn || location.name;
  const venue = isAr ? location.venue : location.venue;
  const address = isAr ? location.address : location.address;

  const [imgSrc, setImgSrc] = useState<string>(location.thumbnailUrl || DEFAULT_CARD_FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(location.thumbnailUrl || DEFAULT_CARD_FALLBACK_IMAGE);
  }, [location.thumbnailUrl]);

  const statusColors: Record<string, string> = {
    OPEN: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
    COMING_SOON: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40',
    TEMPORARILY_CLOSED: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
    SEASONAL: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40',
  };

  const statusLabel: Record<string, { en: string; ar: string }> = {
    OPEN: { en: 'OPEN NOW', ar: 'مفتوح الآن' },
    COMING_SOON: { en: 'OPENING SOON', ar: 'افتتاح قريباً' },
    TEMPORARILY_CLOSED: { en: 'TEMPORARILY CLOSED', ar: 'مغلق مؤقتاً' },
    SEASONAL: { en: 'SEASONAL EXPERIENCE', ar: 'تجربة موسمية' },
  };

  const currentStatus = statusLabel[location.operationalStatus] || { en: 'ACTIVE', ar: 'نشط' };

  return (
    <div
      id={`attraction-card-${location.locationId}`}
      onClick={onSelect}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--e3-royal-blue)] ${
        isSelected
          ? 'bg-[var(--surface-hover)] border-[var(--e3-royal-blue)] shadow-2xl ring-2 ring-[var(--e3-royal-blue)]/50 scale-[1.01]'
          : 'bg-[var(--surface-default)] border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)]/50 hover:bg-[var(--surface-hover)]/70 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Cover Image & Scrim */}
      <div className="relative w-full aspect-[16/9] max-h-[210px] overflow-hidden bg-slate-950 shrink-0">
        <img
          src={imgSrc}
          alt={name}
          onError={() => setImgSrc(DEFAULT_CARD_FALLBACK_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/90 via-transparent to-transparent pointer-events-none" />

        {/* Operational Status Badge */}
        <div className={`absolute top-3 start-3 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase backdrop-blur-md z-10 shadow-md ${statusColors[location.operationalStatus] || 'bg-zinc-800 text-white'}`}>
          {isAr ? currentStatus.ar : currentStatus.en}
        </div>

        {/* Distance Badge if available */}
        {location.distanceKm !== undefined && (
          <div className="absolute top-3 end-3 px-2.5 py-1 rounded-lg bg-black/75 border border-white/20 text-[10px] font-mono font-bold text-white uppercase backdrop-blur-md flex items-center gap-1 shadow-md">
            <Compass className="w-3 h-3 text-[var(--e3-royal-blue)]" />
            <span>{location.distanceKm} km</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[var(--e3-royal-blue)] uppercase">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{venue || address}</span>
          </div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)] font-display uppercase tracking-tight group-hover:text-[var(--e3-royal-blue)] transition-colors leading-snug">
            {name}
          </h3>
          {location.shortDescription && (
            <p className="text-xs text-[var(--text-secondary)] font-normal line-clamp-2 leading-relaxed">
              {location.shortDescription}
            </p>
          )}
        </div>

        {/* Action CTAs */}
        <div className="pt-3 border-t border-[var(--border-level-2)] flex items-center gap-2">
          {location.ticketingUrl && (
            <Link
              href={localizeHref(location.ticketingUrl, locale)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--e3-royal-blue)] hover:bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-blue-500/25"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{isAr ? "احجز الآن" : "Book"}</span>
            </Link>
          )}

          <a
            href={location.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2.5 px-3 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-primary)] border border-[var(--border-level-2)] text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <span>{isAr ? "الاتجاهات" : "Directions"}</span>
            <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)]" />
          </a>
        </div>
      </div>
    </div>
  );
}

