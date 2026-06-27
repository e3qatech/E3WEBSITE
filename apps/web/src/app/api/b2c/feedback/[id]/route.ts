import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, isFeatured } = body

    const data: any = {}
    if (status !== undefined) data.status = status
    if (isFeatured !== undefined) data.isFeatured = isFeatured

    const feedback = await db.feedback.update({
      where: { id },
      data
    })

    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error("[FEEDBACK_PATCH_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await db.feedback.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Feedback deleted" })
  } catch (error: any) {
    console.error("[FEEDBACK_DELETE_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
