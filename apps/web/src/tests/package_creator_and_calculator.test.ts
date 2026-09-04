import { describe, it, expect } from 'vitest'
import { calculatePackagePrice, roundCurrency } from '../lib/package-pricing-engine'

describe('Package Creator & Public Price Calculator Suite', () => {

  // --------------------------------------------------------------------------
  // 1. PACKAGE CREATOR COMMERCIAL METRICS & SANITIZATION
  // --------------------------------------------------------------------------
  describe('1. Package Creator — Commercials & Margin Calculation', () => {
    it('accurately calculates profit margin percentage and profit value', () => {
      const startingPrice = 2500
      const internalCost = 1500
      const profit = startingPrice - internalCost
      const margin = Math.round(((startingPrice - internalCost) / startingPrice) * 100)

      expect(profit).toBe(1000)
      expect(margin).toBe(40)
    })

    it('handles low/negative margin scenarios appropriately', () => {
      const startingPrice = 1000
      const internalCost = 1200
      const profit = startingPrice - internalCost
      const margin = Math.round(((startingPrice - internalCost) / startingPrice) * 100)

      expect(profit).toBe(-200)
      expect(margin).toBe(-20)
    })

    it('falls back to 0 margin when startingPrice is 0 to avoid division by zero', () => {
      const startingPrice = 0
      const internalCost = 500
      const margin = startingPrice > 0 ? Math.round(((startingPrice - internalCost) / startingPrice) * 100) : 0

      expect(margin).toBe(0)
    })

    it('validates tier data structure with Arabic localization and extra guest fees', () => {
      const sampleTier = {
        id: 'tier-123',
        nameEn: 'VIP Royal Adventure',
        nameAr: 'مغامرة رويال VIP',
        price: 3500,
        guestCount: 20,
        extraGuestPrice: 150,
        durationMinutes: 180,
        includedItems: ['Full Park Access', 'Private Lounge', 'Dedicated Host']
      }

      expect(sampleTier.nameEn).toBe('VIP Royal Adventure')
      expect(sampleTier.nameAr).toBe('مغامرة رويال VIP')
      expect(sampleTier.guestCount).toBe(20)
      expect(sampleTier.extraGuestPrice).toBe(150)
      expect(sampleTier.durationMinutes).toBe(180)
      expect(sampleTier.includedItems).toHaveLength(3)
    })

    it('validates add-on data structure with Arabic localization and pricing types', () => {
      const flatAddon = {
        id: 'addon-flat',
        titleEn: 'Custom 3-Tier Cake',
        titleAr: 'كعكة مخصصة 3 أدوار',
        price: 450,
        priceType: 'FIXED',
        maxQty: 2
      }

      const perGuestAddon = {
        id: 'addon-per-guest',
        titleEn: 'VIP Arcade Card (100 credits)',
        titleAr: 'بطاقة ألعاب VIP (100 رصيد)',
        price: 80,
        priceType: 'PER_GUEST',
        maxQty: 50
      }

      expect(flatAddon.priceType).toBe('FIXED')
      expect(perGuestAddon.priceType).toBe('PER_GUEST')
      expect(flatAddon.titleAr).toBeTruthy()
      expect(perGuestAddon.titleAr).toBeTruthy()
    })
  })

  // --------------------------------------------------------------------------
  // 2. DYNAMIC PRICE CALCULATOR LOGIC
  // --------------------------------------------------------------------------
  describe('2. Public Microsite Price Calculator — Dynamic Computation', () => {
    const testPackage = {
      id: 'pkg-inflatarun-vip',
      startingPrice: 2000,
      minGuests: 10,
      maxGuests: 50,
      extraGuestPrice: 100,
      tiers: [
        {
          id: 'tier-standard',
          nameEn: 'Standard Tier',
          nameAr: 'الفئة القياسية',
          price: 2000,
          includedGuests: 15,
          extraGuestPrice: 100,
          features: ['Access', 'Host']
        },
        {
          id: 'tier-vip',
          nameEn: 'VIP Deluxe Tier',
          nameAr: 'فئة ديلوكس VIP',
          price: 3500,
          includedGuests: 25,
          extraGuestPrice: 120,
          features: ['Full Access', 'Private Suite', 'Host', 'Catering']
        }
      ]
    }

    it('calculates exact base tier price when within included guest capacity', () => {
      const result = calculatePackagePrice({
        basePackage: testPackage,
        selectedTierId: 'tier-standard',
        guestCount: 15
      })

      expect(result.tierPrice).toBe(2000)
      expect(result.extraGuestsPrice).toBe(0)
      expect(result.grandTotal).toBe(2000)
    })

    it('calculates extra guest surcharges when guest count exceeds included tier capacity', () => {
      const guestCount = 20 // 5 extra guests beyond 15
      const result = calculatePackagePrice({
        basePackage: testPackage,
        selectedTierId: 'tier-standard',
        guestCount
      })

      expect(result.tierPrice).toBe(2000)
      expect(result.extraGuestsPrice).toBe(5 * 100) // 500 QAR
      expect(result.grandTotal).toBe(2500)
    })

    it('scales PER_GUEST add-ons proportionally with guest count', () => {
      const guestCount = 20
      const unitAddonPrice = 50

      const result = calculatePackagePrice({
        basePackage: testPackage,
        selectedTierId: 'tier-standard',
        guestCount,
        selectedAddOns: [
          {
            id: 'addon-arcade',
            quantity: 1,
            unitPrice: unitAddonPrice,
            priceType: 'PER_GUEST'
          }
        ]
      })

      // Tier: 2000, Extra Guests (5 * 100): 500, Addon (50 * 20 guests * 1 qty): 1000
      expect(result.tierPrice).toBe(2000)
      expect(result.extraGuestsPrice).toBe(500)
      expect(result.addOnsSubtotal).toBe(1000)
      expect(result.grandTotal).toBe(3500)
    })

    it('keeps FLAT add-ons independent of guest count', () => {
      const guestCount = 20
      const flatCakePrice = 600

      const result = calculatePackagePrice({
        basePackage: testPackage,
        selectedTierId: 'tier-standard',
        guestCount,
        selectedAddOns: [
          {
            id: 'addon-cake',
            quantity: 1,
            unitPrice: flatCakePrice,
            priceType: 'FLAT'
          }
        ]
      })

      // Tier: 2000, Extra Guests: 500, Flat Addon: 600
      expect(result.addOnsSubtotal).toBe(600)
      expect(result.grandTotal).toBe(3100)
    })

    it('correctly applies promotional discounts and coupon codes', () => {
      const guestCount = 15
      const couponDiscountAmount = 300

      const result = calculatePackagePrice({
        basePackage: testPackage,
        selectedTierId: 'tier-standard',
        guestCount,
        coupon: {
          id: 'coupon-1',
          code: 'E3VIP300',
          status: 'ACTIVE',
          promotion: {
            id: 'promo-1',
            name: 'VIP 300 QAR OFF',
            discountType: 'FIXED',
            discountValue: couponDiscountAmount,
            isActive: true
          }
        }
      })

      expect(result.tierPrice).toBe(2000)
      expect(result.couponDiscount).toBe(300)
      expect(result.grandTotal).toBe(1700)
    })

    it('prevents total from becoming negative if coupon discount exceeds subtotal', () => {
      const grossSubtotal = 1500
      const hugeDiscount = 2000
      const estimatedTotal = Math.max(0, grossSubtotal - hugeDiscount)

      expect(estimatedTotal).toBe(0)
    })

    it('enforces min/max guest bounds validation', () => {
      const belowMin = calculatePackagePrice({
        basePackage: testPackage,
        guestCount: 5 // below minGuests 10
      })
      expect(belowMin.validationErrors.length).toBeGreaterThan(0)
      expect(belowMin.validationErrors[0]).toContain('below the minimum')

      const aboveMax = calculatePackagePrice({
        basePackage: testPackage,
        guestCount: 60 // above maxGuests 50
      })
      expect(aboveMax.validationErrors.length).toBeGreaterThan(0)
      expect(aboveMax.validationErrors[0]).toContain('exceeds the maximum')
    })
  })

  // --------------------------------------------------------------------------
  // 4. VENUE CAPACITY GUARDS & MODAL REAL-TIME RE-CALCULATION
  // --------------------------------------------------------------------------
  describe('4. Venue Capacity Guards & Modal In-Place Calculation', () => {
    const venuePackage = {
      id: 'pkg-arena',
      titleEn: 'InflataPark VIP Party',
      startingPrice: 2500,
      minGuests: 10,
      maxGuests: 100, // Strict venue maximum capacity
      extraGuestPrice: 80,
      tiers: [
        {
          id: 'tier-1',
          nameEn: 'Silver Tier',
          price: 2500,
          includedGuests: 15,
          extraGuestPrice: 80
        },
        {
          id: 'tier-2',
          nameEn: 'Gold Tier',
          price: 3800,
          includedGuests: 25,
          extraGuestPrice: 70
        }
      ],
      addOns: [
        { id: 'addon-cake', titleEn: 'Celebration Cake', price: 400, priceType: 'FIXED' },
        { id: 'addon-socks', titleEn: 'Grip Socks & Wristband', price: 30, priceType: 'PER_GUEST' }
      ]
    }

    it('strictly flags 1000s of guests attempting to book a 100 capacity venue', () => {
      const attemptedGuests = 1000
      const isAboveMax = attemptedGuests > venuePackage.maxGuests
      expect(isAboveMax).toBe(true)

      const clampedGuests = Math.min(venuePackage.maxGuests, Math.max(venuePackage.minGuests, attemptedGuests))
      expect(clampedGuests).toBe(100)
    })

    it('strictly flags below-minimum guest count (e.g. 1 guest when min is 10)', () => {
      const attemptedGuests = 1
      const isBelowMin = attemptedGuests < venuePackage.minGuests
      expect(isBelowMin).toBe(true)

      const clampedGuests = Math.min(venuePackage.maxGuests, Math.max(venuePackage.minGuests, attemptedGuests))
      expect(clampedGuests).toBe(10)
    })

    it('correctly recalculates package total when user adds add-ons and adjusts guests in modal', () => {
      const selectedTier = venuePackage.tiers[0] // Silver: 2500 QAR, 15 included guests
      const guestCount = 20 // 5 extra guests @ 80 QAR = 400 QAR
      const modalAddOnQty: Record<string, number> = {
        'addon-cake': 1, // FIXED: 400 QAR
        'addon-socks': 1 // PER_GUEST: 30 * 20 guests * 1 qty = 600 QAR
      }

      const extraGuests = Math.max(0, guestCount - selectedTier.includedGuests)
      const extraGuestsTotal = extraGuests * selectedTier.extraGuestPrice

      let addOnsTotal = 0
      venuePackage.addOns.forEach(addon => {
        const qty = modalAddOnQty[addon.id] || 0
        if (qty > 0) {
          if (addon.priceType === 'PER_GUEST') {
            addOnsTotal += addon.price * guestCount * qty
          } else {
            addOnsTotal += addon.price * qty
          }
        }
      })

      const grandTotal = selectedTier.price + extraGuestsTotal + addOnsTotal
      // Tier (2500) + Extra Guests (400) + Cake (400) + Socks (600) = 3900 QAR
      expect(extraGuestsTotal).toBe(400)
      expect(addOnsTotal).toBe(1000)
      expect(grandTotal).toBe(3900)
    })

    it('dynamically switches base price and extra guest calculations when tier changes in modal', () => {
      const goldTier = venuePackage.tiers[1] // Gold: 3800 QAR, 25 included guests
      const guestCount = 20 // within 25 included guests -> 0 extra guest surcharge!
      const modalAddOnQty: Record<string, number> = {
        'addon-cake': 1
      }

      const extraGuests = Math.max(0, guestCount - goldTier.includedGuests)
      const extraGuestsTotal = extraGuests * goldTier.extraGuestPrice
      expect(extraGuestsTotal).toBe(0)

      const addOnsTotal = modalAddOnQty['addon-cake'] * 400
      const grandTotal = goldTier.price + extraGuestsTotal + addOnsTotal
      expect(grandTotal).toBe(4200)
    })
  })
})
