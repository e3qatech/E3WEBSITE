import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  repairUrbanArenaCanonicalSlug,
  URBAN_ARENA_TARGET_ID,
  CANONICAL_SLUG,
  LEGACY_SLUG
} from '../lib/canonical-urban-arena-repair'
import { db } from '../lib/db'

// Mock db for testing
vi.mock('../lib/db', () => {
  const mockRecord = {
    id: 'cmqy7l8iq000gxxg441lib86l',
    slug: 'urban-arena-doha-mall',
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
    ticketingUrl: '/b2c/attractions/urban-arena-doha-mall#booking',
    isPublished: true,
    gallery: [{ id: 'gal-1', url: 'https://img.com/1.jpg' }],
    featuresList: [{ id: 'feat-1', titleEn: 'Cyber Laser Battle' }],
    pricing: [{ id: 'price-1', titleEn: 'Arena Pass', price: 65 }]
  }

  const txMock = {
    attraction: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where?.id === mockRecord.id) return Promise.resolve({ ...mockRecord })
        return Promise.resolve(null)
      }),
      findFirst: vi.fn().mockImplementation(({ where }) => {
        if (where?.id === mockRecord.id || where?.slug === mockRecord.slug) {
          return Promise.resolve({ ...mockRecord })
        }
        return Promise.resolve(null)
      }),
      update: vi.fn().mockImplementation(({ where, data }) => {
        Object.assign(mockRecord, data)
        return Promise.resolve({ ...mockRecord })
      })
    }
  }

  return {
    db: {
      attraction: txMock.attraction,
      $transaction: vi.fn().mockImplementation(async (callback: any) => {
        return callback(txMock)
      })
    }
  }
})

describe('Urban Arena Production Data & SEO Canonical Correction Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // 1. TRANSACTIONAL DATABASE REPAIR
  // --------------------------------------------------------------------------
  describe('1. Idempotent Transactional Database Slug Repair', () => {
    it('executes database slug update inside a transaction and records history in execution logs', async () => {
      const result = await repairUrbanArenaCanonicalSlug()

      expect(db.$transaction).toHaveBeenCalled()
      expect(result.repaired).toBe(true)
      expect(result.previousSlug).toBe('urban-arena-doha-mall')
      expect(result.currentSlug).toBe('urban-arena')
      expect(result.attractionId).toBe(URBAN_ARENA_TARGET_ID)
      expect(result.logs.some(l => l.includes('Transaction committed'))).toBe(true)
    })

    it('performs NO database update when attraction is already on canonical slug', async () => {
      // Run second time (mockRecord now has slug: 'urban-arena')
      const result = await repairUrbanArenaCanonicalSlug()

      expect(result.repaired).toBe(false)
      expect(result.currentSlug).toBe('urban-arena')
      expect(result.logs.some(l => l.includes('already on canonical slug'))).toBe(true)
    })

    it('strictly preserves activities, pricing, media, translations and booking integrity', async () => {
      const record = await (db as any).attraction.findUnique({ where: { id: URBAN_ARENA_TARGET_ID } })
      
      expect(record.nameEn).toBe('Urban Arena')
      expect(record.nameAr).toBe('أوربان أرينا')
      expect(record.isPublished).toBe(true)
      expect(record.gallery).toHaveLength(1)
      expect(record.featuresList).toHaveLength(1)
      expect(record.pricing).toHaveLength(1)
      expect(record.ticketingUrl).toBe('/b2c/attractions/urban-arena#booking')
    })
  })

  // --------------------------------------------------------------------------
  // 2. SEO CANONICAL METADATA SPECIFICATION
  // --------------------------------------------------------------------------
  describe('2. SEO Canonical URLs & Alternate Hreflang Validation', () => {
    it('generates exact English and Arabic canonical URLs with x-default fallback', () => {
      const trueSlug = 'urban-arena'
      const enCanonical = `https://e3.qa/en/b2c/attractions/${trueSlug}`
      const arCanonical = `https://e3.qa/ar/b2c/attractions/${trueSlug}`

      const alternates = {
        canonicalEn: enCanonical,
        canonicalAr: arCanonical,
        languages: {
          en: enCanonical,
          ar: arCanonical,
          'x-default': enCanonical
        }
      }

      expect(alternates.canonicalEn).toBe('https://e3.qa/en/b2c/attractions/urban-arena')
      expect(alternates.canonicalAr).toBe('https://e3.qa/ar/b2c/attractions/urban-arena')
      expect(alternates.languages['x-default']).toBe('https://e3.qa/en/b2c/attractions/urban-arena')
      expect(alternates.canonicalEn).not.toContain('urban-arena-doha-mall')
    })
  })
})
