import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  let content = "User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /api/\nSitemap: https://e3.qa/api/sitemap/generate";

  try {
    const setting = await db.setting.findFirst({
      where: { key: "robotsTxt" }
    });
    if (setting?.value && typeof setting.value === "string") {
      content = setting.value;
    }
  } catch (_e) {
    // Fallback to default
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
