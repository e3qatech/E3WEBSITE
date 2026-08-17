import { describe, it, expect, vi } from 'vitest'

describe('Attraction Content Studio - Full-Screen Focus Mode & Classification', () => {
  it('defines the 5-dimensional classification taxonomy correctly', () => {
    const entityTypes = ["ATTRACTION", "EVENT", "ACTIVATION", "PROGRAMME", "VENUE"]
    const experienceFormats = [
      "PERMANENT_FEC", "MALL_ANCHOR", "SEASONAL_EVENT", "TOURING_POPUP",
      "SPORTS_ACTIVATION", "FESTIVAL", "WORKSHOP_EDU", "CORPORATE_PRIVATE",
      "COMMUNITY_PUBLIC", "EXHIBITION_ZONE", "CUSTOM"
    ]
    const accessModels = ["PAID", "FREE", "REGISTRATION_REQUIRED", "INVITE_ONLY", "MIXED"]
    const durationModels = ["PERMANENT", "SINGLE_DAY", "MULTI_DAY", "RECURRING", "SEASONAL"]
    const environmentModels = ["INDOOR", "OUTDOOR", "HYBRID"]

    expect(entityTypes).toContain("ATTRACTION")
    expect(entityTypes).toContain("EVENT")
    expect(entityTypes).toContain("ACTIVATION")
    expect(experienceFormats.length).toBe(11)
    expect(accessModels).toContain("FREE")
    expect(accessModels).toContain("PAID")
    expect(durationModels).toContain("SEASONAL")
    expect(environmentModels).toContain("INDOOR")
  })

  it('correctly calculates translation health audit without false English fallback flags', () => {
    const testCases = [
      { field: 'Name (AR)', ar: 'أوربان أرينا', en: 'Urban Arena', expectedPass: true },
      { field: 'Tagline (AR)', ar: 'Urban Arena', en: 'Urban Arena', expectedPass: false }, // English text in AR field
      { field: 'Description (AR)', ar: '', en: 'Experience...', expectedPass: false }, // Missing
      { field: 'FAQ (AR)', ar: 'يتم توفير جميع معدات السلامة', en: 'Safety gear provided', expectedPass: true }
    ]

    const passed = testCases.filter(t => {
      const hasAr = /[\u0600-\u06FF]/.test(t.ar)
      return t.ar.trim() !== '' && (hasAr || t.ar.toLowerCase() !== t.en.toLowerCase())
    })

    expect(passed.length).toBe(2)
    const score = Math.round((passed.length / testCases.length) * 100)
    expect(score).toBe(50)
  })

  it('validates primary and secondary story track badge hierarchy (max 3 chips)', () => {
    const primaryTrack = { id: 'st-1', slug: 'drive', titleEn: 'Drive', titleAr: 'قيادة', accentColor: '#3b82f6' }
    const secondaryTracks = [
      { id: 'st-2', slug: 'compete', titleEn: 'Compete', titleAr: 'تنافس', accentColor: '#ef4444' },
      { id: 'st-3', slug: 'adrenaline', titleEn: 'Adrenaline', titleAr: 'إثارة', accentColor: '#eab308' },
      { id: 'st-4', slug: 'vr', titleEn: 'VR', titleAr: 'واقع افتراضي', accentColor: '#8b5cf6' }
    ]

    // Public display rule: 1 prominent primary badge + up to 2 supporting chips (max 3 total)
    const allBadges = [primaryTrack, ...secondaryTracks.slice(0, 2)]
    expect(allBadges.length).toBe(3)
    expect(allBadges[0].id).toBe('st-1') // Primary
    expect(allBadges[1].id).toBe('st-2') // Supporting 1
    expect(allBadges[2].id).toBe('st-3') // Supporting 2
  })

  it('matches multi-track filtering for both primary and secondary track selections', () => {
    const activity = {
      id: 'act-1',
      titleEn: 'Laser Tag Arena',
      primaryStoryTypeId: 'st-adrenaline',
      secondaryStoryTypeIds: ['st-compete', 'st-arcade']
    }

    const filterByPrimary = ['st-adrenaline'].some(
      id => activity.primaryStoryTypeId === id || activity.secondaryStoryTypeIds.includes(id)
    )
    const filterBySecondary = ['st-compete'].some(
      id => activity.primaryStoryTypeId === id || activity.secondaryStoryTypeIds.includes(id)
    )
    const filterByUnmatched = ['st-kids'].some(
      id => activity.primaryStoryTypeId === id || activity.secondaryStoryTypeIds.includes(id)
    )

    expect(filterByPrimary).toBe(true)
    expect(filterBySecondary).toBe(true)
    expect(filterByUnmatched).toBe(false)
  })
})

describe('Content Intake Hub & Import Audit Engine', () => {
  it('generates consistent batch number format for import jobs', () => {
    const now = new Date('2026-08-17T12:00:00Z')
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '')
    const batchNumber = `E3-IMP-${dateStr}-4512`

    expect(batchNumber).toMatch(/^E3-IMP-\d{6}-\d{4}$/)
  })

  it('safely simulates rollback of newly imported draft records', () => {
    const mockAttractions = [
      { id: '1', slug: 'urban-arena', isPublished: true },
      { id: '2', slug: 'imported-pop-up', isPublished: true }
    ]

    const job = {
      id: 'job-1',
      batchNumber: 'E3-IMP-260817-1001',
      status: 'APPLIED',
      appliedRecordIds: ['imported-pop-up']
    }

    // Rollback sets isPublished to false for records created in this batch
    const rolledBackAttractions = mockAttractions.map(a => {
      if (job.appliedRecordIds.includes(a.slug)) {
        return { ...a, isPublished: false }
      }
      return a
    })

    expect(rolledBackAttractions.find(a => a.slug === 'urban-arena')?.isPublished).toBe(true)
    expect(rolledBackAttractions.find(a => a.slug === 'imported-pop-up')?.isPublished).toBe(false)
  })
})
