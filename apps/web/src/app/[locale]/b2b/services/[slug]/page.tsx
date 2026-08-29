import React from "react";
import { notFound, redirect } from "next/navigation";
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

  return {
    title: `${title} | E3 Qatar`,
    description,
    openGraph: {
      title,
      description,
      images: heroImage ? [{ url: heroImage }] : [],
    },
    alternates: {
      canonical: `https://eeeqa.com/${locale}/b2b/services/${canonical?.slug || slug}`
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

  // If alias route requested (e.g. /fec or /audio-visual-stage), redirect to canonical primary route
  if (canonical && canonical.slug !== slug.toLowerCase().trim()) {
    redirect(`/${locale}/b2b/services/${canonical.slug}`);
  }

  const searchSlugs = canonical ? [canonical.slug, ...canonical.aliases] : [slug];

  let dbService: any = null;
  let allCaseStudies: any[] = [];

  try {
    const results = await Promise.all([
      db.service.findFirst({
        where: { slug: { in: searchSlugs } },
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

  // Authoritative Database Safety Gate:
  // If the service record does not exist in the database or is explicitly hidden, return 404
  if (!dbService || dbService.isVisible === false) {
    notFound();
  }

  // Use typed compatibility adapter to safely bind authoritative DB data with presentation contracts
  const activeService: CanonicalService = adaptDbServiceToPresentation(dbService);

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
    />
  );
}
