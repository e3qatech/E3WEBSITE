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
    const { orders } = body // Array of { id, orderIndex }

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 })
    }

    // Execute bulk update in a transaction
    await db.$transaction(
      orders.map(o => 
        db.partner.update({
          where: { id: o.id },
          data: { orderIndex: o.orderIndex }
        })
      )
    )

    return NextResponse.json({ success: true, message: "Partners reordered successfully" })
  } catch (error: any) {
    console.error("[PARTNERS_REORDER_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
