import { db } from "@/lib/db"
import { EventScheduleManager } from "@/components/dashboard/operations/EventScheduleManager"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Event Schedules | Operations | E3 Admin",
}

export default async function OperationsEventsPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "OPERATIONS"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  // Get next 30 days of schedules
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(now.getDate() + 30)

  const [schedules, attractions] = await Promise.all([
    db.eventSchedule.findMany({
      where: {
        startTime: {
          gte: new Date(now.setHours(0,0,0,0)),
          lte: thirtyDaysFromNow
        }
      },
      orderBy: { startTime: "asc" },
      include: {
        attraction: { select: { id: true, nameEn: true } }
      }
    }),
    db.attraction.findMany({
      select: { id: true, nameEn: true },
      orderBy: { nameEn: "asc" }
    })
  ])

  // Format dates for client
  const formattedSchedules = schedules.map(s => ({
    ...s,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
  }))

  return <EventScheduleManager initialSchedules={formattedSchedules as any} attractions={attractions} />
}
