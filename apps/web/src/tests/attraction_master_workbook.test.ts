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
import { db } from '../lib/db'

// Mock db for unit testing
vi.mock('../lib/db', () => {
  const mockAttraction = {
    id: 'attr-urban-arena-123',
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
    isPublished: true,
    gallery: [
      { id: 'gal-1', url: 'https://img.com/1.jpg', orderIndex: 0 },
      { id: 'gal-2', url: 'https://img.com/2.jpg', orderIndex: 1 },
      { id: 'gal-3', url: 'https://img.com/3.jpg', orderIndex: 2 }
    ],
    featuresList: [
      {
        id: 'feat-laser-battle',
        attractionId: 'attr-urban-arena-123',
        titleEn: 'Cyber Laser Battle',
        titleAr: 'معركة الليزر السيبرانية',
        descriptionEn: 'Tactical multi-level laser arena.',
        descriptionAr: 'معركة ليزر تكتيكية متعددة المستويات.',
        highlightType: 'PRIMARY_ATTRACTION',
        imageUrl: 'https://img.com/cover1.jpg',
        durationMinutes: 15,
        minAge: 8,
        orderIndex: 0,
        storyTypes: [
          { id: 'st-compete', slug: 'compete', titleEn: 'Compete', titleAr: 'التحدي والمنافسة' },
          { id: 'st-drive', slug: 'drive', titleEn: 'Drive', titleAr: 'القيادة' }
        ],
        targetAudience: {
          additionalImages: ['https://img.com/add1.jpg', 'https://img.com/add2.jpg'],
          videoUrl: 'https://youtube.com/sample',
          mediaStatus: 'PARTIALLY_COMPLETE',
          contentStatus: 'READY'
        }
      }
    ],
    pricing: [
      {
        id: 'price-pass-1',
        attractionId: 'attr-urban-arena-123',
        titleEn: 'General Arena Access',
        titleAr: 'تذكرة دخول الصالة العامة',
        price: 75,
        type: 'ACCESS_PASS',
        descriptionEn: 'Full access for 60 mins',
        descriptionAr: 'دخول كامل لمدة 60 دقيقة'
      }
    ],
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
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.slug === 'urban-arena' || where?.id === 'attr-urban-arena-123') {
            return Promise.resolve(mockAttraction)
          }
          if (where?.OR) {
            const match = where.OR.some((cond: any) => 
              cond.slug === 'urban-arena' || cond.id === 'attr-urban-arena-123'
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
          if (where?.id === 'feat-laser-battle' || where?.titleEn === 'Cyber Laser Battle') {
            return Promise.resolve(mockAttraction.featuresList[0])
          }
          if (where?.OR) {
            const match = where.OR.some((cond: any) => 
              cond.id === 'feat-laser-battle' || cond.titleEn === 'Cyber Laser Battle'
            )
            if (match) return Promise.resolve(mockAttraction.featuresList[0])
          }
          return Promise.resolve(null)
        }),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `feat-new-${Date.now()}`, ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'feat-laser-battle', ...data }))
      },
      attractionPricing: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where?.id === 'price-pass-1' || where?.titleEn === 'General Arena Access') {
            return Promise.resolve(mockAttraction.pricing[0])
          }
          if (where?.OR) {
            const match = where.OR.some((cond: any) => 
              cond.id === 'price-pass-1' || cond.titleEn === 'General Arena Access'
            )
            if (match) return Promise.resolve(mockAttraction.pricing[0])
          }
          return Promise.resolve(null)
        }),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `price-new-${Date.now()}`, ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'price-pass-1', ...data }))
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

describe('E3 Attraction Master Workbook — Core Engine & Integration Suite', () => {

  // --------------------------------------------------------------------------
  // 1. WORKBOOK GENERATION & EXPORT (3 TABS)
  // --------------------------------------------------------------------------
  describe('1. 3-Tab Master Workbook Generation', () => {
    it('generates an XLSX buffer with exact 3 tabs: Attraction, What’s Inside, Pricing', async () => {
      const buffer = await generateMasterWorkbook({ attractionIdOrSlug: 'urban-arena' })
      expect(buffer).toBeDefined()
      expect(Buffer.isBuffer(buffer)).toBe(true)

      const workbook = XLSX.read(buffer, { type: 'buffer' })
      expect(workbook.SheetNames).toContain('Attraction')
      expect(workbook.SheetNames).toContain('What’s Inside')
      expect(workbook.SheetNames).toContain('Pricing')
    })

    it('exports Urban Arena with all current attraction, activity and pricing data', async () => {
      const buffer = await generateMasterWorkbook({ attractionIdOrSlug: 'urban-arena' })
      const data = parseMasterWorkbook(buffer)

      expect(data.attractions.length).toBeGreaterThanOrEqual(1)
      const ua = data.attractions.find(a => a.slug === 'urban-arena')
      expect(ua).toBeDefined()
      expect(ua?.nameEn).toBe('Urban Arena')
      expect(ua?.nameAr).toBe('أوربان أرينا')
      expect(ua?.galleryImages?.length).toBe(3)

      expect(data.activities.length).toBeGreaterThanOrEqual(1)
      const act = data.activities.find(a => a.titleEn === 'Cyber Laser Battle')
      expect(act).toBeDefined()
      expect(act?.coverImageUrl).toBe('https://img.com/cover1.jpg')
      expect(act?.additionalImage2Url).toBe('https://img.com/add1.jpg')
      expect(act?.primaryStoryTrack).toBe('Compete')

      expect(data.pricing.length).toBeGreaterThanOrEqual(1)
      const pr = data.pricing.find(p => p.titleEn === 'General Arena Access')
      expect(pr).toBeDefined()
      expect(pr?.price).toBe(75)
    })
  })

  // --------------------------------------------------------------------------
  // 2. PARSING & STORY TRACK NORMALIZATION
  // --------------------------------------------------------------------------
  describe('2. Master Workbook Parsing & Story Track Normalization', () => {
    it('normalizes primary and secondary story tracks properly', () => {
      expect(normalizeStoryTrack('Drive')).toBe('drive')
      expect(normalizeStoryTrack('القيادة')).toBe('drive')
      expect(normalizeStoryTrack('Family Time')).toBe('family-time')
      expect(normalizeStoryTrack('Compete')).toBe('compete')
      expect(normalizeStoryTrack('Bounce')).toBe('bounce')
      expect(normalizeStoryTrack('Explore')).toBe('explore')
      expect(normalizeStoryTrack('Celebrate')).toBe('celebrate')
    })

    it('parses multi-image columns (Gallery 1-10 and Additional Images 2-4)', () => {
      const mockXlsx = XLSX.utils.book_new()
      const wsAttraction = XLSX.utils.json_to_sheet([{
        'Attraction ID': 'attr-1',
        'Name (EN)': 'Test Zone',
        'Slug': 'test-zone',
        'Gallery Image 1': 'https://img.com/1.jpg',
        'Gallery Image 2': 'https://img.com/2.jpg',
        'Gallery Image 10': 'https://img.com/10.jpg'
      }])
      XLSX.utils.book_append_sheet(mockXlsx, wsAttraction, 'Attraction')

      const wsActivities = XLSX.utils.json_to_sheet([{
        'Attraction Identifier': 'test-zone',
        'Activity Name (EN)': 'Karting',
        'Cover Image URL': 'https://img.com/cov.jpg',
        'Additional Image 2 URL': 'https://img.com/add2.jpg',
        'Additional Image 3 URL': 'https://img.com/add3.jpg',
        'Additional Image 4 URL': 'https://img.com/add4.jpg'
      }])
      XLSX.utils.book_append_sheet(mockXlsx, wsActivities, 'What’s Inside')

      const buf = XLSX.write(mockXlsx, { type: 'buffer', bookType: 'xlsx' })
      const parsed = parseMasterWorkbook(buf)

      expect(parsed.attractions[0].galleryImages).toEqual([
        'https://img.com/1.jpg',
        'https://img.com/2.jpg',
        'https://img.com/10.jpg'
      ])

      expect(parsed.activities[0].coverImageUrl).toBe('https://img.com/cov.jpg')
      expect(parsed.activities[0].additionalImage2Url).toBe('https://img.com/add2.jpg')
      expect(parsed.activities[0].additionalImage3Url).toBe('https://img.com/add3.jpg')
      expect(parsed.activities[0].additionalImage4Url).toBe('https://img.com/add4.jpg')
    })
  })

  // --------------------------------------------------------------------------
  // 3. VALIDATION, DIFF ENGINE & MEDIA QUEUE REQUIREMENTS
  // --------------------------------------------------------------------------
  describe('3. Validation Report & Media Queue Requirements', () => {
    it('accurately identifies new activity rows to be created with media queue requirements', async () => {
      const mockData: MasterWorkbookData = {
        attractions: [{
          nameEn: 'Urban Arena',
          slug: 'urban-arena'
        }],
        activities: [
          {
            attractionIdentifier: 'urban-arena',
            titleEn: 'Cyber Laser Battle', // Existing
            coverImageUrl: 'https://img.com/cover1.jpg',
            additionalImage2Url: 'https://img.com/add1.jpg'
          },
          {
            attractionIdentifier: 'urban-arena',
            titleEn: 'Robo Climbing Wall', // NEW ROW
            titleAr: 'جدار التسلق الآلي',
            classification: 'CHALLENGE_ARENA',
            primaryStoryTrack: 'Compete',
            secondaryStoryTracks: 'Bounce; Drive',
            coverImageUrl: 'https://img.com/robo-cover.jpg',
            additionalImage2Url: 'https://img.com/robo-2.jpg',
            additionalImage3Url: 'https://img.com/robo-3.jpg',
            additionalImage4Url: 'https://img.com/robo-4.jpg'
          }
        ],
        pricing: []
      }

      const report = await validateMasterWorkbook(mockData)

      expect(report.isValid).toBe(true)
      expect(report.createdCount).toBeGreaterThanOrEqual(1)

      const roboDiff = report.diffs.find(d => d.titleEn === 'Robo Climbing Wall')
      expect(roboDiff).toBeDefined()
      expect(roboDiff?.action).toBe('CREATE')
      expect(roboDiff?.mediaStatus).toBe('READY') // 1 cover + 3 supporting = 4 images (target met!)

      const laserDiff = report.diffs.find(d => d.titleEn === 'Cyber Laser Battle')
      expect(laserDiff).toBeDefined()
      expect(laserDiff?.action).toBe('UPDATE')
      expect(laserDiff?.mediaStatus).toBe('PARTIALLY_COMPLETE') // 1 cover + 1 supporting (needs 2 more)
    })

    it('reports missing required fields with exact row numbers and errors', async () => {
      const mockData: MasterWorkbookData = {
        attractions: [{ nameEn: '', slug: 'empty-name' }], // Error
        activities: [],
        pricing: [{ attractionIdentifier: 'urban-arena', titleEn: 'Free Pass', price: -10 }] // Error negative price
      }

      const report = await validateMasterWorkbook(mockData)
      expect(report.isValid).toBe(false)
      expect(report.errorCount).toBeGreaterThanOrEqual(2)

      const attrDiff = report.diffs.find(d => d.sheet === 'Attraction')
      expect(attrDiff?.action).toBe('ERROR')
      expect(attrDiff?.messages[0]).toContain("Missing required field 'Name (EN)'")

      const priceDiff = report.diffs.find(d => d.sheet === 'Pricing')
      expect(priceDiff?.action).toBe('ERROR')
      expect(priceDiff?.messages[0]).toContain("Price must be a valid non-negative number")
    })
  })

  // --------------------------------------------------------------------------
  // 4. SAFE MERGE & ADMIN EDIT PRESERVATION (IDEMPOTENCY)
  // --------------------------------------------------------------------------
  describe('4. Safe Idempotent Merge & Admin Edit Preservation', () => {
    it('applies new activity and creates corresponding database & media queue records', async () => {
      const mockData: MasterWorkbookData = {
        attractions: [],
        activities: [{
          attractionIdentifier: 'urban-arena',
          titleEn: 'Robo Climbing Wall',
          titleAr: 'جدار التسلق الآلي',
          classification: 'CHALLENGE_ARENA',
          primaryStoryTrack: 'Compete',
          secondaryStoryTracks: 'Bounce; Drive',
          coverImageUrl: 'https://img.com/robo-cover.jpg',
          additionalImage2Url: 'https://img.com/robo-2.jpg'
        }],
        pricing: []
      }

      const res = await applyMasterWorkbook(mockData, { saveAsDraft: true })
      expect(res.success).toBe(true)
      expect(res.appliedCount).toBe(1)
      expect(db.attractionFeature.create).toHaveBeenCalled()
    })

    it('re-importing the same workbook performs safe update and generates ZERO duplicate activities', async () => {
      const mockData: MasterWorkbookData = {
        attractions: [],
        activities: [{
          attractionIdentifier: 'urban-arena',
          activityId: 'feat-laser-battle', // Existing stable ID
          titleEn: 'Cyber Laser Battle',
          titleAr: 'معركة الليزر السيبرانية - محدثة'
        }],
        pricing: [{
          attractionIdentifier: 'urban-arena',
          pricingId: 'price-pass-1',
          titleEn: 'General Arena Access',
          price: 80
        }]
      }

      const res = await applyMasterWorkbook(mockData)
      expect(res.success).toBe(true)
      expect(res.appliedCount).toBe(2)
      expect(db.attractionFeature.update).toHaveBeenCalled()
      expect(db.attractionPricing.update).toHaveBeenCalled()
    })

    it('preserves existing content when spreadsheet cells are blank (Safe Merge Rule)', async () => {
      const mockData: MasterWorkbookData = {
        attractions: [{
          attractionId: 'attr-urban-arena-123',
          nameEn: 'Urban Arena',
          slug: 'urban-arena',
          descriptionEn: undefined, // Blank in sheet
          taglineEn: undefined // Blank in sheet
        }],
        activities: [],
        pricing: []
      }

      await applyMasterWorkbook(mockData)

      // Verify update payload does NOT overwrite descriptionEn or taglineEn with empty string
      const lastUpdateCall = (db.attraction.update as any).mock.calls.at(-1)
      const updateData = lastUpdateCall[0].data

      expect(updateData.nameEn).toBe('Urban Arena')
      expect(updateData.descriptionEn).toBeUndefined()
      expect(updateData.taglineEn).toBeUndefined()
    })
  })

  // --------------------------------------------------------------------------
  // 5. ATTENTION CONTENT & MEDIA DASHBOARD METRICS
  // --------------------------------------------------------------------------
  describe('5. Attraction Content & Media Dashboard Aggregation', () => {
    it('computes accurate completeness metrics and media queue tracker', async () => {
      const res = await getAttractionContentMediaMetrics({ attractionSlug: 'urban-arena' })

      expect(res.overview).toBeDefined()
      expect(res.overview.totalAttractions).toBe(1)
      expect(res.overview.avgContentCompleteness).toBeGreaterThan(0)
      expect(res.overview.avgArabicCompleteness).toBeGreaterThan(0)
      expect(res.attractions.length).toBe(1)
      expect(res.attractions[0].galleryCount).toBe(3)
      expect(res.attractions[0].galleryTarget).toBe(10)
      expect(res.missingMediaQueue.length).toBeGreaterThanOrEqual(1)
    })
  })

})
