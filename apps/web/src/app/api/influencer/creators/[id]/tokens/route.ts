import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { createSecureCreatorToken } from '@/lib/influencer/tokens';
import type { PortalTokenScope } from '@/lib/influencer/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await checkInfluencerAuth(req, 'influencer.create');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const scope: PortalTokenScope = body.scope || 'COMPLETE_PROFILE';
    const expiryHours = body.expiryHours === 48 ? 48 : body.expiryHours === 72 ? 72 : 24;
    const locale = body.locale || 'en';

    const tokenResult = await createSecureCreatorToken({
      influencerId: id,
      scope,
      campaignCreatorId: body.campaignCreatorId || null,
      expiryHours,
      createdById: auth.userId,
      locale,
    });

    return NextResponse.json(tokenResult, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
