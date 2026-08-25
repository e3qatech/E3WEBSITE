import { NextResponse } from "next/server";
import { applyPendingDatabaseMigrations, publishAllContent, inspectMediaState } from "@/lib/auto-migrate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const inspection = await inspectMediaState();
    return NextResponse.json({
      success: true,
      data: inspection
    });
  } catch (error: any) {
    console.error("[INSPECT_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to inspect state"
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const results = await publishAllContent();
    return NextResponse.json({
      success: true,
      message: "All attractions and CMS pages have been marked as PUBLISHED.",
      results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to publish content"
    }, { status: 500 });
  }
}
