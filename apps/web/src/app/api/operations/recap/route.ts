import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "OPERATIONS"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { attractionId, dateRange } = body

    // Parse dateRange
    const now = new Date()
    let startDate = new Date()
    if (dateRange === "Today") {
      startDate.setHours(0, 0, 0, 0)
    } else if (dateRange === "Last 7 Days") {
      startDate.setDate(now.getDate() - 7)
    } else if (dateRange === "This Year") {
      startDate.setMonth(0, 1)
      startDate.setHours(0, 0, 0, 0)
    } else {
      // Default to Last 30 Days
      startDate.setDate(now.getDate() - 30)
    }

    const whereClause: any = {
      startTime: {
        gte: startDate,
        lte: now
      }
    }

    if (attractionId) {
      whereClause.attractionId = attractionId
    }

    const schedules = await db.eventSchedule.findMany({
      where: whereClause,
      include: {
        attraction: { select: { id: true, nameEn: true } }
      }
    })

    const visitors = schedules.reduce((acc, s) => acc + s.currentCount, 0)
    
    // Fetch generic pricing to estimate revenue if we don't have explicit transaction data
    let avgPrice = 150 // Fallback price
    if (attractionId) {
      const pricing = await db.attractionPricing.findFirst({
        where: { attractionId }
      })
      if (pricing) avgPrice = pricing.price
    } else {
      // Average across all
      const allPrices = await db.attractionPricing.findMany()
      if (allPrices.length > 0) {
        avgPrice = allPrices.reduce((acc, p) => acc + p.price, 0) / allPrices.length
      }
    }

    const revenue = visitors * avgPrice

    // Mock top tickets based on the aggregated data
    const topTickets = [
      { name: "General Admission", count: Math.floor(visitors * 0.65) },
      { name: "VIP Pass", count: Math.floor(visitors * 0.20) },
      { name: "Family Bundle", count: Math.floor(visitors * 0.15) }
    ]

    let attractionName = "All Attractions"
    if (attractionId && schedules.length > 0) {
      attractionName = schedules[0].attraction.nameEn
    } else if (attractionId) {
      const attr = await db.attraction.findUnique({ where: { id: attractionId } })
      if (attr) attractionName = attr.nameEn
    }

    const recapData = {
      attractionName,
      dateRange,
      visitors,
      revenue,
      avgRating: 4.8, // Static for now unless we aggregate feedback
      topTickets
    }

    // Log the action
    await db.systemLog.create({
      data: {
        action: `RECAP_GENERATED`,
        entity: `RecapReport`,
        userId: (session.user as any)?.id,
        metadata: {
          attractionId,
          dateRange,
          visitors,
          revenue
        }
      }
    })

    return NextResponse.json(recapData)
  } catch (error: any) {
    console.error("[RECAP_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
