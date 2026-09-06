import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { submitDeliverableDraft } from '@/lib/influencer/deliverable-service';
import { contentSubmissionSchema } from '@/lib/influencer/validations';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deliverableId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerContent.read');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = contentSubmissionSchema.parse(body);

    const submission = await submitDeliverableDraft({
      deliverableId,
      captionEn: validated.captionEn,
      captionAr: validated.captionAr,
      submissionNotes: validated.submissionNotes,
      assetIds: validated.assetIds,
      externalPreviewUrl: validated.externalPreviewUrl,
      submittedByType: 'ADMIN',
      submittedById: auth.userId,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
