import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const service = await db.service.findUnique({
      where: { id: params.id },
      include: {
        gallery: { orderBy: { orderIndex: 'asc' } },
        projects: true
      }
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { gallery, projects, ...data } = body

    // We'll update the main service record
    const updated = await db.service.update({
      where: { id: params.id },
      data: {
        ...data
      }
    })

    // To handle relations like gallery/projects properly in Prisma, 
    // we would ideally delete and recreate them or upsert.
    // For simplicity in this demo, if they are provided, we will delete and insert.
    if (gallery && Array.isArray(gallery)) {
      await db.serviceGalleryItem.deleteMany({ where: { serviceId: params.id } })
      if (gallery.length > 0) {
        await db.serviceGalleryItem.createMany({
          data: gallery.map((g: any, index: number) => ({
            serviceId: params.id,
            url: g.url,
            captionEn: g.captionEn,
            captionAr: g.captionAr,
            orderIndex: index
          }))
        })
      }
    }

    if (projects && Array.isArray(projects)) {
      await db.serviceProject.deleteMany({ where: { serviceId: params.id } })
      if (projects.length > 0) {
        await db.serviceProject.createMany({
          data: projects.map((p: any) => ({
            serviceId: params.id,
            titleEn: p.titleEn,
            titleAr: p.titleAr,
            descriptionEn: p.descriptionEn,
            descriptionAr: p.descriptionAr,
            imageUrl: p.imageUrl
          }))
        })
      }
    }

    return NextResponse.json({ success: true, service: updated })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await db.service.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
