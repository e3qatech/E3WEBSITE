"use client"

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Filter, Search, ArrowRight, Sparkles, Building2, Calendar, Trophy, Layers } from 'lucide-react'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { cn } from '@/lib/utils'

interface CaseStudyItem {
  id: string
  slug: string
  titleEn: string
  titleAr: string
  clientName?: string
  year?: number
  category?: string
  isFeatured?: boolean
  heroImageUrl?: string
  thumbnailUrl?: string
  heroMediaType?: string
  thumbnailMediaType?: string
  clientLogoUrl?: string
  metrics?: any
}

interface CaseStudiesIndexClientProps {
  caseStudies: CaseStudyItem[]
  heroData: {
    title: string
    subtitle: string
    mediaType?: string
    mediaUrl?: string
  }
  ctaData?: {
    title?: string
    description?: string
    primaryCta?: string
    primaryLink?: string
    mediaType?: string
    mediaUrl?: string
  } | null
  locale: string
}

export function CaseStudiesIndexClient({
  caseStudies,
  heroData,
  ctaData,
  locale
}: CaseStudiesIndexClientProps) {
  const isAr = locale === 'ar'
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>()
    caseStudies.forEach(cs => {
      if (cs.category) set.add(cs.category)
    })
    return Array.from(set)
  }, [caseStudies])

  // Filtered case studies list
  const filteredCaseStudies = useMemo(() => {
    return caseStudies.filter(cs => {
      const title = isAr ? (cs.titleAr || cs.titleEn) : cs.titleEn
      const matchesSearch = !searchQuery || 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cs.clientName && cs.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cs.category && cs.category.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCat = selectedCategory === 'ALL' || cs.category === selectedCategory

      return matchesSearch && matchesCat
    })
  }, [caseStudies, selectedCategory, searchQuery, isAr])

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. CINEMATIC HERO */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden border-b border-zinc-900/80 pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          {heroData.mediaUrl ? (
            <UniversalMediaRenderer 
              type={heroData.mediaType as any || "IMAGE"} 
              src={heroData.mediaUrl}
              alt="Case Studies Hero"
              className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.1]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 mix-blend-overlay pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5" />
              <span>{isAr ? "سجل الإنجازات والنتائج" : "DELIVERED LANDMARK PROOF"}</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-syne text-zinc-100 tracking-tight leading-[1.05] mb-6 drop-shadow-xl">
              {heroData.title}
            </h1>

            <p className="text-xl md:text-2xl text-zinc-300 font-medium max-w-3xl leading-relaxed">
              {heroData.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 2. FILTERS & SEARCH TOOLBAR */}
      <section className="py-8 bg-zinc-950/80 sticky top-16 z-30 backdrop-blur-xl border-b border-zinc-900">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory('ALL')}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                  selectedCategory === 'ALL'
                    ? "bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-100 border border-zinc-800"
                )}
              >
                {isAr ? "جميع المشاريع" : "All Projects"} ({caseStudies.length})
              </button>

              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-100 border border-zinc-800"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث باسم المشروع أو العميل..." : "Search project or client..."}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full ps-10 pe-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

          </div>
        </div>
      </section>

      {/* 3. DYNAMIC CASE STUDIES BENTO GRID */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          {filteredCaseStudies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCaseStudies.map((cs, i) => {
                const title = isAr ? (cs.titleAr || cs.titleEn) : cs.titleEn
                const mediaUrl = cs.heroImageUrl || cs.thumbnailUrl
                const mediaType = cs.heroMediaType || cs.thumbnailMediaType || "IMAGE"
                const firstMetric = Array.isArray(cs.metrics) && cs.metrics.length > 0 ? cs.metrics[0] : null
                const isAnchorTile = cs.isFeatured || (i === 0 && selectedCategory === 'ALL')

                return (
                  <Link 
                    key={cs.id} 
                    href={`/${locale}/b2b/cases/${cs.slug}`}
                    className={cn(
                      "group relative rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/60 transition-all duration-500 overflow-hidden flex flex-col justify-between p-6 md:p-8 backdrop-blur-md hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
                      isAnchorTile ? "lg:col-span-2 min-h-[460px]" : "min-h-[380px]"
                    )}
                  >
                    {/* Media Thumbnail */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      {mediaUrl ? (
                        <UniversalMediaRenderer 
                          type={mediaType as any} 
                          src={mediaUrl}
                          alt={title}
                          className="w-full h-full object-cover filter brightness-[0.7] group-hover:brightness-[0.85] group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {cs.category && (
                            <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-zinc-950/80 text-emerald-400 border border-emerald-500/30 rounded-full backdrop-blur-md">
                              {cs.category}
                            </span>
                          )}
                          {cs.isFeatured && (
                            <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full backdrop-blur-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>FEATURED</span>
                            </span>
                          )}
                        </div>

                        {cs.year && (
                          <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-300 bg-zinc-950/80 border border-zinc-800 rounded-full backdrop-blur-md flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            <span>{cs.year}</span>
                          </span>
                        )}
                      </div>

                      {/* Main Title & Client */}
                      <div className="mt-auto pt-12">
                        {cs.clientName && (
                          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{cs.clientName}</span>
                          </div>
                        )}

                        <h3 className={cn("font-black font-syne text-zinc-100 tracking-tight mb-4 group-hover:text-emerald-400 transition-colors", isAnchorTile ? "text-3xl md:text-4xl" : "text-2xl")}>
                          {title}
                        </h3>

                        {/* Metric Badge Callout */}
                        {firstMetric && (
                          <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-6">
                            <span>{firstMetric.valueEn || firstMetric.value}</span>
                            <span>•</span>
                            <span>{isAr ? (firstMetric.labelAr || firstMetric.labelEn || firstMetric.label) : (firstMetric.labelEn || firstMetric.label)}</span>
                          </div>
                        )}

                        {/* CTA Arrow */}
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-all duration-300 pt-2 border-t border-zinc-800/80">
                          <span>{isAr ? "عرض دراسة الحالة كاملة" : "Read Full Case Study"}</span>
                          <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-24 border border-zinc-800/80 rounded-3xl bg-zinc-900/20">
              <p className="text-zinc-400 font-medium text-lg">
                {isAr ? "لم يتم العثور على مشاريع تطابق البحث الحالي." : "No projects found matching your filter criteria."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. FOOTER RFP CTA */}
      {ctaData && (
        <section className="py-24 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl relative z-10">
            <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight mb-6">
              {ctaData.title || (isAr ? "هل لديك مشروع تجاري؟" : "Have a Landmark Project in Mind?")}
            </h2>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
              {ctaData.description || (isAr ? "تواصل مع فريق الهندسة والإنتاج في إي ثري لبناء وتفعيل تجربتك القادمة." : "Collaborate with E3's turnkey masterplanning, fabrication, and live operations teams.")}
            </p>
            <Link 
              href={ctaData.primaryLink || `/${locale}/b2b/contact`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
            >
              <span>{ctaData.primaryCta || (isAr ? "اتصل بنا الان" : "Contact Our Team")}</span>
              <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}
