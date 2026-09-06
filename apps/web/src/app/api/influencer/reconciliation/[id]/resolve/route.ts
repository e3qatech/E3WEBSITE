import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { resolveUnmatchedConversion } from '@/lib/influencer/attribution-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversionId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerFinance.update');
  const fallbackAuth = !auth.isAuthed ? await checkInfluencerAuth(req, 'influencerCampaign.update') : auth;

  if (!fallbackAuth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized: Finance or Campaign write access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, targetCampaignId, targetCampaignCreatorId, notes } = body;

    if (!action || !['MATCH', 'DISMISS'].includes(action)) {
      return NextResponse.json({ error: "Valid action ('MATCH' or 'DISMISS') is required" }, { status: 400 });
    }

    const updated = await resolveUnmatchedConversion({
      conversionId,
      action,
      targetCampaignId,
      targetCampaignCreatorId,
      notes,
      actorId: fallbackAuth.userId,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
