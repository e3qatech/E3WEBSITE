import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const insights = await db.insight.findMany({
      where: { publishStatus: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 20
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e3.qa";

    const itemsXml = insights.map((item: any) => `
      <item>
        <title><![CDATA[${item.titleEn}]]></title>
        <link>${baseUrl}/en/b2c/insights/${item.slug}</link>
        <guid>${baseUrl}/en/b2c/insights/${item.slug}</guid>
        <pubDate>${item.publishedAt ? new Date(item.publishedAt).toUTCString() : new Date(item.createdAt).toUTCString()}</pubDate>
        <description><![CDATA[${item.excerptEn || ''}]]></description>
      </item>
    `).join("");

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>E3 Qatar Insights &amp; News</title>
    <link>${baseUrl}</link>
    <description>Latest insights, news, and press releases from E3 Qatar</description>
    <language>en-us</language>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate"
      }
    });
  } catch (_error: any) {
    return NextResponse.json({ error: "Failed to generate RSS feed" }, { status: 500 });
  }
}
