import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Fetch telemetry logs for an attraction
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if attraction exists
    const attraction = await db.attraction.findUnique({
      where: { id: id.includes('-') ? undefined : id, slug: id.includes('-') ? id : undefined },
    });

    if (!attraction) {
      return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
    }

    const telemetry = await db.telemetryLog.findMany({
      where: { attractionId: attraction.id },
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to last 100 entries
    });

    return NextResponse.json(telemetry);
  } catch (error) {
    console.error('[TELEMETRY_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Create a new telemetry log
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sensorId, payload, healthStatus } = body;

    if (!sensorId || !payload) {
      return NextResponse.json({ error: 'Missing required fields: sensorId, payload' }, { status: 400 });
    }

    // Check if attraction exists
    const attraction = await db.attraction.findUnique({
      where: { id: id.includes('-') ? undefined : id, slug: id.includes('-') ? id : undefined },
    });

    if (!attraction) {
      return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
    }

    const log = await db.telemetryLog.create({
      data: {
        attractionId: attraction.id,
        sensorId,
        payload,
        healthStatus: healthStatus || 'OK',
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('[TELEMETRY_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
