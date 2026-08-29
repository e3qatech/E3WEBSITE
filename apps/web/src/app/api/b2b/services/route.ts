import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all") === "true"

    const where = all ? {} : { isVisible: true, isPublished: true }
    
    const services = await db.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        projects: true,
        gallery: { orderBy: { orderIndex: 'asc' } }
      }
    })

    return NextResponse.json({ success: true, services })
  } catch (error: any) {
    console.error("[SERVICES_GET_ERROR]", error)
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

    const existing = await db.service.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Service with this slug already exists" }, { status: 400 })
    }

    const service = await db.service.create({
      data: {
        slug,
        titleEn,
        titleAr,
        isVisible: false
      }
    })

    return NextResponse.json({ success: true, service })
  } catch (error: any) {
    console.error("[SERVICES_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
