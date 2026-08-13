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
    id: String(a.id),
    slug: String(a.slug || ''),
    name: {
      en: String(a.nameEn || ''),
      ar: String(a.nameAr || '')
    },
    isPublished: Boolean(a.isPublished),
    isFeatured: Boolean(a.isFeatured),
    isB2bVisible: a.isB2bVisible !== false,
    heroMediaUrl: a.heroMediaUrl ? String(a.heroMediaUrl) : null,
    heroFallbackUrl: a.heroFallbackUrl ? String(a.heroFallbackUrl) : null,
    heroThumbnailUrl: a.heroThumbnailUrl ? String(a.heroThumbnailUrl) : null,
    heroMediaType: a.heroMediaType ? String(a.heroMediaType) : null,
    _count: {
      pricing: Number(a._count?.pricing || 0),
      offers: Number(a._count?.offers || 0),
      faqs: Number(a._count?.faqs || 0)
    }
  }))

  // Explicit JSON DTO serialization to guarantee 100% RSC plain object boundary safety
  const safeDTO = JSON.parse(JSON.stringify(formattedAttractions))

  return <AttractionsList initialAttractions={safeDTO} />
}
