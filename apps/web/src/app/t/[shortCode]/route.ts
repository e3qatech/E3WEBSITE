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
    // If tracking link is not found or invalid, redirect to home page
    return NextResponse.redirect(new URL('/en', req.url), { status: 307 });
  }

  return NextResponse.redirect(result.redirectUrl, { status: 307 });
}
