import { PackagesManager } from "@/components/dashboard/b2c/PackagesManager"
import { Metadata } from "next"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Packages & Birthday CMS | E3 Qatar Dashboard",
  description: "Manage E3 celebration packages, group outings, microsite sections, and tiers.",
}

export default async function DashboardPackagesPage() {
  let initialPackages: any[] = []
  try {
    initialPackages = await db.package.findMany({
      include: {
        categoryRel: true,
        attraction: { select: { id: true, nameEn: true, nameAr: true, slug: true, logoUrl: true } },
        brand: { select: { id: true, nameEn: true, nameAr: true, primaryLogoUrl: true } },
        location: { select: { id: true, nameEn: true, nameAr: true, slug: true } }
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    })
  } catch (e) {
    console.warn("[DASHBOARD PACKAGES SERVER LOAD] Failed to query packages:", e)
  }

  return <PackagesManager initialData={initialPackages} />
}
