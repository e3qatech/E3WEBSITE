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

  // Get next 30 days of schedules
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(now.getDate() + 30)

  const [schedules, attractions] = await Promise.all([
    db.eventSchedule.findMany({
      where: {
        startTime: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: thirtyDaysFromNow,
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
  ])

  // Format dates for client
  const formattedSchedules = schedules.map((s: any) => ({
    ...s,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
  }))

  return (
    <EventScheduleManager
      initialSchedules={formattedSchedules as any}
      attractions={attractions as any}
    />
  )
}
