import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all") === "true"

    const where = all ? {} : { isPublished: true }
    
    const caseStudies = await db.caseStudy.findMany({
      where,
      orderBy: { year: 'desc' }
    })

    return NextResponse.json({ success: true, caseStudies })
  } catch (error: any) {
    console.error("[CASES_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { slug, titleEn, titleAr } = body

    if (!slug || !titleEn || !titleAr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existing = await db.caseStudy.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Case study with this slug already exists" }, { status: 400 })
    }

    const caseStudy = await db.caseStudy.create({
      data: {
        slug,
        titleEn,
        titleAr,
        isPublished: false
      }
    })

    return NextResponse.json({ success: true, caseStudy })
  } catch (error: any) {
    console.error("[CASES_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
