import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "HR", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const talent = await db.talent.findUnique({
      where: { id }
    })

    if (!talent) return NextResponse.json({ error: "Talent not found" }, { status: 404 })

    return NextResponse.json(talent)
  } catch (error: any) {
    console.error("[TALENT_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'HR', 'HR_ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const talent = await db.talent.update({
      where: { id },
      data: body,
    });

    await db.systemLog.create({
      data: {
        action: `TALENT_UPDATED`,
        entity: `Talent ${id}`,
        entityId: id,
        userId: (session.user as any)?.id,
      }
    });

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error updating talent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const talent = await db.talent.findUnique({
      where: { id }
    });

    if (talent?.resumeUrl) {
      try {
        if (process.env.RESUME_BLOB_READ_WRITE_TOKEN) {
          const { del } = await import('@vercel/blob');
          await del(talent.resumeUrl, { token: process.env.RESUME_BLOB_READ_WRITE_TOKEN });
        }
      } catch (err) {
        console.warn('Failed to delete talent resume blob:', err);
      }
    }

    await db.talent.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting talent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
