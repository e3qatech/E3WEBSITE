import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("active") === "true"

    const where: any = activeOnly ? { status: "ACTIVE" } : {}

    const coupons = await db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        promotion: true,
        _count: { select: { usages: true } }
      }
    })

    return NextResponse.json({ data: coupons })
  } catch (error: any) {
    console.error("[GET /api/b2c/coupons] Error:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      code,
      promotionId,
      description,
      status,
      validFrom,
      validTo,
      usageLimit,
      perUserLimit,
      minSpend,
      utmSource,
      utmCampaign,
      bulkCount,
      prefix
    } = body

    // Bulk creation support
    if (bulkCount && parseInt(bulkCount) > 1) {
      const count = Math.min(parseInt(bulkCount), 100)
      const pfx = prefix || "E3"
      const createdCoupons = []

      for (let i = 0; i < count; i++) {
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase()
        const genCode = `${pfx}-${randomStr}`
        const coupon = await db.coupon.create({
          data: {
            code: genCode,
            promotionId: promotionId || undefined,
            description: description || `Bulk generated coupon #${i + 1}`,
            status: status || "ACTIVE",
            validFrom: validFrom ? new Date(validFrom) : null,
            validTo: validTo ? new Date(validTo) : null,
            usageLimit: usageLimit ? parseInt(usageLimit) : 1,
            perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
            minSpend: minSpend ? parseFloat(minSpend) : null,
            utmSource,
            utmCampaign
          }
        })
        createdCoupons.push(coupon)
      }
      return NextResponse.json({ data: createdCoupons, count: createdCoupons.length })
    }

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    const upperCode = code.toUpperCase().trim()
    const existing = await db.coupon.findUnique({ where: { code: upperCode } })
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    const coupon = await db.coupon.create({
      data: {
        code: upperCode,
        promotionId: promotionId || undefined,
        description,
        status: status || "ACTIVE",
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        minSpend: minSpend ? parseFloat(minSpend) : null,
        utmSource,
        utmCampaign
      },
      include: {
        promotion: true
      }
    })

    return NextResponse.json({ data: coupon })
  } catch (error: any) {
    console.error("[POST /api/b2c/coupons] Error:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
