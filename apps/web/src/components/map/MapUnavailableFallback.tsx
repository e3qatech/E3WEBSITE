"use client";

import React from 'react';
import { MapPin, Compass, ExternalLink, Ticket, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { MapGeoJSONCollection, MapLocationProperties } from './map-types';
import { localizeHref } from '@/lib/url-helper';

interface MapUnavailableFallbackProps {
  locale: string;
  geoJson?: MapGeoJSONCollection;
  onSelectLocation?: (location: MapLocationProperties) => void;
  selectedLocationId?: string;
}

export function MapUnavailableFallback({
  locale,
  geoJson,
  onSelectLocation,
  selectedLocationId,
}: MapUnavailableFallbackProps) {
  const isAr = locale === 'ar';
  const features = geoJson?.features || [];

  return (
    <div
      role="region"
      aria-label={isAr ? "دليل وجهات إي ثري في قطر" : "E3 Qatar Destinations Directory"}
      className="relative w-full h-full min-h-[520px] rounded-3xl border border-[var(--border-level-2)] bg-[#090514] overflow-hidden shadow-2xl flex flex-col justify-between"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Visual Background / Neutral E3 Cartographic Pattern Backdrop */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 70%), radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 24px 24px",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#090514]/90 via-[#090514]/95 to-[#090514] pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 p-6 sm:p-8 border-b border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-display uppercase tracking-tight text-white">
                {isAr ? "دليل وجهات إي ثري في قطر" : "E3 Qatar Destinations Directory"}
              </h3>
              <p className="text-xs text-zinc-300 font-medium mt-1 max-w-xl leading-relaxed">
                {isAr
                  ? "نمط العرض الآمن نشط. يمكنك استكشاف كافة الوجهات النشطة، الحصول على اتجاهات خرائط جوجل، وحجز التذاكر مباشرة."
                  : "Accessible directory active. Explore all published venues, navigate via Google Maps directions, and book tickets directly."}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-white/15 text-[11px] font-mono text-zinc-300 shrink-0 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{features.length} {isAr ? "وجهات نشطة" : "Active Venues"}</span>
          </div>
        </div>
      </div>

      {/* Accessible Interactive Locations Grid */}
      <div className="relative z-10 p-6 sm:p-8 flex-1 overflow-y-auto max-h-[380px] custom-scrollbar">
        {features.length === 0 ? (
          <div className="text-center py-12 text-zinc-300 text-xs font-mono">
            {isAr ? "لا توجد وجهات متاحة حالياً." : "No published destinations available in this view."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {features.map((feat) => {
              const props = feat.properties;
              const isSelected = props.locationId === selectedLocationId;
              const name = isAr ? (props.nameAr || props.nameEn) : (props.nameEn || props.nameAr);
              const venue = isAr ? (props.venue || props.address) : (props.venue || props.address);

              return (
                <div
                  key={props.locationId}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectLocation?.(props)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectLocation?.(props);
                    }
                  }}
                  className={`group text-start p-4 rounded-2xl border transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-amber-400 ${
                    isSelected
                      ? 'bg-[var(--surface-active)] border-amber-400/80 shadow-lg shadow-amber-500/10'
                      : 'bg-[var(--surface-default)]/80 hover:bg-[var(--surface-hover)] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {name}
                        </h4>
                        <p className="text-[11px] text-zinc-300 truncate mt-0.5">
                          {venue || "Qatar"}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold shrink-0">
                      {isAr ? "مفتوح" : "OPEN"}
                    </span>
                  </div>

                  {/* Actions (Directions + Tickets) */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5 text-xs">
                    {props.directionsUrl && (
                      <a
                        href={props.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                        aria-label={`${isAr ? "الاتجاهات إلى" : "Directions to"} ${name}`}
                      >
                        <ExternalLink className="w-3 h-3 icon-directional" />
                        <span>{isAr ? "الاتجاهات" : "Directions"}</span>
                      </a>
                    )}

                    {props.ticketingUrl && (
                      <Link
                        href={localizeHref(props.ticketingUrl, locale)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors ms-auto"
                        aria-label={`${isAr ? "حجز التذاكر لـ" : "Book Tickets for"} ${name}`}
                      >
                        <Ticket className="w-3 h-3" />
                        <span>{isAr ? "احجز التذاكر" : "Book Tickets"}</span>
                        <ArrowUpRight className="w-3 h-3 icon-directional" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 px-6 py-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-300">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isAr ? "إمكانية وصول كاملة — متاح بدون WebGL" : "Full Accessibility Mode — No WebGL Required"}</span>
        </span>
        <span>E3 Qatar Cartography</span>
      </div>
    </div>
  );
}
