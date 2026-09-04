import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const location = await db.location.findUnique({
      where: { id },
      include: {
        attraction: true,
        attractionLinks: {
          include: {
            attraction: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({ data: location });
  } catch (error: any) {
    console.error('[API_B2C_LOCATION_GET_ID]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN', 'B2C_ADMIN', 'OPERATIONS'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;
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
      locationType,
      operationalStatus,
      publicationStatus,
      googleMapsUrl,
      directionsUrl,
      ticketingUrl,
      phone,
      email,
      whatsapp,
      coverMediaUrl,
      thumbnailMediaId,
      mapPinMediaId,
      pinColorToken,
      featured,
      mapVisible,
      attractionId,
    } = body;

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

    const updated = await db.location.update({
      where: { id },
      data: {
        ...(nameEn ? { nameEn } : {}),
        ...(nameAr ? { nameAr } : {}),
        slug: slug || null,
        venueEn: venueEn || null,
        venueAr: venueAr || null,
        addressEn: addressEn || null,
        addressAr: addressAr || null,
        shortDescriptionEn: shortDescriptionEn || null,
        shortDescriptionAr: shortDescriptionAr || null,
        latitude: lat,
        longitude: lng,
        ...(locationType ? { locationType } : {}),
        ...(operationalStatus ? { operationalStatus } : {}),
        ...(publicationStatus ? { publicationStatus, isPublished: publicationStatus === 'PUBLISHED' } : {}),
        googleMapsUrl: googleMapsUrl || null,
        directionsUrl: directionsUrl || null,
        ticketingUrl: ticketingUrl || null,
        phone: phone || null,
        email: email || null,
        whatsapp: whatsapp || null,
        coverMediaUrl: coverMediaUrl || null,
        thumbnailMediaId: thumbnailMediaId || null,
        mapPinMediaId: mapPinMediaId || null,
        ...(pinColorToken ? { pinColorToken } : {}),
        featured: featured !== undefined ? Boolean(featured) : undefined,
        mapVisible: mapVisible !== undefined ? Boolean(mapVisible) : undefined,
        attractionId: attractionId || null,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error('[API_B2C_LOCATION_PUT_ID]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN', 'B2C_ADMIN', 'OPERATIONS'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;

    await db.location.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API_B2C_LOCATION_DELETE_ID]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
