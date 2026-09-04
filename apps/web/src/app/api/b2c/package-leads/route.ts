import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"
import { enforceBodyLimit } from "@/lib/body-limit"
import { rateLimit } from "@/lib/rate-limit"
import { PackageLeadSubmissionSchema } from "@/lib/validations/package-lead-schema"
import { calculatePackagePrice } from "@/lib/package-pricing-engine"
import { sendInternalPackageLeadAlert, sendCustomerLeadAcknowledgement } from "@/lib/package-email-notifications"

export async function GET(req: NextRequest) {
  try {
    // RBAC: Requires crm.leads.manage or b2c.packages.manage capability
    try {
      await requirePermission("crm.leads.manage")
    } catch {
      try {
        await requirePermission("b2c.packages.manage")
      } catch (err: any) {
        if (err instanceof AppAuthError) {
          return NextResponse.json({ error: err.message }, { status: err.statusCode })
        }
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
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
    console.error("[GET /api/b2c/package-leads] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch package leads" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Request Body Size Limit (16KB)
    const limitResp = enforceBodyLimit(req, 16 * 1024)
    if (limitResp) return limitResp

    // 2. Distributed Rate Limiting (5 submissions / 60 seconds per IP)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown_ip"
    const rl = await rateLimit(`rate_limit:package_leads:${ip}`, 5, 60, false)
    if (!rl.success) {
      return NextResponse.json(
        { error: rl.error || "Too many submissions. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter || 60) } }
      )
    }

    const rawBody = await req.json().catch(() => ({}))

    // 3. Honeypot check
    if (rawBody.website_hp || rawBody.honeypot) {
      console.warn("[ANTI-SPAM] Bot honeypot triggered on lead submission")
      return NextResponse.json({ success: true, referenceNumber: "E3-LEAD-BOT" })
    }

    // 4. Strict Zod Schema Validation & Sanitization
    const parseResult = PackageLeadSubmissionSchema.safeParse(rawBody)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const validated = parseResult.data

    // 5. Duplicate Throttle (reject duplicate email + package within 30s)
    const recentDuplicate = await db.packageLead.findFirst({
      where: {
        email: validated.email,
        packageId: validated.packageId || undefined,
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

    // 6. Server-Side Price Calculation (Never blindly trust browser estimate)
    let calculatedEstimatedValue = validated.estimatedValue || null
    let linkedPackage: any = null

    if (validated.packageId) {
      linkedPackage = await db.package.findUnique({
        where: { id: validated.packageId }
      })

      if (linkedPackage) {
        const pkgMin = Math.max(1, linkedPackage.minGuests || 1)
        const pkgMax = Math.max(pkgMin, linkedPackage.maxGuests || 100)

        if (validated.expectedGuests < pkgMin) {
          return NextResponse.json(
            { error: `Minimum guest capacity for this package is ${pkgMin} guests.` },
            { status: 400 }
          )
        }
        if (validated.expectedGuests > pkgMax) {
          return NextResponse.json(
            { error: `Maximum venue capacity for this package is ${pkgMax} guests.` },
            { status: 400 }
          )
        }

        const packageTiers = Array.isArray(linkedPackage.tiers)
          ? (linkedPackage.tiers as any)
          : (Array.isArray(linkedPackage.priceTiers) ? (linkedPackage.priceTiers as any) : [])

        const pricingResult = calculatePackagePrice({
          basePackage: {
            id: linkedPackage.id,
            startingPrice: linkedPackage.startingPrice || 0,
            priceDisplayMode: linkedPackage.priceDisplayMode,
            minGuests: pkgMin,
            maxGuests: pkgMax,
            includedGuestCount: linkedPackage.includedGuestCount || pkgMin,
            extraGuestPrice: linkedPackage.extraGuestPrice || 0,
            tiers: packageTiers
          },
          selectedTierId: validated.selectedTierId || undefined,
          guestCount: validated.expectedGuests,
          selectedAddOns: Array.isArray(validated.selectedAddOns)
            ? (validated.selectedAddOns as any[]).map((a: any) => ({
                id: a.id,
                quantity: a.qty || a.quantity || 1,
                unitPrice: a.unitPrice ?? a.price ?? 0,
                priceType: a.priceType || "FLAT"
              }))
            : []
        })
        calculatedEstimatedValue = pricingResult.grandTotal
      }
    }

    // 7. Generate Unique Lead Reference
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "")
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const formattedLeadId = `E3-LEAD-${datePrefix}-${randomSuffix}`

    // 8. Handle Coupon and Referral Attribution
    let verifiedCouponCode: string | undefined = undefined
    if (validated.couponCode) {
      const c = await db.coupon.findUnique({ where: { code: validated.couponCode.toUpperCase().trim() } })
      if (c && c.status === "ACTIVE") {
        verifiedCouponCode = c.code
        await db.coupon.update({
          where: { id: c.id },
          data: { usedCount: { increment: 1 } }
        }).catch(console.warn)
      }
    }

    let verifiedReferralCode: string | undefined = undefined
    if (validated.referralCode) {
      const r = await db.referralCode.findUnique({ where: { code: validated.referralCode.toUpperCase().trim() } })
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

    // 9. Initial Activity Log
    const initialActivityLog = [
      {
        id: `act-${Date.now()}`,
        action: "LEAD_CREATED",
        timestamp: new Date().toISOString(),
        details: `Inquiry submitted via ${validated.sourcePage || "Public Packages Page"} (${validated.locale})`
      }
    ]

    const lead = await db.packageLead.create({
      data: {
        leadId: formattedLeadId,
        customerName: validated.customerName,
        companyOrOrg: validated.companyOrOrg,
        email: validated.email,
        phone: validated.phone,
        whatsApp: validated.whatsApp,
        contactMethod: validated.contactMethod,
        celebrationName: validated.celebrationName,
        preferredDate: validated.preferredDate ? new Date(validated.preferredDate) : null,
        alternativeDate: validated.alternativeDate ? new Date(validated.alternativeDate) : null,
        preferredTimeSlot: validated.preferredTimeSlot,
        expectedGuests: validated.expectedGuests,
        expectedChildren: validated.expectedChildren,
        expectedAdults: validated.expectedAdults,
        budgetRange: validated.budgetRange,
        estimatedValue: calculatedEstimatedValue,
        packageId: validated.packageId || undefined,
        selectedTierId: validated.selectedTierId,
        selectedTierName: validated.selectedTierName,
        selectedAddOns: validated.selectedAddOns,
        customSelections: validated.customSelections,
        themePreference: validated.themePreference,
        cateringRequirements: validated.cateringRequirements,
        accessibilityReqs: validated.accessibilityReqs,
        specialRequests: validated.specialRequests,
        attachments: validated.attachments,
        leadType: validated.leadType,
        status: "NEW",
        priority: "NORMAL",
        sourcePage: validated.sourcePage,
        utmSource: validated.utmSource,
        utmMedium: validated.utmMedium,
        utmCampaign: validated.utmCampaign,
        marketingConsent: validated.marketingConsent,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        activityLog: initialActivityLog
      },
      include: {
        package: { select: { titleEn: true, titleAr: true } }
      }
    })

    // 10. Dispatch background email notifications safely
    const notificationPayload = {
      leadId: formattedLeadId,
      customerName: lead.customerName,
      email: validated.email,
      phone: validated.phone,
      packageTitle: linkedPackage?.titleEn || validated.leadType,
      leadType: validated.leadType,
      expectedGuests: validated.expectedGuests,
      preferredDate: validated.preferredDate || null,
      budgetRange: validated.budgetRange || null,
      specialRequests: validated.specialRequests || null,
      sourcePage: validated.sourcePage,
      locale: validated.locale
    }

    sendInternalPackageLeadAlert(notificationPayload).catch(console.warn)
    sendCustomerLeadAcknowledgement(notificationPayload).catch(console.warn)

    // 10. Automatically generate official PackageQuotation for instant PDF, share, and payment
    let quotation: any = null
    try {
      const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "")
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const quoteNumber = `E3-QTE-${datePrefix}-${randomSuffix}`
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 14)

      const quoteItems: any[] = []
      const basePrice = calculatedEstimatedValue || linkedPackage?.startingPrice || 1200

      quoteItems.push({
        itemType: "PACKAGE_TIER",
        titleEn: `${linkedPackage?.titleEn || "Package Admission"} (${validated.selectedTierName || "Standard Tier"})`,
        titleAr: `${linkedPackage?.titleAr || "رسوم الباقة"} (${validated.selectedTierName || "الفئة القياسية"})`,
        quantity: 1,
        unitPrice: basePrice,
        totalPrice: basePrice,
        sortOrder: 0
      })

      if (Array.isArray(validated.selectedAddOns)) {
        validated.selectedAddOns.forEach((a: any, idx: number) => {
          const qty = a.qty || a.quantity || 1
          const price = a.price || 0
          quoteItems.push({
            itemType: "ADD_ON",
            titleEn: a.titleEn || a.name || `Add-on #${idx + 1}`,
            titleAr: a.titleAr || a.name || `إضافة #${idx + 1}`,
            quantity: qty,
            unitPrice: price,
            totalPrice: price * qty,
            sortOrder: idx + 1
          })
        })
      }

      const grandTotal = calculatedEstimatedValue || 1200
      const depositAmount = Math.round(grandTotal * 0.5)

      quotation = await db.packageQuotation.create({
        data: {
          quoteNumber,
          version: 1,
          leadId: lead.id,
          packageId: validated.packageId || undefined,
          customerName: validated.customerName,
          customerEmail: validated.email,
          customerPhone: validated.phone || null,
          companyOrOrg: validated.companyOrOrg || null,
          eventDate: validated.preferredDate ? new Date(validated.preferredDate) : null,
          validUntil,
          currency: "QAR",
          subtotal: grandTotal,
          discountTotal: 0,
          grandTotal,
          depositAmount,
          status: "SENT",
          sentAt: new Date(),
          createdById: "Instant Customer Enquiry",
          items: {
            create: quoteItems
          }
        }
      })
    } catch (qErr) {
      console.warn("[Package Lead Quote Auto-Creation Notice]:", qErr)
    }

    // Return safe public reference and quote details
    return NextResponse.json({
      success: true,
      referenceNumber: formattedLeadId,
      quoteNumber: quotation?.quoteNumber || formattedLeadId,
      quoteId: quotation?.id || null,
      customerName: lead.customerName,
      message: "Thank you! Your package inquiry has been received. Our team will contact you shortly."
    })
  } catch (error: any) {
    console.error("[POST /api/b2c/package-leads] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to submit inquiry. Please try again or contact us directly." }, { status: 500 })
  }
}
