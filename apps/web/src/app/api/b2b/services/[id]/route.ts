import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const service = await db.service.findUnique({
      where: { id },
      include: {
        gallery: { orderBy: { orderIndex: "asc" } },
        projects: true,
      },
    });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { gallery, projects, ...data } = body;

    const updated = await db.service.update({
      where: { id },
      data: { ...data },
    });

    if (gallery && Array.isArray(gallery)) {
      await db.serviceGalleryItem.deleteMany({ where: { serviceId: id } });
      if (gallery.length > 0) {
        await db.serviceGalleryItem.createMany({
          data: gallery.map((g: any, index: number) => ({
            serviceId: id,
            url: g.url,
            captionEn: g.captionEn,
            captionAr: g.captionAr,
            orderIndex: index,
          })),
        });
      }
    }

    if (projects && Array.isArray(projects)) {
      await db.serviceProject.deleteMany({ where: { serviceId: id } });
      if (projects.length > 0) {
        await db.serviceProject.createMany({
          data: projects.map((p: any) => ({
            serviceId: id,
            titleEn: p.titleEn,
            titleAr: p.titleAr,
            descriptionEn: p.descriptionEn,
            descriptionAr: p.descriptionAr,
            imageUrl: p.imageUrl,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
