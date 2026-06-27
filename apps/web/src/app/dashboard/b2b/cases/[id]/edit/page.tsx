import { db } from "@/lib/db"
import { CaseEditor } from "@/components/dashboard/b2b/CaseEditor"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"

interface EditProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: "Edit Case Study | E3 Admin",
}

export default async function EditCasePage({ params }: EditProps) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { id } = await params
  const caseStudy = await db.caseStudy.findUnique({
    where: { id }
  })

  if (!caseStudy) {
    notFound()
  }

  // Parse JSON fields safely for Editor UI
  const beforeAfter = caseStudy.beforeAfter as any
  const testimonial = caseStudy.testimonial as any
  const metrics = (caseStudy.metrics as any[]) || []

  const formattedData = {
    id: caseStudy.id,
    slug: caseStudy.slug,
    title: {
      en: caseStudy.titleEn || "",
      ar: caseStudy.titleAr || ""
    },
    clientName: caseStudy.clientName,
    category: [caseStudy.category],
    year: caseStudy.year,
    challenge: {
      en: caseStudy.challengeEn || "",
      ar: caseStudy.challengeAr || ""
    },
    solution: {
      en: caseStudy.solutionEn || "",
      ar: caseStudy.solutionAr || ""
    },
    results: {
      en: "", // schema doesn't have resultsEn, it has results as Json or flat fields, but we map challenge/solution/results as text
      ar: ""
    },
    testimonial: {
      quoteEn: testimonial?.quote || "",
      quoteAr: testimonial?.quoteAr || "",
      author: testimonial?.authorName || ""
    },
    isPublished: caseStudy.isPublished,
    isFeatured: caseStudy.isFeatured,
    telemetry: metrics.map((m: any) => ({
      labelEn: m.label || "",
      valueEn: m.value || "",
      labelAr: m.labelAr || "",
      valueAr: m.valueAr || ""
    })),
    beforeImage: beforeAfter?.beforeUrl || "",
    afterImage: beforeAfter?.afterUrl || ""
  }

  return <CaseEditor initialData={formattedData} />
}
