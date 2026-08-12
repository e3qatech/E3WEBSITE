import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const activeOnly = url.searchParams.get("active") === "true"

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
    
    return NextResponse.json(storyTypes)
  } catch (error: any) {
    console.error("[STORY_TYPES_GET_ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch story types" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 })
    }

    const body = await request.json()
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
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
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
