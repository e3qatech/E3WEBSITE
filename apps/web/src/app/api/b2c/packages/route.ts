import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const venue = searchParams.get("venue")
    const attraction = searchParams.get("attraction")
    const audience = searchParams.get("audience")
    const packageType = searchParams.get("packageType")
    const featured = searchParams.get("featured") === "true"
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined
    const guests = searchParams.get("guests") ? parseInt(searchParams.get("guests")!) : undefined
    const sort = searchParams.get("sort") || "recommended"
    const showAll = searchParams.get("all") === "true" || searchParams.get("includeDrafts") === "true"
    const includeTemplates = searchParams.get("templates") === "true"

    const session = await auth()
    const isAdmin = Boolean(session?.user)

    const where: any = {}

    // Filter by publish status unless admin specifically requests all/drafts
    if (!showAll) {
      where.isPublished = true
      where.status = "PUBLISHED"
    }

    // By default, exclude templates unless requested by admin
    if (!includeTemplates && !showAll) {
      where.isTemplate = false
    } else if (includeTemplates) {
      where.isTemplate = true
    }

    // Category filter: support category slug or uppercase enum string
    if (category && category !== "ALL") {
      where.OR = [
        { category: category.toUpperCase() },
        { categoryRel: { slug: category.toLowerCase() } }
      ]
    }

    if (packageType) {
      where.packageType = packageType.toUpperCase()
    }

    if (featured) {
      where.isFeatured = true
    }

    if (attraction) {
      where.OR = [
        ...(where.OR || []),
        { attractionId: attraction },
        { attraction: { slug: attraction } }
      ]
    }

    if (venue) {
      where.OR = [
        ...(where.OR || []),
        { locationId: venue },
        { location: { slug: venue } }
      ]
    }

    if (audience) {
      where.audienceTypes = {
        array_contains: audience.toUpperCase()
      }
    }

    if (guests) {
      where.minGuests = { lte: guests }
      where.maxGuests = { gte: guests }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.startingPrice = {}
      if (minPrice !== undefined) where.startingPrice.gte = minPrice
      if (maxPrice !== undefined) where.startingPrice.lte = maxPrice
    }

    if (search) {
      const s = search.trim()
      where.AND = [
        {
          OR: [
            { titleEn: { contains: s, mode: "insensitive" } },
            { titleAr: { contains: s, mode: "insensitive" } },
            { shortDescriptionEn: { contains: s, mode: "insensitive" } },
            { shortDescriptionAr: { contains: s, mode: "insensitive" } },
            { taglineEn: { contains: s, mode: "insensitive" } },
            { taglineAr: { contains: s, mode: "insensitive" } }
          ]
        }
      ]
    }

    // Sorting options
    let orderBy: any[] = []
    if (sort === "newest") {
      orderBy = [{ createdAt: "desc" }]
    } else if (sort === "price-asc") {
      orderBy = [{ startingPrice: "asc" }]
    } else if (sort === "price-desc") {
      orderBy = [{ startingPrice: "desc" }]
    } else if (sort === "popularity") {
      orderBy = [{ isPopular: "desc" }, { isFeatured: "desc" }, { sortOrder: "asc" }]
    } else {
      // Default: Recommended (Featured first, then sortOrder, then newest)
      orderBy = [
        { isFeatured: "desc" },
        { isPopular: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    }

    const packages = await db.package.findMany({
      where,
      include: {
        categoryRel: true,
        attraction: { select: { id: true, nameEn: true, nameAr: true, slug: true, logoUrl: true } },
        brand: { select: { id: true, nameEn: true, nameAr: true, logoUrl: true } },
        location: { select: { id: true, nameEn: true, nameAr: true, slug: true } }
      },
      orderBy
    })

    // Security: sanitize internal financial and administrative fields for unauthenticated public requests
    const sanitizedPackages = packages.map((pkg: any) => {
      if (!isAdmin) {
        const { internalCost: _c, estimatedMargin: _m, internalNotes: _n, ...safe } = pkg
        return safe
      }
      return pkg
    })

    return NextResponse.json({ data: sanitizedPackages, count: sanitizedPackages.length })
  } catch (error: any) {
    console.error("[GET /api/b2c/packages] Error:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      titleEn,
      titleAr,
      slug,
      code,
      categoryId,
      category,
      startingPrice,
      ...rest
    } = body

    if (!titleEn) {
      return NextResponse.json({ error: "Title EN is required" }, { status: 400 })
    }

    const generatedSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "")
      : titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    // Verify slug uniqueness
    const existingSlug = await db.package.findUnique({ where: { slug: generatedSlug } })
    const finalSlug = existingSlug ? `${generatedSlug}-${Date.now()}` : generatedSlug

    const newPackage = await db.package.create({
      data: {
        titleEn,
        titleAr: titleAr || titleEn,
        slug: finalSlug,
        code: code || `PKG-${Date.now().toString().slice(-6)}`,
        categoryId: categoryId || undefined,
        category: category || "BIRTHDAY",
        startingPrice: startingPrice !== undefined ? parseFloat(startingPrice) : 0,
        ...rest
      },
      include: {
        categoryRel: true,
        attraction: true,
        location: true
      }
    })

    return NextResponse.json({ data: newPackage })
  } catch (error: any) {
    console.error("[POST /api/b2c/packages] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 })
  }
}
