import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { isPublished, isFeatured } = body

    const data: any = {}
    if (isPublished !== undefined) data.isPublished = isPublished
    if (isFeatured !== undefined) data.isFeatured = isFeatured

    const attraction = await db.attraction.update({
      where: { id },
      data
    })

    return NextResponse.json(attraction)
  } catch (error: any) {
    console.error("[ATTRACTION_PATCH_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await db.attraction.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Attraction deleted" })
  } catch (error: any) {
    console.error("[ATTRACTION_DELETE_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
