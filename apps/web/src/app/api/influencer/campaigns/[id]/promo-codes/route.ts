import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { createPromoCode } from '@/lib/influencer/attribution-service';
import db from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.read');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const promoCodes = await (db as any).promoCode.findMany({
      where: { campaignId },
      include: {
        campaignCreator: {
          include: { influencer: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(promoCodes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const promo = await createPromoCode({
      campaignId,
      campaignCreatorId: body.campaignCreatorId || null,
      code: body.code,
      discountType: body.discountType,
      discountValue: body.discountValue,
      currency: body.currency,
      validFrom: body.validFrom,
      validUntil: body.validUntil,
      usageLimit: body.usageLimit,
      eligibleProducts: body.eligibleProducts,
      bookingQubeReference: body.bookingQubeReference,
      actorId: auth.userId,
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
