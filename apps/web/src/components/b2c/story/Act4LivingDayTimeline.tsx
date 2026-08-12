import { Clock, Radio, Ticket, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatLocalizedText } from '@/lib/utils'

interface Act4LivingDayTimelineProps {
  content: any
  locale: string
}

export function Act4LivingDayTimeline({ content, locale }: Act4LivingDayTimelineProps) {
  const isAr = locale === 'ar'
  const [activeTab, setActiveTab] = useState<'NOW' | 'LATER' | 'SOON'>('NOW')
  const [dbAttractions, setDbAttractions] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

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

  const cmsLivingDay = content?.livingDay || {}

  // Map real database attractions to schedule items
  const realAttractionItems = dbAttractions.map(attr => {
    const minPrice = Array.isArray(attr.pricing) && attr.pricing.length > 0
      ? Math.min(...attr.pricing.map((p: any) => p.price))
      : 45

    const venue = attr.operations?.venueName 
      || attr.operations?.venueAddressEn 
      || attr.attractionLocations?.[0]?.location?.addressEn 
      || (isAr ? "الدوحة، قطر" : "Doha, Qatar")

    const timingsEn = attr.operations?.timingsEn || "10:00 AM - 10:00 PM"
    const timingsAr = attr.operations?.timingsAr || "١٠:٠٠ ص - ١٠:٠٠ م"

    const isLateNight = timingsEn.includes("12:00 AM") || timingsEn.includes("11:00 PM")
    const isSpecialActivation = attr.slug.includes("spongebob") || attr.operations?.materialType === "CHARACTER ACTIVATION"

    let category: 'NOW' | 'LATER' | 'SOON' = 'NOW'
    if (isSpecialActivation) {
      category = 'NOW'
    } else if (isLateNight) {
      category = 'LATER'
    } else if (attr.slug.includes("inflatapark-doha-mall")) {
      category = 'SOON'
    }

    return {
      id: attr.id || attr.slug,
      slug: attr.slug,
      titleEn: attr.nameEn,
      titleAr: attr.nameAr || attr.nameEn,
      venueEn: venue,
      venueAr: venue,
      timeEn: timingsEn,
      timeAr: timingsAr,
      statusEn: category === 'NOW' ? "Open Now" : (category === 'LATER' ? "Open Until Midnight" : "Upcoming Session"),
      statusAr: category === 'NOW' ? "مفتوح الآن" : (category === 'LATER' ? "مفتوح حتى منتصف الليل" : "جلسة قادمة"),
      badgeColor: category === 'NOW' 
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
        : (category === 'LATER' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-purple-500/10 text-purple-400 border-purple-500/30"),
      price: minPrice,
      category
    }
  })

  // Group real database attractions into time categories
  const liveNow = realAttractionItems.filter(i => i.category === 'NOW')
  const liveLater = realAttractionItems.filter(i => i.category === 'LATER')
  const liveSoon = realAttractionItems.filter(i => i.category === 'SOON')

  const scheduleNow = (cmsLivingDay.scheduleNow && cmsLivingDay.scheduleNow.length > 0) 
    ? cmsLivingDay.scheduleNow 
    : (liveNow.length > 0 ? liveNow : realAttractionItems.slice(0, 2))

  const scheduleLater = (cmsLivingDay.scheduleLater && cmsLivingDay.scheduleLater.length > 0) 
    ? cmsLivingDay.scheduleLater 
    : (liveLater.length > 0 ? liveLater : realAttractionItems.slice(2, 4))

  const scheduleSoon = (cmsLivingDay.scheduleSoon && cmsLivingDay.scheduleSoon.length > 0) 
    ? cmsLivingDay.scheduleSoon 
    : (liveSoon.length > 0 ? liveSoon : realAttractionItems.slice(4))

  const getList = () => {
    if (activeTab === 'NOW') return scheduleNow
    if (activeTab === 'LATER') return scheduleLater
    return scheduleSoon
  }

  const currentList = getList()

  useEffect(() => {
    setCurrentSlide(0)
  }, [activeTab])

  const CARDS_PER_SLIDE = 2
  const isSlider = currentList.length > 1
  const totalSlides = isSlider ? Math.ceil(currentList.length / CARDS_PER_SLIDE) : 1
  
  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides)
  }

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides)
  }

  const visibleCards = isSlider
    ? currentList.slice(currentSlide * CARDS_PER_SLIDE, (currentSlide + 1) * CARDS_PER_SLIDE)
    : currentList

  return (
    <section id="living-day" className="relative py-24 bg-[#060212] text-white border-b border-purple-950/40 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgba(16,185,129,0.1),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{isAr ? "الفصل الرابع — جدول اليوم الحي" : "ACT IV — THE LIVING DAY"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {isAr ? "جدول فعاليات ووجهات اليوم" : "Today's Live Schedule & Timings"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Category Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveTab('NOW')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'NOW' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? "مفتوح الآن" : "Happening Now"}
              </button>
              <button
                onClick={() => setActiveTab('LATER')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'LATER' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? "لاحقاً اليوم" : "Later Today"}
              </button>
              <button
                onClick={() => setActiveTab('SOON')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'SOON' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? "قريباً" : "Coming Soon"}
              </button>
            </div>

            {/* Slide Navigation Controls when cards > 1 */}
            {isSlider && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
                <button
                  onClick={handlePrevSlide}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                  title={isAr ? "الشريحة السابقة" : "Previous Slide"}
                >
                  <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>
                <span className="text-xs font-mono font-bold text-slate-400 px-2">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <button
                  onClick={handleNextSlide}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                  title={isAr ? "الشريحة التالية" : "Next Slide"}
                >
                  <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Schedule Cards (Slide View) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${currentSlide}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`grid grid-cols-1 ${visibleCards.length > 1 ? 'md:grid-cols-2' : 'max-w-2xl mx-auto'} gap-6`}
          >
            {visibleCards.map((item: any) => {
              const titleVal = formatLocalizedText(isAr ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr), locale)
              const venueVal = formatLocalizedText(isAr ? (item.venueAr || item.venueEn) : (item.venueEn || item.venueAr), locale)
              const timeVal = formatLocalizedText(isAr ? (item.timeAr || item.timeEn) : (item.timeEn || item.timeAr), locale)
              const statusVal = formatLocalizedText(isAr ? (item.statusAr || item.statusEn) : (item.statusEn || item.statusAr), locale)
              const targetUrl = item.slug ? `/b2c/attractions/${item.slug}` : `/b2c/tickets`

              return (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${item.badgeColor}`}>
                        {statusVal}
                      </span>
                      <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                        {titleVal}
                      </h3>
                      <span className="text-xs text-slate-400 block mt-1">
                        📍 {venueVal}
                      </span>
                    </div>

                    <div className="text-end">
                      <span className="text-xs text-slate-400 block">{isAr ? "التذكرة" : "Ticket"}</span>
                      <span className="text-lg font-extrabold text-white">{item.price > 0 ? `${item.price} QAR` : (isAr ? "مجاني" : "Free")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{timeVal}</span>
                    </div>

                    <a
                      href={targetUrl}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{isAr ? "احجز الآن" : "Book Ticket"}</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots for Slider */}
        {isSlider && totalSlides > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
