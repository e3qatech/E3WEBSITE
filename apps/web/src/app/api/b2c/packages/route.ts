import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"

async function sanitizePackageData(body: any, isUpdate = false) {
  const {
    id: _id,
    attraction: _attraction,
    brand: _brand,
    location: _location,
    categoryRel: _categoryRel,
    leads: _leads,
    quotations: _quotations,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    seo,
    metaTitleEn,
    metaTitleAr,
    metaDescriptionEn,
    metaDescriptionAr,
    attractionId,
    locationId,
    categoryId,
    brandId,
    ...rest
  } = body

  const data: any = { ...rest }

  // Assemble `seo` JSON object safely
  const seoObj: any = typeof seo === "object" && seo !== null ? { ...seo } : {}
  if (metaTitleEn !== undefined) seoObj.metaTitleEn = metaTitleEn
  if (metaTitleAr !== undefined) seoObj.metaTitleAr = metaTitleAr
  if (metaDescriptionEn !== undefined) seoObj.metaDescriptionEn = metaDescriptionEn
  if (metaDescriptionAr !== undefined) seoObj.metaDescriptionAr = metaDescriptionAr
  if (Object.keys(seoObj).length > 0) {
    data.seo = seoObj
  }

  // Relations: connect or disconnect safely
  if (attractionId && typeof attractionId === "string" && attractionId.trim()) {
    try {
      const existing = await db.attraction.findUnique({ where: { id: attractionId.trim() }, select: { id: true } })
      if (existing) data.attraction = { connect: { id: existing.id } }
    } catch (_e) {}
  } else if (isUpdate && attractionId === "") {
    data.attraction = { disconnect: true }
  }

  if (locationId && typeof locationId === "string" && locationId.trim()) {
    try {
      const existing = await db.location.findUnique({ where: { id: locationId.trim() }, select: { id: true } })
      if (existing) data.location = { connect: { id: existing.id } }
    } catch (_e) {}
  } else if (isUpdate && locationId === "") {
    data.location = { disconnect: true }
  }

  if (categoryId && typeof categoryId === "string" && categoryId.trim()) {
    try {
      const existing = await db.packageCategory.findFirst({
        where: {
          OR: [
            { id: categoryId.trim() },
            { slug: categoryId.trim().toLowerCase() }
          ]
        },
        select: { id: true }
      })
      if (existing) data.categoryRel = { connect: { id: existing.id } }
    } catch (_e) {}
  } else if (isUpdate && categoryId === "") {
    data.categoryRel = { disconnect: true }
  }

  if (brandId && typeof brandId === "string" && brandId.trim()) {
    try {
      const existing = await db.brandIP.findUnique({ where: { id: brandId.trim() }, select: { id: true } })
      if (existing) data.brand = { connect: { id: existing.id } }
    } catch (_e) {}
  } else if (isUpdate && brandId === "") {
    data.brand = { disconnect: true }
  }

  // Numeric sanitization
  if (data.startingPrice !== undefined) data.startingPrice = parseFloat(data.startingPrice) || 0
  if (data.internalCost !== undefined) data.internalCost = data.internalCost ? parseFloat(data.internalCost) : null
  if (data.estimatedMargin !== undefined) data.estimatedMargin = data.estimatedMargin ? parseFloat(data.estimatedMargin) : null
  if (data.depositAmount !== undefined) data.depositAmount = data.depositAmount ? parseFloat(data.depositAmount) : null
  if (data.extraGuestPrice !== undefined) data.extraGuestPrice = data.extraGuestPrice ? parseFloat(data.extraGuestPrice) : null
  if (data.minGuests !== undefined) data.minGuests = parseInt(data.minGuests) || 1
  if (data.maxGuests !== undefined) data.maxGuests = parseInt(data.maxGuests) || 100
  if (data.durationMinutes !== undefined) data.durationMinutes = parseInt(data.durationMinutes) || 60
  if (data.minAge !== undefined) data.minAge = data.minAge ? parseInt(data.minAge) : null
  if (data.maxAge !== undefined) data.maxAge = data.maxAge ? parseInt(data.maxAge) : null
  if (data.bookingNoticeHours !== undefined) data.bookingNoticeHours = parseInt(data.bookingNoticeHours) || 24

  return data
}

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

    let hasAdminPermission = false
    try {
      const user = await requirePermission("b2c.packages.manage")
      hasAdminPermission = Boolean(user)
    } catch {
      try {
        const user = await requirePermission("b2c.packages.read")
        hasAdminPermission = Boolean(user)
      } catch {
        try {
          const user = await requirePermission("b2c.content.read")
          hasAdminPermission = Boolean(user)
        } catch {
          hasAdminPermission = false
        }
      }
    }

    const where: any = {}

    // Public callers can only see published active packages
    if (!hasAdminPermission || !showAll) {
      where.isPublished = true
      where.status = "PUBLISHED"
    }

    // By default, exclude templates unless requested by authorized manager
    if (!includeTemplates && !hasAdminPermission) {
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
        brand: { select: { id: true, nameEn: true, nameAr: true, primaryLogoUrl: true } },
        location: { select: { id: true, nameEn: true, nameAr: true, slug: true } }
      },
      orderBy
    })

    // Security: sanitize internal financial and administrative fields for unauthenticated public requests
    const sanitizedPackages = hasAdminPermission ? packages : packages.map((pkg: any) => {
      const { internalCost: _c, estimatedMargin: _m, internalNotes: _n, ...safe } = pkg
      return safe
    })

    return NextResponse.json({ data: sanitizedPackages, count: sanitizedPackages.length })
  } catch (error: any) {
    console.error("[GET /api/b2c/packages] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    try {
      await requirePermission("b2c.packages.manage")
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const {
      titleEn,
      titleAr,
      slug,
      code,
      category,
      ...rawFields
    } = body

    if (!titleEn) {
      return NextResponse.json({ error: "Title EN is required" }, { status: 400 })
    }

    const generatedSlug = slug
      ? String(slug).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "")
      : String(titleEn).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "")

    const baseSlug = generatedSlug && generatedSlug.length > 0 ? generatedSlug : `pkg-${Date.now().toString(36)}`

    // Verify slug uniqueness
    const existingSlug = await db.package.findUnique({ where: { slug: baseSlug } })
    const finalSlug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug

    const packageData = await sanitizePackageData(rawFields, false)

    const newPackage = await db.package.create({
      data: {
        titleEn: String(titleEn).trim(),
        titleAr: titleAr ? String(titleAr).trim() : String(titleEn).trim(),
        slug: finalSlug,
        code: code ? String(code).trim() : `PKG-${Date.now().toString().slice(-6)}`,
        category: category || "BIRTHDAY",
        ...packageData
      },
      include: {
        categoryRel: true,
        attraction: true,
        location: true,
        brand: true
      }
    })

    return NextResponse.json({ data: newPackage })
  } catch (error: any) {
    console.error("[POST /api/b2c/packages] Error:", error?.message || error)
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 })
  }
}
