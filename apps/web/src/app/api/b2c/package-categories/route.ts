import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const showAll = searchParams.get("all") === "true"

    const where: any = showAll ? {} : { isActive: true }

    const categories = await db.packageCategory.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            packages: {
              where: { isPublished: true, isTemplate: false }
            }
          }
        }
      }
    })

    return NextResponse.json({ data: categories })
  } catch (error: any) {
    console.error("[GET /api/b2c/package-categories] Error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { nameEn, nameAr, slug, descriptionEn, descriptionAr, icon, coverMediaUrl, theme, audience, sortOrder, isActive, isFeatured } = body

    if (!nameEn) {
      return NextResponse.json({ error: "Category name in English is required" }, { status: 400 })
    }

    const categorySlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-")
      : nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    const category = await db.packageCategory.create({
      data: {
        nameEn,
        nameAr: nameAr || nameEn,
        slug: categorySlug,
        descriptionEn,
        descriptionAr,
        icon: icon || "Sparkles",
        coverMediaUrl,
        theme: theme || "emerald",
        audience,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isFeatured: Boolean(isFeatured)
      }
    })

    return NextResponse.json({ data: category })
  } catch (error: any) {
    console.error("[POST /api/b2c/package-categories] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 })
  }
}
