import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
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

    // If items are provided, recompute subtotal and grandTotal
    let subtotal = existing.subtotal
    let discount = discountTotal !== undefined ? parseFloat(discountTotal) : existing.discountTotal
    let grandTotal = existing.grandTotal

    if (Array.isArray(items)) {
      await db.quotationItem.deleteMany({ where: { quotationId: existing.id } })
      subtotal = 0
      const formattedItems = items.map((item, idx) => {
        const qty = parseInt(item.quantity) || 1
        const unit = parseFloat(item.unitPrice) || 0
        const total = qty * unit
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
      grandTotal = Math.max(0, subtotal - discount)
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
        depositAmount: depositAmount !== undefined ? parseFloat(depositAmount) : undefined,
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
