import { db } from "@/lib/db"
import { B2BAttractionEditor } from "@/components/dashboard/b2b/B2BAttractionEditor"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Edit B2B Project & Attraction | E3 Admin",
}

export default async function EditB2BAttractionPage({
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
      temporalRules: true,
      featuresList: {
        include: {
          storyTypes: true
        }
      },
      locations: true,
      brandPlacements: true
    }
  })

  if (!attraction) {
    notFound()
  }

  return <B2BAttractionEditor initialData={JSON.parse(JSON.stringify(attraction))} />
}
