import { notFound } from "next/navigation"
import db from "@/lib/db"
import { ServiceEditForm } from "@/components/dashboard/b2b/ServiceEditForm"

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const service = await db.service.findUnique({
    where: { id: params.id },
    include: {
      gallery: { orderBy: { orderIndex: 'asc' } },
      projects: true
    }
  })

  if (!service) {
    notFound()
  }

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-hidden">
      <ServiceEditForm initialData={service} />
    </div>
  )
}
