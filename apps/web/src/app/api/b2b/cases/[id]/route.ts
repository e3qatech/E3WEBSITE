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
      slug, titleEn, titleAr, clientName, year, category,
      heroImageUrl, thumbnailUrl, clientLogoUrl,
      challengeEn, challengeAr, solutionEn, solutionAr,
      isFeatured, isPublished,
      gallery, metrics, technicalSpecs, servicesUsed,
      attractionId, teamMembers, testimonials
    } = body

    await db.$transaction(async (tx) => {
      // 1. Delete existing team members
      await tx.caseStudyTeamMember.deleteMany({
        where: { caseStudyId: id }
      })

      // 2. Update case study
      await tx.caseStudy.update({
        where: { id },
        data: {
          slug, titleEn, titleAr, clientName, category,
          year: year ? parseInt(year) : 2024,
          heroImageUrl, thumbnailUrl, clientLogoUrl,
          challengeEn, challengeAr, solutionEn, solutionAr,
          isFeatured, isPublished,
          attractionId: attractionId || null,
          gallery: gallery || [],
          metrics: metrics || [],
          technicalSpecs: technicalSpecs || [],
          servicesUsed: servicesUsed || [],
          testimonials: testimonials || [],
          ...(teamMembers && teamMembers.length > 0 && {
            teamMembers: {
              create: teamMembers.map((tm: any, i: number) => ({
                teamMemberId: tm.teamMemberId,
                roleEn: tm.roleEn,
                roleAr: tm.roleAr,
                orderIndex: i
              }))
            }
          })
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[CASE_PUT_ERROR]", error)
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

    await db.caseStudy.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[CASE_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
