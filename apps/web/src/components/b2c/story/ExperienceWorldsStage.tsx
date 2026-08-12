/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Users, Clock, Ticket, ArrowRight } from 'lucide-react'
import { resolveMediaType } from '@/lib/media-resolver'

export const DEFAULT_ATTRACTION_WORLDS = [
  {
    id: "urban-arena",
    slug: "urban-arena-doha",
    nameEn: "Urban Arena & Tactical Combat",
    nameAr: "أوربان أرينا للتحدي والتكتيك",
    taglineEn: "High-octane spatial sound, laser tag, and esports competitions",
    taglineAr: "ساحة معارك الليزر والتكنولوجيا التفاعلية والرياضات الإلكترونية",
    locationEn: "Doha Mall, P Floor, Qatar",
    locationAr: "الدوحة مول، الطابق P، قطر",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "E3 WORLD",
    accentColor: "#10b981",
    mediaUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1200&auto=format&fit=crop",
    audienceEn: "Teens, Adults & Groups",
    audienceAr: "الشباب والكبار والمجموعات",
    timingsEn: "02:00 PM - 12:00 AM",
    timingsAr: "٠٢:٠٠ م - ١٢:٠٠ ص",
    price: 45,
    currency: "QAR",
    ctaEn: "Book Pass & Ticket",
    ctaAr: "احجز التذكرة والمواعيد"
  }
];

interface ExperienceWorldsStageProps {
  content: any
  locale: string
}

export function ExperienceWorldsStage({ content, locale }: ExperienceWorldsStageProps) {
  const isAr = locale === 'ar'
  const [dbAttractions, setDbAttractions] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/b2c/attractions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbAttractions(data)
        }
      })
      .catch(console.error)
  }, [])

  const rawWorlds = content?.act3Worlds
  const cmsWorlds = (Array.isArray(rawWorlds) && rawWorlds.length > 0) ? rawWorlds : []

  // Combine database attractions with CMS worlds
  const dbMappedWorlds = dbAttractions.map(attr => {
    const minPrice = Array.isArray(attr.pricing) && attr.pricing.length > 0
      ? Math.min(...attr.pricing.map((p: any) => p.price))
      : 45

    const venue = attr.operations?.venueName 
      || attr.operations?.venueAddressEn 
      || attr.attractionLocations?.[0]?.location?.addressEn 
      || (isAr ? "الدوحة، قطر" : "Doha, Qatar")

    const rawBadge = attr.operations?.materialType || "E3 WORLD"
    const safeBadge = (rawBadge === "STAGE_RIBBON" || !rawBadge) ? "E3 WORLD" : rawBadge

    return {
      id: attr.id,
      slug: attr.slug,
      nameEn: attr.nameEn,
      nameAr: attr.nameAr || attr.nameEn,
      taglineEn: attr.taglineEn || attr.descriptionEn?.substring(0, 90) || "Flagship E3 Interactive World",
      taglineAr: attr.taglineAr || attr.descriptionAr?.substring(0, 90) || "وجهة إي ثري التفاعلية",
      locationEn: venue,
      locationAr: venue,
      statusEn: "OPEN NOW",
      statusAr: "مفتوح الآن",
      materialType: safeBadge,
      accentColor: attr.operations?.accentColor || "#10b981",
      mediaUrl: attr.heroMediaUrl || attr.heroThumbnailUrl || attr.heroFallbackUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
      mediaType: attr.heroMediaType || "IMAGE",
      audienceEn: attr.operations?.audienceEn || (isAr ? "العائلات والأصدقاء" : "Families & Groups"),
      audienceAr: attr.operations?.audienceAr || (isAr ? "العائلات والأصدقاء" : "Families & Groups"),
      timingsEn: attr.operations?.timingsEn || "02:00 PM - 12:00 AM",
      timingsAr: attr.operations?.timingsAr || "٠٢:٠٠ م - ١٢:٠٠ ص",
      price: minPrice,
      currency: "QAR",
      ctaEn: "Book Pass & Ticket",
      ctaAr: "احجز التذكرة والمواعيد"
    }
  })

  // Final worlds list prioritizing live database attractions
  const worlds = dbMappedWorlds.length > 0 ? dbMappedWorlds : (cmsWorlds.length > 0 ? cmsWorlds : [
    {
      id: "urban-arena",
      slug: "urban-arena-doha",
      nameEn: "Urban Arena & Tactical Combat",
      nameAr: "أوربان أرينا للتحدي والتكتيك",
      taglineEn: "High-octane spatial sound, laser tag, and esports competitions",
      taglineAr: "ساحة معارك الليزر والتكنولوجيا التفاعلية والرياضات الإلكترونية",
      locationEn: "Doha Mall, P Floor, Qatar",
      locationAr: "الدوحة مول، الطابق P، قطر",
      statusEn: "OPEN NOW",
      statusAr: "مفتوح الآن",
      materialType: "LUMINOUS_TRAIL",
      accentColor: "#10b981",
      mediaUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1200&auto=format&fit=crop",
      audienceEn: "Teens, Adults & Groups",
      audienceAr: "الشباب والكبار والمجموعات",
      timingsEn: "02:00 PM - 12:00 AM",
      timingsAr: "٠٢:٠٠ م - ١٢:٠٠ ص",
      price: 45,
      currency: "QAR",
      ctaEn: "Book Pass & Ticket",
      ctaAr: "احجز التذكرة والمواعيد"
    }
  ])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const currentWorld = worlds[selectedIndex] || worlds[0]

  const rawBadge = currentWorld.materialType || "E3 WORLD"
  const safeMaterialType = (rawBadge === "STAGE_RIBBON" || !rawBadge) ? "E3 WORLD" : rawBadge

  return (
    <section id="attraction-worlds" className="relative min-h-screen py-20 bg-[#080214] text-white flex flex-col justify-center overflow-hidden border-b border-purple-950/40" dir={isAr ? "rtl" : "ltr"}>
      {/* Dynamic Background Material Accent Glow */}
      <div
        className="absolute inset-0 opacity-25 transition-colors duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${currentWorld.accentColor || '#10b981'}, transparent 70%)`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              {isAr ? "عوالم قطر الترفيهية" : "FLAGSHIP ENTERTAINMENT WORLDS"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {isAr ? "عوالم إي ثري الترفيهية بقطر" : "E3 Featured Attraction Worlds"}
            </h2>
          </div>

          {/* Attraction World Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {worlds.map((w: any, idx: number) => {
              const isActive = idx === selectedIndex
              const tabName = isAr ? (w.nameAr || w.nameEn) : (w.nameEn || w.nameAr)
              return (
                <button
                  key={w.id || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-lg scale-105'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {tabName}
                </button>
              )
            })}
          </div>
        </div>

        {/* Viewport Attraction Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWorld.id || selectedIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Left Media Stage (7 Cols) */}
            <div className="lg:col-span-7 relative aspect-video rounded-2xl overflow-hidden border border-slate-800 group bg-slate-950">
              {resolveMediaType({ url: currentWorld.mediaUrl, explicitType: currentWorld?.mediaType || undefined }) === 'VIDEO' ? (
                <video
                  key={currentWorld.mediaUrl}
                  src={currentWorld.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <img
                  key={currentWorld.mediaUrl}
                  src={currentWorld.mediaUrl}
                  alt={currentWorld.nameEn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              <div className="absolute top-4 start-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-xs font-bold text-emerald-400 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{isAr ? (currentWorld.statusAr || "مفتوح الآن") : (currentWorld.statusEn || "OPEN NOW")}</span>
              </div>

              <div
                className="absolute bottom-4 end-4 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-slate-950 shadow-md"
                style={{ backgroundColor: currentWorld.accentColor || '#10b981' }}
              >
                {safeMaterialType}
              </div>
            </div>

            {/* Right Info & CTAs (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span
                  className="text-xs font-mono font-extrabold uppercase tracking-widest block mb-1"
                  style={{ color: currentWorld.accentColor || '#10b981' }}
                >
                  📍 {isAr ? currentWorld.locationAr : currentWorld.locationEn}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {isAr ? currentWorld.nameAr : currentWorld.nameEn}
                </h3>
                <p className="text-sm text-slate-300 font-light mt-2 leading-relaxed">
                  {isAr ? currentWorld.taglineAr : currentWorld.taglineEn}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Users className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">{isAr ? "الفئة المستهدفة" : "Audience"}</span>
                    <span className="text-xs font-bold text-white">{isAr ? (currentWorld.audienceAr || "جميع الأعمار") : (currentWorld.audienceEn || "All Ages")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">{isAr ? "أوقات العمل" : "Timings"}</span>
                    <span className="text-xs font-bold text-white">{isAr ? (currentWorld.timingsAr || "٠٢:٠٠ م - ١٢:٠٠ ص") : (currentWorld.timingsEn || "02:00 PM - 12:00 AM")}</span>
                  </div>
                </div>
              </div>

              {/* Pricing & Booking Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase block">{isAr ? "تبدأ الأسعار من" : "Starting From"}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-white">{currentWorld.price || 45}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{currentWorld.currency || 'QAR'}</span>
                  </div>
                </div>

                <Link
                  href={`/b2c/attractions/${currentWorld.slug || 'urban-arena-doha'}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isAr ? (currentWorld.ctaAr || "استكشف احجز التذكرة") : (currentWorld.ctaEn || "Explore & Book Pass")}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
