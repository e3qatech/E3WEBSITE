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
// eslint-disable-next-line react-hooks/exhaustive-deps
  const options = selector.options || []

  // Initialize active taxonomy from URL parameter ?story=... or default
  const paramStory = searchParams?.get('story')
  const initialOption = options.find((o: any) => o.id === paramStory || o.category === paramStory) || options[0] || {}

  const [activeId, setActiveId] = useState(initialOption.id || 'drive')
  const activeOption = options.find((o: any) => o.id === activeId) || options[0] || {}

  useEffect(() => {
    if (paramStory) {
      const match = options.find((o: any) => o.id === paramStory || o.category === paramStory)
// eslint-disable-next-line react-hooks/set-state-in-effect
      if (match) setActiveId(match.id)
    }
  }, [paramStory, options])

  const handleSelect = (option: any) => {
    setActiveId(option.id)
    onSelectCategory?.(option.category || option.id)

    // Preserve selection in URL query parameter without full reload
    const newParams = new URLSearchParams(searchParams?.toString() || '')
    newParams.set('story', option.id)
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

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
                    isSelected ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {option.category || 'STORY'}
                  </span>
                  <ArrowUpRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-purple-400 translate-x-0.5 -translate-y-0.5' : 'text-slate-600'}`} />
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

        {/* Selected Story Intent Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeOption.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-3xl border border-purple-500/30 bg-purple-950/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/40">
                ✦
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  {isAr ? "الحكاية المختارة" : "SELECTED STORY TYPE"}
                </span>
                <h4 className="text-xl font-extrabold text-white">
                  {isAr ? activeOption.labelAr : activeOption.labelEn} — {isAr ? "وجهات ترفيهية متاحة اليوم" : "Active Experiences Available Today"}
                </h4>
              </div>
            </div>

            <a
              href="#attraction-worlds"
              className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shrink-0 cursor-pointer"
            >
              {isAr ? "عرض التجارب المفلترة" : "View Filtered Experiences"}
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
