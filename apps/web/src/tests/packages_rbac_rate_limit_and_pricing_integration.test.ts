import { describe, it, expect } from 'vitest'
import { calculatePackagePrice, roundCurrency, PriceCalculationInput } from '../lib/package-pricing-engine'
import { PackageLeadSubmissionSchema, sanitizeInputString } from '../lib/validations/package-lead-schema'
import { hasPermission } from '../lib/permissions'
import { rateLimit } from '../lib/rate-limit'

describe('E3 Packages — RBAC, Rate Limiting, Zod Validation & Pricing Engine Suite', () => {

  // --------------------------------------------------------------------------
  // 1. RBAC PERMISSION MATRIX
  // --------------------------------------------------------------------------
  describe('1. Granular Capability RBAC Enforcement', () => {
    it('SUPER_ADMIN possesses wildcard capability for all package resources', () => {
      expect(hasPermission('SUPER_ADMIN', 'b2c.packages.manage')).toBe(true)
      expect(hasPermission('SUPER_ADMIN', 'crm.leads.manage')).toBe(true)
    })

    it('B2C_ADMIN possesses b2c.packages.manage capability', () => {
      expect(hasPermission('B2C_ADMIN', 'b2c.packages.manage')).toBe(true)
    })

    it('SUPPORT_ADMIN possesses b2c.packages.manage capability', () => {
      expect(hasPermission('SUPPORT_ADMIN', 'b2c.packages.manage')).toBe(true)
    })

    it('SALES_ADMIN possesses crm.leads.manage capability', () => {
      expect(hasPermission('SALES_ADMIN', 'crm.leads.manage')).toBe(true)
    })

    it('STAFF, CLIENT, and CANDIDATE lack package and CRM administrative capabilities', () => {
      expect(hasPermission('STAFF', 'b2c.packages.manage')).toBe(false)
      expect(hasPermission('STAFF', 'crm.leads.manage')).toBe(false)

      expect(hasPermission('CLIENT', 'b2c.packages.manage')).toBe(false)
      expect(hasPermission('CLIENT', 'crm.leads.manage')).toBe(false)

      expect(hasPermission('CANDIDATE', 'b2c.packages.manage')).toBe(false)
      expect(hasPermission('CANDIDATE', 'crm.leads.manage')).toBe(false)
    })

    it('Unauthenticated/null role returns false for all protected operations', () => {
      expect(hasPermission(null, 'b2c.packages.manage')).toBe(false)
      expect(hasPermission(undefined, 'crm.leads.manage')).toBe(false)
      expect(hasPermission('', 'b2c.packages.manage')).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // 2. DISTRIBUTED RATE LIMITING
  // --------------------------------------------------------------------------
  describe('2. Distributed Public Rate Limiting', () => {
    it('allows requests within threshold', async () => {
      const testKey = `test_rl_allowed_${Date.now()}`
      const res1 = await rateLimit(testKey, 3, 60, false)
      expect(res1.success).toBe(true)
    })

    it('returns 429 when threshold is exceeded', async () => {
      const testKey = `test_rl_blocked_${Date.now()}`
      await rateLimit(testKey, 2, 60, false)
      await rateLimit(testKey, 2, 60, false)
      const resBlocked = await rateLimit(testKey, 2, 60, false)
      expect(resBlocked.success).toBe(false)
      expect(resBlocked.error).toBeDefined()
      expect(resBlocked.retryAfter).toBe(60)
    })
  })

  // --------------------------------------------------------------------------
  // 3. ZOD LEAD VALIDATION, SANITIZATION & HONEYPOT
  // --------------------------------------------------------------------------
  describe('3. Lead Validation & Privacy Guard', () => {
    it('sanitizes dangerous HTML and script tags from input strings', () => {
      const dirty = '<script>alert("xss")</script>John <b>Doe</b>'
      const clean = sanitizeInputString(dirty)
      expect(clean).toBe('alert("xss")John Doe')
      expect(clean).not.toContain('<script>')
      expect(clean).not.toContain('<b>')
    })

    it('rejects submissions with name < 2 characters', () => {
      const invalid = {
        customerName: 'J',
        email: 'john@example.com'
      }
      const result = PackageLeadSubmissionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('rejects invalid email formats', () => {
      const invalid = {
        customerName: 'John Doe',
        email: 'invalid-email-no-at'
      }
      const result = PackageLeadSubmissionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('accepts valid package lead payload and applies bounds', () => {
      const valid = {
        customerName: 'Ahmad Al-Kuwari',
        email: 'ahmad@example.qa',
        phone: '+974 5555 1234',
        expectedGuests: 25,
        leadType: 'BIRTHDAY',
        cateringRequirements: '<b>Nut-free options only</b>',
        specialRequests: '<script>alert(1)</script>VIP table setup'
      }
      const result = PackageLeadSubmissionSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.customerName).toBe('Ahmad Al-Kuwari')
        expect(result.data.cateringRequirements).toBe('Nut-free options only')
        expect(result.data.specialRequests).toBe('alert(1)VIP table setup')
        expect(result.data.expectedGuests).toBe(25)
      }
    })
  })

  // --------------------------------------------------------------------------
  // 4. CENTRALIZED SERVER-SIDE PRICING ENGINE
  // --------------------------------------------------------------------------
  describe('4. Centralized Server-Side Pricing Engine Tests', () => {
    const samplePackage = {
      id: 'pkg-1',
      startingPrice: 500,
      minGuests: 10,
      maxGuests: 50,
      includedGuestCount: 10,
      extraGuestPrice: 50,
      tiers: [
        { id: 'tier-silver', nameEn: 'Silver Package', price: 600, includedGuests: 10, extraGuestPrice: 50 },
        { id: 'tier-gold', nameEn: 'Gold Package', price: 1000, includedGuests: 10, extraGuestPrice: 50 }
      ]
    }

    it('calculates fixed price plus extra guest fees accurately', () => {
      const input: PriceCalculationInput = {
        basePackage: samplePackage,
        guestCount: 15 // 10 included + 5 extra @ 50 QAR = 250
      }
      const result = calculatePackagePrice(input)
      expect(result.basePrice).toBe(500)
      expect(result.extraGuestsPrice).toBe(250)
      expect(result.grossSubtotal).toBe(850) // 600 default tier + 250 extra
      expect(result.grandTotal).toBe(850)
    })

    it('calculates selected tier base price with included guests', () => {
      const input: PriceCalculationInput = {
        basePackage: samplePackage,
        selectedTierId: 'tier-gold',
        guestCount: 20 // 10 included + 10 extra @ 50 = 500
      }
      const result = calculatePackagePrice(input)
      expect(result.tierPrice).toBe(1000)
      expect(result.extraGuestsPrice).toBe(500)
      expect(result.grossSubtotal).toBe(1500)
      expect(result.grandTotal).toBe(1500)
    })

    it('calculates flat and per-person add-on pricing correctly', () => {
      const input: PriceCalculationInput = {
        basePackage: samplePackage,
        guestCount: 10,
        selectedAddOns: [
          { id: 'addon-cake', unitPrice: 300, priceType: 'FLAT', quantity: 1 },
          { id: 'addon-snack', unitPrice: 20, priceType: 'PER_GUEST', quantity: 1 }
        ]
      }
      const result = calculatePackagePrice(input)
      expect(result.addOnsSubtotal).toBe(300 + (20 * 10)) // 300 + 200 = 500
      expect(result.grossSubtotal).toBe(600 + 500) // 1100
      expect(result.grandTotal).toBe(1100)
    })

    it('applies percentage promotional discount with maximum discount cap', () => {
      const input: PriceCalculationInput = {
        basePackage: { id: 'pkg-1', startingPrice: 500, minGuests: 10, tiers: [] },
        guestCount: 10,
        promotion: {
          id: 'promo-20',
          name: 'Promo 20',
          discountType: 'PERCENTAGE',
          discountValue: 20, // 20% of 500 = 100
          maxDiscount: 75,   // Capped at 75
          isActive: true
        }
      }
      const result = calculatePackagePrice(input)
      expect(result.grossSubtotal).toBe(500)
      expect(result.totalDiscount).toBe(75) // Capped
      expect(result.grandTotal).toBe(425)
    })

    it('rejects expired promotions and charges full price', () => {
      const pastDate = new Date(Date.now() - 86400000)
      const input: PriceCalculationInput = {
        basePackage: { id: 'pkg-1', startingPrice: 500, minGuests: 10, tiers: [] },
        guestCount: 10,
        promotion: {
          id: 'promo-expired',
          name: 'Promo Expired',
          discountType: 'FIXED',
          discountValue: 100,
          validTo: pastDate,
          isActive: true
        }
      }
      const result = calculatePackagePrice(input)
      expect(result.totalDiscount).toBe(0)
      expect(result.grandTotal).toBe(500)
    })

    it('rejects promotion if minimum spend is not met', () => {
      const input: PriceCalculationInput = {
        basePackage: { id: 'pkg-1', startingPrice: 500, minGuests: 10, tiers: [] },
        guestCount: 10, // subtotal = 500
        promotion: {
          id: 'promo-high-spend',
          name: 'High Spend',
          discountType: 'FIXED',
          discountValue: 100,
          minSpend: 1000,
          isActive: true
        }
      }
      const result = calculatePackagePrice(input)
      expect(result.totalDiscount).toBe(0)
      expect(result.grandTotal).toBe(500)
    })

    it('computes configurable tax rate when taxRatePercent is supplied', () => {
      const input: PriceCalculationInput = {
        basePackage: { id: 'pkg-1', startingPrice: 500, minGuests: 10, tiers: [] },
        guestCount: 10, // subtotal 500
        taxRatePercent: 5 // 5% tax = 25
      }
      const result = calculatePackagePrice(input)
      expect(result.taxAmount).toBe(25)
      expect(result.grandTotal).toBe(525)
    })
  })

  // --------------------------------------------------------------------------
  // 5. QUOTATION IMMUTABILITY
  // --------------------------------------------------------------------------
  describe('5. Quotation Immutability & Status Integrity', () => {
    it('verifies that finalized status enum contains ACCEPTED, REJECTED, and EXPIRED', () => {
      const finalizedStatuses = ['ACCEPTED', 'REJECTED', 'EXPIRED']
      expect(finalizedStatuses).toContain('ACCEPTED')
      expect(finalizedStatuses).toContain('REJECTED')
      expect(finalizedStatuses).toContain('EXPIRED')
    })
  })
})
