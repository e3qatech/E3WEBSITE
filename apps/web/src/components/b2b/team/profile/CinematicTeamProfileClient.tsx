"use client"

import { SafePublicTeamMember } from '@/lib/team/team-resolver'
import { CinematicProfileHero } from './CinematicProfileHero'
import { BiographyStorySection } from './BiographyStorySection'
import { InteractiveCapabilityMatrix } from './InteractiveCapabilityMatrix'
import { ProjectDeliveryReel } from './ProjectDeliveryReel'
import { CredentialTimelineSection } from './CredentialTimelineSection'
import { FullWidthConsultationSection } from './FullWidthConsultationSection'
import { ExperienceTimeline, TimelineEntry } from '@/components/b2b/team/ExperienceTimeline'
import { Compass } from 'lucide-react'

interface CinematicTeamProfileClientProps {
  member: SafePublicTeamMember
  experienceEntries?: TimelineEntry[]
  locale: string
}

export function CinematicTeamProfileClient({
  member,
  experienceEntries = [],
  locale
}: CinematicTeamProfileClientProps) {
  const isAr = locale === 'ar'

  const scrollToConsultation = () => {
    const el = document.getElementById('consultation-booking')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main
      data-testid="cinematic-team-profile-page"
      className="bg-[var(--surface-default)] min-h-screen text-[var(--text-primary)] font-poppins selection:bg-emerald-500/30"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. CINEMATIC PROFILE HERO (90svh) */}
      <CinematicProfileHero
        member={member}
        locale={locale}
        onConsultClick={scrollToConsultation}
      />

      {/* 2. BIOGRAPHY STORY SECTION (Editorial 2-Column with Intro & Animated Metric) */}
      <BiographyStorySection
        member={member}
        locale={locale}
      />

      {/* 3. INTERACTIVE CAPABILITY MATRIX (Expertise & Competency Panels) */}
      <InteractiveCapabilityMatrix
        member={member}
        locale={locale}
      />

      {/* 4. PROFESSIONAL EXPERIENCE TIMELINE (If present) */}
      {experienceEntries.length > 0 && (
        <section
          data-testid="team-experience-section"
          className="relative py-16 sm:py-24 px-4 sm:px-8 md:px-12 lg:px-16 bg-[var(--surface-default)] border-b border-[var(--border-default)]"
        >
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="space-y-3 text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-primary)]">
                <Compass className="w-3.5 h-3.5" />
                <span>{isAr ? 'التاريخ والخبرة العملية' : 'Career Timeline'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                {isAr ? 'المسيرة والخبرات العملية' : 'Professional Experience & Career Journey'}
              </h2>
            </div>

            <div className="max-w-4xl">
              <ExperienceTimeline entries={experienceEntries} locale={locale} />
            </div>
          </div>
        </section>
      )}

      {/* 5. PROJECT DELIVERY REEL (Horizontal Carousel) */}
      <ProjectDeliveryReel
        projects={member.projects || []}
        locale={locale}
      />

      {/* 6. CREDENTIALS TIMELINE (Vertical Credential Timeline) */}
      <CredentialTimelineSection
        certifications={member.certifications || []}
        education={member.education || []}
        awards={member.awards || []}
        locale={locale}
      />

      {/* 7. FULL-WIDTH CONSULTATION & BOOKING CLOSING SECTION */}
      <FullWidthConsultationSection
        member={member}
        locale={locale}
      />
    </main>
  )
}
