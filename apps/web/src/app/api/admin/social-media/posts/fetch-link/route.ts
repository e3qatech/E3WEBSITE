import { NextRequest, NextResponse } from 'next/server';
import { ManualPostAdapter } from '@/lib/social-media/adapters/manual';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid post URL is required.' }, { status: 400 });
    }

    const adapter = new ManualPostAdapter();
    const fetchedData = await adapter.fetchPostByUrl(url);

    return NextResponse.json({
      success: true,
      data: fetchedData,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch details from link.' }, { status: 500 });
  }
}
