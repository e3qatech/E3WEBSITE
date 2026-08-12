import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { SocialModerationStatus, SocialPostStatus, SocialProviderKey } from '@/lib/social-media/types';

import { checkSocialAdminAuth } from '@/lib/social-media/auth-check';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'VIEW_SOCIAL_MANAGER');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const provider = searchParams.get('provider') as SocialProviderKey | null;
    const accountId = searchParams.get('accountId');
    const brandId = searchParams.get('brandId');
    const attractionId = searchParams.get('attractionId');
    const status = searchParams.get('status') as SocialPostStatus | null;
    const moderationStatus = searchParams.get('moderationStatus') as SocialModerationStatus | null;
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);

    const where: any = {};

    if (search) {
      where.OR = [
        { captionEn: { contains: search, mode: 'insensitive' } },
        { captionAr: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { authorUsername: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (provider) where.provider = provider;
    if (accountId) where.accountId = accountId;
    if (brandId) where.brandId = brandId;
    if (attractionId) where.attractionId = attractionId;
    if (status) where.status = status;
    if (moderationStatus) where.moderationStatus = moderationStatus;

    const [posts, total] = await Promise.all([
      db.socialPost.findMany({
        where,
        include: {
          account: {
            select: { internalName: true, username: true, profileImageUrl: true },
          },
          carouselMedia: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: [{ isPinned: 'desc' }, { isFeatured: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.socialPost.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MODERATE_POSTS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const body = await req.json();
    const {
      provider = 'MANUAL',
      originalUrl,
      authorName = 'E3 Qatar',
      authorUsername = 'e3qatar',
      authorAvatarUrl,
      captionEn,
      captionAr,
      mediaType = 'IMAGE',
      mediaUrl,
      thumbnailUrl,
      brandId,
      attractionId,
      portal = 'SHARED',
      isFeatured = false,
      isPinned = false,
      status = 'PUBLISHED',
      moderationStatus = 'APPROVED',
    } = body;

    if (!mediaUrl) {
      return NextResponse.json({ success: false, error: 'Media URL is required.' }, { status: 400 });
    }

    const providerPostId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const post = await db.socialPost.create({
      data: {
        provider: provider as SocialProviderKey,
        providerPostId,
        originalUrl: originalUrl || `https://e3.qa/posts/${providerPostId}`,
        authorName,
        authorUsername,
        authorAvatarUrl: authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        captionEn: captionEn || '',
        captionAr: captionAr || '',
        rawCaption: captionEn || '',
        mediaType,
        mediaUrl,
        thumbnailUrl: thumbnailUrl || mediaUrl,
        brandId: brandId || null,
        attractionId: attractionId || null,
        portal,
        isFeatured,
        isPinned,
        status,
        moderationStatus,
        publishedAt: new Date(),
      },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'POST_MUTATE',
        targetType: 'SOCIAL_POST',
        targetId: post.id,
        summary: `Created manual social post ${post.id}`,
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MODERATE_POSTS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const body = await req.json();
    const { id, ids, captionEn, captionAr, isPinned, isFeatured, status, moderationStatus, brandId, attractionId, thumbnailUrl, sortPriority } = body;

    // Bulk moderation support
    if (Array.isArray(ids) && ids.length > 0) {
      await db.socialPost.updateMany({
        where: { id: { in: ids } },
        data: {
          ...(status && { status }),
          ...(moderationStatus && { moderationStatus }),
          ...(brandId !== undefined && { brandId: brandId || null }),
          ...(attractionId !== undefined && { attractionId: attractionId || null }),
        },
      });

      return NextResponse.json({ success: true, message: `Updated ${ids.length} posts.` });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Post ID is required.' }, { status: 400 });
    }

    const updated = await db.socialPost.update({
      where: { id },
      data: {
        ...(captionEn !== undefined && { captionEn }),
        ...(captionAr !== undefined && { captionAr }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(status !== undefined && { status }),
        ...(moderationStatus !== undefined && { moderationStatus }),
        ...(brandId !== undefined && { brandId: brandId || null }),
        ...(attractionId !== undefined && { attractionId: attractionId || null }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(sortPriority !== undefined && { sortPriority }),
      },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'POST_MODERATE',
        targetType: 'SOCIAL_POST',
        targetId: id,
        summary: `Moderated social post ${id}`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MODERATE_POSTS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Post ID is required.' }, { status: 400 });
    }

    await db.socialPost.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Post removed successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req);
}
