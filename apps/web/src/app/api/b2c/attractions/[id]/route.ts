import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const attraction = await db.attraction.findUnique({
      where: { id: params.id },
      include: {
        gallery: { orderBy: { orderIndex: 'asc' } },
        pricing: true,
        offers: true,
        faqs: { orderBy: { orderIndex: 'asc' } },
        socialLinks: true,
        temporalRules: true,
      }
    })

    if (!attraction) {
      return NextResponse.json({ error: "Attraction not found" }, { status: 404 })
    }

    return NextResponse.json(attraction)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { 
      gallery, 
      pricing, 
      offers, 
      faqs, 
      socialLinks, 
      temporalRules,
      ...data 
    } = body

    const updated = await db.attraction.update({
      where: { id: params.id },
      data: { ...data }
    })

    // Handle relations (delete and recreate for simplicity in this demo)
    if (gallery && Array.isArray(gallery)) {
      await db.attractionGalleryItem.deleteMany({ where: { attractionId: params.id } })
      if (gallery.length > 0) {
        await db.attractionGalleryItem.createMany({
          data: gallery.map((g: any, index: number) => ({
            attractionId: params.id,
            url: g.url,
            captionEn: g.captionEn,
            captionAr: g.captionAr,
            orderIndex: index
          }))
        })
      }
    }

    if (pricing && Array.isArray(pricing)) {
      await db.attractionPricing.deleteMany({ where: { attractionId: params.id } })
      if (pricing.length > 0) {
        await db.attractionPricing.createMany({
          data: pricing.map((p: any) => ({
            attractionId: params.id,
            titleEn: p.titleEn,
            titleAr: p.titleAr,
            price: parseFloat(p.price) || 0,
            currency: p.currency,
            type: p.type
          }))
        })
      }
    }

    if (faqs && Array.isArray(faqs)) {
      await db.attractionFaq.deleteMany({ where: { attractionId: params.id } })
      if (faqs.length > 0) {
        await db.attractionFaq.createMany({
          data: faqs.map((f: any, index: number) => ({
            attractionId: params.id,
            questionEn: f.questionEn,
            questionAr: f.questionAr,
            answerEn: f.answerEn,
            answerAr: f.answerAr,
            orderIndex: index
          }))
        })
      }
    }

    if (socialLinks && Array.isArray(socialLinks)) {
      await db.attractionSocialLink.deleteMany({ where: { attractionId: params.id } })
      if (socialLinks.length > 0) {
        await db.attractionSocialLink.createMany({
          data: socialLinks.map((s: any) => ({
            attractionId: params.id,
            platform: s.platform,
            url: s.url
          }))
        })
      }
    }

    if (temporalRules && Array.isArray(temporalRules)) {
      await db.attractionTemporalRule.deleteMany({ where: { attractionId: params.id } })
      if (temporalRules.length > 0) {
        await db.attractionTemporalRule.createMany({
          data: temporalRules.map((t: any) => ({
            attractionId: params.id,
            ruleType: t.ruleType,
            openTime: t.openTime,
            closeTime: t.closeTime,
            notes: t.notes
          }))
        })
      }
    }

    return NextResponse.json({ success: true, attraction: updated })
  } catch (error) {
    console.error("Error updating attraction:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await db.attraction.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
