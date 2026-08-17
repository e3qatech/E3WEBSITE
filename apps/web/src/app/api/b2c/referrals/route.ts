import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    // If code is requested publicly (e.g. during checkout/lead inquiry submission)
    if (code) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip"
      const rl = await rateLimit(`rate_limit:referral_validate:${ip}`, 10, 60, false)
      if (!rl.success) {
        return NextResponse.json(
          { valid: false, error: rl.error || "Too many validation attempts. Please try again later." },
          { status: 429, headers: { "Retry-After": String(rl.retryAfter || 60) } }
        )
      }

      const upperCode = code.toUpperCase().trim()
      const referral = await db.referralCode.findUnique({
        where: { code: upperCode },
        include: { programme: true }
      })

      if (!referral || referral.status !== "ACTIVE" || referral.programme.status !== "ACTIVE") {
        return NextResponse.json({ valid: false, message: "Invalid or inactive referral code" }, { status: 400 })
      }

      // Return only public reward details without private owner identity
      return NextResponse.json({
        valid: true,
        code: referral.code,
        programmeName: referral.programme.name,
        reward: referral.programme.referredCustomerReward || "Special Referral Perk"
      })
    }

    // Listing programmes requires b2c.packages.manage capability
    try {
      await requirePermission("b2c.packages.manage")
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const programmes = await db.referralProgramme.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        codes: true,
        _count: { select: { codes: true } }
      }
    })

    return NextResponse.json({ data: programmes })
  } catch (error: any) {
    console.error("[GET /api/b2c/referrals] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
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
      type, // 'programme' or 'code'
      name,
      ownerType,
      rewardType,
      referrerReward,
      referredCustomerReward,
      programmeId,
      code,
      ownerName,
      ownerEmail,
      ownerPhone
    } = body

    if (type === "code") {
      if (!programmeId || !code || !ownerName) {
        return NextResponse.json({ error: "Programme ID, code and owner name are required" }, { status: 400 })
      }
      const upperCode = code.toUpperCase().trim()
      const existing = await db.referralCode.findUnique({ where: { code: upperCode } })
      if (existing) {
        return NextResponse.json({ error: "Referral code already exists" }, { status: 400 })
      }
      const newCode = await db.referralCode.create({
        data: {
          programmeId,
          code: upperCode,
          ownerName: String(ownerName).trim(),
          ownerEmail: ownerEmail ? String(ownerEmail).toLowerCase().trim() : null,
          ownerPhone: ownerPhone ? String(ownerPhone).trim() : null,
          status: "ACTIVE"
        },
        include: { programme: true }
      })
      return NextResponse.json({ data: newCode })
    }

    // Default: create programme
    if (!name) {
      return NextResponse.json({ error: "Programme name is required" }, { status: 400 })
    }

    const programme = await db.referralProgramme.create({
      data: {
        name: String(name).trim(),
        ownerType: ownerType || "CUSTOMER",
        rewardType: rewardType || "DISCOUNT",
        referrerReward,
        referredCustomerReward,
        status: "ACTIVE"
      }
    })

    return NextResponse.json({ data: programme })
  } catch (error: any) {
    console.error("[POST /api/b2c/referrals] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 })
  }
}
