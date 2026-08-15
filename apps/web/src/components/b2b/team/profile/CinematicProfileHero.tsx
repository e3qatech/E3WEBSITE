"use client"

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Calendar, MessageSquare } from 'lucide-react'
import { SafePublicTeamMember } from '@/lib/team/team-resolver'
import { cn } from '@/lib/utils'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

interface CinematicProfileHeroProps {
  member: SafePublicTeamMember
  locale: string
  onConsultClick?: () => void
}

export function CinematicProfileHero({
  member,
  locale,
  onConsultClick
}: CinematicProfileHeroProps) {
  const isAr = locale === 'ar'
  const isReducedMotion = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)

  // Subtle Mouse Parallax on the 4:5 Portrait Frame (disabled in reduced-motion)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 150 }
  const smoothRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig)
  const smoothRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !frameRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section
      data-testid="cinematic-profile-hero"
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        "relative min-h-[90svh] flex flex-col justify-between overflow-hidden",
        "bg-[var(--surface-default)] text-[var(--text-primary)] border-b border-[var(--border-default)]",
        "pt-28 sm:pt-32 pb-14 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-16"
      )}
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC BACKDROP & LIGHT FIELDS                       */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Technical Grid */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* E3 Layered Cyan, Teal & Violet Ambient Light Aura Fields */}
        <div
          className="absolute -top-24 start-1/4 w-[500px] sm:w-[650px] h-[500px] rounded-full blur-3xl opacity-20 dark:opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(16,185,129,0.3) 45%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/3 end-10 w-[450px] sm:w-[600px] h-[450px] rounded-full blur-3xl opacity-15 dark:opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(59,130,246,0.25) 50%, transparent 70%)',
          }}
        />

        {/* Oversized Translucent Monogram Initials behind Portrait */}
        <div
          data-testid="hero-translucent-initials"
          className={cn(
            "absolute -top-8 end-2 sm:end-8 pointer-events-none select-none font-black leading-none",
            "text-[18vw] text-[var(--text-primary)] opacity-[0.035] dark:opacity-[0.06] tracking-tighter"
          )}
        >
          {member.initials || "E3"}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP BREADCRUMB / DIRECTORY BACK NAVIGATION                */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mb-8 sm:mb-12">
        <Link
          href={`/${locale}/b2b/team`}
          data-testid="back-to-team-link"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)]/80 border border-[var(--border-default)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all group shadow-sm"
        >
          {isAr ? (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          ) : (
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          )}
          <span>{isAr ? 'العودة إلى دليل فريق العمل' : 'Back to Team Directory'}</span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 3. EDITORIAL HERO GRID (IDENTITY + 4:5 PORTRAIT FRAME)       */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* ---------------------------------------------------------- */}
        {/* Column A: Identity Content (Desktop Left, Mobile Order 2)   */}
        {/* ---------------------------------------------------------- */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 order-2 lg:order-1 text-start">
          
          {/* Department Badge */}
          {member.department && (
            <motion.div
              initial={isReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              data-testid="member-department-badge"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>{member.department}</span>
            </motion.div>
          )}

          {/* Member Name (Sequential Line Reveal) */}
          <div className="space-y-1 w-full">
            <h1
              data-testid="member-name-heading"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[var(--text-primary)] leading-[1.08]"
            >
              {member.name.split(' ').map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={isReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: isReducedMotion ? 0 : idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block me-3"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Designation */}
            <motion.p
              data-testid="member-designation"
              initial={isReducedMotion ? {} : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isReducedMotion ? 0 : 0.25 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-primary)] tracking-tight pt-1"
            >
              {member.designation}
            </motion.p>
          </div>

          {/* Years of Experience Badge */}
          {member.yearsOfExperience > 0 && (
            <motion.div
              data-testid="member-experience-pill"
              initial={isReducedMotion ? {} : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isReducedMotion ? 0 : 0.35 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>
                {isAr
                  ? `${member.yearsOfExperience}+ سنوات من الخبرة المتخصصة في هندسة الفعاليات`
                  : `${member.yearsOfExperience}+ Years of Specialized Event & Technical Experience`}
              </span>
            </motion.div>
          )}

          {/* Quick Tagline */}
          {member.tagline && (
            <motion.p
              initial={isReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: isReducedMotion ? 0 : 0.4 }}
              className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl italic"
            >
              &ldquo;{member.tagline}&rdquo;
            </motion.p>
          )}

          {/* Action CTAs */}
          <motion.div
            initial={isReducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: isReducedMotion ? 0 : 0.45 }}
            className="flex flex-wrap items-center gap-3.5 pt-3 w-full"
          >
            {/* Consultation Action Button */}
            <a
              href="#consultation-booking"
              onClick={(e) => {
                if (onConsultClick) {
                  e.preventDefault()
                  onConsultClick()
                }
              }}
              data-testid="hero-consultation-cta"
              className="px-6 sm:px-7 py-3.5 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2.5 cursor-pointer select-none"
            >
              <Calendar className="w-4 h-4" />
              <span>{isAr ? `تنسيق استشارة مع ${member.name}` : `Consult with ${member.name}`}</span>
            </a>

            {/* General Team Contact Button */}
            <Link
              href={`/${locale}/b2b/contact`}
              data-testid="hero-general-contact-cta"
              className="px-5 sm:px-6 py-3.5 rounded-2xl bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)]/80 border border-[var(--border-default)] text-[var(--text-primary)] font-bold text-sm sm:text-base transition-all flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span>{isAr ? 'تواصل مع فريقنا' : 'Contact E3 Team'}</span>
            </Link>

            {/* Safe Validated LinkedIn Profile Link */}
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-linkedin-link"
                className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] hover:bg-[#0077b5] border border-[var(--border-default)] hover:border-transparent text-[var(--text-secondary)] hover:text-white flex items-center justify-center transition-all shadow-sm group"
                aria-label={isAr ? `ملف لينكد إن لـ ${member.name}` : `${member.name}'s LinkedIn Profile`}
              >
                <LinkedinIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
              </a>
            )}
          </motion.div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Column B: Large 4:5 Portrait Frame (Desktop Right, Mobile Order 1) */}
        {/* ---------------------------------------------------------- */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2 w-full">
          <motion.div
            ref={frameRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={
              isReducedMotion
                ? {}
                : {
                    rotateX: smoothRotateX,
                    rotateY: smoothRotateY,
                    transformPerspective: 1000,
                  }
            }
            data-testid="portrait-4-5-frame"
            className={cn(
              "relative w-full max-w-[360px] sm:max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden",
              "border-2 border-emerald-500/30 dark:border-emerald-400/40 shadow-2xl bg-[var(--surface-hover)]",
              "group transition-all duration-500"
            )}
          >
            {/* Animated Edge Light Tracing */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl opacity-60 z-20"
              style={{
                boxShadow: 'inset 0 0 25px rgba(6,182,212,0.25), 0 0 35px rgba(16,185,129,0.15)',
              }}
            />

            {/* Profile Image with Slow Scaling */}
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={member.name}
                className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                loading="eager"
              />
            ) : (
              /* High-End E3 Brand Monogram Title Card */
              <div
                data-testid="portrait-monogram-card"
                className="w-full h-full bg-gradient-to-br from-purple-950/80 via-zinc-900 to-emerald-950/80 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden"
              >
                <div className="w-32 h-32 rounded-full border-2 border-emerald-400/30 bg-emerald-500/10 flex items-center justify-center text-5xl font-black text-emerald-400 shadow-inner">
                  {member.initials}
                </div>
                <p className="mt-4 text-xs font-mono uppercase tracking-widest text-emerald-300/70">
                  E3 QATAR EXPERT
                </p>
              </div>
            )}

            {/* Bottom Gradient Scrim & Department Caption */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 z-10 pointer-events-none">
              <div className="text-white space-y-0.5">
                <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  {member.department}
                </p>
                <p className="text-base font-bold truncate">
                  {member.name}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
