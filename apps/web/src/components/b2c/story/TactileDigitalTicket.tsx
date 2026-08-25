"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Sparkles, ArrowRight, Compass, Calendar, MapPin, Users, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { DEFAULT_ATTRACTION_WORLDS } from './ExperienceWorldsStage'
import { localizeHref } from '@/lib/url-helper'
import { cn, formatLocalizedText } from '@/lib/utils'
import { calculateAttractionStartingPrice, calculateQatarOperatingStatus, getTodayTimingDisplay } from '@/lib/operating-schedule-helper'
import { isAttractionActiveByDate, resolveBookingUrl } from '@/lib/cms-attractions'

interface TactileDigitalTicketProps {
  content: any
  locale: string
}

const SLIDE_DURATION_MS = 5000;

export function TactileDigitalTicket({ content, locale }: TactileDigitalTicketProps) {
  const isAr = locale === 'ar'
  const ticketData = content?.act7Ticket || content?.cta || {}
  
  const secondaryActions = ticketData.secondaryActions || [
    { labelEn: "Explore All Attractions", labelAr: "استكشف كافة الوجهات", url: "/b2c/attractions" },
    { labelEn: "See Upcoming Events", labelAr: "جدول الفعاليات والمواعيد", url: "/b2c/calendar" },
    { labelEn: "Find a Location", labelAr: "استكشف المواقع بالخريطة", url: "/b2c/attractions#interactive-attractions-map" }
  ]

  const initialAttractions = Array.isArray(content?.attractions) && content.attractions.length > 0
    ? content.attractions
    : []

  const [dbAttractions, setDbAttractions] = useState<any[]>(initialAttractions)

  // Fetch live active attractions directly from database API on mount
  useEffect(() => {
    let isMounted = true
    fetch('/api/b2c/attractions')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch attractions")
        return res.json()
      })
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDbAttractions(data)
        }
      })
      .catch(err => {
        console.warn("[TACTILE_DIGITAL_TICKET_FETCH_WARN]", err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Map attractions into normalized digital pass items
  const worlds = useMemo(() => {
    const rawList = dbAttractions.length > 0
      ? dbAttractions.filter(attr => attr.isPublished !== false && isAttractionActiveByDate(attr))
      : (Array.isArray(content?.act3Worlds) && content.act3Worlds.length > 0 ? content.act3Worlds : DEFAULT_ATTRACTION_WORLDS)

    const listToMap = rawList.length > 0 ? rawList : DEFAULT_ATTRACTION_WORLDS

    return listToMap.map((attr: any) => {
      const ops = (attr.operations as any) || {}
      const primaryLoc = attr.attractionLocations?.[0]?.location
      const venueEn = formatLocalizedText(primaryLoc?.nameEn || primaryLoc?.addressEn || ops.venueName || ops.venueAddressEn || attr.locationEn || "Doha, Qatar", 'en') || "Doha, Qatar"
      const venueAr = formatLocalizedText(primaryLoc?.nameAr || primaryLoc?.addressAr || ops.venueName || ops.venueAddressAr || attr.locationAr || "الدوحة، قطر", 'ar') || "الدوحة، قطر"
      const nameEn = formatLocalizedText(attr.nameEn, 'en') || "E3 Attraction"
      const nameAr = formatLocalizedText(attr.nameAr || attr.nameEn, 'ar') || "وجهة ترفيهية"
      const taglineEn = formatLocalizedText(attr.taglineEn || attr.descriptionEn?.substring(0, 90) || "Flagship E3 Interactive World", 'en')
      const taglineAr = formatLocalizedText(attr.taglineAr || attr.descriptionAr?.substring(0, 90) || "وجهة إي ثري التفاعلية", 'ar')
      const audienceEn = formatLocalizedText(ops.audienceEn || attr.audienceEn || "Families & Groups", 'en')
      const audienceAr = formatLocalizedText(ops.audienceAr || attr.audienceAr || "العائلات والأصدقاء", 'ar')
      
      const minPrice = calculateAttractionStartingPrice(attr, attr.price || 45)
      const bookingLink = resolveBookingUrl(attr, locale)

      const slug = attr.slug || 'e3'
      const prefix = slug.split('-')[0]?.toUpperCase() || 'E3'

      return {
        id: attr.id || slug,
        slug: slug,
        passCode: `#${prefix}-2026`,
        nameEn,
        nameAr,
        taglineEn,
        taglineAr,
        locationEn: venueEn,
        locationAr: venueAr,
        audienceEn,
        audienceAr,
        price: minPrice,
        currency: "QAR",
        accentColor: ops.accentColor || attr.accentColor || "#10b981",
        logoUrl: attr.heroThumbnailUrl || attr.heroMediaUrl || attr.heroFallbackUrl || attr.logoUrl || attr.gallery?.[0]?.url || "",
        mediaUrl: attr.heroThumbnailUrl || attr.heroMediaUrl || attr.heroFallbackUrl || attr.mediaUrl || attr.gallery?.[0]?.url || "",
        ticketingUrl: bookingLink || attr.ticketingUrl || `/b2c/attractions/${slug}`
      }
    })
  }, [dbAttractions, content?.act3Worlds, locale])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const pillsContainerRef = useRef<HTMLDivElement>(null)

  const activeWorld = worlds[currentIndex] || worlds[0] || DEFAULT_ATTRACTION_WORLDS[0]

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % worlds.length)
    setProgress(0)
  }, [worlds.length])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + worlds.length) % worlds.length)
    setProgress(0)
  }, [worlds.length])

  const handleSelectIndex = (idx: number) => {
    setCurrentIndex(idx)
    setProgress(0)
  }

  // Auto Slider Timer with Progress Tracking
  useEffect(() => {
    if (isPaused || worlds.length <= 1) return

    const tickInterval = 50
    const step = (tickInterval / SLIDE_DURATION_MS) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + step
      })
    }, tickInterval)

    return () => clearInterval(timer)
  }, [isPaused, worlds.length, handleNext])

  // Scroll active pill smoothly into view
  useEffect(() => {
    if (!pillsContainerRef.current) return
    const container = pillsContainerRef.current
    const activePill = container.querySelector(`[data-pill-index="${currentIndex}"]`) as HTMLElement
    if (activePill) {
      const pillLeft = activePill.offsetLeft
      const pillWidth = activePill.offsetWidth
      const containerWidth = container.offsetWidth
      container.scrollTo({
        left: pillLeft - containerWidth / 2 + pillWidth / 2,
        behavior: 'smooth'
      })
    }
  }, [currentIndex])

  const headline = formatLocalizedText(
    isAr
      ? (ticketData.headlineAr || content?.cta?.titleAr || "هل أنت مستعد لخوض تجربة إي ثري؟")
      : (ticketData.headlineEn || content?.cta?.titleEn || "READY TO EXPERIENCE E3 QATAR?"),
    locale
  )

  const subtext = formatLocalizedText(
    isAr
      ? (ticketData.subtextAr || content?.cta?.subtextAr || content?.cta?.subtitleAr || "اختر تجربتك، احجز مكانك، واجعل من اليوم ذكرى لا تُنسى.")
      : (ticketData.subtextEn || content?.cta?.subtextEn || content?.cta?.subtitleEn || "Choose an experience, book your place and turn today into a memory."),
    locale
  )

  const footerBgUrl = (
    ticketData.backgroundImage ||
    content?.cta?.backgroundImage ||
    content?.cta?.mediaUrl ||
    content?.footerMedia?.mediaUrl ||
    content?.footerMedia?.backgroundImage ||
    ""
  ).trim();

  return (
    <section className="relative py-28 md:py-32 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden transition-colors duration-300" dir={isAr ? "rtl" : "ltr"}>
      {/* Optional Background Media Backdrop */}
      {footerBgUrl && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={footerBgUrl}
            alt="Footer Background"
            className="w-full h-full object-cover opacity-15 dark:opacity-25 scale-105 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/70 to-[var(--bg-level-1)]" />
        </div>
      )}

      {/* Soft B2C Dimensional Portal Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(168,85,247,0.12),rgba(16,185,129,0.08)_45%,transparent_75%)] pointer-events-none" />

      {/* Subtle Portal Ring Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-purple-500/15 pointer-events-none opacity-40 blur-sm" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/20 pointer-events-none opacity-50 blur-xs" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <Ticket className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>{isAr ? "بوابة الخيال إلى الذاكرة — DIGITAL PORTAL PASS" : "FROM IMAGINATION TO MEMORY — DIGITAL PASS"}</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-tight uppercase">
            {headline}
          </h2>
          <p className="text-base sm:text-xl text-[var(--text-secondary)] font-normal max-w-xl mx-auto leading-relaxed">
            {subtext}
          </p>
        </div>

        {/* Soft B2C Portal Pass Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="relative max-w-3xl mx-auto rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-visible text-start space-y-8 group"
        >
          {/* Hologram Foil Edge Effect with dynamic accent gradient */}
          <div 
            className="absolute top-0 start-0 end-0 h-2 rounded-t-3xl transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, #a855f7, ${activeWorld.accentColor || '#10b981'}, #38bdf8)`
            }}
          />

          {/* Ticket Header & Auto-Slider Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-level-2)] pb-6">
            <div className="flex items-center gap-3.5">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-sm overflow-hidden p-1.5 shrink-0 bg-[var(--surface-hover)]"
                style={{
                  borderColor: `${activeWorld.accentColor || '#10b981'}50`,
                  boxShadow: `0 0 15px ${activeWorld.accentColor || '#10b981'}25`
                }}
              >
                {activeWorld.logoUrl || activeWorld.mediaUrl ? (
                  <img
                    src={activeWorld.logoUrl || activeWorld.mediaUrl}
                    alt={isAr ? activeWorld.nameAr : activeWorld.nameEn}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                      if (sibling) sibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className="font-black text-sm uppercase tracking-wider"
                  style={{ 
                    display: (activeWorld.logoUrl || activeWorld.mediaUrl) ? 'none' : 'flex',
                    color: activeWorld.accentColor || '#10b981'
                  }}
                >
                  {activeWorld.nameEn ? activeWorld.nameEn.substring(0, 2).toUpperCase() : 'E3'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest block text-emerald-600 dark:text-emerald-400">
                    {isAr ? "تذكرة الشرف الرقمية" : "OFFICIAL DIGITAL PASS"}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-active)] text-[var(--text-tertiary)] border border-[var(--border-level-1)]">
                    {activeWorld.passCode || "#E3-2026"}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={activeWorld.id || currentIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight mt-0.5"
                  >
                    {isAr ? activeWorld.nameAr : activeWorld.nameEn}
                  </motion.h3>
                </AnimatePresence>
              </div>
            </div>

            {/* Slider Navigation Bar: Index counter & Previous/Next Buttons */}
            <div className="flex items-center gap-2 bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] rounded-2xl p-1.5 shadow-md backdrop-blur-md self-end sm:self-center">
              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label={isAr ? "الوجهة السابقة" : "Previous Attraction"}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all duration-200 cursor-pointer shadow-sm"
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              {/* Active Slide Indicator */}
              <span className="px-3 py-1.5 rounded-xl bg-[var(--bg-level-1)] text-xs font-mono font-bold text-[var(--text-primary)] border border-[var(--border-level-2)] shadow-inner">
                {String(currentIndex + 1).padStart(2, '0')} / {String(worlds.length).padStart(2, '0')}
              </span>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                aria-label={isAr ? "الوجهة التالية" : "Next Attraction"}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all duration-200 cursor-pointer shadow-sm"
              >
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {/* Pause / Play Indicator */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                title={isPaused ? (isAr ? "تشغيل التبديل التلقائي" : "Resume Auto Slider") : (isAr ? "إيقاف التبديل التلقائي مؤقتاً" : "Pause Auto Slider")}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:opacity-80 text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" /> : <Pause className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
              </button>
            </div>
          </div>

          {/* Auto Slider Chips Bar with Progress Track */}
          <div className="space-y-2">
            <div 
              ref={pillsContainerRef}
              className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar snap-x"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] shrink-0 me-1">
                {isAr ? "الوجهات المتاحة:" : "Available Passes:"}
              </span>
              {worlds.map((w: any, idx: number) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={w.id || w.slug || idx}
                    data-pill-index={idx}
                    type="button"
                    onClick={() => handleSelectIndex(idx)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border select-none snap-start",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-md ring-1 ring-emerald-500/30 scale-102"
                        : "border-[var(--border-level-1)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <div 
                      className={cn(
                        "w-2 h-2 rounded-full transition-transform",
                        isSelected ? "scale-125" : "opacity-60"
                      )} 
                      style={{ backgroundColor: w.accentColor || '#10b981' }}
                    />
                    <span>{isAr ? (w.nameAr || w.nameEn) : (w.nameEn || w.nameAr)}</span>
                  </button>
                );
              })}
            </div>

            {/* Auto Slider Progress Bar */}
            <div className="relative w-full h-1 bg-[var(--surface-active)] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-75 ease-linear"
                style={{
                  width: `${progress}%`,
                  backgroundColor: activeWorld.accentColor || '#10b981'
                }}
              />
            </div>
          </div>

          {/* Ticket Info & Action with Animated Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorld.id || currentIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2"
            >
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                  &ldquo;{isAr ? activeWorld.taglineAr : activeWorld.taglineEn}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs">
                  <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{isAr ? activeWorld.locationAr : activeWorld.locationEn}</span>
                  </span>
                  <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>{isAr ? activeWorld.audienceAr : activeWorld.audienceEn}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? "حجز مباشر وتأكيد رقمي فوري" : "Instant Digital Booking Guaranteed"}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-end sm:justify-start gap-2 text-xs text-[var(--text-tertiary)]">
                  <span>{isAr ? "سعر التذكرة يبدأ من:" : "Pass starting at:"}</span>
                  <span className="text-lg font-black text-[var(--text-primary)] font-mono">
                    {activeWorld.price && Number(activeWorld.price) > 0 ? `${activeWorld.price} ${activeWorld.currency || 'QAR'}` : (isAr ? "دخول مجاني" : "Free Admission")}
                  </span>
                </div>

                <Link
                  href={localizeHref(activeWorld.ticketingUrl || `/b2c/attractions/${activeWorld.slug}`, locale)}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-slate-950 font-black text-base transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Ticket className="w-5 h-5" />
                  <span>{isAr ? (ticketData.primaryCtaAr || "احجز تجربتك الآن") : (ticketData.primaryCtaEn || "Book an Experience")}</span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Secondary Exploration Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          {secondaryActions.map((action: any, idx: number) => (
            <Link
              key={idx}
              href={localizeHref(action.url, locale)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
            >
              {idx === 0 ? <Compass className="w-3.5 h-3.5 text-emerald-500" /> : idx === 1 ? <Calendar className="w-3.5 h-3.5 text-sky-500" /> : <MapPin className="w-3.5 h-3.5 text-purple-500" />}
              <span>{isAr ? action.labelAr : action.labelEn}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
