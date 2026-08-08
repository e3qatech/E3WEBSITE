import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e3.qa";

    // 1. Core Static Routes
    const staticRoutes = [
      "",
      "/en/b2c",
      "/ar/b2c",
      "/en/b2c/attractions",
      "/ar/b2c/attractions",
      "/en/b2c/packages",
      "/ar/b2c/packages",
      "/en/b2c/calendar",
      "/ar/b2c/calendar",
      "/en/b2c/discover",
      "/ar/b2c/discover",
      "/en/b2c/contact",
      "/ar/b2c/contact",
      "/en/business",
      "/ar/business",
      "/en/business/about",
      "/ar/business/about",
      "/en/business/contact",
      "/ar/business/contact",
      "/en/business/services",
      "/ar/business/services",
      "/en/business/cases",
      "/ar/business/cases",
      "/en/business/careers",
      "/ar/business/careers",
    ];

    // 2. Published Attractions
    let attractions: any[] = [];
    try {
      attractions = await db.attraction.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true }
      });
    } catch (_e) {
      attractions = [];
    }

    const attractionUrls = attractions.map((a) => `/en/b2c/attractions/${a.slug}`);

    const allPaths = [...staticRoutes, ...attractionUrls];

    const xmlItems = allPaths
      .map(
        (path) => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${path === "" || path === "/en/b2c" ? "1.0" : "0.8"}</priority>
  </url>`
      )
      .join("");

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;

    // Save generated sitemap timestamp in settings
    try {
      await (db as any).siteSettings.upsert({
        where: { key: "last_sitemap_generated_at" },
        update: { value: new Date().toISOString(), type: "SEO" },
        create: { key: "last_sitemap_generated_at", value: new Date().toISOString(), type: "SEO" }
      });
    } catch (_e) {
      // Ignore setting save error
    }

    return new NextResponse(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error: any) {
    console.error("[SITEMAP_GENERATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate sitemap" }, { status: 500 });
  }
}
