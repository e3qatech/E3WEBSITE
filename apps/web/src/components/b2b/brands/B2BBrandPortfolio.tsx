"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ArrowRight, Activity, Briefcase, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { resolveMediaType } from '@/lib/media-resolver'
import { localizeHref } from '@/lib/url-helper'

interface B2BBrandPortfolioProps {
  content?: any
  locale?: string
}

export function B2BBrandPortfolio({ content, locale = 'en' }: B2BBrandPortfolioProps) {
  const isAr = locale === 'ar'
  const brandSectionData = content?.ourBrands || {}

  const brands = brandSectionData.brands && brandSectionData.brands.length > 0
    ? brandSectionData.brands
    : []

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const tabsScrollRef = useRef<HTMLDivElement>(null)
  
  if (!brands.length) return null

  const activeIndex = Math.max(0, Math.min(currentIndex, brands.length - 1))
  const activeBrand = brands[activeIndex] || brands[0]

  const handleSelect = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : brands.length - 1))
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev < brands.length - 1 ? prev + 1 : 0))
  }

  const scrollTabs = (offset: number) => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ left: isAr ? -offset : offset, behavior: 'smooth' })
    }
  }

  // Scroll active tab horizontally inside its container only when user changes tab, never on initial mount
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (tabsScrollRef.current) {
      const activeBtn = tabsScrollRef.current.children[activeIndex] as HTMLElement
      if (activeBtn) {
        const container = tabsScrollRef.current
        const scrollTarget = activeBtn.offsetLeft - (container.clientWidth / 2) + (activeBtn.clientWidth / 2)
        container.scrollTo({ left: scrollTarget, behavior: 'smooth' })
      }
    }
  }, [activeIndex])

  // Fallbacks for Business Overview & Value
  const overviewText = (isAr
    ? (activeBrand.b2bBusinessOverviewAr || activeBrand.shortDescriptionAr || activeBrand.shortDescAr || activeBrand.taglineAr || activeBrand.detailCopyAr || activeBrand.fullStoryAr)
    : (activeBrand.b2bBusinessOverviewEn || activeBrand.shortDescriptionEn || activeBrand.shortDescEn || activeBrand.taglineEn || activeBrand.detailCopyEn || activeBrand.fullStoryEn)
  ) || (isAr
    ? "علامة ترفيهية رائدة مصممة لتشغيل المراكز الترفيهية والتجارية وتجارب العائلات والزوار في قطر."
    : "Leading commercial entertainment IP engineered for high-capacity venue installations, retail activation, and family engagement across Qatar."
  )

  const businessValueText = (isAr
    ? (activeBrand.b2bBusinessValueAr || activeBrand.b2bDetailCopyAr || activeBrand.fullStoryAr || activeBrand.shortDescriptionAr)
    : (activeBrand.b2bBusinessValueEn || activeBrand.b2bDetailCopyEn || activeBrand.fullStoryEn || activeBrand.shortDescriptionEn)
  ) || (isAr
    ? "جذب مستمر للزوار، عائد استثماري مثبت، ونموذج تشغيلي متكامل مخصص للمجمعات التجارية والوجهات الكبرى."
    : "High footfall generation, strong per-capita spend, and proven turnkey operational models tailored for Qatar mall anchors and festival environments."
  )

  // Fallbacks for Capabilities
  const rawCapabilities = isAr
    ? (activeBrand.b2bCapabilitiesAr || activeBrand.b2bCapabilitiesEn)
    : activeBrand.b2bCapabilitiesEn

  const defaultCapabilities = isAr
    ? ["تشغيل متكامل للمراكز الترفيهية", "تصميم وتصنيع هندسي مخصص", "إدارة العمليات الميدانية", "أنظمة تذاكر وسعة عالية"]
    : ["Turnkey FEC Deployment", "Bespoke Theming & Design", "Full Operational Management", "High-Capacity Ticketing"]

  const capabilitiesList: string[] = rawCapabilities
    ? String(rawCapabilities).split(',').map((c: string) => c.trim()).filter(Boolean)
    : defaultCapabilities

  const logoUrl = activeBrand.primaryLogoUrl || activeBrand.logoPrimary || activeBrand.compactLogoUrl || activeBrand.lightLogoUrl || activeBrand.darkLogoUrl
  const mediaUrl = activeBrand.coverMediaUrl || activeBrand.primaryMediaUrl || activeBrand.thumbnailUrl || activeBrand.fallbackImageUrl || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80"
  
  const categoryName = isAr
    ? (activeBrand.category?.nameAr || activeBrand.category?.nameEn || "علامة ترفيهية رائدة")
    : (activeBrand.category?.nameEn || "ENTERTAINMENT IP")

  const ctaLabel = isAr
    ? (activeBrand.b2bCtaLabelAr || activeBrand.b2bCtaLabelEn || "طلب شراكة واستثمار")
    : (activeBrand.b2bCtaLabelEn || "Inquire for Partnership")

  const ctaUrl = localizeHref(activeBrand.b2bInquiryUrl || activeBrand.b2bCtaUrl || activeBrand.ctaUrl || "/b2b/contact", locale)

  return (
    <section id="b2b-portfolio" className="relative py-24 md:py-32 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-y border-[var(--border-level-1)] transition-colors duration-300 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-1/4 start-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[180px] rounded-full" />
      <div className="pointer-events-none absolute bottom-1/4 end-1/4 w-[600px] h-[600px] bg-teal-500/5 blur-[180px] rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Section Header with Slider Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-md">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "محفظة العلامات التجارية" : "IP Portfolio & Concepts"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight drop-shadow-sm">
              {isAr ? "تجارب وعلامات تجارية رائدة عالمياً" : "Flagship IPs & Global Concepts"}
            </h2>
          </div>

          {/* Top Counter & Arrows */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-[var(--surface-default)]/90 backdrop-blur-xl border border-[var(--border-level-2)] text-xs font-mono font-bold text-[var(--text-secondary)] shadow-sm">
              <span className="text-emerald-400 font-extrabold text-sm">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="opacity-40 mx-1.5">/</span>
              <span>{String(brands.length).padStart(2, '0')}</span>
            </div>
            <button
              onClick={handlePrev}
              className="p-3 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)]/90 backdrop-blur-xl hover:bg-[var(--surface-hover)] hover:border-emerald-500/60 text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              aria-label={isAr ? "السابق" : "Previous IP"}
              title={isAr ? "السابق" : "Previous IP"}
            >
              <ChevronLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)]/90 backdrop-blur-xl hover:bg-[var(--surface-hover)] hover:border-emerald-500/60 text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              aria-label={isAr ? "التالي" : "Next IP"}
              title={isAr ? "التالي" : "Next IP"}
            >
              <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 1. HORIZONTAL IP SELECTOR SLIDER TRACK (WITH EDGE FADE MASKS & NO CLIPPING) */}
        <div className="relative group">
          {/* Subtle edge fade masks */}
          <div className="pointer-events-none absolute inset-y-0 start-0 w-8 sm:w-16 bg-gradient-to-r from-[var(--bg-level-1)] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 end-0 w-8 sm:w-16 bg-gradient-to-l from-[var(--bg-level-1)] to-transparent z-10" />

          {/* Quick scroll nudge arrows on hover for desktop */}
          <button
            onClick={() => scrollTabs(-240)}
            className="absolute start-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-white hover:border-emerald-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hidden sm:flex cursor-pointer"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => scrollTabs(240)}
            className="absolute end-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-white hover:border-emerald-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hidden sm:flex cursor-pointer"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <div
            ref={tabsScrollRef}
            className="flex items-center gap-3 overflow-x-auto py-2 px-4 sm:px-8 scrollbar-none scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {brands.map((brand: any, idx: number) => {
              const isActive = idx === activeIndex
              const brandLogo = brand.compactLogoUrl || brand.logoCompact || brand.logoPrimary || brand.primaryLogoUrl || brand.lightLogoUrl || brand.darkLogoUrl
              
              return (
                <button
                  key={brand.id || idx}
                  onClick={() => handleSelect(idx)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 shrink-0 cursor-pointer snap-start ${
                    isActive
                      ? 'border-emerald-500/80 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30 scale-[1.03]'
                      : 'border-[var(--border-level-2)] bg-[var(--surface-default)]/90 backdrop-blur-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:border-emerald-500/50 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl overflow-hidden p-1 shrink-0 flex items-center justify-center transition-colors ${
                    isActive ? 'bg-white/20 border border-white/30' : 'bg-white/10 dark:bg-white/5 border border-[var(--border-level-2)]'
                  }`}>
                    {brandLogo ? (
                      <img
                        src={brandLogo}
                        alt={brand.nameEn || "Brand Logo"}
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <span className={`font-bold text-xs sm:text-sm whitespace-nowrap ${isActive ? 'text-white font-extrabold' : ''}`}>
                    {isAr ? brand.nameAr : brand.nameEn}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. BOUNDED SLEEK SHOWCASE CARD */}
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeBrand.id || activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-[var(--surface-default)]/95 backdrop-blur-2xl border border-[var(--border-level-2)] rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 ring-1 ring-white/5 hover:border-emerald-500/40"
            >
              {/* Media Header Banner */}
              <div className="relative h-80 sm:h-[400px] lg:h-[440px] w-full bg-slate-950 border-b border-[var(--border-level-2)] overflow-hidden group">
                {resolveMediaType({ url: mediaUrl, explicitType: activeBrand.mediaType }) === 'VIDEO' ? (
                  <video
                    src={mediaUrl}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={activeBrand.nameEn}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                {/* Cinematic Glass Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30 rtl:bg-gradient-to-l" />
                
                {/* Floating Category & Title Over Banner */}
                <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 z-10">
                  <div className="flex items-center sm:items-end gap-4 sm:gap-6 min-w-0">
                    {logoUrl && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[var(--surface-default)]/95 dark:bg-zinc-900/90 backdrop-blur-2xl p-3 shadow-2xl border border-white/25 dark:border-emerald-500/30 shrink-0 flex items-center justify-center ring-4 ring-black/40 group-hover:scale-105 transition-transform">
                        <img src={logoUrl} alt={activeBrand.nameEn || "Logo"} className="w-full h-full object-contain filter drop-shadow-md" />
                      </div>
                    )}
                    <div className="pb-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-xl border border-emerald-500/40 mb-2.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{categoryName}</span>
                      </div>
                      <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black font-syne text-white drop-shadow-lg truncate">
                        {isAr ? activeBrand.nameAr : activeBrand.nameEn}
                      </h3>
                    </div>
                  </div>

                  {/* In-Banner Quick Slider Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-auto bg-black/70 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl shrink-0">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white transition-all cursor-pointer active:scale-95"
                      aria-label="Previous"
                      title="Previous"
                    >
                      <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                    <span className="text-xs font-mono font-extrabold text-white px-2.5">
                      <span className="text-emerald-400">{activeIndex + 1}</span> / {brands.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white transition-all cursor-pointer active:scale-95"
                      aria-label="Next"
                      title="Next"
                    >
                      <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Body Grid */}
              <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Business Overview & Strategic Value (7 Cols) */}
                <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                  <div className="p-6 rounded-2xl bg-[var(--bg-level-1)]/60 border border-[var(--border-level-2)] backdrop-blur-sm space-y-2 hover:border-emerald-500/30 transition-colors shadow-xs">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? "نظرة عامة على الأعمال" : "Business Overview"}</span>
                    </h4>
                    <p className="text-sm sm:text-base text-[var(--text-primary)]/90 leading-relaxed font-normal">
                      {overviewText}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[var(--bg-level-1)]/60 border border-[var(--border-level-2)] backdrop-blur-sm space-y-2 hover:border-teal-500/30 transition-colors shadow-xs">
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                      <Briefcase className="w-4 h-4 text-teal-400" />
                      <span>{isAr ? "القيمة التجارية والتشغيلية" : "Commercial & Strategic Value"}</span>
                    </h4>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                      {businessValueText}
                    </p>
                  </div>
                </div>

                {/* Right Column: Key Capabilities & CTA (5 Cols) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between h-full">
                  <div className="bg-[var(--bg-level-1)]/80 p-6 rounded-2xl border border-[var(--border-level-2)] backdrop-blur-sm space-y-4 shadow-xs">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono flex items-center gap-2 border-b border-[var(--border-level-2)] pb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? "القدرات والحلول التشغيلية" : "Key Operational Capabilities"}</span>
                    </h4>
                    <ul className="space-y-3">
                      {capabilitiesList.map((cap: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--text-primary)]/90">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                          <span className="font-semibold">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Link 
                      href={ctaUrl}
                      className="inline-flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 transition-all font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
                    >
                      <span>{ctaLabel}</span>
                      <ArrowRight className={`w-4 h-4 font-bold ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
