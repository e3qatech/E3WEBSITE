import { ServicesEditor } from "@/components/dashboard/b2b/ServicesEditor"

import { db } from "@/lib/db"

export const metadata = {
  title: "New Service | E3 B2B Management",
  description: "Create a new engineering service.",
}

export default async function NewServicePage() {
  const attractions = await db.attraction.findMany({
    select: { id: true, nameEn: true }
  })

  return (
    <div className="w-full">
      <ServicesEditor attractions={attractions} />
    </div>
  )
}
