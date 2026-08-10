"use client"

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Calendar, Compass, Ticket, Play, Pause } from 'lucide-react'
import { E3ArrowHeroDevice } from './E3ArrowHeroDevice'

interface CinematicHeroUniversalProps {
  content: any
  locale: string
}

export function CinematicHeroUniversal({ content, locale }: CinematicHeroUniversalProps) {
  const isAr = locale === 'ar'
  const hero = content?.hero || {}
  const act1 = content?.act1 || {}

  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const mediaType = hero.mediaType || 'VIDEO'
  const mediaUrl = hero.mediaUrl || "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4"
  const posterUrl = hero.posterUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop"

  const headline = isAr
    ? (act1.headlineAr || hero.headerAr || "أيام تمرّ… وأيام تتحول إلى حكايات.")
    : (act1.headlineEn || hero.headerEn || "Some days pass. Others become stories.")

  const subtext = isAr
    ? (act1.subtextAr || hero.subHeaderAr || "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية واللحظات التي لا تُنسى مع E3.")
    : (act1.subtextEn || hero.subHeaderEn || "Enter a world of attractions, live experiences and unforgettable moments created by E3.")

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-[#090314] via-[#0f0728] to-[#070212] px-4 sm:px-6 lg:px-8 py-24 text-white border-b border-purple-950/40">
      {/* Background Universal Media Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {mediaType === 'VIDEO' ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            poster={posterUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 scale-105 transition-all duration-1000"
          />
        ) : mediaType === 'IFRAME' ? (
          <iframe
            src={mediaUrl}
            className="w-full h-full border-none opacity-40 pointer-events-none scale-105"
            allow="autoplay; fullscreen"
          />
        ) : (
          <img
            src={mediaUrl}
            alt="E3 Hero Media"
            className="w-full h-full object-cover opacity-40 scale-105 transition-all duration-1000"
          />
        )}

        {/* Ambient Dark Purple & Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090314]/90 via-[#090314]/50 to-[#070212]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.2),transparent_70%)] pointer-events-none" />
      </div>

      {/* Central Morphing E3 Arrow Device */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none scale-125 z-0">
        <E3ArrowHeroDevice variant="LIGHT_BEAM" accentColor="#a855f7" className="w-full max-w-5xl h-auto" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 my-auto">
        {/* Subtle Brand Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/60 text-purple-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-xl shadow-purple-950/80"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>{isAr ? "عالم إي ثري الترفيهي بقطر" : "E3 QATAR ENTERTAINMENT WORLDS"}</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight font-sans"
        >
          {headline}
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-2xl mx-auto text-base sm:text-xl text-slate-200 font-light leading-relaxed"
        >
          {subtext}
        </motion.p>

        {/* CMS Hero Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <Link
            href="#bring-it-to-life"
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-extrabold text-base shadow-xl shadow-purple-950/80 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{isAr ? (act1.primaryCtaAr || "ابدأ حكايتك") : (act1.primaryCtaEn || "Begin Your Story")}</span>
            <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
          </Link>

          <Link
            href="#living-day"
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 hover:text-white font-bold text-base backdrop-blur-md transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? (act1.secondaryCtaAr || "اكتشف فعاليات اليوم") : (act1.secondaryCtaEn || "What's On Today")}</span>
          </Link>

          <Link
            href="#qatar-map"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-sm backdrop-blur-md transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>{isAr ? "عناوين الوجهات" : "Find an Experience"}</span>
          </Link>

          <Link
            href="/b2c/tickets"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-md cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>{isAr ? "احجز الآن" : "Book Now"}</span>
          </Link>
        </motion.div>
      </div>

      {/* Video Media Play/Pause Controller */}
      {mediaType === 'VIDEO' && (
        <button
          onClick={togglePlayback}
          className="absolute bottom-6 end-6 z-20 p-3 rounded-full border border-slate-700 bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900 backdrop-blur-md transition-all cursor-pointer"
          aria-label="Toggle Video Playback"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      )}
    </section>
  )
}
