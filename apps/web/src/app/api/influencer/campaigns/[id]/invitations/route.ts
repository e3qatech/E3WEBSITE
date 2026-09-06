import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { issueCampaignInvitations } from '@/lib/influencer/shortlist-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: _campaignId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.invite');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const assignmentIds: string[] = body.assignmentIds || [];
    const expiryHours = body.expiryHours === 48 ? 48 : body.expiryHours === 72 ? 72 : 24;
    const locale = body.locale || 'en';

    if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      return NextResponse.json({ error: 'assignmentIds array is required' }, { status: 400 });
    }

    const invitations = await issueCampaignInvitations({
      assignmentIds,
      expiryHours,
      actorId: auth.userId,
      locale,
    });

    return NextResponse.json({ success: true, count: invitations.length, invitations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
