import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { nameEn, nameAr, slug, descriptionEn, descriptionAr, pricing, faqs } = body

    // Use a transaction for deleting old relations and creating new ones
    await db.$transaction([
      db.attractionPricing.deleteMany({ where: { attractionId: id } }),
      db.attractionFaq.deleteMany({ where: { attractionId: id } }),
      db.attraction.update({
        where: { id },
        data: {
          nameEn,
          nameAr,
          slug,
          descriptionEn,
          descriptionAr,
          pricing: {
            create: pricing.map((p: any) => ({
              titleEn: p.titleEn,
              titleAr: p.titleAr,
              price: p.price,
              currency: p.currency,
              type: p.type
            }))
          },
          faqs: {
            create: faqs.map((f: any, i: number) => ({
              questionEn: f.questionEn,
              questionAr: f.questionAr,
              answerEn: f.answerEn,
              answerAr: f.answerAr,
              orderIndex: i
            }))
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[ATTRACTION_FULL_PUT_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
