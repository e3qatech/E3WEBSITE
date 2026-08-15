"use client"

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Award, Compass } from 'lucide-react'
import { SafePublicTeamMember } from '@/lib/team/team-resolver'
import { cn } from '@/lib/utils'

interface BiographyStorySectionProps {
  member: SafePublicTeamMember
  locale: string
}

export function BiographyStorySection({ member, locale }: BiographyStorySectionProps) {
  const isAr = locale === 'ar'
  const isReducedMotion = useReducedMotion()

  const { introSentence, remainingBody, hasContent } = useMemo(() => {
    const rawBio = (member.aboutSummary || member.careerJourney || "").trim()
    if (!rawBio) {
      return { introSentence: "", remainingBody: "", hasContent: false }
    }

    // Extract first sentence based on punctuation (. ! ?)
    const sentenceMatch = rawBio.match(/^([^.!?؛\n]+[.!?؛\n])\s*([\s\S]*)$/)
    if (sentenceMatch && sentenceMatch[1]) {
      return {
        introSentence: sentenceMatch[1].trim(),
        remainingBody: sentenceMatch[2] ? sentenceMatch[2].trim() : "",
        hasContent: true
      }
    }

    return {
      introSentence: rawBio,
      remainingBody: member.careerJourney && member.careerJourney !== rawBio ? member.careerJourney : "",
      hasContent: true
    }
  }, [member.aboutSummary, member.careerJourney])

  // Hide section completely if there is no biography data
  if (!hasContent) {
    return null
  }

  return (
    <section
      data-testid="biography-story-section"
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        "relative py-16 sm:py-24 px-4 sm:px-8 md:px-12 lg:px-16",
        "bg-[var(--surface-default)] text-[var(--text-primary)] border-b border-[var(--border-default)]"
      )}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header Eyebrow */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-primary)]">
            <Compass className="w-3.5 h-3.5" />
            <span>{isAr ? 'القصة والرؤية المهنية' : 'Biography & Leadership Story'}</span>
          </div>
        </div>

        {/* Editorial Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Main Narrative Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 text-start">
            
            {/* Prominent Editorial Opening Sentence */}
            <motion.blockquote
              data-testid="bio-intro-sentence"
              initial={isReducedMotion ? {} : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={cn(
                "text-2xl sm:text-3xl md:text-4xl font-black leading-snug tracking-tight text-[var(--text-primary)]",
                "border-s-4 border-[var(--color-primary)] ps-6 sm:ps-8 py-1",
                "bg-gradient-to-r from-[var(--color-primary)]/5 via-transparent to-transparent rounded-e-2xl"
              )}
            >
              {introSentence}
            </motion.blockquote>

            {/* Remaining Biography Prose & Career Journey */}
            {remainingBody && (
              <div
                data-testid="bio-remaining-body"
                className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed space-y-4 font-normal"
              >
                {remainingBody.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Career Journey if Separate */}
            {member.careerJourney && member.careerJourney !== introSentence && member.careerJourney !== remainingBody && (
              <div className="pt-6 border-t border-[var(--border-default)] space-y-3">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {isAr ? 'المسيرة والتطور المهني' : 'Career Progression & Milestones'}
                </h3>
                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                  {member.careerJourney}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Highlight & Animated Statistic (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Years of Experience Animated Highlight Card */}
            {member.yearsOfExperience > 0 && (
              <motion.div
                data-testid="bio-experience-stat-card"
                initial={isReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "p-8 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border-default)] shadow-xl",
                  "flex flex-col justify-center relative overflow-hidden group hover:border-[var(--color-primary)]/40 transition-colors"
                )}
              >
                {/* Accent Aura */}
                <div
                  className="absolute -top-12 -end-12 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
                />

                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    data-testid="bio-stat-number"
                    className="text-6xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 font-mono"
                  >
                    {member.yearsOfExperience}+
                  </span>
                  <span className="text-xl font-bold text-[var(--text-primary)]">
                    {isAr ? 'سنة' : 'Years'}
                  </span>
                </div>

                <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                  {isAr ? 'خبرة تنفيذية واستشارية' : 'Executive & Practical Experience'}
                </p>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isAr
                    ? `إشراف وتخطيط وتنفيذ للمشاريع الترفيهية والتنظيمية في قطر عبر قطاع ${member.department}.`
                    : `Specialized architectural, operational and creative leadership across ${member.department} projects.`}
                </p>
              </motion.div>
            )}

            {/* Department Focus Badge Card */}
            <div className="p-6 rounded-3xl bg-[var(--surface-hover)]/60 border border-[var(--border-default)] space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-primary)]">
                <Award className="w-4 h-4" />
                <span>{isAr ? 'مجال القيادة' : 'Leadership Domain'}</span>
              </div>
              <p className="text-base font-bold text-[var(--text-primary)]">
                {member.designation}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                {isAr
                  ? 'ملتزمون بتطبيق أعلى معايير الجودة والابتكار في تجارب وفعاليات E3 بقطر.'
                  : 'Delivering world-class experiential engineering, entertainment landmarks, and executive project governance.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
