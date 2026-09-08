import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getBaseUrl } from "@/lib/seo-helper";

export async function GET() {
  const baseUrl = getBaseUrl();
  let content = `User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml\nSitemap: ${baseUrl}/api/sitemap/generate`;

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
