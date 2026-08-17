import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"

export async function GET(req: NextRequest) {
  try {
    let hasManagePermission = false
    try {
      const user = await requirePermission("b2c.packages.manage")
      hasManagePermission = Boolean(user)
    } catch {
      hasManagePermission = false
    }

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("active") === "true" || !hasManagePermission

    const where: any = activeOnly ? { isActive: true } : {}

    const promotions = await db.packagePromotion.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: hasManagePermission ? { _count: { select: { coupons: true } } } : undefined
    })

    const sanitizedPromotions = promotions.map((p: any) => {
      if (!hasManagePermission) {
        return {
          id: p.id,
          name: p.name,
          labelEn: p.labelEn,
          labelAr: p.labelAr,
          discountType: p.discountType,
          discountValue: p.discountValue,
          maxDiscount: p.maxDiscount,
          minSpend: p.minSpend,
          minGuests: p.minGuests,
          applicableCategories: p.applicableCategories,
          applicablePackages: p.applicablePackages,
          validFrom: p.validFrom,
          validTo: p.validTo,
          isAutomatic: p.isAutomatic
        }
      }
      return p
    })

    return NextResponse.json({ data: sanitizedPromotions })
  } catch (error: any) {
    console.error("[GET /api/b2c/package-promotions] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    try {
      await requirePermission("b2c.packages.manage")
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const {
      name,
      code,
      labelEn,
      labelAr,
      discountType,
      discountValue,
      maxDiscount,
      minSpend,
      minGuests,
      applicableCategories,
      applicablePackages,
      validFrom,
      validTo,
      daysOfWeek,
      usageLimit,
      perUserLimit,
      isStackable,
      isAutomatic,
      isActive,
      priority
    } = body

    if (!name || !labelEn) {
      return NextResponse.json({ error: "Promotion name and English label are required" }, { status: 400 })
    }

    const promotion = await db.packagePromotion.create({
      data: {
        name: String(name).trim(),
        code: code ? String(code).toUpperCase().trim() : undefined,
        labelEn: String(labelEn).trim(),
        labelAr: labelAr ? String(labelAr).trim() : String(labelEn).trim(),
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        minSpend: minSpend ? parseFloat(minSpend) : null,
        minGuests: minGuests ? parseInt(minGuests) : null,
        applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
        applicablePackages: Array.isArray(applicablePackages) ? applicablePackages : [],
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek : [],
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        isStackable: Boolean(isStackable),
        isAutomatic: Boolean(isAutomatic),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        priority: priority ? parseInt(priority) : 0
      }
    })

    return NextResponse.json({ data: promotion })
  } catch (error: any) {
    console.error("[POST /api/b2c/package-promotions] Error:", error?.message || error)
    return NextResponse.json({ error: error.message || "Failed to create promotion" }, { status: 500 })
  }
}
