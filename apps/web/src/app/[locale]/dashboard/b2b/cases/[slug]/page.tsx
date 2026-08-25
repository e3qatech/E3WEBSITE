import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CaseEditor } from "@/components/dashboard/b2b/CaseEditor"
import { CANONICAL_CASE_STUDIES_FALLBACKS } from "@/lib/case-studies"

export const metadata = {
  title: "Case Study Editor | E3 Admin",
}

export const dynamic = "force-dynamic"

export default async function EditCasePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { slug } = await params
  
  let attractions: any[] = []
  let teamMembersDb: any[] = []

  try {
    const [attractionsRes, teamMembersRes] = await Promise.all([
      db.attraction.findMany({
        select: { id: true, nameEn: true, slug: true },
        orderBy: { nameEn: 'asc' }
      }).catch(() => []),
      db.employeeProfile.findMany({
        select: { id: true, firstName: true, lastName: true, designation: true },
        orderBy: { firstName: 'asc' }
      }).catch(() => [])
    ])
    attractions = attractionsRes || []
    teamMembersDb = teamMembersRes || []
  } catch (err) {
    console.warn("[EDIT_CASE_PAGE_INIT_ERROR]", err)
  }

  if (slug === "new") {
    return <CaseEditor attractions={attractions} teamMembers={teamMembersDb} />
  }

  // Multi-tier defensive case study resolution
  let caseStudy: any = null

  try {
    // 1. Direct slug match
    caseStudy = await db.caseStudy.findUnique({
      where: { slug },
      include: { teamMembers: true }
    })
  } catch (_e) {
    console.warn("[EDIT_CASE_DIRECT_FIND_ERROR] fallback to flexible resolution")
  }

  // 2. ID match (if slug is a CUID/ID)
  if (!caseStudy) {
    try {
      caseStudy = await db.caseStudy.findUnique({
        where: { id: slug },
        include: { teamMembers: true }
      })
    } catch (_e) {}
  }

  // 3. Normalized / alternative prefix match
  if (!caseStudy) {
    try {
      const cleanSlug = slug.toLowerCase().trim()
      const altSlug = cleanSlug.startsWith("case-") ? cleanSlug.replace(/^case-/, "") : `case-${cleanSlug}`
      caseStudy = await db.caseStudy.findFirst({
        where: {
          OR: [
            { slug: cleanSlug },
            { slug: altSlug },
            { slug: { contains: cleanSlug, mode: "insensitive" } }
          ]
        },
        include: { teamMembers: true }
      })
    } catch (_e) {}
  }

  // 4. Linked attraction slug/id match (e.g. urban-arena-doha-mall -> attraction -> case study)
  if (!caseStudy) {
    try {
      const linkedAttraction = attractions.find(
        (a: any) =>
          a.slug === slug ||
          a.id === slug ||
          slug.includes(a.slug || "---") ||
          (a.slug && slug.replace(/^case-/, "").includes(a.slug))
      )
      if (linkedAttraction) {
        caseStudy = await db.caseStudy.findFirst({
          where: { attractionId: linkedAttraction.id },
          include: { teamMembers: true }
        })
      }
    } catch (_e) {}
  }

  // 5. Raw SQL fallback if Prisma throws schema mismatch
  if (!caseStudy) {
    try {
      const rawRows: any[] = await (db as any).$queryRawUnsafe(
        `SELECT * FROM "CaseStudy" WHERE "slug" = $1 OR "id" = $1 OR "slug" LIKE $2 LIMIT 1`,
        slug,
        `%${slug}%`
      ).catch(() => [])
      if (rawRows && rawRows.length > 0) {
        caseStudy = rawRows[0]
      }
    } catch (_e) {}
  }

  // If still not found, construct a graceful placeholder or default case study
  if (!caseStudy) {
    const fallback = CANONICAL_CASE_STUDIES_FALLBACKS[slug] ||
      CANONICAL_CASE_STUDIES_FALLBACKS[`case-${slug}`] ||
      CANONICAL_CASE_STUDIES_FALLBACKS["case-urban-arena"] || {}

    const titleSlug = slug
      .split("-")
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ")

    const formattedData = {
      id: "",
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      titleEn: fallback.titleEn || titleSlug || "New Case Study",
      titleAr: fallback.titleAr || titleSlug || "دراسة حالة جديدة",
      clientName: fallback.clientName || "E3 Client",
      category: fallback.category || "Corporate",
      year: fallback.year || new Date().getFullYear(),
      challengeEn: fallback.challengeEn || "",
      challengeAr: fallback.challengeAr || "",
      solutionEn: fallback.solutionEn || "",
      solutionAr: fallback.solutionAr || "",
      resultEn: fallback.resultEn || "",
      resultAr: fallback.resultAr || "",
      heroMediaType: fallback.heroMediaType || "IMAGE",
      heroImageUrl: fallback.heroImageUrl || "",
      thumbnailMediaType: fallback.thumbnailMediaType || "IMAGE",
      thumbnailUrl: fallback.thumbnailUrl || "",
      clientLogoUrl: fallback.clientLogoUrl || "",
      isPublished: fallback.isPublished ?? true,
      isFeatured: fallback.isFeatured ?? false,
      attractionId: fallback.attractionId || "",
      metrics: Array.isArray(fallback.metrics) ? fallback.metrics : [],
      testimonials: Array.isArray(fallback.testimonials) ? fallback.testimonials : [],
      gallery: Array.isArray(fallback.gallery) ? fallback.gallery : [],
      technicalSpecs: Array.isArray(fallback.technicalSpecs) ? fallback.technicalSpecs : [],
      servicesUsed: Array.isArray(fallback.servicesUsed) ? fallback.servicesUsed : [],
      teamMembers: [],
      seo: fallback.seo || {}
    }

    return <CaseEditor initialData={formattedData} attractions={attractions} teamMembers={teamMembersDb} />
  }

  const fallback = CANONICAL_CASE_STUDIES_FALLBACKS[caseStudy.slug] || {}

  // Defensive array normalizer for metrics (handles object dictionary vs array)
  let rawMetrics: any[] = []
  if (Array.isArray(caseStudy.metrics)) {
    rawMetrics = caseStudy.metrics
  } else if (typeof caseStudy.metrics === "object" && caseStudy.metrics !== null) {
    rawMetrics = Object.entries(caseStudy.metrics).map(([key, val]) => ({
      labelEn: key.charAt(0).toUpperCase() + key.slice(1),
      valueEn: String(val),
      labelAr: key,
      valueAr: String(val)
    }))
  } else if (Array.isArray(fallback.metrics)) {
    rawMetrics = fallback.metrics
  }

  const normalizedMetrics = rawMetrics.map((m: any) => ({
    labelEn: m?.labelEn || m?.label || "",
    valueEn: m?.valueEn || m?.value || "",
    labelAr: m?.labelAr || "",
    valueAr: m?.valueAr || ""
  }))

  // Defensive normalizer for testimonials
  let rawTestimonials: any[] = []
  if (Array.isArray(caseStudy.testimonials)) {
    rawTestimonials = caseStudy.testimonials
  } else if (typeof caseStudy.testimonials === "object" && caseStudy.testimonials !== null) {
    rawTestimonials = Object.entries(caseStudy.testimonials).map(([author, quote]) => ({
      authorName: author,
      quoteEn: String(quote),
      quoteAr: "",
      isVisible: true
    }))
  } else if (Array.isArray(fallback.testimonials)) {
    rawTestimonials = fallback.testimonials
  }

  const normalizedTestimonials = rawTestimonials.map((t: any) => ({
    authorName: t?.authorName || t?.author || "",
    quoteEn: t?.quoteEn || t?.quote || "",
    quoteAr: t?.quoteAr || "",
    isVisible: t?.isVisible !== false
  }))

  // Defensive normalizer for gallery
  let rawGallery: any[] = []
  if (Array.isArray(caseStudy.gallery)) {
    rawGallery = caseStudy.gallery
  } else if (Array.isArray(fallback.gallery)) {
    rawGallery = fallback.gallery
  }

  const normalizedGallery = rawGallery.map((g: any) => ({
    url: typeof g === "string" ? g : (g?.url || ""),
    captionEn: g?.captionEn || g?.caption || "",
    captionAr: g?.captionAr || ""
  }))

  // Defensive normalizer for team members
  const teamMembers = Array.isArray(caseStudy.teamMembers)
    ? caseStudy.teamMembers.map((tm: any) => ({
        employeeProfileId: tm?.employeeProfileId || "",
        roleEn: tm?.roleEn || "",
        roleAr: tm?.roleAr || ""
      }))
    : []

  const formattedData = {
    id: caseStudy.id,
    slug: caseStudy.slug,
    titleEn: caseStudy.titleEn || fallback.titleEn || "",
    titleAr: caseStudy.titleAr || fallback.titleAr || "",
    clientName: caseStudy.clientName || fallback.clientName || "",
    category: caseStudy.category || fallback.category || "Corporate",
    year: caseStudy.year || fallback.year || 2024,
    challengeEn: caseStudy.challengeEn || fallback.challengeEn || "",
    challengeAr: caseStudy.challengeAr || fallback.challengeAr || "",
    solutionEn: caseStudy.solutionEn || fallback.solutionEn || "",
    solutionAr: caseStudy.solutionAr || fallback.solutionAr || "",
    resultEn: caseStudy.resultEn || fallback.resultEn || "",
    resultAr: caseStudy.resultAr || fallback.resultAr || "",
    heroMediaType: caseStudy.heroMediaType || fallback.heroMediaType || "IMAGE",
    heroImageUrl: caseStudy.heroImageUrl || fallback.heroImageUrl || "",
    thumbnailMediaType: caseStudy.thumbnailMediaType || fallback.thumbnailMediaType || "IMAGE",
    thumbnailUrl: caseStudy.thumbnailUrl || fallback.thumbnailUrl || "",
    clientLogoUrl: caseStudy.clientLogoUrl || fallback.clientLogoUrl || "",
    isPublished: caseStudy.isPublished ?? fallback.isPublished ?? true,
    isFeatured: caseStudy.isFeatured ?? fallback.isFeatured ?? false,
    attractionId: caseStudy.attractionId || fallback.attractionId || "",
    metrics: normalizedMetrics,
    testimonials: normalizedTestimonials,
    gallery: normalizedGallery,
    technicalSpecs: Array.isArray(caseStudy.technicalSpecs) ? caseStudy.technicalSpecs : [],
    servicesUsed: Array.isArray(caseStudy.servicesUsed) ? caseStudy.servicesUsed : [],
    teamMembers,
    seo: caseStudy.seo || fallback.seo || {}
  }

  return <CaseEditor initialData={formattedData} attractions={attractions} teamMembers={teamMembersDb} />
}
