import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"

async function enforceLeadPermission() {
  try {
    return await requirePermission("crm.leads.manage")
  } catch {
    return await requirePermission("b2c.packages.manage")
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await enforceLeadPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const lead = await db.packageLead.findFirst({
      where: {
        OR: [{ id }, { leadId: id }]
      },
      include: {
        package: true,
        assignedTo: true,
        quotations: { include: { items: true } }
      }
    })

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    return NextResponse.json({ data: lead })
  } catch (error: any) {
    console.error("[GET /api/b2c/package-leads/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let user: any = null
    try {
      user = await enforceLeadPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const {
      status,
      priority,
      assignedToId,
      internalNotes,
      tasks,
      activityNote,
      estimatedValue,
      ...rest
    } = body

    const existing = await db.packageLead.findFirst({
      where: { OR: [{ id }, { leadId: id }] }
    })
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

    // Append to activity log
    const activityLog = Array.isArray(existing.activityLog) ? [...existing.activityLog] : []
    if (activityNote) {
      activityLog.push({
        id: `act-${Date.now()}`,
        action: "NOTE_ADDED",
        timestamp: new Date().toISOString(),
        details: String(activityNote).slice(0, 500),
        user: user?.name || "Staff"
      })
    }
    if (status && status !== existing.status) {
      activityLog.push({
        id: `act-${Date.now()}`,
        action: "STATUS_CHANGED",
        timestamp: new Date().toISOString(),
        details: `Status changed from ${existing.status} to ${status}`,
        user: user?.name || "Staff"
      })
    }
    if (assignedToId && assignedToId !== existing.assignedToId) {
      activityLog.push({
        id: `act-${Date.now()}`,
        action: "ASSIGNED",
        timestamp: new Date().toISOString(),
        details: `Assigned to user ID ${assignedToId}`,
        user: user?.name || "Staff"
      })
    }

    const updated = await db.packageLead.update({
      where: { id: existing.id },
      data: {
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        assignedToId: assignedToId !== undefined ? (assignedToId || null) : undefined,
        internalNotes: internalNotes !== undefined ? internalNotes : undefined,
        tasks: tasks !== undefined ? tasks : undefined,
        estimatedValue: estimatedValue !== undefined ? parseFloat(estimatedValue) : undefined,
        activityLog,
        ...rest
      },
      include: {
        package: true,
        assignedTo: true,
        quotations: true
      }
    })

    // Automatic Venue-Date-Time Calendar Slot Locking for Confirmed Celebrations
    try {
      if (status === "CONFIRMED" || status === "WON") {
        let venueId = updated.package?.attractionId
        if (!venueId) {
          const defaultAttraction = await db.attraction.findFirst({ select: { id: true } })
          venueId = defaultAttraction?.id
        }

        if (venueId) {
          const baseDate = updated.preferredDate ? new Date(updated.preferredDate) : new Date()
          const durationMinutes = updated.package?.durationMinutes || 120

          let startHour = 14
          let startMinute = 0
          let endHour = 16
          let endMinute = 0

          const timeSlot = updated.preferredTimeSlot
          if (timeSlot) {
            const rangeMatch = timeSlot.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/)
            if (rangeMatch) {
              startHour = parseInt(rangeMatch[1], 10)
              startMinute = parseInt(rangeMatch[2], 10)
              endHour = parseInt(rangeMatch[3], 10)
              endMinute = parseInt(rangeMatch[4], 10)
            } else {
              const singleMatch = timeSlot.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i)
              if (singleMatch) {
                let h = parseInt(singleMatch[1], 10)
                const m = singleMatch[2] ? parseInt(singleMatch[2], 10) : 0
                const meridian = singleMatch[3] ? singleMatch[3].toUpperCase() : null
                if (meridian === "PM" && h < 12) h += 12
                if (meridian === "AM" && h === 12) h = 0
                startHour = h
                startMinute = m
                const totalStartMinutes = startHour * 60 + startMinute + durationMinutes
                endHour = Math.floor(totalStartMinutes / 60) % 24
                endMinute = totalStartMinutes % 60
              }
            }
          }

          const calculatedStartTime = new Date(baseDate)
          calculatedStartTime.setHours(startHour, startMinute, 0, 0)

          const calculatedEndTime = new Date(baseDate)
          calculatedEndTime.setHours(endHour, endMinute, 0, 0)

          if (calculatedEndTime.getTime() <= calculatedStartTime.getTime()) {
            calculatedEndTime.setTime(calculatedStartTime.getTime() + durationMinutes * 60000)
          }

          const lockTag = `[PACKAGE_LEAD_ID:${updated.id}]`
          const scheduleTitle = `🔒 Confirmed: ${updated.celebrationName || updated.customerName} (${updated.package?.titleEn || "Celebration Package"})`
          const scheduleDescription = `${lockTag} Confirmed celebration booking for ${updated.customerName}. Guests: ${updated.expectedGuests || 10}. Venue Slot: ${timeSlot || "Reserved Slot"}`

          const existingSchedule = await db.eventSchedule.findFirst({
            where: {
              description: { contains: lockTag }
            }
          })

          if (existingSchedule) {
            await db.eventSchedule.update({
              where: { id: existingSchedule.id },
              data: {
                attractionId: venueId,
                startTime: calculatedStartTime,
                endTime: calculatedEndTime,
                eventType: "CONFIRMED_PACKAGE",
                capacityGate: updated.expectedGuests || 50,
                currentCount: updated.expectedGuests || 50,
                title: scheduleTitle,
                description: scheduleDescription
              }
            })
          } else {
            await db.eventSchedule.create({
              data: {
                attractionId: venueId,
                startTime: calculatedStartTime,
                endTime: calculatedEndTime,
                eventType: "CONFIRMED_PACKAGE",
                capacityGate: updated.expectedGuests || 50,
                currentCount: updated.expectedGuests || 50,
                title: scheduleTitle,
                description: scheduleDescription
              }
            })
          }
        }
      } else if (status === "LOST" || status === "CANCELLED") {
        // Release the locked schedule slot if celebration is lost or cancelled
        await db.eventSchedule.deleteMany({
          where: {
            description: { contains: `[PACKAGE_LEAD_ID:${updated.id}]` }
          }
        })
      }
    } catch (schedErr: any) {
      console.warn("[CALENDAR_LOCK_WARNING] Failed to synchronize schedule lock:", schedErr?.message || schedErr)
    }

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    console.error("[PUT /api/b2c/package-leads/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await enforceLeadPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.packageLead.findFirst({
      where: { OR: [{ id }, { leadId: id }] }
    })
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

    await db.packageLead.delete({ where: { id: existing.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/b2c/package-leads/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}
