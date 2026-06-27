import { notFound } from "next/navigation"
import db from "@/lib/db"
import { AttractionEditForm } from "@/components/dashboard/b2c/AttractionEditForm"

export default async function EditAttractionPage({ params }: { params: { id: string } }) {
  const attraction = await db.attraction.findUnique({
    where: { id: params.id },
    include: {
      gallery: { orderBy: { orderIndex: 'asc' } },
      pricing: true,
      offers: true,
      faqs: { orderBy: { orderIndex: 'asc' } },
      socialLinks: true,
      temporalRules: true,
    }
  })

  if (!attraction) {
    notFound()
  }

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-hidden">
      <AttractionEditForm initialData={attraction} />
    </div>
  )
}
