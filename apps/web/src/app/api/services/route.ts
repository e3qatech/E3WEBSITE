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
    // A robust parser would process the huge 8-tab payload here.
    // For now, we mock the success response to validate the UI logic.
    
    // In production, this would do a deeply nested Prisma create:
    // await db.services.create({ ... })

    return NextResponse.json({ success: true, message: "Service created" })
  } catch (error) {
    console.error("[SERVICE_CREATE_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
