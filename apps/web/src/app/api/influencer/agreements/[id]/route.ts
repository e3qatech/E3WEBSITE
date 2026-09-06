import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { updateAgreementStatus } from '@/lib/influencer/commercial-service';
import { validateCreatorToken } from '@/lib/influencer/tokens';
import db from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agreementId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencer.viewCommercial');
  const fallbackAuth = !auth.isAuthed ? await checkInfluencerAuth(req, 'influencerCampaign.read') : auth;

  // Also check if creator portal token is provided
  const creatorToken = req.headers.get('x-creator-token');
  let tokenValid = false;
  if (creatorToken) {
    const check = await validateCreatorToken(creatorToken);
    tokenValid = check.isValid;
  }

  if (!fallbackAuth.isAuthed && !tokenValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const agreement = await (db as any).influencerAgreement.findUnique({
      where: { id: agreementId },
      include: {
        campaignCreator: {
          include: {
            influencer: true,
            campaign: true,
          },
        },
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    return NextResponse.json(agreement);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agreementId } = await params;

  // Check creator portal token for electronic signing
  const creatorToken = req.headers.get('x-creator-token');
  let isCreatorSign = false;
  let actorId: string | undefined = undefined;

  if (creatorToken) {
    const check = await validateCreatorToken(creatorToken, 'CAMPAIGN_INVITATION');
    const fallbackCheck = !check.isValid ? await validateCreatorToken(creatorToken, 'VIEW_CAMPAIGN') : check;
    if (fallbackCheck.isValid) {
      isCreatorSign = true;
      actorId = fallbackCheck.tokenRecord?.influencerId;
    }
  }

  if (!isCreatorSign) {
    const auth = await checkInfluencerAuth(req, 'influencer.viewCommercial');
    const fallbackAuth = !auth.isAuthed ? await checkInfluencerAuth(req, 'influencerCampaign.update') : auth;
    if (!fallbackAuth.isAuthed) {
      return NextResponse.json({ error: 'Unauthorized: Commercial access required' }, { status: 403 });
    }
    actorId = fallbackAuth.userId;
  }

  try {
    const body = await req.json();
    const updated = await updateAgreementStatus({
      agreementId,
      status: body.status,
      signedByCreator: isCreatorSign || Boolean(body.signedByCreator),
      countersigned: Boolean(body.countersigned),
      notes: body.notes,
      actorId,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
