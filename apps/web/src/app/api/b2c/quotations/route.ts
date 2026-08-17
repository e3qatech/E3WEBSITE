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
    const leadId = searchParams.get("leadId")
    const search = searchParams.get("search")

    const where: any = {}
    if (status && status !== "ALL") where.status = status
    if (leadId) where.leadId = leadId
    if (search) {
      const s = search.trim()
      where.OR = [
        { quoteNumber: { contains: s, mode: "insensitive" } },
        { customerName: { contains: s, mode: "insensitive" } },
        { companyOrOrg: { contains: s, mode: "insensitive" } },
        { customerEmail: { contains: s, mode: "insensitive" } }
      ]
    }

    const quotations = await db.packageQuotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        lead: true,
        package: { select: { id: true, titleEn: true, titleAr: true, slug: true } },
        items: { orderBy: { sortOrder: "asc" } }
      }
    })

    return NextResponse.json({ data: quotations, count: quotations.length })
  } catch (error: any) {
    console.error("[GET /api/b2c/quotations] Error:", error)
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
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
      leadId,
      packageId,
      customerName,
      customerEmail,
      customerPhone,
      companyOrOrg,
      eventDate,
      validDays,
      currency,
      items,
      discountTotal,
      depositAmount,
      paymentSchedule,
      termsEn,
      termsAr,
      customerNotes,
      internalNotes
    } = body

    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: "Customer name and email are required" }, { status: 400 })
    }

    // 1. Generate human-readable quote number: E3-QTE-YYMMDD-XXXX
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "")
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const quoteNumber = `E3-QTE-${datePrefix}-${randomSuffix}`

    // 2. Compute server-side totals
    const lineItems: any[] = Array.isArray(items) ? items : []
    let subtotal = 0

    const formattedItems = lineItems.map((item, idx) => {
      const qty = parseInt(item.quantity) || 1
      const unit = parseFloat(item.unitPrice) || 0
      const total = qty * unit
      subtotal += total
      return {
        itemType: item.itemType || "PACKAGE_TIER",
        titleEn: item.titleEn || `Item #${idx + 1}`,
        titleAr: item.titleAr || item.titleEn || `بند #${idx + 1}`,
        descriptionEn: item.descriptionEn || null,
        descriptionAr: item.descriptionAr || null,
        quantity: qty,
        unitPrice: unit,
        totalPrice: total,
        sortOrder: idx
      }
    })

    const discount = parseFloat(discountTotal) || 0
    const tax = 0 // Qatar 0% standard VAT currently
    const grandTotal = Math.max(0, subtotal - discount + tax)

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + (parseInt(validDays) || 14))

    const quotation = await db.packageQuotation.create({
      data: {
        quoteNumber,
        version: 1,
        leadId: leadId || undefined,
        packageId: packageId || undefined,
        customerName,
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone,
        companyOrOrg,
        eventDate: eventDate ? new Date(eventDate) : null,
        validUntil,
        currency: currency || "QAR",
        subtotal,
        discountTotal: discount,
        taxTotal: tax,
        grandTotal,
        depositAmount: depositAmount ? parseFloat(depositAmount) : 0,
        paymentSchedule: paymentSchedule || null,
        termsEn: termsEn || "1. 50% deposit required upon confirmation.\n2. Balance due 48 hours prior to event.\n3. Cancellation policy as per E3 Qatar standard agreement.",
        termsAr: termsAr || "١. يُستحق ٥٠٪ دفعة مقدمة عند التأكيد.\n٢. يُستحق المتبقي قبل ٤٨ ساعة من موعد الفعالية.\n٣. تطبق سياسة الإلغاء القياسية لمؤسسة إي ثري.",
        customerNotes,
        internalNotes,
        status: "DRAFT",
        createdById: session?.user?.name || "Staff",
        items: {
          create: formattedItems
        }
      },
      include: {
        items: true,
        package: true,
        lead: true
      }
    })

    // If linked to lead, update lead status to PROPOSAL_IN_PROGRESS or QUOTATION_SENT
    if (leadId) {
      await db.packageLead.update({
        where: { id: leadId },
        data: {
          status: "QUOTATION_SENT",
          estimatedValue: grandTotal
        }
      }).catch(console.warn)
    }

    return NextResponse.json({ data: quotation })
  } catch (error: any) {
    console.error("[POST /api/b2c/quotations] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create quotation" }, { status: 500 })
  }
}
