import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  let content = `# E3 Qatar - Event Engineering & Immersive Attractions
> Qatar's premier event engineering, spatial production, and kinetic entertainment worlds.

## Public Portals & Pages
- B2C Entertainment Worlds: https://e3.qa/en/b2c
- Attractions & Theme Parks: https://e3.qa/en/b2c/attractions
- Birthday & Corporate Packages: https://e3.qa/en/b2c/packages
- Event Calendar & Live Schedule: https://e3.qa/en/b2c/calendar
- B2B Technical Production: https://e3.qa/en/business
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
