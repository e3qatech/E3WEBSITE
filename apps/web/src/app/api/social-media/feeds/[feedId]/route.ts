import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { SocialPostStatus } from '@/lib/social-media/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ feedId: string }> }
) {
  const { feedId } = await params;
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'en';
  const page = Number(searchParams.get('page') || 1);
  const limitParam = searchParams.get('limit');
  const attractionId = searchParams.get('attractionId');
  const brandId = searchParams.get('brandId');

  try {
    // 1. Check global settings
    const globalSettings = await db.socialGlobalSettings.findUnique({
      where: { id: 'default' },
    });

    if (globalSettings && !globalSettings.publicFeedsEnabled) {
      return NextResponse.json({
        success: true,
        data: {
          feed: null,
          posts: [],
          total: 0,
          disabled: true,
        },
      });
    }

    // 2. Fetch Feed configuration
    const feed = await db.socialFeed.findUnique({
      where: { id: feedId },
      include: {
        sources: true,
        feedPosts: {
          include: { post: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!feed || !feed.isActive) {
      return NextResponse.json({ success: false, error: 'Feed not found or inactive.' }, { status: 404 });
    }

    const limit = limitParam ? Number(limitParam) : (feed.maxPosts || 12);
    const targetBrandId = brandId || feed.brandId;
    const targetAttractionId = attractionId || feed.attractionId;

    const sourceAccountIds = feed.sources.map((s: any) => s.accountId).filter(Boolean) as string[];

    // 3. Build post query depending on feed mode (AUTOMATIC, CURATED, HYBRID)
    let posts: any[] = [];

    if (feed.mode === 'CURATED') {
      posts = feed.feedPosts
        .filter((fp: any) => fp.post && fp.post.status === 'PUBLISHED' && fp.post.moderationStatus === 'APPROVED')
        .map((fp: any) => ({ ...fp.post, isPinnedInFeed: fp.isPinned }));
    } else {
      const where: any = {
        status: 'PUBLISHED' as SocialPostStatus,
        moderationStatus: 'APPROVED',
      };

      if (feed.portal !== 'SHARED') {
        where.portal = { in: [feed.portal, 'SHARED'] };
      }

      if (Array.isArray(feed.allowedPlatforms) && (feed.allowedPlatforms as string[]).length > 0) {
        where.provider = { in: feed.allowedPlatforms as any };
      }

      if (sourceAccountIds.length > 0) {
        where.accountId = { in: sourceAccountIds };
      }

      if (targetBrandId) {
        where.brandId = targetBrandId;
      }

      if (targetAttractionId) {
        where.attractionId = targetAttractionId;
      }

      const orderBy: any[] = [];
      if (feed.sortMethod === 'PINNED_FIRST') {
        orderBy.push({ isPinned: 'desc' });
      } else if (feed.sortMethod === 'FEATURED_FIRST') {
        orderBy.push({ isFeatured: 'desc' });
      }
      orderBy.push({ publishedAt: 'desc' });

      posts = await db.socialPost.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      });

      // If HYBRID, blend explicitly pinned feedPosts at top
      if (feed.mode === 'HYBRID' && feed.feedPosts.length > 0) {
        const pinnedFeedPosts = feed.feedPosts
          .filter((fp: any) => fp.post && fp.post.status === 'PUBLISHED')
          .map((fp: any) => ({ ...fp.post, isPinnedInFeed: true }));

        const pinnedIds = new Set(pinnedFeedPosts.map((p: any) => p.id));
        const filteredAuto = posts.filter((p: any) => !pinnedIds.has(p.id));
        posts = [...pinnedFeedPosts, ...filteredAuto].slice(0, limit);
      }
    }

    const total = posts.length;

    return NextResponse.json({
      success: true,
      data: {
        feed: {
          id: feed.id,
          name: feed.name,
          layout: feed.layout,
          theme: feed.theme,
          showCaptions: feed.showCaptions,
          captionLimit: feed.captionLimit,
          showEngagement: feed.showEngagement && (globalSettings?.showEngagementMetrics !== false),
          showPlatformBadge: feed.showPlatformBadge,
          showAccountName: feed.showAccountName,
          showPostDate: feed.showPostDate,
          enableFollowCta: feed.enableFollowCta,
          followCtaText: locale === 'ar' ? (feed.followCtaTextAr || 'تابع إي ثري قطر') : (feed.followCtaTextEn || 'Follow E3 Qatar'),
          emptyStateText: locale === 'ar' ? (feed.emptyStateTextAr || 'لا تتوفر منشورات تواصل حالياً.') : (feed.emptyStateTextEn || 'No social posts available at the moment.'),
          columnsDesktop: feed.columnsDesktop,
          columnsTablet: feed.columnsTablet,
          columnsMobile: feed.columnsMobile,
        },
        posts: posts.map(p => ({
          id: p.id,
          provider: p.provider,
          providerPostId: p.providerPostId,
          originalUrl: p.originalUrl,
          authorName: p.authorName,
          authorUsername: p.authorUsername,
          authorAvatarUrl: p.authorAvatarUrl,
          caption: locale === 'ar' ? (p.captionAr || p.captionEn || p.rawCaption || '') : (p.captionEn || p.captionAr || p.rawCaption || ''),
          mediaType: p.mediaType,
          mediaUrl: p.mediaUrl,
          thumbnailUrl: p.thumbnailUrl || p.mediaUrl,
          aspectRatio: p.aspectRatio || 1.0,
          publishedAt: p.publishedAt,
          likeCount: p.likeCount,
          commentCount: p.commentCount,
          shareCount: p.shareCount,
          viewCount: p.viewCount,
          isFeatured: p.isFeatured,
          isPinned: p.isPinned || p.isPinnedInFeed,
        })),
        total,
      },
    }, {
      headers: {
        'Cache-Control': `public, s-maxage=${globalSettings?.cacheDurationSeconds || 300}, stale-while-revalidate=60`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
