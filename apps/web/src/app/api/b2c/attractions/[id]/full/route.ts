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
        isPublished, isFeatured, isHidden, isB2bVisible,
        b2bCategory, projectType, clientName, servicesDelivered,
        entityType, experienceFormat, accessModel, durationModel, environment, eventDetails,
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

      const safeFeatures = (features || [])
        .filter((f: any) => f && (f.titleEn || f.nameEn || f.title || f.titleAr || f.nameAr))
        .map((f: any, i: number) => ({
          attractionId: id,
          titleEn: (f.titleEn || f.nameEn || f.title || f.titleAr || f.nameAr || "Activity").trim(),
          titleAr: (f.titleAr || f.nameAr || f.titleEn || f.nameEn || "نشاط").trim(),
          descriptionEn: (f.descriptionEn || f.description || f.descEn || "").trim(),
          descriptionAr: (f.descriptionAr || f.description || f.descAr || "").trim(),
          imageUrl: f.imageUrl || "",
          iconUrl: f.iconUrl || "",
          highlightType: f.highlightType || f.contentType || "ACTIVITY",
          intensityLevel: f.intensityLevel || "MEDIUM",
          durationMinutes: f.durationMinutes !== null && f.durationMinutes !== undefined && !isNaN(parseInt(f.durationMinutes)) ? parseInt(f.durationMinutes) : null,
          minAge: f.minAge !== null && f.minAge !== undefined && !isNaN(parseInt(f.minAge)) ? parseInt(f.minAge) : null,
          minHeightCm: f.minHeightCm !== null && f.minHeightCm !== undefined && !isNaN(parseInt(f.minHeightCm)) ? parseInt(f.minHeightCm) : null,
          linkedBrandId: f.linkedBrandId || null,
          showBrandLogo: Boolean(f.showBrandLogo),
          orderIndex: i
        }))

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

      const safeBrandPlacements = (brandPlacements || [])
        .filter((p: any) => p && p.brandId)
        .map((p: any, i: number) => ({
          brandId: p.brandId.trim(),
          role: p.role || "HOSTED_EXPERIENCE",
          isVisible: Boolean(p.isVisible),
          displayOrder: i
        }))

      // Execute database transaction
      await db.$transaction(async (tx: any) => {
        await tx.attractionPricing.deleteMany({ where: { attractionId: id } })
        await tx.attractionFaq.deleteMany({ where: { attractionId: id } })
        await tx.attractionSocialLink.deleteMany({ where: { attractionId: id } })
        await tx.attractionGalleryItem.deleteMany({ where: { attractionId: id } })
        await tx.attractionFeature.deleteMany({ where: { attractionId: id } })
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
            ...(isB2bVisible !== undefined ? { isB2bVisible: Boolean(isB2bVisible) } : {}),
            ...(b2bCategory !== undefined ? { b2bCategory: b2bCategory || null } : {}),
            ...(projectType !== undefined ? { projectType: projectType || null } : {}),
            ...(clientName !== undefined ? { clientName: clientName || null } : {}),
            ...(servicesDelivered !== undefined ? { servicesDelivered: Array.isArray(servicesDelivered) ? servicesDelivered : (b2bCategory ? [b2bCategory] : []) } : {}),
            entityType: entityType || "ATTRACTION",
            experienceFormat: experienceFormat || "PERMANENT_FEC",
            accessModel: accessModel || "PAID",
            durationModel: durationModel || "PERMANENT",
            environment: environment || "INDOOR",
            eventDetails: eventDetails || null,
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

        // Link canonical locations via AttractionLocation join model
        if (Array.isArray(locations) && locations.length > 0) {
          await tx.attractionLocation.deleteMany({ where: { attractionId: id } })
          for (let i = 0; i < locations.length; i++) {
            const loc = locations[i]
            if (loc.locationId) {
              await tx.attractionLocation.create({
                data: {
                  attractionId: id,
                  locationId: loc.locationId,
                  isPrimary: Boolean(loc.isPrimary || i === 0),
                  mapVisible: loc.mapVisible !== false,
                  shortLabelEn: loc.shortLabelEn || null,
                  shortLabelAr: loc.shortLabelAr || null,
                  bookingUrlOverride: loc.bookingUrlOverride || null,
                  startingPriceOverride: typeof loc.startingPriceOverride === 'number' ? loc.startingPriceOverride : (parseFloat(loc.startingPriceOverride) || null),
                  sortOrder: i
                }
              })
            }
          }
        }

        // Create relational features and link to storyTypes
        const featuresArr = Array.isArray(features) ? features.filter(f => f && (f.titleEn || f.titleAr)) : []
        for (let i = 0; i < featuresArr.length; i++) {
          const f = featuresArr[i]
          const primaryId = f.primaryStoryTypeId || null
          const secondaryFiltered = Array.isArray(f.secondaryStoryTypeIds) 
            ? f.secondaryStoryTypeIds.filter((s: string) => s && s !== primaryId)
            : []
          const storyIds = [
            primaryId,
            ...secondaryFiltered,
            ...(Array.isArray(f.storyTypeIds) ? f.storyTypeIds.filter((s: string) => s && s !== primaryId) : [])
          ].filter(Boolean)
          const uniqueStoryIds = Array.from(new Set(storyIds))

          await tx.attractionFeature.create({
            data: {
              attractionId: id,
              titleEn: (f.titleEn || f.titleAr || "Feature").trim(),
              titleAr: (f.titleAr || f.titleEn || "ميزة").trim(),
              descriptionEn: (f.descriptionEn || "").trim(),
              descriptionAr: (f.descriptionAr || "").trim(),
              imageUrl: String(f.imageUrl || "").trim(),
              iconUrl: String(f.iconUrl || "").trim(),
              highlightType: String(f.contentType || f.highlightType || "ACTIVITY").trim(),
              primaryStoryTypeId: primaryId,
              secondaryStoryTypeIds: secondaryFiltered.length > 0 ? secondaryFiltered : null,
              intensityLevel: f.intensityLevel || "MEDIUM",
              durationMinutes: f.durationMinutes || null,
              minAge: f.minAge || null,
              minHeightCm: f.minHeightCm || null,
              targetAudience: f.targetAudience || null,
              linkedBrandId: f.linkedBrandId ? String(f.linkedBrandId).trim() : null,
              showBrandLogo: Boolean(f.showBrandLogo),
              logoVariant: String(f.logoVariant || "AUTO").trim(),
              orderIndex: i,
              storyTypes: uniqueStoryIds.length > 0
                ? {
                    connect: uniqueStoryIds.map((sid: string) => ({ id: sid }))
                  }
                : undefined
            }
          })
        }
      })
    // Invalidate Redis caches and Next.js static paths
    try {
      const { redis } = await import("@/lib/redis")
      if (redis?.del) {
        await redis.del(`attractions:detail:${id}`)
        if (redis?.keys) {
          const attrKeys = await redis.keys("attractions:*")
          if (attrKeys && attrKeys.length > 0) await redis.del(...attrKeys)
          const calKeys = await redis.keys("calendar:*")
          if (calKeys && calKeys.length > 0) await redis.del(...calKeys)
        }
      }
    } catch (_err) {}

    try {
      const { revalidatePath } = await import("next/cache")
      revalidatePath("/[locale]/b2c", "page")
      revalidatePath("/[locale]/b2c/calendar", "page")
      revalidatePath("/[locale]/b2c/attractions", "page")
      revalidatePath(`/[locale]/b2c/attractions/${cleanSlug}`, "page")
      revalidatePath("/[locale]", "layout")
    } catch (_err) {}

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[ATTRACTION_FULL_PUT_ERROR]", error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "An attraction with this slug already exists. Please choose a unique slug." }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || "Failed to update attraction" }, { status: 500 })
  }
}
