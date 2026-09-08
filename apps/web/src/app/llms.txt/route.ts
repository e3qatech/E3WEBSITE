import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getBaseUrl } from "@/lib/seo-helper";

export async function GET() {
  const baseUrl = getBaseUrl();
  let content = `# Events & Entertainment Enterprises (E3 Qatar)
> Qatar's premier event engineering, spatial production, and kinetic entertainment worlds.

## Public Portals & Pages
- B2C Entertainment Worlds: ${baseUrl}/en/b2c
- Attractions & Theme Parks: ${baseUrl}/en/b2c/attractions
- Birthday & Corporate Packages: ${baseUrl}/en/b2c/packages
- Event Calendar & Live Schedule: ${baseUrl}/en/b2c/calendar
- B2B Technical Production: ${baseUrl}/en/business
`;

  try {
    const setting = await db.setting.findFirst({
      where: { key: "llmsTxt" }
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
