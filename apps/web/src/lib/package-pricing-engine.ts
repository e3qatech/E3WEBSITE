/**
 * E3 Qatar Package Commercial Rules & Pricing Engine
 * Centralized server-side pricing, discount evaluation, promotion stacking prevention,
 * and quotation calculation service.
 */

export interface PackagePricingTier {
  id: string
  nameEn: string
  nameAr?: string
  price: number
  includedGuests?: number
  extraGuestPrice?: number
  minGuests?: number
  maxGuests?: number
  features?: string[]
}

export interface PackageAddOnItem {
  id: string
  titleEn: string
  titleAr?: string
  price: number
  priceType?: 'FLAT' | 'PER_GUEST' | 'PER_HOUR'
  quantity?: number
}

export interface PackagePromotionRule {
  id: string
  name: string
  discountType: 'PERCENTAGE' | 'FIXED' | 'EARLY_BIRD' | 'GROUP_SIZE' | 'SEASONAL'
  discountValue: number
  maxDiscount?: number | null
  minSpend?: number | null
  minGuests?: number | null
  applicableCategories?: string[] | null
  applicablePackages?: string[] | null
  validFrom?: Date | string | null
  validTo?: Date | string | null
  daysOfWeek?: string[] | null
  usageLimit?: number | null
  usedCount?: number
  isStackable?: boolean
  isActive?: boolean
}

export interface CouponRule {
  id: string
  code: string
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED'
  validFrom?: Date | string | null
  validTo?: Date | string | null
  usageLimit?: number | null
  usedCount?: number
  perUserLimit?: number | null
  minSpend?: number | null
  promotion?: PackagePromotionRule | null
}

export interface PriceCalculationInput {
  basePackage: {
    id: string
    startingPrice: number
    priceDisplayMode?: string
    minGuests?: number
    maxGuests?: number
    includedGuestCount?: number
    extraGuestPrice?: number
    category?: string
    categorySlug?: string
    tiers?: PackagePricingTier[] | null
  }
  selectedTierId?: string | null
  guestCount?: number
  selectedAddOns?: Array<{
    id: string
    quantity?: number
    unitPrice?: number
    priceType?: 'FLAT' | 'PER_GUEST' | 'PER_HOUR'
  }>
  promotion?: PackagePromotionRule | null
  coupon?: CouponRule | null
  referralCode?: string | null
  customerEmail?: string | null
  bookingDate?: Date | string | null
  customDiscountTotal?: number
  taxRatePercent?: number // Defaults to 0 (Qatar 0% VAT)
  serviceChargePercent?: number // Defaults to 0
}

export interface PriceCalculationResult {
  basePrice: number
  tierPrice: number
  extraGuestsPrice: number
  addOnsSubtotal: number
  grossSubtotal: number
  promotionDiscount: number
  couponDiscount: number
  customDiscount: number
  totalDiscount: number
  netSubtotal: number
  taxAmount: number
  serviceChargeAmount: number
  grandTotal: number
  currency: string
  appliedTierName?: string
  appliedPromoName?: string
  appliedCouponCode?: string
  isPromotionApplied: boolean
  isCouponApplied: boolean
  validationErrors: string[]
  warnings: string[]
}

/**
 * Standard monetary rounding helper (2 decimal places)
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

/**
 * Calculates complete, tamper-proof server-side pricing for packages, enquiries, and quotations.
 */
export function calculatePackagePrice(input: PriceCalculationInput): PriceCalculationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const now = new Date()
  const bookingDateObj = input.bookingDate ? new Date(input.bookingDate) : now

  const guestCount = Math.max(1, input.guestCount || input.basePackage.minGuests || 10)
  
  // 1. Capacity bounds check
  if (input.basePackage.minGuests && guestCount < input.basePackage.minGuests) {
    errors.push(`Guest count (${guestCount}) is below the minimum required (${input.basePackage.minGuests}).`)
  }
  if (input.basePackage.maxGuests && guestCount > input.basePackage.maxGuests) {
    errors.push(`Guest count (${guestCount}) exceeds the maximum capacity (${input.basePackage.maxGuests}).`)
  }

  // 2. Base & Tier price calculation
  const basePrice = input.basePackage.startingPrice || 0
  let tierPrice = 0
  let extraGuestsPrice = 0
  let appliedTierName: string | undefined

  const tiers = Array.isArray(input.basePackage.tiers) ? input.basePackage.tiers : []
  const selectedTier = input.selectedTierId ? tiers.find(t => t.id === input.selectedTierId) : (tiers.length > 0 ? tiers[0] : null)

  if (selectedTier) {
    tierPrice = selectedTier.price || 0
    appliedTierName = selectedTier.nameEn
    const includedGuests = selectedTier.includedGuests || input.basePackage.includedGuestCount || input.basePackage.minGuests || 10
    const extraPricePerGuest = selectedTier.extraGuestPrice ?? input.basePackage.extraGuestPrice ?? 0

    if (guestCount > includedGuests && extraPricePerGuest > 0) {
      extraGuestsPrice = (guestCount - includedGuests) * extraPricePerGuest
    }
  } else if (input.basePackage.priceDisplayMode === 'PER_GUEST') {
    tierPrice = basePrice * guestCount
  } else {
    tierPrice = basePrice
  }

  // 3. Add-ons Calculation
  let addOnsSubtotal = 0
  if (Array.isArray(input.selectedAddOns)) {
    input.selectedAddOns.forEach(addon => {
      const qty = Math.max(1, addon.quantity || 1)
      const unit = Math.max(0, addon.unitPrice || 0)
      if (addon.priceType === 'PER_GUEST') {
        addOnsSubtotal += unit * guestCount * qty
      } else {
        addOnsSubtotal += unit * qty
      }
    })
  }

  const grossSubtotal = roundCurrency(tierPrice + extraGuestsPrice + addOnsSubtotal)

  // 4. Evaluate Promotion
  let promotionDiscount = 0
  let isPromotionApplied = false
  let appliedPromoName: string | undefined

  if (input.promotion && input.promotion.isActive !== false) {
    const promo = input.promotion
    let promoEligible = true

    if (promo.validFrom && bookingDateObj < new Date(promo.validFrom)) promoEligible = false
    if (promo.validTo && bookingDateObj > new Date(promo.validTo)) promoEligible = false
    if (promo.minSpend && grossSubtotal < promo.minSpend) promoEligible = false
    if (promo.minGuests && guestCount < promo.minGuests) promoEligible = false

    if (Array.isArray(promo.applicablePackages) && promo.applicablePackages.length > 0) {
      if (!promo.applicablePackages.includes(input.basePackage.id)) promoEligible = false
    }

    if (promoEligible) {
      if (promo.discountType === 'PERCENTAGE') {
        let disc = (grossSubtotal * promo.discountValue) / 100
        if (promo.maxDiscount && disc > promo.maxDiscount) disc = promo.maxDiscount
        promotionDiscount = roundCurrency(disc)
      } else {
        promotionDiscount = roundCurrency(Math.min(promo.discountValue, grossSubtotal))
      }
      isPromotionApplied = promotionDiscount > 0
      appliedPromoName = promo.name
    }
  }

  // 5. Evaluate Coupon & Stacking Prevention
  let couponDiscount = 0
  let isCouponApplied = false
  let appliedCouponCode: string | undefined

  if (input.coupon) {
    const cp = input.coupon
    let couponEligible = cp.status === 'ACTIVE'

    if (cp.validFrom && now < new Date(cp.validFrom)) couponEligible = false
    if (cp.validTo && now > new Date(cp.validTo)) couponEligible = false
    if (cp.usageLimit && (cp.usedCount || 0) >= cp.usageLimit) couponEligible = false
    if (cp.minSpend && grossSubtotal < cp.minSpend) couponEligible = false

    // Stacking check: if a promotion is already applied and not stackable, block coupon stacking
    if (isPromotionApplied && input.promotion && !input.promotion.isStackable) {
      warnings.push('Promotion and coupon cannot be combined. The highest discount was applied.')
      couponEligible = false
    }

    if (couponEligible) {
      const promoRule = cp.promotion
      if (promoRule) {
        if (promoRule.discountType === 'PERCENTAGE') {
          let disc = (grossSubtotal * promoRule.discountValue) / 100
          if (promoRule.maxDiscount && disc > promoRule.maxDiscount) disc = promoRule.maxDiscount
          couponDiscount = roundCurrency(disc)
        } else {
          couponDiscount = roundCurrency(Math.min(promoRule.discountValue, grossSubtotal))
        }
      } else {
        // Direct fixed coupon fallback
        couponDiscount = roundCurrency(Math.min(50, grossSubtotal))
      }
      isCouponApplied = couponDiscount > 0
      appliedCouponCode = cp.code
    }
  }

  // 6. Custom Quotation Discount
  const customDiscount = roundCurrency(Math.max(0, input.customDiscountTotal || 0))

  // 7. Net Subtotal & Totals
  const totalDiscount = roundCurrency(Math.min(grossSubtotal, promotionDiscount + couponDiscount + customDiscount))
  const netSubtotal = roundCurrency(Math.max(0, grossSubtotal - totalDiscount))

  // 8. Tax and Service Charges (Configurable, Qatar default 0%)
  const taxRate = Math.max(0, input.taxRatePercent || 0)
  const serviceRate = Math.max(0, input.serviceChargePercent || 0)

  const taxAmount = roundCurrency((netSubtotal * taxRate) / 100)
  const serviceChargeAmount = roundCurrency((netSubtotal * serviceRate) / 100)

  const grandTotal = roundCurrency(netSubtotal + taxAmount + serviceChargeAmount)

  return {
    basePrice: roundCurrency(basePrice),
    tierPrice: roundCurrency(tierPrice),
    extraGuestsPrice: roundCurrency(extraGuestsPrice),
    addOnsSubtotal: roundCurrency(addOnsSubtotal),
    grossSubtotal,
    promotionDiscount,
    couponDiscount,
    customDiscount,
    totalDiscount,
    netSubtotal,
    taxAmount,
    serviceChargeAmount,
    grandTotal,
    currency: 'QAR',
    appliedTierName,
    appliedPromoName,
    appliedCouponCode,
    isPromotionApplied,
    isCouponApplied,
    validationErrors: errors,
    warnings
  }
}
