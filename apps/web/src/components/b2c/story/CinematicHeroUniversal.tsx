"use client"

import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Pause, Play, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { E3ArrowHeroDevice } from './E3ArrowHeroDevice'
import { resolveMediaType } from '@/lib/media-resolver'

interface CinematicHeroUniversalProps {
  content: any
  locale: string
}

export function CinematicHeroUniversal({ content, locale = 'en' }: CinematicHeroUniversalProps) {
  const isAr = locale === 'ar'

  const heroMedia = content?.heroMedia || {}
  const hero = content?.hero || {}
  const act1Hero = content?.act1Hero || {}
  const act1 = content?.act1 || {}

  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const mediaUrl = (
    heroMedia.mediaUrl ||
    hero.mediaUrl ||
    act1Hero.desktopVideoUrl ||
    act1Hero.mediaUrl ||
    act1.mediaUrl ||
    ""
  ).trim()

  const posterUrl = (
    heroMedia.posterUrl ||
    hero.posterUrl ||
    act1Hero.posterUrl ||
    act1.posterUrl ||
    ""
  ).trim()

  const rawMediaType = (heroMedia.mediaType || hero.mediaType || act1Hero.mediaType || '').toUpperCase()
  const resolvedType = resolveMediaType({ url: mediaUrl, explicitType: rawMediaType })

  const isVideo = resolvedType === 'VIDEO'
  const isIframe = resolvedType === 'IFRAME' || resolvedType === 'MODEL_3D'
  const _isImage = resolvedType === 'IMAGE'

  const headline = isAr
    ? (act1Hero.titleAr || act1.headlineAr || hero.headerAr || "أيام تمرّ… وأيام تتحول إلى حكايات.")
    : (act1Hero.titleEn || act1.headlineEn || hero.headerEn || "Some days pass. Others become stories.")

  const subtext = isAr
    ? (act1Hero.subtextAr || act1.subtextAr || hero.subHeaderAr || "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية واللحظات التي لا تُنسى مع E3.")
    : (act1Hero.subtextEn || act1.subtextEn || hero.subHeaderEn || "Enter a world of attractions, live experiences and unforgettable moments created by E3.")

  const badgeText = isAr
    ? (heroMedia.badgeAr || hero.badgeAr || act1Hero.badgeAr || "عالم إي ثري الترفيهي بقطر")
    : (heroMedia.badgeEn || hero.badgeEn || act1Hero.badgeEn || "E3 QATAR ENTERTAINMENT WORLDS")

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [isVideo, mediaUrl])

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
      {mediaUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {isVideo ? (
            <video
              key={mediaUrl}
              ref={videoRef}
              src={mediaUrl}
              poster={posterUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-65 sm:opacity-75 scale-105 transition-all duration-1000"
            />
          ) : isIframe ? (
            <iframe
              key={mediaUrl}
              src={mediaUrl}
              className="w-full h-full border-none opacity-65 sm:opacity-75 pointer-events-none scale-105"
              allow="autoplay; fullscreen"
            />
          ) : (
            <img
              key={mediaUrl}
              src={mediaUrl}
              alt="E3 Hero Media Cover"
              className="w-full h-full object-cover opacity-65 sm:opacity-75 scale-105 transition-all duration-1000"
            />
          )}

          {/* Ambient Dark Purple & Gradient Mask */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#090314]/75 via-[#090314]/40 to-[#070212]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.25),transparent_70%)] pointer-events-none" />
        </div>
      ) : null}

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
          <span>{badgeText}</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300 leading-none drop-shadow-2xl"
        >
          {headline}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-xl text-purple-200/80 max-w-3xl mx-auto font-normal leading-relaxed"
        >
          {subtext}
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <Link
            href={`/${locale}/b2c/attractions`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-900/40 hover:shadow-purple-700/60 transition-all scale-100 hover:scale-105 cursor-pointer"
          >
            <span>{isAr ? "استكشف الوجهات الترفيهية" : "EXPLORE ENTERTAINMENT WORLDS"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={`/${locale}/b2c/calendar`}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 font-bold text-sm backdrop-blur-md transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>{isAr ? "جدول الفعاليات والتذاكر" : "LIVE EVENTS & CALENDAR"}</span>
          </Link>

          {isVideo && (
            <button
              onClick={togglePlayback}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 backdrop-blur-md transition-all cursor-pointer"
              title={isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause Video") : (isAr ? "تشغيل" : "Play Video")}
              aria-label="Toggle Hero Video Playback"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-purple-300" /> : <Play className="w-4 h-4 text-purple-300 ms-0.5" />}
            </button>
          )}
        </motion.div>
      </div>
    </section>
  )
}
