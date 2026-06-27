import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      nameEn, nameAr, slug, descriptionEn, descriptionAr, 
      taglineEn, taglineAr, mapUrl, ticketingUrl,
      heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl,
      isPublished, isFeatured, isHidden,
      features, partnerOffers, partners, socialPreviews, newsCoverage, operations, temporalStatus, testimonials,
      pricing, faqs, socialLinks, gallery
    } = body

    const attraction = await db.attraction.create({
      data: {
        nameEn, nameAr, slug, descriptionEn, descriptionAr,
        taglineEn, taglineAr, mapUrl, ticketingUrl,
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

    return NextResponse.json(attraction)
  } catch (error: any) {
    console.error("[ATTRACTION_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
