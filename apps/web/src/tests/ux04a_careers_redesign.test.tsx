/**
 * UX-04A: Connect and Redesign the E3 Careers Experience Test Suite
 *
 * Requirements:
 * 1. Cinematic Careers Hero: CMS video/image, editable EN/AR headline/desc, "Explore Open Roles" & "Upload Your CV", no custom cursor.
 * 2. Active Jobs: Published non-expired jobs, department/location/type filters, vacancy counter, "View Role" & "Apply Now", empty fallback.
 * 3. General Application & CV Upload: Embedded CV uploader, password account creation, duplicate detection.
 * 4. Candidate Portal: "Already Applied? Sign In" (/[locale]/login/careers?callbackUrl=/[locale]/candidate) or "View My Applications".
 * 5. Life at E3: Event engineering, kinetic production, spatial architecture showcase.
 * 6. Hiring Journey: 4-step clear visual roadmap (Application, Review, Interview, Offer).
 * 7. Career Enquiries: Connected to /api/contact/b2b with CAREER_ENQUIRY actionType.
 * 8. Complete EN/AR localization, RTL mirroring, responsive design and accessibility.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/lib/db", () => ({
  db: {
    inquiry: {
      create: vi.fn(async ({ data }: any) => ({ id: "inq-mock-1", createdAt: new Date(), ...data })),
    },
    lead: {
      create: vi.fn(async ({ data }: any) => ({ id: "lead-mock-1", ...data })),
    },
    job: {
      findMany: vi.fn(async () => []),
    },
    pages: {
      findUnique: vi.fn(async () => null),
    },
  },
}));

import { CinematicCareersHero } from "@/components/b2b/careers/CinematicCareersHero";
import { ActiveJobsSection } from "@/components/b2b/careers/ActiveJobsSection";
import { GeneralCvUploadSection } from "@/components/b2b/careers/GeneralCvUploadSection";
import { CandidatePortalBanner } from "@/components/b2b/careers/CandidatePortalBanner";
import { LifeAtE3Section } from "@/components/b2b/careers/LifeAtE3Section";
import { HiringJourneySection } from "@/components/b2b/careers/HiringJourneySection";
import { CareerEnquirySection } from "@/components/b2b/careers/CareerEnquirySection";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { FormattedPublicJob } from "@/lib/careers/job-eligibility";
import { POST as ContactB2BPost } from "@/app/api/contact/b2b/route";

const SAMPLE_FORMATTED_JOBS: FormattedPublicJob[] = [
  {
    id: "job-01",
    title: "Senior Spatial Production Director",
    titleEn: "Senior Spatial Production Director",
    titleAr: "مدير إنتاج وتصميم مكاني أول",
    department: "Spatial Design",
    location: "Doha, Qatar",
    type: "Full Time",
    description: "Lead the spatial architecture and technical production for mega-scale cultural events.",
    requirements: "10+ years experience in spatial design, CAD, and experiential installations.",
    deadline: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "job-02",
    title: "AV & Kinetic Systems Engineer",
    titleEn: "AV & Kinetic Systems Engineer",
    titleAr: "مهندس أنظمة سمعية بصرية ومسارح حركية",
    department: "Technical Production",
    location: "Lusail, Qatar",
    type: "Full Time",
    description: "Engineer ultra-high-definition projection mapping, laser choreography, and kinetic stage synchronization.",
    requirements: "Degree in Electrical Engineering or AV Technology with 5+ years live stage experience.",
    deadline: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "job-03",
    title: "Live Operations & Protocol Manager",
    titleEn: "Live Operations & Protocol Manager",
    titleAr: "مدير العمليات الميدانية والبروتوكول",
    department: "Operations",
    location: "Doha, Qatar",
    type: "Contract",
    description: "Command on-site crowd safety dynamics, VIP protocol hosting, and vendor synchronization.",
    requirements: "Proven track record managing stadium-tier or festival-tier live operational environments.",
    deadline: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
];

describe("UX-04A — Connect and Redesign the E3 Careers Experience Suite", () => {
  /* ================================================================ */
  /* 1. CINEMATIC CAREERS HERO                                        */
  /* ================================================================ */
  describe("1. CinematicCareersHero Component", () => {
    it("renders hero with title, description, vacancy counter, and dual action anchors", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CinematicCareersHero
            locale="en"
            totalVacancies={3}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="cinematic-careers-hero"');
      expect(html).toContain('data-testid="careers-hero-heading"');
      expect(html).toContain("CAREERS AT E3 QATAR");
      expect(html).toContain("3 Open Roles");
      expect(html).toContain('data-testid="hero-explore-roles-cta"');
      expect(html).toContain('data-testid="hero-upload-cv-cta"');
      expect(html).toContain("Explore Open Roles ↓");
      expect(html).toContain("Upload Your CV (General App)");
      expect(html).toContain("#open-roles");
      expect(html).toContain("#upload-cv");
    });

    it("renders Arabic typography, RTL alignment, and Arabic metadata in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <CinematicCareersHero
            locale="ar"
            totalVacancies={3}
          />
        </LocaleProvider>
      );

      expect(html).toContain('dir="rtl"');
      expect(html).toContain("فرص العمل في إي ثري قطر");
      expect(html).toContain("3 شواغر متاحة");
      expect(html).toContain("استكشف الوظائف المتاحة ↓");
      expect(html).toContain("تحميل السيرة الذاتية (طلب عام)");
    });
  });

  /* ================================================================ */
  /* 2. ACTIVE JOBS SECTION                                           */
  /* ================================================================ */
  describe("2. ActiveJobsSection Component", () => {
    it("renders active jobs grid with search, department filters, and view/apply links", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ActiveJobsSection
            jobs={SAMPLE_FORMATTED_JOBS}
            locale="en"
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="active-jobs-section"');
      expect(html).toContain('data-testid="jobs-search-input"');
      expect(html).toContain('data-testid="jobs-department-filter"');
      expect(html).toContain('data-testid="jobs-location-filter"');
      expect(html).toContain('data-testid="jobs-type-filter"');
      expect(html).toContain('data-testid="vacancy-count-badge"');
      expect(html).toContain("3");

      // Individual cards
      expect(html).toContain('data-testid="job-card-job-01"');
      expect(html).toContain('data-testid="job-card-job-02"');
      expect(html).toContain('data-testid="job-card-job-03"');
      expect(html).toContain("Senior Spatial Production Director");
      expect(html).toContain("AV &amp; Kinetic Systems Engineer");
      expect(html).toContain("/en/careers/job-01");
      expect(html).toContain("/en/apply?jobId=job-01");
    });

    it("renders fallback with direct link to CV upload when no jobs are available", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ActiveJobsSection
            jobs={[]}
            locale="en"
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="no-jobs-fallback"');
      expect(html).toContain("No Matching Open Positions Currently");
      expect(html).toContain('data-testid="fallback-general-app-cta"');
      expect(html).toContain("Submit General Application");
      expect(html).toContain("#upload-cv");
    });
  });

  /* ================================================================ */
  /* 3. GENERAL CV UPLOAD SECTION                                     */
  /* ================================================================ */
  describe("3. GeneralCvUploadSection Component", () => {
    it("renders embedded CV upload form with password input and secure submission action", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <GeneralCvUploadSection locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="general-cv-upload-section"');
      expect(html).toContain('data-testid="general-cv-upload-form"');
      expect(html).toContain('data-testid="cv-first-name-input"');
      expect(html).toContain('data-testid="cv-last-name-input"');
      expect(html).toContain('data-testid="cv-email-input"');
      expect(html).toContain('data-testid="cv-phone-input"');
      expect(html).toContain('data-testid="cv-password-input"');
      expect(html).toContain('data-testid="cv-media-uploader"');
      expect(html).toContain('data-testid="submit-general-application-btn"');
      expect(html).toContain("Submit CV &amp; Create Account");
    });

    it("renders Arabic labels and RTL direction in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <GeneralCvUploadSection locale="ar" />
        </LocaleProvider>
      );

      expect(html).toContain('dir="rtl"');
      expect(html).toContain("الاسم الأول *");
      expect(html).toContain("اسم العائلة *");
      expect(html).toContain("البريد الإلكتروني *");
      expect(html).toContain("إرسال السيرة الذاتية وإنشاء الحساب");
    });
  });

  /* ================================================================ */
  /* 4. CANDIDATE PORTAL BANNER                                       */
  /* ================================================================ */
  describe("4. CandidatePortalBanner Component", () => {
    it("renders 'Already Applied? Sign In' linking to login for guest candidates", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CandidatePortalBanner locale="en" user={null} />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="candidate-portal-banner"');
      expect(html).toContain("Already Applied to E3?");
      expect(html).toContain('data-testid="candidate-portal-signin-cta"');
      expect(html).toContain("Already Applied? Sign In");
      expect(html).toContain("/en/login/careers?callbackUrl=/en/candidate");
    });

    it("renders 'View My Applications' linking to /candidate when logged in", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CandidatePortalBanner
            locale="en"
            user={{ name: "Tariq Al-Mansoor", email: "tariq@e3.qa", role: "CANDIDATE" }}
          />
        </LocaleProvider>
      );

      expect(html).toContain("Welcome back, Tariq Al-Mansoor!");
      expect(html).toContain('data-testid="candidate-portal-dashboard-cta"');
      expect(html).toContain("View My Applications");
      expect(html).toContain("/en/candidate");
    });
  });

  /* ================================================================ */
  /* 5. LIFE AT E3 & HIRING JOURNEY SECTIONS                          */
  /* ================================================================ */
  describe("5. LifeAtE3Section & HiringJourneySection Components", () => {
    it("renders Life at E3 cultural and technical production pillars", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <LifeAtE3Section locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="life-at-e3-section"');
      expect(html).toContain("Life Inside the Engineering Atelier");
      expect(html).toContain('data-testid="life-item-kinetic-production"');
      expect(html).toContain('data-testid="life-item-spatial-architecture"');
      expect(html).toContain('data-testid="life-item-live-event-ops"');
      expect(html).toContain('data-testid="life-item-creative-direction"');
    });

    it("renders Hiring Journey with the 4 sequential milestones", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <HiringJourneySection locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="hiring-journey-section"');
      expect(html).toContain("Our Four-Step Hiring Journey");
      expect(html).toContain('data-testid="hiring-step-01"');
      expect(html).toContain('data-testid="hiring-step-02"');
      expect(html).toContain('data-testid="hiring-step-03"');
      expect(html).toContain('data-testid="hiring-step-04"');
      expect(html).toContain("Stage 01");
      expect(html).toContain("Stage 04");
    });
  });

  /* ================================================================ */
  /* 6. CAREER ENQUIRY SECTION & API INTEGRATION                      */
  /* ================================================================ */
  describe("6. CareerEnquirySection & /api/contact/b2b Endpoint", () => {
    it("renders career enquiry form with enquiry type selector and submit button", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CareerEnquirySection locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="career-enquiry-section"');
      expect(html).toContain('data-testid="career-enquiry-form"');
      expect(html).toContain('data-testid="enquiry-name-input"');
      expect(html).toContain('data-testid="enquiry-email-input"');
      expect(html).toContain('data-testid="enquiry-type-select"');
      expect(html).toContain('data-testid="enquiry-message-input"');
      expect(html).toContain('data-testid="submit-career-enquiry-btn"');
    });

    it("POST /api/contact/b2b validates and creates CAREER_ENQUIRY inquiry record", async () => {
      const req = new Request("http://localhost/api/contact/b2b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "127.0.0.1",
        },
        body: JSON.stringify({
          actionType: "CAREER_ENQUIRY",
          name: "Fatima Al-Nuaimi",
          email: "fatima.nuaimi@example.com",
          phone: "+974 5555 4444",
          enquiryType: "Executive & Senior Leadership Search",
          message: "Inquiring about executive leadership opportunities in technical live entertainment.",
        }),
      });

      const res = await ContactB2BPost(req as any);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.name).toBe("Fatima Al-Nuaimi");
      expect(json.email).toBe("fatima.nuaimi@example.com");
      expect(json.type).toBe("CAREERS");
    });
  });
});
