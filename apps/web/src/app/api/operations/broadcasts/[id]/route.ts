import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'OPERATIONS'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const broadcast = await db.systemBroadcast.update({
      where: { id },
      data: {
        isActive: data.isActive,
      }
    });

    await db.systemLog.create({
      data: {
        action: `BROADCAST_UPDATED`,
        entity: `SystemBroadcast ${id}`,
        entityId: id,
        userId: (session.user as any)?.id,
      }
    });

    return NextResponse.json(broadcast);
  } catch (error) {
    console.error('Error updating broadcast:', error);
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

    if (!session || !['SUPER_ADMIN', 'OPERATIONS'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.systemBroadcast.delete({
      where: { id }
    });

    await db.systemLog.create({
      data: {
        action: `BROADCAST_DELETED`,
        entity: `SystemBroadcast ${id}`,
        entityId: id,
        userId: (session.user as any)?.id,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
