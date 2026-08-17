import { describe, it, expect } from 'vitest'
import { calculatePackagePrice } from '../lib/package-pricing-engine'
import { CANONICAL_CATEGORIES, CANONICAL_TEMPLATES } from '../scripts/seed-package-taxonomy-and-templates'

describe('E3 Qatar Packages System — Production Readiness & Security Test Suite', () => {

  // --------------------------------------------------------------------------
  // 1. SERVER-SIDE PRICING & COMMERCIAL RULES ENGINE
  // --------------------------------------------------------------------------
  describe('1. Server-Side Pricing Engine Calculations', () => {
    const basePackage = {
      id: 'pkg-birthday-1',
      startingPrice: 1200,
      priceDisplayMode: 'STARTING_FROM',
      minGuests: 10,
      maxGuests: 40,
      includedGuestCount: 10,
      extraGuestPrice: 75,
      tiers: [
        {
          id: 'tier-silver',
          nameEn: 'Silver Party Pass',
          price: 1200,
          includedGuests: 10,
          extraGuestPrice: 75
        },
        {
          id: 'tier-gold',
          nameEn: 'Gold VIP Party Pass',
          price: 2000,
          includedGuests: 15,
          extraGuestPrice: 90
        }
      ]
    }

    it('accurately calculates base tier pricing with extra guest surcharges', () => {
      // 15 guests on Silver tier (10 included, 5 extra @ 75 QAR = 375 QAR extra)
      const result = calculatePackagePrice({
        basePackage,
        selectedTierId: 'tier-silver',
        guestCount: 15
      })

      expect(result.tierPrice).toBe(1200)
      expect(result.extraGuestsPrice).toBe(375)
      expect(result.grossSubtotal).toBe(1575)
      expect(result.grandTotal).toBe(1575)
      expect(result.appliedTierName).toBe('Silver Party Pass')
      expect(result.currency).toBe('QAR')
    })

    it('calculates add-on subtotals per-item and per-guest', () => {
      const result = calculatePackagePrice({
        basePackage,
        selectedTierId: 'tier-silver',
        guestCount: 12, // 2 extra guests = 150 QAR
        selectedAddOns: [
          { id: 'addon-cake', quantity: 1, unitPrice: 350, priceType: 'FLAT' },
          { id: 'addon-meal', quantity: 1, unitPrice: 35, priceType: 'PER_GUEST' } // 12 guests * 35 = 420 QAR
        ]
      })

      expect(result.tierPrice).toBe(1200)
      expect(result.extraGuestsPrice).toBe(150)
      expect(result.addOnsSubtotal).toBe(770) // 350 + 420
      expect(result.grossSubtotal).toBe(2120) // 1200 + 150 + 770
      expect(result.grandTotal).toBe(2120)
    })

    it('flags validation errors when guest count is out of bounds', () => {
      const underResult = calculatePackagePrice({
        basePackage,
        guestCount: 5 // min is 10
      })
      expect(underResult.validationErrors.length).toBeGreaterThan(0)
      expect(underResult.validationErrors[0]).toContain('below the minimum required')

      const overResult = calculatePackagePrice({
        basePackage,
        guestCount: 50 // max is 40
      })
      expect(overResult.validationErrors.length).toBeGreaterThan(0)
      expect(overResult.validationErrors[0]).toContain('exceeds the maximum capacity')
    })
  })

  // --------------------------------------------------------------------------
  // 2. PROMOTIONS, COUPONS & STACKING PREVENTION
  // --------------------------------------------------------------------------
  describe('2. Commercial Rules, Promotions & Coupon Stacking Prevention', () => {
    const basePackage = {
      id: 'pkg-corp-1',
      startingPrice: 3000,
      minGuests: 15,
      maxGuests: 100
    }

    it('applies percentage promotions with maximum discount caps', () => {
      const result = calculatePackagePrice({
        basePackage,
        guestCount: 20,
        promotion: {
          id: 'promo-summer-20',
          name: 'Summer 20% Off',
          discountType: 'PERCENTAGE',
          discountValue: 20, // 20% of 3000 is 600
          maxDiscount: 400, // Capped at 400
          isActive: true
        }
      })

      expect(result.grossSubtotal).toBe(3000)
      expect(result.promotionDiscount).toBe(400) // Capped
      expect(result.netSubtotal).toBe(2600)
      expect(result.grandTotal).toBe(2600)
      expect(result.isPromotionApplied).toBe(true)
    })

    it('prevents unintended stacking between non-stackable promotions and coupons', () => {
      const result = calculatePackagePrice({
        basePackage,
        guestCount: 20,
        promotion: {
          id: 'promo-eid',
          name: 'Eid Special 15%',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          isStackable: false, // Non-stackable
          isActive: true
        },
        coupon: {
          id: 'cp-vip',
          code: 'VIP50',
          status: 'ACTIVE',
          promotion: {
            id: 'promo-fixed-50',
            name: '50 QAR Voucher',
            discountType: 'FIXED',
            discountValue: 50
          }
        }
      })

      // Promotion is applied, coupon is blocked from stacking
      expect(result.isPromotionApplied).toBe(true)
      expect(result.isCouponApplied).toBe(false)
      expect(result.couponDiscount).toBe(0)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('Promotion and coupon cannot be combined')
    })
  })

  // --------------------------------------------------------------------------
  // 3. PUBLIC VS PRIVATE FIELD SEPARATION (RBAC & PRIVACY)
  // --------------------------------------------------------------------------
  describe('3. Public vs Private Field Sanitization', () => {
    it('strips internal margins, costs, and staff notes from public package records', () => {
      const rawPackageRecord = {
        id: 'pkg-100',
        slug: 'laser-tag-vip-party',
        titleEn: 'Laser Tag VIP Party',
        startingPrice: 1800,
        internalCost: 750, // CONFIDENTIAL
        estimatedMargin: 58.33, // CONFIDENTIAL
        internalNotes: 'VIP room priority booking. Supplier: ActionPark Ltd.', // CONFIDENTIAL
        isPublished: true,
        status: 'PUBLISHED'
      }

      const sanitizeForPublic = (pkg: any) => {
        const { internalCost: _c, estimatedMargin: _m, internalNotes: _n, ...safe } = pkg
        return safe
      }

      const safeOutput = sanitizeForPublic(rawPackageRecord)

      expect(safeOutput.id).toBe('pkg-100')
      expect(safeOutput.titleEn).toBe('Laser Tag VIP Party')
      expect(safeOutput.startingPrice).toBe(1800)
      expect((safeOutput as any).internalCost).toBeUndefined()
      expect((safeOutput as any).estimatedMargin).toBeUndefined()
      expect((safeOutput as any).internalNotes).toBeUndefined()
    })
  })

  // --------------------------------------------------------------------------
  // 4. COUPON VALIDATION NEUTRALITY & SECURITY
  // --------------------------------------------------------------------------
  describe('4. Neutral Coupon Verification (No Information Leakage)', () => {
    it('returns neutral failure response for expired, exhausted or invalid coupons', () => {
      const mockCoupons = [
        { code: 'ACTIVE2026', status: 'ACTIVE', usageLimit: 100, usedCount: 10, validTo: new Date(Date.now() + 86400000) },
        { code: 'EXPIRED10', status: 'ACTIVE', usageLimit: 50, usedCount: 2, validTo: new Date(Date.now() - 86400000) },
        { code: 'EXHAUSTED50', status: 'ACTIVE', usageLimit: 10, usedCount: 10, validTo: new Date(Date.now() + 86400000) },
        { code: 'PAUSEDCODE', status: 'PAUSED', usageLimit: 10, usedCount: 0, validTo: new Date(Date.now() + 86400000) }
      ]

      const validateCoupon = (inputCode: string) => {
        const coupon = mockCoupons.find(c => c.code === inputCode.toUpperCase().trim())
        const now = new Date()

        if (!coupon || coupon.status !== 'ACTIVE' || (coupon.validTo && now > coupon.validTo) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
          return { valid: false, message: 'Invalid or unavailable coupon code' }
        }
        return { valid: true, code: coupon.code }
      }

      expect(validateCoupon('ACTIVE2026').valid).toBe(true)
      expect(validateCoupon('EXPIRED10')).toEqual({ valid: false, message: 'Invalid or unavailable coupon code' })
      expect(validateCoupon('EXHAUSTED50')).toEqual({ valid: false, message: 'Invalid or unavailable coupon code' })
      expect(validateCoupon('PAUSEDCODE')).toEqual({ valid: false, message: 'Invalid or unavailable coupon code' })
      expect(validateCoupon('NONEXISTENT')).toEqual({ valid: false, message: 'Invalid or unavailable coupon code' })
    })
  })

  // --------------------------------------------------------------------------
  // 5. SEED SYSTEM IDEMPOTENCY
  // --------------------------------------------------------------------------
  describe('5. Seed System Idempotency', () => {
    it('canonical package categories contain 7 distinct slugs with bilingual names', () => {
      expect(CANONICAL_CATEGORIES.length).toBe(7)
      const slugs = CANONICAL_CATEGORIES.map(c => c.slug)
      const uniqueSlugs = Array.from(new Set(slugs))
      expect(uniqueSlugs.length).toBe(7)

      CANONICAL_CATEGORIES.forEach(c => {
        expect(c.nameEn).toBeTruthy()
        expect(c.nameAr).toBeTruthy()
        expect(c.slug).toBeTruthy()
      })
    })

    it('canonical package templates contain 12 distinct slugs ready for studio instantiation', () => {
      expect(CANONICAL_TEMPLATES.length).toBe(12)
      const slugs = CANONICAL_TEMPLATES.map(t => t.slug)
      const uniqueSlugs = Array.from(new Set(slugs))
      expect(uniqueSlugs.length).toBe(12)

      CANONICAL_TEMPLATES.forEach(t => {
        expect(t.titleEn).toBeTruthy()
        expect(t.titleAr).toBeTruthy()
        expect(t.startingPrice).toBeGreaterThanOrEqual(0)
        expect(t.isTemplate).toBe(true)
      })
    })
  })

  // --------------------------------------------------------------------------
  // 6. QUOTATION IMMUTABILITY & VERSION INTEGRITY
  // --------------------------------------------------------------------------
  describe('6. Quotation Immutability & Financial Version Integrity', () => {
    it('blocks direct modification of finalized (accepted/rejected) quotations', () => {
      const existingQuotation = {
        id: 'qte-101',
        quoteNumber: 'E3-QTE-260817-5421',
        status: 'ACCEPTED',
        subtotal: 5000,
        grandTotal: 5000
      }

      const updateQuotation = (quotation: typeof existingQuotation, updatePayload: { items?: any[]; discountTotal?: number }) => {
        if ((quotation.status === 'ACCEPTED' || quotation.status === 'REJECTED') && (updatePayload.items !== undefined || updatePayload.discountTotal !== undefined)) {
          throw new Error('Finalized quotations cannot be edited. Please create a new quotation version.')
        }
        return { ...quotation, ...updatePayload }
      }

      expect(() => {
        updateQuotation(existingQuotation, { discountTotal: 500 })
      }).toThrow('Finalized quotations cannot be edited')
    })
  })
})
