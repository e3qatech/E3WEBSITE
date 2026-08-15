"use client"

import { motion, useReducedMotion } from 'framer-motion'
import { Layers, ShieldCheck, Zap } from 'lucide-react'
import { SafePublicTeamMember } from '@/lib/team/team-resolver'
import { cn } from '@/lib/utils'

interface InteractiveCapabilityMatrixProps {
  member: SafePublicTeamMember
  locale: string
}

export function InteractiveCapabilityMatrix({ member, locale }: InteractiveCapabilityMatrixProps) {
  const isAr = locale === 'ar'
  const isReducedMotion = useReducedMotion()

  const expertiseList = Array.isArray(member.expertiseTags) ? member.expertiseTags.filter(Boolean) : []
  const competencyList = Array.isArray(member.coreCompetencies)
    ? member.coreCompetencies.filter(Boolean)
    : (member.keyStrengths ? [member.keyStrengths] : [])

  const hasExpertise = expertiseList.length > 0
  const hasCompetencies = competencyList.length > 0

  // Hide the entire section if no capabilities exist
  if (!hasExpertise && !hasCompetencies) {
    return null
  }

  return (
    <section
      data-testid="interactive-capability-matrix"
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        "relative py-16 sm:py-24 px-4 sm:px-8 md:px-12 lg:px-16",
        "bg-[var(--surface-default)] text-[var(--text-primary)] border-b border-[var(--border-default)]"
      )}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="space-y-3 text-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-primary)]">
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? 'مصفوفة الكفاءات والقدرات' : 'Capability & Competency Matrix'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {isAr ? 'الخبرات التخصصية والقدرات القيادية' : 'Specialized Expertise & Technical Capabilities'}
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
            {isAr
              ? 'نظرة تفصيلية على المهارات والمعارف والقدرات المهنية التي يقدمها في إدارة وتنفيذ مشاريع E3.'
              : 'Structured breakdown of specialized technical disciplines, leadership domain knowledge, and execution skills.'}
          </p>
        </div>

        {/* Two Structured Capability Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Panel 1: Areas of Expertise */}
          {hasExpertise && (
            <div
              data-testid="expertise-capability-panel"
              className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border-default)] flex flex-col justify-between space-y-6 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {isAr ? 'مجالات الخبرة والتخصص' : 'Areas of Expertise'}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {isAr ? `${expertiseList.length} مجالات معتمدة` : `${expertiseList.length} Core Domains`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Staggered Interactive Capability Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {expertiseList.map((tag, idx) => (
                  <motion.div
                    key={idx}
                    initial={isReducedMotion ? {} : { opacity: 0, x: isAr ? 15 : -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: isReducedMotion ? 0 : Math.min(idx * 0.06, 0.5) }}
                    whileHover={isReducedMotion ? {} : { y: -3, rotate: idx % 2 === 0 ? 1.5 : -1.5 }}
                    className={cn(
                      "p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)]",
                      "hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-md transition-all",
                      "flex items-center justify-between gap-3 group cursor-default"
                    )}
                  >
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                      {tag}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] opacity-60 group-hover:opacity-100">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Panel 2: Core Competencies & Strengths */}
          {hasCompetencies && (
            <div
              data-testid="competencies-capability-panel"
              className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border-default)] flex flex-col justify-between space-y-6 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {isAr ? 'الكفاءات والقدرات التنفيذية' : 'Core Competencies & Strengths'}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {isAr ? `${competencyList.length} كفاءات استراتيجية` : `${competencyList.length} Strategic Competencies`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Staggered Interactive Competency Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {competencyList.map((comp, idx) => (
                  <motion.div
                    key={idx}
                    initial={isReducedMotion ? {} : { opacity: 0, x: isAr ? -15 : 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: isReducedMotion ? 0 : Math.min(idx * 0.06, 0.5) }}
                    whileHover={isReducedMotion ? {} : { y: -3, rotate: idx % 2 === 0 ? -1.5 : 1.5 }}
                    className={cn(
                      "p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)]",
                      "hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:shadow-md transition-all",
                      "flex items-center justify-between gap-3 group cursor-default"
                    )}
                  >
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      {comp}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] opacity-60 group-hover:opacity-100">
                      ★{String(idx + 1).padStart(2, '0')}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
