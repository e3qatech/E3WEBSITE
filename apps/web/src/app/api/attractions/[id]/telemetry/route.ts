import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitter } from '@/lib/emitter';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sensorId, currentCount, healthStatus = 'OK' } = body;

    if (!sensorId || currentCount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: sensorId, currentCount' },
        { status: 400 }
      );
    }

    // 1. Save telemetry data
    const log = await db.telemetryLog.create({
      data: {
        attractionId: id,
        sensorId,
        payload: { currentCount },
        healthStatus,
      },
    });

    // 2. Find currently active schedule to get max capacity
    // For simplicity, we just find the closest future or active schedule
    const now = new Date();
    const activeSchedule = await db.eventSchedule.findFirst({
      where: {
        attractionId: id,
        endTime: { gt: now },
      },
      orderBy: { startTime: 'asc' },
    });

    let maxCapacity = 100; // fallback
    if (activeSchedule) {
      maxCapacity = activeSchedule.capacityGate;
      
      // Update the active schedule's current count
      await db.eventSchedule.update({
        where: { id: activeSchedule.id },
        data: { currentCount },
      });
    }

    // 3. Emit real-time occupancy event to Socket.io via Redis
    const occupancyEvent = {
      attractionId: id,
      current: currentCount,
      max: maxCapacity,
      timestamp: log.timestamp.toISOString(),
    };

    // Emit to /public namespace, targeting the specific attraction room
    emitter.of('/public')
      .to(`attraction:${id}`)
      .emit('occupancy:update', occupancyEvent);

    // Also emit to dashboard for global visibility
    emitter.of('/dashboard').emit('occupancy:update', occupancyEvent);

    return NextResponse.json({ success: true, event: occupancyEvent });
  } catch (error) {
    console.error('[Telemetry POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
