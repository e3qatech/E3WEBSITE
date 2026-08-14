"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Ticket, Compass, Pause, Play, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { OurBrandRecord } from '@/lib/cms-brands'
import { E3ArrowHeroDevice } from './E3ArrowHeroDevice'
import { formatLocalizedText } from '@/lib/utils'
import { localizeHref } from '@/lib/url-helper'

interface OurBrandsConstellationProps {
  content?: any
  locale?: string
}

export function OurBrandsConstellation({ content, locale = 'en' }: OurBrandsConstellationProps) {
  const isAr = locale === 'ar'
  const brandSectionData = content?.ourBrands || {}

  const heading = formatLocalizedText(
    isAr
      ? (brandSectionData.headlineAr || "عوالم من ابتكار E3")
      : (brandSectionData.headlineEn || "Worlds created by E3"),
    locale
  )

  const subtext = formatLocalizedText(
    isAr
      ? (brandSectionData.subtextAr || "استكشف منظومة الوجهات والساحات الترفيهية والتطبيقات الرقمية التي ابتكرتها وطوّرتها E3.")
      : (brandSectionData.subtextEn || "Explore flagship entertainment worlds, kinetic arenas, and digital platforms created and operated by E3."),
    locale
  )

  const [brands, setBrands] = useState<any[]>(brandSectionData.brands || [])
  const [activeBrandId, setActiveBrandId] = useState<string>("")
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  // Update brands from content prop if provided
  useEffect(() => {
    if (Array.isArray(brandSectionData.brands) && brandSectionData.brands.length > 0) {
      setBrands(brandSectionData.brands)
    } else {
      // Dynamic client-side fetch from live DB API endpoint (/api/b2c/brands)
      setIsLoading(true)
      fetch('/api/b2c/brands?published=true&portal=b2c')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const palette = ["#f59e0b", "#10b981", "#ec4899", "#3b82f6", "#06b6d4", "#8b5cf6"];
            const mapped = data.map((b: any, idx: number) => ({
              id: b.id,
              slug: b.slug,
              nameEn: b.b2cTitleOverrideEn || b.nameEn,
              nameAr: b.b2cTitleOverrideAr || b.nameAr,
              taglineEn: b.b2cShortDescOverrideEn || b.taglineEn || b.shortDescriptionEn || "",
              taglineAr: b.b2cShortDescOverrideAr || b.taglineAr || b.shortDescriptionAr || "",
              descriptionEn: b.b2cDetailCopyEn || b.fullStoryEn || b.shortDescriptionEn || b.b2cShortDescOverrideEn || "",
              descriptionAr: b.b2cDetailCopyAr || b.fullStoryAr || b.shortDescriptionAr || b.b2cShortDescOverrideAr || "",
              logoPrimary: b.primaryLogoUrl || b.lightLogoUrl || b.darkLogoUrl || b.compactLogoUrl || "",
              logoLight: b.lightLogoUrl || b.primaryLogoUrl || "",
              logoDark: b.darkLogoUrl || b.primaryLogoUrl || "",
              brandColor: palette[idx % palette.length],
              relationship: b.primaryRelationshipId || b.lifecycleStatus || "OWNED",
              heroImage: b.primaryMediaUrl || b.coverMediaUrl || b.primaryLogoUrl || "",
              ctaUrl: b.b2cCtaUrl || `/b2c/brands/${b.slug}`,
              bookingUrl: b.b2cCtaUrl || `/b2c/brands/${b.slug}`,
              internalRoute: b.b2cCtaUrl || `/b2c/brands/${b.slug}`
            }))
            setBrands(mapped)
          }
        })
        .catch(err => console.error("[OUR_BRANDS_FETCH_ERROR]", err))
        .finally(() => setIsLoading(false))
    }
  }, [brandSectionData.brands])

  // Keep active index in sync with available brands
  useEffect(() => {
    if (brands.length > 0 && (!activeBrandId || !brands.some(b => b.id === activeBrandId))) {
      setActiveBrandId(brands[0].id)
    }
  }, [brands, activeBrandId])

  const activeIndex = brands.findIndex(b => b.id === activeBrandId)
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0
  const activeBrand = brands[safeActiveIndex] || brands[0]

  // Auto-scroll ticker cycle: steps every 1.8 seconds if not paused
  useEffect(() => {
    if (isPaused || brands.length <= 1) return

    const interval = setInterval(() => {
      setActiveBrandId((prevId) => {
        const currentIdx = brands.findIndex(b => b.id === prevId)
        const nextIdx = (currentIdx + 1) % brands.length
        return brands[nextIdx].id
      })
    }, 1800)

    return () => clearInterval(interval)
  }, [isPaused, brands])

  // Center the active brand card in the running ticker view
  useEffect(() => {
    if (!activeBrandId) return
    const activeEl = cardRefs.current[activeBrandId]
    const container = scrollContainerRef.current

    if (activeEl && container) {
      const containerWidth = container.offsetWidth
      const elOffsetLeft = activeEl.offsetLeft
      const elWidth = activeEl.offsetWidth

      const targetScroll = elOffsetLeft - (containerWidth / 2) + (elWidth / 2)

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    }
  }, [activeBrandId])

  const handlePrev = () => {
    if (brands.length === 0) return
    const prevIdx = (safeActiveIndex - 1 + brands.length) % brands.length
    setActiveBrandId(brands[prevIdx].id)
  }

  const handleNext = () => {
    if (brands.length === 0) return
    const nextIdx = (safeActiveIndex + 1) % brands.length
    setActiveBrandId(brands[nextIdx].id)
  }

  const activeName = activeBrand ? formatLocalizedText(isAr ? activeBrand.nameAr : activeBrand.nameEn, locale) : ""

  const rawTaglineEn = activeBrand?.taglineEn || activeBrand?.shortDescEn || activeBrand?.shortDescriptionEn || activeBrand?.tagline
  const rawTaglineAr = activeBrand?.taglineAr || activeBrand?.shortDescAr || activeBrand?.shortDescriptionAr || activeBrand?.tagline

  const rawDescEn = activeBrand?.descriptionEn || activeBrand?.detailCopyEn || activeBrand?.shortDescEn || activeBrand?.shortDescriptionEn || activeBrand?.description
  const rawDescAr = activeBrand?.descriptionAr || activeBrand?.detailCopyAr || activeBrand?.shortDescAr || activeBrand?.shortDescriptionAr || activeBrand?.description

  const activeTagline = activeBrand ? (formatLocalizedText(isAr ? (rawTaglineAr || rawTaglineEn) : (rawTaglineEn || rawTaglineAr), locale) || (activeBrand.relationship === 'OWNED' ? (isAr ? 'فكرة مملوكة لـ E3' : 'Owned E3 Concept') : (isAr ? 'منظومة إي ثري الترفيهية' : 'E3 Entertainment Realm'))) : ""
  const activeDesc = activeBrand ? (formatLocalizedText(isAr ? (rawDescAr || rawDescEn) : (rawDescEn || rawDescAr), locale) || (isAr ? 'وجهة ترفيهية تفاعلية مبتكرة ومصممة بعناية لتقديم تجارب لا تُنسى في قطر.' : 'An innovative interactive entertainment destination engineered by E3 to deliver unforgettable experiences in Qatar.')) : ""

  if (!isLoading && brands.length === 0) {
    return null
  }

  return (
    <section 
      id="our-brands" 
      className="relative py-28 bg-[#070212] text-white border-b border-purple-950/40 overflow-hidden transition-colors duration-1000"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Ambient Brand Color Tint Glow */}
      {activeBrand && (
        <div
          className="absolute inset-0 opacity-25 transition-colors duration-1000 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${activeBrand.brandColor || '#3b82f6'}, transparent 75%)`
          }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header & Ticker Status */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-start max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? "منظومة إي ثري — OUR BRANDS" : "OUR BRANDS — CREATED BY E3"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {heading}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-light">
              {subtext}
            </p>
          </div>

          {/* Ticker Controls */}
          {brands.length > 1 && (
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 backdrop-blur-md">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isAr ? "العلامة التجارية السابقة" : "Previous Brand"}
              >
                <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 transition-colors cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />}
                <span>{isPaused ? (isAr ? "موقوف" : "PAUSED") : (isAr ? "جاري العرض" : "AUTO-TICKER")}</span>
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isAr ? "العلامة التجارية التالية" : "Next Brand"}
              >
                <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Continuous Horizontal Running Ticker Reel */}
        <div className="relative group/ticker">
          {/* Side Fade Overlays */}
          <div className="absolute top-0 bottom-0 start-0 w-16 bg-gradient-to-r from-[#070212] to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 end-0 w-16 bg-gradient-to-l from-[#070212] to-transparent z-20 pointer-events-none" />

          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-4 overflow-x-auto hide-scrollbar py-6 px-4 scroll-smooth snap-x snap-mandatory"
          >
            {brands.map((brand) => {
              const isActive = brand.id === activeBrandId
              const brandName = formatLocalizedText(isAr ? brand.nameAr : brand.nameEn, locale)

              return (
                <button
                  key={brand.id}
                  ref={(el) => { cardRefs.current[brand.id] = el; }}
                  onClick={() => {
                    setActiveBrandId(brand.id)
                    setIsPaused(true)
                  }}
                  onMouseEnter={() => {
                    setActiveBrandId(brand.id)
                    setIsPaused(true)
                  }}
                  className={`relative shrink-0 w-56 p-5 rounded-3xl border text-start transition-all duration-500 cursor-pointer flex flex-col justify-between h-40 group snap-center ${
                    isActive
                      ? 'border-purple-500 bg-purple-950/70 shadow-2xl shadow-purple-950/90 scale-105 z-10'
                      : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: isActive ? (brand.brandColor || '#a855f7') : undefined,
                    boxShadow: isActive ? `0 0 30px ${brand.brandColor || '#a855f7'}40` : undefined
                  }}
                >
                  {/* Constellation Indicator Arrow */}
                  {isActive && (
                    <motion.div
                      layoutId="constellation-arrow"
                      className="absolute -top-3 end-4 z-20"
                    >
                      <E3ArrowHeroDevice variant="LIGHT_BEAM" accentColor={brand.brandColor} className="w-6 h-6" />
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-1">
                      <img
                        src={brand.logoPrimary}
                        alt={brandName}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: brand.brandColor || '#a855f7' }} />
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      {brand.relationship === 'SUBSIDIARY' ? (isAr ? 'شركة تابعة' : 'Subsidiary') :
                       brand.relationship === 'OWNED' ? (isAr ? 'فكرة مملوكة' : 'Owned Concept') :
                       brand.relationship === 'OPERATED' ? (isAr ? 'مفهوم مُشغّل' : 'Operated Concept') :
                       (isAr ? 'تجربة منفّذة' : 'Delivered Experience')}
                    </span>
                    <h3 className="text-base font-extrabold text-white line-clamp-1 mt-0.5">
                      {brandName}
                    </h3>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Detail View Card for the Active Centered Brand */}
        {activeBrand && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBrand.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="p-8 md:p-10 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              style={{ borderColor: activeBrand.brandColor || '#a855f7' }}
            >
              {/* Left Info & Description (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-1 shrink-0 shadow-lg">
                    <img src={activeBrand.logoPrimary} alt={activeName} className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    {activeTagline && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider mb-1 bg-purple-500/10 border border-purple-500/20" style={{ color: activeBrand.brandColor || '#a855f7', borderColor: `${activeBrand.brandColor || '#a855f7'}40` }}>
                        {activeTagline}
                      </span>
                    )}
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                      {activeName}
                    </h3>
                  </div>
                </div>

                {activeDesc && (
                  <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                    {activeDesc}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {(activeBrand.internalRoute || activeBrand.ctaUrl) && (
                    <Link
                      href={localizeHref(activeBrand.internalRoute || activeBrand.ctaUrl, locale)}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-slate-950 font-extrabold text-xs transition-all shadow-lg hover:scale-105 cursor-pointer"
                      style={{ backgroundColor: activeBrand.brandColor || '#a855f7', color: '#090417' }}
                    >
                      <Compass className="w-4 h-4" />
                      <span>{isAr ? "استكشف الوجهة" : "Explore Experience"}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                  )}

                  {activeBrand.bookingUrl && (
                    <Link
                      href={localizeHref(activeBrand.bookingUrl, locale)}
                      className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-700 bg-slate-950 hover:bg-slate-900 text-xs font-extrabold text-slate-200 hover:text-white transition-all cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? "حجز التذاكر" : "Book Tickets"}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Brand Hero Cover Image Stage (5 Cols) */}
              <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                {activeBrand.heroImage || activeBrand.logoPrimary ? (
                  <img
                    src={activeBrand.heroImage || activeBrand.logoPrimary}
                    alt={activeName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 flex items-center justify-center p-6 text-center">
                    <span className="text-xs font-mono text-slate-500 uppercase">{activeName}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}
