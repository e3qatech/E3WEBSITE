import { db } from "@/lib/db"
import { AttractionsList } from "@/components/dashboard/b2c/AttractionsList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "B2C Attractions | E3 Admin",
}

export default async function AttractionsPage() {
  const session = await auth()
  if (!session && process.env.NODE_ENV === "production") {
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
      isB2bVisible: true,
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

  const formattedAttractions = attractions.map((a: any) => ({
    id: a.id,
    slug: a.slug,
    name: {
      en: a.nameEn || "",
      ar: a.nameAr || ""
    },
    isPublished: Boolean(a.isPublished),
    isFeatured: Boolean(a.isFeatured),
    isB2bVisible: a.isB2bVisible !== false,
    heroMediaUrl: a.heroMediaUrl,
    heroFallbackUrl: a.heroFallbackUrl,
    heroThumbnailUrl: a.heroThumbnailUrl,
    heroMediaType: a.heroMediaType,
    _count: a._count || { pricing: 0, offers: 0, faqs: 0 }
  }))

  return <AttractionsList initialAttractions={formattedAttractions} />
}
