"use client"

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Calendar, MessageSquare } from 'lucide-react'
import { SafePublicTeamMember } from '@/lib/team/team-resolver'
import { resolveDepartmentAura } from '@/lib/team/department-aura'
import { cn } from '@/lib/utils'
import { TeamProfilePDFDownloadButton } from '@/components/dashboard/team/TeamProfilePDFDownloadButton'

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

  // Resolve Department Aura Theme
  const aura = resolveDepartmentAura(member.department, member.departmentKey)

  // Single oversized outlined initial lettermark
  const mainInitial = (member.nameEn?.[0] || member.name?.[0] || member.initials?.[0] || 'E').toUpperCase()

  // Restrained 4-8px Pointer Parallax (disabled under reduced-motion)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 28, stiffness: 140 }
  const smoothRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), springConfig)
  const smoothRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), springConfig)
  const auraParallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig)
  const auraParallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springConfig)

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
        "relative min-h-[85svh] flex flex-col justify-between overflow-hidden",
        "bg-[#0a0d14] text-[var(--text-primary)] border-b border-[var(--border-default)]",
        "pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-4 sm:px-8 md:px-12 lg:px-16"
      )}
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC BACKDROP, DEPARTMENT AURA & FILM GRAIN        */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        
        {/* Subtle Film Grain Noise Overlay */}
        <div
          data-testid="hero-film-grain"
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* 1. Department-Coloured Radial Aura Behind Portrait */}
        <motion.div
          data-testid="department-radial-aura"
          style={{
            ...(isReducedMotion
              ? {}
              : {
                  x: auraParallaxX,
                  y: auraParallaxY,
                }),
            background: aura.auraGradient,
          }}
          className={cn(
            "absolute top-1/4 end-4 lg:end-16 w-[480px] sm:w-[620px] lg:w-[750px] h-[480px] sm:h-[620px] rounded-full blur-3xl",
            "opacity-30 dark:opacity-40 pointer-events-none",
            !isReducedMotion && "animate-aura-breathe"
          )}
        />

        {/* 2. Soft Warm Illumination Behind Name and Identity */}
        <div
          data-testid="identity-warm-illumination"
          className="absolute top-1/3 start-6 sm:start-16 w-[400px] sm:w-[550px] h-[350px] sm:h-[450px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${aura.warmGlowColor} 0%, rgba(226,183,116,0.08) 50%, transparent 75%)`,
          }}
        />

        {/* 3. Thin Animated SVG Contour Lines Flowing Toward Portrait */}
        <div
          data-testid="hero-contour-lines"
          className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none flex items-center justify-end overflow-hidden"
        >
          <svg
            className="w-full h-full max-w-5xl opacity-40"
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 500 C 300 450, 600 550, 900 300"
              stroke={aura.contourStroke}
              strokeWidth="1.2"
              strokeDasharray="8 6"
              className={!isReducedMotion ? "animate-contour-flow" : ""}
            />
            <path
              d="M50 400 C 250 350, 550 450, 850 200"
              stroke={aura.contourStroke}
              strokeWidth="1.2"
              strokeDasharray="12 8"
              className={!isReducedMotion ? "animate-contour-flow-delayed" : ""}
            />
            <path
              d="M150 300 C 350 220, 650 320, 950 150"
              stroke={aura.contourStroke}
              strokeWidth="1"
              strokeDasharray="6 6"
              className={!isReducedMotion ? "animate-contour-flow" : ""}
            />
          </svg>
        </div>

        {/* 4. Single Oversized Outlined Initial Behind Portrait (4-6% opacity) */}
        <div
          data-testid="hero-outlined-initial"
          className={cn(
            "absolute top-8 sm:top-12 end-6 sm:end-16 pointer-events-none select-none font-black leading-none",
            "text-[22vw] text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.06)] opacity-90 tracking-tighter"
          )}
        >
          {mainInitial}
        </div>

        {/* 5. Very Faint Perspective Grid Only Near Lower Edge (4-6% opacity) */}
        <div
          data-testid="hero-lower-grid"
          className="absolute inset-x-0 bottom-0 h-56 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)',
          }}
        />

        {/* Smooth Bottom Gradient Fade into Biography Section */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[var(--surface-default)] pointer-events-none" />

        {/* Keyframe Styles for Aura & Contours */}
        <style>{`
          @keyframes auraBreathe {
            0% { transform: scale(0.95); opacity: 0.28; }
            50% { transform: scale(1.06); opacity: 0.42; }
            100% { transform: scale(0.95); opacity: 0.28; }
          }
          @keyframes contourFlow {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 100; }
          }
          .animate-aura-breathe {
            animation: auraBreathe 10s ease-in-out infinite alternate;
          }
          .animate-contour-flow {
            animation: contourFlow 25s linear infinite;
          }
          .animate-contour-flow-delayed {
            animation: contourFlow 32s linear infinite reverse;
          }
        `}</style>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP BREADCRUMB / DIRECTORY BACK NAVIGATION                */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mb-4 sm:mb-6">
        <Link
          href={`/${locale}/b2b/team`}
          data-testid="back-to-team-link"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--surface-hover)]/70 hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all group shadow-sm backdrop-blur-sm"
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
      {/* 3. HERO COMPOSITION (ELEVATED 160-200px, 55-60vh PORTRAIT)   */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center my-auto">
        
        {/* ---------------------------------------------------------- */}
        {/* Column A: Identity Content (Desktop Left, Mobile Order 2)   */}
        {/* ---------------------------------------------------------- */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-5 sm:space-y-6 order-2 lg:order-1 text-start">
          
          {/* Department Badge with Department Aura Color */}
          {member.department && (
            <motion.div
              initial={isReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              data-testid="member-department-badge"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md shadow-sm",
                aura.badgeBorder,
                aura.badgeBg,
                aura.badgeText
              )}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{member.department}</span>
            </motion.div>
          )}

          {/* Member Name (Sequential Line Reveal) */}
          <div className="space-y-1.5 w-full">
            <h1
              data-testid="member-name-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.06]"
            >
              {member.name.split(' ').map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={isReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: isReducedMotion ? 0 : idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
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
              transition={{ duration: 0.6, delay: isReducedMotion ? 0 : 0.2 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight pt-1"
              style={{ color: aura.primaryColor }}
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
              transition={{ duration: 0.6, delay: isReducedMotion ? 0 : 0.3 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[var(--surface-hover)]/80 border border-[var(--border-default)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] shadow-sm backdrop-blur-sm"
            >
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: aura.primaryColor }}
              />
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
              transition={{ duration: 0.7, delay: isReducedMotion ? 0 : 0.35 }}
              className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl italic"
            >
              &ldquo;{member.tagline}&rdquo;
            </motion.p>
          )}

          {/* Action CTAs */}
          <motion.div
            initial={isReducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: isReducedMotion ? 0 : 0.4 }}
            className="flex flex-wrap items-center gap-3 pt-2 w-full"
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
              className="px-6 sm:px-7 py-3 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center gap-2.5 cursor-pointer select-none"
            >
              <Calendar className="w-4 h-4" />
              <span>{isAr ? `تنسيق استشارة مع ${member.name}` : `Consult with ${member.name}`}</span>
            </a>

            {/* General Team Contact Button */}
            <Link
              href={`/${locale}/b2b/contact`}
              data-testid="hero-general-contact-cta"
              className="px-5 sm:px-6 py-3 rounded-2xl bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)]/80 border border-[var(--border-default)] text-[var(--text-primary)] font-bold text-sm sm:text-base transition-all flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span>{isAr ? 'تواصل مع فريقنا' : 'Contact E3 Team'}</span>
            </Link>

            {/* Branded A4 Staff Profile PDF Download */}
            <TeamProfilePDFDownloadButton
              members={member}
              variant="outline"
              size="lg"
              label={isAr ? 'تحميل الملف التعريفي (PDF)' : 'Download Profile (PDF)'}
              className="rounded-2xl shadow-sm backdrop-blur-sm px-5 sm:px-6 py-3 text-sm sm:text-base"
            />

            {/* Safe Validated LinkedIn Profile Link */}
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-linkedin-link"
                className="w-11 h-11 rounded-2xl bg-[var(--surface-hover)] hover:bg-[#0077b5] border border-[var(--border-default)] hover:border-transparent text-[var(--text-secondary)] hover:text-white flex items-center justify-center transition-all shadow-sm group"
                aria-label={isAr ? `ملف لينكد إن لـ ${member.name}` : `${member.name}'s LinkedIn Profile`}
              >
                <LinkedinIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              </a>
            )}
          </motion.div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Column B: Primary Focus Portrait Frame (55-60vh on Desktop)*/}
        {/* ---------------------------------------------------------- */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2 w-full">
          <motion.div
            ref={frameRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              ...(isReducedMotion
                ? {}
                : {
                    rotateX: smoothRotateX,
                    rotateY: smoothRotateY,
                    transformPerspective: 1000,
                  }),
              borderColor: `${aura.primaryColor}55`,
              boxShadow: `0 25px 60px -15px ${aura.primaryColor}25`,
            }}
            data-testid="portrait-4-5-frame"
            className={cn(
              "relative w-full max-w-[360px] sm:max-w-[420px] md:max-w-[440px] aspect-[4/5] h-[48vh] sm:h-[54vh] md:h-[58vh] max-h-[620px] rounded-3xl overflow-hidden",
              "border-2 shadow-2xl bg-zinc-950",
              "group transition-all duration-500"
            )}
          >
            {/* Animated Edge Light Tracing with Department Theme */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl opacity-60 z-20"
              style={{
                boxShadow: `inset 0 0 25px ${aura.primaryColor}35, 0 0 35px ${aura.secondaryColor}20`,
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
                className="w-full h-full bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden"
              >
                <div
                  className="w-32 h-32 rounded-full border-2 flex items-center justify-center text-5xl font-black shadow-inner"
                  style={{
                    borderColor: `${aura.primaryColor}60`,
                    backgroundColor: `${aura.primaryColor}15`,
                    color: aura.primaryColor,
                  }}
                >
                  {member.initials}
                </div>
                <p
                  className="mt-4 text-xs font-mono uppercase tracking-widest font-bold"
                  style={{ color: aura.secondaryColor }}
                >
                  E3 QATAR EXPERT
                </p>
              </div>
            )}

            {/* Bottom Gradient Scrim & Department Caption */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-end p-6 z-10 pointer-events-none">
              <div className="text-white space-y-0.5">
                <p
                  className="text-xs font-mono uppercase tracking-wider font-bold"
                  style={{ color: aura.primaryColor }}
                >
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
