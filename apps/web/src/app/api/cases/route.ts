import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Map editor schema to DB schema
    const newCase = await db.caseStudy.create({
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
        testimonials: [
          {
            quoteEn: testimonial?.quoteEn || "",
            quoteAr: testimonial?.quoteAr || "",
            authorName: testimonial?.author || ""
          }
        ]
      }
    })

    return NextResponse.json(newCase)
  } catch (error: any) {
    console.error("[CASES_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
