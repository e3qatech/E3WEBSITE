import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"

function sanitizePackageData(body: any, isUpdate = true) {
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
  if (attractionId) {
    data.attraction = { connect: { id: attractionId } }
  } else if (isUpdate && attractionId === "") {
    data.attraction = { disconnect: true }
  }

  if (locationId) {
    data.location = { connect: { id: locationId } }
  } else if (isUpdate && locationId === "") {
    data.location = { disconnect: true }
  }

  if (categoryId) {
    data.categoryRel = { connect: { id: categoryId } }
  } else if (isUpdate && categoryId === "") {
    data.categoryRel = { disconnect: true }
  }

  if (brandId) {
    data.brand = { connect: { id: brandId } }
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    let hasAdminPermission = false
    try {
      const user = await requirePermission("b2c.packages.manage")
      hasAdminPermission = Boolean(user)
    } catch {
      try {
        const user = await requirePermission("b2c.packages.read")
        hasAdminPermission = Boolean(user)
      } catch {
        hasAdminPermission = false
      }
    }

    const item = await db.package.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { code: id }
        ]
      },
      include: {
        categoryRel: true,
        attraction: true,
        brand: true,
        location: true
      }
    })

    if (!item) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Public users cannot view unpublished draft packages
    if (!hasAdminPermission && (!item.isPublished || item.status !== "PUBLISHED")) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    if (!hasAdminPermission) {
      const { internalCost: _c, estimatedMargin: _m, internalNotes: _n, ...safe } = item
      return NextResponse.json({ data: safe })
    }

    return NextResponse.json({ data: item })
  } catch (error: any) {
    console.error("[GET /api/b2c/packages/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to load package" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await requirePermission("b2c.packages.manage")
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))

    const updateData = sanitizePackageData(body, true)

    const updated = await db.package.update({
      where: { id },
      data: updateData,
      include: {
        categoryRel: true,
        attraction: true,
        brand: true,
        location: true
      }
    })

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    console.error(`[PUT /api/b2c/packages/[id]] Error:`, error?.message || error)
    return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 })
  }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Duplicate package endpoint
  try {
    try {
      await requirePermission("b2c.packages.manage")
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const original = await db.package.findUnique({ where: { id } })
    if (!original) return NextResponse.json({ error: "Package not found" }, { status: 404 })

    const {
      id: _origId,
      slug: _slug,
      code: _code,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...copyData
    } = original

    const timestamp = Date.now()
    const duplicated = await db.package.create({
      data: {
        ...copyData,
        titleEn: `${original.titleEn} (Copy)`,
        titleAr: original.titleAr ? `${original.titleAr} (نسخة)` : undefined,
        slug: `${original.slug}-copy-${timestamp}`,
        code: original.code ? `${original.code}-COPY-${timestamp.toString().slice(-4)}` : `PKG-COPY-${timestamp.toString().slice(-4)}`,
        isPublished: false,
        status: "DRAFT"
      },
      include: {
        categoryRel: true,
        attraction: true,
        location: true
      }
    })

    return NextResponse.json({ data: duplicated })
  } catch (error: any) {
    console.error("[POST /api/b2c/packages/[id]/duplicate] Error:", error?.message || error)
    return NextResponse.json({ error: error.message || "Failed to duplicate package" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await requirePermission("b2c.packages.manage")
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await db.package.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/b2c/packages/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 })
  }
}
