import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "HR", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const talents = await db.talent.findMany({
      orderBy: { appliedDate: "desc" }
    })

    return NextResponse.json(talents)
  } catch (error: any) {
    console.error("[TALENT_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Allow public submissions for the careers portal
    const session = await auth();
    const data = await request.json();

    if (!data.name || !data.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const talent = await db.talent.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        experienceLevel: data.experienceLevel,
        status: data.status || 'NEW',
        rating: data.rating ? parseInt(data.rating) : null,
      }
    });

    await db.systemLog.create({
      data: {
        action: `TALENT_CREATED`,
        entity: `Talent ${talent.id}`,
        entityId: talent.id,
        userId: (session?.user as any)?.id,
      }
    });

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error creating talent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
