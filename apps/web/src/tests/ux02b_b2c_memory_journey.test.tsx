import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CinematicHeroUniversal } from '@/components/b2c/story/CinematicHeroUniversal'
import { StoryTaxonomyPortals } from '@/components/b2c/story/StoryTaxonomyPortals'
import { ExperienceWorldsStage } from '@/components/b2c/story/ExperienceWorldsStage'
import { Act4LivingDayTimeline } from '@/components/b2c/story/Act4LivingDayTimeline'
import { SocialFeedSection } from '@/components/b2c/story/SocialFeedSection'
import { CoreTeamPeopleSection } from '@/components/b2c/story/CoreTeamPeopleSection'
import { TactileDigitalTicket } from '@/components/b2c/story/TactileDigitalTicket'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/en/b2c',
}))

describe('UX-02B: B2C Memory Journey (From Imagination to Memory)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockContent = {
    hero: {
      headerEn: "Some days pass. Others become stories.",
      headerAr: "أيام تمرّ… وأيام تتحول إلى حكايات.",
      subHeaderEn: "Enter a world of attractions, live experiences and unforgettable moments.",
      subHeaderAr: "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية.",
      badgeEn: "E3 QATAR ENTERTAINMENT WORLDS",
      badgeAr: "عالم إي ثري الترفيهي بقطر",
      mediaUrl: "https://example.com/hero.mp4",
      mediaType: "VIDEO",
    },
    intentSelector: {
      titleEn: "What Kind of Story Do You Want Today?",
      titleAr: "أي نوع من الحكايات تريد أن تعيشها اليوم؟",
    },
    storyDiscovery: {
      storyTypes: [
        {
          id: 'thrill-adventure',
          slug: 'thrill-adventure',
          titleEn: 'Thrill & Action',
          titleAr: 'المغامرة والحماس',
          accentColor: '#ec4899',
          orderIndex: 1,
          features: []
        }
      ]
    },
    livingDay: {
      scheduleNow: [],
      scheduleLater: [],
      scheduleSoon: [],
    },
    socialFeed: {
      headlineEn: "E3 Happening Now — Live Moments",
      headlineAr: "إي ثري الآن — لحظات حية مباشرة",
    },
    coreTeam: {
      headlineEn: "The people behind the experience",
      headlineAr: "الفريق الذي يصنع التجربة",
    },
    act7Ticket: {
      headlineEn: "Your next story is waiting.",
      headlineAr: "حكايتك القادمة بانتظارك.",
    }
  }

  it('1. Hero renders 3-layer illuminated text and video toggle in English and Arabic', () => {
    const htmlEn = renderToStaticMarkup(<CinematicHeroUniversal content={mockContent} locale="en" />)
    expect(htmlEn).toContain("Some days pass. Others become stories.")
    expect(htmlEn).toContain("E3 QATAR ENTERTAINMENT WORLDS")

    const htmlAr = renderToStaticMarkup(<CinematicHeroUniversal content={mockContent} locale="ar" />)
    expect(htmlAr).toContain("أيام تمرّ… وأيام تتحول إلى حكايات.")
    expect(htmlAr).toContain("عالم إي ثري الترفيهي بقطر")
  })

  it('2. Story Tracks render dimensional doorways in English and Arabic', () => {
    const htmlEn = renderToStaticMarkup(<StoryTaxonomyPortals content={mockContent} locale="en" />)
    expect(htmlEn).toContain("STORY TRACKS &amp; DIMENSIONAL DOORWAYS")
    expect(htmlEn).toContain("What Kind of Story Do You Want Today?")

    const htmlAr = renderToStaticMarkup(<StoryTaxonomyPortals content={mockContent} locale="ar" />)
    expect(htmlAr).toContain("مسارات الحكايات — DIMENSIONAL DOORWAYS")
    expect(htmlAr).toContain("أي نوع من الحكايات تريد أن تعيشها اليوم؟")
  })

  it('3. Attractions Constellation renders and features Qatar attractions', () => {
    const htmlEn = renderToStaticMarkup(<ExperienceWorldsStage content={mockContent} locale="en" />)
    expect(htmlEn).toContain("QATAR ATTRACTIONS CONSTELLATION")
    expect(htmlEn).toContain("E3 Featured Attraction Worlds")

    const htmlAr = renderToStaticMarkup(<ExperienceWorldsStage content={mockContent} locale="ar" />)
    expect(htmlAr).toContain("كوكبة عوالم قطر الترفيهية")
    expect(htmlAr).toContain("عوالم إي ثري الترفيهية بقطر")
  })

  it('4. Living Day Timeline renders day-to-evening time categories', () => {
    const htmlEn = renderToStaticMarkup(<Act4LivingDayTimeline content={mockContent} locale="en" />)
    expect(htmlEn).toContain("ACT IV — THE LIVING DAY TIMELINE")
    expect(htmlEn).toContain("Happening Now")
    expect(htmlEn).toContain("Later Today (Evening)")

    const htmlAr = renderToStaticMarkup(<Act4LivingDayTimeline content={mockContent} locale="ar" />)
    expect(htmlAr).toContain("الفصل الرابع — جدول اليوم الحي")
    expect(htmlAr).toContain("مفتوح الآن (صباحاً)")
    expect(htmlAr).toContain("مساء اليوم")
  })

  it('5. Social Feed memory wall renders with controls and platform filters', () => {
    const htmlEn = renderToStaticMarkup(<SocialFeedSection content={mockContent} locale="en" />)
    expect(htmlEn).toContain("LIVE MEMORY WALL — HAPPENING NOW")
    expect(htmlEn).toContain("Drag or use arrow keys to navigate the layered memory wall")

    const htmlAr = renderToStaticMarkup(<SocialFeedSection content={mockContent} locale="ar" />)
    expect(htmlAr).toContain("جدار الذكريات التفاعلي — LIVE MEMORY WALL")
  })

  it('6. Core Team section renders editorial portrait cards with proper localized roles', () => {
    const htmlEn = renderToStaticMarkup(<CoreTeamPeopleSection content={mockContent} locale="en" />)
    expect(htmlEn).toContain("CORE TEAM — HUMAN PROOF")

    const htmlAr = renderToStaticMarkup(<CoreTeamPeopleSection content={mockContent} locale="ar" />)
    expect(htmlAr).toContain("صنّاع المتعة — CORE TEAM")
  })

  it('7. Final CTA renders soft B2C portal pass with working attraction destinations', () => {
    const htmlEn = renderToStaticMarkup(<TactileDigitalTicket content={mockContent} locale="en" />)
    expect(htmlEn).toContain("FROM IMAGINATION TO MEMORY — DIGITAL PASS")
    expect(htmlEn).toContain("OFFICIAL DIGITAL PASS")

    const htmlAr = renderToStaticMarkup(<TactileDigitalTicket content={mockContent} locale="ar" />)
    expect(htmlAr).toContain("بوابة الخيال إلى الذاكرة — DIGITAL PORTAL PASS")
    expect(htmlAr).toContain("تذكرة الشرف الرقمية")
  })
})
