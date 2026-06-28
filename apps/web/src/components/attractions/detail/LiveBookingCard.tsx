'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Navigation } from 'lucide-react';
import Link from 'next/link';
import { useLiveOccupancy } from '@/hooks/useLiveOccupancy';
import { useAttractionsStore } from '@/store/useAttractionsStore';

interface LiveBookingCardProps {
  attractionId: string;
  name: string;
  bookingUrl?: string | null;
  mapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAddress?: string | null;
  schedule?: any; // You can type this properly based on TemporalRules
  operations?: any; // JSON field with operational data
  mapImageFallback?: string | null;
}

export function LiveBookingCard({
  attractionId,
  name,
  bookingUrl,
  mapUrl,
  latitude,
  longitude,
  locationAddress,
  schedule,
  operations,
  mapImageFallback,
}: LiveBookingCardProps) {
  // Start the socket subscription
  useLiveOccupancy();
  const [imageError, setImageError] = useState(false);
  
  // Get live data from store for this specific attraction
  const attractionInStore = useAttractionsStore(state => 
    state.attractions.find(a => a.id === attractionId) || state.featuredAttraction?.id === attractionId ? state.featuredAttraction : null
  );

  const currentOccupancy = attractionInStore?.liveOccupancy?.currentCount ?? 0;
  const maxCapacity = attractionInStore?.liveOccupancy?.maxCapacity ?? 100;
  const isOpen = attractionInStore?.computedStatus === 'ACTIVE';

  const occupancyPercentage = maxCapacity > 0 ? (currentOccupancy / maxCapacity) * 100 : 0;
  
  // Determine color based on capacity
  let capacityColor = 'bg-emerald-500';
  if (occupancyPercentage > 60) capacityColor = 'bg-yellow-500';
  if (occupancyPercentage > 90) capacityColor = 'bg-red-500';

    <section className="py-32 bg-black text-white relative border-t border-white/5">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">
          
          {/* Left: Booking & Live Status */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-between overflow-hidden"
          >
            {/* Subtle glow overlay */}
            <div className={`absolute -top-40 -right-40 w-80 h-80 blur-[100px] rounded-full pointer-events-none ${isOpen ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
                Mission Control
              </h2>
              <p className="text-zinc-400 text-lg mb-12 font-light">
                Monitor live occupancy and secure your spot at {name}.
              </p>

              {/* Live Operations Panel */}
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 mb-10 shadow-inner">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-4 w-4">
                      <div className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                      <div className={`relative inline-flex rounded-full h-4 w-4 shadow-[0_0_15px_rgba(16,185,129,0.8)] ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    </div>
                    <span className="font-black tracking-[0.2em] uppercase text-sm text-white">
                      {isOpen ? 'Live Status: Open' : 'Status: Closed'}
                    </span>
                  </div>
                  <Clock className="w-6 h-6 text-zinc-600" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Current Occupancy
                    </span>
                    <span className="text-3xl font-black font-mono tracking-tighter">
                      {currentOccupancy} <span className="text-lg text-zinc-600">/ {maxCapacity}</span>
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden shadow-inner relative">
                    <motion.div 
                      className={`absolute top-0 left-0 h-full ${capacityColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 text-right mt-3 font-mono">Synched: Just Now</p>
                </div>
              </div>
            </div>

            <Link
              href={bookingUrl || '#'}
              className="relative group w-full flex justify-center items-center py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 z-10"
            >
              <span className="relative z-10">Initiate Booking</span>
              <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
          </motion.div>

          {/* Right: Map & Location */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] lg:h-auto min-h-[500px] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group"
          >
            {/* Embedded Google Map */}
            {(() => {
              let extractedMapSrc = mapUrl || '';
              if (extractedMapSrc.includes('iframe') && extractedMapSrc.includes('src=')) {
                const match = extractedMapSrc.match(/src=["'](.*?)["']/);
                if (match) extractedMapSrc = match[1];
              }

              if (extractedMapSrc) {
                const isSpline = extractedMapSrc.includes('spline.design');
                return (
                  <iframe 
                    src={extractedMapSrc} 
                    width="100%" 
                    height="100%" 
                    style={isSpline ? { border: 0 } : { border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }} 
                    allow="autoplay; fullscreen"
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isSpline ? '' : 'group-hover:filter-none'}`}
                  />
                );
              }

              if (latitude && longitude) {
                return (
                  <iframe 
                    src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&output=embed`} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:filter-none"
                  />
                );
              }

              if (mapImageFallback && !imageError) {
                return (
                  <img 
                    src={mapImageFallback} 
                    alt="Location map" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50" 
                    onError={() => setImageError(true)}
                  />
                );
              }

              return (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-600">
                  <MapPin className="w-12 h-12" />
                </div>
              );
            })()}

            {/* Location Overlay Card */}
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-none">
              <h3 className="font-bold text-lg mb-2">Location</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                {locationAddress || "Doha, Qatar"}
              </p>
              
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider hover:text-emerald-400 transition-colors pointer-events-auto"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </a>

              {/* Contact Details overlay */}
              {operations?.venueContactPhone && (
                <div className="mt-4 pt-4 border-t border-white/10 pointer-events-auto">
                   <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2">Venue Contact</p>
                   <a href={`tel:${operations.venueContactPhone}`} className="text-white hover:text-emerald-400 font-medium block">
                     {operations.venueContactPhone}
                   </a>
                   {operations.venueContactEmail && (
                     <a href={`mailto:${operations.venueContactEmail}`} className="text-white hover:text-emerald-400 font-medium block mt-1">
                       {operations.venueContactEmail}
                     </a>
                   )}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
