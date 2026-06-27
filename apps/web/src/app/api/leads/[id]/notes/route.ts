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
    const { notes } = await request.json();

    if (typeof notes !== 'string') {
      return NextResponse.json({ error: 'Notes string is required' }, { status: 400 });
    }

    const updatedLead = await db.lead.update({
      where: { id },
      data: { notes },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead notes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
