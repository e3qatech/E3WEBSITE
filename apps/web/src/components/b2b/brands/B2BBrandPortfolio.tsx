"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ArrowRight, Activity, Briefcase, CheckCircle2 } from 'lucide-react'
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

  const [activeBrandId, setActiveBrandId] = useState(brands[0]?.id)
  
  if (!brands.length) return null

  const activeBrand = brands.find((b: any) => b.id === activeBrandId) || brands[0]

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
    <section id="b2b-portfolio" className="relative py-24 md:py-32 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-y border-[var(--border-level-1)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? "محفظة العلامات التجارية" : "IP Portfolio & Concepts"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight max-w-2xl">
            {isAr ? "تجارب وعلامات تجارية رائدة عالمياً" : "Flagship IPs & Global Concepts"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Brand List (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            {brands.map((brand: any) => {
              const isActive = brand.id === activeBrandId
              const brandLogo = brand.compactLogoUrl || brand.logoCompact || brand.logoPrimary || brand.primaryLogoUrl || brand.lightLogoUrl || brand.darkLogoUrl
              const brandDesc = isAr
                ? (brand.b2bBusinessOverviewAr || brand.shortDescriptionAr || brand.shortDescAr || brand.taglineAr)
                : (brand.b2bBusinessOverviewEn || brand.shortDescriptionEn || brand.shortDescEn || brand.taglineEn)

              return (
                <button
                  key={brand.id}
                  onClick={() => setActiveBrandId(brand.id)}
                  className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl border text-start transition-all duration-300 w-full cursor-pointer ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/10 text-[var(--text-primary)] shadow-md shadow-emerald-500/10 translate-x-1 rtl:-translate-x-1'
                      : 'border-[var(--border-level-2)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:border-emerald-500/40 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 dark:bg-white/5 border border-[var(--border-level-2)] p-1.5 shrink-0 flex items-center justify-center">
                    {brandLogo ? (
                      <img
                        src={brandLogo}
                        alt={brand.nameEn || "Brand Logo"}
                        className="w-full h-full object-contain rounded-md"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-emerald-500/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{isAr ? brand.nameAr : brand.nameEn}</h3>
                    {brandDesc && (
                      <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5 line-clamp-1">
                        {brandDesc}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Brand Details (Main Area) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBrand.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300"
              >
                {/* Media Header */}
                <div className="relative h-64 sm:h-80 w-full bg-slate-950 border-b border-[var(--border-level-2)] overflow-hidden">
                  {resolveMediaType({ url: mediaUrl, explicitType: activeBrand.mediaType }) === 'VIDEO' ? (
                    <video
                      src={mediaUrl}
                      autoPlay loop muted playsInline
                      className="w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={activeBrand.nameEn}
                      className="w-full h-full object-cover opacity-70"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 flex items-end gap-5">
                    {logoUrl && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-200 shrink-0 flex items-center justify-center">
                        <img src={logoUrl} alt={activeBrand.nameEn || "Logo"} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="pb-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/60 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 mb-2 shadow-sm">
                        {categoryName}
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md truncate">
                        {isAr ? activeBrand.nameAr : activeBrand.nameEn}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Left Column: Business Overview & Value */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-mono">
                        <Activity className="w-4 h-4" />
                        <span>{isAr ? "نظرة عامة على الأعمال" : "Business Overview"}</span>
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {overviewText}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2 font-mono">
                        <Briefcase className="w-4 h-4" />
                        <span>{isAr ? "القيمة التجارية" : "Business Value"}</span>
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {businessValueText}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Key Capabilities & CTA */}
                  <div className="space-y-6 flex flex-col justify-between h-full">
                    <div className="bg-[var(--surface-subtle)] p-5 sm:p-6 rounded-2xl border border-[var(--border-level-2)] space-y-3">
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
                        className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all font-bold text-sm shadow-md hover:shadow-lg shadow-emerald-500/20 active:scale-[0.99] cursor-pointer"
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
      </div>
    </section>
  )
}
