import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let pageSettings: any = {}
    let discounts: any[] = []

    try {
      const settingsRecords = await db.setting.findMany({
        where: { 
          key: { in: ["B2C_CALENDAR_PAGE_SETTINGS", "B2C_CALENDAR_DISCOUNTS"] }
        }
      })
      
      const settings = settingsRecords.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value
        return acc
      }, {} as Record<string, any>)

      pageSettings = settings.B2C_CALENDAR_PAGE_SETTINGS || {}
      discounts = settings.B2C_CALENDAR_DISCOUNTS || []
    } catch (err) {
      console.warn("[CALENDAR SETTINGS GET] Safe fallback for settings query:", err)
    }

    // Also attempt fallback to db.pages for b2c-calendar slug
    if (Object.keys(pageSettings).length === 0) {
      try {
        const pageRecord = await db.pages.findUnique({ where: { slug: "b2c-calendar" } })
        if (pageRecord?.content) {
          pageSettings = pageRecord.content
        }
      } catch (_e) {
        // Ignore
      }
    }

    return NextResponse.json({
      pageSettings,
      discounts
    })
  } catch (error) {
    console.error("Error fetching calendar settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { pageSettings, discounts } = body

    if (pageSettings !== undefined) {
      await db.setting.upsert({
        where: { key: "B2C_CALENDAR_PAGE_SETTINGS" },
        update: { value: pageSettings },
        create: { key: "B2C_CALENDAR_PAGE_SETTINGS", value: pageSettings, type: "UI" }
      }).catch((err: any) => console.warn("db.setting upsert notice:", err))

      try {
        await db.pages.upsert({
          where: { slug: "b2c-calendar" },
          update: { content: pageSettings, title: pageSettings.title || pageSettings.titleEn || "Events Calendar" },
          create: { slug: "b2c-calendar", title: pageSettings.title || pageSettings.titleEn || "Events Calendar", content: pageSettings, isPublished: true }
        })
      } catch (err: any) {
        console.warn("db.pages upsert notice:", err)
      }
    }

    if (discounts !== undefined) {
      await db.setting.upsert({
        where: { key: "B2C_CALENDAR_DISCOUNTS" },
        update: { value: discounts },
        create: { key: "B2C_CALENDAR_DISCOUNTS", value: discounts, type: "UI" }
      }).catch((err: any) => console.warn("db.setting discounts upsert notice:", err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating calendar settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
