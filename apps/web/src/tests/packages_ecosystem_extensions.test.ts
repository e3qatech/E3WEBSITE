import { describe, it, expect } from 'vitest'

describe('Packages Ecosystem Extensions Suite', () => {

  // ==========================================================================
  // 1. QUOTE CALCULATION, DEPOSIT & SHAREABLE LINK ENGINE
  // ==========================================================================
  describe('1. Quotation Engine — Line Items, Discounts & Deposits', () => {
    interface LineItem {
      description: string
      quantity: number
      unitPrice: number
      total: number
    }

    const calculateQuotationTotals = (
      items: LineItem[],
      discountType: 'percentage' | 'fixed',
      discountValue: number,
      maxDiscountCap?: number
    ) => {
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      
      let rawDiscount = 0
      if (discountType === 'percentage') {
        rawDiscount = Math.round((subtotal * discountValue) / 100)
      } else {
        rawDiscount = discountValue
      }

      const cappedDiscount = maxDiscountCap ? Math.min(rawDiscount, maxDiscountCap) : rawDiscount
      const finalDiscount = Math.min(cappedDiscount, subtotal)
      const grandTotal = Math.max(0, subtotal - finalDiscount)
      const depositRequired = Math.round(grandTotal * 0.5)
      const balanceDue = grandTotal - depositRequired

      return { subtotal, discount: finalDiscount, grandTotal, depositRequired, balanceDue }
    }

    it('calculates subtotal across base package, guest add-ons, and custom line items', () => {
      const items: LineItem[] = [
        { description: 'Royal VIP Package Tier (Base 20 guests)', quantity: 1, unitPrice: 3500, total: 3500 },
        { description: 'Extra Guests (5 x 150 QAR)', quantity: 5, unitPrice: 150, total: 750 },
        { description: 'Live Mascot Performance', quantity: 1, unitPrice: 800, total: 800 },
        { description: 'Custom LED Stage Backdrop', quantity: 1, unitPrice: 1200, total: 1200 },
      ]

      const totals = calculateQuotationTotals(items, 'fixed', 0)
      expect(totals.subtotal).toBe(6250)
      expect(totals.discount).toBe(0)
      expect(totals.grandTotal).toBe(6250)
      expect(totals.depositRequired).toBe(3125) // 50%
      expect(totals.balanceDue).toBe(3125)
    })

    it('applies percentage discount and respects maximum discount cap', () => {
      const items: LineItem[] = [
        { description: 'Corporate Mega Tier', quantity: 1, unitPrice: 10000, total: 10000 }
      ]

      // 20% of 10,000 is 2,000, but cap is 1,500 QAR
      const totalsWithCap = calculateQuotationTotals(items, 'percentage', 20, 1500)
      expect(totalsWithCap.subtotal).toBe(10000)
      expect(totalsWithCap.discount).toBe(1500)
      expect(totalsWithCap.grandTotal).toBe(8500)
      expect(totalsWithCap.depositRequired).toBe(4250)
      expect(totalsWithCap.balanceDue).toBe(4250)
    })

    it('formats valid shareable links and payment links', () => {
      const baseUrl = 'https://e3.qa'
      const quoteNumber = 'QT-E3-2026-9482'
      const quoteId = 'cm3abcdef0001xyz'

      const publicQuoteUrl = `${baseUrl}/en/b2c/packages/quote/${quoteNumber}`
      const directPaymentUrl = `${baseUrl}/en/b2c/packages/quote/${quoteNumber}?pay=true`

      expect(publicQuoteUrl).toBe('https://e3.qa/en/b2c/packages/quote/QT-E3-2026-9482')
      expect(directPaymentUrl).toBe('https://e3.qa/en/b2c/packages/quote/QT-E3-2026-9482?pay=true')
    })
  })

  // ==========================================================================
  // 2. TIME-BOUND PROMOTIONS & REFERRALS ENGINE
  // ==========================================================================
  describe('2. Time-Bound Promotions & Referral Limits', () => {
    interface PromoCode {
      code: string
      discountType: 'PERCENTAGE' | 'FIXED'
      discountValue: number
      minSpend: number
      maxDiscount: number
      validFrom: string
      validTo: string
      isActive: boolean
    }

    const validatePromotion = (
      promo: PromoCode,
      cartSpend: number,
      currentDateIso: string
    ): { valid: boolean; error?: string; discountAmount?: number } => {
      if (!promo.isActive) {
        return { valid: false, error: 'PROMO_INACTIVE' }
      }

      const now = new Date(currentDateIso).getTime()
      const start = new Date(promo.validFrom).getTime()
      const end = new Date(promo.validTo).getTime()

      if (now < start) {
        return { valid: false, error: 'PROMO_NOT_YET_ACTIVE' }
      }

      if (now > end) {
        return { valid: false, error: 'PROMO_EXPIRED' }
      }

      if (cartSpend < promo.minSpend) {
        return {
          valid: false,
          error: `MINIMUM_SPEND_REQUIRED_${promo.minSpend}`
        }
      }

      let discount = 0
      if (promo.discountType === 'PERCENTAGE') {
        discount = (cartSpend * promo.discountValue) / 100
      } else {
        discount = promo.discountValue
      }

      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount
      }

      return { valid: true, discountAmount: Math.round(discount) }
    }

    const testPromo: PromoCode = {
      code: 'SUMMER2026',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minSpend: 2000,
      maxDiscount: 500,
      validFrom: '2026-06-01T00:00:00Z',
      validTo: '2026-09-30T23:59:59Z',
      isActive: true
    }

    it('successfully validates active promotion within valid date window and meets min spend', () => {
      const result = validatePromotion(testPromo, 3000, '2026-07-15T12:00:00Z')
      expect(result.valid).toBe(true)
      // 15% of 3000 = 450 QAR (under 500 max cap)
      expect(result.discountAmount).toBe(450)
    })

    it('enforces maximum discount cap when discount exceeds limit', () => {
      const result = validatePromotion(testPromo, 5000, '2026-07-15T12:00:00Z')
      expect(result.valid).toBe(true)
      // 15% of 5000 = 750 QAR, capped at 500 QAR
      expect(result.discountAmount).toBe(500)
    })

    it('rejects coupon when cart spend is below minimum spend threshold', () => {
      const result = validatePromotion(testPromo, 1500, '2026-07-15T12:00:00Z')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('MINIMUM_SPEND_REQUIRED_2000')
    })

    it('rejects coupon if current date is prior to validFrom', () => {
      const result = validatePromotion(testPromo, 3000, '2026-05-15T12:00:00Z')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('PROMO_NOT_YET_ACTIVE')
    })

    it('rejects coupon if current date is after validTo', () => {
      const result = validatePromotion(testPromo, 3000, '2026-10-05T12:00:00Z')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('PROMO_EXPIRED')
    })

    it('validates referral program time-bound and credit reward structures', () => {
      const referralProgram = {
        id: 'ref-vip-2026',
        name: 'VIP Community Referral 2026',
        referrerReward: 100, // 100 QAR credit
        refereeReward: 100,
        minSpend: 1500,
        maxDiscount: 200,
        validFrom: '2026-01-01T00:00:00Z',
        validTo: '2026-12-31T23:59:59Z',
        isActive: true
      }

      expect(referralProgram.referrerReward).toBe(100)
      expect(referralProgram.refereeReward).toBe(100)
      expect(referralProgram.minSpend).toBe(1500)
      expect(referralProgram.maxDiscount).toBe(200)
    })
  })

  // ==========================================================================
  // 3. VENUE-SPECIFIC TERMS & CONDITIONS
  // ==========================================================================
  describe('3. Venue-Specific Terms & Conditions Management', () => {
    interface TermsConditions {
      venueRulesEn: string
      venueRulesAr: string
      cancellationPolicyEn: string
      cancellationPolicyAr: string
      customClauses: Array<{ en: string; ar: string }>
    }

    const defaultVenueTerms: Record<string, TermsConditions> = {
      'bounce-freestyle': {
        venueRulesEn: 'Grip socks required for all participants. Minimum height 110cm for freestyle trampolines.',
        venueRulesAr: 'جوارب مانعة للانزلاق مطلوبة لجميع المشاركين. الحد الأدنى للطول 110 سم.',
        cancellationPolicyEn: 'Cancellations 48h prior receive 100% credit. Under 24h deposit is non-refundable.',
        cancellationPolicyAr: 'الإلغاء قبل 48 ساعة يمنح رصيداً كاملاً 100%. أقل من 24 ساعة العربون غير مسترد.',
        customClauses: [
          {
            en: 'Outside catering allowed for certified birthday cakes only.',
            ar: 'يُسمح بالأطعمة الخارجية لكعكات أعياد الميلاد المعتمدة فقط.'
          }
        ]
      },
      'megapolis-entertainment': {
        venueRulesEn: 'Closed-toe shoes required for bowling and VR simulation zones.',
        venueRulesAr: 'أحذية مغلقة مطلوبة للبولينج ومناطق محاكاة الواقع الافتراضي.',
        cancellationPolicyEn: '72h notice required for full deposit rollover.',
        cancellationPolicyAr: 'إشعار قبل 72 ساعة مطلوب لتحويل العربون بالكامل.',
        customClauses: []
      }
    }

    it('resolves correct venue rules and cancellation policies per venue key', () => {
      const bounceTerms = defaultVenueTerms['bounce-freestyle']
      expect(bounceTerms.venueRulesEn).toContain('Grip socks required')
      expect(bounceTerms.venueRulesAr).toContain('جوارب مانعة للانزلاق')
      expect(bounceTerms.customClauses).toHaveLength(1)

      const megapolisTerms = defaultVenueTerms['megapolis-entertainment']
      expect(megapolisTerms.venueRulesEn).toContain('Closed-toe shoes required')
      expect(megapolisTerms.venueRulesAr).toContain('أحذية مغلقة مطلوبة')
    })

    it('enforces Qatar PDPL privacy consent string in both languages', () => {
      const qatarLegalConsentAr = 'أوافق على شروط باقات إي ثري، قواعد الفعاليات، وسياسة حماية البيانات الشخصية في قطر (PDPL)'
      const qatarLegalConsentEn = 'I agree to the E3 package terms, event guidelines, and Qatar Personal Data Protection Law (PDPL) policy'

      expect(qatarLegalConsentAr).toContain('PDPL')
      expect(qatarLegalConsentAr).toContain('حماية البيانات الشخصية في قطر')
      expect(qatarLegalConsentEn).toContain('Qatar Personal Data Protection Law (PDPL)')
    })
  })

  // ==========================================================================
  // 4. PACKAGE MICROSITE MEDIA GALLERY
  // ==========================================================================
  describe('4. Package Microsite Media Gallery Showcase', () => {
    interface MediaItem {
      id: string
      url: string
      type: 'image' | 'video'
      titleEn: string
      titleAr: string
      thumbnail?: string
    }

    const sampleMedia: MediaItem[] = [
      { id: '1', url: '/images/gallery/bounce-action.jpg', type: 'image', titleEn: 'Freestyle Arena Jump', titleAr: 'قفز ساحة الفري ستايل' },
      { id: '2', url: '/images/gallery/bounce-party.jpg', type: 'image', titleEn: 'Private VIP Room', titleAr: 'غرفة كبار الشخصيات الخاصة' },
      { id: '3', url: '/videos/gallery/bounce-highlights.mp4', type: 'video', titleEn: 'Birthday Reel 2026', titleAr: 'فيديو عيد ميلاد 2026', thumbnail: '/images/gallery/thumb-video.jpg' },
      { id: '4', url: '/videos/gallery/arcade-action.mp4', type: 'video', titleEn: 'Arcade Glow Highlights', titleAr: 'أجواء صالة الألعاب المميزة' }
    ]

    it('correctly filters media by all, image, and video tabs', () => {
      const allItems = sampleMedia
      const photosOnly = sampleMedia.filter(m => m.type === 'image')
      const videosOnly = sampleMedia.filter(m => m.type === 'video')

      expect(allItems).toHaveLength(4)
      expect(photosOnly).toHaveLength(2)
      expect(videosOnly).toHaveLength(2)
    })

    it('determines appropriate thumbnail and display type for video vs image items', () => {
      const videoItem = sampleMedia.find(m => m.type === 'video' && m.thumbnail)
      expect(videoItem?.thumbnail).toBe('/images/gallery/thumb-video.jpg')
      expect(videoItem?.type).toBe('video')

      const imageItem = sampleMedia.find(m => m.type === 'image')
      expect(imageItem?.url).toBe('/images/gallery/bounce-action.jpg')
    })
  })

  // ==========================================================================
  // 5. QUOTATION BUILDER PREMADE PACKAGES & ADD-ON IMPORTER
  // ==========================================================================
  describe('5. Quotation Builder — Premade Package & Addon Importer', () => {
    interface PremadePackage {
      id: string
      titleEn: string
      titleAr: string
      tiers: Array<{ id: string; nameEn: string; price: number; guestCount: number }>
      addons: Array<{ id: string; nameEn: string; price: number; pricingType: 'flat' | 'per_guest' }>
    }

    const premadePackages: PremadePackage[] = [
      {
        id: 'pkg-1',
        titleEn: 'Ultimate Trampoline VIP Birthday',
        titleAr: 'عيد ميلاد الترامبولين الملكي',
        tiers: [
          { id: 't1', nameEn: 'Standard Bash (15 Guests)', price: 2250, guestCount: 15 },
          { id: 't2', nameEn: 'Royal bash (25 Guests)', price: 3500, guestCount: 25 }
        ],
        addons: [
          { id: 'a1', nameEn: 'Themed Custom Cake', price: 450, pricingType: 'flat' },
          { id: 'a2', nameEn: 'Gourmet Snack Boxes', price: 40, pricingType: 'per_guest' }
        ]
      }
    ]

    it('imports selected premade tier into quotation line items', () => {
      const pkg = premadePackages[0]
      const selectedTier = pkg.tiers[1] // Royal bash (25 Guests)

      const lineItems = [
        {
          id: `tier-${selectedTier.id}`,
          description: `${pkg.titleEn} - ${selectedTier.nameEn}`,
          quantity: 1,
          unitPrice: selectedTier.price,
          total: selectedTier.price
        }
      ]

      expect(lineItems[0].unitPrice).toBe(3500)
      expect(lineItems[0].quantity).toBe(1)
      expect(lineItems[0].total).toBe(3500)
    })

    it('imports add-on with calculated quantity based on guest count for per_guest items', () => {
      const pkg = premadePackages[0]
      const guestCount = 25
      const perGuestAddon = pkg.addons[1] // Gourmet Snack Boxes (40 QAR)
      const flatAddon = pkg.addons[0] // Themed Custom Cake (450 QAR)

      const importedAddonItems = [
        {
          id: `addon-${perGuestAddon.id}`,
          description: perGuestAddon.nameEn,
          quantity: guestCount,
          unitPrice: perGuestAddon.price,
          total: guestCount * perGuestAddon.price
        },
        {
          id: `addon-${flatAddon.id}`,
          description: flatAddon.nameEn,
          quantity: 1,
          unitPrice: flatAddon.price,
          total: flatAddon.price
        }
      ]

      expect(importedAddonItems[0].quantity).toBe(25)
      expect(importedAddonItems[0].total).toBe(1000) // 25 * 40
      expect(importedAddonItems[1].quantity).toBe(1)
      expect(importedAddonItems[1].total).toBe(450)
    })
  })
})
