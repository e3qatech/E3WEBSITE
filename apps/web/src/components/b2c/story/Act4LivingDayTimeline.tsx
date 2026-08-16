import { Clock, Radio, Ticket, ChevronLeft, ChevronRight, Sun, Sunset, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatLocalizedText } from '@/lib/utils'
import { localizeHref } from '@/lib/url-helper'

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
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" 
        : (category === 'LATER' ? "bg-amber-500/15 text-amber-300 border-amber-500/40" : "bg-purple-500/15 text-purple-300 border-purple-500/40"),
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

  // Dynamic Day-to-Evening Timeline Palette
  const auraGradients = {
    NOW: 'radial-gradient(circle at 30% 50%, rgba(16,185,129,0.18), transparent 70%)',
    LATER: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2), rgba(236,72,153,0.1) 60%, transparent 80%)',
    SOON: 'radial-gradient(circle at 70% 50%, rgba(139,92,246,0.22), rgba(6,182,212,0.1) 60%, transparent 80%)',
  }

  return (
    <section id="living-day" className="relative py-24 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden transition-colors duration-300" dir={isAr ? "rtl" : "ltr"}>
      {/* Living Day-to-Evening Atmospheric Radial Lighting */}
      <div
        className="absolute inset-0 transition-all duration-1000 pointer-events-none opacity-40 dark:opacity-100"
        style={{ background: auraGradients[activeTab] }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[var(--border-level-2)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 shadow-sm">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>{isAr ? "الفصل الرابع — جدول اليوم الحي" : "ACT IV — THE LIVING DAY TIMELINE"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {isAr ? "جدول فعاليات ووجهات اليوم" : "Today's Live Schedule & Timings"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Living Day-to-Evening Timeline Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] backdrop-blur-md shadow-md">
              <button
                onClick={() => setActiveTab('NOW')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all duration-300 cursor-pointer ${
                  activeTab === 'NOW'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{isAr ? "مفتوح الآن (صباحاً)" : "Happening Now"}</span>
              </button>

              <button
                onClick={() => setActiveTab('LATER')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all duration-300 cursor-pointer ${
                  activeTab === 'LATER'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Sunset className="w-3.5 h-3.5" />
                <span>{isAr ? "مساء اليوم" : "Later Today (Evening)"}</span>
              </button>

              <button
                onClick={() => setActiveTab('SOON')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all duration-300 cursor-pointer ${
                  activeTab === 'SOON'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{isAr ? "قريباً (الجلسات القادمة)" : "Coming Soon"}</span>
              </button>
            </div>

            {/* Slide Navigation Controls when cards > 1 */}
            {isSlider && (
              <div className="flex items-center gap-2 bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] rounded-2xl p-1.5 shadow-md backdrop-blur-md">
                <button
                  onClick={handlePrevSlide}
                  className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all duration-200 cursor-pointer shadow-sm"
                  title={isAr ? "الشريحة السابقة" : "Previous Slide"}
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-[var(--bg-level-1)] text-xs font-mono font-bold text-[var(--text-primary)] border border-[var(--border-level-2)] shadow-inner">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <button
                  onClick={handleNextSlide}
                  className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all duration-200 cursor-pointer shadow-sm"
                  title={isAr ? "الشريحة التالية" : "Next Slide"}
                  aria-label="Next Slide"
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
              const targetUrl = localizeHref(item.slug ? `/b2c/attractions/${item.slug}` : `/b2c/calendar`, locale)

              return (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-emerald-500/50 transition-all group shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${item.badgeColor}`}>
                        {statusVal}
                      </span>
                      <h3 className="text-xl font-extrabold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                        {titleVal}
                      </h3>
                      <span className="text-xs text-[var(--text-secondary)] block mt-1">
                        📍 {venueVal}
                      </span>
                    </div>

                    <div className="text-end">
                      <span className="text-xs text-[var(--text-secondary)] block">{isAr ? "التذكرة" : "Ticket"}</span>
                      <span className="text-lg font-extrabold text-[var(--text-primary)]">{item.price > 0 ? `${item.price} QAR` : (isAr ? "مجاني" : "Free")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border-level-2)] pt-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{timeVal}</span>
                    </div>

                    <a
                      href={targetUrl}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
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
          <div className="flex items-center justify-center gap-2 pt-6">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'w-2 bg-[var(--border-level-2)] hover:bg-[var(--text-tertiary)]'
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
