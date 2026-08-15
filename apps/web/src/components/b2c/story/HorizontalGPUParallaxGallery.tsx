"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, X } from 'lucide-react'

import { resolveMediaType } from '@/lib/media-resolver'

interface HorizontalGPUParallaxGalleryProps {
  content: any
  locale: string
}

export function HorizontalGPUParallaxGallery({ content, locale }: HorizontalGPUParallaxGalleryProps) {
  const isAr = locale === 'ar'
  const memoryData = content?.guestMemories || {}
  const moments = memoryData.moments || []

  const [activeLightboxMedia, setActiveLightboxMedia] = useState<any | null>(null)

  const getCleanMediaUrl = (url?: string) => {
    if (!url) return ''
    return url.split('#')[0].trim()
  }

  const isVideoMedia = (url?: string, type?: string) => {
    if (!url) return false
    if (type === 'VIDEO') return true
    return resolveMediaType({ url: getCleanMediaUrl(url), explicitType: type }) === 'VIDEO'
  }

  return (
    <section className="relative py-28 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden transition-colors duration-300">
      {/* Ambient Radial Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-pink-500/30 bg-[var(--surface-default)] text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
            <span>{isAr ? (memoryData.badgeAr || "ذكريات لا تُنسى — EVERLASTING MEMORIES") : (memoryData.badgeEn || "EVERLASTING MEMORIES — GPU PARALLAX")}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {isAr ? (memoryData.headlineAr || "اللحظة تتحول إلى ذكرى تدوم") : (memoryData.headlineEn || "The Moment Becomes a Memory")}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-light">
            {isAr
              ? (memoryData.subtextAr || "ابتسامات حقيقية، مشاعر صادقة، وذكريات دائمة من زوار وجهات إي ثري.")
              : (memoryData.subtextEn || "Real smiles, real reactions, and everlasting memories captured at E3 Qatar destinations.")}
          </p>
        </div>

        {/* Horizontal Parallax Media Scroll Container */}
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
          {moments.map((moment: any, idx: number) => {
            const isVid = isVideoMedia(moment.mediaUrl, moment.mediaType)
            const cardTag = isAr ? (moment.tagAr || "لحظات زوار إي ثري") : (moment.tagEn || "E3 GUEST MOMENT")

            return (
              <motion.div
                key={moment.id || idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onClick={() => setActiveLightboxMedia(moment)}
                className="snap-center shrink-0 w-80 sm:w-96 aspect-[4/5] rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] shadow-2xl hover:border-pink-500/80 transition-all duration-500 cursor-pointer relative group"
              >
                {isVid ? (
                  <video
                    src={getCleanMediaUrl(moment.mediaUrl)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={getCleanMediaUrl(moment.mediaUrl) || 'https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1200&auto=format&fit=crop'}
                    alt={moment.titleEn || "Memory Moment"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/95 via-transparent to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Caption Overlay */}
                <div className="absolute bottom-6 start-6 end-6 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-pink-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{cardTag}</span>
                  </span>
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    {isAr ? (moment.titleAr || moment.titleEn) : (moment.titleEn || moment.titleAr)}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-light line-clamp-2">
                    {isAr ? (moment.captionAr || moment.captionEn) : (moment.captionEn || moment.captionAr)}
                  </p>
                </div>
              </motion.div>
            )
          })}
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActiveLightboxMedia(null)}
                className="absolute top-4 end-4 z-10 p-2.5 rounded-full bg-[var(--surface-default)]/80 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-2)] shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              {isVideoMedia(activeLightboxMedia.mediaUrl, activeLightboxMedia.mediaType) ? (
                <video
                  src={getCleanMediaUrl(activeLightboxMedia.mediaUrl)}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] object-cover bg-black"
                />
              ) : (
                <img
                  src={getCleanMediaUrl(activeLightboxMedia.mediaUrl)}
                  alt={activeLightboxMedia.titleEn}
                  className="w-full max-h-[60vh] object-cover"
                />
              )}

              <div className="p-6 space-y-2">
                <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                  {isAr ? activeLightboxMedia.titleAr : activeLightboxMedia.titleEn}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
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
