import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { type, description } = body

    if (!type || !description) {
      return NextResponse.json({ error: "Type and description are required" }, { status: 400 })
    }

    const activity = await db.leadActivity.create({
      data: {
        type,
        description,
        author: (session.user as any)?.name || "System",
        leadId: id
      }
    })

    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("[LEAD_NOTES_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
