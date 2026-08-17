import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { sendInternalPackageLeadAlert, sendCustomerLeadAcknowledgement } from "@/lib/package-email-notifications"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
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
      return NextResponse.json({ success: true, referenceNumber: "E3-LEAD-BOT" })
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

    if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
      return NextResponse.json({ error: "Please provide a valid contact name" }, { status: 400 })
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanPhone = phone ? String(phone).replace(/[^\d+]/g, "").slice(0, 20) : null

    // 2. Duplicate Throttle (reject exact same email + package within 30s)
    const recentDuplicate = await db.packageLead.findFirst({
      where: {
        email: cleanEmail,
        packageId: packageId || undefined,
        createdAt: { gte: new Date(Date.now() - 30000) }
      }
    })
    if (recentDuplicate) {
      return NextResponse.json({
        success: true,
        referenceNumber: recentDuplicate.leadId,
        customerName: recentDuplicate.customerName,
        message: "Your inquiry has already been submitted. Our team will contact you shortly!"
      })
    }

    // 3. Generate human-readable Unique Lead Reference
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "")
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const formattedLeadId = `E3-LEAD-${datePrefix}-${randomSuffix}`

    // 4. Handle Coupon and Referral Attribution
    let verifiedCouponCode = undefined
    if (couponCode && typeof couponCode === "string") {
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
    if (referralCode && typeof referralCode === "string") {
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
        customerName: customerName.trim(),
        companyOrOrg: companyOrOrg ? String(companyOrOrg).trim().slice(0, 150) : null,
        email: cleanEmail,
        phone: cleanPhone,
        whatsApp: whatsApp ? String(whatsApp).trim().slice(0, 30) : null,
        contactMethod: contactMethod || "WHATSAPP",
        celebrationName: celebrationName ? String(celebrationName).trim().slice(0, 150) : null,
        ageGroup: ageGroup ? String(ageGroup).trim().slice(0, 50) : null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        alternativeDate: alternativeDate ? new Date(alternativeDate) : null,
        preferredTimeSlot: preferredTimeSlot ? String(preferredTimeSlot).slice(0, 50) : null,
        expectedGuests: expectedGuests ? Math.max(1, parseInt(expectedGuests)) : 10,
        expectedChildren: expectedChildren ? parseInt(expectedChildren) : null,
        expectedAdults: expectedAdults ? parseInt(expectedAdults) : null,
        budgetRange: budgetRange ? String(budgetRange).slice(0, 50) : null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        packageId: packageId || undefined,
        selectedTierId: selectedTierId ? String(selectedTierId).slice(0, 50) : null,
        selectedTierName: selectedTierName ? String(selectedTierName).slice(0, 100) : null,
        selectedAddOns: Array.isArray(selectedAddOns) ? selectedAddOns : [],
        customSelections: customSelections || null,
        themePreference: themePreference ? String(themePreference).slice(0, 100) : null,
        cateringRequirements: cateringRequirements ? String(cateringRequirements).slice(0, 300) : null,
        accessibilityReqs: accessibilityReqs ? String(accessibilityReqs).slice(0, 300) : null,
        specialRequests: specialRequests ? String(specialRequests).slice(0, 1000) : null,
        attachments: Array.isArray(attachments) ? attachments : [],
        leadType: leadType || "BIRTHDAY",
        status: "NEW",
        priority: "NORMAL",
        sourcePage: sourcePage || "/b2c/packages",
        utmSource: utmSource ? String(utmSource).slice(0, 100) : null,
        utmMedium: utmMedium ? String(utmMedium).slice(0, 100) : null,
        utmCampaign: utmCampaign ? String(utmCampaign).slice(0, 100) : null,
        marketingConsent: Boolean(marketingConsent),
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        activityLog: initialActivityLog
      },
      include: {
        package: { select: { titleEn: true, titleAr: true } }
      }
    })

    // Dispatch background email notifications safely
    const notificationPayload = {
      leadId: formattedLeadId,
      customerName: lead.customerName,
      email: cleanEmail,
      phone: cleanPhone,
      packageTitle: lead.package?.titleEn || leadType,
      leadType: leadType || "GENERAL",
      expectedGuests: expectedGuests ? parseInt(expectedGuests) : 10,
      preferredDate: preferredDate || null,
      budgetRange: budgetRange || null,
      specialRequests: specialRequests || null,
      sourcePage: sourcePage || "/b2c/packages",
      locale: locale || "en"
    }

    sendInternalPackageLeadAlert(notificationPayload).catch(console.warn)
    sendCustomerLeadAcknowledgement(notificationPayload).catch(console.warn)

    // Return safe public reference without exposing internal CRM tracking fields
    return NextResponse.json({
      success: true,
      referenceNumber: formattedLeadId,
      customerName: lead.customerName,
      message: "Thank you! Your package inquiry has been received. Our team will contact you shortly."
    })
  } catch (error: any) {
    console.error("[POST /api/b2c/package-leads] Error:", error)
    return NextResponse.json({ error: "Failed to submit inquiry. Please try again or contact us directly." }, { status: 500 })
  }
}
