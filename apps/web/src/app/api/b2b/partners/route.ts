import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all") === "true"

    const where = all ? {} : { isVisible: true }
    
    const partners = await db.partner.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ success: true, partners })
  } catch (error: any) {
    console.error("[PARTNERS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
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

    return NextResponse.json({ success: true, partner })
  } catch (error: any) {
    console.error("[PARTNERS_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
