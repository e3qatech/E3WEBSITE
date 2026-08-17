import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    const isAdmin = Boolean(session?.user)

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

    if (!isAdmin) {
      const { internalCost: _c, estimatedMargin: _m, internalNotes: _n, ...safe } = item
      return NextResponse.json({ data: safe })
    }

    return NextResponse.json({ data: item })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
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
    console.error(`[PUT /api/b2c/packages/${params}] Error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Duplicate package endpoint
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await db.package.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
