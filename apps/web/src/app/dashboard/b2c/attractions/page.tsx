import { db } from "@/lib/db"
import { AttractionsList } from "@/components/dashboard/b2c/AttractionsList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "B2C Attractions | E3 Admin",
}

export default async function AttractionsPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const attractions = await db.attraction.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      isPublished: true,
      isFeatured: true,
      heroMediaUrl: true,
      heroFallbackUrl: true,
      heroThumbnailUrl: true,
      heroMediaType: true,
      _count: {
        select: {
          pricing: true,
          offers: true,
          faqs: true
        }
      }
    }
  })

  const formattedAttractions = attractions.map(a => ({
    id: a.id,
    slug: a.slug,
    name: {
      en: a.nameEn,
      ar: a.nameAr
    },
    isPublished: a.isPublished,
    isFeatured: a.isFeatured,
    heroMediaUrl: a.heroMediaUrl,
    _count: a._count
  }))

  return <AttractionsList initialAttractions={formattedAttractions} />
}
