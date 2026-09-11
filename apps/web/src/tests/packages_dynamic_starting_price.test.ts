import { describe, it, expect } from 'vitest'
import { calculatePackageStartingPrice } from '@/lib/package-pricing-engine'

describe('calculatePackageStartingPrice Commercial Engine Unit Tests', () => {
  it('correctly resolves lowest tier price (85 QAR) for Kidz Driving School when hardcoded startingPrice is 140', () => {
    const kdsPackage = {
      id: 'cmtbyz13f000111v7m1qnhty9',
      slug: 'kidz-driving-school-birthday-packages',
      titleEn: 'Kidz Driving School Birthday Packages',
      startingPrice: 140, // Buggy / hardcoded stale value in DB
      priceDisplayMode: 'PER_GUEST',
      tiers: [
        {
          id: 'tier-1787861964189',
          nameEn: 'Package 1 – One-Hour Driving Party',
          price: 85
        },
        {
          id: 'tier-1787861964535',
          nameEn: 'Package 2 – Two-Hour Driving Party',
          price: 110
        },
        {
          id: 'tier-1787861964955',
          nameEn: 'Driving and Inflata Combo',
          price: 185
        }
      ]
    }

    const effectivePrice = calculatePackageStartingPrice(kdsPackage)
    expect(effectivePrice).toBe(85)
  })

  it('correctly resolves tier price when tier prices are stored as numeric strings', () => {
    const pkg = {
      startingPrice: 200,
      tiers: [
        { price: '95' },
        { price: '150' }
      ]
    }

    expect(calculatePackageStartingPrice(pkg)).toBe(95)
  })

  it('falls back to pkg.startingPrice when tiers array is empty', () => {
    const pkg = {
      startingPrice: 1200,
      tiers: []
    }

    expect(calculatePackageStartingPrice(pkg)).toBe(1200)
  })

  it('falls back to pkg.startingPrice when tiers is null or undefined', () => {
    const pkgWithoutTiers = {
      startingPrice: 99,
      tiers: null
    }

    expect(calculatePackageStartingPrice(pkgWithoutTiers)).toBe(99)
  })

  it('handles null, undefined, or missing input safely by returning 0', () => {
    expect(calculatePackageStartingPrice(null)).toBe(0)
    expect(calculatePackageStartingPrice(undefined)).toBe(0)
    expect(calculatePackageStartingPrice({})).toBe(0)
    expect(calculatePackageStartingPrice({ startingPrice: null, tiers: [] })).toBe(0)
  })

  it('filters out invalid or zero prices in tiers and selects lowest positive price', () => {
    const pkg = {
      startingPrice: 500,
      tiers: [
        { price: 0 },
        { price: -10 },
        { price: null },
        { price: 85 },
        { price: 120 }
      ]
    }

    expect(calculatePackageStartingPrice(pkg)).toBe(85)
  })

  it('falls back to startingPrice if all tiers have non-positive or invalid prices', () => {
    const pkg = {
      startingPrice: 350,
      tiers: [
        { price: 0 },
        { price: -20 }
      ]
    }

    expect(calculatePackageStartingPrice(pkg)).toBe(350)
  })
})
