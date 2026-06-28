import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settingsRecords = await db.setting.findMany({
      where: { 
        key: { in: ["B2C_CALENDAR_PAGE_SETTINGS", "B2C_CALENDAR_DISCOUNTS"] }
      }
    })
    
    const settings = settingsRecords.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      pageSettings: settings.B2C_CALENDAR_PAGE_SETTINGS || {},
      discounts: settings.B2C_CALENDAR_DISCOUNTS || []
    })
  } catch (error) {
    console.error("Error fetching calendar settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { pageSettings, discounts } = body

    if (pageSettings !== undefined) {
      await db.setting.upsert({
        where: { key: "B2C_CALENDAR_PAGE_SETTINGS" },
        update: { value: pageSettings },
        create: { key: "B2C_CALENDAR_PAGE_SETTINGS", value: pageSettings, type: "UI" }
      })
    }

    if (discounts !== undefined) {
      await db.setting.upsert({
        where: { key: "B2C_CALENDAR_DISCOUNTS" },
        update: { value: discounts },
        create: { key: "B2C_CALENDAR_DISCOUNTS", value: discounts, type: "UI" }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating calendar settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
