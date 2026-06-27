import { Metadata } from "next"
import db from "@/lib/db"
import { CatalogGeneratorView } from "@/components/dashboard/operations/CatalogGeneratorView"

export const metadata: Metadata = {
  title: "Catalog Generator | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function CatalogGeneratorPage() {
  const services = await db.service.findMany({
    select: { id: true, titleEn: true, taglineEn: true },
    orderBy: { titleEn: "asc" }
  })

  return <CatalogGeneratorView services={services} />
}
