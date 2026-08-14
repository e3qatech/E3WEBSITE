"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Sparkles, MapPin, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatLocalizedText } from '@/lib/utils'
import { localizeHref } from '@/lib/url-helper'

interface StoryTaxonomyPortalsProps {
  content: any
  locale: string
  onSelectCategory?: (category: string) => void
}

export function StoryTaxonomyPortals({ content, locale, onSelectCategory }: StoryTaxonomyPortalsProps) {
  const isAr = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()

  const selector = content?.intentSelector || {}
  
  const [dbStoryTypes, setDbStoryTypes] = useState<any[]>(content?.storyDiscovery?.storyTypes || content?.storyTypes || [])
  const [showAllActivities, setShowAllActivities] = useState(false)

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
  const options = dbStoryTypes.map(st => {
    const publishedFeatures = st.features?.filter((f: any) => f.attraction?.isPublished) || []
    const jsonActivations = st.activations || st.activities || []
    
    // Combine features from relation and JSON features
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

    // Fallback: If no specific activity match exists, fallback to unique attractions
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
      hasPublishedActivities: displayActivities.length > 0,
      activities: displayActivities
    }
  }).filter(opt => opt.hasPublishedActivities)

  // Initialize active taxonomy from URL parameter ?story=... or default
  const paramStory = searchParams?.get('story')
  const initialOption = options.find((o: any) => o.id === paramStory || o.category === paramStory) || options[0] || {}

  const [activeId, setActiveId] = useState(initialOption.id || '')
  
  useEffect(() => {
    if (options.length > 0 && !activeId && !paramStory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync initial story selection
      setActiveId(options[0].id)
    }
  }, [options, activeId, paramStory])

  useEffect(() => {
    if (paramStory && options.length > 0) {
      const match = options.find((o: any) => o.id === paramStory || o.category === paramStory)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync query param selection
      if (match) setActiveId(match.id)
    }
  }, [paramStory, options])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset activity pagination on track switch
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

  if (options.length === 0) {
    return (
      <section
        className="relative py-20 bg-[#090418] text-white border-b border-purple-950/40 overflow-hidden"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "استكشاف الحكايات والأنشطة" : "STORY DISCOVERY"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {formatLocalizedText(
              isAr
                ? selector.titleAr || "أي نوع من الحكايات تريد أن تعيشها اليوم؟"
                : selector.titleEn || "What Kind of Story Do You Want Today?",
              locale
            )}
          </h2>
          <div className="p-8 rounded-3xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-xl max-w-xl mx-auto space-y-4">
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
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
    <section className="relative py-24 bg-[#090418] text-white border-b border-purple-950/40 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "استكشاف الحكايات والأنشطة" : "STORY DISCOVERY"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {formatLocalizedText(isAr ? (selector.titleAr || "أي نوع من الحكايات تريد أن تعيشها اليوم؟") : (selector.titleEn || "What Kind of Story Do You Want Today?"), locale)}
          </h2>
        </div>

        {/* Story Category Doorways Grid */}
        <div className="flex flex-wrap justify-center items-center gap-4 mx-auto max-w-6xl">
          {options.map((option: any) => {
            const isSelected = option.id === activeId
            const labelText = formatLocalizedText(isAr ? option.labelAr : option.labelEn, locale)

            return (
              <button
                key={option.id}
                onMouseEnter={() => handleSelect(option)}
                onClick={() => handleSelect(option)}
                className={`relative aspect-[3/4] w-full max-w-[180px] sm:w-44 md:w-48 flex-1 min-w-[140px] max-w-[210px] rounded-3xl overflow-hidden border transition-all duration-500 group flex flex-col justify-between p-5 text-start cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/60 shadow-2xl shadow-purple-950/80 scale-105 z-10'
                    : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
                style={isSelected ? { borderColor: option.accentColor, boxShadow: `0 0 30px ${option.accentColor}30` } : {}}
              >
                {/* Media Mask Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={option.mediaUrl}
                    alt={labelText}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isSelected ? 'opacity-60 scale-110' : 'opacity-25 group-hover:opacity-40 group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={isSelected ? { backgroundColor: option.accentColor, color: '#000' } : { backgroundColor: '#1e293b', color: '#94a3b8' }}
                  >
                    {formatLocalizedText(option.category, locale)}
                  </span>
                  <ArrowUpRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-0.5 -translate-y-0.5' : 'text-slate-600'}`} style={isSelected ? { color: option.accentColor } : {}} />
                </div>

                {/* Oversized Typographic Label */}
                <div className="relative z-10 mt-auto">
                  <h3 className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-tight transition-colors ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
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
                className="p-6 rounded-3xl border border-purple-500/30 bg-purple-950/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl"
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
