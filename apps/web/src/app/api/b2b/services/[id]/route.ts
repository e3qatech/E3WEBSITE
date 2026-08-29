import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      slug, titleEn, titleAr, taglineEn, taglineAr, thumbnail, contentEn, contentAr,
      isFeatured, isVisible, isPublished, heroMediaType, heroMediaUrl, process,
      ctaPrimary, ctaSecondary, seo, gallery, projects, attractionId,
      category, successMetricLabel, successMetricValue
    } = body;

    const existing = await db.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const targetId = existing.id;

    await db.$transaction([
      db.serviceGalleryItem.deleteMany({ where: { serviceId: targetId } }),
      db.serviceProject.deleteMany({ where: { serviceId: targetId } }),
      db.service.update({
        where: { id: targetId },
        data: {
          slug: slug !== undefined ? slug : existing.slug,
          titleEn: titleEn !== undefined ? titleEn : existing.titleEn,
          titleAr: titleAr !== undefined ? titleAr : existing.titleAr,
          taglineEn: taglineEn !== undefined ? taglineEn : existing.taglineEn,
          taglineAr: taglineAr !== undefined ? taglineAr : existing.taglineAr,
          thumbnail: thumbnail !== undefined ? thumbnail : existing.thumbnail,
          contentEn: contentEn !== undefined ? contentEn : existing.contentEn,
          contentAr: contentAr !== undefined ? contentAr : existing.contentAr,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
          isVisible: isVisible !== undefined ? Boolean(isVisible) : existing.isVisible,
          isPublished: isPublished !== undefined ? Boolean(isPublished) : (isVisible !== undefined ? Boolean(isVisible) : existing.isPublished),
          heroMediaType: heroMediaType || existing.heroMediaType || "IMAGE",
          heroMediaUrl: heroMediaUrl !== undefined ? heroMediaUrl : existing.heroMediaUrl,
          process: process !== undefined ? process : existing.process,
          ctaPrimary: ctaPrimary || existing.ctaPrimary || "BRIEF_BUILDER",
          ctaSecondary: ctaSecondary !== undefined ? ctaSecondary : existing.ctaSecondary,
          seo: seo !== undefined ? seo : existing.seo,
          attractionId: attractionId ? attractionId : null,
          category: category !== undefined ? category : existing.category,
          successMetricLabel: successMetricLabel !== undefined ? successMetricLabel : existing.successMetricLabel,
          successMetricValue: successMetricValue !== undefined ? successMetricValue : existing.successMetricValue,
          gallery: {
            create: (gallery || []).map((g: any, i: number) => ({
              url: g.url || g.mediaUrl || "",
              captionEn: g.captionEn || g.titleEn || null,
              captionAr: g.captionAr || g.titleAr || null,
              orderIndex: g.orderIndex !== undefined ? g.orderIndex : i
            }))
          },
          projects: {
            create: (projects || []).map((p: any) => ({
              titleEn: p.titleEn,
              titleAr: p.titleAr,
              descriptionEn: p.descriptionEn || null,
              descriptionAr: p.descriptionAr || null,
              imageUrl: p.imageUrl || null,
              attractionId: p.attractionId || null
            }))
          }
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SERVICE_PUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.service.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SERVICE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
