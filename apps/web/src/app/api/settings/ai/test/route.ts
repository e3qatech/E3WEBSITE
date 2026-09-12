import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { getServerSecretSetting } from "@/lib/settings/public-settings";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userPermissions = (session.user as any)?.permissions;

    const isAuthorized =
      userRole === "SUPER_ADMIN" ||
      userRole === "ADMIN" ||
      userRole === "HR_ADMIN" ||
      hasPermission(userRole, "settings.general.manage", userPermissions);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    let apiKey = body.apiKey?.trim();

    if (!apiKey || apiKey.includes("••••")) {
      apiKey = await getServerSecretSetting("geminiApiKey");
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "No Gemini API Key provided or configured." },
        { status: 400 }
      );
    }

    // Test candidate models
    const testModels = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let verifiedModel: string | null = null;
    let lastError: string | null = null;

    for (const model of testModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Respond with: OK" }] }],
            }),
            signal: AbortSignal.timeout(10000),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.candidates && data.candidates.length > 0) {
          verifiedModel = model;
          break;
        } else {
          lastError = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
        }
      } catch (err: any) {
        lastError = err.message || "Connection timeout";
      }
    }

    if (verifiedModel) {
      return NextResponse.json({
        success: true,
        model: verifiedModel,
        message: `Successfully connected to Google Gemini AI using model: ${verifiedModel}`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: lastError || "Failed to validate Gemini API key with Google AI endpoint.",
      },
      { status: 422 }
    );
  } catch (error: any) {
    console.error("[POST /api/settings/ai/test] Exception:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
