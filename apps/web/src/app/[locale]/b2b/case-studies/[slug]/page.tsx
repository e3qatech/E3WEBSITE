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
  const isAr = locale === "ar";

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

  const metrics = Array.isArray(project.metrics) ? (project.metrics as any[]) : [];
  const gallery = Array.isArray(project.gallery) ? (project.gallery as any[]) : [];
  const testimonials = Array.isArray(project.testimonials) ? (project.testimonials as any[]) : [];
  const teamMembers = Array.isArray(project.teamMembers) ? (project.teamMembers as any[]) : [];

  return (
    <main
      className="min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] transition-colors duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. Cinematic Hero with Dynamic Media, Client Badge & Live Stats */}
      <CinematicCaseHero
        locale={locale}
        title={isAr ? (project.titleAr || project.titleEn) : project.titleEn}
        clientName={project.clientName}
        category={isAr ? (project.categoryAr || project.category) : project.category}
        year={project.year}
        heroMediaType={project.heroMediaType}
        heroImageUrl={project.heroImageUrl}
        thumbnailMediaType={project.thumbnailMediaType}
        thumbnailUrl={project.thumbnailUrl}
        clientLogoUrl={project.clientLogoUrl}
        isFeatured={project.isFeatured}
        attraction={project.attraction}
      />

      {/* 2. Project Quick Identity Bar */}
      <ProjectIdentityBar
        locale={locale}
        clientName={project.clientName}
        category={isAr ? (project.categoryAr || project.category) : project.category}
        year={project.year}
        isFeatured={project.isFeatured}
        attraction={project.attraction}
        hasChallenge={Boolean(project.challengeEn || project.challengeAr)}
        hasSolution={Boolean(project.solutionEn || project.solutionAr)}
        hasResult={Boolean(project.resultEn || project.resultAr)}
        hasImpact={metrics.length > 0}
        hasGallery={gallery.length > 0}
        hasTeam={teamMembers.length > 0}
        hasTestimonials={testimonials.length > 0}
      />

      {/* 3. Challenge, Solution & Execution Narrative */}
      <TransformationNarrative
        locale={locale}
        challengeText={isAr ? (project.challengeAr || project.challengeEn) : project.challengeEn}
        solutionText={isAr ? (project.solutionAr || project.solutionEn) : project.solutionEn}
        resultText={isAr ? (project.resultAr || project.resultEn) : project.resultEn}
        heroImageUrl={project.heroImageUrl}
        heroMediaType={project.heroMediaType}
        thumbnailUrl={project.thumbnailUrl}
        galleryMedia={gallery}
      />

      {/* 4. Impact Metrics & KPIs Grid */}
      {metrics.length > 0 && (
        <ImpactMetricsGrid metrics={metrics} locale={locale} />
      )}

      {/* 5. Linked Public Attraction (When connected) */}
      {project.attraction && (
        <LinkedAttractionFeature attraction={project.attraction} locale={locale} />
      )}

      {/* 6. Curated Media Gallery & Transformation Journey */}
      {gallery.length > 0 && (
        <CaseGalleryJourney gallery={gallery} locale={locale} />
      )}

      {/* 7. Behind the Build: Leadership & Engineering Team */}
      {teamMembers.length > 0 && (
        <ProjectTeamSection teamMembers={teamMembers} locale={locale} />
      )}

      {/* 8. Client Testimonials & Partner Verification */}
      {testimonials.length > 0 && (
        <CaseTestimonialsSection testimonials={testimonials} locale={locale} />
      )}

      {/* 9. Next Project Transition Stage */}
      {nextProject && (
        <NextProjectTransition nextProject={nextProject} locale={locale} />
      )}
    </main>
  );
}
