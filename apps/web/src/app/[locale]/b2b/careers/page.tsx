import React from "react";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
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
export const revalidate = 0;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  let pageData: any = null;
  try {
    pageData = await db.pages.findUnique({
      where: { slug: "b2b-careers" },
    });
  } catch (e) {
    console.warn("[B2B Careers Metadata] Error querying page:", e);
  }

  const cms = getMergedCMSPageContent("b2b-careers", pageData?.content);
  const seo = cms.seo || {};

  const title = isAr
    ? seo.metaTitleAr || cms.hero?.titleAr || "الوظائف وفرص الانضمام | إي ثري قطر"
    : seo.metaTitleEn || cms.hero?.titleEn || "Careers & Opportunities | E3 Qatar";

  const description = isAr
    ? seo.metaDescriptionAr || cms.hero?.subtitleAr || "انضم إلى نخبة مهندسي التجارب، مصممي المسارح الحركية، ومخرجي أضخم الفعاليات الترفيهية والثقافية في دولة قطر."
    : seo.metaDescriptionEn || cms.hero?.subtitleEn || "Join an elite collective of spatial architects, technical directors, AV systems engineers, and live experience pioneers in Qatar.";

  return {
    title,
    description,
    keywords: isAr ? seo.keywordsAr : seo.keywordsEn,
    alternates: {
      canonical: `/${locale}/b2b/careers`,
      languages: {
        en: "/en/b2b/careers",
        ar: "/ar/b2b/careers",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://e3.qa/${locale}/b2b/careers`,
      siteName: isAr ? "إي ثري قطر" : "E3 Qatar",
      locale: isAr ? "ar_QA" : "en_US",
      type: "website",
    },
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
  let rawDbJobs: any[] = [];
  let sessionUser: any = null;

  try {
    const [pageResult, jobsResult, sessionResult] = await Promise.all([
      db.pages.findUnique({
        where: { slug: "b2b-careers" },
      }),
      db.job.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      }),
      auth(),
    ]);

    pageData = pageResult;
    rawDbJobs = jobsResult;
    if (sessionResult?.user) {
      sessionUser = sessionResult.user;
    }
  } catch (error) {
    console.error("[B2B Careers Server Loader] Error querying data:", error);
  }

  const content = getMergedCMSPageContent("b2b-careers", pageData?.content);

  // 2. Format eligible published jobs
  let displayJobs: FormattedPublicJob[] = [];
  const eligibleDbJobs = filterPubliclyEligibleJobs(rawDbJobs);
  if (eligibleDbJobs.length > 0) {
    displayJobs = eligibleDbJobs.map((j) =>
      formatJobPresentation(j, isAr ? "ar" : "en")
    );
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

      {/* 2. Active Jobs Section */}
      <ActiveJobsSection
        jobs={displayJobs}
        locale={locale}
      />

      {/* 3. General Application & CV Upload Section */}
      {content?.generalApplication?.enabled !== false && (
        <GeneralCvUploadSection
          locale={locale}
          eyebrowEn={content?.generalApplication?.eyebrowEn}
          eyebrowAr={content?.generalApplication?.eyebrowAr}
          titleEn={content?.generalApplication?.titleEn}
          titleAr={content?.generalApplication?.titleAr}
          descriptionEn={content?.generalApplication?.descriptionEn}
          descriptionAr={content?.generalApplication?.descriptionAr}
          buttonTextEn={content?.generalApplication?.buttonTextEn}
          buttonTextAr={content?.generalApplication?.buttonTextAr}
        />
      )}

      {/* 4. Candidate Portal Banner (Sign In / View Applications) */}
      {content?.portalBanner?.enabled !== false && (
        <CandidatePortalBanner
          locale={locale}
          eyebrowEn={content?.portalBanner?.eyebrowEn}
          eyebrowAr={content?.portalBanner?.eyebrowAr}
          titleEn={content?.portalBanner?.titleEn}
          titleAr={content?.portalBanner?.titleAr}
          descriptionEn={content?.portalBanner?.descriptionEn}
          descriptionAr={content?.portalBanner?.descriptionAr}
          signInTextEn={content?.portalBanner?.signInTextEn}
          signInTextAr={content?.portalBanner?.signInTextAr}
          user={sessionUser}
        />
      )}

      {/* 5. Life at E3 (Culture & Behind-the-Scenes Production) */}
      {content?.lifeAtE3?.enabled !== false && (
        <LifeAtE3Section
          locale={locale}
          eyebrowEn={content?.lifeAtE3?.eyebrowEn}
          eyebrowAr={content?.lifeAtE3?.eyebrowAr}
          titleEn={content?.lifeAtE3?.titleEn}
          titleAr={content?.lifeAtE3?.titleAr}
          subtitleEn={content?.lifeAtE3?.subtitleEn}
          subtitleAr={content?.lifeAtE3?.subtitleAr}
          items={content?.lifeAtE3?.items}
        />
      )}

      {/* 6. Hiring Journey (4-Step Process) */}
      {content?.hiringJourney?.enabled !== false && (
        <HiringJourneySection
          locale={locale}
          eyebrowEn={content?.hiringJourney?.eyebrowEn}
          eyebrowAr={content?.hiringJourney?.eyebrowAr}
          titleEn={content?.hiringJourney?.titleEn}
          titleAr={content?.hiringJourney?.titleAr}
          subtitleEn={content?.hiringJourney?.subtitleEn}
          subtitleAr={content?.hiringJourney?.subtitleAr}
          steps={content?.hiringJourney?.steps}
        />
      )}

      {/* 7. Career Enquiries Section */}
      {content?.enquiries?.enabled !== false && (
        <CareerEnquirySection
          locale={locale}
          eyebrowEn={content?.enquiries?.eyebrowEn}
          eyebrowAr={content?.enquiries?.eyebrowAr}
          titleEn={content?.enquiries?.titleEn}
          titleAr={content?.enquiries?.titleAr}
          subtitleEn={content?.enquiries?.subtitleEn}
          subtitleAr={content?.enquiries?.subtitleAr}
        />
      )}
    </div>
  );
}
