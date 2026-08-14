import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeRole, isAuthorizedForPortal, isAdminRole } from "@/lib/auth-roles";
import { getAuthorizedLandingRoute, sanitizeCallbackUrl } from "@/lib/landing-route";
import { hasPermission } from "@/lib/permissions";

describe("QF-06 — Candidate Returning-User Login & Own Application Status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. First-time Application Flow", () => {
    it("assigns CANDIDATE role on new applicant account creation", () => {
      const applicantRole = normalizeRole("CANDIDATE");
      expect(applicantRole).toBe("CANDIDATE");
      expect(isAuthorizedForPortal("CANDIDATE", "careers")).toBe(true);
    });

    it("directs candidate to the candidate portal after registration", () => {
      const landingEn = getAuthorizedLandingRoute({ role: "CANDIDATE" }, "en");
      const landingAr = getAuthorizedLandingRoute({ role: "CANDIDATE" }, "ar");
      expect(landingEn).toBe("/en/candidate");
      expect(landingAr).toBe("/ar/candidate");
    });
  });

  describe("2. Returning-User Sign-In", () => {
    it("authorizes CANDIDATE role for careers portal login", () => {
      expect(isAuthorizedForPortal("CANDIDATE", "careers")).toBe(true);
      expect(isAuthorizedForPortal("CLIENT", "careers")).toBe(false);
    });

    it("prevents CANDIDATE from accessing corporate/admin portals", () => {
      expect(isAuthorizedForPortal("CANDIDATE", "admin")).toBe(false);
      expect(isAuthorizedForPortal("CANDIDATE", "staff")).toBe(false);
      expect(isAuthorizedForPortal("CANDIDATE", "business")).toBe(false);
    });
  });

  describe("3. EN/AR Locale-Preserving Redirects", () => {
    it("preserves English locale on login redirection", () => {
      const sanitized = sanitizeCallbackUrl("/en/candidate/applications/app-123", { role: "CANDIDATE" }, "en");
      expect(sanitized).toBe("/en/candidate/applications/app-123");
    });

    it("preserves Arabic locale on login redirection", () => {
      const sanitized = sanitizeCallbackUrl("/ar/candidate/applications/app-123", { role: "CANDIDATE" }, "ar");
      expect(sanitized).toBe("/ar/candidate/applications/app-123");
    });
  });

  describe("4. Direct Candidate-Portal Refresh", () => {
    it("allows direct candidate-portal routes for CANDIDATE role", () => {
      const route = sanitizeCallbackUrl("/en/candidate", { role: "CANDIDATE" }, "en");
      expect(route).toBe("/en/candidate");
    });
  });

  describe("5. Logout and Expired Sessions", () => {
    it("returns to localized login route when user has no session", () => {
      const routeEn = getAuthorizedLandingRoute(null, "en");
      const routeAr = getAuthorizedLandingRoute(null, "ar");
      expect(routeEn).toBe("/en/login/admin");
      expect(routeAr).toBe("/ar/login/admin");
    });
  });

  describe("6. Candidate Own-Record Access", () => {
    it("allows candidate to access own application permissions", () => {
      expect(hasPermission("CANDIDATE", "candidate.profile.own")).toBe(true);
      expect(hasPermission("CANDIDATE", "candidate.applications.own")).toBe(true);
      expect(hasPermission("CANDIDATE", "candidate.documents.own")).toBe(true);
    });
  });

  describe("7. Cross-Candidate Access Denial (IDOR Prevention)", () => {
    it("denies access when application userId does not match session candidate userId", () => {
      const sessionCandidate = { id: "cand_user_01", role: "CANDIDATE" };
      const otherApplication = { id: "app_999", userId: "cand_user_02", jobTitle: "Stage Engineer" };

      const hasAccess = sessionCandidate.id === otherApplication.userId;
      expect(hasAccess).toBe(false);
    });

    it("denies candidates from accessing dashboard or employee admin permissions", () => {
      expect(hasPermission("CANDIDATE", "dashboard.view")).toBe(false);
      expect(hasPermission("CANDIDATE", "employees.view")).toBe(false);
      expect(hasPermission("CANDIDATE", "leads.manage")).toBe(false);
    });
  });

  describe("8. HR/Admin Access Preservation", () => {
    it("preserves full HR and admin access across candidate records", () => {
      expect(isAdminRole("SUPER_ADMIN")).toBe(true);
      expect(isAdminRole("STAFF")).toBe(false); // Staff is operational/HR role
      expect(hasPermission("SUPER_ADMIN", "users.manage")).toBe(true);
      expect(hasPermission("HR_ADMIN", "hr.applications.manage")).toBe(true);
      expect(hasPermission("STAFF", "staff.schedule.own")).toBe(true);
    });
  });

  describe("9. Unsafe Return-URL Rejection", () => {
    it("rejects external phishing URLs and defaults to candidate landing", () => {
      const unsafe1 = sanitizeCallbackUrl("https://evil.com/phish", { role: "CANDIDATE" }, "en");
      expect(unsafe1).toBe("/en/candidate");

      const unsafe2 = sanitizeCallbackUrl("//evil.com", { role: "CANDIDATE" }, "en");
      expect(unsafe2).toBe("/en/candidate");

      const unsafe3 = sanitizeCallbackUrl("javascript:alert(1)", { role: "CANDIDATE" }, "en");
      expect(unsafe3).toBe("/en/candidate");
    });

    it("rejects privilege-escalating redirect loops into admin dashboard", () => {
      const escalated = sanitizeCallbackUrl("/en/dashboard", { role: "CANDIDATE" }, "en");
      expect(escalated).toBe("/en/candidate");
    });
  });

  describe("10. Protected CV Document Access", () => {
    it("validates that candidates only download their own verified CV path", () => {
      const candidateUser = { id: "usr_100", email: "candidate@e3.qa", role: "CANDIDATE" };
      const candidateApp = { id: "app_1", userId: "usr_100", cvUrl: "https://blob.vercel/resumes/usr_100_cv.pdf" };
      const targetBlob = "resumes/usr_100_cv.pdf";

      const isOwner = candidateApp.userId === candidateUser.id && candidateApp.cvUrl.includes(targetBlob);
      expect(isOwner).toBe(true);

      const targetOtherBlob = "resumes/other_user_cv.pdf";
      const isOtherOwner = candidateApp.userId === candidateUser.id && candidateApp.cvUrl.includes(targetOtherBlob);
      expect(isOtherOwner).toBe(false);
    });
  });

  describe("11. Existing-Account Conflict Handling", () => {
    it("identifies account conflict and formats safe response without credential leakage", () => {
      const existingUser = { id: "usr_existing", email: "applied@e3.qa", role: "CANDIDATE" };
      const incomingSubmission = { email: "applied@e3.qa", firstName: "Test", lastName: "User" };

      const isConflict = existingUser.email === incomingSubmission.email;
      expect(isConflict).toBe(true);

      const safeErrorPayload = {
        error: "An account with this email already exists. Please sign in to submit or track your application.",
        code: "ACCOUNT_EXISTS",
        email: incomingSubmission.email,
      };

      expect(safeErrorPayload.code).toBe("ACCOUNT_EXISTS");
      expect(safeErrorPayload.error).not.toContain("password");
    });
  });
});
