import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { resolveQatarMapPins } from '@/lib/qatar-map-resolver';
import { getCMSPageContentServer } from '@/lib/cms-server';
import { memoryCache } from '@/lib/cache/memory-cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'en';
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');
    const featuredOnly = searchParams.get('featured') === 'true';
    const openNowOnly = searchParams.get('openNow') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false' && searchParams.get('includePast') !== 'true' && searchParams.get('all') !== 'true';

    const cacheKey = `api_qatar_map_${locale}_${typeFilter || ''}_${statusFilter || ''}_${featuredOnly}_${openNowOnly}_${activeOnly}`;

    const geoJson = await memoryCache.getOrSet(cacheKey, 60_000, async () => {
      // 1. Fetch Landing CMS settings if present
      let qatarMapSettings: any = {};
      try {
        const b2cContent = await getCMSPageContentServer('b2c-landing');
        if (b2cContent && typeof b2cContent === 'object') {
          qatarMapSettings = b2cContent.qatarMap || {};
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
      const resolved = resolveQatarMapPins({
        settings: qatarMapSettings,
        dbLocations,
        locale,
        activeOnly,
        typeFilter,
        statusFilter,
        featuredOnly,
        openNowOnly,
      });

      return resolved.geoJson;
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
