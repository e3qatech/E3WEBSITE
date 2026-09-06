import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { shortlistCreatorForCampaign, removeCreatorFromCampaign } from '@/lib/influencer/shortlist-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.update');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { influencerId, collaborationType, proposedRate, currency } = body;

    if (!influencerId) {
      return NextResponse.json({ error: 'influencerId is required' }, { status: 400 });
    }

    const assignment = await shortlistCreatorForCampaign({
      campaignId,
      influencerId,
      collaborationType,
      proposedRate,
      currency,
      actorId: auth.userId,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.update');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get('assignmentId');

  if (!assignmentId) {
    return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 });
  }

  try {
    await removeCreatorFromCampaign(assignmentId, auth.userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
