import { Metadata } from "next"
import db from "@/lib/db"
import { AttractionsTable } from "@/components/dashboard/b2c/AttractionsTable"

export const metadata: Metadata = {
  title: "B2C Attractions | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function AttractionsPage() {
  const attractions = await db.attraction.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      heroMediaUrl: true,
      isPublished: true,
      isHidden: true,
      createdAt: true
    }
  })

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">B2C Attractions</h1>
        <p className="text-[var(--text-secondary)] mt-2">Manage consumer experiences, tickets, and rules.</p>
      </div>

      <AttractionsTable attractions={attractions} />
    </div>
  )
}
