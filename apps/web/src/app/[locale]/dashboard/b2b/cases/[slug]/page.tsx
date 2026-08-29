import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CaseEditor } from "@/components/dashboard/b2b/CaseEditor"

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

  // If still not found, construct a clean blank case study object
  if (!caseStudy) {
    const titleSlug = slug === "new" ? "" : slug
      .split("-")
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ")

    const formattedData = {
      id: "",
      slug: slug === "new" ? "" : slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      titleEn: titleSlug || "",
      titleAr: "",
      clientName: "",
      category: "",
      year: new Date().getFullYear(),
      challengeEn: "",
      challengeAr: "",
      solutionEn: "",
      solutionAr: "",
      resultEn: "",
      resultAr: "",
      heroMediaType: "IMAGE",
      heroImageUrl: "",
      thumbnailMediaType: "IMAGE",
      thumbnailUrl: "",
      clientLogoUrl: "",
      isPublished: true,
      isFeatured: false,
      attractionId: "",
      metrics: [],
      testimonials: [],
      gallery: [],
      technicalSpecs: {},
      servicesUsed: [],
      beforeAfter: null,
      teamMembers: [],
      seo: {}
    }

    return <CaseEditor initialData={formattedData} attractions={attractions} teamMembers={teamMembersDb} />
  }

  // Defensive array normalizer for metrics (handles object dictionary vs array)
  let rawMetrics: any[] = []
  if (typeof caseStudy.metrics === "string") {
    try {
      rawMetrics = JSON.parse(caseStudy.metrics);
    } catch {
      rawMetrics = [];
    }
  } else if (Array.isArray(caseStudy.metrics)) {
    rawMetrics = caseStudy.metrics
  } else if (typeof caseStudy.metrics === "object" && caseStudy.metrics !== null) {
    rawMetrics = Object.entries(caseStudy.metrics).map(([key, val]) => ({
      labelEn: key.charAt(0).toUpperCase() + key.slice(1),
      valueEn: String(val),
      labelAr: key,
      valueAr: String(val)
    }))
  }

  const normalizedMetrics = rawMetrics.map((m: any) => ({
    id: m?.id || undefined,
    prefix: m?.prefix || "",
    valueEn: m?.valueEn || m?.value || m?.val || "",
    valueAr: m?.valueAr || m?.value || m?.val || "",
    suffix: m?.suffix || "",
    labelEn: m?.labelEn || m?.label || "",
    labelAr: m?.labelAr || m?.label || "",
    sourceEn: m?.sourceEn || m?.source || "",
    sourceAr: m?.sourceAr || m?.source || "",
    isHighlighted: Boolean(m?.isHighlighted),
  }))

  // Defensive normalizer for testimonials
  let rawTestimonials: any[] = []
  if (typeof caseStudy.testimonials === "string") {
    try {
      rawTestimonials = JSON.parse(caseStudy.testimonials);
    } catch {
      rawTestimonials = [];
    }
  } else if (Array.isArray(caseStudy.testimonials)) {
    rawTestimonials = caseStudy.testimonials
  } else if (typeof caseStudy.testimonials === "object" && caseStudy.testimonials !== null) {
    rawTestimonials = Object.entries(caseStudy.testimonials).map(([author, quote]) => ({
      authorName: author,
      quoteEn: String(quote),
      quoteAr: "",
      isVisible: true
    }))
  }

  const normalizedTestimonials = rawTestimonials.map((t: any) => ({
    authorName: t?.authorName || t?.author || t?.name || "",
    quoteEn: t?.quoteEn || t?.quote || "",
    quoteAr: t?.quoteAr || "",
    authorEn: t?.authorEn || t?.authorName || t?.author || "",
    authorAr: t?.authorAr || "",
    roleEn: t?.roleEn || t?.role || "",
    roleAr: t?.roleAr || "",
    companyEn: t?.companyEn || t?.company || "",
    companyAr: t?.companyAr || "",
    avatarUrl: t?.avatarUrl || "",
    companyLogoUrl: t?.companyLogoUrl || "",
    isVisible: t?.isVisible !== false
  }))

  // Defensive normalizer for gallery
  let rawGallery: any[] = []
  if (typeof caseStudy.gallery === "string") {
    try {
      rawGallery = JSON.parse(caseStudy.gallery);
    } catch {
      rawGallery = [];
    }
  } else if (Array.isArray(caseStudy.gallery)) {
    rawGallery = caseStudy.gallery
  }

  const normalizedGallery = rawGallery.map((g: any) => ({
    url: typeof g === "string" ? g : (g?.url || g?.mediaUrl || g?.imageUrl || ""),
    captionEn: g?.captionEn || g?.caption || g?.titleEn || "",
    captionAr: g?.captionAr || g?.titleAr || "",
    mediaType: g?.mediaType || "IMAGE",
  }))

  // Defensive normalizer for team members
  const teamMembers = Array.isArray(caseStudy.teamMembers)
    ? caseStudy.teamMembers.map((tm: any) => ({
        employeeProfileId: tm?.employeeProfileId || "",
        roleEn: tm?.roleEn || "",
        roleAr: tm?.roleAr || ""
      }))
    : []

  // Defensive normalizer for technicalSpecs
  let rawTechnicalSpecs: any = caseStudy.technicalSpecs;
  if (typeof rawTechnicalSpecs === "string") {
    try {
      rawTechnicalSpecs = JSON.parse(rawTechnicalSpecs);
    } catch {
      rawTechnicalSpecs = {};
    }
  }
  if (!rawTechnicalSpecs || typeof rawTechnicalSpecs !== "object") {
    rawTechnicalSpecs = {};
  }

  // Defensive normalizer for servicesUsed
  let rawServicesUsed: any = caseStudy.servicesUsed;
  if (typeof rawServicesUsed === "string") {
    try {
      rawServicesUsed = JSON.parse(rawServicesUsed);
    } catch {
      rawServicesUsed = rawServicesUsed.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }
  const normalizedServicesUsed = Array.isArray(rawServicesUsed) ? rawServicesUsed : [];

  // Defensive normalizer for beforeAfter
  let rawBeforeAfter: any = caseStudy.beforeAfter;
  if (typeof rawBeforeAfter === "string") {
    try {
      rawBeforeAfter = JSON.parse(rawBeforeAfter);
    } catch {
      rawBeforeAfter = null;
    }
  }

  const formattedData = {
    id: caseStudy.id,
    slug: caseStudy.slug,
    titleEn: caseStudy.titleEn || "",
    titleAr: caseStudy.titleAr || "",
    clientName: caseStudy.clientName || "",
    category: caseStudy.category || "Corporate",
    year: caseStudy.year || new Date().getFullYear(),
    challengeEn: caseStudy.challengeEn || "",
    challengeAr: caseStudy.challengeAr || "",
    solutionEn: caseStudy.solutionEn || "",
    solutionAr: caseStudy.solutionAr || "",
    resultEn: caseStudy.resultEn || "",
    resultAr: caseStudy.resultAr || "",
    heroMediaType: caseStudy.heroMediaType || "IMAGE",
    heroImageUrl: caseStudy.heroImageUrl || "",
    thumbnailMediaType: caseStudy.thumbnailMediaType || "IMAGE",
    thumbnailUrl: caseStudy.thumbnailUrl || "",
    clientLogoUrl: caseStudy.clientLogoUrl || "",
    isPublished: caseStudy.isPublished ?? true,
    isFeatured: caseStudy.isFeatured ?? false,
    attractionId: caseStudy.attractionId || "",
    metrics: normalizedMetrics,
    testimonials: normalizedTestimonials,
    gallery: normalizedGallery,
    technicalSpecs: rawTechnicalSpecs,
    servicesUsed: normalizedServicesUsed,
    beforeAfter: rawBeforeAfter,
    teamMembers,
    seo: typeof caseStudy.seo === "string" ? (() => { try { return JSON.parse(caseStudy.seo); } catch { return {}; } })() : (caseStudy.seo || {})
  }

  return <CaseEditor initialData={formattedData} attractions={attractions} teamMembers={teamMembersDb} />
}
