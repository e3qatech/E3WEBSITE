import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase().trim();
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const pubStatus = searchParams.get('publicationStatus');
    const featured = searchParams.get('featured');

    const where: any = {};
    if (type) where.locationType = type;
    if (status) where.operationalStatus = status;
    if (pubStatus) where.publicationStatus = pubStatus;
    if (featured === 'true') where.featured = true;

    if (q) {
      where.OR = [
        { nameEn: { contains: q, mode: 'insensitive' } },
        { nameAr: { contains: q, mode: 'insensitive' } },
        { venueEn: { contains: q, mode: 'insensitive' } },
        { venueAr: { contains: q, mode: 'insensitive' } },
        { addressEn: { contains: q, mode: 'insensitive' } },
        { addressAr: { contains: q, mode: 'insensitive' } },
      ];
    }

    const locations = await db.location.findMany({
      where,
      include: {
        attraction: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
        attractionLinks: {
          include: {
            attraction: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({ data: locations });
  } catch (error: any) {
    console.error('[API_B2C_LOCATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nameEn,
      nameAr,
      slug,
      venueEn,
      venueAr,
      addressEn,
      addressAr,
      shortDescriptionEn,
      shortDescriptionAr,
      latitude,
      longitude,
      locationType = 'PERMANENT_ATTRACTION',
      operationalStatus = 'OPEN',
      publicationStatus = 'PUBLISHED',
      googleMapsUrl,
      directionsUrl,
      ticketingUrl,
      phone,
      email,
      whatsapp,
      coverMediaUrl,
      thumbnailMediaId,
      mapPinMediaId,
      pinColorToken = 'CYAN',
      featured = false,
      mapVisible = true,
      attractionId,
    } = body;

    if (!nameEn || !nameAr) {
      return NextResponse.json({ error: 'Name EN and Name AR are required.' }, { status: 400 });
    }

    // Server-side Coordinate Validation
    let lat: number | null = null;
    let lng: number | null = null;
    if (latitude !== undefined && latitude !== null && latitude !== '') {
      lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json({ error: 'Latitude must be a valid number between -90 and 90.' }, { status: 400 });
      }
    }

    if (longitude !== undefined && longitude !== null && longitude !== '') {
      lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return NextResponse.json({ error: 'Longitude must be a valid number between -180 and 180.' }, { status: 400 });
      }
    }

    const created = await db.location.create({
      data: {
        nameEn,
        nameAr,
        slug: slug || null,
        venueEn: venueEn || null,
        venueAr: venueAr || null,
        addressEn: addressEn || null,
        addressAr: addressAr || null,
        shortDescriptionEn: shortDescriptionEn || null,
        shortDescriptionAr: shortDescriptionAr || null,
        latitude: lat,
        longitude: lng,
        locationType,
        operationalStatus,
        publicationStatus,
        googleMapsUrl: googleMapsUrl || null,
        directionsUrl: directionsUrl || null,
        ticketingUrl: ticketingUrl || null,
        phone: phone || null,
        email: email || null,
        whatsapp: whatsapp || null,
        coverMediaUrl: coverMediaUrl || null,
        thumbnailMediaId: thumbnailMediaId || null,
        mapPinMediaId: mapPinMediaId || null,
        pinColorToken,
        featured: Boolean(featured),
        mapVisible: Boolean(mapVisible),
        isPublished: publicationStatus === 'PUBLISHED',
        attractionId: attractionId || null,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[API_B2C_LOCATIONS_POST]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
