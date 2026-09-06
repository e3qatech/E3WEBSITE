import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { reviewSubmission } from '@/lib/influencer/deliverable-service';
import { contentReviewSchema } from '@/lib/influencer/validations';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerContent.review');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = contentReviewSchema.parse(body);

    const review = await reviewSubmission({
      submissionId,
      decision: validated.decision,
      feedbackEn: validated.feedbackEn,
      feedbackAr: validated.feedbackAr,
      reviewerId: auth.userId,
      reviewerType: 'STAFF',
      isClientReview: validated.isClientReview,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
