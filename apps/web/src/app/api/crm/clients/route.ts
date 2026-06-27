import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clients = await db.client.findMany({
      orderBy: { company: "asc" }
    })

    return NextResponse.json(clients)
  } catch (error: any) {
    console.error("[CLIENTS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'SALES'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const client = await db.client.create({
      data: {
        company: data.company,
        type: data.type || 'B2B',
        industry: data.industry,
        website: data.website,
        assignedRepId: (session.user as any)?.id,
      }
    });

    await db.systemLog.create({
      data: {
        action: `CLIENT_CREATED`,
        entity: `Client ${client.id}`,
        entityId: client.id,
        userId: (session.user as any)?.id,
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
