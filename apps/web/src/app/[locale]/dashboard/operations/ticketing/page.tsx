import { db } from "@/lib/db"
import { TicketingDashboard } from "@/components/dashboard/operations/TicketingDashboard"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Ticketing Overview | Operations | E3 Admin",
}

export default async function TicketingPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "OPERATIONS"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  // Get active schedules from 1 week ago to 30 days out for analytics
  const now = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(now.getDate() - 7)
  
  const thirtyDaysOut = new Date()
  thirtyDaysOut.setDate(now.getDate() + 30)

  const schedules = await db.eventSchedule.findMany({
    where: {
      startTime: {
        gte: weekAgo,
        lte: thirtyDaysOut
      }
    },
    orderBy: { startTime: "asc" },
    include: {
      attraction: { select: { id: true, nameEn: true } }
    }
  })

  // Fetch latest mock ticketing/operations logs for the live feed
  const logs = await db.systemLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" }
  })

  // Format dates for client
  const formattedSchedules = schedules.map(s => ({
    ...s,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime.toISOString(),
  }))

  const formattedLogs = logs.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString()
  }))

  return <TicketingDashboard schedules={formattedSchedules as any} liveFeed={formattedLogs as any} />
}
