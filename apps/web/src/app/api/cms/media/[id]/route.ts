import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { del } from '@vercel/blob';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await db.user.findUnique({ where: { id: (session.user as any).id } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Account inactive or unauthorized' }, { status: 401 });
    }
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const { id } = await params;

    try {
      const media = await db.media.findUnique({ where: { id } });
      if (media) {
        try {
          if (media.url && media.url.startsWith('http')) {
            await del(media.url);
          }
        } catch (_e) {}
        await db.media.delete({ where: { id } });
      }
    } catch (_dbErr) {
      // Gracefully ignore missing record errors
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
