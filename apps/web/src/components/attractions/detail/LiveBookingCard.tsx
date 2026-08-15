'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Ticket } from 'lucide-react';
import Link from 'next/link';
import { formatLocalizedText } from '@/lib/utils';
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

  const lat = latitude || 25.2854;
  const lng = longitude || 51.5310;

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
          pinBadgeText: "E3 VENUE",
          accentColor: "#10b981",
          materialType: "E3 ATTRACTION",
          heroMediaUrl: mapImageFallback || undefined
        } as any
      }
    ]
  };

  /* 
    ============================================================
    MISSION CONTROL LEFT PANEL COMMENTED OUT AS REQUESTED
    ============================================================
    <div className="relative bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-between overflow-hidden">
      <h2>Mission Control</h2>
      <p>Monitor live occupancy and secure your spot...</p>
    </div>
    ============================================================
  */

  return (
    <section className="py-24 bg-zinc-950 text-white relative border-t border-white/5" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-black to-black pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isAr ? "الموقع الجغرافي والوصول" : "LOCATION & GIS MAP"}</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              {isAr ? `موقع ${formattedName}` : `Location & Map`}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "احصل على الاتجاهات" : "Get Directions"}</span>
            </a>

            {bookingUrl && (
              isExternalUrl(bookingUrl) ? (
                <a
                  href={normalizeExternalUrl(bookingUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isAr ? "احجز تذكرتك" : "Book Tickets"}</span>
                </a>
              ) : (
                <Link
                  href={localizeHref(bookingUrl, locale)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isAr ? "احجز تذكرتك" : "Book Tickets"}</span>
                </Link>
              )
            )}
          </div>
        </div>

        {/* Interactive GIS Map Canvas Feature */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[480px] md:h-[580px] w-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl group"
        >
          {/* E3 Interactive Vector Map Engine */}
          <AttractionMapCanvas 
            geoJson={singleLocationGeoJson}
            selectedLocationId={attractionId}
            onSelectLocation={() => {}}
            locale={locale}
          />

          {/* Floating Location Details Badge */}
          <div className="absolute bottom-6 start-6 end-6 md:end-auto max-w-md p-6 bg-zinc-950/90 backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl z-20 space-y-3 pointer-events-auto">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{isAr ? "عنوان الوجهة" : "VENUE ADDRESS"}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isAr ? "مفتوح الآن" : "OPEN NOW"}
              </span>
            </div>

            <h3 className="font-bold text-lg text-white leading-snug">
              {formattedName}
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed font-light">
              {formattedAddress}
            </p>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4 text-xs font-bold">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isAr ? "فتح الخريطة الخارجية ↗" : "Open Navigation ↗"}</span>
              </a>

              {operations?.venueContactPhone && (
                <a href={`tel:${operations.venueContactPhone}`} className="text-zinc-400 hover:text-white font-mono text-[11px]">
                  📞 {operations.venueContactPhone}
                </a>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
