"use client"

import React, { useRef, useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Briefcase, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectDeliveryReelProps {
  projects: any[]
  locale: string
}

export function ProjectDeliveryReel({ projects = [], locale }: ProjectDeliveryReelProps) {
  const isAr = locale === 'ar'
  const isReducedMotion = useReducedMotion()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Filter valid projects
  const validProjects = (Array.isArray(projects) ? projects : []).filter((p) => {
    if (!p) return false
    if (typeof p === 'string') return p.trim().length > 0
    return Boolean(p.name || p.projectName || p.title || p.role)
  })

  // Check scroll position
  const checkScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    
    setCanScrollPrev(Math.abs(scrollLeft) > 10)
    setCanScrollNext(Math.abs(scrollLeft) < maxScroll - 10)
    setScrollProgress(maxScroll > 0 ? Math.min(100, Math.max(0, (Math.abs(scrollLeft) / maxScroll) * 100)) : 0)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollContainerRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [validProjects.length])

  const scrollByAmount = (direction: 'next' | 'prev') => {
    const el = scrollContainerRef.current
    if (!el) return
    const cardWidth = el.querySelector('[data-testid="project-reel-card"]')?.clientWidth || 360
    const scrollDelta = (cardWidth + 24) * (direction === 'next' ? 1 : -1)
    const factor = isAr ? -1 : 1
    el.scrollBy({ left: scrollDelta * factor, behavior: 'smooth' })
  }

  // Hide section completely if there are no projects
  if (validProjects.length === 0) {
    return null
  }

  return (
    <section
      data-testid="project-delivery-reel"
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        "relative py-16 sm:py-24 px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden",
        "bg-[var(--surface-default)] text-[var(--text-primary)] border-b border-[var(--border-default)]"
      )}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header & Reel Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-primary)]">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isAr ? 'سجل الإنجازات والمشاريع' : 'Featured Project Delivery Reel'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              {isAr ? 'مشاريع بارزة وإنجازات تنفيذية' : 'Landmark Deliveries & Key Projects'}
            </h2>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
              {isAr
                ? 'استعراض لأبرز المشاريع والفعاليات والوجهات الترفيهية الكبرى التي ساهم في تخطيطها وتنفيذها.'
                : 'Curated showcase of major experiential destinations, festival productions, and enterprise projects delivered.'}
            </p>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Scroll Progress Bar */}
            <div className="hidden sm:block w-32 h-1.5 rounded-full bg-[var(--surface-hover)] overflow-hidden border border-[var(--border-default)]">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(15, scrollProgress)}%` }}
              />
            </div>

            {/* Prev Button */}
            <button
              type="button"
              onClick={() => scrollByAmount('prev')}
              disabled={!canScrollPrev}
              data-testid="project-reel-prev"
              className={cn(
                "w-11 h-11 rounded-2xl border flex items-center justify-center transition-all cursor-pointer",
                canScrollPrev
                  ? "bg-[var(--surface-hover)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--color-primary)] shadow-sm"
                  : "bg-[var(--surface-default)] border-[var(--border-default)]/40 text-[var(--text-tertiary)] opacity-40 cursor-not-allowed"
              )}
              aria-label={isAr ? "المشروع السابق" : "Previous Project"}
            >
              {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => scrollByAmount('next')}
              disabled={!canScrollNext}
              data-testid="project-reel-next"
              className={cn(
                "w-11 h-11 rounded-2xl border flex items-center justify-center transition-all cursor-pointer",
                canScrollNext
                  ? "bg-[var(--surface-hover)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--color-primary)] shadow-sm"
                  : "bg-[var(--surface-default)] border-[var(--border-default)]/40 text-[var(--text-tertiary)] opacity-40 cursor-not-allowed"
              )}
              aria-label={isAr ? "المشروع التالي" : "Next Project"}
            >
              {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Horizontal Project Reel (Non-Hijacking, Swipeable)          */}
        {/* ============================================================ */}
        <div
          ref={scrollContainerRef}
          data-testid="project-reel-container"
          className={cn(
            "flex gap-6 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:-mx-8 sm:px-8 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16",
            "scrollbar-none snap-x snap-mandatory scroll-smooth"
          )}
        >
          {validProjects.map((proj, idx) => {
            const title = typeof proj === 'string' ? proj : proj.name || proj.projectName || proj.title || ''
            const role = typeof proj === 'object' ? proj.role : ''
            const client = typeof proj === 'object' ? proj.client : ''
            const year = typeof proj === 'object' ? proj.year : ''
            const desc = typeof proj === 'object' ? proj.description : ''
            const mediaUrl = typeof proj === 'object' ? proj.image || proj.mediaUrl || proj.coverImage : null

            return (
              <motion.div
                key={proj.id || idx}
                data-testid="project-reel-card"
                initial={isReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: isReducedMotion ? 0 : Math.min(idx * 0.1, 0.4) }}
                className={cn(
                  "w-[300px] sm:w-[360px] md:w-[400px] shrink-0 snap-start flex flex-col justify-between",
                  "rounded-3xl bg-[var(--surface-hover)] border border-[var(--border-default)] overflow-hidden shadow-lg",
                  "hover:border-emerald-500/50 hover:shadow-2xl transition-all duration-500 group"
                )}
              >
                {/* Top Media Header / Gradient Brand Card */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                  {mediaUrl ? (
                    <img
                      src={mediaUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    /* Elegant E3 Radial Mesh Gradient Card */
                    <div className="w-full h-full bg-gradient-to-br from-purple-950 via-zinc-900 to-emerald-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.25),transparent_60%)]" />
                      <div className="w-12 h-12 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-xl mb-2 relative z-10">
                        E3
                      </div>
                      <p className="text-xs font-mono font-bold text-emerald-300/80 uppercase tracking-widest relative z-10">
                        KEY DELIVERY
                      </p>
                    </div>
                  )}

                  {/* Year & Badge Pills */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                    {year && (
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono font-bold shadow-md">
                        {year}
                      </span>
                    )}
                    <span className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-emerald-400 flex items-center justify-center shadow-md">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-start">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                      {title}
                    </h3>

                    {role && (
                      <p className="text-xs font-bold font-mono text-[var(--color-primary)] uppercase tracking-wider">
                        {role} {client ? `• ${client}` : ''}
                      </p>
                    )}

                    {desc && (
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                        {desc}
                      </p>
                    )}
                  </div>

                  {/* Bottom Role & Project Index Footnote */}
                  <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--text-tertiary)] font-mono">
                    <span>E3 Qatar Production</span>
                    <span>#{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
