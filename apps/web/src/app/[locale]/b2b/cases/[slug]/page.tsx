import React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { getPublicCaseStudyBySlug, getNextPublicCaseStudy } from "@/lib/case-studies";
import { CinematicCaseHero } from "@/components/b2b/cases/CinematicCaseHero";
import { ProjectIdentityBar } from "@/components/b2b/cases/ProjectIdentityBar";
import { TransformationNarrative } from "@/components/b2b/cases/TransformationNarrative";
import { ImpactMetricsGrid } from "@/components/b2b/cases/ImpactMetricsGrid";
import { LinkedAttractionFeature } from "@/components/b2b/cases/LinkedAttractionFeature";
import { ProjectTeamSection } from "@/components/b2b/cases/ProjectTeamSection";
import { CaseTestimonialsSection } from "@/components/b2b/cases/CaseTestimonialsSection";
import { CaseGalleryJourney } from "@/components/b2b/cases/CaseGalleryJourney";
import { NextProjectTransition } from "@/components/b2b/cases/NextProjectTransition";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const isAr = locale === "ar";

  if (slug === "doha-balloon-parade") {
    permanentRedirect(`/${locale}/b2b/cases/doha-balloon-parade-2022`);
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

  const canonicalUrl = `https://e3.qa/${locale}/b2b/cases/${slug}`;
  const alternateEn = `https://e3.qa/en/b2b/cases/${slug}`;
  const alternateAr = `https://e3.qa/ar/b2b/cases/${slug}`;

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

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const isAr = locale === "ar";

  if (slug === "doha-balloon-parade") {
    permanentRedirect(`/${locale}/b2b/cases/doha-balloon-parade-2022`);
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

  const metrics = Array.isArray(project.metrics) ? (project.metrics as any[]) : [];
  const gallery = Array.isArray(project.gallery) ? (project.gallery as any[]) : [];
  const testimonials = Array.isArray(project.testimonials)
    ? (project.testimonials as any[]).filter((t) => t && t.isVisible !== false)
    : [];
  const teamMembers = Array.isArray(project.teamMembers) ? (project.teamMembers as any[]) : [];

  const title = isAr ? project.titleAr || project.titleEn : project.titleEn;
  const challengeText = isAr ? project.challengeAr || project.challengeEn : project.challengeEn;
  const solutionText = isAr ? project.solutionAr || project.solutionEn : project.solutionEn;
  const resultText = isAr
    ? (project as any).resultAr || (project as any).resultEn
    : (project as any).resultEn || (project as any).resultAr;

  const category = isAr ? (project as any).categoryAr || project.category : project.category;

  return (
    <div
      className="flex flex-col w-full bg-[#080b12] min-h-screen text-slate-100 font-sans selection:bg-cyan-500 selection:text-black"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. Cinematic Hero */}
      <CinematicCaseHero
        locale={locale}
        title={title || "Case Study"}
        clientName={project.clientName}
        category={category}
        year={project.year}
        heroMediaType={project.heroMediaType}
        heroImageUrl={project.heroImageUrl}
        thumbnailMediaType={project.thumbnailMediaType}
        thumbnailUrl={project.thumbnailUrl}
        clientLogoUrl={project.clientLogoUrl}
        isFeatured={project.isFeatured}
        attraction={project.attraction}
      />

      {/* 2. Project Identity Bar & Sticky Section Navigator */}
      <ProjectIdentityBar
        locale={locale}
        clientName={project.clientName}
        category={category}
        year={project.year}
        isFeatured={project.isFeatured}
        attraction={project.attraction}
        hasChallenge={Boolean(challengeText)}
        hasSolution={Boolean(solutionText)}
        hasResult={Boolean(resultText)}
        hasImpact={metrics.length > 0}
        hasTeam={teamMembers.length > 0}
        hasTestimonials={testimonials.length > 0}
        hasGallery={gallery.length > 0}
      />

      {/* 3. Transformation Narrative (3 Acts: Challenge, Solution, Result) */}
      <TransformationNarrative
        locale={locale}
        challengeText={challengeText}
        solutionText={solutionText}
        resultText={resultText}
        heroImageUrl={project.heroImageUrl}
        heroMediaType={project.heroMediaType}
        thumbnailUrl={project.thumbnailUrl}
        galleryMedia={gallery}
      />

      {/* 4. Impact Metrics Bento Grid */}
      <ImpactMetricsGrid
        locale={locale}
        metrics={metrics}
      />

      {/* 5. Linked Attraction Feature ("From Project to Live Experience") */}
      <LinkedAttractionFeature
        locale={locale}
        attraction={project.attraction}
      />

      {/* 6. Editorial Visual Gallery Journey */}
      <CaseGalleryJourney
        locale={locale}
        gallery={gallery}
      />

      {/* 7. Project Team ("People Behind the Build") */}
      <ProjectTeamSection
        locale={locale}
        teamMembers={teamMembers}
      />

      {/* 8. Client Testimonials */}
      <CaseTestimonialsSection
        locale={locale}
        testimonials={testimonials}
      />

      {/* 9. Next Project Transition */}
      <NextProjectTransition
        locale={locale}
        nextProject={nextProject}
      />
    </div>
  );
}
