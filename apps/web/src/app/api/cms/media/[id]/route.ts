import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { del } from '@vercel/blob';
import { requireApiRole } from '@/lib/auth-helpers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireApiRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SALES_ADMIN']);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const media = await db.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(media.url);
    } catch (e) {
      console.warn('Failed to delete from blob storage:', e);
      // We continue to delete from DB even if blob deletion fails
    }

    // Delete from DB
    await db.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
