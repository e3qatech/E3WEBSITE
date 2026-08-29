import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import {
  resolveCanonicalSlug,
  isCanonicalSlug,
  getCanonicalService,
  ServiceCmsPayload,
} from "@/lib/services/canonical-services";
import { ServiceMicrositeClient } from "@/components/b2b/services/ServiceMicrositeClient";
import { getPublicCaseStudies, isCaseStudyEligible } from "@/lib/case-studies";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const isAr = locale === "ar";

  const targetSlug = resolveCanonicalSlug(slug) || slug;

  let dbService: any = null;
  try {
    dbService = await db.service.findUnique({
      where: { slug: targetSlug }
    });
  } catch (e) {
    console.error("Error fetching db service metadata:", e);
  }

  if (!dbService && isCanonicalSlug(targetSlug)) {
    dbService = getCanonicalService(targetSlug);
  }

  if (!dbService) {
    return { title: isAr ? "الخدمة غير موجودة" : "Service Not Found" };
  }

  const title = isAr
    ? dbService.titleAr || dbService.titleEn || "الخدمات — إي ثري لقطاع الأعمال"
    : dbService.titleEn || "Services — E3 Enterprise Atelier";

  const description = isAr
    ? dbService.taglineAr || "خدمات وحلول متكاملة لقطاع الفعاليات والترفيه في قطر."
    : dbService.taglineEn || "Turnkey entertainment, event engineering, operations, and spatial solutions in Qatar.";

  const heroImage = dbService.heroMediaUrl || dbService.thumbnail;

  return {
    title: `${title} | E3 Qatar`,
    description,
    openGraph: {
      title,
      description,
      images: heroImage ? [{ url: heroImage }] : [],
    },
    alternates: {
      canonical: `https://e3.qa/${locale}/b2b/services/${dbService.slug}`
    }
  };
}

export default async function ServiceMicrositePage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // Handle permanent legacy redirects
  const canonicalSlug = resolveCanonicalSlug(slug);
  if (canonicalSlug && canonicalSlug !== slug) {
    redirect(`/${locale}/b2b/services/${canonicalSlug}`);
  }

  const targetSlug = canonicalSlug || slug;

  let dbService: any = null;
  let allCaseStudies: any[] = [];

  try {
    const results = await Promise.all([
      db.service.findUnique({
        where: { slug: targetSlug },
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

  if (!dbService && isCanonicalSlug(targetSlug)) {
    dbService = getCanonicalService(targetSlug);
  }

  if (!dbService || dbService.isVisible === false || dbService.isPublished === false) {
    notFound();
  }

  // Parse structured CMS payload from database `process` field
  const cms: ServiceCmsPayload = (() => {
    try {
      if (typeof dbService.process === "object" && dbService.process !== null) {
        return dbService.process;
      } else if (typeof dbService.process === "string") {
        return JSON.parse(dbService.process);
      }
    } catch (_e) {}
    return {};
  })();

  // Filter curated or eligible case studies
  let relatedCases: any[] = [];
  const eligibleCases = (allCaseStudies || []).filter(isCaseStudyEligible);

  if (cms.caseStudySelectionMode === "MANUAL" && Array.isArray(cms.selectedCaseStudyIds) && cms.selectedCaseStudyIds.length > 0) {
    relatedCases = cms.selectedCaseStudyIds
      .map((id) => eligibleCases.find((cs) => cs.id === id))
      .filter(Boolean);
  } else {
    // Automatic mode: take top 3 eligible case studies
    relatedCases = eligibleCases.slice(0, 3);
  }

  // Fetch related services strictly from database
  let relatedDbServices: any[] = [];
  if (cms.relatedServiceSlugs && cms.relatedServiceSlugs.length > 0) {
    try {
      relatedDbServices = await db.service.findMany({
        where: {
          slug: { in: cms.relatedServiceSlugs },
          isVisible: true,
        },
        select: {
          id: true,
          slug: true,
          titleEn: true,
          titleAr: true,
          category: true,
          taglineEn: true,
          taglineAr: true,
          thumbnail: true,
          heroMediaUrl: true,
        }
      });
    } catch (e) {
      console.error("Error fetching related services:", e);
    }
  }

  return (
    <ServiceMicrositeClient
      serviceRecord={dbService}
      cmsPayload={cms}
      locale={locale}
      relatedCaseStudies={relatedCases}
      relatedServices={relatedDbServices}
    />
  );
}
