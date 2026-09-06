import { NextRequest, NextResponse } from 'next/server';
import { resolveTrackingLinkRedirect } from '@/lib/influencer/attribution-service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;
  const searchParams = req.nextUrl.searchParams;

  const result = await resolveTrackingLinkRedirect(shortCode, searchParams);

  if (!result.found || !result.redirectUrl) {
    return NextResponse.json({ error: 'Tracking link not found' }, { status: 404 });
  }

  return NextResponse.redirect(result.redirectUrl, { status: 307 });
}
