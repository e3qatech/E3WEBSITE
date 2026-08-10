"use client"

import { motion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'

interface Act6GuestMemoryRibbonProps {
  content: any
  locale: string
}

export function Act6GuestMemoryRibbon({ content, locale }: Act6GuestMemoryRibbonProps) {
  const isAr = locale === 'ar'
  const memoryData = content?.guestMemories || {}
  const moments = memoryData.moments || []

  return (
    <section className="relative py-28 bg-[#090318] text-white border-b border-purple-950/40 overflow-hidden">
      {/* Ambient Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-pink-500/30 bg-pink-950/40 text-pink-400 text-xs font-bold uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
            <span>{isAr ? "الفصل السادس — الذكريات" : "ACT VI — EVERLASTING MEMORIES"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {isAr ? (memoryData.headlineAr || "اللحظة تتحول إلى ذكرى تدوم") : (memoryData.headlineEn || "The Moment Becomes a Memory")}
          </h2>
          <p className="text-sm text-slate-300 font-light">
            {isAr
              ? (memoryData.subtextAr || "ابتسامات حقيقية، مشاعر صادقة، وذكريات دائمة من زوار وجهات إي ثري.")
              : (memoryData.subtextEn || "Real smiles, real reactions, and everlasting memories captured at E3 Qatar destinations.")}
          </p>
        </div>

        {/* Floating Guest Memory Collage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {moments.map((moment: any, idx: number) => (
            <motion.div
              key={moment.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-purple-500/20 bg-slate-950 shadow-xl hover:border-purple-500/50 hover:shadow-purple-950/50 transition-all duration-500"
            >
              <img
                src={moment.mediaUrl}
                alt={moment.titleEn}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Memory Caption Overlay */}
              <div className="absolute bottom-6 start-6 end-6 space-y-1">
                <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{isAr ? "لحظات زوار إي ثري" : "E3 GUEST MOMENT"}</span>
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {isAr ? moment.titleAr : moment.titleEn}
                </h3>
                <p className="text-xs text-slate-300 font-light line-clamp-1">
                  {isAr ? moment.captionAr : moment.captionEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
