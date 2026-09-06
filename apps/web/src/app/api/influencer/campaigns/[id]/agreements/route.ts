import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { createInfluencerAgreement, getCampaignAgreements } from '@/lib/influencer/commercial-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencer.viewCommercial');
  const fallbackAuth = !auth.isAuthed ? await checkInfluencerAuth(req, 'influencerCampaign.read') : auth;

  if (!fallbackAuth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized: Commercial access required' }, { status: 403 });
  }

  try {
    const agreements = await getCampaignAgreements(campaignId);
    return NextResponse.json(agreements);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkInfluencerAuth(req, 'influencer.viewCommercial');
  const fallbackAuth = !auth.isAuthed ? await checkInfluencerAuth(req, 'influencerCampaign.update') : auth;

  if (!fallbackAuth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized: Commercial write access required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.campaignCreatorId) {
      return NextResponse.json({ error: 'campaignCreatorId is required' }, { status: 400 });
    }

    const agreement = await createInfluencerAgreement({
      campaignCreatorId: body.campaignCreatorId,
      agreedRate: body.agreedRate !== undefined ? Number(body.agreedRate) : undefined,
      currency: body.currency || 'QAR',
      agreementType: body.agreementType || 'STANDARD_COMMERCIAL',
      agreementAssetId: body.agreementAssetId || null,
      usageRightsTerms: body.usageRightsTerms || null,
      usageRightsStartAt: body.usageRightsStartAt || null,
      usageRightsEndAt: body.usageRightsEndAt || null,
      exclusivityTerms: body.exclusivityTerms || null,
      cancellationTerms: body.cancellationTerms || null,
      notes: body.notes || null,
      actorId: fallbackAuth.userId,
    });

    return NextResponse.json(agreement, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
