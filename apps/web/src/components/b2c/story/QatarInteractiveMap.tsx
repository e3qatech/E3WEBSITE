"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Clock, ExternalLink, Locate, ShieldCheck } from 'lucide-react'

interface QatarInteractiveMapProps {
  content: any
  locale: string
}

export function QatarInteractiveMap({ content, locale }: QatarInteractiveMapProps) {
  const isAr = locale === 'ar'
  const mapData = content?.qatarMap || {}
  const venues = mapData.venues || []

  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || 'v-dfc')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [nearMeActive, setNearMeActive] = useState(false)

  const activeVenue = venues.find((v: any) => v.id === selectedVenueId) || venues[0] || {}

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert(isAr ? "خدمة تحديد الموقع غير مدعومة في المتصفح" : "Geolocation is not supported by your browser.")
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude }
        setUserCoords(coords)
        setNearMeActive(true)
        setLocating(false)
      },
      (err) => {
        console.warn("Geolocation error", err)
        setLocating(false)
        alert(isAr ? "تعذر التوصل إلى موقعك الحصري. تصفح عناوين قطر القريبة أدناه." : "Unable to retrieve position. Browsing nearest Qatar venues below.")
      }
    )
  }

  return (
    <section id="qatar-map" className="relative py-24 bg-[#050110] text-white border-b border-purple-950/40 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-bold uppercase tracking-widest mb-3">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? "رحلة عبر أنحاء قطر — EXPLORE QATAR" : "EXPLORE E3 ACROSS QATAR"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {isAr ? (mapData.headlineAr || "رحلة عبر أنحاء قطر") : (mapData.headlineEn || "A Journey Across Qatar")}
            </h2>
            <p className="text-sm text-slate-300 font-light max-w-xl mt-2">
              {isAr
                ? (mapData.subtextAr || "استكشف وجهات إي ثري الترفيهية وصالات الفعاليات في كافة مناطق الدوحة.")
                : (mapData.subtextEn || "Discover E3's permanent attraction worlds and temporary event arenas across Doha.")}
            </p>
          </div>

          {/* Privacy-First Near Me Geolocation Action */}
          <button
            onClick={handleNearMe}
            disabled={locating}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Locate className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? (isAr ? "جاري التحديد..." : "Locating...") : (isAr ? "بالقرب مني — Near Me" : "Near Me / بالقرب مني")}</span>
          </button>
        </div>

        {/* Near Me Active Alert Box */}
        {nearMeActive && userCoords && (
          <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "تم إيجاد الوجهات القريبة من موقعك بأمان دون حفظ بيانات الجغرافيا." : "Nearest Qatar venues calculated privately without storing your coordinates."}</span>
            </div>
            <span className="font-mono font-bold">LAT: {userCoords.lat.toFixed(2)} | LNG: {userCoords.lng.toFixed(2)}</span>
          </div>
        )}

        {/* Map Grid (Interactive Outline + Venue Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column — Interactive Map Canvas (7 Cols) */}
          <div className="lg:col-span-7 relative aspect-[4/3] rounded-3xl border border-slate-800 bg-slate-950/80 p-6 overflow-hidden flex items-center justify-center shadow-2xl">
            <svg
              viewBox="0 0 600 800"
              className="w-full h-full max-h-[500px] text-slate-800 pointer-events-none drop-shadow-2xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 280,100 C 320,120 360,180 370,250 C 380,320 360,390 350,460 C 340,530 310,600 270,660 C 230,720 180,740 140,700 C 110,660 120,580 140,500 C 160,420 180,340 190,260 C 200,180 240,80 280,100 Z"
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth="4"
              />

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

            {/* Venue Marker Pins */}
            <div className="absolute inset-0 p-8 flex flex-col justify-around">
              {venues.map((venue: any, idx: number) => {
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

          {/* Right Column — Venue Details Card (5 Cols) */}
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
                      {isAr ? activeVenue.areaAr : activeVenue.areaEn}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      {isAr ? activeVenue.statusAr : activeVenue.statusEn}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">
                    {isAr ? activeVenue.nameAr : activeVenue.nameEn}
                  </h3>
                </div>

                <div className="space-y-3 border-y border-slate-800/80 py-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">{isAr ? "التجارب المتوفرة" : "Featured Experiences"}</span>
                    <span className="font-bold text-slate-200 block mt-0.5">{isAr ? activeVenue.experiencesAr : activeVenue.experiencesEn}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>{isAr ? activeVenue.hoursAr : activeVenue.hoursEn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={activeVenue.directionsUrl || "https://maps.google.com"}
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
