"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react'
import { UniversalMediaRenderer, UniversalMediaType } from '@/components/shared/UniversalMediaRenderer'
import { localizeHref } from '@/lib/url-helper'
import { cn } from '@/lib/utils'
import { useCapabilityTier } from '@/lib/motion/capability-context'

export type E3LivingHeroPreset =
  | 'memory-engine'    // B2C Landing: deep violet/emerald/cyan ambiance
  | 'story-portal'      // Discover: cobalt royal blue / cyan glow
  | 'e3-universe'       // Attractions: cosmic purple / neon emerald glow
  | 'day-builder'       // Packages: royal blue / gold celebration warmth
  | 'living-timeline'   // Calendar: kinetic violet / rose pulse
  | 'team-constellation' // B2B Team: cinematic human constellation violet / cyan / emerald glow
  | 'team'              // B2B Team alias
  | 'record-accent';    // Detail pages: inherits record's accent color

export interface E3LivingHeroProps {
  eyebrowEn?: string
  eyebrowAr?: string
  fixedHeadlineEn: string
  fixedHeadlineAr: string
  rotatingWordsEn?: string[]
  rotatingWordsAr?: string[]
  descriptionEn?: string
  descriptionAr?: string
  primaryCta?: {
    labelEn?: string
    labelAr?: string
    url?: string
    onClick?: () => void
  }
  secondaryCta?: {
    labelEn?: string
    labelAr?: string
    url?: string
    onClick?: () => void
  }
  media?: {
    mediaType?: UniversalMediaType | string
    mediaUrl?: string
    mobileMediaUrl?: string
    posterUrl?: string
    focalPoint?: string
    overlayOpacity?: number
    gradientScrim?: boolean
  }
  animationSpeed?: number // Interval in ms, default 2800
  enableRotatingWords?: boolean
  preset?: E3LivingHeroPreset
  accentColor?: string
  parallaxIntensity?: number
  theme?: 'dark' | 'light' | 'auto'
  scrollIndicator?: boolean
  locale?: string
  className?: string
  eyebrowTestId?: string
  titleTestId?: string
  descriptionTestId?: string
  children?: React.ReactNode // Slot for extra in-hero widgets (e.g. date search / filters)
}

// Preset-specific visual palettes and aura glows
const PRESET_STYLES: Record<E3LivingHeroPreset, {
  auraGradient: string
  badgeClass: string
  gradientSweep: string
  defaultAccent: string
}> = {
  'memory-engine': {
    auraGradient: 'radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.22), rgba(16,185,129,0.12) 40%, rgba(6,182,212,0.06) 65%, transparent 80%)',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    gradientSweep: 'linear-gradient(135deg, #a855f7 0%, #10b981 50%, #38bdf8 100%)',
    defaultAccent: '#10b981'
  },
  'story-portal': {
    auraGradient: 'radial-gradient(ellipse at 50% 40%, rgba(29,78,216,0.25), rgba(56,189,248,0.15) 45%, rgba(99,102,241,0.08) 70%, transparent 85%)',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
    gradientSweep: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #818cf8 100%)',
    defaultAccent: '#38bdf8'
  },
  'e3-universe': {
    auraGradient: 'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.25), rgba(244,63,94,0.12) 45%, rgba(16,185,129,0.08) 70%, transparent 85%)',
    badgeClass: 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300',
    gradientSweep: 'linear-gradient(135deg, #c084fc 0%, #f43f5e 50%, #fbbf24 100%)',
    defaultAccent: '#7c3aed'
  },
  'day-builder': {
    auraGradient: 'radial-gradient(ellipse at 50% 40%, rgba(37,99,235,0.22), rgba(245,158,11,0.15) 45%, rgba(16,185,129,0.08) 70%, transparent 85%)',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
    gradientSweep: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #10b981 100%)',
    defaultAccent: '#f59e0b'
  },
  'living-timeline': {
    auraGradient: 'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.25), rgba(236,72,153,0.15) 45%, rgba(6,182,212,0.08) 70%, transparent 85%)',
    badgeClass: 'border-pink-500/30 bg-pink-500/10 text-pink-600 dark:text-pink-300',
    gradientSweep: 'linear-gradient(135deg, #f472b6 0%, #a855f7 50%, #38bdf8 100%)',
    defaultAccent: '#ec4899'
  },
  'team-constellation': {
    auraGradient: 'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.25), rgba(6,182,212,0.15) 45%, rgba(16,185,129,0.10) 70%, transparent 85%)',
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
    gradientSweep: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #10b981 100%)',
    defaultAccent: '#8b5cf6'
  },
  'team': {
    auraGradient: 'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.25), rgba(6,182,212,0.15) 45%, rgba(16,185,129,0.10) 70%, transparent 85%)',
    badgeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
    gradientSweep: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 50%, #10b981 100%)',
    defaultAccent: '#8b5cf6'
  },
  'record-accent': {
    auraGradient: 'radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.18), rgba(16,185,129,0.10) 45%, transparent 75%)',
    badgeClass: 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    gradientSweep: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%)',
    defaultAccent: '#10b981'
  }
}

export function E3LivingHero({
  eyebrowEn,
  eyebrowAr,
  fixedHeadlineEn,
  fixedHeadlineAr,
  rotatingWordsEn = [],
  rotatingWordsAr = [],
  descriptionEn,
  descriptionAr,
  primaryCta,
  secondaryCta,
  media,
  animationSpeed = 2800,
  enableRotatingWords = true,
  preset = 'memory-engine',
  accentColor,
  parallaxIntensity = 0.15,
  theme = 'auto',
  scrollIndicator = true,
  locale = 'en',
  className,
  eyebrowTestId,
  titleTestId,
  descriptionTestId,
  children
}: E3LivingHeroProps) {
  const isAr = locale === 'ar'
  const containerRef = useRef<HTMLElement>(null)
  const systemReducedMotion = useReducedMotion()
  const capabilityTier = useCapabilityTier()
  const isReducedMotion = systemReducedMotion || capabilityTier === 'minimal'

  // Resolve locale-aware texts strictly
  const eyebrow = isAr ? (eyebrowAr || eyebrowEn) : (eyebrowEn || eyebrowAr)
  const fixedHeadline = isAr ? fixedHeadlineAr : fixedHeadlineEn
  const description = isAr ? (descriptionAr || descriptionEn) : (descriptionEn || descriptionAr)

  const activeRotatingWords = isAr
    ? (Array.isArray(rotatingWordsAr) && rotatingWordsAr.length > 0 ? rotatingWordsAr : [])
    : (Array.isArray(rotatingWordsEn) && rotatingWordsEn.length > 0 ? rotatingWordsEn : [])

  const hasRotatingWords = enableRotatingWords && activeRotatingWords.length > 0
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [hasCompletedFirstCycle, setHasCompletedFirstCycle] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Rotating words timer
  useEffect(() => {
    if (!hasRotatingWords || isPaused || activeRotatingWords.length <= 1) return

    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        const next = (prev + 1) % activeRotatingWords.length
        if (next === 1) {
          setHasCompletedFirstCycle(true)
        }
        return next
      })
    }, Math.max(1200, animationSpeed))

    return () => clearInterval(interval)
  }, [hasRotatingWords, isPaused, activeRotatingWords.length, animationSpeed])

  // Parallax Scroll Animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const bgY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", isReducedMotion ? "0%" : `${Math.round(parallaxIntensity * 100)}%`]
  )
  const bgScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1.00, isReducedMotion ? 1.00 : 1.04]
  )
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", isReducedMotion ? "0%" : "-6%"]
  )
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2])

  // Preset configuration
  const presetConfig = PRESET_STYLES[preset] || PRESET_STYLES['memory-engine']
  const resolvedAccent = accentColor || presetConfig.defaultAccent

  // Dynamic Aura with custom accent support
  const dynamicAura = useMemo(() => {
    if (preset === 'record-accent' && accentColor) {
      return `radial-gradient(ellipse at 50% 40%, ${accentColor}33, ${accentColor}18 45%, transparent 75%)`
    }
    return presetConfig.auraGradient
  }, [preset, accentColor, presetConfig.auraGradient])

  const dynamicSweep = useMemo(() => {
    if (preset === 'record-accent' && accentColor) {
      return `linear-gradient(135deg, ${accentColor}, #38bdf8, #a855f7)`
    }
    return presetConfig.gradientSweep
  }, [preset, accentColor, presetConfig.gradientSweep])

  const currentWord = hasRotatingWords ? activeRotatingWords[currentWordIndex] || activeRotatingWords[0] : ""

  const mediaUrl = (media?.mediaUrl || "").trim()
  const posterUrl = (media?.posterUrl || media?.mobileMediaUrl || "").trim()
  const rawMediaType = (media?.mediaType || "IMAGE").toUpperCase() as UniversalMediaType
  const overlayOpacity = media?.overlayOpacity !== undefined ? media.overlayOpacity : 0.6
  const gradientScrim = media?.gradientScrim !== false

  return (
    <section
      ref={containerRef}
      data-testid="e3-living-hero"
      dir={isAr ? "rtl" : "ltr"}
      className={cn(
        "relative min-h-[88vh] md:min-h-[94vh] flex flex-col justify-end items-center overflow-hidden",
        "bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)]",
        "pt-32 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8",
        theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : '',
        className
      )}
      style={{
        // Define dynamic preset accents in component CSS variables
        ['--living-hero-accent' as any]: resolvedAccent
      }}
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC BACKDROP MEDIA & SCRIM LAYERS                 */}
      {/* ============================================================ */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      >
        {mediaUrl ? (
          <div className="w-full h-full relative">
            <UniversalMediaRenderer
              src={mediaUrl}
              type={rawMediaType}
              alt={fixedHeadline}
              className="w-full h-full object-cover"
              poster={posterUrl}
              autoPlay={true}
              loop={true}
              muted={true}
            />
            {/* Opacity dimming layer */}
            <div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: overlayOpacity }}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[var(--surface-default)] via-[var(--bg-level-1)] to-[var(--bg-level-1)]" />
        )}

        {/* Dynamic Dimensional Preset Aura Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: dynamicAura }}
        />

        {/* Ambient Radial Mesh Spheres */}
        <div className="absolute top-1/3 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-purple-500/10 pointer-events-none opacity-40 blur-2xl" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-emerald-500/15 pointer-events-none opacity-50 blur-xl" />

        {/* High-Contrast Bottom-to-Top Gradient Scrim for Legibility */}
        {gradientScrim && (
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/75 to-transparent pointer-events-none z-[1]" />
        )}
      </motion.div>

      {/* ============================================================ */}
      {/* 2. LIVING HERO TYPOGRAPHY & INTERACTIVE CONTENT              */}
      {/* ============================================================ */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-6xl mx-auto text-center w-full flex flex-col items-center justify-end space-y-6 sm:space-y-8"
      >
        {/* Eyebrow Pill */}
        {eyebrow && (
          <motion.div
            data-testid={eyebrowTestId || "e3-living-hero-eyebrow"}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg",
              presetConfig.badgeClass
            )}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{eyebrow}</span>
          </motion.div>
        )}

        {/* Main Semantic H1 with Masked Reveal & Rotating Words Engine */}
        <div className="max-w-5xl mx-auto">
          {/* Accessible Full Headline for Screen Readers */}
          <h1 data-testid={titleTestId || "living-hero-h1"} className="sr-only">
            {fixedHeadline}
          </h1>

          {/* Visual Presentation Element */}
          <div
            aria-hidden="true"
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-[1.08] sm:leading-[1.04] text-[var(--text-primary)]"
          >
            {/* Masked Upward Reveal for Fixed Headline */}
            <div className="overflow-hidden inline-block align-bottom py-1">
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block me-2 sm:me-3"
              >
                {fixedHeadline}
              </motion.span>
            </div>

            {/* Rotating Words Container (Zero Layout Shift via inline-flex container) */}
            {hasRotatingWords && (
              <div
                className="inline-flex items-baseline justify-center relative overflow-hidden align-bottom min-w-[160px] sm:min-w-[280px] md:min-w-[340px] h-[1.2em] px-1"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={currentWord}
                    initial={
                      isReducedMotion
                        ? { opacity: 0 }
                        : { y: "85%", opacity: 0, filter: "blur(10px)", scale: 0.92 }
                    }
                    animate={
                      isReducedMotion
                        ? { opacity: 1 }
                        : { y: "0%", opacity: 1, filter: "blur(0px)", scale: 1 }
                    }
                    exit={
                      isReducedMotion
                        ? { opacity: 0 }
                        : { y: "-85%", opacity: 0, filter: "blur(10px)", scale: 1.06 }
                    }
                    transition={{
                      duration: isReducedMotion ? 0.3 : 0.65,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="inline-block font-black text-transparent bg-clip-text drop-shadow-sm select-none"
                    style={{
                      backgroundImage: dynamicSweep
                    }}
                  >
                    {currentWord}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Subtitle / Description */}
        {description && (
          <motion.p
            data-testid={descriptionTestId || "e3-living-hero-description"}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="text-sm sm:text-lg md:text-xl text-[var(--text-secondary)] font-normal max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
        )}

        {/* Primary and Secondary Action CTAs (Enters after first word transition or 0.35s delay) */}
        {(primaryCta || secondaryCta) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: hasCompletedFirstCycle ? 0 : 0.4,
              ease: "easeOut"
            }}
            className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 pt-2 sm:pt-4"
          >
            {primaryCta && (
              primaryCta.url ? (
                <Link
                  href={localizeHref(primaryCta.url, locale)}
                  className="min-h-[48px] px-7 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl hover:shadow-emerald-500/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer select-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? (primaryCta.labelAr || primaryCta.labelEn) : (primaryCta.labelEn || primaryCta.labelAr)}</span>
                  <ArrowRight className={cn("w-4 h-4", isAr ? "rotate-180" : "")} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={primaryCta.onClick}
                  className="min-h-[48px] px-7 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl hover:shadow-emerald-500/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer select-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? (primaryCta.labelAr || primaryCta.labelEn) : (primaryCta.labelEn || primaryCta.labelAr)}</span>
                  <ArrowRight className={cn("w-4 h-4", isAr ? "rotate-180" : "")} />
                </button>
              )
            )}

            {secondaryCta && (
              secondaryCta.url ? (
                <Link
                  href={localizeHref(secondaryCta.url, locale)}
                  className="min-h-[48px] px-6 sm:px-7 py-3.5 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)]/80 hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-sm transition-all hover:border-[var(--color-primary)] flex items-center justify-center gap-2 cursor-pointer select-none backdrop-blur-md shadow-sm"
                >
                  <span>{isAr ? (secondaryCta.labelAr || secondaryCta.labelEn) : (secondaryCta.labelEn || secondaryCta.labelAr)}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={secondaryCta.onClick}
                  className="min-h-[48px] px-6 sm:px-7 py-3.5 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)]/80 hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-bold text-sm transition-all hover:border-[var(--color-primary)] flex items-center justify-center gap-2 cursor-pointer select-none backdrop-blur-md shadow-sm"
                >
                  <span>{isAr ? (secondaryCta.labelAr || secondaryCta.labelEn) : (secondaryCta.labelEn || secondaryCta.labelAr)}</span>
                </button>
              )
            )}
          </motion.div>
        )}

        {/* In-Hero Children Widget Slot (e.g. Filters / Quick Selectors) */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="w-full pt-4"
          >
            {children}
          </motion.div>
        )}
      </motion.div>

      {/* Optional Subtle Scroll Down Prompt Indicator */}
      {scrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-4 start-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-[var(--text-tertiary)] pointer-events-none"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">
            {isAr ? "مرّر للاستكشاف" : "SCROLL TO EXPLORE"}
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      )}
    </section>
  )
}
