import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['NEW', 'REVIEWING', 'INTERVIEW', 'HIRED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const application = await db.jobApplication.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("[PUT /api/careers/[id]/status] error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
