import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES", "MARKETING", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(subscribers)
  } catch (error: any) {
    console.error("[SUBSCRIBERS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
