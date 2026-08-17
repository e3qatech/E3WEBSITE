import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    // If code is requested (e.g. at checkout/lead submission)
    if (code) {
      const referral = await db.referralCode.findUnique({
        where: { code: code.toUpperCase().trim() },
        include: { programme: true }
      })
      if (!referral || referral.status !== "ACTIVE" || referral.programme.status !== "ACTIVE") {
        return NextResponse.json({ valid: false, message: "Invalid or inactive referral code" }, { status: 404 })
      }
      return NextResponse.json({
        valid: true,
        code: referral.code,
        ownerName: referral.ownerName,
        programmeName: referral.programme.name,
        reward: referral.programme.referredCustomerReward
      })
    }

    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
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
    console.error("[GET /api/b2c/referrals] Error:", error)
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
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
          ownerName,
          ownerEmail,
          ownerPhone,
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
        name,
        ownerType: ownerType || "CUSTOMER",
        rewardType: rewardType || "DISCOUNT",
        referrerReward,
        referredCustomerReward,
        status: "ACTIVE"
      }
    })

    return NextResponse.json({ data: programme })
  } catch (error: any) {
    console.error("[POST /api/b2c/referrals] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create referral" }, { status: 500 })
  }
}
