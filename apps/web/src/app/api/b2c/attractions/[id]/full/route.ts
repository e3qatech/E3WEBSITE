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
      pricing, faqs, socialLinks, gallery, seo, locations, brandPlacements
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

    const safeLocations = (locations || [])
      .filter((l: any) => l && l.nameEn)
      .map((l: any, i: number) => ({
        nameEn: l.nameEn.trim(),
        nameAr: (l.nameAr || l.nameEn).trim(),
        venueEn: (l.venueEn || "").trim(),
        ticketingUrl: (l.ticketingUrl || "").trim(),
        isPrimary: Boolean(l.isPrimary),
        isPublished: Boolean(l.isPublished),
        displayOrder: i
      }))

    const safeBrandPlacements = (brandPlacements || [])
      .filter((p: any) => p && p.brandId)
      .map((p: any, i: number) => ({
        brandId: p.brandId.trim(),
        role: p.role || "HOSTED_EXPERIENCE",
        isVisible: Boolean(p.isVisible),
        displayOrder: i
      }))

    // Execute database transaction
    // Execute database transaction
    await db.$transaction(async (tx: any) => {
      await tx.attractionPricing.deleteMany({ where: { attractionId: id } })
      await tx.attractionFaq.deleteMany({ where: { attractionId: id } })
      await tx.attractionSocialLink.deleteMany({ where: { attractionId: id } })
      await tx.attractionGalleryItem.deleteMany({ where: { attractionId: id } })
      await tx.attractionFeature.deleteMany({ where: { attractionId: id } })
      await tx.location.deleteMany({ where: { attractionId: id } })
      await tx.brandPlacement.deleteMany({ where: { attractionId: id } })
      
      await tx.attraction.update({
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
            attractionId: id
          }
        })
        createdLocations.push(created)
      }

      // Create features and link to locations
      const featuresArr = Array.isArray(features) ? features.filter(f => f && (f.titleEn || f.titleAr)) : []
      for (let i = 0; i < featuresArr.length; i++) {
        const f = featuresArr[i]
        
        // Find which location IDs this feature should be linked to
        const locationIdsToConnect = Array.isArray(f.locationIndexes) 
          ? f.locationIndexes
              .map((idx: number) => createdLocations[idx]?.id)
              .filter(Boolean)
          : []

        await tx.attractionFeature.create({
          data: {
            attractionId: id,
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[ATTRACTION_FULL_PUT_ERROR]", error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "An attraction with this slug already exists. Please choose a unique slug." }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || "Failed to update attraction" }, { status: 500 })
  }
}
