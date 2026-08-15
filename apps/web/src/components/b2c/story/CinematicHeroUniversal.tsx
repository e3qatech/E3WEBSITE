"use client"

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Calendar, Pause, Play, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { resolveMediaType } from '@/lib/media-resolver'
import { localizeHref } from '@/lib/url-helper'
import { useCapabilityTier } from '@/lib/motion/capability-context'

interface CinematicHeroUniversalProps {
  content: any
  locale: string
}

export function CinematicHeroUniversal({ content, locale = 'en' }: CinematicHeroUniversalProps) {
  const isAr = locale === 'ar'
  const capabilityTier = useCapabilityTier()
  const isReducedMotion = capabilityTier === 'minimal'

  const heroMedia = content?.heroMedia || {}
  const hero = content?.hero || {}
  const act1Hero = content?.act1Hero || {}
  const act1 = content?.act1 || {}

  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Parallax transforms (disabled in reduced-motion)
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", isReducedMotion ? "0%" : "20%"])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.00, isReducedMotion ? 1.00 : 1.04])
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", isReducedMotion ? "0%" : "-6%"])

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
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex flex-col justify-end items-center overflow-hidden bg-[var(--bg-level-1)] px-4 sm:px-6 lg:px-8 pt-36 pb-20 md:pb-28 text-[var(--text-primary)] border-b border-[var(--border-level-2)] select-none transition-colors duration-300"
    >
      {/* ============================================================ */}
      {/* LAYER 1: BACKGROUND UNIVERSAL MEDIA WITH 4% SCALE PUSH */}
      {/* ============================================================ */}
      {mediaUrl ? (
        <motion.div
          style={{ y: bgY, scale: bgScale }}
          className="absolute inset-0 z-0 overflow-hidden will-change-transform"
        >
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
              className="w-full h-full object-cover opacity-50 dark:opacity-75 transition-opacity duration-1000"
            />
          ) : isIframe ? (
            <iframe
              key={mediaUrl}
              src={mediaUrl}
              className="w-full h-full border-none opacity-50 dark:opacity-75 pointer-events-none"
              allow="autoplay; fullscreen"
            />
          ) : (
            <img
              key={mediaUrl}
              src={mediaUrl}
              alt="E3 Hero Media Cover"
              className="w-full h-full object-cover opacity-50 dark:opacity-75 transition-opacity duration-1000"
            />
          )}

          {/* Ambient Bottom-to-Top Gradient Scrim Overlay for 100% text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/80 to-transparent z-[1] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none z-[1]" />
        </motion.div>
      ) : null}

      {/* ============================================================ */}
      {/* FOREGROUND ILLUMINATED TYPOGRAPHY & HERO CONTENT */}
      {/* ============================================================ */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-5xl mx-auto text-center space-y-6 mt-auto mb-4 flex flex-col items-center justify-end"
      >
        {/* Subtle Brand Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-[var(--surface-default)] text-purple-600 dark:text-purple-300 dark:bg-purple-950/60 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-purple-950/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
          <span>{badgeText}</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={isReducedMotion ? { opacity: 0, y: 15 } : { opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={isReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--text-primary)] leading-none"
        >
          {headline}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto font-normal leading-relaxed"
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
            href={localizeHref((act1Hero.tab1Url || hero.tab1Url || '/b2c/attractions').replace('{locale}', locale), locale)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-900/30 hover:shadow-purple-700/50 transition-all scale-100 hover:scale-105 cursor-pointer"
          >
            <span>{isAr ? (act1Hero.tab1LabelAr || hero.tab1LabelAr || "استكشف الوجهات الترفيهية") : (act1Hero.tab1LabelEn || hero.tab1LabelEn || "EXPLORE ENTERTAINMENT WORLDS")}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </Link>

          <Link
            href={localizeHref((act1Hero.tab2Url || hero.tab2Url || '/b2c/calendar').replace('{locale}', locale), locale)}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-bold text-sm backdrop-blur-md transition-all shadow-md cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>{isAr ? (act1Hero.tab2LabelAr || hero.tab2LabelAr || "جدول الفعاليات والتذاكر") : (act1Hero.tab2LabelEn || hero.tab2LabelEn || "LIVE EVENTS & CALENDAR")}</span>
          </Link>

          {isVideo && (
            <button
              onClick={togglePlayback}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-primary)] backdrop-blur-md transition-all shadow-md cursor-pointer"
              title={isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause Video") : (isAr ? "تشغيل" : "Play Video")}
              aria-label="Toggle Hero Video Playback"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-purple-500" /> : <Play className="w-4 h-4 text-purple-500 ms-0.5" />}
            </button>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}
