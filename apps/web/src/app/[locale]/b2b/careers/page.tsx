import React from "react";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  filterPubliclyEligibleJobs,
  formatJobPresentation,
  FormattedPublicJob,
} from "@/lib/careers/job-eligibility";
import { CinematicCareersHero } from "@/components/b2b/careers/CinematicCareersHero";
import { ActiveJobsSection } from "@/components/b2b/careers/ActiveJobsSection";
import { GeneralCvUploadSection } from "@/components/b2b/careers/GeneralCvUploadSection";
import { CandidatePortalBanner } from "@/components/b2b/careers/CandidatePortalBanner";
import { LifeAtE3Section } from "@/components/b2b/careers/LifeAtE3Section";
import { HiringJourneySection } from "@/components/b2b/careers/HiringJourneySection";
import { CareerEnquirySection } from "@/components/b2b/careers/CareerEnquirySection";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "الوظائف وفرص الانضمام | إي ثري قطر"
      : "Careers & Opportunities | E3 Qatar",
    description: isAr
      ? "انضم إلى نخبة مهندسي التجارب، مصممي المسارح الحركية، ومخرجي أضخم الفعاليات الترفيهية والثقافية في دولة قطر."
      : "Join an elite collective of spatial architects, technical directors, AV systems engineers, and live experience pioneers in Qatar.",
  };
}

export default async function B2BCareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  // 1. Fetch CMS content for 'b2b-careers'
  let pageData: any = null;
  try {
    pageData = await db.pages.findUnique({
      where: { slug: "b2b-careers" },
    });
  } catch (error) {
    console.error("Error loading b2b-careers CMS page:", error);
  }

  const content = (pageData?.content as any) || {};

  // 2. Fetch published, non-expired jobs from db.job
  let displayJobs: FormattedPublicJob[] = [];
  try {
    const rawDbJobs = await db.job.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    const eligibleDbJobs = filterPubliclyEligibleJobs(rawDbJobs);
    if (eligibleDbJobs.length > 0) {
      displayJobs = eligibleDbJobs.map((j) =>
        formatJobPresentation(j, isAr ? "ar" : "en")
      );
    }
  } catch (err) {
    console.error("Error fetching db.job for B2B careers:", err);
  }

  // 3. Fetch session to determine candidate auth state
  let sessionUser: any = null;
  try {
    const session = await auth();
    if (session?.user) {
      sessionUser = session.user;
    }
  } catch (err) {
    console.error("Error resolving session on B2B careers page:", err);
  }

  const mediaType = content?.hero?.mediaType || "IMAGE";
  const mediaUrl = content?.hero?.mediaUrl || "";

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-[var(--surface-default)] text-[var(--text-primary)]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. Cinematic Careers Hero */}
      <CinematicCareersHero
        locale={locale}
        eyebrowEn={content?.hero?.eyebrowEn}
        eyebrowAr={content?.hero?.eyebrowAr}
        titleEn={content?.hero?.titleEn}
        titleAr={content?.hero?.titleAr}
        descriptionEn={content?.hero?.descriptionEn || content?.hero?.subtitleEn}
        descriptionAr={content?.hero?.descriptionAr || content?.hero?.subtitleAr}
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        totalVacancies={displayJobs.length}
      />

      {/* 2. Active Jobs Section (Filters, Vacancy count, Cards & Fallback) */}
      <ActiveJobsSection
        jobs={displayJobs}
        locale={locale}
      />

      {/* 3. General Application & CV Upload Section */}
      <GeneralCvUploadSection
        locale={locale}
      />

      {/* 4. Candidate Portal Banner (Sign In / View Applications) */}
      <CandidatePortalBanner
        locale={locale}
        user={sessionUser}
      />

      {/* 5. Life at E3 (Culture & Behind-the-Scenes Production) */}
      <LifeAtE3Section
        locale={locale}
      />

      {/* 6. Hiring Journey (4-Step Process) */}
      <HiringJourneySection
        locale={locale}
      />

      {/* 7. Career Enquiries Section (Connected to Contact/Inquiries API) */}
      <CareerEnquirySection
        locale={locale}
      />
    </div>
  );
}
