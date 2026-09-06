import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { verifyPublication } from '@/lib/influencer/deliverable-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: deliverableId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerContent.verifyPublication');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { publishedUrl } = body;

    if (!publishedUrl) {
      return NextResponse.json({ error: 'publishedUrl is required' }, { status: 400 });
    }

    const verified = await verifyPublication({
      deliverableId,
      publishedUrl,
      verifiedById: auth.userId,
    });

    return NextResponse.json(verified);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
