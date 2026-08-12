import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { SocialPlacementLocation } from '@/lib/social-media/types';

import { checkSocialAdminAuth } from '@/lib/social-media/auth-check';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'VIEW_SOCIAL_MANAGER');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const placements = await db.socialPlacement.findMany({
      include: {
        feed: {
          select: { id: true, name: true, mode: true, layout: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: placements });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MANAGE_PLACEMENTS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const body = await req.json();
    const {
      name,
      location,
      feedId,
      portal = 'SHARED',
      pageSlug,
      sectionPosition = 0,
      isEnabled = true,
      headingEn,
      headingAr,
      subheadingEn,
      subheadingAr,
      eyebrowEn,
      eyebrowAr,
      ctaTextEn,
      ctaTextAr,
      ctaDestination,
      theme = 'SYSTEM',
      layoutOverride,
      maxPostsOverride,
      visibleDesktop = true,
      visibleTablet = true,
      visibleMobile = true,
    } = body;

    if (!name || !location || !feedId) {
      return NextResponse.json({ success: false, error: 'Name, location, and feedId are required.' }, { status: 400 });
    }

    const placement = await db.socialPlacement.create({
      data: {
        name,
        location: location as SocialPlacementLocation,
        feedId,
        portal,
        pageSlug: pageSlug || null,
        sectionPosition,
        isEnabled,
        headingEn: headingEn || 'Live Social Moments',
        headingAr: headingAr || 'لحظات حية من شبكات التواصل',
        subheadingEn: subheadingEn || 'Real-time stories and guest highlights across E3 destinations.',
        subheadingAr: subheadingAr || 'تابع تجارب ولحظات زوار وجهات إي ثري الترفيهية.',
        eyebrowEn: eyebrowEn || 'E3 HAPPENING NOW',
        eyebrowAr: eyebrowAr || 'إي ثري الآن',
        ctaTextEn: ctaTextEn || 'Follow Official E3 Channels',
        ctaTextAr: ctaTextAr || 'تابع قنوات إي ثري الرسمية',
        ctaDestination: ctaDestination || '#social-channels',
        theme,
        layoutOverride: layoutOverride || null,
        maxPostsOverride: maxPostsOverride ? Number(maxPostsOverride) : null,
        visibleDesktop,
        visibleTablet,
        visibleMobile,
      },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'PLACEMENT_UPDATE',
        targetType: 'SOCIAL_PLACEMENT',
        targetId: placement.id,
        summary: `Created site placement "${placement.name}"`,
      },
    });

    return NextResponse.json({ success: true, data: placement });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MANAGE_PLACEMENTS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const body = await req.json();
    const { id, name, feedId, isEnabled, headingEn, headingAr, subheadingEn, subheadingAr, eyebrowEn, eyebrowAr, ctaTextEn, ctaTextAr, ctaDestination, theme, layoutOverride, maxPostsOverride, visibleDesktop, visibleTablet, visibleMobile, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Placement ID is required.' }, { status: 400 });
    }

    const updated = await db.socialPlacement.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(feedId !== undefined && { feedId }),
        ...(isEnabled !== undefined && { isEnabled }),
        ...(headingEn !== undefined && { headingEn }),
        ...(headingAr !== undefined && { headingAr }),
        ...(subheadingEn !== undefined && { subheadingEn }),
        ...(subheadingAr !== undefined && { subheadingAr }),
        ...(eyebrowEn !== undefined && { eyebrowEn }),
        ...(eyebrowAr !== undefined && { eyebrowAr }),
        ...(ctaTextEn !== undefined && { ctaTextEn }),
        ...(ctaTextAr !== undefined && { ctaTextAr }),
        ...(ctaDestination !== undefined && { ctaDestination }),
        ...(theme !== undefined && { theme }),
        ...(layoutOverride !== undefined && { layoutOverride: layoutOverride || null }),
        ...(maxPostsOverride !== undefined && { maxPostsOverride: maxPostsOverride ? Number(maxPostsOverride) : null }),
        ...(visibleDesktop !== undefined && { visibleDesktop }),
        ...(visibleTablet !== undefined && { visibleTablet }),
        ...(visibleMobile !== undefined && { visibleMobile }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MANAGE_PLACEMENTS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Placement ID is required.' }, { status: 400 });
    }

    await db.socialPlacement.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Placement deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
