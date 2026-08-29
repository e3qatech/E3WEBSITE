import React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import {
  getCanonicalService,
  CanonicalService
} from "@/lib/services/canonical-services";
import { ServiceMicrositeClient } from "@/components/b2b/services/ServiceMicrositeClient";
import { getPublicCaseStudies } from "@/lib/case-studies";
import { adaptDbServiceToPresentation } from "@/lib/services/service-adapters";

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
  const searchSlugs = canonical ? [canonical.slug, ...canonical.aliases] : [slug];

  let dbService: any = null;
  try {
    dbService = await db.service.findFirst({
      where: { slug: { in: searchSlugs } }
    });
  } catch (e) {
    console.error("Error fetching db service metadata:", e);
  }

  if (!dbService || dbService.isVisible === false) {
    return { title: isAr ? "الخدمة غير موجودة" : "Service Not Found" };
  }

  const title = isAr
    ? dbService.titleAr || "الخدمات — إي ثري لقطاع الأعمال"
    : dbService.titleEn || "Services — E3 Enterprise Atelier";

  const description = isAr
    ? dbService.taglineAr || "خدمات وحلول متكاملة لقطاع الفعاليات والترفيه في قطر."
    : dbService.taglineEn || "Turnkey entertainment, event engineering, operations, and spatial solutions in Qatar.";

  const heroImage = dbService?.heroMediaUrl || dbService?.thumbnail || canonical?.heroMediaUrl;
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://eeeqa.com").replace(/\/$/, "");
  const canonicalSlug = canonical?.slug || slug;
  const canonicalPath = `/b2b/services/${canonicalSlug}`;
  const ogUrl = `${siteUrl}/${locale}${canonicalPath}`;

  return {
    title: `${title} | E3 Qatar`,
    description,
    openGraph: {
      title,
      description,
      url: ogUrl,
      images: heroImage ? [{ url: heroImage }] : [],
    },
    alternates: {
      canonical: `${siteUrl}/${locale}${canonicalPath}`,
      languages: {
        en: `${siteUrl}/en${canonicalPath}`,
        ar: `${siteUrl}/ar${canonicalPath}`,
        "x-default": `${siteUrl}/en${canonicalPath}`,
      },
    },
  };
}

export default async function ServiceMicrositePage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const canonical = getCanonicalService(slug);

  // If alias route requested (e.g. /fec or /audio-visual-stage), permanent redirect (308) to canonical primary route
  if (canonical && canonical.slug !== slug.toLowerCase().trim()) {
    permanentRedirect(`/${locale}/b2b/services/${canonical.slug}`);
  }

  const searchSlugs = canonical ? [canonical.slug, ...canonical.aliases] : [slug];

  let dbService: any = null;
  let allCaseStudies: any[] = [];
  let allPublishedServices: any[] = [];

  try {
    const results = await Promise.all([
      db.service.findFirst({
        where: { slug: { in: searchSlugs } },
        include: {
          projects: { include: { attraction: true } },
          gallery: { orderBy: { orderIndex: "asc" } }
        }
      }).catch(() => null),
      getPublicCaseStudies({ featuredFirst: true }).catch(() => []),
      db.service.findMany({
        where: { isVisible: true },
        select: { slug: true }
      }).catch(() => [])
    ]);
    dbService = results[0];
    allCaseStudies = results[1] || [];
    allPublishedServices = results[2] || [];
  } catch (error) {
    console.error("Error fetching service detail data:", error);
  }

  // Authoritative Database Safety Gate:
  // If the service record does not exist in the database or is explicitly hidden, return 404
  if (!dbService || dbService.isVisible === false) {
    notFound();
  }

  // Use typed compatibility adapter to safely bind authoritative DB data with presentation contracts
  const activeService: CanonicalService = adaptDbServiceToPresentation(dbService);

  // Map published services for related dropdowns & project brief
  const publishedMap = new Map<string, CanonicalService>();
  (allPublishedServices || []).forEach((s: any) => {
    const canon = getCanonicalService(s.slug);
    if (canon && canon.slug !== "attraction-operations") {
      publishedMap.set(canon.slug, canon);
    }
  });
  const availableServices = Array.from(publishedMap.values());

  // Filter relevant case studies (take configured case studies or top 3)
  let relatedCases = allCaseStudies.slice(0, 3);
  if (activeService.relatedCaseStudySlugs && activeService.relatedCaseStudySlugs.length > 0) {
    const customCases = allCaseStudies.filter((cs: any) =>
      activeService.relatedCaseStudySlugs?.includes(cs.slug) || activeService.relatedCaseStudySlugs?.includes(cs.id)
    );
    if (customCases.length > 0) {
      relatedCases = customCases;
    }
  }

  return (
    <ServiceMicrositeClient
      service={activeService}
      locale={locale}
      relatedCaseStudies={relatedCases}
      dbOverrides={dbService}
      availableServices={availableServices}
    />
  );
}
