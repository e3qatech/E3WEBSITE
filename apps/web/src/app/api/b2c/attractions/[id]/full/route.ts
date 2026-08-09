import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      nameEn, nameAr, slug, descriptionEn, descriptionAr, 
      taglineEn, taglineAr, mapUrl, ticketingUrl, logoUrl,
      heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl,
      motionPreset, motionIntensity, heroSceneType, particleDensity,
      isPublished, isFeatured, isHidden,
      features, partnerOffers, partners, socialPreviews, newsCoverage, operations, temporalStatus, testimonials,
      pricing, faqs, socialLinks, gallery, seo
    } = body

    const cleanNameEn = (nameEn || nameAr || slug || "Attraction").trim()
    const cleanNameAr = (nameAr || nameEn || slug || "الوجهة").trim()
    const cleanSlug = (slug || nameEn || "attraction").toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Combine motion preset settings safely into operations JSON
    const mergedOperations = {
      ...(typeof operations === 'object' && operations !== null ? operations : {}),
      motionPreset: motionPreset || "MEDIA_CINEMATIC",
      motionIntensity: motionIntensity || "MEDIUM",
      heroSceneType: heroSceneType || "CINEMATIC_MEDIA",
      particleDensity: particleDensity !== undefined ? Number(particleDensity) : 50,
    }

    // Filter and sanitize relations
    const safePricing = (pricing || [])
      .filter((p: any) => p && (p.titleEn || p.titleAr || p.price !== undefined))
      .map((p: any) => ({
        titleEn: (p.titleEn || p.titleAr || "General Ticket").trim(),
        titleAr: (p.titleAr || p.titleEn || "تذكرة عامة").trim(),
        descriptionEn: (p.descriptionEn || "").trim(),
        descriptionAr: (p.descriptionAr || "").trim(),
        price: typeof p.price === 'number' && !isNaN(p.price) ? p.price : (parseFloat(p.price) || 0),
        discount: p.discount !== null && p.discount !== undefined && !isNaN(parseFloat(p.discount)) ? parseFloat(p.discount) : null,
        currency: p.currency || "QAR",
        type: p.type || "GENERAL"
      }))

    const safeFaqs = (faqs || [])
      .filter((f: any) => f && (f.questionEn || f.questionAr))
      .map((f: any, i: number) => ({
        questionEn: (f.questionEn || f.questionAr || "").trim(),
        questionAr: (f.questionAr || f.questionEn || "").trim(),
        answerEn: (f.answerEn || f.answerAr || "").trim(),
        answerAr: (f.answerAr || f.answerEn || "").trim(),
        orderIndex: i
      }))

    const safeSocialLinks = (socialLinks || [])
      .filter((s: any) => s && s.url && String(s.url).trim() !== "")
      .map((s: any) => ({
        platform: s.platform || "WEBSITE",
        url: String(s.url).trim()
      }))

    const safeGallery = (gallery || [])
      .filter((g: any) => g && g.url && String(g.url).trim() !== "")
      .map((g: any, i: number) => ({
        url: String(g.url).trim(),
        captionEn: (g.captionEn || "").trim(),
        captionAr: (g.captionAr || "").trim(),
        orderIndex: i
      }))

    // Execute database transaction
    await db.$transaction([
      db.attractionPricing.deleteMany({ where: { attractionId: id } }),
      db.attractionFaq.deleteMany({ where: { attractionId: id } }),
      db.attractionSocialLink.deleteMany({ where: { attractionId: id } }),
      db.attractionGalleryItem.deleteMany({ where: { attractionId: id } }),
      db.attraction.update({
        where: { id },
        data: {
          nameEn: cleanNameEn,
          nameAr: cleanNameAr,
          slug: cleanSlug,
          descriptionEn: descriptionEn || "",
          descriptionAr: descriptionAr || "",
          taglineEn: taglineEn || "",
          taglineAr: taglineAr || "",
          mapUrl: mapUrl || "",
          ticketingUrl: ticketingUrl || "",
          logoUrl: logoUrl || "",
          heroMediaType: heroMediaType || "IMAGE",
          heroMediaUrl: heroMediaUrl || "",
          heroFallbackUrl: heroFallbackUrl || "",
          heroThumbnailUrl: heroThumbnailUrl || "",
          isPublished: Boolean(isPublished),
          isFeatured: Boolean(isFeatured),
          isHidden: Boolean(isHidden),
          features: Array.isArray(features) ? features : [],
          partnerOffers: Array.isArray(partnerOffers) ? partnerOffers : [],
          partners: Array.isArray(partners) ? partners : [],
          socialPreviews: Array.isArray(socialPreviews) ? socialPreviews : [],
          newsCoverage: Array.isArray(newsCoverage) ? newsCoverage : [],
          operations: mergedOperations,
          temporalStatus: temporalStatus || {},
          testimonials: Array.isArray(testimonials) ? testimonials : [],
          seo: seo || {},
          pricing: { create: safePricing },
          faqs: { create: safeFaqs },
          socialLinks: { create: safeSocialLinks },
          gallery: { create: safeGallery }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[ATTRACTION_FULL_PUT_ERROR]", error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "An attraction with this slug already exists. Please choose a unique slug." }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || "Failed to update attraction" }, { status: 500 })
  }
}
