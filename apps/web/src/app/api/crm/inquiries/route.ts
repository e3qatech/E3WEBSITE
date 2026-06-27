import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inquiries = await db.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lead: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json(inquiries)
  } catch (error: any) {
    console.error("[INQUIRIES_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
