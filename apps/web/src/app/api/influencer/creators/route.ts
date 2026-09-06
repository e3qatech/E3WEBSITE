import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { listInfluencers, createInfluencer } from '@/lib/influencer/influencer-service';
import { influencerUpsertSchema } from '@/lib/influencer/validations';

export async function GET(req: NextRequest) {
  const auth = await checkInfluencerAuth(req, 'influencer.read');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') as any;
  const creatorTier = searchParams.get('creatorTier') as any;
  const platform = searchParams.get('platform') as any;
  const isQatarBasedParam = searchParams.get('isQatarBased');
  const isQatarBased = isQatarBasedParam !== null ? isQatarBasedParam === 'true' : undefined;
  const category = searchParams.get('category') || undefined;
  const language = searchParams.get('language') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

  try {
    const data = await listInfluencers({
      search,
      status,
      creatorTier,
      platform,
      isQatarBased,
      category,
      language,
      page,
      pageSize,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await checkInfluencerAuth(req, 'influencer.create');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = influencerUpsertSchema.parse(body);
    const created = await createInfluencer(validated, auth.userId);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
