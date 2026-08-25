import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BrandManagerClient } from "@/components/dashboard/brands/BrandManagerClient";
import { CANONICAL_BRAND_CATEGORIES } from "@/app/api/b2c/brand-categories/route";

export const metadata = {
  title: "Brand IP Management | E3 Admin",
};

export const dynamic = "force-dynamic";

export default async function DashboardBrandsPage() {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "B2C_ADMIN", "B2B_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login");
  }

  let brands: any[] = [];
  let categories: any[] = [];

  try {
    let [dbBrands, dbCategories] = await Promise.all([
      db.brandIP.findMany({
        include: {
          category: true,
          relationships: true,
        },
        orderBy: [
          { b2cDisplayOrder: "asc" },
          { updatedAt: "desc" },
        ],
      }).catch(() => []),
      db.brandCategory.findMany({
        orderBy: { nameEn: "asc" },
      }).catch(() => []),
    ]);

    // If categories table is empty in DB, auto seed canonical categories
    if (!dbCategories || dbCategories.length === 0) {
      try {
        for (const cat of CANONICAL_BRAND_CATEGORIES) {
          await db.brandCategory.upsert({
            where: { slug: cat.slug },
            update: { nameEn: cat.nameEn, nameAr: cat.nameAr },
            create: cat,
          });
        }
        dbCategories = await db.brandCategory.findMany({
          orderBy: { nameEn: "asc" },
        });
      } catch (seedErr) {
        console.warn("[AUTO_SEED_BRAND_CATEGORIES_WARN]", seedErr);
        dbCategories = CANONICAL_BRAND_CATEGORIES.map((c, i) => ({ id: `cat-fallback-${i}`, ...c }));
      }
    }

    brands = dbBrands || [];
    categories = dbCategories || [];
  } catch (error) {
    console.error("[DASHBOARD_BRANDS_PAGE_ERROR]", error);
    categories = CANONICAL_BRAND_CATEGORIES.map((c, i) => ({ id: `cat-fallback-${i}`, ...c }));
  }

  return <BrandManagerClient initialBrands={brands} categories={categories} />;
}
