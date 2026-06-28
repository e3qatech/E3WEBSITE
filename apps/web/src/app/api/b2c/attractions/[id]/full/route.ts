import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      nameEn, nameAr, slug, descriptionEn, descriptionAr, 
      taglineEn, taglineAr, mapUrl, ticketingUrl, logoUrl,
      heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl,
      isPublished, isFeatured, isHidden,
      features, partnerOffers, partners, socialPreviews, newsCoverage, operations, temporalStatus, testimonials,
      pricing, faqs, socialLinks, gallery
    } = body

    // Use a transaction for deleting old relations and creating new ones
    await db.$transaction([
      db.attractionPricing.deleteMany({ where: { attractionId: id } }),
      db.attractionFaq.deleteMany({ where: { attractionId: id } }),
      db.attractionSocialLink.deleteMany({ where: { attractionId: id } }),
      db.attractionGalleryItem.deleteMany({ where: { attractionId: id } }),
      db.attraction.update({
        where: { id },
        data: {
          nameEn, nameAr, slug, descriptionEn, descriptionAr,
          taglineEn, taglineAr, mapUrl, ticketingUrl, logoUrl,
          heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl,
          isPublished, isFeatured, isHidden,
          features, partnerOffers, partners, socialPreviews, newsCoverage, operations, temporalStatus, testimonials,
          pricing: {
            create: (pricing || []).map((p: any) => ({
              titleEn: p.titleEn,
              titleAr: p.titleAr,
              descriptionEn: p.descriptionEn,
              descriptionAr: p.descriptionAr,
              price: p.price,
              discount: p.discount,
              currency: p.currency,
              type: p.type
            }))
          },
          faqs: {
            create: (faqs || []).map((f: any, i: number) => ({
              questionEn: f.questionEn,
              questionAr: f.questionAr,
              answerEn: f.answerEn,
              answerAr: f.answerAr,
              orderIndex: i
            }))
          },
          socialLinks: {
            create: (socialLinks || []).map((s: any) => ({
              platform: s.platform,
              url: s.url
            }))
          },
          gallery: {
            create: (gallery || []).map((g: any, i: number) => ({
              url: g.url,
              captionEn: g.captionEn,
              captionAr: g.captionAr,
              orderIndex: i
            }))
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[ATTRACTION_FULL_PUT_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
