import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
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

    return NextResponse.json(leads)
  } catch (error: any) {
    console.error("[LEADS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
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

    // Create an initial activity note
    const activity = await db.leadActivity.create({
      data: {
        type: "NOTE",
        description: "Lead created manually.",
        author: (session.user as any)?.name || "System",
        leadId: lead.id
      }
    })

    return NextResponse.json({ ...lead, activities: [activity] })
  } catch (error: any) {
    console.error("[LEADS_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
