"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Sparkles, ArrowRight, Compass, Calendar, MapPin, Users, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { DEFAULT_ATTRACTION_WORLDS } from './ExperienceWorldsStage'
import { localizeHref } from '@/lib/url-helper'
import { cn, formatLocalizedText } from '@/lib/utils'

interface TactileDigitalTicketProps {
  content: any
  locale: string
}

const SLIDE_DURATION_MS = 5000;

export function TactileDigitalTicket({ content, locale }: TactileDigitalTicketProps) {
  const isAr = locale === 'ar'
  const ticketData = content?.act7Ticket || {}
  const secondaryActions = ticketData.secondaryActions || [
    { labelEn: "Explore Map GIS", labelAr: "تصفح الخريطة التفاعلية", url: "/b2c/attractions#interactive-attractions-map" },
    { labelEn: "View Calendar Schedule", labelAr: "جدول الفعاليات والمواعيد", url: "/b2c/calendar" },
    { labelEn: "Browse All Attractions", labelAr: "استكشف كافة الوجهات", url: "/b2c/attractions" }
  ]

  const rawWorlds = content?.act3Worlds
  const worlds = (Array.isArray(rawWorlds) && rawWorlds.length > 0) ? rawWorlds : DEFAULT_ATTRACTION_WORLDS

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const pillsContainerRef = useRef<HTMLDivElement>(null)

  const rawActiveWorld = worlds[currentIndex] || worlds[0] || DEFAULT_ATTRACTION_WORLDS[0]
  const fallback = DEFAULT_ATTRACTION_WORLDS[0]

  const activeWorld = {
    ...fallback,
    ...rawActiveWorld,
    nameEn: formatLocalizedText(rawActiveWorld.nameEn || fallback.nameEn, 'en'),
    nameAr: formatLocalizedText(rawActiveWorld.nameAr || fallback.nameAr, 'ar'),
    taglineEn: formatLocalizedText(rawActiveWorld.taglineEn || fallback.taglineEn, 'en'),
    taglineAr: formatLocalizedText(rawActiveWorld.taglineAr || fallback.taglineAr, 'ar'),
    locationEn: formatLocalizedText(rawActiveWorld.locationEn || rawActiveWorld.locationNameEn || fallback.locationEn, 'en'),
    locationAr: formatLocalizedText(rawActiveWorld.locationAr || rawActiveWorld.locationNameAr || fallback.locationAr, 'ar'),
    audienceEn: formatLocalizedText(rawActiveWorld.audienceEn || fallback.audienceEn || "All Ages", 'en'),
    audienceAr: formatLocalizedText(rawActiveWorld.audienceAr || fallback.audienceAr || "جميع الأعمار", 'ar'),
    price: rawActiveWorld.price || fallback.price || 45,
    currency: rawActiveWorld.currency || "QAR",
    accentColor: rawActiveWorld.accentColor || fallback.accentColor || "#10b981",
    ticketingUrl: rawActiveWorld.ticketingUrl || '/b2c/calendar'
  };

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

  const footerBgUrl = (
    ticketData.backgroundImage ||
    content?.cta?.backgroundImage ||
    content?.cta?.mediaUrl ||
    content?.footerMedia?.mediaUrl ||
    content?.footerMedia?.backgroundImage ||
    ""
  ).trim();

  return (
    <section className="relative py-32 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden transition-colors duration-300" dir={isAr ? "rtl" : "ltr"}>
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
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            {isAr ? (ticketData.headlineAr || "حكايتك القادمة بانتظارك.") : (ticketData.headlineEn || "Your next story is waiting.")}
          </h2>
          <p className="text-base sm:text-xl text-[var(--text-secondary)] font-light max-w-xl mx-auto leading-relaxed">
            {isAr
              ? (ticketData.subtextAr || "اختر تجربتك، احجز مكانك، واجعل من اليوم ذكرى لا تُنسى.")
              : (ticketData.subtextEn || "Choose an experience, book your place and turn today into a memory.")}
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
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border transition-colors shadow-sm"
                style={{
                  backgroundColor: `${activeWorld.accentColor || '#10b981'}18`,
                  borderColor: `${activeWorld.accentColor || '#10b981'}40`,
                  color: activeWorld.accentColor || '#10b981'
                }}
              >
                E3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest block text-emerald-600 dark:text-emerald-400">
                    {isAr ? "تذكرة الشرف الرقمية" : "OFFICIAL DIGITAL PASS"}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--surface-active)] text-[var(--text-tertiary)] border border-[var(--border-level-1)]">
                    {activeWorld.slug ? `#${activeWorld.slug.split('-')[0]?.toUpperCase()}-2026` : "#E3-2026"}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.h3 
                    key={activeWorld.id || currentIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight mt-0.5"
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
              className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] shrink-0 me-1">
                {isAr ? "الوجهات السريعة:" : "Quick Pass:"}
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
                  <span>{isAr ? "سعر التذكرة:" : "Pass starting at:"}</span>
                  <span className="text-lg font-black text-[var(--text-primary)] font-mono">
                    {activeWorld.price ? `${activeWorld.price} ${activeWorld.currency || 'QAR'}` : "Free Admission"}
                  </span>
                </div>

                <Link
                  href={localizeHref(activeWorld.ticketingUrl || '/b2c/calendar', locale)}
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

