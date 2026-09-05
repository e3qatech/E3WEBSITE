import { describe, it, expect } from "vitest";
import { isHRAuthorized } from "@/lib/careers/job-eligibility";
import { isTeamAuthorized } from "@/lib/team/team-resolver";
import { computeCategoryFitAndRank } from "@/lib/careers/ai-cv-parser";

describe("HR Access Control, Job Applications & Talent Ecosystem Suite", () => {
  describe("1. HR Access Control & Permissions", () => {
    it("recognizes HR_ADMIN and SUPER_ADMIN as authorized for Careers and HR jobs", () => {
      expect(isHRAuthorized("HR_ADMIN")).toBe(true);
      expect(isHRAuthorized("SUPER_ADMIN")).toBe(true);
      expect(isHRAuthorized("HR")).toBe(true);
      expect(isHRAuthorized("ADMIN")).toBe(true);
      expect(isHRAuthorized("USER")).toBe(false);
      expect(isHRAuthorized("GUEST")).toBe(false);
    });

    it("recognizes explicit HR capabilities for staff accounts", () => {
      expect(isHRAuthorized("STAFF", ["hr.jobs.manage"])).toBe(true);
      expect(isHRAuthorized("STAFF", ["hr.applications.manage"])).toBe(true);
      expect(isHRAuthorized("STAFF", ["hr.team.manage"])).toBe(true);
      expect(isHRAuthorized("STAFF", ["crm.leads.manage"])).toBe(false);
    });

    it("authorizes HR_ADMIN and HR for Team Directory management in isTeamAuthorized", () => {
      expect(isTeamAuthorized("HR_ADMIN")).toBe(true);
      expect(isTeamAuthorized("HR")).toBe(true);
      expect(isTeamAuthorized("SUPER_ADMIN")).toBe(true);
      expect(isTeamAuthorized("ADMIN")).toBe(true);
      expect(isTeamAuthorized("STAFF", ["hr.team.manage"])).toBe(true);
      expect(isTeamAuthorized("USER")).toBe(false);
    });
  });

  describe("2. AI Category Candidate Ranking Engine", () => {
    const candidateA = {
      id: "cand-1",
      firstName: "Tariq",
      lastName: "Al-Mansoori",
      jobTitle: "Senior Event Operations Lead",
      department: "Operations",
      status: "INTERVIEW",
      cvUrl: "https://example.com/cv-tariq.pdf",
      phone: "+974 5555 1234",
      cvParsedData: {
        skills: ["Event Operations", "Logistics", "Stage Coordination", "VIP Protocol", "Budgeting"],
        experienceYears: 7,
        education: "Master of Business Administration",
        summary: "Seasoned event operations lead with extensive Qatar landmark experience.",
      },
    };

    const candidateB = {
      id: "cand-2",
      firstName: "Fatima",
      lastName: "Al-Kuwari",
      jobTitle: "Senior Event Operations Lead",
      department: "Operations",
      status: "NEW",
      cvUrl: "https://example.com/cv-fatima.pdf",
      phone: "+974 5555 5678",
      cvParsedData: {
        skills: ["Event Operations", "Logistics"],
        experienceYears: 3,
        education: "Bachelor of Arts",
        summary: "Enthusiastic event coordinator with junior experience.",
      },
    };

    const candidateC = {
      id: "cand-3",
      firstName: "Rashid",
      lastName: "Khan",
      jobTitle: "Senior Event Operations Lead",
      department: "Operations",
      status: "HIRED",
      cvUrl: "https://example.com/cv-rashid.pdf",
      phone: "+974 5555 9999",
      cvParsedData: {
        skills: ["Event Operations", "Logistics", "Stage Coordination", "Crowd Flow", "Protocol", "Planning", "Vendor"],
        experienceYears: 9,
        education: "Bachelor of Science",
        summary: "Veteran event operations director with decade of live stage execution.",
      },
    };

    it("accurately scores and ranks peer candidates competing for the same position", () => {
      const allCandidates = [candidateA, candidateB, candidateC];

      const rankA = computeCategoryFitAndRank(candidateA, allCandidates);
      const rankB = computeCategoryFitAndRank(candidateB, allCandidates);
      const rankC = computeCategoryFitAndRank(candidateC, allCandidates);

      expect(rankA.totalCandidates).toBe(3);
      expect(rankB.totalCandidates).toBe(3);
      expect(rankC.totalCandidates).toBe(3);

      // Candidate C with 9 years experience and 7 domain keywords should score highest
      expect(rankC.matchScore).toBeGreaterThanOrEqual(rankA.matchScore);
      expect(rankA.matchScore).toBeGreaterThan(rankB.matchScore);

      // Verify ranks are 1, 2, 3
      expect(rankC.rank).toBe(1);
      expect(rankA.rank).toBe(2);
      expect(rankB.rank).toBe(3);

      // Verify tier designations
      expect(rankC.tier).toBe("TOP_MATCH");
      expect(["TOP_MATCH", "STRONG_FIT"]).toContain(rankA.tier);
    });

    it("produces granular score breakdown with skills, experience, and stage weights", () => {
      const rankA = computeCategoryFitAndRank(candidateA, [candidateA]);

      expect(rankA.scoreBreakdown).toBeDefined();
      expect(rankA.scoreBreakdown.skillsMatch).toBeGreaterThan(0);
      expect(rankA.scoreBreakdown.skillsMatch).toBeLessThanOrEqual(40);
      expect(rankA.scoreBreakdown.experienceScore).toBeGreaterThan(0);
      expect(rankA.scoreBreakdown.experienceScore).toBeLessThanOrEqual(30);
      expect(rankA.scoreBreakdown.stageProgressScore).toBe(15); // INTERVIEW = 15
      expect(rankA.scoreBreakdown.completenessScore).toBe(10); // Fully complete profile
    });
  });
});
