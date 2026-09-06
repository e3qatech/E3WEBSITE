import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { getUnmatchedConversions } from '@/lib/influencer/attribution-service';

export async function GET(req: NextRequest) {
  const auth = await checkInfluencerAuth(req, 'influencerFinance.read');
  const fallbackAuth = !auth.isAuthed ? await checkInfluencerAuth(req, 'influencerCampaign.read') : auth;

  if (!fallbackAuth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized: Finance or Campaign read access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const status = searchParams.get('status') || 'UNMATCHED_CODE';
  const search = searchParams.get('search') || undefined;

  try {
    const result = await getUnmatchedConversions({ page, limit, status, search });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
