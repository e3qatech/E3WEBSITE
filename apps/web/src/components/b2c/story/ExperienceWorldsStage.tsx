/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Users, Clock, Ticket } from 'lucide-react'
import { resolveMediaType } from '@/lib/media-resolver'

interface ExperienceWorldsStageProps {
  content: any
  locale: string
}

export const DEFAULT_ATTRACTION_WORLDS = [
  {
    id: "attr-inflatarun",
    slug: "inflatarun-lusail",
    nameEn: "InflataRUN Lusail Boulevard",
    nameAr: "إنفلاتا ران شارع لوسيل التجاري",
    taglineEn: "World's Longest Inflatable Obstacle Challenge & Aqua Park",
    taglineAr: "أطول مضمار عقبات قابل للنفخ في العالم",
    locationEn: "Lusail Boulevard, Qatar",
    locationAr: "شارع لوسيل التجاري، قطر",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "E3 WORLD",
    accentColor: "#10b981",
    mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
    audienceEn: "All Ages & Families",
    audienceAr: "جميع الأعمار والعائلات",
    timingsEn: "15:00 - 23:00 Daily",
    timingsAr: "15:00 - 23:00 يومياً",
    price: 75,
    currency: "QAR",
    ctaEn: "Book Pass & Ticket",
    ctaAr: "احجز التذكرة والمواعيد"
  },
  {
    id: "attr-cyberdome",
    slug: "cyberdome-vr",
    nameEn: "Cyberdome VR & Esports Arena",
    nameAr: "ساحة السايبردوم للواقع الافتراضي والألعاب",
    taglineEn: "Next-Gen 4D Haptic Motion Simulator & VR Cyber Hub",
    taglineAr: "مركز أجهزة المحاكاة الحركية رباعية الأبعاد",
    locationEn: "Place Vendôme Mall, Qatar",
    locationAr: "مول بلاس فاندوم، لوسيل",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "VR CYBERHUB",
    accentColor: "#8b5cf6",
    mediaUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop",
    audienceEn: "Teens & Gamers (12+)",
    audienceAr: "الشباب وهواة الألعاب (12+)",
    timingsEn: "14:00 - 00:00 Daily",
    timingsAr: "14:00 - 00:00 يومياً",
    price: 90,
    currency: "QAR",
    ctaEn: "Book VR Simulator",
    ctaAr: "احجز تجربة الواقع الافتراضي"
  },
  {
    id: "attr-adrenaline",
    slug: "adrenaline-racing-circuit",
    nameEn: "Adrenaline Pro Karting Circuit",
    nameAr: "حلبة أدرينالين لسباقات الكارتينج",
    taglineEn: "High-Speed Electric Go-Karting Track & Pro Racing",
    taglineAr: "حلبة كارتينج كهربائية عالية السرعة والإثارة",
    locationEn: "Al Bidda Park, Doha",
    locationAr: "حديقة البدع، الدوحة",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "PRO RACING",
    accentColor: "#f59e0b",
    mediaUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop",
    audienceEn: "Thrill Seekers & Adults",
    audienceAr: "عشاق السرعة والإثارة",
    timingsEn: "16:00 - 01:00 Daily",
    timingsAr: "16:00 - 01:00 يومياً",
    price: 120,
    currency: "QAR",
    ctaEn: "Book Karting Session",
    ctaAr: "احجز سباق الكارتينج"
  },
  {
    id: "attr-splash",
    slug: "splash-kingdom",
    nameEn: "Splash Kingdom Water Experience",
    nameAr: "مملكة سبلاش للألعاب المائية",
    taglineEn: "Inflatable Ocean Waterpark & Aqua Tower",
    taglineAr: "مدينة الألعاب المائية والأبراج التفاعلية في الشاطئ",
    locationEn: "Katara Beach, Qatar",
    locationAr: "شاطئ كتارا، قطر",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "AQUA PARK",
    accentColor: "#06b6d4",
    mediaUrl: "https://images.unsplash.com/photo-1582650625119-3a31f8418b0d?q=80&w=1200&auto=format&fit=crop",
    audienceEn: "Kids & Families",
    audienceAr: "الأطفال والعائلات",
    timingsEn: "10:00 - 19:00 Daily",
    timingsAr: "10:00 - 19:00 يومياً",
    price: 65,
    currency: "QAR",
    ctaEn: "Book Aqua Pass",
    ctaAr: "احجز تذكرة الألعاب المائية"
  },
  {
    id: "attr-superpark",
    slug: "superpark-msheireb",
    nameEn: "SuperPark Msheireb Active Hub",
    nameAr: "سوبربارك مشيرب للنشاط والمغامرات",
    taglineEn: "All-in-One Indoor Multi-Sport & Trampoline Park",
    taglineAr: "مجمع الألعاب والأنشطة الرياضية والترامبولين المغطى",
    locationEn: "Msheireb Downtown Doha",
    locationAr: "مشيرب قلب الدوحة",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "SPORTS HUB",
    accentColor: "#ec4899",
    mediaUrl: "https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=1200&auto=format&fit=crop",
    audienceEn: "All Ages & Sports Lovers",
    audienceAr: "جميع الأعمار وهواة الرياضة",
    timingsEn: "12:00 - 22:00 Daily",
    timingsAr: "12:00 - 22:00 يومياً",
    price: 85,
    currency: "QAR",
    ctaEn: "Book Active Pass",
    ctaAr: "احجز تذكرة سوبربارك"
  }
];

export function ExperienceWorldsStage({ content, locale }: ExperienceWorldsStageProps) {
  const isAr = locale === 'ar'
  const rawWorlds = content?.act3Worlds
  const worlds = (Array.isArray(rawWorlds) && rawWorlds.length > 0) ? rawWorlds : DEFAULT_ATTRACTION_WORLDS

  const [selectedIndex, setSelectedIndex] = useState(0)
  const currentWorld = worlds[selectedIndex] || worlds[0] || DEFAULT_ATTRACTION_WORLDS[0]

  // Merge with fallback defaults to ensure mediaUrl, audience, timings and price are NEVER empty
  const fallback = DEFAULT_ATTRACTION_WORLDS[selectedIndex % DEFAULT_ATTRACTION_WORLDS.length] || DEFAULT_ATTRACTION_WORLDS[0]
  const activeWorld = {
    ...fallback,
    ...currentWorld,
    mediaUrl: currentWorld.mediaUrl || currentWorld.heroMediaUrl || fallback.mediaUrl,
    nameEn: currentWorld.nameEn || fallback.nameEn,
    nameAr: currentWorld.nameAr || fallback.nameAr,
    taglineEn: currentWorld.taglineEn || fallback.taglineEn,
    taglineAr: currentWorld.taglineAr || fallback.taglineAr,
    locationEn: currentWorld.locationEn || currentWorld.locationNameEn || fallback.locationEn,
    locationAr: currentWorld.locationAr || currentWorld.locationNameAr || fallback.locationAr,
    audienceEn: currentWorld.audienceEn || fallback.audienceEn,
    audienceAr: currentWorld.audienceAr || fallback.audienceAr,
    timingsEn: currentWorld.timingsEn || fallback.timingsEn,
    timingsAr: currentWorld.timingsAr || fallback.timingsAr,
    price: currentWorld.price || fallback.price,
    currency: currentWorld.currency || fallback.currency,
    ctaEn: currentWorld.ctaEn || fallback.ctaEn,
    ctaAr: currentWorld.ctaAr || fallback.ctaAr,
  }

  return (
    <section id="attraction-worlds" className="relative min-h-screen py-20 bg-[#080214] text-white flex flex-col justify-center overflow-hidden border-b border-purple-950/40">
      {/* Dynamic Background Material Accent Glow */}
      <div
        className="absolute inset-0 opacity-25 transition-colors duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${activeWorld.accentColor || '#10b981'}, transparent 70%)`
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
            key={activeWorld.id || selectedIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Left Media Stage (7 Cols) */}
            <div className="lg:col-span-7 relative aspect-video rounded-2xl overflow-hidden border border-slate-800 group bg-slate-950">
              {resolveMediaType({ url: activeWorld.mediaUrl, explicitType: activeWorld?.mediaType || undefined }) === 'VIDEO' ? (
                <video
                  key={activeWorld.mediaUrl}
                  src={activeWorld.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <img
                  key={activeWorld.mediaUrl}
                  src={activeWorld.mediaUrl}
                  alt={activeWorld.nameEn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              <div className="absolute top-4 start-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-xs font-bold text-emerald-400 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{isAr ? activeWorld.statusAr : activeWorld.statusEn}</span>
              </div>

              <div
                className="absolute bottom-4 end-4 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-slate-950 shadow-md"
                style={{ backgroundColor: activeWorld.accentColor || '#10b981' }}
              >
                {activeWorld.materialType || 'E3 WORLD'}
              </div>
            </div>

            {/* Right Info & CTAs (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span
                  className="text-xs font-mono font-extrabold uppercase tracking-widest block mb-1"
                  style={{ color: activeWorld.accentColor || '#10b981' }}
                >
                  📍 {isAr ? activeWorld.locationAr : activeWorld.locationEn}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {isAr ? activeWorld.nameAr : activeWorld.nameEn}
                </h3>
                <p className="text-sm text-slate-300 font-light mt-2 leading-relaxed">
                  {isAr ? activeWorld.taglineAr : activeWorld.taglineEn}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Users className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">{isAr ? "الفئة المستهدفة" : "Audience"}</span>
                    <span className="text-xs font-bold text-white">{isAr ? activeWorld.audienceAr : activeWorld.audienceEn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">{isAr ? "أوقات العمل" : "Timings"}</span>
                    <span className="text-xs font-bold text-white">{isAr ? activeWorld.timingsAr : activeWorld.timingsEn}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">{isAr ? "تبدأ الاسعار من" : "Starting From"}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">{activeWorld.price || 65}</span>
                    <span className="text-xs font-bold text-emerald-400">{activeWorld.currency || 'QAR'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={activeWorld.ticketingUrl || `/${locale}/b2c/calendar`}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs transition-all shadow-lg hover:scale-105 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{isAr ? activeWorld.ctaAr : activeWorld.ctaEn}</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
