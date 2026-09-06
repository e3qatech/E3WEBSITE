import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { createDeliverable } from '@/lib/influencer/deliverable-service';
import { deliverableUpsertSchema } from '@/lib/influencer/validations';
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
    const deliverables = await (db as any).campaignDeliverable.findMany({
      where: {
        campaignCreator: {
          campaignId,
        },
      },
      include: {
        campaignCreator: {
          include: {
            influencer: true,
          },
        },
        submissions: {
          include: { reviews: true },
          orderBy: { version: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(deliverables);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.update');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = deliverableUpsertSchema.parse(body);
    const deliverable = await createDeliverable({
      ...validated,
      actorId: auth.userId,
    });
    return NextResponse.json(deliverable, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
