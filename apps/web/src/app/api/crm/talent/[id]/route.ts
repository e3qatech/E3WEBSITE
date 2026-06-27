import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "HR", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const talent = await db.talent.findUnique({
      where: { id },
      include: {
        job: true
      }
    })

    if (!talent) return NextResponse.json({ error: "Talent not found" }, { status: 404 })

    return NextResponse.json(talent)
  } catch (error: any) {
    console.error("[TALENT_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "HR", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, rating, notes, department, position, assignedToId } = body

    const data: any = {}
    if (status !== undefined) data.status = status
    if (rating !== undefined) data.rating = rating
    if (notes !== undefined) data.notes = notes
    if (department !== undefined) data.department = department
    if (position !== undefined) data.position = position
    if (assignedToId !== undefined) data.assignedToId = assignedToId

    const talent = await db.talent.update({
      where: { id },
      data
    })

    return NextResponse.json(talent)
  } catch (error: any) {
    console.error("[TALENT_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
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
    await db.talent.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[TALENT_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
