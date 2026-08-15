"use client"

import { motion, useReducedMotion } from 'framer-motion'
import { Award, CheckCircle2, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CredentialTimelineSectionProps {
  certifications: any[]
  education?: any[]
  awards?: any[]
  locale: string
}

export function CredentialTimelineSection({
  certifications = [],
  education = [],
  awards: _awards = [],
  locale
}: CredentialTimelineSectionProps) {
  const isAr = locale === 'ar'
  const isReducedMotion = useReducedMotion()

  const validCerts = (Array.isArray(certifications) ? certifications : []).map((c, idx) => ({
    id: c.id || `cert-${idx}`,
    name: typeof c === 'string' ? c : c.name || c.title || '',
    issuer: typeof c === 'object' ? c.issuer || (isAr ? 'هيئة مهنية معتمدة' : 'Professional Organization') : (isAr ? 'هيئة مهنية معتمدة' : 'Professional Organization'),
    year: typeof c === 'object' ? c.year || '' : '',
  })).filter(c => c.name.trim().length > 0)

  const validEdu = (Array.isArray(education) ? education : []).map((e, idx) => ({
    id: e.id || `edu-${idx}`,
    degree: typeof e === 'string' ? e : e.degree || e.name || '',
    institution: typeof e === 'object' ? e.institution || e.university || '' : '',
    year: typeof e === 'object' ? e.year || '' : '',
  })).filter(e => e.degree.trim().length > 0)

  const hasCredentials = validCerts.length > 0 || validEdu.length > 0

  // Hide section completely if there are no credentials
  if (!hasCredentials) {
    return null
  }

  return (
    <section
      data-testid="credential-timeline-section"
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
            <Award className="w-3.5 h-3.5" />
            <span>{isAr ? 'الاعتمادات والمؤهلات المهنية' : 'Certifications & Academic Credentials'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            {isAr ? 'الشهادات والاعتمادات الرسمية' : 'Professional Accreditations & Licenses'}
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
            {isAr
              ? 'الشهادات والاعتمادات المهنية الدولية والمحلية المعتمدة في إدارة المشاريع وهندسة الفعاليات.'
              : 'Recognized industry certifications, technical safety licenses, and executive accreditations.'}
          </p>
        </div>

        {/* Editorial Vertical Credential Timeline */}
        <div className="relative ps-6 sm:ps-10 border-s-2 border-[var(--border-default)] max-w-4xl">
          
          {/* Vertical Glowing Guide Line */}
          <div className="absolute top-0 bottom-0 start-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-400 to-transparent -translate-x-[50%]" />

          <div className="space-y-8 sm:space-y-10">
            {validCerts.map((cert, index) => (
              <motion.div
                key={cert.id}
                data-testid="credential-timeline-item"
                initial={isReducedMotion ? {} : { opacity: 0, x: isAr ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: isReducedMotion ? 0 : Math.min(index * 0.1, 0.4) }}
                className="relative group text-start"
              >
                {/* Node Ring Indicator */}
                <div className="absolute top-1 -start-[2.1rem] sm:-start-[3.1rem] w-6 h-6 rounded-full bg-[var(--surface-default)] border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)] z-10 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border-default)] hover:border-emerald-500/40 hover:shadow-md transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                      {cert.name}
                    </h3>
                    {cert.year && (
                      <span className="text-xs font-mono font-bold px-3 py-1 bg-[var(--surface-default)] border border-[var(--border-default)] text-[var(--color-primary)] rounded-full shrink-0 w-fit">
                        {cert.year}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{cert.issuer}</span>
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Education Items if present */}
            {validEdu.map((edu, idx) => (
              <motion.div
                key={edu.id}
                data-testid="education-timeline-item"
                initial={isReducedMotion ? {} : { opacity: 0, x: isAr ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: isReducedMotion ? 0 : Math.min((validCerts.length + idx) * 0.1, 0.5) }}
                className="relative group text-start"
              >
                {/* Node Ring Indicator */}
                <div className="absolute top-1 -start-[2.1rem] sm:-start-[3.1rem] w-6 h-6 rounded-full bg-[var(--surface-default)] border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] z-10 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-500" />
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border-default)] hover:border-cyan-500/40 hover:shadow-md transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                      {edu.degree}
                    </h3>
                    {edu.year && (
                      <span className="text-xs font-mono font-bold px-3 py-1 bg-[var(--surface-default)] border border-[var(--border-default)] text-cyan-500 rounded-full shrink-0 w-fit">
                        {edu.year}
                      </span>
                    )}
                  </div>

                  {edu.institution && (
                    <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span>{edu.institution}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
