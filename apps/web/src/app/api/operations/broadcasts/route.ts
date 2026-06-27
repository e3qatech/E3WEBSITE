import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'OPERATIONS'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const broadcasts = await db.systemBroadcast.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(broadcasts);
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'OPERATIONS'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.titleEn || !data.messageEn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const broadcast = await db.systemBroadcast.create({
      data: {
        titleEn: data.titleEn,
        titleAr: data.titleAr || data.titleEn,
        messageEn: data.messageEn,
        messageAr: data.messageAr || data.messageEn,
        type: data.type || 'INFO',
        isActive: data.isActive ?? true,
      }
    });

    await db.systemLog.create({
      data: {
        action: `BROADCAST_CREATED`,
        entity: `SystemBroadcast ${broadcast.id}`,
        entityId: broadcast.id,
        userId: (session.user as any)?.id,
      }
    });

    return NextResponse.json(broadcast);
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
