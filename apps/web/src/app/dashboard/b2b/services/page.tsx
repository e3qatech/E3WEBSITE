import { Metadata } from "next"
import db from "@/lib/db"
import { ServicesTable } from "@/components/dashboard/b2b/ServicesTable"

export const metadata: Metadata = {
  title: "B2B Services | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const services = await db.service.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleAr: true,
      thumbnail: true,
      isVisible: true,
      isFeatured: true,
      createdAt: true
    }
  })

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">B2B Services</h1>
        <p className="text-[var(--text-secondary)] mt-2">Manage the services offered to corporate clients.</p>
      </div>

      <ServicesTable services={services} />
    </div>
  )
}
