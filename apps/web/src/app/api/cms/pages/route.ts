import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "STAFF"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await db.pages.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ data: pages });
  } catch (error) {
    console.error(`[GET /api/cms/pages] error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
