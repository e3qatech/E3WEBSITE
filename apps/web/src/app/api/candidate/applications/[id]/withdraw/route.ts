import { NextResponse } from 'next/server';
import { requireCandidateApplication, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { application } = await requireCandidateApplication(id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status === 'WITHDRAWN') {
      return NextResponse.json({ error: 'Application is already withdrawn' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason && typeof body.reason === 'string' ? body.reason.trim() : 'Withdrawn by candidate';

    const currentData = (application.cvParsedData as any) || {};

    await db.jobApplication.update({
      where: { id: application.id },
      data: {
        status: 'WITHDRAWN',
        cvParsedData: {
          ...currentData,
          withdrawalReason: reason,
          withdrawnAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application has been successfully withdrawn',
    });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error withdrawing candidate application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
