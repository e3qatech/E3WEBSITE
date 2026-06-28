import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await props.params;
    const body = await req.json()
    
    // Convert dates if present
    if (body.startTime) body.startTime = new Date(body.startTime)
    if (body.endTime) body.endTime = new Date(body.endTime)

    const updated = await db.eventSchedule.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await props.params;

    await db.eventSchedule.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
