"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ArrowRight, Activity, Briefcase } from 'lucide-react'
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

  return (
    <section id="b2b-portfolio" className="relative py-28 bg-[#0a0a0a] text-white border-y border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? "محفظة العلامات التجارية" : "IP Portfolio & Concepts"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-2xl">
            {isAr ? "تجارب وعلامات تجارية رائدة عالمياً" : "Flagship IPs & Global Concepts"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Brand List (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {brands.map((brand: any) => {
              const isActive = brand.id === activeBrandId
              return (
                <button
                  key={brand.id}
                  onClick={() => setActiveBrandId(brand.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-start transition-all duration-300 w-full cursor-pointer ${
                    isActive
                      ? 'border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 p-1 shrink-0">
                    <img
                      src={brand.compactLogoUrl || brand.logoPrimary || brand.primaryLogoUrl}
                      alt={brand.nameEn}
                      className="w-full h-full object-contain rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white line-clamp-1">{isAr ? brand.nameAr : brand.nameEn}</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5 line-clamp-1">
                      {isAr ? brand.b2bBusinessOverviewAr || brand.taglineAr : brand.b2bBusinessOverviewEn || brand.taglineEn}
                    </p>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Media Header */}
                <div className="relative h-64 sm:h-80 w-full bg-zinc-950 border-b border-zinc-800">
                  {resolveMediaType({ url: activeBrand.coverMediaUrl || activeBrand.primaryMediaUrl, explicitType: activeBrand.mediaType }) === 'VIDEO' ? (
                    <video
                      src={activeBrand.coverMediaUrl || activeBrand.primaryMediaUrl}
                      autoPlay loop muted playsInline
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <img
                      src={activeBrand.coverMediaUrl || activeBrand.primaryMediaUrl}
                      alt={activeBrand.nameEn}
                      className="w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                  
                  <div className="absolute bottom-8 left-8 right-8 flex items-end gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-2xl border border-zinc-200">
                      <img src={activeBrand.primaryLogoUrl || activeBrand.logoPrimary} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="pb-2">
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 mb-2">
                        {activeBrand.category?.nameEn || "ENTERTAINMENT IP"}
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-black text-white">{isAr ? activeBrand.nameAr : activeBrand.nameEn}</h3>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {isAr ? "نظرة عامة على الأعمال" : "Business Overview"}
                      </h4>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {isAr ? activeBrand.b2bBusinessOverviewAr : activeBrand.b2bBusinessOverviewEn}
                      </p>
                    </div>

                    {((isAr ? activeBrand.b2bBusinessValueAr : activeBrand.b2bBusinessValueEn) || activeBrand.b2bBusinessValueEn) && (
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {isAr ? "القيمة التجارية" : "Business Value"}
                        </h4>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {isAr ? (activeBrand.b2bBusinessValueAr || activeBrand.b2bBusinessValueEn) : activeBrand.b2bBusinessValueEn}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {((isAr ? activeBrand.b2bCapabilitiesAr : activeBrand.b2bCapabilitiesEn) || activeBrand.b2bCapabilitiesEn) && (
                      <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                          {isAr ? "القدرات الرئيسية" : "Key Capabilities"}
                        </h4>
                        <ul className="space-y-3">
                          {String(isAr ? (activeBrand.b2bCapabilitiesAr || activeBrand.b2bCapabilitiesEn) : activeBrand.b2bCapabilitiesEn)
                            .split(',')
                            .map((cap: string, i: number) => cap.trim() && (
                              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                <span>{cap.trim()}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link 
                        href={localizeHref(activeBrand.b2bInquiryUrl || "/b2b/contact", locale)}
                        className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors font-bold text-sm"
                      >
                        {isAr 
                          ? (activeBrand.b2bCtaLabelAr || activeBrand.b2bCtaLabelEn || "تواصل معنا للاستثمار")
                          : (activeBrand.b2bCtaLabelEn || "Inquire for Partnership")
                        }
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
