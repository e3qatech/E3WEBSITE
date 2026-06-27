import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "OPERATIONS"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const attractionId = searchParams.get('attractionId')

    const where = attractionId ? { attractionId } : {}

    const schedules = await db.eventSchedule.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        attraction: { select: { nameEn: true, slug: true } }
      }
    })

    return NextResponse.json(schedules)
  } catch (error: any) {
    console.error("[SCHEDULES_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "OPERATIONS"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { attractionId, startTime, endTime, eventType, capacityGate } = body

    if (!attractionId || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const schedule = await db.eventSchedule.create({
      data: {
        attractionId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        eventType: eventType || "REGULAR",
        capacityGate: parseInt(capacityGate) || 100,
        currentCount: 0
      },
      include: {
        attraction: { select: { nameEn: true, slug: true } }
      }
    })

    return NextResponse.json(schedule)
  } catch (error: any) {
    console.error("[SCHEDULES_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
