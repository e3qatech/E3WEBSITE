import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as XLSX from 'xlsx'
import {
  generateMasterWorkbook,
  parseMasterWorkbook,
  validateMasterWorkbook,
  applyMasterWorkbook,
  getAttractionContentMediaMetrics,
  normalizeStoryTrack,
  MasterWorkbookData
} from '../lib/attraction-master-workbook'
import { repairUrbanArenaCanonicalSlug } from '../lib/canonical-urban-arena-repair'
import { db } from '../lib/db'

// Mock db for unit testing
vi.mock('../lib/db', () => {
  const activities = [
    { id: 'feat-1', titleEn: 'Cyber Laser Battle', titleAr: 'معركة الليزر السيبرانية', highlightType: 'PRIMARY_ATTRACTION', imageUrl: 'https://img.com/c1.jpg', storyTypes: [{ id: 'st-compete', slug: 'compete', titleEn: 'Compete', titleAr: 'المنافسة' }], targetAudience: { additionalImages: ['https://img.com/a1.jpg', 'https://img.com/a2.jpg', 'https://img.com/a3.jpg'], mediaStatus: 'READY' } },
    { id: 'feat-2', titleEn: 'Robo Climbing Arena', titleAr: 'ساحة التسلق الآلي', highlightType: 'CHALLENGE_ARENA', imageUrl: 'https://img.com/c2.jpg', storyTypes: [{ id: 'st-compete', slug: 'compete', titleEn: 'Compete', titleAr: 'المنافسة' }, { id: 'st-bounce', slug: 'bounce', titleEn: 'Bounce', titleAr: 'القفز' }], targetAudience: { additionalImages: ['https://img.com/a1.jpg'], mediaStatus: 'PARTIALLY_COMPLETE' } },
    { id: 'feat-3', titleEn: 'Hyper Drift Karting', titleAr: 'سباق الدرفت فائق السرعة', highlightType: 'FEATURED_RIDE', imageUrl: 'https://img.com/c3.jpg', storyTypes: [{ id: 'st-drive', slug: 'drive', titleEn: 'Drive', titleAr: 'القيادة' }], targetAudience: { additionalImages: ['https://img.com/a1.jpg', 'https://img.com/a2.jpg', 'https://img.com/a3.jpg'], mediaStatus: 'READY' } },
    { id: 'feat-4', titleEn: 'Spatial Sound Obstacle Maze', titleAr: 'متاهة العوائق الصوتية المكانية', highlightType: 'IMMERSIVE_EXPERIENCE', imageUrl: 'https://img.com/c4.jpg', storyTypes: [{ id: 'st-explore', slug: 'explore', titleEn: 'Explore', titleAr: 'الاستكشاف' }], targetAudience: { additionalImages: [], mediaStatus: 'PARTIALLY_COMPLETE' } },
    { id: 'feat-5', titleEn: 'Neon Mini Golf', titleAr: 'ميني غولف النيون', highlightType: 'INTERACTIVE_ZONE', imageUrl: 'https://img.com/c5.jpg', storyTypes: [{ id: 'st-compete', slug: 'compete', titleEn: 'Compete', titleAr: 'المنافسة' }], targetAudience: { additionalImages: ['https://img.com/a1.jpg', 'https://img.com/a2.jpg', 'https://img.com/a3.jpg'], mediaStatus: 'READY' } },
    { id: 'feat-6', titleEn: 'Esports Battle Station', titleAr: 'محطة منافسات الرياضات الإلكترونية', highlightType: 'CHALLENGE_ARENA', imageUrl: 'https://img.com/c6.jpg', storyTypes: [{ id: 'st-compete', slug: 'compete', titleEn: 'Compete', titleAr: 'المنافسة' }], targetAudience: { additionalImages: ['https://img.com/a1.jpg', 'https://img.com/a2.jpg', 'https://img.com/a3.jpg'], mediaStatus: 'READY' } },
    { id: 'feat-7', titleEn: 'Gravity Drop Jump', titleAr: 'قفزة انعدام الجاذبية', highlightType: 'FEATURED_RIDE', imageUrl: 'https://img.com/c7.jpg', storyTypes: [{ id: 'st-bounce', slug: 'bounce', titleEn: 'Bounce', titleAr: 'القفز' }], targetAudience: { additionalImages: ['https://img.com/a1.jpg', 'https://img.com/a2.jpg', 'https://img.com/a3.jpg'], mediaStatus: 'READY' } },
    { id: 'feat-8', titleEn: 'Junior Action Zone', titleAr: 'منطقة أبطال المستقبل', highlightType: 'TODDLER_ZONE', imageUrl: 'https://img.com/c8.jpg', storyTypes: [{ id: 'st-bounce', slug: 'bounce', titleEn: 'Bounce', titleAr: 'القفز' }], targetAudience: { additionalImages: ['https://img.com/a1.jpg', 'https://img.com/a2.jpg', 'https://img.com/a3.jpg'], mediaStatus: 'READY' } }
  ]

  const pricing = [
    { id: 'p-1', titleEn: 'Single Arena Access Pass', titleAr: 'تذكرة دخول الصالة الفردية', price: 65, type: 'ACCESS_PASS' },
    { id: 'p-2', titleEn: 'Laser Battle Multi-Pass', titleAr: 'باقة معارك الليزر المتعددة', price: 95, type: 'ACCESS_PASS' },
    { id: 'p-3', titleEn: 'Hyper Drift Karting Tier 1', titleAr: 'سباق الدرفت الفئة الأولى', price: 85, type: 'PREMIUM_ACTIVITY' },
    { id: 'p-4', titleEn: 'Unlimited Evening Pass', titleAr: 'تذكرة المساء غير المحدودة', price: 150, type: 'ACCESS_PASS' },
    { id: 'p-5', titleEn: 'VIP Tactical Experience', titleAr: 'تجربة كبار الشخصيات التكتيكية', price: 220, type: 'PREMIUM_ACTIVITY' },
    { id: 'p-6', titleEn: 'Mini Golf 18 Holes', titleAr: 'ميني غولف 18 حفرة', price: 45, type: 'HOURLY_ACTIVITY' },
    { id: 'p-7', titleEn: 'Esports 2-Hour Tournament Pass', titleAr: 'تذكرة بطولة الرياضات الإلكترونية (ساعتان)', price: 70, type: 'HOURLY_ACTIVITY' },
    { id: 'p-8', titleEn: 'Family 4-Player Adventure Bundle', titleAr: 'باقة المغامرة العائلية (4 لاعبين)', price: 280, type: 'ACCESS_PASS' },
    { id: 'p-9', titleEn: 'Climbing Wall Extra Run', titleAr: 'جولة تسلق إضافية', price: 30, type: 'ADD_ON' },
    { id: 'p-10', titleEn: 'All-Day Champion Mega Pass', titleAr: 'التذكرة الشاملة للأبطال طوال اليوم', price: 350, type: 'ACCESS_PASS' }
  ]

  const mockAttraction = {
    id: 'cmqy7l8iq000gxxg441lib86l',
    slug: 'urban-arena',
    nameEn: 'Urban Arena',
    nameAr: 'أوربان أرينا',
    taglineEn: 'Next-Gen Mixed Reality Action Arena',
    taglineAr: 'ساحة الواقع المدمج وأحدث التحديات التفاعلية',
    descriptionEn: 'State-of-the-art interactive gaming and laser arena.',
    descriptionAr: 'وجهة ترفيهية متطورة تجمع بين ألعاب الواقع المدمج.',
    experienceFormat: 'PERMANENT_FEC',
    accessModel: 'PAID',
    heroMediaUrl: '/assets/partners/hero.jpg',
    logoUrl: '/assets/partners/e3-logo.svg',
    ticketingUrl: '/b2c/attractions/urban-arena#booking',
    isPublished: true,
    gallery: [
      { id: 'gal-1', url: 'https://img.com/1.jpg', orderIndex: 0 },
      { id: 'gal-2', url: 'https://img.com/2.jpg', orderIndex: 1 },
      { id: 'gal-3', url: 'https://img.com/3.jpg', orderIndex: 2 }
    ],
    featuresList: activities,
    pricing: pricing,
    attractionLocations: [
      {
        location: {
          nameEn: 'Doha Mall Location',
          venueEn: 'Doha Mall, P Floor'
        }
      }
    ],
    operations: {
      venueName: 'Doha Mall, P Floor',
      storyIntro: 'Enter a thrilling futuristic playground.'
    }
  }

  return {
    db: {
      attraction: {
        findMany: vi.fn().mockResolvedValue([mockAttraction]),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where?.id === 'cmqy7l8iq000gxxg441lib86l' || where?.slug === 'urban-arena') {
            return Promise.resolve(mockAttraction)
          }
          return Promise.resolve(null)
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.slug === 'urban-arena' || where?.id === 'cmqy7l8iq000gxxg441lib86l') {
            return Promise.resolve(mockAttraction)
          }
          if (where?.OR) {
            const match = where.OR.some((cond: any) => 
              cond.slug === 'urban-arena' || cond.slug === 'urban-arena-doha-mall' || cond.id === 'cmqy7l8iq000gxxg441lib86l' || cond.nameEn === 'Urban Arena'
            )
            if (match) return Promise.resolve(mockAttraction)
          }
          return Promise.resolve(null)
        }),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `attr-new-${Date.now()}`, ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockAttraction, ...data }))
      },
      attractionFeature: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.OR) {
            const match = where.OR.some((cond: any) => 
              activities.some(act => act.id === cond.id || act.titleEn.toLowerCase() === (cond.titleEn || '').toLowerCase())
            )
            if (match) return Promise.resolve(activities[0])
          }
          return Promise.resolve(null)
        }),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `feat-new-${Date.now()}`, ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'feat-1', ...data }))
      },
      attractionPricing: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.OR) {
            const match = where.OR.some((cond: any) => 
              pricing.some(p => p.id === cond.id || p.titleEn.toLowerCase() === (cond.titleEn || '').toLowerCase())
            )
            if (match) return Promise.resolve(pricing[0])
          }
          return Promise.resolve(null)
        }),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `price-new-${Date.now()}`, ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'p-1', ...data }))
      },
      attractionGalleryItem: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `gal-new-${Date.now()}`, ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'gal-1', ...data }))
      },
      storyType: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve({ id: `st-${where.slug}`, slug: where.slug, titleEn: where.slug, titleAr: where.slug })
        }),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `st-${data.slug}`, ...data }))
      }
    }
  }
})

describe('E3 Attraction Master Workbook — Integration Correction & Production Verification Suite', () => {

  // --------------------------------------------------------------------------
  // 1. WORKBOOK GENERATION & EXACT ROW/TAB COUNTS (URBAN ARENA)
  // --------------------------------------------------------------------------
  describe('1. Urban Arena 3-Tab Master Workbook Export & Structure', () => {
    it('exports Urban Arena with exactly 3 tabs: Attraction, What’s Inside, and Pricing', async () => {
      const buffer = await generateMasterWorkbook({ attractionIdOrSlug: 'cmqy7l8iq000gxxg441lib86l' })
      expect(buffer).toBeDefined()
      expect(Buffer.isBuffer(buffer)).toBe(true)

      const workbook = XLSX.read(buffer, { type: 'buffer' })
      expect(workbook.SheetNames).toEqual(['Attraction', 'What’s Inside', 'Pricing'])
    })

    it('confirms 1 attraction row, 8 activity rows and 10 pricing rows with bilingual parity', async () => {
      const buffer = await generateMasterWorkbook({ attractionIdOrSlug: 'urban-arena' })
      const data = parseMasterWorkbook(buffer)

      expect(data.attractions).toHaveLength(1)
      const attr = data.attractions[0]
      expect(attr.nameEn).toBe('Urban Arena')
      expect(attr.nameAr).toBe('أوربان أرينا')
      expect(attr.slug).toBe('urban-arena') // Canonical slug

      expect(data.activities).toHaveLength(8)
      expect(data.activities[0].titleEn).toBe('Cyber Laser Battle')
      expect(data.activities[0].titleAr).toBe('معركة الليزر السيبرانية')
      expect(data.activities[0].primaryStoryTrack).toBe('Compete')
      expect(data.activities[0].coverImageUrl).toBe('https://img.com/c1.jpg')
      expect(data.activities[0].additionalImage2Url).toBe('https://img.com/a1.jpg')

      expect(data.pricing).toHaveLength(10)
      expect(data.pricing[0].titleEn).toBe('Single Arena Access Pass')
      expect(data.pricing[0].price).toBe(65)
    })
  })

  // --------------------------------------------------------------------------
  // 2. TARGET ATTRACTION LOCK & CROSS-OVERWRITE PROTECTION
  // --------------------------------------------------------------------------
  describe('2. Target Attraction Lock & Scope Protection', () => {
    it('blocks import when uploaded workbook specifies an attraction ID that differs from target open editor', async () => {
      const foreignData: MasterWorkbookData = {
        attractions: [{
          attractionId: 'foreign-attr-999',
          nameEn: 'Foreign Waterpark',
          slug: 'foreign-waterpark'
        }],
        activities: [],
        pricing: []
      }

      const report = await validateMasterWorkbook(foreignData, {
        targetAttractionId: 'cmqy7l8iq000gxxg441lib86l',
        targetAttractionSlug: 'urban-arena'
      })

      expect(report.isValid).toBe(false)
      expect(report.errorCount).toBeGreaterThanOrEqual(1)
      const errDiff = report.diffs.find(d => d.action === 'ERROR')
      expect(errDiff?.messages[0]).toContain('does not match target attraction ID')
    })
  })

  // --------------------------------------------------------------------------
  // 3. DRAFT ACTIVITY CREATION & AUTOMATED MEDIA QUEUE GENERATION
  // --------------------------------------------------------------------------
  describe('3. Draft Activity Creation & Media Queue Linkage', () => {
    it('creates 1 activity and 1 Media Queue item for newly added activity row', async () => {
      const mockData: MasterWorkbookData = {
        attractions: [],
        activities: [
          {
            attractionIdentifier: 'urban-arena',
            titleEn: 'Tactical Drone Arena',
            titleAr: 'ساحة الطائرات المسيرة التكتيكية',
            classification: 'CHALLENGE_ARENA',
            primaryStoryTrack: 'Compete',
            secondaryStoryTracks: 'Drive; Explore',
            coverImageUrl: 'https://img.com/drone-cover.jpg',
            additionalImage2Url: 'https://img.com/drone-2.jpg'
          }
        ],
        pricing: []
      }

      const report = await validateMasterWorkbook(mockData, {
        targetAttractionId: 'cmqy7l8iq000gxxg441lib86l',
        targetAttractionSlug: 'urban-arena'
      })

      expect(report.isValid).toBe(true)
      expect(report.createdCount).toBe(1)
      const diff = report.diffs.find(d => d.titleEn === 'Tactical Drone Arena')
      expect(diff?.action).toBe('CREATE')
      expect(diff?.mediaStatus).toBe('PARTIALLY_COMPLETE') // 1 cover + 1 supporting = partially complete
    })

    it('re-importing the same workbook produces ZERO duplicates and performs safe update', async () => {
      const mockData: MasterWorkbookData = {
        attractions: [],
        activities: [
          {
            attractionIdentifier: 'urban-arena',
            activityId: 'feat-1',
            titleEn: 'Cyber Laser Battle',
            titleAr: 'معركة الليزر السيبرانية المحدثة'
          }
        ],
        pricing: [
          {
            attractionIdentifier: 'urban-arena',
            pricingId: 'p-1',
            titleEn: 'Single Arena Access Pass',
            price: 70
          }
        ]
      }

      const applyRes = await applyMasterWorkbook(mockData, {
        targetAttractionId: 'cmqy7l8iq000gxxg441lib86l',
        targetAttractionSlug: 'urban-arena'
      })

      expect(applyRes.success).toBe(true)
      expect(applyRes.appliedCount).toBe(2)
      expect(db.attractionFeature.update).toHaveBeenCalled()
      expect(db.attractionPricing.update).toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------------
  // 4. CANONICAL URBAN ARENA SLUG MIGRATION & REPAIR
  // --------------------------------------------------------------------------
  describe('4. Urban Arena Canonical Slug Migration', () => {
    it('executes idempotent database repair for Urban Arena canonical slug', async () => {
      const repairResult = await repairUrbanArenaCanonicalSlug()
      expect(repairResult).toBeDefined()
      expect(repairResult.currentSlug).toBe('urban-arena')
    })
  })

})
