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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await enforceQuotationPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const quotation = await db.packageQuotation.findFirst({
      where: { OR: [{ id }, { quoteNumber: id }] },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        lead: true,
        package: true
      }
    })

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    return NextResponse.json({ data: quotation })
  } catch (error: any) {
    console.error("[GET /api/b2c/quotations/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to load quotation" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await enforceQuotationPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { status, sentAt, acceptedAt, rejectedAt, items, discountTotal, depositAmount, taxTotal, ...rest } = body

    const existing = await db.packageQuotation.findFirst({
      where: { OR: [{ id }, { quoteNumber: id }] },
      include: { items: true }
    })
    if (!existing) return NextResponse.json({ error: "Quotation not found" }, { status: 404 })

    // Historical quotation immutability guard:
    // Finalized quotations (ACCEPTED, REJECTED, EXPIRED) cannot have items, pricing, or terms mutated in-place
    const isFinalized = existing.status === "ACCEPTED" || existing.status === "REJECTED" || existing.status === "EXPIRED"
    if (isFinalized && (items !== undefined || discountTotal !== undefined || depositAmount !== undefined || taxTotal !== undefined)) {
      return NextResponse.json(
        { error: "Finalized quotations cannot be repriced or edited. Please create a new quotation version." },
        { status: 400 }
      )
    }

    // If items are provided, recompute subtotal and grandTotal strictly on server
    let subtotal = existing.subtotal
    const discount = discountTotal !== undefined ? roundCurrency(Math.max(0, parseFloat(discountTotal) || 0)) : existing.discountTotal
    const tax = taxTotal !== undefined ? roundCurrency(Math.max(0, parseFloat(taxTotal) || 0)) : existing.taxTotal
    let grandTotal = existing.grandTotal

    if (Array.isArray(items)) {
      await db.quotationItem.deleteMany({ where: { quotationId: existing.id } })
      subtotal = 0
      const formattedItems = items.map((item, idx) => {
        const qty = Math.max(1, parseInt(item.quantity) || 1)
        const unit = Math.max(0, parseFloat(item.unitPrice) || 0)
        const total = roundCurrency(qty * unit)
        subtotal += total
        return {
          quotationId: existing.id,
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
      await db.quotationItem.createMany({ data: formattedItems })
      subtotal = roundCurrency(subtotal)
      grandTotal = roundCurrency(Math.max(0, subtotal - discount + tax))
    }

    const updated = await db.packageQuotation.update({
      where: { id: existing.id },
      data: {
        status: status || undefined,
        sentAt: status === "SENT" && !existing.sentAt ? new Date() : (sentAt ? new Date(sentAt) : undefined),
        acceptedAt: status === "ACCEPTED" && !existing.acceptedAt ? new Date() : (acceptedAt ? new Date(acceptedAt) : undefined),
        rejectedAt: status === "REJECTED" && !existing.rejectedAt ? new Date() : (rejectedAt ? new Date(rejectedAt) : undefined),
        subtotal,
        discountTotal: discount,
        taxTotal: tax,
        grandTotal,
        depositAmount: depositAmount !== undefined ? roundCurrency(parseFloat(depositAmount)) : undefined,
        ...rest
      },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        lead: true,
        package: true
      }
    })

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    console.error("[PUT /api/b2c/quotations/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await enforceQuotationPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.packageQuotation.findFirst({
      where: { OR: [{ id }, { quoteNumber: id }] }
    })
    if (!existing) return NextResponse.json({ error: "Quotation not found" }, { status: 404 })

    await db.packageQuotation.delete({ where: { id: existing.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/b2c/quotations/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 })
  }
}
