import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("active") === "true"

    const where: any = activeOnly ? { isActive: true } : {}

    const promotions = await db.packagePromotion.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { coupons: true } }
      }
    })

    return NextResponse.json({ data: promotions })
  } catch (error: any) {
    console.error("[GET /api/b2c/package-promotions] Error:", error)
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
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
        name,
        code: code ? code.toUpperCase().trim() : undefined,
        labelEn,
        labelAr: labelAr || labelEn,
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        minSpend: minSpend ? parseFloat(minSpend) : null,
        minGuests: minGuests ? parseInt(minGuests) : null,
        applicableCategories: applicableCategories || [],
        applicablePackages: applicablePackages || [],
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        daysOfWeek: daysOfWeek || [],
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
    console.error("[POST /api/b2c/package-promotions] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create promotion" }, { status: 500 })
  }
}
