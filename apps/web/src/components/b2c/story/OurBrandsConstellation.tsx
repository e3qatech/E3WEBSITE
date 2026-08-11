"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ExternalLink, Ticket, Compass } from 'lucide-react'
import { DEFAULT_OUR_BRANDS, OurBrandRecord } from '@/lib/cms-brands'
import { E3ArrowHeroDevice } from './E3ArrowHeroDevice'
import { resolveMediaType } from '@/lib/media-resolver'

interface OurBrandsConstellationProps {
  content?: any
  locale?: string
}

export function OurBrandsConstellation({ content, locale = 'en' }: OurBrandsConstellationProps) {
  const isAr = locale === 'ar'
  const brandSectionData = content?.ourBrands || {}

  const heading = isAr
    ? (brandSectionData.headlineAr || "عوالم من ابتكار E3")
    : (brandSectionData.headlineEn || "Worlds created by E3")

  const subtext = isAr
    ? (brandSectionData.subtextAr || "استكشف منظومة الوجهات والساحات الترفيهية والتطبيقات الرقمية التي ابتكرتها وطوّرتها E3.")
    : (brandSectionData.subtextEn || "Explore flagship entertainment worlds, kinetic arenas, and digital platforms created and operated by E3.")

  const brands: OurBrandRecord[] = brandSectionData.brands && brandSectionData.brands.length > 0
    ? brandSectionData.brands
    : DEFAULT_OUR_BRANDS

  const [activeBrandId, setActiveBrandId] = useState(brands[0]?.id || DEFAULT_OUR_BRANDS[0].id)
  const activeBrand = brands.find(b => b.id === activeBrandId) || brands[0] || DEFAULT_OUR_BRANDS[0]

  return (
    <section id="our-brands" className="relative py-28 bg-[#070212] text-white border-b border-purple-950/40 overflow-hidden transition-colors duration-1000">
      {/* Ambient Brand Color Tint Glow */}
      <div
        className="absolute inset-0 opacity-20 transition-colors duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${activeBrand.brandColor || '#3b82f6'}, transparent 75%)`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "منظومة إي ثري — OUR BRANDS" : "OUR BRANDS — CREATED BY E3"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-light max-w-2xl mx-auto">
            {subtext}
          </p>
        </div>

        {/* Brand Constellation Logos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((brand) => {
            const isActive = brand.id === activeBrandId
            return (
              <button
                key={brand.id}
                onClick={() => setActiveBrandId(brand.id)}
                onMouseEnter={() => setActiveBrandId(brand.id)}
                className={`relative p-5 rounded-3xl border text-start transition-all duration-500 cursor-pointer flex flex-col justify-between aspect-square group ${
                  isActive
                    ? 'border-purple-500 bg-purple-950/60 shadow-2xl shadow-purple-950/80 scale-105 z-10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
                style={{
                  borderColor: isActive ? (brand.brandColor || '#a855f7') : undefined
                }}
              >
                {/* E3 Arrow Constellation Trail Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="constellation-arrow"
                    className="absolute -top-3 end-4 z-20"
                  >
                    <E3ArrowHeroDevice variant="LIGHT_BEAM" accentColor={brand.brandColor} className="w-6 h-6" />
                  </motion.div>
                )}

                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-1">
                  <img
                    src={brand.logoPrimary}
                    alt={brand.nameEn}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    {brand.relationship === 'SUBSIDIARY' ? (isAr ? 'شركة تابعة' : 'Subsidiary') :
                     brand.relationship === 'OWNED' ? (isAr ? 'فكرة مملوكة' : 'Owned Concept') :
                     brand.relationship === 'OPERATED' ? (isAr ? 'مفهوم مُشغّل' : 'Operated Concept') :
                     (isAr ? 'تجربة منفّذة' : 'Delivered Experience')}
                  </span>
                  <h3 className="text-base font-extrabold text-white line-clamp-1 mt-0.5">
                    {isAr ? brand.nameAr : brand.nameEn}
                  </h3>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Active Brand Focus Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBrand.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            style={{ borderColor: activeBrand.brandColor || '#a855f7' }}
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-1">
                  <img src={activeBrand.logoPrimary} alt={activeBrand.nameEn} className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: activeBrand.brandColor || '#a855f7' }}>
                    {isAr ? activeBrand.taglineAr : activeBrand.taglineEn}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {isAr ? activeBrand.nameAr : activeBrand.nameEn}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-300 font-light leading-relaxed">
                {isAr ? activeBrand.descriptionAr : activeBrand.descriptionEn}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {activeBrand.internalRoute && (
                  <Link
                    href={activeBrand.internalRoute}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-slate-950 font-extrabold text-xs transition-all shadow-lg hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: activeBrand.brandColor || '#a855f7', color: '#090417' }}
                  >
                    <Compass className="w-4 h-4" />
                    <span>{isAr ? "استكشف الوجهة" : "Explore Experience"}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                )}

                {activeBrand.bookingUrl && (
                  <Link
                    href={activeBrand.bookingUrl}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-700 bg-slate-950 hover:bg-slate-900 text-xs font-extrabold text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "احجز التذاكر" : "Book Tickets"}</span>
                  </Link>
                )}

                {activeBrand.externalUrl && (
                  <a
                    href={activeBrand.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-all"
                  >
                    <span>{isAr ? "الموقع الرسمي" : "Visit Platform"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
              {resolveMediaType({ url: activeBrand.desktopFeatureMedia || activeBrand.logoPrimary, explicitType: (activeBrand as any)?.mediaType || (activeBrand as any)?.desktopFeatureMediaType || undefined }) === 'VIDEO' ? (
                <video
                  key={activeBrand.desktopFeatureMedia || activeBrand.id}
                  src={activeBrand.desktopFeatureMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  key={activeBrand.desktopFeatureMedia || activeBrand.logoPrimary}
                  src={activeBrand.desktopFeatureMedia || activeBrand.logoPrimary}
                  alt={activeBrand.nameEn}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
