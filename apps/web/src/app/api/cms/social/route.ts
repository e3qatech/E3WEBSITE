import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireCurrentUser, AppAuthError } from '@/lib/server-auth';
import { isAdminRole } from '@/lib/auth-roles';
import { DEFAULT_SOCIAL_CHANNELS, DEFAULT_SOCIAL_POSTS } from '@/lib/cms-social';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    let posts: any[] = [];
    let channels: any[] = [];

    try {
      // 1. Fetch canonical published and approved posts
      const dbPosts = await db.socialPost.findMany({
        where: {
          status: 'PUBLISHED',
          moderationStatus: 'APPROVED',
        },
        include: {
          account: {
            select: {
              internalName: true,
              username: true,
              profileImageUrl: true,
              provider: true,
            },
          },
        },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 12,
      });

      if (dbPosts.length > 0) {
        posts = dbPosts.map((p: any) => ({
          id: p.id,
          platform: p.provider === 'META_INSTAGRAM' ? 'INSTAGRAM' : p.provider === 'YOUTUBE' ? 'YOUTUBE' : p.provider === 'META_FACEBOOK' ? 'FACEBOOK' : 'OTHER',
          postUrl: p.originalUrl,
          authorName: p.authorName,
          authorHandle: `@${p.authorUsername}`,
          authorAvatarUrl: p.authorAvatarUrl,
          captionEn: p.captionEn || p.rawCaption || '',
          captionAr: p.captionAr || p.rawCaption || '',
          mediaType: p.mediaType === 'VIDEO' || p.mediaType === 'REEL' ? 'VIDEO' : 'IMAGE',
          mediaUrl: p.mediaUrl,
          thumbnailUrl: p.thumbnailUrl || p.mediaUrl,
          postDate: p.publishedAt.toISOString(),
          isApproved: p.moderationStatus === 'APPROVED',
          isVisible: p.status === 'PUBLISHED',
          likeCount: p.likeCount,
          commentCount: p.commentCount,
        }));
      }

      // 2. Fetch connected active public social accounts as channels
      const dbAccounts = await db.socialAccount.findMany({
        where: { status: 'CONNECTED' },
        select: {
          id: true,
          provider: true,
          username: true,
          displayName: true,
          profileUrl: true,
          profileImageUrl: true,
        },
      });

      if (dbAccounts.length > 0) {
        channels = dbAccounts.map((acc: any, idx: number) => ({
          id: acc.id,
          platform: acc.provider === 'META_INSTAGRAM' ? 'INSTAGRAM' : acc.provider === 'YOUTUBE' ? 'YOUTUBE' : acc.provider === 'META_FACEBOOK' ? 'FACEBOOK' : 'OTHER',
          handle: `@${acc.username}`,
          profileUrl: acc.profileUrl || `https://instagram.com/${acc.username}`,
          isVisible: true,
          sortPriority: idx + 1,
        }));
      }
    } catch (_dbErr) {
      posts = [];
      channels = [];
    }

    // Graceful fallback to default mock channels and posts if DB has 0 records
    if (posts.length === 0) posts = DEFAULT_SOCIAL_POSTS;
    if (channels.length === 0) channels = DEFAULT_SOCIAL_CHANNELS;

    return NextResponse.json(
      {
        data: {
          channels,
          posts,
          lastSync: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('[GET /api/cms/social] error:', error);
    return NextResponse.json({
      data: {
        channels: DEFAULT_SOCIAL_CHANNELS,
        posts: DEFAULT_SOCIAL_POSTS,
        lastSync: new Date().toISOString(),
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Enforce server-side Admin RBAC
    const user = await requireCurrentUser();
    if (!isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, postId, isApproved, isVisible } = body;

    if (action === 'TOGGLE_APPROVAL' && postId) {
      try {
        await db.socialPost.update({
          where: { id: postId },
          data: {
            ...(isApproved !== undefined && {
              moderationStatus: isApproved ? 'APPROVED' : 'REJECTED',
            }),
            ...(isVisible !== undefined && {
              status: isVisible ? 'PUBLISHED' : 'HIDDEN',
            }),
          },
        });
      } catch (dbErr) {
        console.warn('[DB WARN /api/cms/social] SocialPost update failed:', dbErr);
      }
    }

    try {
      revalidatePath('/[locale]/b2c', 'layout');
    } catch (_revErr) {
      // Ignored during testing/offline environments
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AppAuthError || error?.name === 'AppAuthError' || typeof error?.statusCode === 'number') {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    }
    console.error('[POST /api/cms/social] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
