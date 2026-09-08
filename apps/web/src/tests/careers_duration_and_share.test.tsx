import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { ActiveJobsSection } from "@/components/b2b/careers/ActiveJobsSection";
import { ShareJobModal } from "@/components/b2b/careers/ShareJobModal";
import {
  FormattedPublicJob,
  calculateDeadlineFromDays,
  getRemainingDays,
  formatQatarDeadline,
  isDeadlineExpired,
  isJobPubliclyEligible,
  filterPubliclyEligibleJobs,
  analyzeJobDataQuality,
} from "@/lib/careers/job-eligibility";

describe("Careers Share Modal Flickering Fix & Listing Duration Suite", () => {
  /* ---------------------------------------------------------------- */
  /* 1. FLICKERING ISOLATION & MODAL ATTRIBUTES                      */
  /* ---------------------------------------------------------------- */
  describe("1. ShareJobModal Flickering Isolation", () => {
    it("renders dialog with high z-index (z-[9999]), pointer-events-auto, and backdrop blur isolation", () => {
      const html = renderToStaticMarkup(
        <ShareJobModal
          jobId="job-test-01"
          jobTitle="Experience Systems Designer"
          department="Operations"
          locale="en"
          defaultOpen={true}
        />
      );

      // Verify z-[9999] and pointer-events-auto for complete backdrop isolation
      expect(html).toContain("z-[9999]");
      expect(html).toContain("pointer-events-auto");
      expect(html).toContain("bg-black/80");
      expect(html).toContain("backdrop-blur-md");
      expect(html).toContain('data-testid="share-job-dialog"');
      expect(html).toContain("Experience Systems Designer");
    });
  });

  /* ---------------------------------------------------------------- */
  /* 2. JOB DURATION & DEADLINE CALCULATIONS                         */
  /* ---------------------------------------------------------------- */
  describe("2. Job Duration & Deadline Calculations", () => {
    it("calculates future deadlines accurately for 7, 14, 30, 60, 90 day presets", () => {
      const baseDate = new Date("2026-09-08T00:00:00Z");

      const d7 = calculateDeadlineFromDays(7, baseDate);
      expect(d7).toBe("2026-09-15");

      const d14 = calculateDeadlineFromDays(14, baseDate);
      expect(d14).toBe("2026-09-22");

      const d30 = calculateDeadlineFromDays(30, baseDate);
      expect(d30).toBe("2026-10-08");

      const d60 = calculateDeadlineFromDays(60, baseDate);
      expect(d60).toBe("2026-11-07");

      const d90 = calculateDeadlineFromDays(90, baseDate);
      expect(d90).toBe("2026-12-07");
    });

    it("evaluates remaining days correctly with Qatar timezone cutoff", () => {
      // Mock reference time: Sept 8, 2026 12:00:00 UTC
      const referenceNow = new Date("2026-09-08T12:00:00Z");

      // Deadline: Sept 15, 2026 (end of day in Qatar is 20:59:59 UTC)
      const remaining = getRemainingDays("2026-09-15", referenceNow);
      expect(remaining).toBeGreaterThanOrEqual(7);

      // Past deadline: Sept 1, 2026
      const pastRemaining = getRemainingDays("2026-09-01", referenceNow);
      expect(pastRemaining).toBe(0);

      // Null deadline (ongoing)
      expect(getRemainingDays(null)).toBeNull();
    });

    it("formats Qatar deadline localized in English and Arabic", () => {
      const formattedEn = formatQatarDeadline("2026-10-08", "en");
      expect(formattedEn).toContain("2026");

      const formattedAr = formatQatarDeadline("2026-10-08", "ar");
      expect(formattedAr).toBeDefined();
      expect(formattedAr?.length).toBeGreaterThan(0);
    });

    it("detects expired vs active deadlines relative to Qatar time", () => {
      const futureDate = "2099-12-31";
      const pastDate = "2020-01-01";

      expect(isDeadlineExpired(futureDate)).toBe(false);
      expect(isDeadlineExpired(pastDate)).toBe(true);
      expect(isDeadlineExpired(null)).toBe(false);
    });
  });

  /* ---------------------------------------------------------------- */
  /* 3. PUBLIC ELIGIBILITY & FILTERING                               */
  /* ---------------------------------------------------------------- */
  describe("3. Public Eligibility with Duration Constraints", () => {
    it("marks jobs with expired deadlines as ineligible for public consumers", () => {
      const activeJob = {
        id: "active-01",
        title: "Spatial Audio Engineer",
        isPublished: true,
        deadline: "2099-12-31",
      };

      const expiredJob = {
        id: "expired-01",
        title: "Past Kinetic Technician",
        isPublished: true,
        deadline: "2020-01-01",
      };

      const ongoingJob = {
        id: "ongoing-01",
        title: "General Production Assistant",
        isPublished: true,
        deadline: null,
      };

      expect(isJobPubliclyEligible(activeJob).eligible).toBe(true);
      expect(isJobPubliclyEligible(ongoingJob).eligible).toBe(true);

      const expiredEligibility = isJobPubliclyEligible(expiredJob);
      expect(expiredEligibility.eligible).toBe(false);
      expect(expiredEligibility.isExpired).toBe(true);

      const filtered = filterPubliclyEligibleJobs([activeJob, expiredJob, ongoingJob]);
      expect(filtered.map((j) => j.id)).toEqual(["active-01", "ongoing-01"]);
    });

    it("warns in data quality inspector when deadline is expired or missing", () => {
      const expiredQuality = analyzeJobDataQuality({
        title: "Sound Engineer",
        description: "A comprehensive description of the role with sufficient length.",
        deadline: "2020-01-01",
      });

      const hasExpiredIssue = expiredQuality.issues.some((i) => i.code === "EXPIRED_DEADLINE");
      expect(hasExpiredIssue).toBe(true);

      const ongoingQuality = analyzeJobDataQuality({
        title: "Lighting Specialist",
        description: "A comprehensive description of the role with sufficient length.",
        deadline: null,
      });

      const hasMissingIssue = ongoingQuality.issues.some((i) => i.code === "MISSING_DEADLINE");
      expect(hasMissingIssue).toBe(true);
    });
  });

  /* ---------------------------------------------------------------- */
  /* 4. ACTIVE JOBS SECTION DURATION BADGE INTEGRATION               */
  /* ---------------------------------------------------------------- */
  describe("4. ActiveJobsSection Duration Badge Rendering", () => {
    it("renders deadline countdown badge when job has a deadline", () => {
      const sampleJobs: FormattedPublicJob[] = [
        {
          id: "job-with-deadline",
          title: "Senior Experience Lead",
          titleEn: "Senior Experience Lead",
          titleAr: "قائد تجارب أول",
          department: "Creative",
          location: "Doha, Qatar",
          type: "FULL_TIME",
          description: "Design memorable immersive experiences.",
          requirements: "7+ years experience.",
          isPublished: true,
          deadline: "2099-12-31",
          createdAt: new Date().toISOString(),
        },
      ];

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ActiveJobsSection jobs={sampleJobs} locale="en" />
        </LocaleProvider>
      );

      // Verify the card renders the deadline indicator
      expect(html).toContain("Senior Experience Lead");
      expect(html).toContain("Doha, Qatar");
      expect(html).toContain("left");
    });
  });
});
