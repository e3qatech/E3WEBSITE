import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    const userId = session?.user?.id

    if (!session || !["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF"].includes(role)) {
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

    // PII Masking (CSO Check)
    let email = lead.email;
    let phone = lead.phone;

    if (role === "STAFF" && lead.assignedToId !== userId) {
      email = email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => { 
        return gp2 + gp3.replace(/./g, '*'); 
      });
      phone = phone ? phone.replace(/.(?=.{4})/g, '*') : phone;
    }

    return NextResponse.json({
      ...lead,
      email,
      phone
    })
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
    const role = (session?.user as any)?.role
    const userId = session?.user?.id

    if (!session || !["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existingLead = await db.lead.findUnique({ where: { id } })

    if (!existingLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

    // STAFF can only edit their assigned leads
    if (role === "STAFF" && existingLead.assignedToId !== userId) {
      return NextResponse.json({ error: "Forbidden. You can only edit assigned leads." }, { status: 403 })
    }

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

    // If a manual activity was passed, create it
    if (body.activity) {
      await db.leadActivity.create({
        data: {
          type: body.activity.type || "NOTE",
          description: body.activity.description,
          author: body.activity.author || "System",
          leadId: id
        }
      })
    }

    // If status changed, automatically log an activity
    if (status && existingLead.status !== status) {
      await db.leadActivity.create({
        data: {
          type: "AUDIT",
          description: `Status changed from ${existingLead.status} to ${status}`,
          author: (session.user as any)?.name || "System",
          leadId: id
        }
      })

      // CSO Audit Log
      await db.systemLog.create({
        data: {
          action: "LEAD_STATUS_CHANGED",
          entity: "Lead",
          entityId: id,
          userId: userId,
          metadata: {
            oldStatus: existingLead.status,
            newStatus: status,
            author: (session.user as any)?.name || "System"
          }
        }
      })

      // Auto-convert to Client if WON
      if (status === "WON") {
        const companyName = existingLead.company || existingLead.name;
        
        // Check if client exists
        const existingClient = await db.client.findFirst({
          where: { company: companyName }
        });

        if (!existingClient) {
          const newClient = await db.client.create({
            data: {
              company: companyName,
              type: "B2B",
              assignedRepId: existingLead.assignedToId,
              website: null,
              industry: null
            }
          });

          await db.systemLog.create({
            data: {
              action: "CLIENT_AUTO_CREATED",
              entity: "Client",
              entityId: newClient.id,
              metadata: {
                sourceLeadId: existingLead.id,
                timestamp: new Date().toISOString()
              }
            }
          });
        }
      }
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
    const role = (session?.user as any)?.role

    // Only SUPER_ADMIN and SALES_ADMIN can delete leads
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized. Insufficient privileges to delete." }, { status: 403 })
    }

    const { id } = await params
    await db.lead.delete({
      where: { id }
    })

    // CSO Audit Log
    await db.systemLog.create({
      data: {
        action: "LEAD_DELETED",
        entity: "Lead",
        entityId: id,
        userId: session.user?.id,
        metadata: {
          author: (session.user as any)?.name || "System"
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[LEAD_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
