import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "OPERATIONS", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { template, serviceIds } = body

    // Log the action
    await db.systemLog.create({
      data: {
        action: `CATALOG_GENERATED`,
        entity: `B2B Service Portfolio`,
        userId: (session.user as any)?.id,
        metadata: {
          template,
          serviceCount: serviceIds?.length || 0,
          serviceIds
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[CATALOG_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
