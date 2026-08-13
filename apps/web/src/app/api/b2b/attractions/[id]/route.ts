import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"

const ALLOWED_ROLES = ["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"]

// Zod Schema to strictly restrict updatable fields & prevent mass-assignment
const updateAttractionSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  taglineEn: z.string().nullable().optional(),
  taglineAr: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  heroMediaType: z.string().optional(),
  heroMediaUrl: z.string().nullable().optional(),
  heroFallbackUrl: z.string().nullable().optional(),
  heroThumbnailUrl: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  mapUrl: z.string().nullable().optional(),
  ticketingUrl: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  isB2bVisible: z.boolean().optional(),
  b2bCategory: z.string().nullable().optional(),
  projectType: z.string().nullable().optional(),
  clientName: z.string().nullable().optional(),
  year: z.union([z.number(), z.string().transform(v => parseInt(v, 10))]).nullable().optional(),
  attendance: z.string().nullable().optional(),
  areaSize: z.string().nullable().optional(),
  operationalScope: z.string().nullable().optional(),
  challengeEn: z.string().nullable().optional(),
  challengeAr: z.string().nullable().optional(),
  solutionEn: z.string().nullable().optional(),
  solutionAr: z.string().nullable().optional(),
  resultEn: z.string().nullable().optional(),
  resultAr: z.string().nullable().optional(),
  downloadableProfile: z.string().nullable().optional(),
  operations: z.any().optional(),
  temporalStatus: z.any().optional(),
  features: z.any().optional(),
  partners: z.any().optional(),
  seo: z.any().optional(),
}).strict()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user || !ALLOWED_ROLES.includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 })
    }

    const { id } = await params
    const attraction = await db.attraction.findUnique({
      where: { id },
      include: {
        pricing: true,
        faqs: { orderBy: { orderIndex: 'asc' } },
        gallery: { orderBy: { orderIndex: 'asc' } },
        socialLinks: true,
        offers: true,
        temporalRules: true,
        featuresList: {
          include: {
            storyTypes: true
          }
        },
        locations: true,
        brandPlacements: true
      }
    })

    if (!attraction) {
      return NextResponse.json({ error: "Attraction not found" }, { status: 404 })
    }

    return NextResponse.json(attraction)
  } catch (error: any) {
    console.error("[B2B_ATTRACTION_GET]", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user || !ALLOWED_ROLES.includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    // Strict Zod Payload Validation
    const validationResult = updateAttractionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Validate that target attraction exists
    const existing = await db.attraction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Attraction not found" }, { status: 404 })
    }

    const updated = await db.attraction.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("[B2B_ATTRACTION_PATCH]", error)
    return NextResponse.json({ error: error.message || "Failed to update attraction" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !session.user || !ALLOWED_ROLES.includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.attraction.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Attraction not found" }, { status: 404 })
    }

    await db.attraction.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[B2B_ATTRACTION_DELETE]", error)
    return NextResponse.json({ error: error.message || "Failed to delete attraction" }, { status: 500 })
  }
}
