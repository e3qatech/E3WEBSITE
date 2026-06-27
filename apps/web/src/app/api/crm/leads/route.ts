import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(req: Request) {
  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        inquiries: true
      }
    })
    return NextResponse.json(leads)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, phone, status, value, probability, assignedToId, interestServices, notes } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const lead = await db.lead.create({
      data: {
        name,
        email,
        company,
        phone,
        status: status || "NEW",
        value: value ? parseFloat(value) : null,
        probability: probability ? parseInt(probability) : null,
        assignedToId,
        interestServices,
        notes
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
