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
    const { sourceId, templateType, nameEn, nameAr, slug, options = {} } = body

    if (!nameEn || !slug) {
      return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 })
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Check slug uniqueness
    const existing = await db.attraction.findFirst({ where: { slug: cleanSlug } })
    if (existing) {
      return NextResponse.json({ error: "An attraction with this slug already exists. Please choose a unique slug." }, { status: 400 })
    }

    let createdId: string

    if (sourceId) {
      // Clone from existing source attraction
      const source = await db.attraction.findUnique({
        where: { id: sourceId },
        include: {
          pricing: true,
          faqs: true,
          gallery: true,
          featuresList: {
            include: { storyTypes: true }
          },
          attractionLocations: true
        }
      })

      if (!source) {
        return NextResponse.json({ error: "Source attraction not found" }, { status: 404 })
      }

      const created = await db.attraction.create({
        data: {
          slug: cleanSlug,
          nameEn: nameEn.trim(),
          nameAr: (nameAr || nameEn).trim(),
          taglineEn: source.taglineEn,
          taglineAr: source.taglineAr,
          descriptionEn: source.descriptionEn,
          descriptionAr: source.descriptionAr,
          heroMediaType: source.heroMediaType,
          heroMediaUrl: source.heroMediaUrl,
          heroFallbackUrl: source.heroFallbackUrl,
          heroThumbnailUrl: source.heroThumbnailUrl,
          logoUrl: source.logoUrl,
          isPublished: false, // cloned draft
          isFeatured: false,
          isB2bVisible: true,
          operations: source.operations as any,
          temporalStatus: source.temporalStatus as any,
          testimonials: (options.copyPartners ? source.testimonials : []) as any,
          partners: (options.copyPartners ? source.partners : []) as any,
          newsCoverage: (options.copyPartners ? source.newsCoverage : []) as any,
          socialPreviews: source.socialPreviews as any,
          seo: source.seo as any,
        }
      })
      createdId = created.id

      // Clone Pricing
      if (options.copyPricing && source.pricing.length > 0) {
        await db.attractionPricing.createMany({
          data: source.pricing.map((p: any) => ({
            attractionId: createdId,
            titleEn: p.titleEn,
            titleAr: p.titleAr,
            descriptionEn: p.descriptionEn,
            descriptionAr: p.descriptionAr,
            price: p.price,
            discount: p.discount,
            currency: p.currency,
            type: p.type
          }))
        })
      }

      // Clone FAQs
      if (options.copyFaqs && source.faqs.length > 0) {
        await db.attractionFaq.createMany({
          data: source.faqs.map((f: any, i: number) => ({
            attractionId: createdId,
            questionEn: f.questionEn,
            questionAr: f.questionAr,
            answerEn: f.answerEn,
            answerAr: f.answerAr,
            orderIndex: i
          }))
        })
      }

      // Clone Gallery
      if (options.copyGallery && source.gallery.length > 0) {
        await db.attractionGalleryItem.createMany({
          data: source.gallery.map((g: any, i: number) => ({
            attractionId: createdId,
            url: g.url,
            captionEn: g.captionEn,
            captionAr: g.captionAr,
            orderIndex: i
          }))
        })
      }

      // Clone Features / Activities
      if (options.copyActivities && source.featuresList.length > 0) {
        for (let i = 0; i < source.featuresList.length; i++) {
          const f = source.featuresList[i]
          const storyIds = f.storyTypes?.map((st: any) => st.id) || []
          await db.attractionFeature.create({
            data: {
              attractionId: createdId,
              titleEn: f.titleEn,
              titleAr: f.titleAr,
              descriptionEn: f.descriptionEn,
              descriptionAr: f.descriptionAr,
              imageUrl: f.imageUrl,
              iconUrl: f.iconUrl,
              highlightType: f.highlightType,
              linkedBrandId: f.linkedBrandId,
              showBrandLogo: f.showBrandLogo,
              orderIndex: i,
              storyTypes: storyIds.length > 0
                ? { connect: storyIds.map((sid: string) => ({ id: sid })) }
                : undefined
            }
          })
        }
      }

      // Link same canonical locations
      if (source.attractionLocations.length > 0) {
        for (let i = 0; i < source.attractionLocations.length; i++) {
          const al = source.attractionLocations[i]
          await db.attractionLocation.create({
            data: {
              attractionId: createdId,
              locationId: al.locationId,
              isPrimary: al.isPrimary,
              mapVisible: al.mapVisible,
              sortOrder: i
            }
          })
        }
      }
    } else {
      // Create from industry template
      const created = await db.attraction.create({
        data: {
          slug: cleanSlug,
          nameEn: nameEn.trim(),
          nameAr: (nameAr || nameEn).trim(),
          taglineEn: "Next-Generation Entertainment Experience",
          taglineAr: "تجربة ترفيهية استثنائية",
          descriptionEn: "A premier entertainment and interactive activity destination.",
          descriptionAr: "وجهة ترفيهية رائدة تقدم أحدث الأنشطة والتحديات التفاعلية.",
          heroMediaType: "IMAGE",
          heroMediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
          isPublished: false,
          isFeatured: false,
          isB2bVisible: true
        }
      })
      createdId = created.id

      // Seed standard template pricing
      await db.attractionPricing.create({
        data: {
          attractionId: createdId,
          titleEn: "Standard Admission",
          titleAr: "تذكرة الدخول الأساسية",
          price: 50,
          currency: "QAR",
          type: "ACCESS_PASS"
        }
      })
    }

    return NextResponse.json({ success: true, id: createdId, slug: cleanSlug })
  } catch (error: any) {
    console.error("[DUPLICATE_ATTRACTION_ERROR]", error)
    return NextResponse.json({ error: error.message || "Failed to duplicate attraction" }, { status: 500 })
  }
}
