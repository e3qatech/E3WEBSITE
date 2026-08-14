"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Sparkles, Building2, Calendar, Trophy, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { cn } from '@/lib/utils'
import { isCaseStudyEligible } from '@/lib/case-studies'

interface CaseStudyItem {
  id: string
  slug: string
  titleEn: string
  titleAr: string
  clientName?: string
  year?: number
  category?: string
  isFeatured?: boolean
  isPublished?: boolean
  heroImageUrl?: string
  thumbnailUrl?: string
  heroMediaType?: string
  thumbnailMediaType?: string
  clientLogoUrl?: string
  metrics?: any
  servicesUsed?: any
}

interface CaseStudiesIndexClientProps {
  caseStudies: CaseStudyItem[]
  services?: any[]
  employeeProfiles?: any[]
  cmsContent: any
  locale: string
}

export function CaseStudiesIndexClient({
  caseStudies,
  services: _services = [],
  employeeProfiles = [],
  cmsContent,
  locale
}: CaseStudiesIndexClientProps) {
  const isAr = locale === 'ar'
  
  // Section bindings
  const hero = cmsContent?.hero || {}
  const showreel = cmsContent?.showreel || {}
  const factStream = useMemo(() => cmsContent?.factStream || {}, [cmsContent?.factStream])
  const featuredCasesConfig = useMemo(() => cmsContent?.featuredCases || {}, [cmsContent?.featuredCases])
  const teamStoriesConfig = cmsContent?.teamStories || {}
  const transformationsConfig = cmsContent?.transformations || {}
  const impactOverviewConfig = cmsContent?.impactOverview || {}
  const cta = cmsContent?.cta || {}

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedYear, setSelectedYear] = useState<string>('ALL')
  const [selectedServiceId] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Fact Stream Auto-Rotation State
  const [factIndex, setFactIndex] = useState<number>(0)
  const [isFactPaused, setIsFactPaused] = useState<boolean>(false)

  // Base Published & Eligible Cases Pool (QF-05)
  const eligibleCases = useMemo(() => {
    return (caseStudies || []).filter(isCaseStudyEligible)
  }, [caseStudies])

  // Dynamic Fact Extraction from Published Case Studies
  const factsList = useMemo(() => {
    if (factStream.enabled === false) return []
    
    let cases = [...eligibleCases]

    if (factStream.displayOrder === 'MANUAL' && Array.isArray(factStream.selectedCaseStudyIds) && factStream.selectedCaseStudyIds.length > 0) {
      const set = new Set(factStream.selectedCaseStudyIds.map(String))
      cases = cases.filter(cs => set.has(String(cs.id)))
    } else if (factStream.displayOrder === 'NEWEST_FIRST') {
      cases = [...cases].sort((a, b) => (b.year || 0) - (a.year || 0))
    } else {
      // FEATURED_FIRST default
      cases = [...cases].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }

    const list: any[] = []
    cases.forEach(cs => {
      const metricsArr = Array.isArray(cs.metrics) ? cs.metrics : []
      metricsArr.forEach((m: any, idx: number) => {
        const val = m.valueEn || m.value || m.val || ""
        const labelEn = m.labelEn || m.label || ""
        const labelAr = m.labelAr || m.label || labelEn
        if (val && (labelEn || labelAr)) {
          list.push({
            id: `${cs.id}_metric_${idx}`,
            caseStudyId: cs.id,
            caseStudyTitleEn: cs.titleEn,
            caseStudyTitleAr: cs.titleAr || cs.titleEn,
            caseStudySlug: cs.slug,
            caseStudyMedia: cs.heroImageUrl || cs.thumbnailUrl || "",
            value: val,
            prefix: m.prefix || "",
            suffix: m.suffix || "",
            headlineEn: labelEn,
            headlineAr: labelAr,
            descEn: m.descEn || m.descriptionEn || cs.titleEn,
            descAr: m.descAr || m.descriptionAr || cs.titleAr || cs.titleEn
          })
        }
      })
    })

    const maxLimit = Number(factStream.maxFacts) || 10
    return list.slice(0, maxLimit)
  }, [eligibleCases, factStream])

  // Featured Case Studies Resolution
  const featuredCasesList = useMemo(() => {
    if (featuredCasesConfig.enabled === false) return []

    if (featuredCasesConfig.selectionMode === 'MANUAL') {
      const selectedIds: string[] = Array.isArray(featuredCasesConfig.selectedCaseStudyIds)
        ? featuredCasesConfig.selectedCaseStudyIds.map(String)
        : []
      
      if (selectedIds.length === 0) return [] // Explicit empty manual selection returns empty array

      const caseMap = new Map(eligibleCases.map(cs => [String(cs.id), cs]))
      const resolved = selectedIds
        .map(id => caseMap.get(id))
        .filter(isCaseStudyEligible) as any[]

      const maxLimit = Number(featuredCasesConfig.maxItems) || 3
      return resolved.slice(0, maxLimit)
    }

    // FEATURED_FLAG mode
    const featured = eligibleCases.filter(cs => cs.isFeatured)
    const maxLimit = Number(featuredCasesConfig.maxItems) || 3
    return featured.slice(0, maxLimit)
  }, [eligibleCases, featuredCasesConfig])

  useEffect(() => {
    if (factsList.length <= 1 || isFactPaused) return
    const durationMs = (Number(factStream.rotationDuration) || 5) * 1000
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % factsList.length)
    }, durationMs)
    return () => clearInterval(interval)
  }, [factsList.length, isFactPaused, factStream.rotationDuration])

  // Before & After Slider Handle State
  const [sliderPosition, setSliderPosition] = useState<number>(50)
  const isDraggingRef = useRef<boolean>(false)

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(pos)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(pos)
  }

  // Categories & Years derived dynamically from published cases
  const categories = useMemo(() => {
    const set = new Set<string>()
    eligibleCases.forEach(cs => {
      if (cs.category) set.add(cs.category)
    })
    return Array.from(set)
  }, [eligibleCases])

  const years = useMemo(() => {
    const set = new Set<number>()
    eligibleCases.forEach(cs => {
      if (cs.year) set.add(cs.year)
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [eligibleCases])

  // Filtered case studies
  const filteredCaseStudies = useMemo(() => {
    return eligibleCases.filter(cs => {
      const title = isAr ? (cs.titleAr || cs.titleEn) : cs.titleEn
      const matchesSearch = !searchQuery || 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cs.clientName && cs.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cs.category && cs.category.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCat = selectedCategory === 'ALL' || cs.category === selectedCategory
      const matchesYr = selectedYear === 'ALL' || (cs.year && cs.year.toString() === selectedYear)

      let matchesSvc = true
      if (selectedServiceId !== 'ALL' && Array.isArray(cs.servicesUsed)) {
        matchesSvc = cs.servicesUsed.includes(selectedServiceId)
      }

      return matchesSearch && matchesCat && matchesYr && matchesSvc
    })
  }, [eligibleCases, selectedCategory, selectedYear, selectedServiceId, searchQuery, isAr])

  // Team stories list
  const teamStoriesList = Array.isArray(teamStoriesConfig.stories) ? teamStoriesConfig.stories : []

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* ============================================================ */}
      {/* 1. CINEMATIC HERO SECTION */}
      {/* ============================================================ */}
      {hero.enabled !== false && (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-zinc-900/80 pt-32 pb-20">
          <div className="absolute inset-0 z-0">
            {/* Desktop Media */}
            <div className={hero.mobileMediaUrl ? "hidden md:block w-full h-full" : "w-full h-full"}>
              {hero.mediaUrl ? (
                <UniversalMediaRenderer 
                  type={hero.mediaType as any || "IMAGE"} 
                  src={hero.mediaUrl}
                  poster={hero.posterImage}
                  alt="Case Studies Hero"
                  className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.1]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
              )}
            </div>

            {/* Mobile Media (When Provided) */}
            {hero.mobileMediaUrl && (
              <div className="md:hidden w-full h-full">
                <UniversalMediaRenderer 
                  type={hero.mediaType as any || "IMAGE"} 
                  src={hero.mobileMediaUrl}
                  poster={hero.posterImage}
                  alt="Case Studies Mobile Hero"
                  className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.1]"
                />
              </div>
            )}

            <div 
              className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" 
              style={{ opacity: (hero.overlayStrength ?? 70) / 100 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent rtl:bg-gradient-to-l" />
          </div>

          <div className="container relative z-10 mx-auto px-4 md:px-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
                <Trophy className="w-3.5 h-3.5" />
                <span>{isAr ? (hero.eyebrowAr || "سجل الإنجازات") : (hero.eyebrowEn || "The Vault")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{caseStudies.length} {isAr ? "مشروعاً موثقاً" : "Delivered Landmarks"}</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-syne text-zinc-100 tracking-tight leading-[1.05] mb-6 drop-shadow-xl">
                {isAr ? (hero.titleAr || "الأفكار تصنع الإمكانات. والنتائج تثبتها.") : (hero.titleEn || "Ideas Are Powerful. Results Make Them Real.")}
              </h1>

              <p className="text-xl md:text-2xl text-zinc-300 font-medium max-w-3xl leading-relaxed mb-4">
                {isAr ? (hero.subtitleAr || "اكتشف التجارب والوجهات والفعاليات الاستثنائية التي حولتها إي ثري من أفكار طموحة إلى إنجازات ذات أثر ملموس.") : (hero.subtitleEn || "Explore the experiences, destinations and landmark events E3 has transformed from ambitious ideas into measurable impact.")}
              </p>

              {(hero.descriptionEn || hero.descriptionAr) && (
                <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed mb-8">
                  {isAr ? hero.descriptionAr : hero.descriptionEn}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {(() => {
                  const isPrimaryExt = hero.primaryLink?.startsWith('http');
                  const primaryHref = hero.primaryLink || "#archive";
                  return isPrimaryExt ? (
                    <a 
                      href={primaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-syne font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] inline-flex items-center gap-2 group"
                    >
                      <span>{isAr ? (hero.primaryCtaAr || "استكشف أعمالنا") : (hero.primaryCtaEn || "Explore Our Work")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                    </a>
                  ) : (
                    <a 
                      href={primaryHref} 
                      className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-syne font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] inline-flex items-center gap-2 group"
                    >
                      <span>{isAr ? (hero.primaryCtaAr || "استكشف أعمالنا") : (hero.primaryCtaEn || "Explore Our Work")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                    </a>
                  );
                })()}

                {hero.secondaryCtaEn && (() => {
                  const isSecExt = hero.secondaryLink?.startsWith('http');
                  const secHref = hero.secondaryLink || "/b2b/contact";
                  return isSecExt ? (
                    <a 
                      href={secHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 font-syne font-bold text-sm uppercase tracking-widest transition-all duration-300 backdrop-blur-md"
                    >
                      {isAr ? (hero.secondaryCtaAr || "ابدأ مشروعك") : hero.secondaryCtaEn}
                    </a>
                  ) : (
                    <Link 
                      href={secHref} 
                      className="px-8 py-4 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 font-syne font-bold text-sm uppercase tracking-widest transition-all duration-300 backdrop-blur-md"
                    >
                      {isAr ? (hero.secondaryCtaAr || "ابدأ مشروعك") : hero.secondaryCtaEn}
                    </Link>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 2. INTERACTIVE SHOWREEL SECTION */}
      {/* ============================================================ */}
      {showreel.enabled !== false && showreel.mediaUrl && (
        <section className="py-20 bg-zinc-950 border-b border-zinc-900 relative">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md relative group">
              <UniversalMediaRenderer 
                type={(showreel.mediaType as any) || (showreel.mediaUrl?.includes('youtube.com') || showreel.mediaUrl?.includes('youtu.be') ? "YOUTUBE" : showreel.mediaUrl?.includes('vimeo.com') ? "VIMEO" : "VIDEO")} 
                src={showreel.mediaUrl}
                poster={showreel.posterImage}
                autoPlay={showreel.autoplay !== false}
                muted={showreel.muted !== false}
                loop
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12 pointer-events-none">
                <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-2">
                  {isAr ? (showreel.eyebrowAr || "عرض مرئي استثنائي") : (showreel.eyebrowEn || "CINEMATIC SHOWCASE")}
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
                  {isAr ? (showreel.titleAr || "نظرة إلى التجارب التي نصنعها") : (showreel.titleEn || "A Glimpse Inside the Experiences We Build")}
                </h2>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 3. VERIFIED FACT STREAM (DYNAMICAL EXTRACTED FROM CASESTUDY METRICS) */}
      {/* ============================================================ */}
      {factStream.enabled !== false && factsList.length > 0 && (
        <section 
          className="py-20 bg-zinc-900/40 border-b border-zinc-900 relative"
          onMouseEnter={() => setIsFactPaused(true)}
          onMouseLeave={() => setIsFactPaused(false)}
        >
          <div className="container mx-auto px-4 md:px-8 max-w-5xl">
            <div className="text-center mb-10">
              <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs uppercase tracking-widest">
                {isAr ? (factStream.labelAr || "هل تعلم؟") : (factStream.labelEn || "Did You Know?")}
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-syne text-zinc-100 tracking-tight mt-4">
                {isAr ? (factStream.titleAr || "وراء كل مشروع قصة أكبر من الأرقام.") : (factStream.titleEn || "Every Project Leaves a Bigger Story Behind.")}
              </h2>
            </div>

            {/* Fact Carousel Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 min-h-[240px]">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-5xl md:text-7xl font-black font-syne text-amber-400 tracking-tight">
                    {factsList[factIndex]?.prefix}{factsList[factIndex]?.value}{factsList[factIndex]?.suffix}
                  </div>
                  {factStream.showProjectTitle !== false && factsList[factIndex]?.caseStudyTitleEn && (
                    <Link 
                      href={`/${locale}/b2b/cases/${factsList[factIndex]?.caseStudySlug}`}
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-mono text-amber-300 font-bold hover:border-amber-400/50 transition-colors"
                    >
                      {isAr ? factsList[factIndex]?.caseStudyTitleAr : factsList[factIndex]?.caseStudyTitleEn}
                    </Link>
                  )}
                </div>

                <h3 className="text-2xl font-bold font-syne text-zinc-100">
                  {isAr ? (factsList[factIndex]?.headlineAr || factsList[factIndex]?.headlineEn) : factsList[factIndex]?.headlineEn}
                </h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  {isAr ? (factsList[factIndex]?.descAr || factsList[factIndex]?.descEn) : factsList[factIndex]?.descEn}
                </p>
              </div>

              {/* Navigation & Progress */}
              <div className="flex items-center gap-4 shrink-0">
                <button 
                  onClick={() => setFactIndex((prev) => (prev - 1 + factsList.length) % factsList.length)}
                  className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 transition-colors"
                  aria-label="Previous Fact"
                >
                  <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                </button>
                <div className="text-xs font-mono font-bold text-zinc-500">
                  {factIndex + 1} / {factsList.length}
                </div>
                <button 
                  onClick={() => setFactIndex((prev) => (prev + 1) % factsList.length)}
                  className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 transition-colors"
                  aria-label="Next Fact"
                >
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 4. FEATURED CASE STUDIES SPOTLIGHT SECTION */}
      {/* ============================================================ */}
      {featuredCasesConfig.enabled !== false && featuredCasesList.length > 0 && (
        <section className="py-24 bg-zinc-950 border-b border-zinc-900 relative">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                  {isAr ? (featuredCasesConfig.eyebrowAr || "المشاريع الرئيسية") : (featuredCasesConfig.eyebrowEn || "FEATURED LANDMARKS")}
                </span>
                <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
                  {isAr ? (featuredCasesConfig.titleAr || "إنجازات رئيسية ذات أثر ملموس") : (featuredCasesConfig.titleEn || "Landmark Experience Spotlights")}
                </h2>
              </div>

              <a 
                href={featuredCasesConfig.viewAllLink || "#archive"} 
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold uppercase tracking-widest group"
              >
                <span>{isAr ? (featuredCasesConfig.viewAllCtaAr || "استكشف كافة الأعمال") : (featuredCasesConfig.viewAllCtaEn || "Explore All Work")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCasesList.map((cs: any) => {
                const title = isAr ? (cs.titleAr || cs.titleEn) : cs.titleEn;
                const mediaUrl = cs.heroImageUrl || cs.thumbnailUrl;
                const mediaType = cs.heroMediaType || cs.thumbnailMediaType || "IMAGE";
                const firstMetric = Array.isArray(cs.metrics) && cs.metrics.length > 0 ? cs.metrics[0] : null;

                return (
                  <Link 
                    key={cs.id}
                    href={`/${locale}/b2b/cases/${cs.slug}`}
                    className="group relative rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/60 transition-all duration-500 overflow-hidden flex flex-col justify-between p-8 backdrop-blur-md min-h-[440px] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                  >
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      {mediaUrl ? (
                        <UniversalMediaRenderer 
                          type={mediaType as any} 
                          src={mediaUrl}
                          alt={title}
                          className="w-full h-full object-cover filter brightness-[0.65] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-3">
                        <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full backdrop-blur-md flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>SPOTLIGHT</span>
                        </span>
                        {cs.year && (
                          <span className="px-3 py-1 text-xs font-mono font-bold text-zinc-300 bg-zinc-950/80 border border-zinc-800 rounded-full backdrop-blur-md">
                            {cs.year}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-12">
                        {cs.clientName && (
                          <div className="text-xs font-mono text-zinc-400 mb-2">{cs.clientName}</div>
                        )}
                        <h3 className="text-2xl md:text-3xl font-black font-syne text-zinc-100 tracking-tight mb-4 group-hover:text-emerald-400 transition-colors">
                          {title}
                        </h3>

                        {firstMetric && (
                          <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-6">
                            <span>{firstMetric.valueEn || firstMetric.value}</span>
                            <span>•</span>
                            <span>{isAr ? (firstMetric.labelAr || firstMetric.labelEn || firstMetric.label) : (firstMetric.labelEn || firstMetric.label)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest pt-2 border-t border-zinc-800/80">
                          <span>{isAr ? (featuredCasesConfig.cardCtaAr || "عرض تفاصيل المشروع") : (featuredCasesConfig.cardCtaEn || "Read Case Study")}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 4. FILTERABLE PROJECT ARCHIVE TOOLBAR & GRID */}
      {/* ============================================================ */}
      <section id="archive" className="py-12 bg-zinc-950/80 sticky top-16 z-30 backdrop-blur-xl border-b border-zinc-900">
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

            {/* Search & Year Select */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {years.length > 0 && (
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-full px-4 py-2 text-xs font-mono text-zinc-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL">{isAr ? "كافة السنوات" : "All Years"}</option>
                  {years.map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              )}

              <div className="relative flex-1 lg:w-72">
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
        </div>
      </section>

      {/* ARCHIVE GRID */}
      <section className="py-16 md:py-24 border-b border-zinc-900">
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

                        {firstMetric && (
                          <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-6">
                            <span>{firstMetric.valueEn || firstMetric.value}</span>
                            <span>•</span>
                            <span>{isAr ? (firstMetric.labelAr || firstMetric.labelEn || firstMetric.label) : (firstMetric.labelEn || firstMetric.label)}</span>
                          </div>
                        )}

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

      {/* ============================================================ */}
      {/* BEFORE & AFTER TRANSFORMATIONS */}
      {/* ============================================================ */}
      {transformationsConfig.enabled !== false && Array.isArray(transformationsConfig.items) && transformationsConfig.items.length > 0 && (
        <section className="py-24 bg-zinc-950 border-b border-zinc-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">{isAr ? "قبل وبعد التنفيذ" : "SPATIAL EVOLUTION"}</span>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
                {isAr ? (transformationsConfig.titleAr || "التحول الفضائي قبل وبعد التنفيذ") : (transformationsConfig.titleEn || "Before & After Transformations")}
              </h2>
            </div>

            <div className="max-w-5xl mx-auto space-y-12">
              {transformationsConfig.items.filter((tr: any) => tr.beforeUrl && tr.afterUrl).map((tr: any, i: number) => {
                const beforeLabel = isAr ? (tr.beforeLabelAr || tr.beforeLabelEn || "قبل التنفيذ") : (tr.beforeLabelEn || "Before Build")
                const afterLabel = isAr ? (tr.afterLabelAr || tr.afterLabelEn || "التشغيل الحي") : (tr.afterLabelEn || "Live Activation")
                const caption = isAr ? (tr.captionAr || tr.captionEn) : tr.captionEn

                return (
                  <div key={i} className="space-y-4">
                    <div 
                      className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-800 cursor-ew-resize select-none touch-none"
                      onTouchMove={handleTouchMove}
                      onMouseDown={() => { isDraggingRef.current = true }}
                      onMouseUp={() => { isDraggingRef.current = false }}
                      onMouseLeave={() => { isDraggingRef.current = false }}
                      onMouseMove={handleMouseMove}
                    >
                      <img src={tr.afterUrl} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute top-4 end-4 px-3 py-1 bg-emerald-500/90 text-zinc-950 font-mono font-bold text-xs rounded-full uppercase tracking-wider backdrop-blur-md">
                        {afterLabel}
                      </div>

                      <div 
                        className="absolute inset-0 overflow-hidden border-e-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img src={tr.beforeUrl} alt={beforeLabel} className="w-full h-full object-cover" style={{ width: '100%', height: '100%' }} />
                        <div className="absolute top-4 start-4 px-3 py-1 bg-zinc-900/90 text-amber-400 font-mono font-bold text-xs rounded-full uppercase tracking-wider border border-amber-400/30 backdrop-blur-md">
                          {beforeLabel}
                        </div>
                      </div>

                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold text-xs shadow-xl pointer-events-none"
                        style={{ left: `calc(${sliderPosition}% - 18px)` }}
                      >
                        ↔
                      </div>
                    </div>
                    {caption && <div className="text-xs font-mono text-zinc-400 text-center">{caption}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 5. TEAM STORIES — "BEHIND THE BUILD" */}
      {/* ============================================================ */}
      {teamStoriesConfig.enabled !== false && teamStoriesList.length > 0 && (
        <section className="py-24 bg-zinc-900/30 border-b border-zinc-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl mb-16">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block mb-2">
                {isAr ? (teamStoriesConfig.eyebrowAr || "خلف الكواليس") : (teamStoriesConfig.eyebrowEn || "Behind the Build")}
              </span>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
                {isAr ? (teamStoriesConfig.titleAr || "قصص لا يراها الجمهور على المسرح.") : (teamStoriesConfig.titleEn || "The Stories You Don’t See on Stage.")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {teamStoriesList.map((story: any, i: number) => {
                const role = isAr ? (story.roleAr || story.roleEn) : story.roleEn
                const quote = isAr ? (story.quoteAr || story.quoteEn) : story.quoteEn

                const linkedEmployee = story.employeeProfileId 
                  ? employeeProfiles.find(ep => ep.id === story.employeeProfileId)
                  : null;

                const linkedCaseStudy = story.caseStudyId
                  ? caseStudies.find(cs => cs.id === story.caseStudyId)
                  : null;

                const memberName = linkedEmployee 
                  ? `${linkedEmployee.firstName} ${linkedEmployee.lastName}`
                  : (story.teamMemberName || "E3 Execution Specialist");

                const caseTitle = linkedCaseStudy 
                  ? (isAr ? (linkedCaseStudy.titleAr || linkedCaseStudy.titleEn) : linkedCaseStudy.titleEn)
                  : null;

                return (
                  <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <Quote className="w-12 h-12 text-zinc-900 absolute top-6 end-6 -rotate-6" />
                    <div className="relative z-10 mb-8">
                      <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest mb-2">{role || linkedEmployee?.designation}</div>
                      {story.storyTitleEn && (
                        <h4 className="text-lg font-bold font-syne text-zinc-100 mb-3">
                          {isAr ? (story.storyTitleAr || story.storyTitleEn) : story.storyTitleEn}
                        </h4>
                      )}
                      <p className="text-base text-zinc-300 italic leading-relaxed">&quot;{quote}&quot;</p>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        {linkedEmployee?.profileImage && (
                          <img src={linkedEmployee.profileImage} alt={memberName} className="w-9 h-9 rounded-full object-cover border border-zinc-800" />
                        )}
                        <div>
                          <div className="text-sm font-bold text-zinc-200">{memberName}</div>
                          {linkedEmployee?.department && <div className="text-[10px] font-mono text-zinc-500 uppercase">{linkedEmployee.department}</div>}
                        </div>
                      </div>

                      {linkedCaseStudy && (
                        <Link 
                          href={`/${locale}/b2b/cases/${linkedCaseStudy.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider group/link"
                        >
                          <span>{caseTitle}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 rtl:group-hover/link:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 6. IMPACT OVERVIEW / STATISTICS */}
      {/* ============================================================ */}
      {impactOverviewConfig.enabled !== false && Array.isArray(impactOverviewConfig.stats) && impactOverviewConfig.stats.length > 0 && (
        <section className="py-24 bg-zinc-950 border-b border-zinc-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">{isAr ? "أثر يمكن قياسه" : "QUANTIFIED PROOF"}</span>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
                {isAr ? (impactOverviewConfig.titleAr || "أثر يمكنك قياسه بالنتائج") : (impactOverviewConfig.titleEn || "Impact You Can Measure")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {impactOverviewConfig.stats.map((st: any, i: number) => {
                const label = isAr ? (st.labelAr || st.labelEn) : st.labelEn
                return (
                  <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                    <div className="text-5xl md:text-6xl font-black font-syne text-emerald-400 mb-3">{st.prefix}{st.value}{st.suffix}</div>
                    <div className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider">{label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 7. FINAL COMMERCIAL CTA */}
      {/* ============================================================ */}
      {cta.enabled !== false && (
        <section className="py-24 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? (cta.eyebrowAr || "قد يكون مشروعك هو القادم") : (cta.eyebrowEn || "Your Project Could Be Next")}</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black font-syne text-zinc-100 tracking-tight mb-6 leading-tight">
              {isAr ? (cta.headlineAr || "لنصنع معاً التجربة الاستثنائية القادمة.") : (cta.headlineEn || "Let’s Create the Next Landmark Experience.")}
            </h2>

            <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
              {isAr ? (cta.descriptionAr || "تواصل مع فريق الهندسة والتصنيع والتشغيل في إي ثري لبناء وتفعيل تجربتك القادمة.") : (cta.descriptionEn || "Collaborate with E3's turnkey masterplanning, fabrication, and live operations teams in Qatar.")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href={cta.primaryLink || `/${locale}/b2b/contact`} 
                className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-syne font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] inline-flex items-center gap-2 group"
              >
                <span>{isAr ? (cta.primaryCtaAr || "ابدأ مشروعك") : (cta.primaryCtaEn || "Start a Project")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
