import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { listCampaigns, createCampaign } from '@/lib/influencer/campaign-service';
import { campaignUpsertSchema } from '@/lib/influencer/validations';

export async function GET(req: NextRequest) {
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.read');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as any;
  const campaignType = searchParams.get('campaignType') as any;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  try {
    const data = await listCampaigns({ status, campaignType, search, page, pageSize });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.create');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = campaignUpsertSchema.parse(body);
    const campaign = await createCampaign(validated, auth.userId);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
