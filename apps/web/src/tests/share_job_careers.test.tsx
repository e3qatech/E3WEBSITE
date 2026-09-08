import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { ActiveJobsSection } from "@/components/b2b/careers/ActiveJobsSection";
import { ShareJobModal } from "@/components/b2b/careers/ShareJobModal";
import { FormattedPublicJob } from "@/lib/careers/job-eligibility";

const SAMPLE_JOBS: FormattedPublicJob[] = [
  {
    id: "job-01",
    title: "Senior Spatial Production Director",
    titleEn: "Senior Spatial Production Director",
    titleAr: "مدير أول إنتاج مكاني وتجارب حية",
    department: "Executive Production",
    location: "Doha, Qatar",
    type: "FULL_TIME",
    description: "Lead groundbreaking multi-sensory experiences across Qatar.",
    requirements: "10+ years leading mega event production.",
    isPublished: true,
    deadline: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "job-02",
    title: "AV & Kinetic Systems Engineer",
    titleEn: "AV & Kinetic Systems Engineer",
    titleAr: "مهندس نظم سمعية وبصرية وحركية",
    department: "Technical Systems",
    location: "Lusail, Qatar",
    type: "FULL_TIME",
    description: "Engineer kinetic stage rigs and immersive audio visual architectures.",
    requirements: "5+ years in automation and show control.",
    isPublished: true,
    deadline: null,
    createdAt: new Date().toISOString(),
  },
];

describe("Share Job Feature Suite (B2B Careers & Role Detail)", () => {
  /* ---------------------------------------------------------------- */
  /* 1. ACTIVE JOBS SECTION INTEGRATION                                */
  /* ---------------------------------------------------------------- */
  describe("1. ActiveJobsSection Share Integration", () => {
    it("renders Share Careers button in section header and Share button on each job card", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ActiveJobsSection jobs={SAMPLE_JOBS} locale="en" />
        </LocaleProvider>
      );

      // Section header contains Share Careers button
      expect(html).toContain('data-testid="share-careers-page-btn"');
      expect(html).toContain("Share Careers");

      // Each job card has a distinct Share button
      expect(html).toContain('data-testid="share-job-btn-job-01"');
      expect(html).toContain('data-testid="share-job-btn-job-02"');
      expect(html).toContain("Share");
    });

    it("renders localized Arabic share actions in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <ActiveJobsSection jobs={SAMPLE_JOBS} locale="ar" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="share-careers-page-btn"');
      expect(html).toContain("مشاركة الشواغر");
      expect(html).toContain('data-testid="share-job-btn-job-01"');
      expect(html).toContain("مشاركة");
    });
  });

  /* ---------------------------------------------------------------- */
  /* 2. SHARE JOB MODAL DIALOG CONTENTS & SOCIAL CHANNELS              */
  /* ---------------------------------------------------------------- */
  describe("2. ShareJobModal Dialog Contents & Social Channels", () => {
    it("renders job sharing dialog with WhatsApp, LinkedIn, X, Email and Copy Link in English", () => {
      const html = renderToStaticMarkup(
        <ShareJobModal
          jobId="job-01"
          jobTitle="Senior Spatial Production Director"
          department="Executive Production"
          location="Doha, Qatar"
          locale="en"
          defaultOpen={true}
        />
      );

      // Dialog container & headers
      expect(html).toContain('data-testid="share-job-dialog"');
      expect(html).toContain('data-testid="share-dialog-title"');
      expect(html).toContain("Share Job Opportunity");
      expect(html).toContain("Senior Spatial Production Director");
      expect(html).toContain("Executive Production");

      // Social sharing channels
      expect(html).toContain('data-testid="share-whatsapp-btn"');
      expect(html).toContain("whatsapp.com/send?text=");
      expect(html).toContain('data-testid="share-linkedin-btn"');
      expect(html).toContain("linkedin.com/sharing/share-offsite/?url=");
      expect(html).toContain('data-testid="share-twitter-btn"');
      expect(html).toContain("twitter.com/intent/tweet?text=");
      expect(html).toContain('data-testid="share-email-btn"');
      expect(html).toContain("mailto:?subject=");

      // Copy Link input & button
      expect(html).toContain('data-testid="share-copy-link-btn"');
      expect(html).toContain("Copy Link");
      expect(html).toContain("/en/careers/job-01");

      // Close button
      expect(html).toContain('data-testid="share-close-btn"');
    });

    it("renders Arabic dialog labels, RTL direction and Arabic URLs", () => {
      const html = renderToStaticMarkup(
        <ShareJobModal
          jobId="job-01"
          jobTitle="مدير أول إنتاج مكاني وتجارب حية"
          department="الإنتاج التنفيذي"
          location="الدوحة، قطر"
          locale="ar"
          defaultOpen={true}
        />
      );

      expect(html).toContain('dir="rtl"');
      expect(html).toContain("مشاركة الفرصة الوظيفية");
      expect(html).toContain("مدير أول إنتاج مكاني وتجارب حية");
      expect(html).toContain("الإنتاج التنفيذي");
      expect(html).toContain("نسخ الرابط");
      expect(html).toContain("/ar/careers/job-01");
    });

    it("renders Careers portal page share dialog when isPageShare is true", () => {
      const html = renderToStaticMarkup(
        <ShareJobModal
          locale="en"
          variant="header"
          isPageShare={true}
          defaultOpen={true}
        />
      );

      expect(html).toContain("Share Careers Opportunities");
      expect(html).toContain("/en/b2b/careers");
    });

    it("renders detail page variant trigger with appropriate styling and testid", () => {
      const html = renderToStaticMarkup(
        <ShareJobModal
          jobId="job-01"
          jobTitle="Senior Spatial Production Director"
          locale="en"
          variant="detail"
        />
      );

      expect(html).toContain('data-testid="share-job-btn-job-01"');
      expect(html).toContain("Share Job");
    });
  });
});
