import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { FALLBACK_ATTRACTIONS } from '@/components/b2c/AttractionsDirectory';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'en';
    const isAr = locale === 'ar';
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');
    const featuredOnly = searchParams.get('featured') === 'true';
    const openNowOnly = searchParams.get('openNow') === 'true';

    let dbLocations: any[] = [];
    try {
      dbLocations = await db.location.findMany({
        where: {
          mapVisible: true,
          publicationStatus: 'PUBLISHED',
          isPublished: true,
          ...(typeFilter ? { locationType: typeFilter } : {}),
          ...(statusFilter ? { operationalStatus: statusFilter } : {}),
          ...(featuredOnly ? { featured: true } : {}),
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

    // Combine database locations with canonical fallback location points if database empty
    const itemsToProcess = dbLocations.length > 0 ? dbLocations : FALLBACK_ATTRACTIONS.map(attr => ({
      id: `loc-${attr.id}`,
      slug: attr.slug,
      nameEn: attr.nameEn,
      nameAr: attr.nameAr,
      venueEn: attr.operations?.locationNameEn || "Qatar",
      venueAr: attr.operations?.locationNameAr || "قطر",
      addressEn: attr.operations?.locationNameEn || "Qatar",
      addressAr: attr.operations?.locationNameAr || "قطر",
      latitude: attr.operations?.lat || attr.coordinates?.lat || 25.418,
      longitude: attr.operations?.lng || attr.coordinates?.lng || 51.530,
      locationType: attr.category === 'WATER & SPLASH' ? 'SEASONAL_ATTRACTION' : 'PERMANENT_ATTRACTION',
      operationalStatus: attr.operations?.openingSoon ? 'COMING_SOON' : 'OPEN',
      pinColorToken: 'CYAN',
      featured: true,
      mapVisible: true,
      publicationStatus: 'PUBLISHED',
      coverMediaUrl: attr.heroMediaUrl,
      ticketingUrl: attr.ticketingUrl || `/en/b2c/calendar`,
      attraction: attr
    }));

    const features: any[] = [];

    for (const loc of itemsToProcess) {
      const lat = typeof loc.latitude === 'number' ? loc.latitude : parseFloat(loc.latitude);
      const lng = typeof loc.longitude === 'number' ? loc.longitude : parseFloat(loc.longitude);

      // Validate numeric coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        continue;
      }

      // Collect associated attractions
      const linkedAttrObjs: any[] = [];
      if (loc.attraction) {
        linkedAttrObjs.push(loc.attraction);
      }
      if (loc.attractionLinks && Array.isArray(loc.attractionLinks)) {
        loc.attractionLinks.forEach((link: any) => {
          if (link.attraction && link.mapVisible !== false) {
            linkedAttrObjs.push(link.attraction);
          }
        });
      }

      const primaryAttr = linkedAttrObjs[0] || {};
      const title = isAr ? (loc.nameAr || primaryAttr.nameAr) : (loc.nameEn || primaryAttr.nameEn);
      const venue = isAr ? (loc.venueAr || primaryAttr.venueAr || 'قطر') : (loc.venueEn || primaryAttr.venueEn || 'Qatar');
      const address = isAr ? (loc.addressAr || venue) : (loc.addressEn || venue);
      const thumbnailUrl = loc.coverMediaUrl || primaryAttr.heroMediaUrl || primaryAttr.heroThumbnailUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop';
      const ticketUrl = loc.ticketingUrl || primaryAttr.ticketingUrl || `/en/b2c/calendar`;
      const directionsUrl = loc.directionsUrl || loc.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

      // Open now logic
      let isOpen = loc.operationalStatus === 'OPEN';
      if (openNowOnly && !isOpen) continue;

      features.push({
        type: "Feature",
        id: loc.id,
        geometry: {
          type: "Point",
          coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
        },
        properties: {
          locationId: loc.id,
          slug: loc.slug || primaryAttr.slug || loc.id,
          name: title,
          nameEn: loc.nameEn || primaryAttr.nameEn,
          nameAr: loc.nameAr || primaryAttr.nameAr,
          venue,
          address,
          shortDescription: isAr ? (loc.shortDescriptionAr || primaryAttr.taglineAr) : (loc.shortDescriptionEn || primaryAttr.taglineEn),
          locationType: loc.locationType || 'PERMANENT_ATTRACTION',
          operationalStatus: loc.operationalStatus || 'OPEN',
          thumbnailUrl,
          pinColorToken: loc.pinColorToken || (loc.featured ? 'GOLD' : 'CYAN'),
          featured: Boolean(loc.featured),
          attractionCount: Math.max(1, linkedAttrObjs.length),
          ticketingUrl: ticketUrl,
          directionsUrl,
          googleMapsUrl: loc.googleMapsUrl || directionsUrl,
          latitude: lat,
          longitude: lng,
          attractions: linkedAttrObjs.map((a) => ({
            id: a.id,
            slug: a.slug,
            nameEn: a.nameEn,
            nameAr: a.nameAr,
            heroMediaUrl: a.heroMediaUrl,
            ticketingUrl: a.ticketingUrl || `/en/b2c/calendar`
          }))
        }
      });
    }

    const geoJson = {
      type: "FeatureCollection",
      features
    };

    return NextResponse.json(geoJson, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/geo+json'
      }
    });

  } catch (error: any) {
    console.error('[PUBLIC_LOCATIONS_MAP_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
