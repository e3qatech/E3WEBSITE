import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== 'SUPER_ADMIN' && userRole !== 'SALES_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await (params instanceof Promise ? params : Promise.resolve(params));
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedLead = await db.lead.update({
      where: { id },
      data: { status },
    });

    // Log the action for telemetry
    await db.systemLog.create({
      data: {
        action: `LEAD_STATUS_UPDATE_${status}`,
        entity: `Lead (${updatedLead.name})`,
        entityId: updatedLead.id,
        userId: (session.user as any)?.id,
        metadata: { status },
      }
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
