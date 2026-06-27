import { NextResponse } from "next/server"
import { db } from "@e3/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const leadId = params.id
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
