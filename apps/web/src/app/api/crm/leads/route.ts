import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, AppAuthError } from "@/lib/server-auth"

export async function GET() {
  try {
    const user = await requireRole(["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF"])
    const role = user.role
    const userId = user.id

    const leads = await db.lead.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        activities: {
          orderBy: { timestamp: "desc" },
          take: 1
        }
      }
    })

    // PII Masking (CSO Check)
    const processedLeads = leads.map((lead: any) => {
      let email = lead.email;
      let phone = lead.phone;

      // Staff can only see full PII if the lead is assigned to them
      if (role === "STAFF" && lead.assignedToId !== userId) {
        email = email.replace(/(.{2})(.*)(?=@)/, (gp1: string, gp2: string, gp3: string) => { 
          return gp2 + gp3.replace(/./g, '*'); 
        });
        phone = phone ? phone.replace(/.(?=.{4})/g, '*') : phone;
      }

      return {
        ...lead,
        email,
        phone
      }
    });

    return NextResponse.json(processedLeads)
  } catch (error: any) {
    console.error("[LEADS_GET_ERROR]", error)
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN"])

    const body = await request.json()
    const { name, company, email, phone, status, value, probability, assignedToId, interestServices } = body

    const lead = await db.lead.create({
      data: {
        name,
        company,
        email,
        phone,
        status: status || "NEW",
        value: value ? parseFloat(value) : null,
        probability: probability ? parseInt(probability) : null,
        assignedToId,
        interestServices: interestServices || []
      }
    })

    const activity = await db.leadActivity.create({
      data: {
        type: "NOTE",
        description: "Lead created manually.",
        author: user.name || "System",
        leadId: lead.id
      }
    })

    // Audit Log (CSO Check)
    await db.systemLog.create({
      data: {
        action: "LEAD_CREATED_MANUAL",
        entity: "Lead",
        entityId: lead.id,
        userId: user.id,
        metadata: {
          author: user.name || "System"
        }
      }
    });

    return NextResponse.json({ ...lead, activities: [activity] })
  } catch (error: any) {
    console.error("[LEADS_POST_ERROR]", error)
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
