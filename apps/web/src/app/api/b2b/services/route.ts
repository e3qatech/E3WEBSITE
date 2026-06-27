import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { titleEn, titleAr } = body

    if (!titleEn || !titleAr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate slug from titleEn
    const slug = titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    // Create the service
    const service = await db.service.create({
      data: {
        titleEn,
        titleAr,
        slug: `${slug}-${Date.now().toString().slice(-4)}`, // Ensure uniqueness
        isVisible: false,
        isFeatured: false,
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
