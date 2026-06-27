import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'SALES_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const rule = await db.attractionTemporalRule.delete({
      where: { id }
    });

    await db.systemLog.create({
      data: {
        action: `TEMPORAL_RULE_DELETED`,
        entity: `Rule ${id}`,
        entityId: id,
        userId: (session.user as any)?.id,
      }
    });

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error('Error deleting temporal rule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
