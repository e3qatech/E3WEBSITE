import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

import { isAttractionActiveByDate } from "@/lib/cms-attractions"

import { memoryCache } from "@/lib/cache/memory-cache"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includePast = searchParams.get('includePast') === 'true' || searchParams.get('all') === 'true'
    const includeDrafts = searchParams.get('includeDrafts') === 'true'

    if (!includeDrafts) {
      const cacheKey = `api_b2c_attractions_v2_${includePast}`;
      const cachedData = await memoryCache.getOrSet(cacheKey, 60_000, async () => {
        const whereClause: any = {
          isPublished: true,
          isHidden: false,
        };

        const attractions = await db.attraction.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          include: {
            pricing: true,
            faqs: true,
            gallery: true,
            attractionLocations: {
              include: {
                location: true
              }
            }
          }
        });

        const filtered = includePast
          ? (attractions || [])
          : (attractions || []).filter((attr: any) => isAttractionActiveByDate(attr));

        return filtered;
      });

      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    const whereClause: any = {}
  } catch (error: any) {
    console.error("[ATTRACTIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch attractions" }, { status: 500 });
  }
}

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
        platform: String(s.platform || "WEB").trim().toUpperCase(),
        url: String(s.url).trim(),
        label: String(s.label || s.platform || "Link").trim()
      }))

    const safeGallery = (gallery || [])
      .filter((g: any) => g && (g.url || g.mediaUrl))
      .map((g: any, i: number) => ({
        url: String(g.url || g.mediaUrl).trim(),
        captionEn: String(g.captionEn || "").trim(),
        captionAr: String(g.captionAr || "").trim(),
        orderIndex: i
      }))

    const safeLocations = Array.isArray(body.locations) ? body.locations.map((loc: any) => ({
      nameEn: (loc.nameEn || loc.nameAr || "Venue Location").trim(),
      nameAr: (loc.nameAr || loc.nameEn || "موقع الوجهة").trim(),
      addressEn: (loc.addressEn || loc.addressAr || "Doha, Qatar").trim(),
      addressAr: (loc.addressAr || loc.addressEn || "الدوحة، قطر").trim(),
      latitude: typeof loc.latitude === 'number' ? loc.latitude : parseFloat(loc.latitude) || 25.2854,
      longitude: typeof loc.longitude === 'number' ? loc.longitude : parseFloat(loc.longitude) || 51.5310,
      pinColorToken: loc.pinColorToken || "CYAN",
      pinBadgeText: loc.pinBadgeText || "E3 VENUE",
      locationType: loc.locationType || "PERMANENT_ATTRACTION",
      status: loc.status || "OPEN"
    })) : []

    const attraction = await db.$transaction(async (tx: any) => {
      const { 
        nameEn, nameAr, slug, descriptionEn, descriptionAr, 
        taglineEn, taglineAr, mapUrl, ticketingUrl, logoUrl,
        heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl,
        motionPreset, motionIntensity, heroSceneType, particleDensity,
        isPublished, isFeatured, isHidden, isB2bVisible,
        b2bCategory, projectType, clientName, servicesDelivered,
        entityType, experienceFormat, accessModel, durationModel, environment, eventDetails,
        features, partnerOffers, partners, socialPreviews, newsCoverage, operations, temporalStatus, testimonials,
        pricing, faqs, socialLinks, gallery, seo
      } = body

      const attraction = await tx.attraction.create({
        data: {
          nameEn: cleanNameEn,
          nameAr: cleanNameAr,
          slug: cleanSlug,
          descriptionEn: (descriptionEn || "").trim(),
          descriptionAr: (descriptionAr || "").trim(),
          taglineEn: (taglineEn || "").trim(),
          taglineAr: (taglineAr || "").trim(),
          mapUrl: (mapUrl || "").trim(),
          ticketingUrl: (ticketingUrl || "").trim(),
          logoUrl: (logoUrl || "").trim(),
          heroMediaType: heroMediaType || "IMAGE",
          heroMediaUrl: (heroMediaUrl || "").trim(),
          heroFallbackUrl: (heroFallbackUrl || "").trim(),
          heroThumbnailUrl: (heroThumbnailUrl || "").trim(),
          isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
          isFeatured: Boolean(isFeatured),
          isHidden: Boolean(isHidden),
          isB2bVisible: isB2bVisible !== false,
          b2bCategory: b2bCategory || null,
          projectType: projectType || null,
          clientName: clientName || null,
          servicesDelivered: Array.isArray(servicesDelivered) ? servicesDelivered : (b2bCategory ? [b2bCategory] : []),
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
          testimonials: Array.isArray(testimonials) ? testimonials : [],
          operations: mergedOperations,
          temporalStatus: temporalStatus || "OPEN",
          pricing: { create: safePricing },
          faqs: { create: safeFaqs },
          socialLinks: { create: safeSocialLinks },
          gallery: { create: safeGallery },
          seo: typeof seo === 'object' && seo !== null ? seo : {}
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

      return attraction
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
