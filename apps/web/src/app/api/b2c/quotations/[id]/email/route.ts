import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { sendCustomerQuotationEmail } from "@/lib/package-email-notifications"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))

    const quotation = await db.packageQuotation.findFirst({
      where: { OR: [{ id }, { quoteNumber: id }] },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        package: true,
        lead: true
      }
    })

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 })
    }

    const recipientEmail = body.email || quotation.customerEmail
    if (!recipientEmail) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 })
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || "https://e3qatar.com"
    const locale = body.locale || "en"
    const viewUrl = `${origin}/${locale}/packages/quote/${quotation.quoteNumber}`
    const paymentUrl = `${origin}/${locale}/packages/quote/${quotation.quoteNumber}#payment`

    await sendCustomerQuotationEmail({
      quoteNumber: quotation.quoteNumber,
      customerName: quotation.customerName,
      customerEmail: recipientEmail,
      packageTitle: quotation.package?.titleEn || null,
      grandTotal: quotation.grandTotal,
      depositAmount: quotation.depositAmount || Math.round(quotation.grandTotal * 0.5),
      currency: quotation.currency || "QAR",
      validUntil: quotation.validUntil,
      viewUrl,
      paymentUrl,
      items: (quotation.items as any[]).map((it: any) => ({
        titleEn: it.titleEn,
        titleAr: it.titleAr || undefined,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice
      })),
      locale
    })

    if (quotation.status === "DRAFT") {
      await db.packageQuotation.update({
        where: { id: quotation.id },
        data: {
          status: "SENT",
          sentAt: new Date()
        }
      }).catch(console.warn)
    }

    return NextResponse.json({
      success: true,
      message: "Quotation email sent successfully",
      viewUrl,
      paymentUrl
    })
  } catch (error: any) {
    console.error("[POST /api/b2c/quotations/[id]/email] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to dispatch quotation email" }, { status: 500 })
  }
}
