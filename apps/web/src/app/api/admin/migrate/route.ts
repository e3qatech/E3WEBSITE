import { NextResponse } from "next/server";
import { applyPendingDatabaseMigrations } from "@/lib/auto-migrate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await applyPendingDatabaseMigrations();
    return NextResponse.json({
      success: true,
      message: "Pending database migrations executed successfully.",
      migrations: results
    });
  } catch (error: any) {
    console.error("[MIGRATE_ERROR]", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to execute migrations"
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}

export async function DELETE() {
  try {
    const results = await cleanupSyntheticSmokeRecords();
    return NextResponse.json({
      success: true,
      message: "Synthetic smoke test records purged successfully.",
      results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to cleanup synthetic records"
    }, { status: 500 });
  }
}
