import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { transferUgcToMediaLibrary } from '@/lib/influencer/deliverable-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deliverableId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerContent.sendToMediaLibrary');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const transferred = await transferUgcToMediaLibrary({
      deliverableId,
      actorId: auth.userId,
    });

    return NextResponse.json({ success: true, count: transferred.length, media: transferred });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
