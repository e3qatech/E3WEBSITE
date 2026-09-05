import { describe, it, expect } from "vitest";
import { isAuthorizedForPortal, allowedRolesForPortal, isAdminRole, normalizeRole } from "@/lib/auth-roles";
import { resolveServerLandingDestination, getAuthorizedLandingRoute, sanitizeCallbackUrl } from "@/lib/landing-route";

describe("HR Authentication, Command Center & Login Details Test Suite", () => {
  describe("1. HR_ADMIN and HR Portal Authorization", () => {
    it("authorizes HR_ADMIN for the admin portal", () => {
      expect(isAuthorizedForPortal("HR_ADMIN", "admin")).toBe(true);
      expect(isAuthorizedForPortal("hr_admin", "admin")).toBe(true);
    });

    it("authorizes HR role alias for the admin portal", () => {
      expect(isAuthorizedForPortal("HR", "admin")).toBe(true);
      expect(isAuthorizedForPortal("hr", "admin")).toBe(true);
    });

    it("includes HR_ADMIN and HR in allowedRolesForPortal('admin')", () => {
      const allowed = allowedRolesForPortal("admin");
      expect(allowed).toContain("HR_ADMIN");
      expect(allowed).toContain("HR");
      expect(allowed).toContain("SUPER_ADMIN");
    });

    it("confirms isAdminRole recognizes HR_ADMIN and HR", () => {
      expect(isAdminRole("HR_ADMIN")).toBe(true);
      expect(isAdminRole("HR")).toBe(true);
    });
  });

  describe("2. Server Landing Destination Resolution for HR Accounts", () => {
    const hrUser = {
      id: "usr-hr-test",
      role: "HR_ADMIN",
      isActive: true,
      sessionVersion: 1,
    };

    it("routes HR_ADMIN on admin portal to /dashboard/team when workspace=hr", () => {
      const res = resolveServerLandingDestination({
        user: hrUser,
        portal: "admin",
        workspace: "hr",
        locale: "en",
      });
      expect(res.authorized).toBe(true);
      expect(res.destination).toBe("/en/dashboard/team");
    });

    it("gracefully routes HR_ADMIN to /dashboard/team even if workspace=super is passed", () => {
      // The user screenshot showed hr@eeeqa.com logging in with Super Admin workspace selected
      const res = resolveServerLandingDestination({
        user: hrUser,
        portal: "admin",
        workspace: "super",
        locale: "en",
      });
      expect(res.authorized).toBe(true);
      expect(res.destination).toBe("/en/dashboard/team");
    });

    it("routes Arabic locale HR_ADMIN to /ar/dashboard/team", () => {
      const res = resolveServerLandingDestination({
        user: hrUser,
        portal: "admin",
        workspace: "hr",
        locale: "ar",
      });
      expect(res.authorized).toBe(true);
      expect(res.destination).toBe("/ar/dashboard/team");
    });

    it("allows HR_ADMIN callback URLs inside /dashboard", () => {
      const sanitized = sanitizeCallbackUrl("/en/dashboard/careers/applications", hrUser, "en");
      expect(sanitized).toBe("/en/dashboard/careers/applications");
    });
  });

  describe("3. SUPER_ADMIN Workspace Navigation", () => {
    const superAdminUser = {
      id: "usr-super-test",
      role: "SUPER_ADMIN",
      isActive: true,
      sessionVersion: 1,
    };

    it("routes SUPER_ADMIN with workspace=hr to /en/dashboard/team", () => {
      const res = resolveServerLandingDestination({
        user: superAdminUser,
        portal: "admin",
        workspace: "hr",
        locale: "en",
      });
      expect(res.authorized).toBe(true);
      expect(res.destination).toBe("/en/dashboard/team");
    });

    it("routes SUPER_ADMIN with workspace=b2b to /en/dashboard/b2b", () => {
      const res = resolveServerLandingDestination({
        user: superAdminUser,
        portal: "admin",
        workspace: "b2b",
        locale: "en",
      });
      expect(res.authorized).toBe(true);
      expect(res.destination).toBe("/en/dashboard/b2b");
    });

    it("routes SUPER_ADMIN with workspace=super to /en/dashboard", () => {
      const res = resolveServerLandingDestination({
        user: superAdminUser,
        portal: "admin",
        workspace: "super",
        locale: "en",
      });
      expect(res.authorized).toBe(true);
      expect(res.destination).toBe("/en/dashboard");
    });
  });

  describe("4. Canonical Landing Route per Role", () => {
    it("returns /en/dashboard/team for HR_ADMIN", () => {
      expect(getAuthorizedLandingRoute({ role: "HR_ADMIN" }, "en")).toBe("/en/dashboard/team");
    });

    it("returns /en/dashboard/team for HR alias", () => {
      expect(getAuthorizedLandingRoute({ role: "HR" }, "en")).toBe("/en/dashboard/team");
    });

    it("returns /en/dashboard for SUPER_ADMIN", () => {
      expect(getAuthorizedLandingRoute({ role: "SUPER_ADMIN" }, "en")).toBe("/en/dashboard");
    });

    it("returns /en/dashboard/b2b for SALES_ADMIN", () => {
      expect(getAuthorizedLandingRoute({ role: "SALES_ADMIN" }, "en")).toBe("/en/dashboard/b2b");
    });
  });
});
