import { NextResponse } from "next/server";
import { requireCurrentUser, AppAuthError } from "@/lib/server-auth";
import {
  applyPendingDatabaseMigrations,
  publishAllContent,
  cleanupSyntheticSmokeRecords,
  sendDedicatedTestEmail
} from "@/lib/auto-migrate";

export const dynamic = "force-dynamic";

async function verifySuperAdminAuth() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN" && !user.permissions.includes("*")) {
    throw new AppAuthError(403, "Forbidden: Only SUPER_ADMIN can execute migration/administrative endpoints.");
  }
  return user;
}

export async function GET() {
  try {
    await verifySuperAdminAuth();
    const results = await applyPendingDatabaseMigrations();
    return NextResponse.json({
      success: true,
      message: "Pending database migrations executed successfully.",
      migrations: results
    });
  } catch (error: any) {
    const status = error.statusCode || (error.name === "AppAuthError" ? error.statusCode : 500);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to execute migrations"
    }, { status: status || 500 });
  }
}

export async function POST() {
  try {
    await verifySuperAdminAuth();
    const results = await publishAllContent();
    return NextResponse.json({
      success: true,
      message: "All attractions and CMS pages have been marked as PUBLISHED.",
      results
    });
  } catch (error: any) {
    const status = error.statusCode || (error.name === "AppAuthError" ? error.statusCode : 500);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to publish content"
    }, { status: status || 500 });
  }
}

export async function DELETE() {
  try {
    await verifySuperAdminAuth();
    const results = await cleanupSyntheticSmokeRecords();
    return NextResponse.json({
      success: true,
      message: "Synthetic smoke test records purged successfully.",
      results
    });
  } catch (error: any) {
    const status = error.statusCode || (error.name === "AppAuthError" ? error.statusCode : 500);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to cleanup synthetic records"
    }, { status: status || 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await verifySuperAdminAuth();
    const body = await req.json().catch(() => ({}));
    const recipient = body.recipient || "amaan@eeeqa.com";
    const sha = body.sha || "8702696";

    const results = await sendDedicatedTestEmail(recipient, sha);
    return NextResponse.json({
      success: true,
      message: "Dedicated test email dispatched successfully.",
      results
    });
  } catch (error: any) {
    const status = error.statusCode || (error.name === "AppAuthError" ? error.statusCode : 500);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to send email"
    }, { status: status || 500 });
  }
}
