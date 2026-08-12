/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Users, Clock, Ticket, ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react'
import { resolveMediaType } from '@/lib/media-resolver'
import { formatLocalizedText } from '@/lib/utils'

export const DEFAULT_ATTRACTION_WORLDS = [
  {
    id: "kidz-driving-school",
    slug: "kidz-driving-school-city-center-doha",
    nameEn: "Kidz Driving School",
    nameAr: "مدرسة القيادة للأطفال",
    taglineEn: "Where Young Drivers Learn Safety, Responsibility, and Confidence Through Play",
    taglineAr: "حيث يتعلم السائقون الصغار السلامة والمسؤولية والثقة من خلال اللعب",
    locationEn: "City Center Doha, 3rd Floor, Qatar",
    locationAr: "ستي سنتر الدوحة، الطابق الثالث، قطر",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "E3 WORLD",
    accentColor: "#10b981",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e6016d8f-1b8e-4099-95b7-fb9acd1169eb.png",
    audienceEn: "Kids & Young Drivers",
    audienceAr: "الأطفال والسائقون الصغار",
    timingsEn: "10:00 AM - 10:00 PM",
    timingsAr: "١٠:٠٠ ص - ١٠:٠٠ م",
    price: 65,
    currency: "QAR",
    ctaEn: "Book Pass & Ticket",
    ctaAr: "احجز التذكرة والمواعيد"
  },
  {
    id: "urban-arena",
    slug: "urban-arena-doha-mall",
    nameEn: "Urban Arena",
    nameAr: "أوربان أرينا",
    taglineEn: "A High-Energy Indoor Arena for Games, Challenges, and Urban Entertainment",
    taglineAr: "ساحة داخلية مليئة بالحماس للألعاب والتحديات والترفيه الحضري",
    locationEn: "Doha Mall, P Floor, Qatar",
    locationAr: "الدوحة مول، الطابق P، قطر",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "E3 WORLD",
    accentColor: "#3b82f6",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png",
    audienceEn: "Teens, Adults & Groups",
    audienceAr: "الشباب والكبار والمجموعات",
    timingsEn: "02:00 PM - 12:00 AM",
    timingsAr: "٠٢:٠٠ م - ١٢:٠٠ ص",
    price: 45,
    currency: "QAR",
    ctaEn: "Book Pass & Ticket",
    ctaAr: "احجز التذكرة والمواعيد"
  },
  {
    id: "inflata-park",
    slug: "inflata-park-city-center-doha",
    nameEn: "InflataPark",
    nameAr: "إنفلاتا بارك",
    taglineEn: "Qatar’s Indoor Inflatable Adventure Park for Active Family Fun",
    taglineAr: "حديقة مغامرات داخلية قابلة للنفخ في قطر للمتعة العائلية النشطة",
    locationEn: "City Center Doha, Qatar",
    locationAr: "ستي سنتر الدوحة، قطر",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "E3 WORLD",
    accentColor: "#ec4899",
    mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
    audienceEn: "All Ages & Families",
    audienceAr: "جميع الأعمار والعائلات",
    timingsEn: "12:00 PM - 11:00 PM",
    timingsAr: "١٢:٠٠ م - ١١:٠٠ م",
    price: 35,
    currency: "QAR",
    ctaEn: "Book Pass & Ticket",
    ctaAr: "احجز التذكرة والمواعيد"
  },
  {
    id: "crayons-and-bricks",
    slug: "crayons-and-bricks-place-vendome",
    nameEn: "Crayons & Bricks",
    nameAr: "كرايونز آند بريكس",
    taglineEn: "A Creative Play Studio Where Art, Bricks, and Imagination Come Together",
    taglineAr: "استوديو لعب إبداعي يجمع بين الفن والمكعبات والخيال",
    locationEn: "Place Vendôme Mall, Lusail",
    locationAr: "بلاس فاندوم، لوسيل",
    statusEn: "OPEN NOW",
    statusAr: "مفتوح الآن",
    materialType: "E3 WORLD",
    accentColor: "#f59e0b",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg",
    audienceEn: "Kids & Young Artists",
    audienceAr: "الأطفال والفنانون الصغار",
    timingsEn: "10:00 AM - 10:00 PM",
    timingsAr: "١٠:٠٠ ص - ١٠:٠٠ م",
    price: 50,
    currency: "QAR",
    ctaEn: "Book Pass & Ticket",
    ctaAr: "احجز التذكرة والمواعيد"
  },
  {
    id: "spongebob-paw-patrol",
    slug: "spongebob-squarepants-paw-patrol-activation-meryal",
    nameEn: "SpongeBob & PAW Patrol",
    nameAr: "فعالية سبونج بوب وباو باترول",
    taglineEn: "A Splash-Filled Character Experience Bringing Bikini Bottom to Qatar",
    taglineAr: "تجربة شخصيات مائية تجمع بين بيكيني بوتوم وأدفنتشر باي في قطر",
    locationEn: "Meryal Waterpark, Qetaifan Island",
    locationAr: "حديقة مريال المائية، جزيرة قطيفان",
    statusEn: "SPECIAL ACTIVATION",
    statusAr: "فعالية خاصة",
    materialType: "CHARACTER ACTIVATION",
    accentColor: "#06b6d4",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/2809137c-b6cd-48f0-94d4-80e19c038e4e.JPG",
    audienceEn: "Families & Kids",
    audienceAr: "العائلات والأطفال",
    timingsEn: "10:00 AM - 07:00 PM",
    timingsAr: "١٠:٠٠ ص - ٠٧:٠٠ م",
    price: 0,
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

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
  const worlds = dbMappedWorlds.length > 0 ? dbMappedWorlds : (cmsWorlds.length > 0 ? cmsWorlds : DEFAULT_ATTRACTION_WORLDS)

  // Auto Slider effect
  useEffect(() => {
    if (isPaused || worlds.length <= 1) return

    const interval = setInterval(() => {
      setSelectedIndex(prev => (prev + 1) % worlds.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [isPaused, worlds.length])

  const handleNext = () => {
    setSelectedIndex(prev => (prev + 1) % worlds.length)
  }

  const handlePrev = () => {
    setSelectedIndex(prev => (prev - 1 + worlds.length) % worlds.length)
  }

  const currentWorld = worlds[selectedIndex] || worlds[0] || DEFAULT_ATTRACTION_WORLDS[0]

  const rawBadge = currentWorld.materialType || "E3 WORLD"
  const safeMaterialType = formatLocalizedText((rawBadge === "STAGE_RIBBON" || !rawBadge) ? "E3 WORLD" : rawBadge, locale)

  const nameVal = formatLocalizedText(isAr ? currentWorld.nameAr : currentWorld.nameEn, locale)
  const taglineVal = formatLocalizedText(isAr ? currentWorld.taglineAr : currentWorld.taglineEn, locale)
  const locationVal = formatLocalizedText(isAr ? currentWorld.locationAr : currentWorld.locationEn, locale)
  const audienceVal = formatLocalizedText(isAr ? (currentWorld.audienceAr || "جميع الأعمار") : (currentWorld.audienceEn || "All Ages"), locale)
  const timingsVal = formatLocalizedText(isAr ? (currentWorld.timingsAr || "٠٢:٠٠ م - ١٢:٠٠ ص") : (currentWorld.timingsEn || "02:00 PM - 12:00 AM"), locale)
  const statusVal = formatLocalizedText(isAr ? (currentWorld.statusAr || "مفتوح الآن") : (currentWorld.statusEn || "OPEN NOW"), locale)
  const ctaVal = formatLocalizedText(isAr ? (currentWorld.ctaAr || "احجز التذكرة") : (currentWorld.ctaEn || "Book Pass & Ticket"), locale)

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
        {/* Section Header with Auto Slider Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              {isAr ? "عوالم قطر الترفيهية" : "FLAGSHIP ENTERTAINMENT WORLDS"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {isAr ? "عوالم إي ثري الترفيهية بقطر" : "E3 Featured Attraction Worlds"}
            </h2>
          </div>

          {/* Clean Auto Slider Controls Bar */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 backdrop-blur-md shadow-xl">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-all cursor-pointer shadow-md"
              title={isAr ? "السابق" : "Previous"}
            >
              <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>

            {/* Slide Progress Dots */}
            <div className="flex items-center gap-1.5 px-2">
              {worlds.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                    idx === selectedIndex ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={isAr ? `الانتقال إلى الوجهة ${idx + 1}` : `Go to world ${idx + 1}`}
                />
              ))}
            </div>

            {/* Pause / Play Toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 transition-colors cursor-pointer"
              title={isPaused ? (isAr ? "تشغيل التمرير التلقائي" : "Play Auto Slider") : (isAr ? "إيقاف التمرير التلقائي" : "Pause Auto Slider")}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />}
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-md flex items-center gap-1 font-extrabold text-xs"
              title={isAr ? "التالي" : "Next"}
            >
              <span>{isAr ? "التالي" : "Next"}</span>
              <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
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
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
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
                  alt={nameVal}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              <div className="absolute top-4 start-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-xs font-bold text-emerald-400 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{statusVal}</span>
              </div>

              {/* Floating Next/Prev Arrow Controls on Media Overlay */}
              <button
                onClick={handlePrev}
                className="absolute top-1/2 start-3 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-950/70 hover:bg-emerald-500 hover:text-slate-950 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl cursor-pointer"
                title={isAr ? "السابق" : "Previous"}
              >
                <ChevronLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={handleNext}
                className="absolute top-1/2 end-3 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-950/70 hover:bg-emerald-500 hover:text-slate-950 text-white border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl cursor-pointer"
                title={isAr ? "التالي" : "Next"}
              >
                <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </button>

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
                  📍 {locationVal}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {nameVal}
                </h3>
                <p className="text-sm text-slate-300 font-light mt-2 leading-relaxed">
                  {taglineVal}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Users className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">{isAr ? "الفئة المستهدفة" : "Audience"}</span>
                    <span className="text-xs font-bold text-white">{audienceVal}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">{isAr ? "أوقات العمل" : "Timings"}</span>
                    <span className="text-xs font-bold text-white">{timingsVal}</span>
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
                  <span>{ctaVal}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
