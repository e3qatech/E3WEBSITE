import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const CANONICAL_BRAND_CATEGORIES = [
  { slug: "festivals-parades", nameEn: "Festivals & Parades", nameAr: "المهرجانات والكرنفالات" },
  { slug: "inflatables-parks", nameEn: "Inflatables & Parks", nameAr: "المدن الهوائية والمطاطية" },
  { slug: "fec-family-entertainment", nameEn: "Family Entertainment (FEC)", nameAr: "الترفيه العائلي ومراكز الألعاب" },
  { slug: "edutainment-workshops", nameEn: "Edutainment & Workshops", nameAr: "الترفيه التعليمي والورش" },
  { slug: "spatial-ticketing-tech", nameEn: "Ticketing & Spatial Tech", nameAr: "تكنولوجيا حجز التذاكر والتشغيل" },
  { slug: "kinetic-esports", nameEn: "Kinetic Arenas & Esports", nameAr: "حلبات المنافسات والرياضات الإلكترونية" },
  { slug: "pop-culture-ip", nameEn: "Licensed Pop Culture IP", nameAr: "حقوق الشخصيات والترفيه المرخص" },
  { slug: "hospitality-fnb", nameEn: "F&B & Themed Hospitality", nameAr: "المطاعم والضيافة الترفيهية" },
  { slug: "seasonal-popups", nameEn: "Seasonal Pop-ups & Activations", nameAr: "الفعاليات المؤقتة والموسمية" },
];

export async function GET() {
  try {
    let categories = await db.brandCategory.findMany({
      orderBy: { nameEn: "asc" },
    });

    if (categories.length === 0) {
      // Auto-seed canonical categories
      for (const cat of CANONICAL_BRAND_CATEGORIES) {
        await db.brandCategory.upsert({
          where: { slug: cat.slug },
          update: { nameEn: cat.nameEn, nameAr: cat.nameAr },
          create: cat,
        });
      }
      categories = await db.brandCategory.findMany({
        orderBy: { nameEn: "asc" },
      });
    }

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("[BRAND_CATEGORIES_GET_ERROR]", error);
    // Return fallback list on database cold start
    return NextResponse.json(
      CANONICAL_BRAND_CATEGORIES.map((c, i) => ({ id: `cat-fallback-${i}`, ...c }))
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "B2C_ADMIN", "B2B_ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nameEn, nameAr, slug } = await req.json();
    if (!nameEn || !nameAr) {
      return NextResponse.json({ error: "nameEn and nameAr are required" }, { status: 400 });
    }

    const cleanSlug = (slug || nameEn)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const category = await db.brandCategory.upsert({
      where: { slug: cleanSlug },
      update: { nameEn, nameAr },
      create: { slug: cleanSlug, nameEn, nameAr },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("[BRAND_CATEGORIES_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
