import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    const userId = session?.user?.id

    if (!session || !["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
    const processedLeads = leads.map(lead => {
      let email = lead.email;
      let phone = lead.phone;

      // Staff can only see full PII if the lead is assigned to them
      if (role === "STAFF" && lead.assignedToId !== userId) {
        email = email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => { 
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role

    if (!session || !["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, company, email, phone, status, value, probability, assignedToId, interestServices, notes } = body

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
        author: (session.user as any)?.name || "System",
        leadId: lead.id
      }
    })

    // Audit Log (CSO Check)
    await db.systemLog.create({
      data: {
        action: "LEAD_CREATED_MANUAL",
        entity: "Lead",
        entityId: lead.id,
        userId: session.user?.id,
        metadata: {
          author: (session.user as any)?.name || "System"
        }
      }
    });

    return NextResponse.json({ ...lead, activities: [activity] })
  } catch (error: any) {
    console.error("[LEADS_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
