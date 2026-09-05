import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userRole = (session?.user as any)?.role
    const isAuthorized = userRole && (hasPermission(userRole, 'operations.events.manage') || hasPermission(userRole, 'view:schedule') || ["SUPER_ADMIN", "OPERATIONS", "OPERATIONS_ADMIN", "EVENTS_ADMIN", "EVENTS_TEAM", "SUPPORT_ADMIN"].includes(userRole))
    if (!isAuthorized) {
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
    const userRole = (session?.user as any)?.role
    const isAuthorized = userRole && (hasPermission(userRole, 'operations.events.manage') || ["SUPER_ADMIN", "OPERATIONS", "OPERATIONS_ADMIN", "EVENTS_ADMIN"].includes(userRole))
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { attractionId, startTime, endTime, eventType, capacityGate, title, description } = body

    if (!attractionId || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const parsedCapacity = parseInt(capacityGate) || 100
    const schedule = await db.eventSchedule.create({
      data: {
        attractionId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        eventType: eventType || "REGULAR",
        capacityGate: parsedCapacity,
        currentCount: eventType === "CONFIRMED_PACKAGE" ? parsedCapacity : 0,
        title: title || null,
        description: description || null
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
