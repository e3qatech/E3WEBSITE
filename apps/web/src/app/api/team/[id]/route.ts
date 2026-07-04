import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `team:detail:${id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const employeeProfile = await db.employeeProfile.findUnique({
      where: { id },
      // Assuming a generic schema; if there were certs/projects, we'd include them here.
    });

    if (!employeeProfile) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    await redis.set(cacheKey, JSON.stringify(employeeProfile), 'EX', 3600);
    return NextResponse.json(employeeProfile);
  } catch (error: any) {
    console.error('[TEAM_DETAIL_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST is omitted since list is enough for GET, but adding PUT/DELETE for completeness
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await db.employeeProfile.update({
      where: { id },
      data: body,
    });

    await redis.del(`team:detail:${id}`);
    await redis.del(`team:list`);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[TEAM_DETAIL_PUT]', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    await db.employeeProfile.delete({
      where: { id },
    });

    await redis.del(`team:detail:${id}`);
    await redis.del(`team:list`);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('[TEAM_DETAIL_DELETE]', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
