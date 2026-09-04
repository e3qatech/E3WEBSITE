import { NextResponse } from "next/server"
import { repairUrbanArenaCanonicalSlug } from "@/lib/canonical-urban-arena-repair"
import { requireCurrentUser } from "@/lib/server-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const user = await requireCurrentUser()
    if (user.role !== "SUPER_ADMIN" && !user.permissions.includes("*")) {
      return NextResponse.json({ error: "Forbidden: Super Admin required" }, { status: 403 })
    }

    const result = await repairUrbanArenaCanonicalSlug()
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    const status = error?.statusCode || 500
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to execute canonical slug repair"
    }, { status })
  }
}

export async function POST() {
  return GET()
}
