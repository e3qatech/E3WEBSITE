import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { resolveQatarMapPins } from '@/lib/qatar-map-resolver';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'en';
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');
    const featuredOnly = searchParams.get('featured') === 'true';
    const openNowOnly = searchParams.get('openNow') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false' && searchParams.get('includePast') !== 'true' && searchParams.get('all') !== 'true';

    // 1. Fetch Landing CMS settings if present
    let qatarMapSettings: any = {};
    try {
      const b2cPage = await db.cMSPage.findUnique({
        where: { slug: 'b2c-landing' },
      });
      if (b2cPage?.content && typeof b2cPage.content === 'object') {
        qatarMapSettings = (b2cPage.content as any).qatarMap || {};
      }
    } catch (_e) {
      qatarMapSettings = {};
    }

    // 2. Fetch canonical published Location records
    let dbLocations: any[] = [];
    try {
      dbLocations = await db.location.findMany({
        where: {
          mapVisible: true,
          publicationStatus: 'PUBLISHED',
          isPublished: true,
        },
        include: {
          attraction: true,
          attractionLinks: {
            include: {
              attraction: true,
            },
          },
        },
        orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }],
      });
    } catch (_e) {
      dbLocations = [];
    }

    // 3. Resolve pins using canonical resolver
    const { geoJson } = resolveQatarMapPins({
      settings: qatarMapSettings,
      dbLocations,
      locale,
      activeOnly,
      typeFilter,
      statusFilter,
      featuredOnly,
      openNowOnly,
    });

    return NextResponse.json(geoJson, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/geo+json',
      },
    });
  } catch (error: any) {
    console.error('[PUBLIC_LOCATIONS_MAP_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
