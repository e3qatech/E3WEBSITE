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

  // Scroll active tab into view in the horizontal slider
  useEffect(() => {
    if (tabsScrollRef.current) {
      const activeBtn = tabsScrollRef.current.children[activeIndex] as HTMLElement
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header with Slider Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isAr ? "محفظة العلامات التجارية" : "IP Portfolio & Concepts"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight">
              {isAr ? "تجارب وعلامات تجارية رائدة عالمياً" : "Flagship IPs & Global Concepts"}
            </h2>
          </div>

          {/* Top Counter & Arrows */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs font-mono font-bold text-[var(--text-secondary)] shadow-xs">
              <span className="text-emerald-500 font-extrabold">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="opacity-40 mx-1.5">/</span>
              <span>{String(brands.length).padStart(2, '0')}</span>
            </div>
            <button
              onClick={handlePrev}
              className="p-3 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] hover:border-emerald-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label={isAr ? "السابق" : "Previous IP"}
              title={isAr ? "السابق" : "Previous IP"}
            >
              <ChevronLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] hover:border-emerald-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label={isAr ? "التالي" : "Next IP"}
              title={isAr ? "التالي" : "Next IP"}
            >
              <ChevronRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 1. HORIZONTAL IP SELECTOR SLIDER TRACK */}
        <div className="relative group">
          <div
            ref={tabsScrollRef}
            className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth snap-x snap-mandatory"
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
                      ? 'border-emerald-500 bg-emerald-500/15 text-[var(--text-primary)] shadow-md shadow-emerald-500/15 scale-[1.02]'
                      : 'border-[var(--border-level-2)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:border-emerald-500/40 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/10 dark:bg-white/5 border border-[var(--border-level-2)] p-0.5 shrink-0 flex items-center justify-center">
                    {brandLogo ? (
                      <img
                        src={brandLogo}
                        alt={brand.nameEn || "Brand Logo"}
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-emerald-500/60" />
                    )}
                  </div>
                  <span className="font-bold text-xs sm:text-sm whitespace-nowrap">
                    {isAr ? brand.nameAr : brand.nameEn}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. BOUNDED SHOWCASE CARD */}
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeBrand.id || activeIndex}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300"
            >
              {/* Media Header Banner */}
              <div className="relative h-72 sm:h-96 w-full bg-slate-950 border-b border-[var(--border-level-2)] overflow-hidden">
                {resolveMediaType({ url: mediaUrl, explicitType: activeBrand.mediaType }) === 'VIDEO' ? (
                  <video
                    src={mediaUrl}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover opacity-75"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={activeBrand.nameEn}
                    className="w-full h-full object-cover opacity-75"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                
                {/* Floating Category & Title Over Banner */}
                <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex items-end gap-4 sm:gap-5 min-w-0">
                    {logoUrl && (
                      <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-200 shrink-0 flex items-center justify-center">
                        <img src={logoUrl} alt={activeBrand.nameEn || "Logo"} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="pb-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/60 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 mb-2 shadow-sm">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{categoryName}</span>
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md truncate">
                        {isAr ? activeBrand.nameAr : activeBrand.nameEn}
                      </h3>
                    </div>
                  </div>

                  {/* In-Banner Quick Slider Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-auto bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-lg shrink-0">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      aria-label="Previous"
                    >
                      <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-white px-2">
                      {activeIndex + 1} / {brands.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      aria-label="Next"
                    >
                      <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Body Grid */}
              <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Business Overview & Value (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-mono">
                      <Activity className="w-4 h-4" />
                      <span>{isAr ? "نظرة عامة على الأعمال" : "Business Overview"}</span>
                    </h4>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                      {overviewText}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-mono">
                      <Briefcase className="w-4 h-4" />
                      <span>{isAr ? "القيمة التجارية والتشغيلية" : "Commercial & Strategic Value"}</span>
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {businessValueText}
                    </p>
                  </div>
                </div>

                {/* Right Column: Key Capabilities & CTA (5 Cols) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between h-full">
                  <div className="bg-[var(--surface-subtle)] p-6 rounded-2xl border border-[var(--border-level-2)] space-y-3.5">
                    <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{isAr ? "القدرات الرئيسية" : "Key Capabilities"}</span>
                    </h4>
                    <ul className="space-y-2.5">
                      {capabilitiesList.map((cap: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span className="font-medium">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Link 
                      href={ctaUrl}
                      className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all font-bold text-sm shadow-lg hover:shadow-xl shadow-emerald-500/20 active:scale-[0.99] cursor-pointer"
                    >
                      <span>{ctaLabel}</span>
                      <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
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
