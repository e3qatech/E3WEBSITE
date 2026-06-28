import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const attractionId = searchParams.get('attractionId')

    const where = attractionId ? { attractionId } : {}

    const events = await db.eventSchedule.findMany({
      where,
      include: {
        attraction: {
          select: { nameEn: true, nameAr: true }
        }
      },
      orderBy: { startTime: 'desc' }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { attractionId, startTime, endTime, eventType, capacityGate, currentCount, title, description, heroMediaType, heroMediaUrl } = body

    if (!attractionId || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newEvent = await db.eventSchedule.create({
      data: {
        attractionId,
        title: title || null,
        description: description || null,
        heroMediaType: heroMediaType || "IMAGE",
        heroMediaUrl: heroMediaUrl || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        eventType: eventType || "REGULAR",
        capacityGate: parseInt(capacityGate) || 100,
        currentCount: parseInt(currentCount) || 0
      }
    })

    return NextResponse.json(newEvent)
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
