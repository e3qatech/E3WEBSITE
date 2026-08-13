import { db } from "@/lib/db"
import { B2BAttractionsList, B2BAttractionItem } from "@/components/dashboard/b2b/B2BAttractionsList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "B2B Attractions & Projects | E3 Admin",
}

export default async function B2BAttractionsPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const attractions = await db.attraction.findMany({
    orderBy: [
      { createdAt: "desc" }
    ],
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      taglineEn: true,
      taglineAr: true,
      isPublished: true,
      isFeatured: true,
      isB2bVisible: true,
      b2bCategory: true,
      projectType: true,
      clientName: true,
      year: true,
      heroMediaUrl: true,
      heroFallbackUrl: true,
      heroThumbnailUrl: true,
      heroMediaType: true,
      operations: true,
      temporalStatus: true,
      updatedAt: true,
      _count: {
        select: {
          pricing: true,
          offers: true,
          faqs: true
        }
      }
    }
  })

  const formattedAttractions: B2BAttractionItem[] = attractions.map((a: any) => {
    const ops = (a.operations as any) || {}
    const temp = (a.temporalStatus as any) || {}

    // Extract venue name gracefully
    let venue = "N/A"
    if (typeof ops.venueName === "string" && ops.venueName.trim()) {
      venue = ops.venueName.trim()
    } else if (ops.venueName && typeof ops.venueName === "object") {
      venue = ops.venueName.en || ops.venueName.ar || "N/A"
    } else if (typeof ops.venue === "string" && ops.venue.trim()) {
      venue = ops.venue.trim()
    } else if (ops.venue && typeof ops.venue === "object") {
      venue = ops.venue.en || ops.venue.ar || "N/A"
    } else if (typeof ops.location === "string" && ops.location.trim()) {
      venue = ops.location.trim()
    } else if (ops.location && typeof ops.location === "object") {
      venue = ops.location.en || ops.location.ar || "N/A"
    }

    // Extract temporal status
    let statusStr = "ACTIVE"
    if (typeof temp.status === "string" && temp.status.trim()) {
      statusStr = temp.status.trim().toUpperCase()
    } else if (a.isPublished) {
      statusStr = "ACTIVE"
    } else {
      statusStr = "DRAFT"
    }

    // Infer year if null on record
    let extractedYear: number | null = a.year
    if (!extractedYear) {
      const yearMatch = a.nameEn.match(/\b(202\d)\b/)
      if (yearMatch) {
        extractedYear = parseInt(yearMatch[1], 10)
      } else if (a.updatedAt) {
        extractedYear = new Date(a.updatedAt).getFullYear()
      }
    }

    // Infer B2B category if null
    let category = a.b2bCategory
    if (!category) {
      if (a.nameEn.toLowerCase().includes("inflat") || a.nameEn.toLowerCase().includes("park")) {
        category = "Family Entertainment Center (FEC)"
      } else if (a.nameEn.toLowerCase().includes("shows") || a.nameEn.toLowerCase().includes("fest")) {
        category = "Mega Event & Exhibition"
      } else if (a.nameEn.toLowerCase().includes("activation") || a.nameEn.toLowerCase().includes("challenge")) {
        category = "Brand Activation"
      } else {
        category = "Turnkey Project"
      }
    }

    return {
      id: a.id,
      slug: a.slug,
      name: {
        en: a.nameEn || "",
        ar: a.nameAr || ""
      },
      tagline: {
        en: a.taglineEn || "",
        ar: a.taglineAr || ""
      },
      isPublished: Boolean(a.isPublished),
      isFeatured: Boolean(a.isFeatured),
      isB2bVisible: a.isB2bVisible !== false, // default true
      b2bCategory: category,
      projectType: a.projectType || "Turnkey Experience",
      clientName: a.clientName || null,
      year: extractedYear,
      venue,
      temporalStatus: statusStr,
      updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
      heroMediaUrl: a.heroMediaUrl,
      heroFallbackUrl: a.heroFallbackUrl,
      heroThumbnailUrl: a.heroThumbnailUrl,
      heroMediaType: a.heroMediaType,
      _count: a._count || { pricing: 0, offers: 0, faqs: 0 }
    }
  })

  return <B2BAttractionsList initialAttractions={formattedAttractions} />
}
