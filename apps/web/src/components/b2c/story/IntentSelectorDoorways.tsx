"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowUpRight } from 'lucide-react'

interface IntentSelectorDoorwaysProps {
  content: any
  locale: string
  onSelectCategory?: (category: string) => void
}

export function IntentSelectorDoorways({ content, locale, onSelectCategory }: IntentSelectorDoorwaysProps) {
  const isAr = locale === 'ar'
  const selector = content?.intentSelector || {}
  const options = selector.options || []

  const [activeId, setActiveId] = useState(options[0]?.id || 'drive')
  const activeOption = options.find((o: any) => o.id === activeId) || options[0] || {}

  const handleSelect = (option: any) => {
    setActiveId(option.id)
    onSelectCategory?.(option.category || option.id)
  }

  return (
    <section className="relative py-24 bg-[#090418] text-white border-b border-purple-950/40 overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "اختر تجربتك" : "STORY SELECTION"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {isAr ? (selector.titleAr || "أي نوع من الحكايات تريد أن تعيشها اليوم؟") : (selector.titleEn || "What Kind of Story Do You Want Today?")}
          </h2>
        </div>

        {/* Large Typographic Doorways Grid */}
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
                {/* Media Mask Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={option.mediaUrl}
                    alt={option.labelEn}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isSelected ? 'opacity-50 scale-110' : 'opacity-20 group-hover:opacity-40 group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {option.category || 'E3'}
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

        {/* Selected Intent Active Banner */}
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
                  {isAr ? "الخيار المحنّك" : "SELECTED INTENT"}
                </span>
                <h4 className="text-xl font-extrabold text-white">
                  {isAr ? activeOption.labelAr : activeOption.labelEn} — {isAr ? "تجارب متوفرة اليوم" : "Available Today in Qatar"}
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
