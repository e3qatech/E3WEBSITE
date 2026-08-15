"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Sparkles, MapPin, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { formatLocalizedText } from '@/lib/utils'
import { localizeHref } from '@/lib/url-helper'
import { useCapabilityTier } from '@/lib/motion/capability-context'

interface StoryTaxonomyPortalsProps {
  content: any
  locale: string
  onSelectCategory?: (category: string) => void
}

export function StoryTaxonomyPortals({ content, locale, onSelectCategory }: StoryTaxonomyPortalsProps) {
  const isAr = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()
  const capabilityTier = useCapabilityTier()
  const isReducedMotion = capabilityTier === 'minimal'

  const selector = content?.intentSelector || {}
  
  const [dbStoryTypes, setDbStoryTypes] = useState<any[]>(content?.storyDiscovery?.storyTypes || content?.storyTypes || [])
  const [showAllActivities, setShowAllActivities] = useState(false)
  const mobileScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/b2c/story-types?active=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbStoryTypes(data)
        }
      })
      .catch(console.error)
  }, [])

  // Map database Story Types to frontend options, extracting actual activations / activities
  const options = dbStoryTypes
    .filter((st: any) => st && st.isActive !== false)
    .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map(st => {
      const publishedFeatures = (st.features || []).filter((f: any) => !f.attraction || f.attraction.isPublished !== false)
      const jsonActivations = st.activations || st.activities || []
      
      const allActivities = [
        ...jsonActivations,
        ...publishedFeatures.map((f: any) => ({
          id: f.id,
          titleEn: f.titleEn || f.nameEn,
          titleAr: f.titleAr || f.nameAr,
          descriptionEn: f.descriptionEn,
          descriptionAr: f.descriptionAr,
          highlightType: f.highlightType || "Activity",
          imageUrl: f.imageUrl || f.attraction?.heroThumbnailUrl || f.attraction?.heroMediaUrl,
          attractionSlug: f.attraction?.slug,
          attractionNameEn: f.attraction?.nameEn,
          attractionNameAr: f.attraction?.nameAr
        }))
      ]

      const uniqueAttractionsMap = new Map()
      publishedFeatures.forEach((f: any) => {
        if (f.attraction && !uniqueAttractionsMap.has(f.attraction.slug)) {
          uniqueAttractionsMap.set(f.attraction.slug, f.attraction)
        }
      })
      const attractions = Array.from(uniqueAttractionsMap.values())

      const displayActivities = allActivities.length > 0 ? allActivities : attractions.map((attr: any) => ({
        id: attr.slug,
        titleEn: attr.nameEn,
        titleAr: attr.nameAr,
        descriptionEn: attr.taglineEn,
        descriptionAr: attr.taglineAr,
        highlightType: "Venue",
        imageUrl: attr.heroThumbnailUrl || attr.heroMediaUrl,
        attractionSlug: attr.slug,
        attractionNameEn: attr.nameEn,
        attractionNameAr: attr.nameAr
      }))

      const titleEnStr = formatLocalizedText(st.titleEn || st.nameEn || st.slug || '', 'en')
      const titleArStr = formatLocalizedText(st.titleAr || st.nameAr || st.titleEn || st.slug || '', 'ar')

      return {
        id: st.slug || st.id || 'story-type',
        labelEn: titleEnStr || st.slug || st.id || 'Story Type',
        labelAr: titleArStr || titleEnStr || st.slug || st.id || 'نوع القصة',
        category: String(titleEnStr || st.slug || st.id || 'CATEGORY').toUpperCase(),
        mediaUrl: st.coverMediaUrl 
          || displayActivities[0]?.imageUrl 
          || 'https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=2071&auto=format&fit=crop',
        accentColor: st.accentColor || '#a855f7',
        orderIndex: st.orderIndex ?? 0,
        hasPublishedActivities: displayActivities.length > 0,
        activities: displayActivities
      }
    })

  // Initialize active taxonomy from URL parameter ?story=... or default
  const paramStory = searchParams?.get('story')
  const initialOption = options.find((o: any) => o.id === paramStory || o.category === paramStory) || options[0] || {}

  const [activeId, setActiveId] = useState(initialOption.id || '')
  
  useEffect(() => {
    if (options.length > 0 && !activeId && !paramStory) {
      setActiveId(options[0].id)
    }
  }, [options, activeId, paramStory])

  useEffect(() => {
    if (paramStory && options.length > 0) {
      const match = options.find((o: any) => o.id === paramStory || o.category === paramStory)
      if (match) setActiveId(match.id)
    }
  }, [paramStory, options])

  useEffect(() => {
    setShowAllActivities(false)
  }, [activeId])

  const activeOption = options.find((o: any) => o.id === activeId) || options[0] || {}

  const handleSelect = (option: any) => {
    if (activeId === option.id) return
    setActiveId(option.id)
    onSelectCategory?.(option.category || option.id)

    const newParams = new URLSearchParams(searchParams?.toString() || '')
    newParams.set('story', option.id)
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  const scrollMobile = (direction: 'left' | 'right') => {
    if (!mobileScrollRef.current) return
    const scrollAmount = direction === 'left' ? -220 : 220
    mobileScrollRef.current.scrollBy({ left: isAr ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  if (options.length === 0) {
    return (
      <section
        id="story-portals-section"
        className="relative py-20 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "استكشاف الحكايات والأنشطة — STORY DISCOVERY" : "STORY DISCOVERY — STORY TRACKS"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {formatLocalizedText(
              isAr
                ? selector.titleAr || "أي نوع من الحكايات تريد أن تعيشها اليوم؟"
                : selector.titleEn || "What Kind of Story Do You Want Today?",
              locale
            )}
          </h2>
          <div className="p-8 rounded-3xl border border-purple-500/20 bg-[var(--surface-default)] backdrop-blur-xl max-w-xl mx-auto space-y-4">
            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
              {isAr
                ? "لا توجد مسارات حكايات مفعلة حالياً. يمكنك استكشاف دليل التجارب والفعاليات بالكامل."
                : "No story tracks currently published. You can explore our complete directory of attractions and experiences."}
            </p>
            <a
              href={localizeHref("/b2c/attractions", locale)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all"
            >
              <span>{isAr ? "استكشف جميع التجارب" : "Explore All Attractions"}</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  const selectedTitle = formatLocalizedText(isAr ? activeOption.labelAr : activeOption.labelEn, locale)

  const INITIAL_LIMIT = 3
  const allActivities = activeOption.activities || []
  const totalCount = allActivities.length
  const visibleActivities = showAllActivities ? allActivities : allActivities.slice(0, INITIAL_LIMIT)
  const hasMore = totalCount > INITIAL_LIMIT

  return (
    <section className="relative py-24 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "استكشاف الحكايات والأنشطة — مسارات الحكايات — DIMENSIONAL DOORWAYS" : "STORY TRACKS & DIMENSIONAL DOORWAYS — STORY DISCOVERY"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {formatLocalizedText(isAr ? (selector.titleAr || "أي نوع من الحكايات تريد أن تعيشها اليوم؟") : (selector.titleEn || "What Kind of Story Do You Want Today?"), locale)}
          </h2>
        </div>

        {/* ============================================================ */}
        {/* MOBILE CONTROLS BAR (< md) */}
        {/* ============================================================ */}
        <div className="flex md:hidden items-center justify-between px-2">
          <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest">
            {isAr ? "اسحب لاختيار الحكاية" : "Swipe to choose story"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollMobile('left')}
              className="w-8 h-8 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center text-purple-300 active:scale-90 transition-transform"
              aria-label="Previous story doorway"
            >
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => scrollMobile('right')}
              className="w-8 h-8 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center text-purple-300 active:scale-90 transition-transform"
              aria-label="Next story doorway"
            >
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DIMENSIONAL DOORWAYS TRACK CONTAINER (DESKTOP & MOBILE SWIPE) */}
        {/* ============================================================ */}
        <div
          ref={mobileScrollRef}
          className="flex flex-nowrap md:flex-wrap md:justify-center items-center gap-4.5 mx-auto max-w-6xl overflow-x-auto md:overflow-visible pb-4 md:pb-0 scroll-smooth snap-x snap-mandatory scrollbar-none [perspective:1000px]"
        >
          {options.map((option: any) => {
            const isSelected = option.id === activeId
            const labelText = formatLocalizedText(isAr ? option.labelAr : option.labelEn, locale)

            return (
              <button
                key={option.id}
                onMouseEnter={() => handleSelect(option)}
                onFocus={() => handleSelect(option)}
                onClick={() => handleSelect(option)}
                className={`group relative aspect-[3/4] w-[170px] sm:w-44 md:w-48 flex-shrink-0 md:flex-1 min-w-[155px] max-w-[210px] rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between p-5 text-start cursor-pointer snap-center focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 ${
                  isSelected
                    ? 'border-purple-400 bg-purple-950/70 shadow-2xl shadow-purple-950/90 scale-105 z-10'
                    : 'border-slate-800/90 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/80'
                }`}
                style={{
                  transform: isSelected && !isReducedMotion ? 'translateZ(16px)' : 'translateZ(0px)',
                  borderColor: isSelected ? option.accentColor : undefined,
                  boxShadow: isSelected ? `0 0 35px ${option.accentColor}40` : undefined,
                }}
              >
                {/* Media Mask Background with Depth Reveal */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={option.mediaUrl}
                    alt={labelText}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isSelected ? 'opacity-65 scale-110' : 'opacity-25 group-hover:opacity-45 group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>

                {/* Top Doorway Category Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md transition-colors"
                    style={isSelected ? { backgroundColor: option.accentColor, color: '#000' } : { backgroundColor: '#1e293b', color: '#94a3b8' }}
                  >
                    {formatLocalizedText(option.category, locale)}
                  </span>
                  <ArrowUpRight
                    className={`w-4 h-4 transition-all duration-300 ${isSelected ? 'translate-x-0.5 -translate-y-0.5 scale-110' : 'text-slate-600 group-hover:text-slate-300'}`}
                    style={isSelected ? { color: option.accentColor } : {}}
                  />
                </div>

                {/* Oversized Typographic Doorway Name */}
                <div className="relative z-10 mt-auto">
                  <h3 className={`text-xl sm:text-2xl font-extrabold uppercase tracking-tight transition-colors ${
                    isSelected ? 'text-white drop-shadow-md' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {labelText}
                  </h3>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Story Intent Banner and Actual Activities Grid */}
        <AnimatePresence mode="wait">
          {activeOption.id && (
            <motion.div
              key={activeOption.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 max-w-6xl mx-auto"
            >
              <div
                className="p-6 rounded-3xl border border-purple-500/30 bg-purple-950/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl transition-all duration-500"
                style={{ borderColor: `${activeOption.accentColor}50`, backgroundColor: `${activeOption.accentColor}15` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/40 shrink-0" style={{ backgroundColor: `${activeOption.accentColor}30`, borderColor: `${activeOption.accentColor}60`, color: activeOption.accentColor }}>
                    ✦
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest block" style={{ color: activeOption.accentColor }}>
                      {isAr ? "الحكاية المختارة" : "SELECTED STORY TYPE"}
                    </span>
                    <h4 className="text-xl font-extrabold text-white">
                      {selectedTitle} — {isAr ? "الأنشطة والتجارب المتاحة اليوم" : "Active Experiences Available Today"}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/80 font-bold">
                    {isAr ? `${totalCount} تجارب متاحة` : `${totalCount} Experiences Available`}
                  </span>
                </div>
              </div>

              {/* Grid of actual activities / activations for this story type */}
              <div className="flex flex-wrap justify-center gap-6">
                {visibleActivities.map((act: any, idx: number) => {
                  const actTitle = formatLocalizedText(isAr ? (act.titleAr || act.titleEn) : (act.titleEn || act.titleAr), locale)
                  const actDesc = formatLocalizedText(isAr ? (act.descriptionAr || act.descriptionEn) : (act.descriptionEn || act.descriptionAr), locale)
                  const venueName = formatLocalizedText(isAr ? (act.attractionNameAr || act.attractionNameEn) : (act.attractionNameEn || act.attractionNameAr), locale)
                  const badgeText = formatLocalizedText(act.highlightType || "ACTIVITY", locale)

                  return (
                    <a
                      key={act.id || idx}
                      href={localizeHref(`/b2c/attractions/${act.attractionSlug}`, locale)}
                      className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between min-h-[220px] w-full max-w-sm flex-1 min-w-[280px] transition-all duration-500 hover:border-purple-500/50 hover:bg-slate-900/90 hover:shadow-2xl hover:-translate-y-1"
                    >
                      {/* Background Image overlay */}
                      {act.imageUrl && (
                        <div className="absolute inset-0 z-0 overflow-hidden">
                          <img
                            src={act.imageUrl}
                            alt={actTitle}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-30 group-hover:opacity-50"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090418] via-[#090418]/80 to-transparent" />
                        </div>
                      )}

                      {/* Header Badge */}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {badgeText}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-md opacity-70 group-hover:opacity-100 transition-all group-hover:scale-110">
                          <ArrowUpRight className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 space-y-2 mt-6">
                        <h5 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                          {actTitle}
                        </h5>
                        {actDesc && (
                          <p className="text-xs text-slate-300 font-light line-clamp-2 leading-relaxed">
                            {actDesc}
                          </p>
                        )}

                        {/* Venue Tag */}
                        {venueName && (
                          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{venueName}</span>
                            </span>
                            <span className="group-hover:text-white transition-colors">
                              {isAr ? "عرض التفاصيل ↗" : "Explore ↗"}
                            </span>
                          </div>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>

              {/* Show More / Show Less Button */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="px-6 py-3 rounded-2xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-bold text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
                    style={{ borderColor: activeOption.accentColor ? `${activeOption.accentColor}60` : undefined }}
                  >
                    <span>
                      {showAllActivities
                        ? (isAr ? "عرض أقل" : "Show Less")
                        : (isAr ? `عرض المزيد (${totalCount - INITIAL_LIMIT} تجارب أخرى)` : `Show More (${totalCount - INITIAL_LIMIT} More Experiences)`)}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllActivities ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
