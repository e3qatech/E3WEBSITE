import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { getPublicCaseStudies } from "@/lib/case-studies"

const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT_ADMIN",
  "SALES_ADMIN",
  "CONTENT_MANAGER",
  "EDITOR",
  "STAFF",
  "OPERATIONS",
  "MARKETING",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestAll = searchParams.get("all") === "true"

    if (requestAll) {
      const session = await auth()
      const role = (session?.user as any)?.role
      const isStaff = session?.user && ALLOWED_ROLES.includes(role)
      
      if (isStaff) {
        const caseStudies = await db.caseStudy.findMany({
          orderBy: { year: 'desc' }
        })
        return NextResponse.json({ success: true, caseStudies })
      }
    }

    // Public / default callers always receive strictly eligible published case studies (QF-05)
    const caseStudies = await getPublicCaseStudies()
    return NextResponse.json({ success: true, caseStudies })
  } catch (error: any) {
    console.error("[CASES_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      slug, titleEn, titleAr, clientName, year, category,
      heroMediaType, heroImageUrl,
      thumbnailMediaType, thumbnailUrl,
      clientLogoUrl,
      challengeEn, challengeAr, solutionEn, solutionAr, resultEn, resultAr,
      isFeatured, isPublished,
      attractionId, technicalSpecs, servicesUsed, metrics, gallery, testimonials,
      beforeAfter, seo
    } = body

    if (!slug || !titleEn || !titleAr) {
      return NextResponse.json({ error: "Missing required fields (slug, titleEn, titleAr)" }, { status: 400 })
    }

    const existing = await db.caseStudy.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Case study with this slug already exists" }, { status: 400 })
    }

    const caseStudy = await db.caseStudy.create({
      data: {
        slug: slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        titleEn: titleEn.trim(),
        titleAr: titleAr.trim(),
        clientName: clientName || "E3 Experiences Qatar",
        year: year ? parseInt(year) : new Date().getFullYear(),
        category: category || "Entertainment",
        heroMediaType: heroMediaType || "IMAGE",
        heroImageUrl: heroImageUrl || null,
        thumbnailMediaType: thumbnailMediaType || "IMAGE",
        thumbnailUrl: thumbnailUrl || heroImageUrl || null,
        clientLogoUrl: clientLogoUrl || null,
        challengeEn: challengeEn || null,
        challengeAr: challengeAr || null,
        solutionEn: solutionEn || null,
        solutionAr: solutionAr || null,
        resultEn: resultEn || null,
        resultAr: resultAr || null,
        isFeatured: Boolean(isFeatured),
        isPublished: Boolean(isPublished),
        attractionId: attractionId || null,
        technicalSpecs: technicalSpecs || {},
        servicesUsed: servicesUsed || [],
        beforeAfter: beforeAfter || null,
        metrics: metrics || [],
        gallery: gallery || [],
        testimonials: testimonials || [],
        seo: seo || {}
      }
    })

    return NextResponse.json({ success: true, caseStudy })
  } catch (error: any) {
    console.error("[CASES_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
