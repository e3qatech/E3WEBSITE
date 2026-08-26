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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { id } = await params;
    const body = await request.json();
    const { folder, alt, tags, fileName } = body;

    const existing = await db.media.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const currentMetadata = typeof existing.metadata === 'object' && existing.metadata ? (existing.metadata as any) : {};
    const newMetadata = {
      ...currentMetadata,
      ...(folder !== undefined ? { folder } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(fileName !== undefined ? { fileName } : {}),
    };

    const updated = await db.media.update({
      where: { id },
      data: {
        metadata: newMetadata,
        ...(alt !== undefined ? { alt } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating media item:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update media' }, { status: 500 });
  }
}
