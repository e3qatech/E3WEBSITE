import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { timestamp: "desc" }
        },
        inquiries: true
      }
    })

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error("[LEAD_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(
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
    const { name, company, email, phone, status, value, probability, assignedToId, interestServices } = body

    const data: any = {}
    if (name !== undefined) data.name = name
    if (company !== undefined) data.company = company
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (status !== undefined) data.status = status
    if (value !== undefined) data.value = value ? parseFloat(value) : null
    if (probability !== undefined) data.probability = probability ? parseInt(probability) : null
    if (assignedToId !== undefined) data.assignedToId = assignedToId
    if (interestServices !== undefined) data.interestServices = interestServices

    const lead = await db.lead.update({
      where: { id },
      data
    })

    // If status changed, automatically log an activity
    if (status) {
      await db.leadActivity.create({
        data: {
          type: "NOTE",
          description: `Status changed to ${status}`,
          author: (session.user as any)?.name || "System",
          leadId: id
        }
      })
    }

    return NextResponse.json(lead)
  } catch (error: any) {
    console.error("[LEAD_PATCH_ERROR]", error)
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
    await db.lead.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[LEAD_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
