import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { roundCurrency } from "@/lib/package-pricing-engine"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
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
    return NextResponse.json({ error: "Failed to load quotation" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, sentAt, acceptedAt, rejectedAt, items, discountTotal, depositAmount, ...rest } = body

    const existing = await db.packageQuotation.findFirst({
      where: { OR: [{ id }, { quoteNumber: id }] },
      include: { items: true }
    })
    if (!existing) return NextResponse.json({ error: "Quotation not found" }, { status: 404 })

    // Historical quotation immutability guard:
    // If quotation was already accepted or rejected, items/pricing cannot be mutated in-place
    if ((existing.status === "ACCEPTED" || existing.status === "REJECTED") && (items !== undefined || discountTotal !== undefined)) {
      return NextResponse.json({ error: "Finalized quotations cannot be edited. Please create a new quotation version." }, { status: 400 })
    }

    // If items are provided, recompute subtotal and grandTotal strictly on server
    let subtotal = existing.subtotal
    let discount = discountTotal !== undefined ? roundCurrency(Math.max(0, parseFloat(discountTotal) || 0)) : existing.discountTotal
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
      await db.quotationItem.createMany({ data: formattedItems })
      subtotal = roundCurrency(subtotal)
      grandTotal = roundCurrency(Math.max(0, subtotal - discount))
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
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
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
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 })
  }
}
