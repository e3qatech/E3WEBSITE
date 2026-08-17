import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    let hasManagePermission = false
    try {
      const user = await requirePermission("b2c.packages.manage")
      hasManagePermission = Boolean(user)
    } catch {
      hasManagePermission = false
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
    if (!hasManagePermission && (!item.isPublished || item.status !== "PUBLISHED")) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    if (!hasManagePermission) {
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
    const {
      attraction: _attraction,
      brand: _brand,
      location: _location,
      categoryRel: _categoryRel,
      leads: _leads,
      quotations: _quotations,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...updateData
    } = body

    if (updateData.startingPrice !== undefined) {
      updateData.startingPrice = parseFloat(updateData.startingPrice) || 0
    }

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
