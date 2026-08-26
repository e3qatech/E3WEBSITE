'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Ticket, Clock, Calendar, Phone, Sparkles, Compass, Car, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatLocalizedText, cn } from '@/lib/utils';
import { localizeHref, isExternalUrl, normalizeExternalUrl } from '@/lib/url-helper';
import { AttractionMapCanvas } from '@/components/map/AttractionMapCanvas';
import { MapGeoJSONCollection } from '@/components/map/map-types';

interface LiveBookingCardProps {
  attractionId: string;
  name: any;
  bookingUrl?: string | null;
  mapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAddress?: any;
  schedule?: any;
  operations?: any;
  mapImageFallback?: string | null;
  locale?: string;
}

export function LiveBookingCard({
  attractionId,
  name,
  bookingUrl,
  mapUrl: _mapUrl,
  latitude,
  longitude,
  locationAddress,
  operations,
  mapImageFallback,
  locale = 'en'
}: LiveBookingCardProps) {
  const isAr = locale === 'ar';
  const formattedAddress = formatLocalizedText(locationAddress, locale) || (isAr ? "الدوحة، قطر" : "Doha, Qatar");
  const formattedName = formatLocalizedText(name, locale) || (isAr ? "الوجهة" : "Attraction");

  const lat = latitude || 25.3214;
  const lng = longitude || 51.5284;

  // Single Attraction GeoJSON feature for our Location GIS Map Engine
  const singleLocationGeoJson: MapGeoJSONCollection = {
    type: "FeatureCollection",
    features: [
      {
        id: attractionId || "attr-location",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        properties: {
          locationId: attractionId || "attr-location",
          slug: "location-slug",
          name: formattedName,
          nameEn: formattedName,
          nameAr: formattedName,
          venue: formattedAddress,
          address: formattedAddress,
          venueNameEn: formattedAddress,
          venueNameAr: formattedAddress,
          addressEn: formattedAddress,
          addressAr: formattedAddress,
          latitude: lat,
          longitude: lng,
          locationType: "PERMANENT_ATTRACTION",
          status: "OPEN",
          pinColorToken: "CYAN",
          pinBadgeText: "E3 ATTRACTION",
          accentColor: "#10b981",
          materialType: "E3 ATTRACTION",
          heroMediaUrl: mapImageFallback || undefined
        } as any
      }
    ]
  };

  const weekdaysTiming = operations?.hoursWeekdays || operations?.openingHours || (isAr ? "10:00 صباحاً - 10:00 مساءً" : "10:00 AM - 10:00 PM");
  const weekendsTiming = operations?.hoursWeekends || (isAr ? "10:00 صباحاً - 12:00 منتصف الليل" : "10:00 AM - 12:00 AM");
  const isOpen = operations?.isOpen !== false;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  return (
    <section id="location" className="py-24 md:py-32 bg-[var(--surface-default)] text-[var(--text-primary)] relative border-t border-[var(--border-level-2)] overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[var(--border-level-2)] pb-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-sm">
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? "الموقع الجغرافي والمواعيد" : "LOCATION & SCHEDULE"}</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "أوقات العمل والموقع" : "Location & Operating Hours"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--surface-hover)] hover:bg-[var(--border-level-2)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? "الاتجاهات (Google Maps)" : "Get Directions"}</span>
            </a>

            {bookingUrl && (
              isExternalUrl(bookingUrl) ? (
                <a
                  href={normalizeExternalUrl(bookingUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isAr ? "احجز تذكرتك" : "Book Tickets"}</span>
                </a>
              ) : (
                <Link
                  href={localizeHref(bookingUrl, locale)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isAr ? "احجز تذكرتك" : "Book Tickets"}</span>
                </Link>
              )
            )}
          </div>
        </div>

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Timings, Venue Details & Contact (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-[2.5rem] p-7 md:p-8 flex flex-col justify-between space-y-6 shadow-xl"
          >
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between gap-3 pb-5 border-b border-[var(--border-level-2)]">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
                    {isAr ? "الحالة التشغيلية" : "LIVE STATUS"}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {formattedName}
                  </h3>
                </div>

                {isOpen ? (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-2 shadow-sm shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isAr ? "مفتوح الآن" : "OPEN NOW"}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 flex items-center gap-2 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{isAr ? "مغلق حالياً" : "CLOSED NOW"}</span>
                  </span>
                )}
              </div>

              {/* Exact Location & Mall Floor Card */}
              <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">
                      {formattedAddress}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-secondary)]">
                      <span>GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Operating Hours Table */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                  {isAr ? "جدول المواعيد الأسبوعية" : "WEEKLY SCHEDULE"}
                </span>

                <div className="p-3.5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {isAr ? "السبت – الأربعاء" : "Saturday – Wednesday"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    {weekdaysTiming}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {isAr ? "الخميس والجمعة" : "Thursday & Friday"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg">
                    {weekendsTiming}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-4 border-t border-[var(--border-level-2)] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isAr ? "فتح الخريطة ↗" : "Open in Maps ↗"}</span>
                </a>

                <span className="text-[var(--text-tertiary)]">•</span>

                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Waze</span>
                </a>
              </div>

              {operations?.venueContactPhone && (
                <a
                  href={`tel:${operations.venueContactPhone}`}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{operations.venueContactPhone}</span>
                </a>
              )}
            </div>
          </motion.div>

          {/* Right Column: High-Performance Vector GIS Map Canvas (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative min-h-[460px] lg:min-h-full rounded-[2.5rem] overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-hover)] shadow-2xl"
          >
            <AttractionMapCanvas 
              geoJson={singleLocationGeoJson}
              selectedLocationId={attractionId}
              onSelectLocation={() => {}}
              locale={locale}
            />
          </motion.div>

        </div>

      </div>
    </section>
  );
}
