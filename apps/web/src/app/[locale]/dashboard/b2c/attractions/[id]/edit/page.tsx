import { db } from "@/lib/db"
import { AttractionContentStudio } from "@/components/dashboard/b2c/attractions/AttractionContentStudio"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Edit Attraction Studio | E3 Admin",
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
      pricing: { orderBy: { createdAt: 'asc' } },
      faqs: { orderBy: { orderIndex: 'asc' } },
      gallery: { orderBy: { orderIndex: 'asc' } },
      socialLinks: true,
      offers: true,
      temporalRules: true,
      featuresList: {
        include: {
          storyTypes: true
        },
        orderBy: { orderIndex: 'asc' }
      },
      attractionLocations: {
        include: {
          location: true
        }
      },
      locations: true,
      brandPlacements: true
    }
  })

  if (!attraction) {
    notFound()
  }

  return <AttractionContentStudio initialData={JSON.parse(JSON.stringify(attraction))} />
}
