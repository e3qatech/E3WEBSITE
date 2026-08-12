import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const leadType = searchParams.get("leadType")
    const search = searchParams.get("search")

    const where: any = {}
    if (status && status !== "ALL") where.status = status
    if (leadType && leadType !== "ALL") where.leadType = leadType
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { companyOrOrg: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ]
    }

    const leads = await db.packageLead.findMany({
      where,
      include: {
        package: { select: { id: true, titleEn: true, titleAr: true, slug: true } },
        assignedTo: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ data: leads })
  } catch (error: any) {
    console.error("[GET /api/b2c/package-leads] Error:", error)
    return NextResponse.json({ error: "Failed to fetch package leads" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      customerName, email, phone, whatsApp, leadType, packageId, selectedTierId, 
      selectedTierName, selectedAddOns, celebrationName, ageGroup, preferredDate, 
      alternativeDate, expectedGuests, estimatedValue, specialRequests, companyOrOrg,
      marketingConsent, termsAccepted, locale, utmSource, utmCampaign
    } = body

    if (!customerName || (!email && !phone && !whatsApp)) {
      return NextResponse.json({ error: "Name and contact information are required" }, { status: 400 })
    }

    const newLead = await db.packageLead.create({
      data: {
        customerName,
        companyOrOrg: companyOrOrg || null,
        email: email || "no-email@e3.qa",
        phone: phone || null,
        whatsApp: whatsApp || phone || null,
        leadType: leadType || "BIRTHDAY",
        packageId: packageId || null,
        selectedTierId: selectedTierId || null,
        selectedTierName: selectedTierName || null,
        selectedAddOns: selectedAddOns || null,
        celebrationName: celebrationName || null,
        ageGroup: ageGroup || null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        alternativeDate: alternativeDate ? new Date(alternativeDate) : null,
        expectedGuests: expectedGuests ? parseInt(expectedGuests) : 10,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        specialRequests: specialRequests || null,
        marketingConsent: marketingConsent ?? false,
        termsAccepted: termsAccepted ?? true,
        termsAcceptedAt: new Date(),
        locale: locale || "en",
        utmSource: utmSource || null,
        utmCampaign: utmCampaign || null,
        status: "NEW",
        priority: (leadType === "CORPORATE" || (expectedGuests && parseInt(expectedGuests) > 30)) ? "HIGH" : "NORMAL"
      }
    })

    return NextResponse.json({ data: newLead })
  } catch (error: any) {
    console.error("[POST /api/b2c/package-leads] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to submit enquiry" }, { status: 500 })
  }
}
