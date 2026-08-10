"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, X } from 'lucide-react'

interface HorizontalGPUParallaxGalleryProps {
  content: any
  locale: string
}

export function HorizontalGPUParallaxGallery({ content, locale }: HorizontalGPUParallaxGalleryProps) {
  const isAr = locale === 'ar'
  const memoryData = content?.guestMemories || {}
  const moments = memoryData.moments || []

  const [activeLightboxMedia, setActiveLightboxMedia] = useState<any | null>(null)

  return (
    <section className="relative py-28 bg-[#090318] text-white border-b border-purple-950/40 overflow-hidden">
      {/* Ambient Radial Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-pink-500/30 bg-pink-950/40 text-pink-400 text-xs font-bold uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
            <span>{isAr ? "ذكريات لا تُنسى — EVERLASTING MEMORIES" : "EVERLASTING MEMORIES — GPU PARALLAX"}</span>
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

        {/* Horizontal Parallax Media Scroll Container */}
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
          {moments.map((moment: any, idx: number) => (
            <motion.div
              key={moment.id || idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              onClick={() => setActiveLightboxMedia(moment)}
              className="snap-center shrink-0 w-80 sm:w-96 aspect-[4/5] rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-950 shadow-2xl hover:border-purple-500/80 transition-all duration-500 cursor-pointer relative group"
            >
              <img
                src={moment.mediaUrl}
                alt={moment.titleEn}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

              {/* Caption Overlay */}
              <div className="absolute bottom-6 start-6 end-6 space-y-1">
                <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{isAr ? "لحظات زوار إي ثري" : "E3 GUEST MOMENT"}</span>
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {isAr ? moment.titleAr : moment.titleEn}
                </h3>
                <p className="text-xs text-slate-300 font-light line-clamp-2">
                  {isAr ? moment.captionAr : moment.captionEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Accessible Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxMedia(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-3xl border border-purple-500/40 bg-slate-900 overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActiveLightboxMedia(null)}
                className="absolute top-4 end-4 z-10 p-2.5 rounded-full bg-slate-950/80 text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={activeLightboxMedia.mediaUrl}
                alt={activeLightboxMedia.titleEn}
                className="w-full max-h-[60vh] object-cover"
              />

              <div className="p-6 space-y-2">
                <h3 className="text-2xl font-extrabold text-white">
                  {isAr ? activeLightboxMedia.titleAr : activeLightboxMedia.titleEn}
                </h3>
                <p className="text-sm text-slate-300">
                  {isAr ? activeLightboxMedia.captionAr : activeLightboxMedia.captionEn}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
