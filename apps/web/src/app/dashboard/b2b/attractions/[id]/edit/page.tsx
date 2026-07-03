import { db } from "@/lib/db"
import { AttractionEditor } from "@/components/dashboard/b2c/AttractionEditor"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export const metadata = {
  title: "Edit Attraction | E3 Admin",
}

export default async function EditAttractionPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { id } = await params
  
  const attraction = await db.attraction.findUnique({
    where: { id },
    include: {
      pricing: true,
      faqs: { orderBy: { orderIndex: 'asc' } },
      gallery: { orderBy: { orderIndex: 'asc' } },
      socialLinks: true,
      offers: true,
      temporalRules: true
    }
  })

  if (!attraction) {
    notFound()
  }

  return <AttractionEditor initialData={attraction} />
}
