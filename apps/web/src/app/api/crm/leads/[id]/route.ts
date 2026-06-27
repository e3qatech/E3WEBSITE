import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { timestamp: 'desc' } },
        inquiries: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { activity, ...data } = body;

    // If an activity is included, create it
    if (activity) {
      await db.leadActivity.create({
        data: {
          leadId: id,
          type: activity.type,
          description: activity.description,
          author: activity.author,
        },
      });
    }

    // Update lead data if any is provided
    let updatedLead = null;
    if (Object.keys(data).length > 0) {
      updatedLead = await db.lead.update({
        where: { id },
        data: {
          ...data,
          value: data.value !== undefined ? (data.value ? parseFloat(data.value) : null) : undefined,
          probability: data.probability !== undefined ? (data.probability ? parseInt(data.probability) : null) : undefined,
        },
        include: {
          activities: { orderBy: { timestamp: 'desc' } },
          inquiries: { orderBy: { createdAt: 'desc' } },
        },
      });
    } else {
      updatedLead = await db.lead.findUnique({
        where: { id },
        include: {
          activities: { orderBy: { timestamp: 'desc' } },
          inquiries: { orderBy: { createdAt: 'desc' } },
        },
      });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
