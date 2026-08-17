import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"

export async function GET(_req: NextRequest) {
  try {
    const templates = await db.leadFormTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    })
    return NextResponse.json({ data: templates })
  } catch (error: any) {
    console.error("[GET /api/b2c/lead-form-templates] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch lead form templates" }, { status: 500 })
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
    const { nameEn, nameAr, slug, formType, descriptionEn, descriptionAr, fields, isActive } = body

    if (!nameEn) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 })
    }

    const templateSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-")
      : nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    const template = await db.leadFormTemplate.upsert({
      where: { slug: templateSlug },
      update: {
        nameEn: String(nameEn).trim(),
        nameAr: nameAr ? String(nameAr).trim() : String(nameEn).trim(),
        formType: formType || "GENERAL",
        descriptionEn: descriptionEn ? String(descriptionEn).trim() : null,
        descriptionAr: descriptionAr ? String(descriptionAr).trim() : null,
        fields,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      },
      create: {
        nameEn: String(nameEn).trim(),
        nameAr: nameAr ? String(nameAr).trim() : String(nameEn).trim(),
        slug: templateSlug,
        formType: formType || "GENERAL",
        descriptionEn: descriptionEn ? String(descriptionEn).trim() : null,
        descriptionAr: descriptionAr ? String(descriptionAr).trim() : null,
        fields,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    })

    return NextResponse.json({ data: template })
  } catch (error: any) {
    console.error("[POST /api/b2c/lead-form-templates] Error:", error?.message || error)
    return NextResponse.json({ error: error.message || "Failed to save form template" }, { status: 500 })
  }
}
