import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SafePublicTeamMember } from '@/lib/team/team-resolver'
import { CinematicProfileHero } from '@/components/b2b/team/profile/CinematicProfileHero'
import { BiographyStorySection } from '@/components/b2b/team/profile/BiographyStorySection'
import { InteractiveCapabilityMatrix } from '@/components/b2b/team/profile/InteractiveCapabilityMatrix'
import { ProjectDeliveryReel } from '@/components/b2b/team/profile/ProjectDeliveryReel'
import { CredentialTimelineSection } from '@/components/b2b/team/profile/CredentialTimelineSection'
import { FullWidthConsultationSection } from '@/components/b2b/team/profile/FullWidthConsultationSection'
import { CinematicTeamProfileClient } from '@/components/b2b/team/profile/CinematicTeamProfileClient'
import { resolveDepartmentAura } from '@/lib/team/department-aura'

const MOCK_MEMBER_EN: SafePublicTeamMember = {
  id: 'emp-101',
  slug: 'tariq-al-mansoori',
  name: 'Tariq Al-Mansoori',
  nameEn: 'Tariq Al-Mansoori',
  nameAr: 'طارق المنصوري',
  designation: 'Managing Director of Experiential Architecture',
  department: 'Executive Engineering',
  departmentKey: 'EXECUTIVE',
  presentationGroup: 'Executive Leadership',
  presentationGroupKey: 'EXECUTIVE_LEADERSHIP',
  yearsOfExperience: 16,
  tagline: 'Transforming kinetic engineering into unforgettable human memories.',
  aboutSummary: 'Pioneering mega-event spatial engineering across Qatar and the GCC. Leading multi-disciplinary teams across mechanical staging, projection mapping, and crowd telemetry systems.',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  initials: 'TM',
  linkedinUrl: 'https://linkedin.com/in/tariqalmansoori',
  hasLinkedin: true,
  order: 1,
  displayOrder: 1,
  isFeatured: true,
  showOnTeamPage: true,
  careerJourney: 'Over 16 years leading high-stakes FIFA World Cup fan activations, landmark National Day celebrations, and permanent spatial attractions.',
  expertiseTags: ['Kinetic Staging', 'Crowd Flow Dynamics', 'Spatial Sound Design', 'Immersive Architecture'],
  coreCompetencies: ['Executive Governance', 'Technical Direction', 'High-Stakes Production', 'Cross-Border Logistics'],
  experience: [
    {
      id: 'exp-1',
      company: { en: 'E3 Qatar', ar: 'إي ثري قطر' },
      role: { en: 'Managing Director', ar: 'المدير التنفيذي' },
      duration: { en: '2020 - Present', ar: '2020 - الآن' },
      description: { en: 'Directing all experiential productions and spatial installations.', ar: 'إدارة كافة الإنتاجات الترفيهية والتجهيزات الهندسية.' }
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Lusail Kinetic Pavilion',
      role: 'Lead Architect',
      client: 'Supreme Committee',
      year: '2023',
      description: 'Dynamic kinetic roof structure with 120 synchronized winches.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865'
    },
    {
      id: 'proj-2',
      name: 'Qatar National Day Arena',
      role: 'Technical Director',
      client: 'Ministry of Culture',
      year: '2024',
      description: '360-degree holographic arena and laser projection system.'
      // No media to test gradient title card fallback
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Chartered Structural & Event Engineer (CEng)',
      issuer: 'Institution of Engineering & Technology',
      year: '2015'
    },
    {
      id: 'cert-2',
      name: 'Project Management Professional (PMP)',
      issuer: 'PMI Global',
      year: '2018'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'M.Sc. Advanced Mechanical Engineering',
      institution: 'Imperial College London',
      year: '2011'
    }
  ],
  awards: []
}

const MOCK_MEMBER_AR: SafePublicTeamMember = {
  ...MOCK_MEMBER_EN,
  name: 'طارق المنصوري',
  designation: 'المدير التنفيذي للهندسة التجريبية',
  department: 'الإدارة الهندسية التنفيذية',
  tagline: 'تحويل الهندسة الحركية إلى ذكريات إنسانية لا تُنسى.',
  aboutSummary: 'ريادة هندسة الفعاليات الكبرى في قطر والخليج العربي. قيادة فرق متعددة التخصصات في المسارح الحركية وتتبع الحشود.',
  careerJourney: 'أكثر من 16 عاماً في قيادة فعاليات كأس العالم والاحتفالات الوطنية والوجهات الترفيهية الدائمة في قطر.',
  expertiseTags: ['المسارح الحركية', 'ديناميكا الحشود', 'تصميم الصوت المحيطي', 'العمارة التفاعلية'],
  coreCompetencies: ['الحوكمة التنفيذية', 'الإدارة التقنية', 'الإنتاج عالي الحساسية', 'اللوجستيات الدولية']
}

describe('UX-03B & UX-03B-B: Cinematic Team Profile & Department Aura Suite', () => {
  
  /* ================================================================ */
  /* 0. DEPARTMENT AURA THEME SYSTEM TESTS                             */
  /* ================================================================ */
  describe('0. Department Aura Theme System', () => {
    it('maps all 6 standard departments and unmapped fallback accurately', () => {
      // 1. Executive Management: Emerald + Champagne
      const exec = resolveDepartmentAura('Executive Management', 'executive');
      expect(exec.key).toBe('executive');
      expect(exec.primaryColor).toBe('#10b981'); // Emerald
      expect(exec.secondaryColor).toBe('#e2b774'); // Champagne

      // 2. Creative & Marketing: Violet + Magenta
      const creative = resolveDepartmentAura('Creative & Marketing', 'marketing');
      expect(creative.key).toBe('creative');
      expect(creative.primaryColor).toBe('#8b5cf6'); // Violet
      expect(creative.secondaryColor).toBe('#ec4899'); // Magenta

      // 3. Operations: Amber + Red
      const ops = resolveDepartmentAura('Operations & Logistics', 'operations');
      expect(ops.key).toBe('operations');
      expect(ops.primaryColor).toBe('#f59e0b'); // Amber
      expect(ops.secondaryColor).toBe('#ef4444'); // Red

      // 4. Technical & Production: Cyan + Electric Blue
      const tech = resolveDepartmentAura('Technical Engineering', 'technology-systems');
      expect(tech.key).toBe('technical');
      expect(tech.primaryColor).toBe('#06b6d4'); // Cyan
      expect(tech.secondaryColor).toBe('#3b82f6'); // Electric Blue

      // 5. Finance & Administration: Cobalt + Silver
      const finance = resolveDepartmentAura('Finance & Accounting', 'finance');
      expect(finance.key).toBe('finance');
      expect(finance.primaryColor).toBe('#1d4ed8'); // Cobalt
      expect(finance.secondaryColor).toBe('#cbd5e1'); // Silver

      // 6. Food & Beverage: Copper + Warm Green
      const fnb = resolveDepartmentAura('Food & Beverage Operations', 'fnb');
      expect(fnb.key).toBe('foodBeverage');
      expect(fnb.primaryColor).toBe('#c2410c'); // Copper
      expect(fnb.secondaryColor).toBe('#15803d'); // Warm Green

      // 7. Unmapped Fallback: Neutral E3 Cyan + Teal
      const fallback = resolveDepartmentAura('Unknown Mystery Department', null);
      expect(fallback.key).toBe('fallback');
      expect(fallback.primaryColor).toBe('#06b6d4');
      expect(fallback.secondaryColor).toBe('#14b8a6');
    });

    it('resolves Arabic department names accurately', () => {
      expect(resolveDepartmentAura('الإدارة التنفيذية').key).toBe('executive');
      expect(resolveDepartmentAura('التسويق والإعلام').key).toBe('creative');
      expect(resolveDepartmentAura('العمليات والتشغيل').key).toBe('operations');
      expect(resolveDepartmentAura('الإنتاج والأنظمة التقنية').key).toBe('technical');
      expect(resolveDepartmentAura('المطاعم والمشروبات').key).toBe('foodBeverage');
    });
  });

  /* ================================================================ */
  /* 1. CINEMATIC PROFILE HERO TESTS                                  */
  /* ================================================================ */
  describe('1. Cinematic Profile Hero', () => {
    it('renders editorial hero with 55-60vh portrait, outlined initial, department aura, and identity', () => {
      const html = renderToStaticMarkup(
        <CinematicProfileHero member={MOCK_MEMBER_EN} locale="en" />
      )

      expect(html).toContain('data-testid="cinematic-profile-hero"')
      expect(html).toContain('data-testid="portrait-4-5-frame"')
      expect(html).toContain('aspect-[4/5]')
      expect(html).toContain('data-testid="hero-outlined-initial"')
      expect(html).toContain('T') // Single outlined initial for Tariq
      expect(html).toContain('data-testid="department-radial-aura"')
      expect(html).toContain('data-testid="identity-warm-illumination"')
      expect(html).toContain('data-testid="hero-contour-lines"')
      expect(html).toContain('data-testid="hero-lower-grid"')
      expect(html).toContain('data-testid="hero-film-grain"')
      expect(html).toContain('Tariq Al-Mansoori')
      expect(html).toContain('Managing Director of Experiential Architecture')
      expect(html).toContain('Executive Engineering')
      expect(html).toContain('16+ Years')
      expect(html).toContain('data-testid="hero-consultation-cta"')
      expect(html).toContain('data-testid="hero-general-contact-cta"')
      expect(html).toContain('data-testid="back-to-team-link"')
      expect(html).toContain('href="/en/b2b/team"')
    })

    it('renders LinkedIn profile icon button when URL is provided', () => {
      const html = renderToStaticMarkup(
        <CinematicProfileHero member={MOCK_MEMBER_EN} locale="en" />
      )
      expect(html).toContain('data-testid="hero-linkedin-link"')
      expect(html).toContain('href="https://linkedin.com/in/tariqalmansoori"')
    })

    it('renders bespoke monogram title card with department aura when portrait image is absent', () => {
      const memberWithoutImage = { ...MOCK_MEMBER_EN, profileImage: null }
      const html = renderToStaticMarkup(
        <CinematicProfileHero member={memberWithoutImage} locale="en" />
      )
      expect(html).toContain('data-testid="portrait-monogram-card"')
      expect(html).toContain('TM')
      expect(html).toContain('E3 QATAR EXPERT')
    })
  })

  /* ================================================================ */
  /* 2. BIOGRAPHY STORY SECTION TESTS                                 */
  /* ================================================================ */
  describe('2. Biography Story Section', () => {
    it('splits biography into prominent opening sentence and readable body', () => {
      const html = renderToStaticMarkup(
        <BiographyStorySection member={MOCK_MEMBER_EN} locale="en" />
      )

      expect(html).toContain('data-testid="biography-story-section"')
      expect(html).toContain('data-testid="bio-intro-sentence"')
      expect(html).toContain('Pioneering mega-event spatial engineering across Qatar and the GCC.')
      expect(html).toContain('data-testid="bio-remaining-body"')
      expect(html).toContain('Leading multi-disciplinary teams')
      expect(html).toContain('data-testid="bio-experience-stat-card"')
      expect(html).toContain('16+')
    })

    it('collapses completely when biography is empty', () => {
      const memberNoBio = { ...MOCK_MEMBER_EN, aboutSummary: '', careerJourney: '' }
      const html = renderToStaticMarkup(
        <BiographyStorySection member={memberNoBio} locale="en" />
      )
      expect(html).toBe('')
    })
  })

  /* ================================================================ */
  /* 3. INTERACTIVE CAPABILITY MATRIX TESTS                           */
  /* ================================================================ */
  describe('3. Interactive Capability Matrix', () => {
    it('renders two structured panels for expertise and core competencies', () => {
      const html = renderToStaticMarkup(
        <InteractiveCapabilityMatrix member={MOCK_MEMBER_EN} locale="en" />
      )

      expect(html).toContain('data-testid="interactive-capability-matrix"')
      expect(html).toContain('data-testid="expertise-capability-panel"')
      expect(html).toContain('Kinetic Staging')
      expect(html).toContain('Crowd Flow Dynamics')
      expect(html).toContain('data-testid="competencies-capability-panel"')
      expect(html).toContain('Executive Governance')
      expect(html).toContain('Technical Direction')
    })

    it('collapses completely when both expertise and competencies are empty', () => {
      const memberNoCaps = { ...MOCK_MEMBER_EN, expertiseTags: [], coreCompetencies: [], keyStrengths: '' }
      const html = renderToStaticMarkup(
        <InteractiveCapabilityMatrix member={memberNoCaps} locale="en" />
      )
      expect(html).toBe('')
    })
  })

  /* ================================================================ */
  /* 4. PROJECT DELIVERY REEL TESTS                                   */
  /* ================================================================ */
  describe('4. Project Delivery Reel', () => {
    it('renders horizontal project delivery reel with project cards and controls', () => {
      const html = renderToStaticMarkup(
        <ProjectDeliveryReel projects={MOCK_MEMBER_EN.projects} locale="en" />
      )

      expect(html).toContain('data-testid="project-delivery-reel"')
      expect(html).toContain('data-testid="project-reel-container"')
      expect(html).toContain('data-testid="project-reel-prev"')
      expect(html).toContain('data-testid="project-reel-next"')
      expect(html).toContain('Lusail Kinetic Pavilion')
      expect(html).toContain('Lead Architect')
      expect(html).toContain('2023')
      expect(html).toContain('Qatar National Day Arena')
      expect(html).toContain('KEY DELIVERY') // Gradient card fallback for proj-2
    })

    it('collapses completely when projects array is empty', () => {
      const html = renderToStaticMarkup(
        <ProjectDeliveryReel projects={[]} locale="en" />
      )
      expect(html).toBe('')
    })
  })

  /* ================================================================ */
  /* 5. CREDENTIAL TIMELINE & CONSULTATION TESTS                      */
  /* ================================================================ */
  describe('5. Credential Timeline & Consultation', () => {
    it('renders vertical credential timeline for certifications and education', () => {
      const html = renderToStaticMarkup(
        <CredentialTimelineSection
          certifications={MOCK_MEMBER_EN.certifications}
          education={MOCK_MEMBER_EN.education}
          locale="en"
        />
      )

      expect(html).toContain('data-testid="credential-timeline-section"')
      expect(html).toContain('Chartered Structural')
      expect(html).toContain('CEng')
      expect(html).toContain('Institution of Engineering')
      expect(html).toContain('M.Sc. Advanced Mechanical Engineering')
      expect(html).toContain('Imperial College London')
    })

    it('renders full-width closing consultation section with light sweep background', () => {
      const html = renderToStaticMarkup(
        <FullWidthConsultationSection member={MOCK_MEMBER_EN} locale="en" />
      )

      expect(html).toContain('data-testid="full-width-consultation-section"')
      expect(html).toContain('id="consultation-booking"')
      expect(html).toContain('Schedule a Project Consultation with Tariq Al-Mansoori')
      expect(html).toContain('data-testid="consultation-form-card"')
      expect(html).toContain('e3-consultation-gradient')
    })
  })

  /* ================================================================ */
  /* 6. PUBLIC PRIVACY ASSURANCE                                      */
  /* ================================================================ */
  describe('6. Public Privacy & Data Protection', () => {
    it('never renders personal staff email or phone numbers in DOM', () => {
      const memberWithPersonalContact = {
        ...MOCK_MEMBER_EN,
        contactEmail: 'tariq.private@e3qatar.com',
        phone: '+974 5555 1234'
      }

      const html = renderToStaticMarkup(
        <CinematicTeamProfileClient member={memberWithPersonalContact as any} locale="en" />
      )

      expect(html).not.toContain('tariq.private@e3qatar.com')
      expect(html).not.toContain('+974 5555 1234')
    })
  })

  /* ================================================================ */
  /* 7. ARABIC LOCALIZATION & RTL PARITY                              */
  /* ================================================================ */
  describe('7. Arabic Localization & RTL Parity', () => {
    it('renders Arabic profile exclusively with dir="rtl" and Arabic terminology', () => {
      const html = renderToStaticMarkup(
        <CinematicTeamProfileClient member={MOCK_MEMBER_AR} locale="ar" />
      )

      expect(html).toContain('dir="rtl"')
      expect(html).toContain('طارق المنصوري')
      expect(html).toContain('المدير التنفيذي للهندسة التجريبية')
      expect(html).toContain('الإدارة الهندسية التنفيذية')
      expect(html).toContain('العودة إلى دليل فريق العمل')
      expect(html).toContain('المسارح الحركية')
      expect(html).toContain('ديناميكا الحشود')
    })
  })
})
