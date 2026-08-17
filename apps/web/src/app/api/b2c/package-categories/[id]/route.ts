import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const category = await db.packageCategory.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        packages: {
          where: { isPublished: true, isTemplate: false }
        }
      }
    })

    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 })
    return NextResponse.json({ data: category })
  } catch (error: any) {
    console.error("[GET /api/b2c/package-categories/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
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
    const { packages: _p, _count: _c, createdAt: _created, updatedAt: _updated, ...data } = body

    const updated = await db.packageCategory.update({
      where: { id },
      data
    })

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    console.error("[PUT /api/b2c/package-categories/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
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
    
    // Check if category has associated packages
    const packageCount = await db.package.count({ where: { categoryId: id } })
    if (packageCount > 0) {
      // Soft-disable rather than hard delete if packages exist
      await db.packageCategory.update({
        where: { id },
        data: { isActive: false }
      })
      return NextResponse.json({ message: "Category deactivated because it contains packages", deactivated: true })
    }

    await db.packageCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/b2c/package-categories/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
