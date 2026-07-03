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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      slug, titleEn, titleAr, taglineEn, taglineAr, thumbnail, contentEn, contentAr,
      isFeatured, isVisible, isPublished, heroMediaType, heroMediaUrl, process,
      ctaPrimary, ctaSecondary, seo, gallery, projects, attractionId
    } = body

    await db.$transaction([
      db.serviceGalleryItem.deleteMany({ where: { serviceId: id } }),
      db.serviceProject.deleteMany({ where: { serviceId: id } }),
      db.service.update({
        where: { id },
        data: {
          slug, titleEn, titleAr, taglineEn, taglineAr, thumbnail, contentEn, contentAr,
          isFeatured, isVisible, isPublished, heroMediaType, heroMediaUrl, process,
          ctaPrimary, ctaSecondary, seo, attractionId: attractionId || null,
          gallery: {
            create: (gallery || []).map((g: any, i: number) => ({
              url: g.url,
              captionEn: g.captionEn,
              captionAr: g.captionAr,
              orderIndex: i
            }))
          },
          projects: {
            create: (projects || []).map((p: any) => ({
              titleEn: p.titleEn,
              titleAr: p.titleAr,
              descriptionEn: p.descriptionEn,
              descriptionAr: p.descriptionAr,
              imageUrl: p.imageUrl,
              attractionId: p.attractionId || null
            }))
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[SERVICE_PUT_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db.service.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[SERVICE_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
