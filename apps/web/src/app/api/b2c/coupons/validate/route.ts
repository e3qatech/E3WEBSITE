import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { calculatePackagePrice, CouponRule } from "@/lib/package-pricing-engine"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, packageId, categorySlug, guestCount, subtotal, customerEmail } = body

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
    }

    const upperCode = code.toUpperCase().trim()
    if (upperCode.length > 50) {
      return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
    }

    // 1. Find coupon
    const coupon = await db.coupon.findUnique({
      where: { code: upperCode },
      include: { promotion: true }
    })

    // Return neutral response for invalid / inactive / expired / limit reached
    if (!coupon || coupon.status !== "ACTIVE") {
      return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
    }

    const now = new Date()
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
    }

    if (coupon.validTo && now > new Date(coupon.validTo)) {
      return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
    }

    if (coupon.minSpend && subtotal && subtotal < coupon.minSpend) {
      return NextResponse.json({
        valid: false,
        message: "Coupon criteria not met for this booking subtotal"
      }, { status: 400 })
    }

    // Check per-user limit if email is provided
    if (customerEmail && coupon.perUserLimit) {
      const userUsageCount = await db.couponUsage.count({
        where: { couponId: coupon.id, contactEmail: customerEmail.toLowerCase().trim() }
      })
      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json({ valid: false, message: "Coupon has already been redeemed" }, { status: 400 })
      }
    }

    // 2. Validate against promotion rules if promotion is linked
    const promo = coupon.promotion
    let discountAmount = 0
    let discountType = "FIXED"
    let discountValue = 0

    if (promo) {
      if (!promo.isActive) {
        return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
      }

      if (promo.validFrom && now < new Date(promo.validFrom)) {
        return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
      }

      if (promo.validTo && now > new Date(promo.validTo)) {
        return NextResponse.json({ valid: false, message: "Invalid or unavailable coupon code" }, { status: 400 })
      }

      if (promo.minGuests && guestCount && guestCount < promo.minGuests) {
        return NextResponse.json({
          valid: false,
          message: `Minimum ${promo.minGuests} guests required for this promotion`
        }, { status: 400 })
      }

      // Check applicable package or categories if specified
      if (Array.isArray(promo.applicablePackages) && promo.applicablePackages.length > 0) {
        if (packageId && !promo.applicablePackages.includes(packageId)) {
          return NextResponse.json({ valid: false, message: "Coupon is not applicable to this package" }, { status: 400 })
        }
      }

      if (Array.isArray(promo.applicableCategories) && promo.applicableCategories.length > 0) {
        if (categorySlug && !promo.applicableCategories.includes(categorySlug.toLowerCase())) {
          return NextResponse.json({ valid: false, message: "Coupon is not applicable to this category" }, { status: 400 })
        }
      }

      discountType = promo.discountType
      discountValue = promo.discountValue

      const effectiveSubtotal = subtotal || 0

      if (promo.discountType === "PERCENTAGE") {
        discountAmount = (effectiveSubtotal * promo.discountValue) / 100
        if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
          discountAmount = promo.maxDiscount
        }
      } else {
        discountAmount = promo.discountValue
      }
    } else {
      discountAmount = 50
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType,
      discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      description: coupon.description || promo?.labelEn || "Promotional Discount"
    })
  } catch (error: any) {
    console.error("[POST /api/b2c/coupons/validate] Error:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
