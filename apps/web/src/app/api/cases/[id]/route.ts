import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updatedCase = await db.caseStudy.update({
      where: { id },
      data: body
    })

    return NextResponse.json(updatedCase)
  } catch (error: any) {
    console.error("[CASE_PATCH_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      slug,
      title,
      clientName,
      category,
      year,
      duration,
      challenge,
      solution,
      testimonial,
      isPublished,
      isFeatured,
      telemetry,
      beforeImage,
      afterImage
    } = body

    const updatedCase = await db.caseStudy.update({
      where: { id },
      data: {
        slug,
        titleEn: title.en,
        titleAr: title.ar,
        clientName: clientName || "Unknown Client",
        year: year || 2024,
        category: category[0] || "Corporate",
        isFeatured: isFeatured || false,
        isPublished: isPublished || false,
        heroImageUrl: afterImage || "",
        thumbnailUrl: afterImage || "",
        challengeEn: challenge.en,
        challengeAr: challenge.ar,
        solutionEn: solution.en,
        solutionAr: solution.ar,
        beforeAfter: {
          beforeUrl: beforeImage || "",
          afterUrl: afterImage || ""
        },
        metrics: telemetry?.map((m: any) => ({
          label: m.labelEn,
          value: m.valueEn,
          labelAr: m.labelAr || "",
          valueAr: m.valueAr || ""
        })) || [],
        testimonial: {
          quote: testimonial?.quoteEn || "",
          quoteAr: testimonial?.quoteAr || "",
          authorName: testimonial?.author || ""
        }
      }
    })

    return NextResponse.json(updatedCase)
  } catch (error: any) {
    console.error("[CASE_PUT_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await db.caseStudy.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Case study deleted" })
  } catch (error: any) {
    console.error("[CASE_DELETE_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
