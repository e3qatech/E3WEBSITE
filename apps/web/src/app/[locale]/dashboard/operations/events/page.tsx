import { db } from "@/lib/db"
import { EventScheduleManager } from "@/components/dashboard/operations/EventScheduleManager"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"

export const metadata = {
  title: "Event Schedules | Operations | E3 Admin",
}

export const dynamic = "force-dynamic"

export default async function OperationsEventsPage(props?: {
  params?: Promise<{ locale: string }>
}) {
  const session = await auth()
  const params = props?.params
  const resolvedParams = params ? await params : { locale: "en" }
  const locale = resolvedParams.locale || "en"

  const userRole = (session?.user as any)?.role
  const isAuthorized =
    userRole &&
    (hasPermission(userRole, "operations.events.manage") ||
      hasPermission(userRole, "view:schedule") ||
      ["SUPER_ADMIN", "OPERATIONS", "OPERATIONS_ADMIN", "EVENTS_ADMIN", "EVENTS_TEAM", "SUPPORT_ADMIN"].includes(userRole))

  if (!isAuthorized) {
    redirect(locale === "ar" ? "/ar/login" : "/login")
  }

  // Query a generous time window (past 60 days to next 365 days)
  const windowStart = new Date()
  windowStart.setDate(windowStart.getDate() - 60)
  const windowEnd = new Date()
  windowEnd.setDate(windowEnd.getDate() + 365)

  const [schedules, attractions, confirmedLeads] = await Promise.all([
    db.eventSchedule.findMany({
      where: {
        startTime: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      orderBy: { startTime: "asc" },
      include: {
        attraction: { select: { id: true, nameEn: true, nameAr: true } },
      },
    }),
    db.attraction.findMany({
      select: { id: true, nameEn: true, nameAr: true },
      orderBy: { nameEn: "asc" },
    }),
    db.packageLead.findMany({
      where: {
        status: { in: ["CONFIRMED", "WON"] },
        preferredDate: { not: null },
      },
      include: {
        package: {
          include: {
            attraction: { select: { id: true, nameEn: true, nameAr: true } },
          },
        },
      },
      orderBy: { preferredDate: "asc" },
    }),
  ])

  // Format existing schedules
  const formattedSchedules = schedules.map((s: any) => ({
    ...s,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
  }))

  // Identify already tracked lead locks
  const existingLockTags = new Set(
    schedules.map((s: any) => s.description || "").filter(Boolean)
  )

  // Merge any confirmed leads that don't yet have an explicit schedule entry
  const fallbackAttraction = attractions[0] || { id: "default-attraction", nameEn: "Main Venue", nameAr: "الموقع الرئيسي" }
  const leadSchedules: any[] = []

  for (const lead of confirmedLeads) {
    const lockTag = `[PACKAGE_LEAD_ID:${lead.id}]`
    const isAlreadyTracked = Array.from(existingLockTags).some((desc: any) => String(desc).includes(lockTag))
    if (!isAlreadyTracked && lead.preferredDate) {
      const baseDate = new Date(lead.preferredDate)
      const duration = lead.package?.durationMinutes || 120

      let startH = 14
      let startM = 0
      let endH = 16
      let endM = 0

      if (lead.preferredTimeSlot) {
        const match = lead.preferredTimeSlot.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/)
        if (match) {
          startH = parseInt(match[1], 10)
          startM = parseInt(match[2], 10)
          endH = parseInt(match[3], 10)
          endM = parseInt(match[4], 10)
        }
      }

      const st = new Date(baseDate)
      st.setHours(startH, startM, 0, 0)
      const et = new Date(baseDate)
      et.setHours(endH, endM, 0, 0)
      if (et.getTime() <= st.getTime()) {
        et.setTime(st.getTime() + duration * 60000)
      }

      const resolvedVenue = lead.package?.attraction || fallbackAttraction

      leadSchedules.push({
        id: `lead-${lead.id}`,
        attractionId: resolvedVenue.id,
        startTime: st.toISOString(),
        endTime: et.toISOString(),
        eventType: "CONFIRMED_PACKAGE",
        capacityGate: lead.expectedGuests || 30,
        currentCount: lead.expectedGuests || 30,
        title: `🔒 Confirmed: ${lead.celebrationName || lead.customerName} (${lead.package?.titleEn || "Celebration Package"})`,
        description: `${lockTag} Confirmed celebration booking for ${lead.customerName}. Guests: ${lead.expectedGuests || 10}. Venue Slot: ${lead.preferredTimeSlot || "Reserved Slot"}`,
        attraction: resolvedVenue,
      })
    }
  }

  const allSchedules = [...formattedSchedules, ...leadSchedules]

  return (
    <EventScheduleManager
      initialSchedules={allSchedules as any}
      attractions={attractions as any}
    />
  )
}
