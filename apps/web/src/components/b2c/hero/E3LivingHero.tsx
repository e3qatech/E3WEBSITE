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

export type HeadlineAnimationType =
  | 'typewriter'
  | 'fade'
  | 'zoom'
  | 'wipe'
  | 'slide-up'
  | 'blur-morph';

export type AnimatedWordStyle =
  | 'solid'
  | 'static-gradient'
  | 'moving-gradient';

export type HeroAlignment = 'left' | 'center' | 'right';

export interface E3LivingHeroProps {
  eyebrowEn?: string
  eyebrowAr?: string
  fixedHeadlineEn: string
  fixedHeadlineAr: string
  headlineTemplateEn?: string
  headlineTemplateAr?: string
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
  animationSpeed?: number // Interval between word changes in ms, default 2800
  animationDuration?: number // Duration of transition in ms, default 600
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

  // UX-02B-B: Headline Composer Extensions
  animationType?: HeadlineAnimationType
  wordStyle?: AnimatedWordStyle
  alignmentEn?: HeroAlignment
  alignmentAr?: HeroAlignment
  alignment?: HeroAlignment // Direct override
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

/**
 * Parses headline template into exactly two visual lines, isolating the animated token.
 */
export function parseTwoLineHeadline(rawText: string): {
  line1: { text: string; hasToken: boolean; prefix: string; suffix: string }
  line2: { text: string; hasToken: boolean; prefix: string; suffix: string }
  hasToken: boolean
} {
  let text = (rawText || "").trim()

  // If no {{animated}} token, inject it at the end of the text
  const hasTokenInitially = text.includes("{{animated}}")
  if (!hasTokenInitially) {
    text = text ? `${text} {{animated}}` : "{{animated}}"
  }

  // Split into 2 lines based on newline or sentence boundary
  let l1 = ""
  let l2 = ""

  if (text.includes("\n")) {
    const parts = text.split("\n")
    l1 = parts[0].trim()
    l2 = parts.slice(1).join(" ").trim()
  } else if (text.includes(". ") || text.includes(".\t")) {
    const periodIdx = text.indexOf(". ")
    l1 = text.substring(0, periodIdx + 1).trim()
    l2 = text.substring(periodIdx + 1).trim()
  } else if (text.includes("! ") || text.includes("? ") || text.includes("؛ ") || text.includes(". ")) {
    const match = text.match(/([.!?؛])\s+/)
    if (match && match.index !== undefined) {
      l1 = text.substring(0, match.index + match[1].length).trim()
      l2 = text.substring(match.index + match[0].length).trim()
    } else {
      const words = text.split(/\s+/)
      const mid = Math.ceil(words.length / 2)
      l1 = words.slice(0, mid).join(" ")
      l2 = words.slice(mid).join(" ")
    }
  } else {
    // If short single sentence, split around midpoint or keep line1 static and line2 token
    const words = text.split(/\s+/)
    if (words.length <= 3) {
      if (text.includes("{{animated}}")) {
        l1 = text.replace("{{animated}}", "").trim()
        l2 = "{{animated}}"
      } else {
        l1 = text
        l2 = "{{animated}}"
      }
    } else {
      const mid = Math.ceil(words.length / 2)
      l1 = words.slice(0, mid).join(" ")
      l2 = words.slice(mid).join(" ")
    }
  }

  const parseLine = (lineStr: string) => {
    const hasTok = lineStr.includes("{{animated}}")
    if (!hasTok) {
      return { text: lineStr, hasToken: false, prefix: lineStr, suffix: "" }
    }
    const [prefix = "", suffix = ""] = lineStr.split("{{animated}}")
    return { text: lineStr, hasToken: true, prefix, suffix }
  }

  return {
    line1: parseLine(l1),
    line2: parseLine(l2),
    hasToken: true
  }
}

export function E3LivingHero({
  eyebrowEn,
  eyebrowAr,
  fixedHeadlineEn,
  fixedHeadlineAr,
  headlineTemplateEn,
  headlineTemplateAr,
  rotatingWordsEn = [],
  rotatingWordsAr = [],
  descriptionEn,
  descriptionAr,
  primaryCta,
  secondaryCta,
  media,
  animationSpeed = 2800,
  animationDuration = 600,
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
  children,
  animationType = 'blur-morph',
  wordStyle = 'static-gradient',
  alignmentEn = 'center',
  alignmentAr = 'center',
  alignment
}: E3LivingHeroProps) {
  const isAr = locale === 'ar'
  const containerRef = useRef<HTMLElement>(null)
  const systemReducedMotion = useReducedMotion()
  const capabilityTier = useCapabilityTier()
  const isReducedMotion = Boolean(systemReducedMotion || capabilityTier === 'minimal')

  // Resolve locale-aware texts strictly
  const eyebrow = isAr ? (eyebrowAr || eyebrowEn) : (eyebrowEn || eyebrowAr)
  const description = isAr ? (descriptionAr || descriptionEn) : (descriptionEn || descriptionAr)

  // Resolve template text
  const rawHeadlineTemplate = isAr
    ? (headlineTemplateAr || fixedHeadlineAr || 'بعض الأيام تمضي. وأخرى تصبح {{animated}}')
    : (headlineTemplateEn || fixedHeadlineEn || 'SOME DAYS PASS. OTHERS BECOME {{animated}}')

  const parsedHeadline = useMemo(() => {
    return parseTwoLineHeadline(rawHeadlineTemplate)
  }, [rawHeadlineTemplate])

  // Resolve rotating words
  const activeRotatingWords = useMemo(() => {
    return isAr
      ? (Array.isArray(rotatingWordsAr) && rotatingWordsAr.length > 0 ? rotatingWordsAr : ['حكايات', 'مغامرات', 'لحظات', 'ذكريات'])
      : (Array.isArray(rotatingWordsEn) && rotatingWordsEn.length > 0 ? rotatingWordsEn : ['STORIES', 'ADVENTURES', 'MOMENTS', 'MEMORIES'])
  }, [isAr, rotatingWordsAr, rotatingWordsEn])

  const hasRotatingWords = enableRotatingWords && activeRotatingWords.length > 0
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [hasCompletedFirstCycle, setHasCompletedFirstCycle] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Typewriter effect state
  const [typewriterText, setTypewriterText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  // Longest replacement word for layout space reservation
  const longestWord = useMemo(() => {
    if (!activeRotatingWords || activeRotatingWords.length === 0) return ''
    return activeRotatingWords.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
      activeRotatingWords[0]
    )
  }, [activeRotatingWords])

  // Active word index rotation interval
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

  const currentWord = hasRotatingWords ? activeRotatingWords[currentWordIndex] || activeRotatingWords[0] : ""

  // Typewriter character reveal simulation
  useEffect(() => {
    if (animationType !== 'typewriter' || isReducedMotion) {
      setTypewriterText(currentWord)
      return
    }

    let charIndex = 0
    setIsTyping(true)
    setTypewriterText('')

    const stepSpeed = Math.max(30, Math.min(100, Math.floor(animationDuration / (currentWord.length || 1))))

    const typingInterval = setInterval(() => {
      if (charIndex < currentWord.length) {
        setTypewriterText(currentWord.substring(0, charIndex + 1))
        charIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, stepSpeed)

    return () => clearInterval(typingInterval)
  }, [currentWord, animationType, isReducedMotion, animationDuration])

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

  const mediaUrl = (media?.mediaUrl || "").trim()
  const posterUrl = (media?.posterUrl || media?.mobileMediaUrl || "").trim()
  const rawMediaType = (media?.mediaType || "IMAGE").toUpperCase() as UniversalMediaType
  const overlayOpacity = media?.overlayOpacity !== undefined ? media.overlayOpacity : 0.6
  const gradientScrim = media?.gradientScrim !== false

  // Physical alignment resolution
  const activeAlignment: HeroAlignment = alignment || (isAr ? alignmentAr : alignmentEn) || 'center'

  const alignmentStyles = useMemo(() => {
    switch (activeAlignment) {
      case 'left':
        return {
          container: 'items-start text-left me-auto ms-0',
          inner: 'w-full max-w-7xl me-auto ms-0 items-start text-left',
          h1: 'text-left me-auto ms-0',
          line: 'justify-start text-left',
          description: 'text-left me-auto ms-0',
          ctaGroup: 'justify-start',
        }
      case 'right':
        return {
          container: 'items-end text-right ms-auto me-0',
          inner: 'w-full max-w-7xl ms-auto me-0 items-end text-right',
          h1: 'text-right ms-auto me-0',
          line: 'justify-end text-right',
          description: 'text-right ms-auto me-0',
          ctaGroup: 'justify-end',
        }
      case 'center':
      default:
        return {
          container: 'items-center text-center mx-auto',
          inner: 'w-full max-w-6xl mx-auto items-center text-center',
          h1: 'text-center mx-auto',
          line: 'justify-center text-center',
          description: 'text-center mx-auto',
          ctaGroup: 'justify-center',
        }
    }
  }, [activeAlignment])

  // Word style styling classes
  const wordStyleProps = useMemo(() => {
    switch (wordStyle) {
      case 'solid':
        return {
          className: "inline-block font-black select-none text-[var(--living-hero-accent)] drop-shadow-sm",
          style: { color: resolvedAccent }
        }
      case 'moving-gradient':
        return {
          className: "inline-block font-black select-none bg-clip-text text-transparent drop-shadow-sm animate-gradient-x",
          style: {
            backgroundImage: dynamicSweep || "linear-gradient(135deg, #a855f7 0%, #10b981 35%, #06b6d4 70%, #a855f7 100%)",
            backgroundSize: '250% 250%',
            animation: 'e3-living-hero-gradient-flow 3.5s ease infinite alternate'
          }
        }
      case 'static-gradient':
      default:
        return {
          className: "inline-block font-black select-none bg-clip-text text-transparent drop-shadow-sm",
          style: { backgroundImage: dynamicSweep }
        }
    }
  }, [wordStyle, resolvedAccent, dynamicSweep])

  // Animation variants per selected type
  const animationVariants = useMemo(() => {
    if (isReducedMotion) {
      return {
        initial: { opacity: 1, filter: "none", y: 0, scale: 1 },
        animate: { opacity: 1, filter: "none", y: 0, scale: 1 },
        exit: { opacity: 1, filter: "none", y: 0, scale: 1 },
        transition: { duration: 0 }
      }
    }

    const dur = Math.max(0.2, (animationDuration || 600) / 1000)

    switch (animationType) {
      case 'typewriter':
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.15 } as any
        }
      case 'fade':
        return {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -14 },
          transition: { duration: dur, ease: [0.42, 0, 0.58, 1] } as any
        }
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.55 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.35 },
          transition: { duration: dur, ease: [0.16, 1, 0.3, 1] } as any
        }
      case 'wipe':
        return {
          initial: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
          animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
          exit: { opacity: 0, clipPath: "inset(0 0 0 100%)" },
          transition: { duration: dur, ease: [0.22, 1, 0.36, 1] } as any
        }
      case 'slide-up':
        return {
          initial: { opacity: 0, y: "115%" },
          animate: { opacity: 1, y: "0%" },
          exit: { opacity: 0, y: "-115%" },
          transition: { duration: dur, ease: [0.16, 1, 0.3, 1] } as any
        }
      case 'blur-morph':
      default:
        return {
          initial: { opacity: 0, y: "85%", filter: "blur(14px)", scale: 0.92 },
          animate: { opacity: 1, y: "0%", filter: "blur(0px)", scale: 1 },
          exit: { opacity: 0, y: "-85%", filter: "blur(14px)", scale: 1.08 },
          transition: { duration: dur, ease: [0.16, 1, 0.3, 1] } as any
        }
    }
  }, [animationType, isReducedMotion, animationDuration])

  // Helper renderer for inline animated word container with exact width reservation
  const renderInlineAnimatedWord = () => {
    return (
      <span
        className="inline-grid align-baseline relative px-1 mx-1 text-start"
        style={{
          gridTemplateAreas: '"stack"',
          display: 'inline-grid',
          verticalAlign: 'baseline',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Invisible sizing anchor for longest replacement word to eliminate layout shift */}
        <span
          className="invisible pointer-events-none select-none opacity-0 font-black"
          style={{ gridArea: 'stack' }}
          aria-hidden="true"
        >
          {longestWord || "MOMENTS"}
        </span>

        {/* Active Animated Word */}
        <span
          className="relative inline-flex items-baseline overflow-hidden"
          style={{ gridArea: 'stack' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${currentWord}-${animationType}-${wordStyle}`}
              initial={animationVariants.initial}
              animate={animationVariants.animate}
              exit={animationVariants.exit}
              transition={animationVariants.transition}
              className={wordStyleProps.className}
              style={wordStyleProps.style}
            >
              {animationType === 'typewriter' && !isReducedMotion ? (
                <>
                  <span>{typewriterText}</span>
                  <span
                    className={cn(
                      "inline-block w-[2px] h-[0.85em] align-middle ms-0.5",
                      isTyping ? "animate-pulse" : "opacity-0"
                    )}
                    style={{ backgroundColor: wordStyle === 'solid' ? resolvedAccent : 'currentColor' }}
                  />
                </>
              ) : (
                currentWord
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    )
  }

  // Stable complete headline for screen readers
  const accessibleFullHeadline = useMemo(() => {
    const raw = rawHeadlineTemplate.replace("{{animated}}", currentWord || activeRotatingWords[0] || "").replace(/\s+/g, " ").trim()
    return raw
  }, [rawHeadlineTemplate, currentWord, activeRotatingWords])

  return (
    <section
      ref={containerRef}
      data-testid="e3-living-hero"
      dir={isAr ? "rtl" : "ltr"}
      className={cn(
        "relative min-h-[88vh] md:min-h-[94vh] flex flex-col justify-end overflow-hidden",
        "bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)]",
        "pt-32 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8",
        alignmentStyles.container,
        theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : '',
        className
      )}
      style={{
        ['--living-hero-accent' as any]: resolvedAccent
      }}
    >
      <style>{`
        @keyframes e3-living-hero-gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

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
              alt={accessibleFullHeadline}
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
        className={cn(
          "relative z-10 w-full flex flex-col justify-end space-y-6 sm:space-y-8",
          alignmentStyles.inner
        )}
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

        {/* Main Semantic H1: Exactly 1 H1 with strict 2-Line visual presentation */}
        <div className={cn("w-full max-w-full", alignmentStyles.h1)}>
          {/* Accessible Full Headline for Screen Readers */}
          <h1 data-testid={titleTestId || "living-hero-h1"} className="sr-only">
            {accessibleFullHeadline}
          </h1>

          {/* Visual Presentation Element: strictly 2 visual lines with inline animated token */}
          <div
            aria-hidden="true"
            data-testid="hero-two-line-visual"
            className={cn(
              "text-[clamp(1.85rem,5.6vw,4.5rem)] font-black tracking-tight uppercase leading-[1.08] sm:leading-[1.04] text-[var(--text-primary)] w-full",
              alignmentStyles.h1
            )}
          >
            {/* Visual Line 1 */}
            {parsedHeadline.line1.text && (
              <div data-testid="hero-line-1" className={cn("flex overflow-hidden py-0.5 w-full", alignmentStyles.line)}>
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-baseline flex-nowrap whitespace-nowrap"
                >
                  {parsedHeadline.line1.hasToken ? (
                    <>
                      {parsedHeadline.line1.prefix && <span>{parsedHeadline.line1.prefix}</span>}
                      {renderInlineAnimatedWord()}
                      {parsedHeadline.line1.suffix && <span>{parsedHeadline.line1.suffix}</span>}
                    </>
                  ) : (
                    <span>{parsedHeadline.line1.text}</span>
                  )}
                </motion.div>
              </div>
            )}

            {/* Visual Line 2 */}
            {parsedHeadline.line2.text && (
              <div data-testid="hero-line-2" className={cn("flex overflow-hidden py-0.5 w-full", alignmentStyles.line)}>
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-baseline flex-nowrap whitespace-nowrap"
                >
                  {parsedHeadline.line2.hasToken ? (
                    <>
                      {parsedHeadline.line2.prefix && <span>{parsedHeadline.line2.prefix}</span>}
                      {renderInlineAnimatedWord()}
                      {parsedHeadline.line2.suffix && <span>{parsedHeadline.line2.suffix}</span>}
                    </>
                  ) : (
                    <span>{parsedHeadline.line2.text}</span>
                  )}
                </motion.div>
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
            className={cn(
              "text-sm sm:text-lg md:text-xl text-[var(--text-secondary)] font-normal max-w-2xl leading-relaxed",
              alignmentStyles.description
            )}
          >
            {description}
          </motion.p>
        )}

        {/* Primary and Secondary Action CTAs */}
        {(primaryCta || secondaryCta) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: hasCompletedFirstCycle ? 0 : 0.4,
              ease: "easeOut"
            }}
            className={cn(
              "flex flex-wrap items-center gap-3.5 sm:gap-4 pt-2 sm:pt-4 w-full",
              alignmentStyles.ctaGroup
            )}
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
