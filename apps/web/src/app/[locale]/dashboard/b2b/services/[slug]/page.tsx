import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ServicesEditor } from "@/components/dashboard/b2b/ServicesEditor";
import { getCanonicalService, getAllCanonicalServices } from "@/lib/services/canonical-services";

export const metadata = {
  title: "Service Editor | E3 Admin",
};

export default async function EditServicePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login");
  }

  const { slug } = await params;
  
  let service = await db.service.findFirst({
    where: {
      OR: [{ slug }, { id: slug }]
    },
    include: {
      projects: true,
      gallery: { orderBy: { orderIndex: 'asc' } }
    }
  });

  const canonical = getCanonicalService(slug);

  if (!service && !canonical) {
    notFound();
  }

  // If service does not exist in DB yet (e.g. newly introduced canonical service discipline),
  // pre-seed initial editor state from canonical definitions so the admin can review and save it directly.
  if (!service && canonical) {
    service = {
      id: "",
      slug: canonical.slug,
      titleEn: canonical.titleEn,
      titleAr: canonical.titleAr,
      taglineEn: canonical.taglineEn,
      taglineAr: canonical.taglineAr,
      category: canonical.categoryEn,
      contentEn: canonical.supportingStatementEn,
      contentAr: canonical.supportingStatementAr,
      heroMediaUrl: canonical.heroMediaUrl || null,
      heroMediaType: canonical.heroMediaType || "IMAGE",
      thumbnail: canonical.heroMediaUrl || null,
      ctaPrimary: canonical.ctaPrimary || "BRIEF_BUILDER",
      ctaSecondary: canonical.ctaSecondary || null,
      isVisible: true,
      isFeatured: false,
      isPublished: true,
      process: {
        heroOutcomeEn: canonical.heroOutcomeEn,
        heroOutcomeAr: canonical.heroOutcomeAr,
        supportingStatementEn: canonical.supportingStatementEn,
        supportingStatementAr: canonical.supportingStatementAr,
        verifiedProofPoints: canonical.verifiedProofPoints,
        wowHow: canonical.wowHow,
        objectives: canonical.objectives,
        capabilities: canonical.capabilities,
        engagementModels: canonical.engagementModels,
        deliverables: canonical.deliverables,
        lifecycleStages: canonical.lifecycleStages,
        serviceSpecificModule: canonical.serviceSpecificModule,
        enterpriseReadiness: canonical.enterpriseReadiness,
        relatedServiceSlugs: canonical.relatedServiceSlugs,
      },
      seo: {
        metaTitleEn: canonical.titleEn,
        metaTitleAr: canonical.titleAr,
        metaDescriptionEn: canonical.taglineEn,
        metaDescriptionAr: canonical.taglineAr,
        canonicalUrl: `https://eeeqa.com/en/b2b/services/${canonical.slug}`,
      },
      gallery: (canonical.galleryItems || []).map((g, i) => ({
        id: g.id || `gallery-${i}`,
        serviceId: "",
        url: g.mediaUrl || g.url || "",
        captionEn: g.captionEn || null,
        captionAr: g.captionAr || null,
        orderIndex: g.orderIndex ?? i,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      projects: [],
      attractionId: null,
      successMetricLabel: null,
      successMetricValue: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
  }

  const [attractions, caseStudies] = await Promise.all([
    db.attraction.findMany({
      select: { id: true, nameEn: true, nameAr: true }
    }),
    db.caseStudy.findMany({
      select: { id: true, slug: true, titleEn: true, titleAr: true, clientName: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const allCanonicalServices = getAllCanonicalServices();

  return (
    <ServicesEditor
      initialData={service}
      attractions={attractions}
      caseStudies={caseStudies}
      canonicalServices={allCanonicalServices}
    />
  );
}
