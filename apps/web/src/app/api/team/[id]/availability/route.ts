import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: employeeProfileId } = await params
    const body = await request.json()
    const { daysOfWeek, startTime, endTime, duration, buffer } = body

    // 1. Clear existing unbooked slots for this member to prevent duplicates
    await db.availabilitySlot.deleteMany({
      where: {
        employeeProfileId,
        isBooked: false,
        startTime: { gte: new Date() }
      }
    })

    const slots = []
    const startHour = parseInt(startTime.split(":")[0])
    const startMin = parseInt(startTime.split(":")[1])
    const endHour = parseInt(endTime.split(":")[0])
    const endMin = parseInt(endTime.split(":")[1])

    // Generate slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + i)
      const day = targetDate.getDay()

      if (daysOfWeek.includes(day)) {
        // Set start time for the day
        const slotStart = new Date(targetDate)
        slotStart.setHours(startHour, startMin, 0, 0)

        // Set end time for the day
        const dayEnd = new Date(targetDate)
        dayEnd.setHours(endHour, endMin, 0, 0)

        let currentStart = new Date(slotStart)

        while (currentStart.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
          const currentEnd = new Date(currentStart.getTime() + duration * 60 * 1000)
          
          slots.push({
            employeeProfileId,
            startTime: new Date(currentStart),
            endTime: new Date(currentEnd),
            isBooked: false
          })

          // Advance by duration + buffer
          currentStart = new Date(currentEnd.getTime() + buffer * 60 * 1000)
        }
      }
    }

    if (slots.length > 0) {
      await db.availabilitySlot.createMany({
        data: slots
      })
    }

    return NextResponse.json({ success: true, count: slots.length })
  } catch (error: any) {
    console.error("[SLOTS_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
