import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { SocialFeedMode } from '@/lib/social-media/types';

import { checkSocialAdminAuth } from '@/lib/social-media/auth-check';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'VIEW_SOCIAL_MANAGER');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const feeds = await db.socialFeed.findMany({
      include: {
        sources: {
          include: {
            account: { select: { internalName: true, username: true, provider: true } },
          },
        },
        _count: { select: { feedPosts: true, placements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: feeds });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MANAGE_FEEDS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      mode = 'HYBRID',
      portal = 'SHARED',
      allowedPlatforms,
      allowedMediaTypes,
      brandId,
      attractionId,
      maxPosts = 12,
      initialLoadCount = 6,
      loadMoreEnabled = true,
      sortMethod = 'LATEST_FIRST',
      showCaptions = true,
      showEngagement = true,
      showPlatformBadge = true,
      showAccountName = true,
      showPostDate = true,
      enableFollowCta = true,
      followCtaTextEn = 'Follow E3 Qatar',
      followCtaTextAr = 'تابع إي ثري قطر',
      theme = 'SYSTEM',
      layout = 'GRID',
      columnsDesktop = 3,
      columnsTablet = 2,
      columnsMobile = 1,
      accountIds = [],
    } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Feed name is required.' }, { status: 400 });
    }

    const feed = await db.socialFeed.create({
      data: {
        name,
        description,
        mode: mode as SocialFeedMode,
        portal,
        allowedPlatforms,
        allowedMediaTypes,
        brandId: brandId || null,
        attractionId: attractionId || null,
        maxPosts,
        initialLoadCount,
        loadMoreEnabled,
        sortMethod,
        showCaptions,
        showEngagement,
        showPlatformBadge,
        showAccountName,
        showPostDate,
        enableFollowCta,
        followCtaTextEn,
        followCtaTextAr,
        theme,
        layout,
        columnsDesktop,
        columnsTablet,
        columnsMobile,
        sources: {
          create: Array.isArray(accountIds)
            ? accountIds.map((accId: string) => ({ accountId: accId }))
            : [],
        },
      },
      include: { sources: true },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'FEED_UPDATE',
        targetType: 'SOCIAL_FEED',
        targetId: feed.id,
        summary: `Created social feed "${feed.name}"`,
      },
    });

    return NextResponse.json({ success: true, data: feed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MANAGE_FEEDS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const body = await req.json();
    const { id, name, description, isActive, mode, portal, allowedPlatforms, allowedMediaTypes, brandId, attractionId, maxPosts, initialLoadCount, loadMoreEnabled, sortMethod, layout, theme, columnsDesktop, columnsTablet, columnsMobile, enableFollowCta, followCtaTextEn, followCtaTextAr, accountIds } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Feed ID is required.' }, { status: 400 });
    }

    // Replace sources if accountIds is passed
    if (Array.isArray(accountIds)) {
      await db.socialFeedSource.deleteMany({ where: { feedId: id } });
      if (accountIds.length > 0) {
        await db.socialFeedSource.createMany({
          data: accountIds.map((accId: string) => ({ feedId: id, accountId: accId })),
        });
      }
    }

    const updated = await db.socialFeed.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(mode !== undefined && { mode }),
        ...(portal !== undefined && { portal }),
        ...(allowedPlatforms !== undefined && { allowedPlatforms }),
        ...(allowedMediaTypes !== undefined && { allowedMediaTypes }),
        ...(brandId !== undefined && { brandId: brandId || null }),
        ...(attractionId !== undefined && { attractionId: attractionId || null }),
        ...(maxPosts !== undefined && { maxPosts }),
        ...(initialLoadCount !== undefined && { initialLoadCount }),
        ...(loadMoreEnabled !== undefined && { loadMoreEnabled }),
        ...(sortMethod !== undefined && { sortMethod }),
        ...(layout !== undefined && { layout }),
        ...(theme !== undefined && { theme }),
        ...(columnsDesktop !== undefined && { columnsDesktop }),
        ...(columnsTablet !== undefined && { columnsTablet }),
        ...(columnsMobile !== undefined && { columnsMobile }),
        ...(enableFollowCta !== undefined && { enableFollowCta }),
        ...(followCtaTextEn !== undefined && { followCtaTextEn }),
        ...(followCtaTextAr !== undefined && { followCtaTextAr }),
      },
      include: { sources: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MANAGE_FEEDS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Feed ID is required.' }, { status: 400 });
    }

    await db.socialFeed.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Feed deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
