import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAttractionContentMediaMetrics } from "@/lib/attraction-master-workbook"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userRole = (session?.user as any)?.role
    const isAuthorized = session && ["SUPER_ADMIN", "B2C_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes(userRole)

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const attractionSlug = searchParams.get("slug") || undefined

    const metrics = await getAttractionContentMediaMetrics({ attractionSlug })

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error: any) {
    console.error("[MASTER_WORKBOOK_DASHBOARD_ERROR]", error)
    return NextResponse.json({
      error: error.message || "Failed to load dashboard metrics"
    }, { status: 500 })
  }
}
