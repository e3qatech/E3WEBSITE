"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { resolveQatarMapPins } from '@/lib/qatar-map-resolver'

interface Act5QatarRouteMapProps {
  content: any
  locale: string
}

export function Act5QatarRouteMap({ content, locale }: Act5QatarRouteMapProps) {
  const isAr = locale === 'ar'
  const { pins, headlineEn, headlineAr, subtextEn, subtextAr } = resolveQatarMapPins({
    settings: content?.qatarMap,
    locale,
  })

  const [selectedVenueId, setSelectedVenueId] = useState(pins[0]?.id || 'v-dfc')
  const activeVenue = pins.find((v) => v.id === selectedVenueId) || pins[0] || {}

  return (
    <section id="qatar-map" className="relative py-24 bg-[#050110] text-white border-b border-purple-950/40 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Background Radial Shading */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-bold uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAr ? "الفصل الخامس — رحلة عبر أنحاء قطر" : "ACT V — A JOURNEY ACROSS QATAR"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {isAr ? headlineAr : headlineEn}
          </h2>
          <p className="text-sm text-slate-300 font-light max-w-xl mx-auto">
            {isAr ? subtextAr : subtextEn}
          </p>
        </div>

        {/* Interactive Qatar Map Split (Desktop Map SVG + Mobile Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column — Interactive SVG Map Outline (7 Cols) */}
          <div className="lg:col-span-7 relative aspect-[4/3] rounded-3xl border border-slate-800 bg-slate-950/80 p-6 overflow-hidden flex items-center justify-center shadow-2xl">
            {/* SVG Qatar Peninsula Silhouette */}
            <svg
              viewBox="0 0 600 800"
              className="w-full h-full max-h-[500px] text-slate-800 pointer-events-none drop-shadow-2xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Qatar Peninsula Path */}
              <path
                d="M 280,100 C 320,120 360,180 370,250 C 380,320 360,390 350,460 C 340,530 310,600 270,660 C 230,720 180,740 140,700 C 110,660 120,580 140,500 C 160,420 180,340 190,260 C 200,180 240,80 280,100 Z"
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth="4"
              />

              {/* Connecting Trail Line between Venues */}
              <motion.path
                d="M 320,240 L 340,280 L 310,360 L 260,440"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="8 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
            </svg>

            {/* Interactive Venue Pin Buttons overlay on map */}
            <div className="absolute inset-0 p-8 flex flex-col justify-around">
              {pins.map((venue, idx) => {
                const isSelected = venue.id === selectedVenueId
                return (
                  <button
                    key={venue.id || idx}
                    onClick={() => setSelectedVenueId(venue.id)}
                    className={`self-center flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-300 shadow-xl cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-extrabold scale-110 z-20'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-sky-400'}`} />
                    <span className="text-xs">{isAr ? venue.nameAr : venue.nameEn}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column — Selected Venue Info Card (5 Cols) */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeVenue.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="p-8 rounded-3xl border border-sky-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
                      {isAr ? activeVenue.venueAr || activeVenue.venue : activeVenue.venueEn || activeVenue.venue}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      {activeVenue.operationalStatus}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">
                    {isAr ? activeVenue.nameAr : activeVenue.nameEn}
                  </h3>
                </div>

                <div className="space-y-3 border-y border-slate-800/80 py-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">{isAr ? "العنوان" : "Address & Location"}</span>
                    <span className="font-bold text-slate-200 block mt-0.5">{isAr ? activeVenue.addressAr || activeVenue.address : activeVenue.addressEn || activeVenue.address}</span>
                  </div>

                  {activeVenue.shortDescription && (
                    <div className="text-slate-300 text-xs leading-relaxed">
                      {activeVenue.shortDescription}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={activeVenue.directionsUrl || `https://maps.google.com/?q=${activeVenue.latitude},${activeVenue.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all shadow-md cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{isAr ? "اتجه إلى الوجهة" : "Get Directions"}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
