import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"
import { roundCurrency } from "@/lib/package-pricing-engine"

async function enforceQuotationPermission() {
  try {
    return await requirePermission("crm.leads.manage")
  } catch {
    return await requirePermission("b2c.packages.manage")
  }
}

export async function GET(req: NextRequest) {
  try {
    try {
      await enforceQuotationPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
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
    console.error("[GET /api/b2c/quotations] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let user: any = null
    try {
      user = await enforceQuotationPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
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
      taxTotal,
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

    // 2. Compute server-side totals strictly from item quantity and unitPrice (never trust browser grand totals)
    const lineItems: any[] = Array.isArray(items) ? items : []
    let subtotal = 0

    const formattedItems = lineItems.map((item, idx) => {
      const qty = Math.max(1, parseInt(item.quantity) || 1)
      const unit = Math.max(0, parseFloat(item.unitPrice) || 0)
      const total = roundCurrency(qty * unit)
      subtotal += total
      return {
        itemType: item.itemType || "PACKAGE_TIER",
        titleEn: item.titleEn ? String(item.titleEn).trim() : `Item #${idx + 1}`,
        titleAr: item.titleAr ? String(item.titleAr).trim() : (item.titleEn ? String(item.titleEn).trim() : `بند #${idx + 1}`),
        descriptionEn: item.descriptionEn ? String(item.descriptionEn).trim() : null,
        descriptionAr: item.descriptionAr ? String(item.descriptionAr).trim() : null,
        quantity: qty,
        unitPrice: unit,
        totalPrice: total,
        sortOrder: idx
      }
    })

    subtotal = roundCurrency(subtotal)
    const discount = roundCurrency(Math.min(subtotal, Math.max(0, parseFloat(discountTotal) || 0)))
    const tax = taxTotal !== undefined ? roundCurrency(Math.max(0, parseFloat(taxTotal) || 0)) : 0
    const grandTotal = roundCurrency(Math.max(0, subtotal - discount + tax))

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + (parseInt(validDays) || 14))

    const quotation = await db.packageQuotation.create({
      data: {
        quoteNumber,
        version: 1,
        leadId: leadId || undefined,
        packageId: packageId || undefined,
        customerName: String(customerName).trim(),
        customerEmail: String(customerEmail).toLowerCase().trim(),
        customerPhone: customerPhone ? String(customerPhone).trim() : null,
        companyOrOrg: companyOrOrg ? String(companyOrOrg).trim() : null,
        eventDate: eventDate ? new Date(eventDate) : null,
        validUntil,
        currency: currency || "QAR",
        subtotal,
        discountTotal: discount,
        taxTotal: tax,
        grandTotal,
        depositAmount: depositAmount ? roundCurrency(parseFloat(depositAmount)) : 0,
        paymentSchedule: paymentSchedule || null,
        termsEn: termsEn || "1. 50% deposit required upon confirmation.\n2. Balance due 48 hours prior to event.\n3. Cancellation policy as per E3 Qatar standard agreement.",
        termsAr: termsAr || "١. يُستحق ٥٠٪ دفعة مقدمة عند التأكيد.\n٢. يُستحق المتبقي قبل ٤٨ ساعة من موعد الفعالية.\n٣. تطبق سياسة الإلغاء القياسية لمؤسسة إي ثري.",
        customerNotes,
        internalNotes,
        status: "DRAFT",
        createdById: user?.name || "Staff",
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

    // If linked to lead, update lead status to QUOTATION_SENT
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
    console.error("[POST /api/b2c/quotations] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 })
  }
}
