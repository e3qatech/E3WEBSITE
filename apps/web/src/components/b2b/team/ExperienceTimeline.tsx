"use client"

import { motion } from "framer-motion"

export interface TimelineEntry {
  id: string
  company: Record<string, string>
  role: Record<string, string>
  duration: Record<string, string>
  description?: Record<string, string>
}

interface ExperienceTimelineProps {
  entries: TimelineEntry[]
  locale: string
}

export function ExperienceTimeline({ entries, locale }: ExperienceTimelineProps) {
  const isRTL = locale === 'ar'

  return (
    <div className="relative ps-6 md:ps-8 border-s-2 border-[var(--surface-hover)]">
      {/* Background Line */}
      <div className="absolute top-0 bottom-0 start-0 w-0.5 bg-[var(--border-default)] -translate-x-[50%]" />

      <div className="space-y-12">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
            className="relative"
          >
            {/* Timeline Dot */}
            <div className="absolute top-1.5 -start-[1.8rem] md:-start-[2.3rem] w-4 h-4 rounded-full bg-[var(--surface-default)] border-2 border-[var(--color-primary)] z-10 shadow-[0_0_10px_var(--color-primary)]" />
            
            <div className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h4 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                {entry.role[locale] || entry.role.en}
              </h4>
              <span className="text-sm font-bold px-3 py-1 bg-[var(--surface-hover)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-full shrink-0 w-fit">
                {entry.duration[locale] || entry.duration.en}
              </span>
            </div>
            
            <h5 className="text-[var(--color-primary)] font-bold tracking-widest uppercase text-sm mb-4">
              {entry.company[locale] || entry.company.en}
            </h5>
            
            {entry.description && (
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {entry.description[locale] || entry.description.en}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
