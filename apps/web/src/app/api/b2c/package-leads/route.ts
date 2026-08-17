import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const leadType = searchParams.get("leadType")
    const priority = searchParams.get("priority")
    const search = searchParams.get("search")
    const packageId = searchParams.get("packageId")

    const where: any = {}

    if (status && status !== "ALL") where.status = status
    if (leadType && leadType !== "ALL") where.leadType = leadType
    if (priority && priority !== "ALL") where.priority = priority
    if (packageId) where.packageId = packageId

    if (search) {
      const s = search.trim()
      where.OR = [
        { customerName: { contains: s, mode: "insensitive" } },
        { companyOrOrg: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        { phone: { contains: s, mode: "insensitive" } },
        { celebrationName: { contains: s, mode: "insensitive" } },
        { leadId: { contains: s, mode: "insensitive" } }
      ]
    }

    const leads = await db.packageLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        package: { select: { id: true, titleEn: true, titleAr: true, slug: true, startingPrice: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        quotations: { select: { id: true, quoteNumber: true, status: true, grandTotal: true } }
      }
    })

    return NextResponse.json({ data: leads, count: leads.length })
  } catch (error: any) {
    console.error("[GET /api/b2c/package-leads] Error:", error)
    return NextResponse.json({ error: "Failed to fetch package leads" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. Anti-spam honeypot verification
    if (body.website_hp || body.honeypot) {
      console.warn("[ANTI-SPAM] Bot honeypot triggered on lead submission")
      return NextResponse.json({ success: true, leadId: "E3-LEAD-BOT" })
    }

    const {
      customerName,
      companyOrOrg,
      email,
      phone,
      whatsApp,
      contactMethod,
      celebrationName,
      ageGroup,
      preferredDate,
      alternativeDate,
      preferredTimeSlot,
      expectedGuests,
      expectedChildren,
      expectedAdults,
      budgetRange,
      estimatedValue,
      packageId,
      selectedTierId,
      selectedTierName,
      selectedAddOns,
      customSelections,
      themePreference,
      cateringRequirements,
      accessibilityReqs,
      specialRequests,
      attachments,
      leadType,
      sourcePage,
      utmSource,
      utmMedium,
      utmCampaign,
      couponCode,
      referralCode,
      locale,
      marketingConsent
    } = body

    if (!customerName || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 })
    }

    // 2. Duplicate Throttle (reject exact same email + package within 30s)
    const recentDuplicate = await db.packageLead.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        packageId: packageId || undefined,
        createdAt: { gte: new Date(Date.now() - 30000) }
      }
    })
    if (recentDuplicate) {
      return NextResponse.json({
        success: true,
        data: recentDuplicate,
        message: "Your inquiry has already been submitted. Our team will contact you shortly!"
      })
    }

    // 3. Generate human-readable Unique Lead Reference
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "")
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const formattedLeadId = `E3-LEAD-${datePrefix}-${randomSuffix}`

    // 4. Handle Coupon and Referral Attribution
    let verifiedCouponCode = undefined
    if (couponCode) {
      const c = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } })
      if (c && c.status === "ACTIVE") {
        verifiedCouponCode = c.code
        await db.coupon.update({
          where: { id: c.id },
          data: { usedCount: { increment: 1 } }
        }).catch(console.warn)
      }
    }

    let verifiedReferralCode = undefined
    if (referralCode) {
      const r = await db.referralCode.findUnique({ where: { code: referralCode.toUpperCase().trim() } })
      if (r && r.status === "ACTIVE") {
        verifiedReferralCode = r.code
        await db.referralCode.update({
          where: { id: r.id },
          data: {
            usedCount: { increment: 1 },
            leadsGenerated: { increment: 1 }
          }
        }).catch(console.warn)
      }
    }

    // 5. Initial Activity Log
    const initialActivityLog = [
      {
        id: `act-${Date.now()}`,
        action: "LEAD_CREATED",
        timestamp: new Date().toISOString(),
        details: `Inquiry submitted via ${sourcePage || "Public Packages Page"} (${locale || "en"})`
      }
    ]

    const lead = await db.packageLead.create({
      data: {
        leadId: formattedLeadId,
        customerName,
        companyOrOrg,
        email: email.toLowerCase().trim(),
        phone,
        whatsApp,
        contactMethod: contactMethod || "WHATSAPP",
        celebrationName,
        ageGroup,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        alternativeDate: alternativeDate ? new Date(alternativeDate) : null,
        preferredTimeSlot,
        expectedGuests: expectedGuests ? parseInt(expectedGuests) : 10,
        expectedChildren: expectedChildren ? parseInt(expectedChildren) : null,
        expectedAdults: expectedAdults ? parseInt(expectedAdults) : null,
        budgetRange,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        packageId: packageId || undefined,
        selectedTierId,
        selectedTierName,
        selectedAddOns: selectedAddOns || [],
        customSelections: customSelections || null,
        themePreference,
        cateringRequirements,
        accessibilityReqs,
        specialRequests,
        attachments: attachments || [],
        leadType: leadType || "BIRTHDAY",
        status: "NEW",
        priority: "NORMAL",
        sourcePage: sourcePage || "/b2c/packages",
        utmSource,
        utmMedium,
        utmCampaign,
        couponCode: verifiedCouponCode,
        referralCode: verifiedReferralCode,
        locale: locale || "en",
        marketingConsent: Boolean(marketingConsent),
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        activityLog: initialActivityLog
      },
      include: {
        package: true
      }
    })

    return NextResponse.json({
      success: true,
      data: lead,
      referenceNumber: formattedLeadId,
      message: "Thank you! Your package inquiry has been received."
    })
  } catch (error: any) {
    console.error("[POST /api/b2c/package-leads] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit inquiry" }, { status: 500 })
  }
}
