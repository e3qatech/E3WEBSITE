import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BrandManagerClient } from "@/components/dashboard/brands/BrandManagerClient";

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
    const [dbBrands, dbCategories] = await Promise.all([
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

    brands = dbBrands || [];
    categories = dbCategories || [];
  } catch (error) {
    console.error("[DASHBOARD_BRANDS_PAGE_ERROR]", error);
  }

  return <BrandManagerClient initialBrands={brands} categories={categories} />;
}
