import React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { getPublicCaseStudyBySlug, getNextPublicCaseStudy } from "@/lib/case-studies";
import { adaptDbCaseStudyToPresentation } from "@/lib/case-studies/case-adapters";
import { CaseDetailClient } from "@/components/b2b/cases/CaseDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const isAr = locale === "ar";

  if (slug === "doha-balloon-parade") {
    permanentRedirect(`/${locale}/b2b/case-studies/doha-balloon-parade-2022`);
  }

  const project = await getPublicCaseStudyBySlug(slug);

  if (!project) {
    return { title: isAr ? "دراسة الحالة غير موجودة" : "Case Study Not Found" };
  }

  const seo = (project.seo as any) || {};

  const title = isAr
    ? seo.metaTitleAr || project.titleAr || project.titleEn
    : seo.metaTitleEn || project.titleEn;

  const description = isAr
    ? seo.metaDescriptionAr || project.challengeAr || project.solutionAr || project.resultAr || ""
    : seo.metaDescriptionEn || project.challengeEn || project.solutionEn || project.resultEn || "";

  const canonicalUrl = `https://e3.qa/${locale}/b2b/case-studies/${slug}`;
  const alternateEn = `https://e3.qa/en/b2b/case-studies/${slug}`;
  const alternateAr = `https://e3.qa/ar/b2b/case-studies/${slug}`;

  const previewImage = project.heroImageUrl || project.thumbnailUrl || "";

  return {
    title: `${title} — E3 Case Study`,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: alternateEn,
        ar: alternateAr,
      },
    },
    openGraph: {
      title: `${title} — E3 Qatar`,
      description,
      url: canonicalUrl,
      images: previewImage ? [{ url: previewImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — E3 Qatar`,
      description,
      images: previewImage ? [previewImage] : [],
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  if (slug === "doha-balloon-parade") {
    permanentRedirect(`/${locale}/b2b/case-studies/doha-balloon-parade-2022`);
  }

  const project = await getPublicCaseStudyBySlug(slug, {
    includeTeam: true,
    includeAttraction: true,
  });

  if (!project) {
    notFound();
  }

  // Fetch next published case study for footer transition (QF-05)
  const nextProject = await getNextPublicCaseStudy(project.id, project.year);

  // Adapt to strict typed presentation model
  const presentation = adaptDbCaseStudyToPresentation(project);

  return (
    <CaseDetailClient
      caseStudy={presentation}
      nextProject={nextProject}
      locale={locale}
    />
  );
}
