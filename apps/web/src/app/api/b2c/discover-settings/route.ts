import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";

export async function GET() {
  try {
    let content: any = null;
    const page = await prisma.pages.findUnique({
      where: { slug: "b2c-discover" }
    });

    if (page && page.content) {
      content = page.content;
    } else {
      const setting = await prisma.setting.findUnique({
        where: { key: "B2C_DISCOVER_PAGE_SETTINGS" }
      });
      if (setting && setting.value) {
        content = typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
      }
    }

    const merged = getMergedCMSPageContent("b2c-discover", content);
    return NextResponse.json(merged);
  } catch (error) {
    console.error("Failed to fetch discover settings", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const page = await prisma.pages.upsert({
      where: { slug: "b2c-discover" },
      update: {
        content: data.content || data,
        seo: data.seo || {},
        status: "PUBLISHED",
        updatedAt: new Date()
      },
      create: {
        slug: "b2c-discover",
        title: { en: "Discover E3 Qatar", ar: "استكشف إي ثري قطر" },
        content: data.content || data,
        seo: data.seo || {},
        status: "PUBLISHED",
        portal: "B2C"
      }
    });

    // Also mirror to setting table for backward compatibility
    await prisma.setting.upsert({
      where: { key: "B2C_DISCOVER_PAGE_SETTINGS" },
      update: { value: data.content || data },
      create: { key: "B2C_DISCOVER_PAGE_SETTINGS", value: data.content || data }
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Failed to save discover settings", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
