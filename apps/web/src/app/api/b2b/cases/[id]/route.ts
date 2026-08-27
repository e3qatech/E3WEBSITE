import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT_ADMIN",
  "SALES_ADMIN",
  "CONTENT_MANAGER",
  "EDITOR",
  "STAFF",
  "OPERATIONS",
  "MARKETING",
];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Find existing case study by id or slug
    const existing = await db.caseStudy.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    // Fast path: visibility or featured toggle
    if (Object.keys(body).length <= 2 && (body.isPublished !== undefined || body.isFeatured !== undefined)) {
      const updated = await db.caseStudy.update({
        where: { id: existing.id },
        data: {
          ...(body.isPublished !== undefined && { isPublished: Boolean(body.isPublished) }),
          ...(body.isFeatured !== undefined && { isFeatured: Boolean(body.isFeatured) }),
        },
      });
      return NextResponse.json({ success: true, caseStudy: updated });
    }

    const { 
      slug, titleEn, titleAr, clientName, year, category,
      heroMediaType, heroImageUrl, 
      thumbnailMediaType, thumbnailUrl, 
      clientLogoUrl,
      challengeEn, challengeAr, solutionEn, solutionAr, resultEn, resultAr,
      isFeatured, isPublished,
      gallery, metrics, technicalSpecs, servicesUsed,
      attractionId, teamMembers, testimonials, seo
    } = body;

    await db.$transaction(async (tx: any) => {
      // 1. Delete existing team members if teamMembers array provided
      if (teamMembers !== undefined) {
        await tx.caseStudyTeamMember.deleteMany({
          where: { caseStudyId: existing.id },
        });
      }

      // 2. Update case study
      await tx.caseStudy.update({
        where: { id: existing.id },
        data: {
          ...(slug && { slug: slug.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }),
          ...(titleEn && { titleEn }),
          ...(titleAr && { titleAr }),
          ...(clientName !== undefined && { clientName }),
          ...(category !== undefined && { category }),
          ...(year && { year: parseInt(year) }),
          ...(heroMediaType !== undefined && { heroMediaType }),
          ...(heroImageUrl !== undefined && { heroImageUrl }),
          ...(thumbnailMediaType !== undefined && { thumbnailMediaType }),
          ...(thumbnailUrl !== undefined && { thumbnailUrl }),
          ...(clientLogoUrl !== undefined && { clientLogoUrl }),
          ...(challengeEn !== undefined && { challengeEn }),
          ...(challengeAr !== undefined && { challengeAr }),
          ...(solutionEn !== undefined && { solutionEn }),
          ...(solutionAr !== undefined && { solutionAr }),
          ...(resultEn !== undefined && { resultEn }),
          ...(resultAr !== undefined && { resultAr }),
          ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
          ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
          ...(attractionId !== undefined && { attractionId: attractionId || null }),
          ...(gallery !== undefined && { gallery }),
          ...(metrics !== undefined && { metrics }),
          ...(technicalSpecs !== undefined && { technicalSpecs }),
          ...(servicesUsed !== undefined && { servicesUsed }),
          ...(testimonials !== undefined && { testimonials }),
          ...(seo !== undefined && { seo }),
          ...(teamMembers && teamMembers.length > 0 && {
            teamMembers: {
              create: teamMembers.map((tm: any, i: number) => ({
                employeeProfileId: tm.employeeProfileId,
                roleEn: tm.roleEn,
                roleAr: tm.roleAr,
                orderIndex: i,
              })),
            },
          }),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[CASE_PUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.caseStudy.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    await db.caseStudy.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[CASE_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
