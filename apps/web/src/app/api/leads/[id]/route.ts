import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes(session.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: leadId } = await params
    const body = await request.json()
    const { value, probability } = body

    const updatedLead = await db.leads.update({
      where: { id: leadId },
      data: {
        ...(value !== undefined && { value }),
        ...(probability !== undefined && { probability })
      }
    })

    // Log the activity
    await db.leadActivities.create({
      data: {
        leadId,
        type: "SYSTEM",
        title: "Financials Updated",
        description: `Lead financials updated by ${session.user.name}.`,
        userId: session.user.id
      }
    })

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("[LEAD_UPDATE_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
