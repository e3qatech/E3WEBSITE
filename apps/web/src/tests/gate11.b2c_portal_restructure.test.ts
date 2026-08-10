import { describe, it, expect } from 'vitest'
import { resolveAvailabilityStatus, resolveBookingUrl, filterAttractionsByUrlParams } from '../lib/cms-attractions'
import { DEFAULT_OUR_BRANDS } from '../lib/cms-brands'
import { DEFAULT_CORE_TEAM } from '../lib/cms-team'

describe('Gate 11: E3 B2C Portal Restructure & Data Integrity', () => {
  const sampleAttractions = [
    {
      id: 'attr-1',
      slug: 'kids-driving-school',
      nameEn: 'Kids City Driving School',
      nameAr: 'مدينة قيادة الأطفال',
      storyTypes: ['drive', 'learn'],
      category: 'FAMILY',
      status: 'ACTIVE',
      bookingMode: 'BOOKINGQUBE_PRODUCT',
      bookingProductId: 'bq-prod-101',
      capacity: 100,
      currentOccupancy: 45,
      availabilitySource: 'BOOKINGQUBE',
      lastUpdatedTime: new Date().toISOString(),
      freshnessThresholdMinutes: 60,
    },
    {
      id: 'attr-2',
      slug: 'inflatapark',
      nameEn: 'InflataPark',
      nameAr: 'إنفلاتابارك',
      storyTypes: ['bounce', 'compete'],
      category: 'INFLATABLE',
      status: 'ACTIVE',
      bookingMode: 'EXTERNAL_URL',
      bookingUrl: 'https://inflatapark.qa/tickets',
      availabilitySource: 'NONE',
    },
  ]

  it('1. should resolve canonical booking URLs correctly', () => {
    const url1 = resolveBookingUrl(sampleAttractions[0], 'en')
    expect(url1).toBe('/en/b2c/tickets?product=bq-prod-101')

    const url2 = resolveBookingUrl(sampleAttractions[1], 'ar')
    expect(url2).toBe('https://inflatapark.qa/tickets')
  })

  it('2. should calculate honest availability status without fake percentages when source is NONE', () => {
    const status = resolveAvailabilityStatus(sampleAttractions[1])
    expect(status.isFresh).toBe(false)
    expect(status.displayLabelEn).toBe('Check Availability')
    expect(status.displayLabelAr).toBe('التحقق من التوفر')
  })

  it('3. should calculate percentage when live source is configured and fresh', () => {
    const status = resolveAvailabilityStatus(sampleAttractions[0])
    expect(status.isFresh).toBe(true)
    expect(status.percentage).toBe(45)
    expect(status.displayLabelEn).toBe('45% Capacity')
  })

  it('4. should filter attractions by URL parameters (?story=drive)', () => {
    const filtered = filterAttractionsByUrlParams(sampleAttractions, { story: 'drive' })
    expect(filtered.length).toBe(1)
    expect(filtered[0].slug).toBe('kids-driving-school')
  })

  it('5. should filter attractions by search query', () => {
    const filtered = filterAttractionsByUrlParams(sampleAttractions, { search: 'InflataPark' })
    expect(filtered.length).toBe(1)
    expect(filtered[0].slug).toBe('inflatapark')
  })

  it('6. should verify Core Team dataset contains no unsupported seed profiles', () => {
    const names = DEFAULT_CORE_TEAM.map(m => m.nameEn)
    expect(names).not.toContain('Sheikh Nasser Al-Thani')
    expect(names).not.toContain('Tarik Hassan')
    expect(names).not.toContain('Fatima Al-Kuwari')
  })

  it('7. should verify Our Brands dataset contains no public "100% E3 Owned" claim', () => {
    DEFAULT_OUR_BRANDS.forEach(brand => {
      expect((brand as any).publicClaim).toBeUndefined()
      expect(brand.relationship).toBeDefined()
    })
  })
})
