import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const publicOnly = searchParams.get("public") === "true"
    const contentType = searchParams.get("type")
    const featured = searchParams.get("featured") === "true"
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 50

    const where: any = {}
    if (publicOnly) {
      where.publishStatus = "PUBLISHED"
      where.restricted = false
    }
    if (contentType) {
      where.contentType = contentType
    }
    if (featured) {
      where.featured = true
    }

    const insights = await db.insight.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            designation: true,
            profileImage: true,
            slug: true
          }
        }
      },
      orderBy: [
        { featured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" }
      ],
      take: limit
    })

    return NextResponse.json({ data: insights })
  } catch (error: any) {
    console.error("[GET /api/insights] Error:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { titleEn, titleAr, contentType, slugEn, slugAr, bodyEn, bodyAr, excerptEn, excerptAr, publishStatus, featured, authorEmployeeProfileId, ...rest } = body

    if (!titleEn) {
      return NextResponse.json({ error: "English Title is required" }, { status: 400 })
    }

    const generatedSlug = slugEn || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    const newInsight = await db.insight.create({
      data: {
        titleEn,
        titleAr: titleAr || titleEn,
        slugEn: generatedSlug,
        slugAr: slugAr || generatedSlug,
        contentType: contentType || "ARTICLE",
        bodyEn,
        bodyAr,
        excerptEn,
        excerptAr,
        publishStatus: publishStatus || "DRAFT",
        publishedAt: publishStatus === "PUBLISHED" ? new Date() : null,
        featured: featured ?? false,
        authorEmployeeProfileId: authorEmployeeProfileId || null,
        createdBy: session?.user?.email || "ADMIN",
        ...rest
      }
    })

    return NextResponse.json({ data: newInsight })
  } catch (error: any) {
    console.error("[POST /api/insights] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create insight" }, { status: 500 })
  }
}
