import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { submitInfluencerInvoice, getCampaignPayments } from '@/lib/influencer/commercial-service';
import { validateCreatorToken } from '@/lib/influencer/tokens';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerFinance.read');
  const fallbackAuth = !auth.isAuthed ? await checkInfluencerAuth(req, 'influencer.viewCommercial') : auth;

  if (!fallbackAuth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized: Finance read access required' }, { status: 403 });
  }

  try {
    const payments = await getCampaignPayments(campaignId);
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  let actorId: string | undefined = undefined;

  // Check creator portal token
  const creatorToken = req.headers.get('x-creator-token');
  if (creatorToken) {
    const check = await validateCreatorToken(creatorToken);
    if (check.isValid) {
      actorId = check.tokenRecord?.influencerId;
    }
  }

  if (!actorId) {
    const auth = await checkInfluencerAuth(req, 'influencerFinance.update');
    const fallbackAuth = !auth.isAuthed ? await checkInfluencerAuth(req, 'influencer.viewCommercial') : auth;
    if (!fallbackAuth.isAuthed) {
      return NextResponse.json({ error: 'Unauthorized: Finance write access required' }, { status: 403 });
    }
    actorId = fallbackAuth.userId;
  }

  try {
    const body = await req.json();
    if (!body.campaignCreatorId) {
      return NextResponse.json({ error: 'campaignCreatorId is required' }, { status: 400 });
    }
    if (!body.invoiceNumber) {
      return NextResponse.json({ error: 'invoiceNumber is required' }, { status: 400 });
    }
    if (body.amount === undefined || isNaN(Number(body.amount))) {
      return NextResponse.json({ error: 'Valid invoice amount is required' }, { status: 400 });
    }

    const payment = await submitInfluencerInvoice({
      campaignCreatorId: body.campaignCreatorId,
      invoiceAssetId: body.invoiceAssetId || null,
      invoiceNumber: String(body.invoiceNumber).trim(),
      invoiceReceivedDate: body.invoiceReceivedDate || new Date(),
      amount: Number(body.amount),
      currency: body.currency || 'QAR',
      actorId,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
