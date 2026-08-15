"use client"

import { Calendar, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'
import { MeetingBookingForm } from '@/components/shared/MeetingBookingForm'
import { SafePublicTeamMember } from '@/lib/team/team-resolver'
import { cn } from '@/lib/utils'

interface FullWidthConsultationSectionProps {
  member: SafePublicTeamMember
  locale: string
}

export function FullWidthConsultationSection({ member, locale }: FullWidthConsultationSectionProps) {
  const isAr = locale === 'ar'

  return (
    <section
      id="consultation-booking"
      data-testid="full-width-consultation-section"
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        "relative py-20 sm:py-28 px-4 sm:px-8 md:px-12 lg:px-16 overflow-hidden",
        "bg-[var(--surface-default)] text-[var(--text-primary)] border-t border-[var(--border-default)]"
      )}
    >
      {/* ============================================================ */}
      {/* 1. SLOW CYAN-TO-VIOLET LIGHT SWEEP BACKGROUND                */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Animated Gradient Sweep Background */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-25"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(16,185,129,0.2) 35%, rgba(168,85,247,0.3) 70%, rgba(59,130,246,0.25) 100%)',
            backgroundSize: '250% 250%',
            animation: 'e3-consultation-gradient 8s ease infinite alternate',
          }}
        />

        <style>{`
          @keyframes e3-consultation-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        {/* Ambient Radial Mesh Glow */}
        <div
          className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-3xl opacity-20 dark:opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.4), rgba(168,85,247,0.3) 50%, transparent 80%)',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. FULL-WIDTH CONSULTATION CONTAINER & EMBEDDED FORM         */}
      {/* ============================================================ */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Narrative & Invitation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 text-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{isAr ? 'جلسة استشارية وتخطيطية' : 'Executive Consultation'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-[1.1]">
            {isAr ? `تنسيق استشارة متخصصة مع ${member.name}` : `Schedule a Project Consultation with ${member.name}`}
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            {isAr
              ? `احجز جلسة عمل مباشرة لمناقشة متطلبات مشروعك، استشارات هندسة الفعاليات، أو تطوير الوجهات الترفيهية في قطر مع فريق ${member.department}.`
              : `Book a direct strategic session to discuss project scope, experiential event engineering, or destination master-planning with our ${member.department} leadership.`}
          </p>

          {/* Value Bullet Points */}
          <div className="space-y-3 pt-2">
            {[
              isAr ? 'استشارات تخصصية مخصصة لمتطلبات مشروعك' : 'Tailored technical consultation for your project scope',
              isAr ? 'تقييم دراسات الجدوى والحلول الهندسية المبتكرة' : 'Assessment of feasibility, spatial layout, and kinetic staging',
              isAr ? 'تأكيد فوري وتنسيق مباشر مع فريق E3 بقطر' : 'Direct follow-up from E3 Qatar project leadership',
            ].map((bullet, bIdx) => (
              <div key={bIdx} className="flex items-center gap-3 text-sm font-semibold text-[var(--text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          {/* Privacy & Confidentiality Notice */}
          <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-default)] flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {isAr
                ? 'جميع المداولات والبيانات المشتركة تخضع لاتفاقيات السرية وحماية الخصوصية المؤسسية بقطر.'
                : 'All corporate inquiries and project briefs are governed by strict Qatar confidentiality standards.'}
            </span>
          </div>
        </div>

        {/* Embedded MeetingBookingForm Card (7 Cols) */}
        <div className="lg:col-span-7">
          <div
            data-testid="consultation-form-card"
            className={cn(
              "p-6 sm:p-10 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border-default)]",
              "shadow-2xl backdrop-blur-xl relative overflow-hidden text-start"
            )}
          >
            {/* Top Glow Accent */}
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-6 mb-6">
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">
                  {isAr ? 'نموذج حجز الموعد' : 'Select Date & Direct Details'}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {isAr ? 'اختر اليوم والوقت المناسب لتنسيق الجلسة' : 'Choose an available slot for your consultation'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary)]/20">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Existing Canonical Booking Form Component with Full Validation & Handlers */}
            <MeetingBookingForm locale={locale} hostId={member.id} />
          </div>
        </div>
      </div>
    </section>
  )
}
