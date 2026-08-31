import { Metadata } from "next";
import { PackagesClient } from "@/components/b2c/PackagesClient";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Packages | E3 Qatar",
  description: "Book VIP birthday parties, corporate team-building outings, and exclusive venue buyouts across Qatar.",
};

export default async function PackagesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  let settings: any = null;

  try {
    let page = await db.pages.findUnique({
      where: { slug: "b2c-packages-page" }
    });
    if (!page) {
      page = await db.pages.findUnique({
        where: { slug: "b2c-packages" }
      });
    }
    if (page && page.content) {
      settings = page.content;
    }
  } catch (e) {
    console.warn("[PACKAGES PAGE DB NOTICE] Failed to query pages table:", e);
  }

  let packages: any[] = [];
  try {
    packages = await db.package.findMany({
      where: { isPublished: true },
      include: {
        attraction: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
        brand: { select: { id: true, nameEn: true, nameAr: true } },
        location: { select: { id: true, nameEn: true, nameAr: true } }
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    });
  } catch (e) {
    console.warn("[PACKAGES PAGE DB NOTICE] Failed to query packages:", e);
  }

  let categories: any[] = [];
  try {
    categories = await db.packageCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    });
  } catch (e) {
    console.warn("[PACKAGES PAGE DB NOTICE] Failed to query package categories:", e);
  }

  return (
    <div className="min-h-screen bg-[var(--surface-default)] pt-20">
      <PackagesClient locale={locale} initialSettings={settings} packages={packages} categories={categories} />
    </div>
  );
}
