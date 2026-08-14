import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'SALES'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const client = await db.client.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, isActive: true },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'SALES'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const client = await db.client.update({
      where: { id },
      data: {
        ...(body.company !== undefined && { company: body.company }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.assignedRepId !== undefined && { assignedRepId: body.assignedRepId }),
      },
    });

    await db.systemLog.create({
      data: {
        action: `CLIENT_UPDATED`,
        entity: `Client ${id}`,
        entityId: id,
        userId: (session.user as any)?.id,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
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

    await db.client.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
