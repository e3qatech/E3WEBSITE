import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import {
  getCanonicalService,
  getAllCanonicalServices,
  CanonicalService
} from "@/lib/services/canonical-services";
import { ServiceMicrositeClient } from "@/components/b2b/services/ServiceMicrositeClient";
import { getPublicCaseStudies } from "@/lib/case-studies";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const isAr = locale === "ar";

  const canonical = getCanonicalService(slug);

  let dbService: any = null;
  try {
    dbService = await db.service.findUnique({
      where: { slug }
    });
  } catch (e) {
    console.error("Error fetching db service metadata:", e);
  }

  if (!canonical && !dbService) {
    return { title: isAr ? "الخدمة غير موجودة" : "Service Not Found" };
  }

  const title = isAr
    ? dbService?.titleAr || canonical?.titleAr || "الخدمات — إي ثري لقطاع الأعمال"
    : dbService?.titleEn || canonical?.titleEn || "Services — E3 Enterprise Atelier";

  const description = isAr
    ? dbService?.taglineAr || canonical?.taglineAr || "خدمات وحلول متكاملة لقطاع الفعاليات والترفيه في قطر."
    : dbService?.taglineEn || canonical?.taglineEn || "Turnkey entertainment, event engineering, operations, and spatial solutions in Qatar.";

  const heroImage = dbService?.heroMediaUrl || dbService?.thumbnail || canonical?.heroMediaUrl;

  return {
    title: `${title} | E3 Qatar`,
    description,
    openGraph: {
      title,
      description,
      images: heroImage ? [{ url: heroImage }] : [],
    },
    alternates: {
      canonical: `https://e3.qa/${locale}/b2b/services/${canonical?.slug || slug}`
    }
  };
}

export default async function ServiceMicrositePage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const canonical = getCanonicalService(slug);

  let dbService: any = null;
  let allCaseStudies: any[] = [];

  try {
    const results = await Promise.all([
      db.service.findUnique({
        where: { slug },
        include: {
          projects: { include: { attraction: true } },
          gallery: { orderBy: { orderIndex: "asc" } }
        }
      }).catch(() => null),
      getPublicCaseStudies({ featuredFirst: true }).catch(() => [])
    ]);
    dbService = results[0];
    allCaseStudies = results[1] || [];
  } catch (error) {
    console.error("Error fetching service detail data:", error);
  }

  // If service does not exist in canonical taxonomy and does not exist in DB, 404
  if (!canonical && !dbService) {
    notFound();
  }

  // If DB service exists but is marked explicitly hidden and there is no canonical mapping
  if (dbService && dbService.isVisible === false && !canonical) {
    notFound();
  }

  // Use canonical service or adapt DB service into canonical structure
  const activeService: CanonicalService = canonical || {
    id: dbService.id,
    slug: dbService.slug,
    aliases: [],
    titleEn: dbService.titleEn,
    titleAr: dbService.titleAr || dbService.titleEn,
    categoryEn: dbService.category || "Enterprise Service",
    categoryAr: dbService.category || "خدمات قطاع الأعمال",
    taglineEn: dbService.taglineEn || "",
    taglineAr: dbService.taglineAr || "",
    heroOutcomeEn: dbService.taglineEn || dbService.titleEn,
    heroOutcomeAr: dbService.taglineAr || dbService.titleAr,
    supportingStatementEn: dbService.contentEn || "",
    supportingStatementAr: dbService.contentAr || "",
    heroMediaUrl: dbService.heroMediaUrl || dbService.thumbnail || "",
    heroMediaType: (dbService.heroMediaType as any) || "IMAGE",
    verifiedProofPoints: [],
    wowHow: [],
    objectives: [],
    capabilities: [],
    engagementModels: [],
    deliverables: [],
    lifecycleStages: [],
    serviceSpecificModule: {
      type: "scale-explorer",
      titleEn: "Scope & Specifications",
      titleAr: "المواصفات ونطاق العمل",
      subtitleEn: "Production overview",
      subtitleAr: "نظرة عامة على التنفيذ",
      data: {}
    },
    enterpriseReadiness: [],
    relatedServiceSlugs: []
  };

  // Filter relevant case studies (match by tag or take top featured case studies)
  const relatedCases = allCaseStudies.slice(0, 3);

  return (
    <ServiceMicrositeClient
      service={activeService}
      locale={locale}
      relatedCaseStudies={relatedCases}
      dbOverrides={dbService}
    />
  );
}
