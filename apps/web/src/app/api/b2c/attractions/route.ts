import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nameEn, nameAr } = body

    if (!nameEn || !nameAr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate slug from nameEn
    const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    // Create the attraction
    const attraction = await db.attraction.create({
      data: {
        nameEn,
        nameAr,
        slug: `${slug}-${Date.now().toString().slice(-4)}`, // Ensure uniqueness
        isPublished: false,
        isFeatured: false,
        isHidden: false,
      }
    })

    return NextResponse.json(attraction)
  } catch (error) {
    console.error("Error creating attraction:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
