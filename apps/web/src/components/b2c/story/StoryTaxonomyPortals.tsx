"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  
  const [dbStoryTypes, setDbStoryTypes] = useState<any[]>([])

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

  // Map database Story Types to frontend options, applying fallback logic and hiding empty types
  const options = dbStoryTypes.map(st => {
    const publishedFeatures = st.features?.filter((f: any) => f.attraction?.isPublished) || []
    
    // Get unique attractions for this story type
    const uniqueAttractionsMap = new Map()
    publishedFeatures.forEach((f: any) => {
      if (f.attraction && !uniqueAttractionsMap.has(f.attraction.slug)) {
        uniqueAttractionsMap.set(f.attraction.slug, f.attraction)
      }
    })
    const attractions = Array.from(uniqueAttractionsMap.values())

    return {
      id: st.slug,
      labelEn: st.titleEn,
      labelAr: st.titleAr,
      category: st.titleEn.toUpperCase(),
      mediaUrl: st.coverMediaUrl 
        || publishedFeatures[0]?.imageUrl 
        || attractions[0]?.heroThumbnailUrl 
        || attractions[0]?.heroMediaUrl 
        || 'https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=2071&auto=format&fit=crop', // Default E3 Fallback
      accentColor: st.accentColor || '#a855f7',
      hasPublishedActivities: publishedFeatures.length > 0,
      attractions: attractions
    }
  }).filter(opt => opt.hasPublishedActivities) // Hide empty Story Types

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

  const activeOption = options.find((o: any) => o.id === activeId) || options[0] || {}

  const handleSelect = (option: any) => {
    setActiveId(option.id)
    onSelectCategory?.(option.category || option.id)

    // Preserve selection in URL query parameter without full reload
    const newParams = new URLSearchParams(searchParams?.toString() || '')
    newParams.set('story', option.id)
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  if (options.length === 0) return null // Hide section if no story types exist

  return (
    <section className="relative py-24 bg-[#090418] text-white border-b border-purple-950/40 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Editorial Question */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "اختر حكايتك" : "STORY DISCOVERY"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {isAr ? (selector.titleAr || "أي حكاية تريد أن تعيشها اليوم؟") : (selector.titleEn || "What kind of story do you want today?")}
          </h2>
        </div>

        {/* Large Editorial Typographic Portals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {options.map((option: any) => {
            const isSelected = option.id === activeId
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`relative aspect-[3/4] rounded-3xl overflow-hidden border transition-all duration-500 group flex flex-col justify-between p-6 text-start cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/60 shadow-2xl shadow-purple-950/80 scale-105 z-10'
                    : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
                style={isSelected ? { borderColor: option.accentColor, boxShadow: `0 25px 50px -12px ${option.accentColor}40` } : {}}
              >
                {/* Media Mask inside Letterforms */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={option.mediaUrl}
                    alt={option.labelEn}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isSelected ? 'opacity-55 scale-110' : 'opacity-20 group-hover:opacity-40 group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                {/* Top Category Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected ? 'text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`} style={isSelected ? { backgroundColor: option.accentColor } : {}}>
                    {option.category || 'STORY'}
                  </span>
                  <ArrowUpRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-0.5 -translate-y-0.5' : 'text-slate-600'}`} style={isSelected ? { color: option.accentColor } : {}} />
                </div>

                {/* Oversized Typographic Label */}
                <div className="relative z-10 mt-auto">
                  <h3 className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-tight transition-colors ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {isAr ? option.labelAr : option.labelEn}
                  </h3>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Story Intent Banner and Attractions */}
        <AnimatePresence mode="wait">
          {activeOption.id && (
            <motion.div
              key={activeOption.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div
                className="p-6 rounded-3xl border border-purple-500/30 bg-purple-950/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4"
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
                      {isAr ? activeOption.labelAr : activeOption.labelEn} — {isAr ? "وجهات ترفيهية متاحة اليوم" : "Active Experiences Available Today"}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Grid of dynamically fetched attractions for this story type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeOption.attractions?.map((attr: any) => (
                  <a
                    key={attr.slug}
                    href={`/b2c/attractions/${attr.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 aspect-[2/1] flex flex-col justify-end p-4 transition-all hover:border-slate-600 hover:shadow-xl"
                  >
                    <div className="absolute inset-0 z-0">
                      <img src={attr.heroThumbnailUrl || attr.heroMediaUrl} alt={attr.nameEn} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-50 group-hover:opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090418] via-[#090418]/60 to-transparent" />
                    </div>
                    <div className="relative z-10">
                      <h5 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{isAr ? attr.nameAr : attr.nameEn}</h5>
                      <p className="text-xs text-slate-300 line-clamp-1">{isAr ? attr.taglineAr : attr.taglineEn}</p>
                    </div>
                    <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
