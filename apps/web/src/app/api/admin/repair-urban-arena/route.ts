import { NextResponse } from "next/server"
import { repairUrbanArenaCanonicalSlug } from "@/lib/canonical-urban-arena-repair"

export async function GET() {
  try {
    const result = await repairUrbanArenaCanonicalSlug()
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to execute canonical slug repair"
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
