import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { createTrackingLink } from '@/lib/influencer/attribution-service';
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
    const links = await (db as any).trackingLink.findMany({
      where: { campaignId },
      include: {
        campaignCreator: {
          include: { influencer: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(links);
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
    const link = await createTrackingLink({
      campaignId,
      campaignCreatorId: body.campaignCreatorId || null,
      destinationUrl: body.destinationUrl,
      utmCampaign: body.utmCampaign,
      utmContent: body.utmContent,
      actorId: auth.userId,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
