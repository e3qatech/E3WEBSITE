import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, website, category, description, logoUrl, isVisible, orderIndex } = body

    const partner = await db.partner.create({
      data: {
        name,
        website,
        category: category || "TECHNOLOGY",
        description,
        logoUrl,
        isVisible: isVisible ?? true,
        orderIndex: orderIndex ?? 0
      }
    })

    return NextResponse.json(partner)
  } catch (error: any) {
    console.error("[PARTNER_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
