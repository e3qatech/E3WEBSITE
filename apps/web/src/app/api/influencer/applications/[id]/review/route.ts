import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { reviewApplication } from '@/lib/influencer/application-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await checkInfluencerAuth(req, 'influencer.review');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const decision = body.decision;
    const reviewNotes = body.reviewNotes;

    if (!['UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'APPROVED', 'DECLINED'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid review decision' }, { status: 400 });
    }

    const updated = await reviewApplication({
      applicationId: id,
      decision,
      reviewerId: auth.userId || 'system',
      reviewNotes,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
