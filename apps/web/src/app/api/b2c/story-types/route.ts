import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const activeOnly = url.searchParams.get("active") === "true"

    const totalCount = await db.storyType.count()
    if (totalCount === 0) {
      const defaultStoryTypes = [
        { slug: 'drive', titleEn: 'Drive', titleAr: 'القيادة', icon: 'car', accentColor: '#3b82f6', orderIndex: 1, isActive: true },
        { slug: 'bounce', titleEn: 'Bounce', titleAr: 'القفز والمرح', icon: 'activity', accentColor: '#f59e0b', orderIndex: 2, isActive: true },
        { slug: 'compete', titleEn: 'Compete', titleAr: 'التحدي والمنافسة', icon: 'trophy', accentColor: '#ef4444', orderIndex: 3, isActive: true },
        { slug: 'explore', titleEn: 'Explore', titleAr: 'الاستكشاف', icon: 'compass', accentColor: '#10b981', orderIndex: 4, isActive: true },
        { slug: 'celebrate', titleEn: 'Celebrate', titleAr: 'الاحتفال', icon: 'gift', accentColor: '#8b5cf6', orderIndex: 5, isActive: true },
        { slug: 'family-time', titleEn: 'Family Time', titleAr: 'وقت العائلة', icon: 'users', accentColor: '#ec4899', orderIndex: 6, isActive: true }
      ]
      for (const st of defaultStoryTypes) {
        await db.storyType.upsert({
          where: { slug: st.slug },
          update: {},
          create: st
        })
      }
    }

    const storyTypes = await db.storyType.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { orderIndex: 'asc' },
      include: {
        features: {
          include: {
            attraction: {
              select: {
                heroThumbnailUrl: true,
                heroMediaUrl: true,
                isPublished: true,
                slug: true,
                nameEn: true,
                nameAr: true,
                taglineEn: true,
                taglineAr: true,
              }
            }
          }
        },
        _count: {
          select: { features: true }
        }
      }
    })

    // Fetch published attractions to extract JSON features activations
    const publishedAttractions = await db.attraction.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        heroThumbnailUrl: true,
        heroMediaUrl: true,
        features: true,
      }
    })

    // Attach matching JSON features activations to each story type
    const enrichedStoryTypes = storyTypes.map((st: any) => {
      const jsonActivations: any[] = []

      publishedAttractions.forEach((attraction: any) => {
        const featList = Array.isArray(attraction.features) ? attraction.features : []
        featList.forEach((feat: any, idx: number) => {
          const storyTypeIds = Array.isArray(feat.storyTypeIds) 
            ? feat.storyTypeIds.map((s: string) => s.toLowerCase())
            : [(feat.storyType || '').toLowerCase()]
          
          if (storyTypeIds.includes(st.slug.toLowerCase())) {
            jsonActivations.push({
              id: feat.id || `${attraction.id}-feat-${idx}`,
              titleEn: feat.titleEn || feat.title || attraction.nameEn,
              titleAr: feat.titleAr || feat.title || attraction.nameAr,
              descriptionEn: feat.descriptionEn || feat.description || '',
              descriptionAr: feat.descriptionAr || feat.description || '',
              highlightType: feat.highlightType || "Activity",
              iconUrl: feat.iconUrl,
              imageUrl: feat.imageUrl || attraction.heroThumbnailUrl || attraction.heroMediaUrl,
              attractionSlug: attraction.slug,
              attractionNameEn: attraction.nameEn,
              attractionNameAr: attraction.nameAr
            })
          }
        })
      })

      return {
        ...st,
        activations: jsonActivations
      }
    })
    
    return NextResponse.json(enrichedStoryTypes)
  } catch (error: any) {
    console.error("[STORY_TYPES_GET_ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch story types" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 })
    }

    const body = await request.json()

    // Handle batch save of story types from StoryDiscoveryManager
    if (Array.isArray(body.storyTypes)) {
      const results: any[] = []
      for (let i = 0; i < body.storyTypes.length; i++) {
        const st = body.storyTypes[i]
        const cleanSlug = (st.slug || st.titleEn || `story-${Date.now()}-${i}`)
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

        if (st.id && !st.isNew) {
          const updated = await db.storyType.update({
            where: { id: st.id },
            data: {
              slug: cleanSlug,
              titleEn: st.titleEn || 'Story Track',
              titleAr: st.titleAr || st.titleEn || 'مسار قصة',
              descriptionEn: st.descriptionEn || null,
              descriptionAr: st.descriptionAr || null,
              icon: st.icon || null,
              coverMediaUrl: st.coverMediaUrl || null,
              accentColor: st.accentColor || '#8b5cf6',
              orderIndex: typeof st.orderIndex === 'number' ? st.orderIndex : i,
              isActive: st.isActive !== undefined ? st.isActive : true,
            }
          })
          results.push(updated)
        } else {
          const upserted = await db.storyType.upsert({
            where: { slug: cleanSlug },
            update: {
              titleEn: st.titleEn || 'Story Track',
              titleAr: st.titleAr || st.titleEn || 'مسار قصة',
              descriptionEn: st.descriptionEn || null,
              descriptionAr: st.descriptionAr || null,
              icon: st.icon || null,
              coverMediaUrl: st.coverMediaUrl || null,
              accentColor: st.accentColor || '#8b5cf6',
              orderIndex: typeof st.orderIndex === 'number' ? st.orderIndex : i,
              isActive: st.isActive !== undefined ? st.isActive : true,
            },
            create: {
              slug: cleanSlug,
              titleEn: st.titleEn || 'Story Track',
              titleAr: st.titleAr || st.titleEn || 'مسار قصة',
              descriptionEn: st.descriptionEn || null,
              descriptionAr: st.descriptionAr || null,
              icon: st.icon || null,
              coverMediaUrl: st.coverMediaUrl || null,
              accentColor: st.accentColor || '#8b5cf6',
              orderIndex: typeof st.orderIndex === 'number' ? st.orderIndex : i,
              isActive: st.isActive !== undefined ? st.isActive : true,
            }
          })
          results.push(upserted)
        }
      }
      return NextResponse.json({ success: true, count: results.length, data: results })
    }

    const { slug, titleEn, titleAr, descriptionEn, descriptionAr, icon, coverMediaUrl, accentColor, orderIndex, isActive } = body

    const cleanSlug = (slug || titleEn || `story-${Date.now()}`).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const storyType = await db.storyType.create({
      data: {
        slug: cleanSlug,
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        icon,
        coverMediaUrl,
        accentColor,
        orderIndex: orderIndex || 0,
        isActive: isActive !== undefined ? isActive : true,
      }
    })

    return NextResponse.json(storyType)
  } catch (error: any) {
    console.error("[STORY_TYPES_POST_ERROR]", error)
    return NextResponse.json({ error: "Failed to create story type" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 })
    }

    const body = await request.json()
    const { id, slug, titleEn, titleAr, descriptionEn, descriptionAr, icon, coverMediaUrl, accentColor, orderIndex, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "Missing Story Type ID" }, { status: 400 })
    }

    const storyType = await db.storyType.update({
      where: { id },
      data: {
        slug,
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        icon,
        coverMediaUrl,
        accentColor,
        orderIndex,
        isActive,
      }
    })

    return NextResponse.json(storyType)
  } catch (error: any) {
    console.error("[STORY_TYPES_PUT_ERROR]", error)
    return NextResponse.json({ error: "Failed to update story type" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    const slug = url.searchParams.get("slug")

    if (!id && !slug) {
      return NextResponse.json({ error: "Missing Story Type ID or slug" }, { status: 400 })
    }

    if (id) {
      await db.storyType.delete({ where: { id } })
    } else if (slug) {
      await db.storyType.delete({ where: { slug } })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[STORY_TYPES_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Failed to delete story type" }, { status: 500 })
  }
}
