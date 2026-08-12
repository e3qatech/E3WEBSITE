import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 })
    }

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

    const cleanNameEn = (nameEn || nameAr || slug || "New Attraction").trim()
    const cleanNameAr = (nameAr || nameEn || slug || "وجهة جديدة").trim()
    const cleanSlug = (slug || nameEn || `attraction-${Date.now()}`).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const mergedOperations = {
      ...(typeof operations === 'object' && operations !== null ? operations : {}),
      motionPreset: motionPreset || "MEDIA_CINEMATIC",
      motionIntensity: motionIntensity || "MEDIUM",
      heroSceneType: heroSceneType || "CINEMATIC_MEDIA",
      particleDensity: particleDensity !== undefined ? Number(particleDensity) : 50,
    }

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

    // Extract safeLocations and safeBrandPlacements since we'll process them in the transaction
    const safeLocations = (body.locations || [])
      .filter((l: any) => l && (l.nameEn || l.nameAr))
      .map((l: any) => ({
        nameEn: (l.nameEn || l.nameAr || "").trim(),
        nameAr: (l.nameAr || l.nameEn || "").trim(),
        addressEn: (l.addressEn || "").trim(),
        addressAr: (l.addressAr || "").trim(),
        coordinates: l.coordinates || {},
        bookingUrl: (l.bookingUrl || "").trim()
      }))

    const safeBrandPlacements = (body.brandPlacements || [])
      .filter((bp: any) => bp && bp.brandId)
      .map((bp: any) => ({
        brandId: bp.brandId,
        isPrimary: Boolean(bp.isPrimary),
        type: bp.type || "HOSTED"
      }))

    let attraction: any;
    
    await db.$transaction(async (tx: any) => {
      attraction = await tx.attraction.create({
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
          gallery: { create: safeGallery },
          brandPlacements: { create: safeBrandPlacements },
        }
      })

      // Create locations and store them to reference their IDs
      const createdLocations: any[] = []
      for (const loc of safeLocations) {
        const created = await tx.location.create({
          data: {
            ...loc,
            attractionId: attraction.id
          }
        })
        createdLocations.push(created)
      }

      // Create features and link to locations
      const featuresArr = Array.isArray(features) ? features.filter(f => f && (f.titleEn || f.titleAr)) : []
      for (let i = 0; i < featuresArr.length; i++) {
        const f = featuresArr[i]
        
        const locationIdsToConnect = Array.isArray(f.locationIndexes) 
          ? f.locationIndexes
              .map((idx: number) => createdLocations[idx]?.id)
              .filter(Boolean)
          : []

        await tx.attractionFeature.create({
          data: {
            attractionId: attraction.id,
            titleEn: (f.titleEn || f.titleAr || "Feature").trim(),
            titleAr: (f.titleAr || f.titleEn || "ميزة").trim(),
            descriptionEn: (f.descriptionEn || "").trim(),
            descriptionAr: (f.descriptionAr || "").trim(),
            imageUrl: String(f.imageUrl || "").trim(),
            iconUrl: String(f.iconUrl || "").trim(),
            highlightType: String(f.highlightType || "ACTIVITY").trim(),
            linkedBrandId: f.linkedBrandId ? String(f.linkedBrandId).trim() : null,
            showBrandLogo: Boolean(f.showBrandLogo),
            logoVariant: String(f.logoVariant || "AUTO").trim(),
            orderIndex: i,
            storyTypes: Array.isArray(f.storyTypeIds) && f.storyTypeIds.length > 0
              ? {
                  connect: f.storyTypeIds.map((sid: string) => ({ id: sid }))
                }
              : undefined,
            availableAt: locationIdsToConnect.length > 0
              ? { connect: locationIdsToConnect.map((locId: string) => ({ id: locId })) }
              : undefined
          }
        })
      }
    })

    return NextResponse.json(attraction)
  } catch (error: any) {
    console.error("[ATTRACTION_POST_ERROR]", error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "An attraction with this slug already exists. Please choose a unique slug." }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || "Failed to create attraction" }, { status: 500 })
  }
}
