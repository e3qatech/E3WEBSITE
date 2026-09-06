import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { getInfluencerById, updateInfluencer } from '@/lib/influencer/influencer-service';
import { influencerUpsertSchema } from '@/lib/influencer/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await checkInfluencerAuth(req, 'influencer.read');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Check if caller can view sensitive fields
  const canViewSensitive = auth.role === 'SUPER_ADMIN' || (auth.permissions && auth.permissions.includes('influencer.viewSensitive'));

  try {
    const creator = await getInfluencerById(id, canViewSensitive);
    if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    return NextResponse.json(creator);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await checkInfluencerAuth(req, 'influencer.update');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const partialSchema = influencerUpsertSchema.partial();
    const validated = partialSchema.parse(body);
    const updated = await updateInfluencer(id, validated, auth.userId);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await checkInfluencerAuth(req, 'influencer.archive');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const archived = await updateInfluencer(id, { status: 'ARCHIVED' as any }, auth.userId);
    return NextResponse.json(archived);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
