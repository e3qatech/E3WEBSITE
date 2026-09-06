import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { getCampaignById, updateCampaign } from '@/lib/influencer/campaign-service';
import { campaignUpsertSchema } from '@/lib/influencer/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.read');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const campaign = await getCampaignById(id);
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.update');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const partialSchema = campaignUpsertSchema.partial();
    const validated = partialSchema.parse(body);
    const updated = await updateCampaign(id, validated as any, auth.userId);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
