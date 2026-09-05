import { describe, it, expect } from "vitest";
import { hasPermission, rolePermissions, type Role } from "@/lib/permissions";
import { isAuthorizedForPortal, normalizeRole, isAdminRole } from "@/lib/auth-roles";

describe("B2B and B2C Admin Dashboard Access & Control Matrix", () => {
  // =========================================================================
  // 1. B2B_ADMIN DOMAIN CAPABILITIES & CROSS-DOMAIN ISOLATION
  // =========================================================================
  describe("1. B2B_ADMIN Domain Access & Isolation", () => {
    it("grants full operational capabilities across B2B enterprise modules", () => {
      expect(hasPermission("B2B_ADMIN", "b2b.content.read")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "b2b.content.write")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "b2b.content.publish")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "b2b.services.manage")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "b2b.cases.manage")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "b2b.clients.manage")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "b2b.rfp.manage")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "b2b.faqs.manage")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "b2b.feedback.manage")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "crm.leads.manage")).toBe(true);
      expect(hasPermission("B2B_ADMIN", "crm.clients.manage")).toBe(true);
    });

    it("strictly isolates B2B_ADMIN from B2C entertainment and attractions management", () => {
      expect(hasPermission("B2B_ADMIN", "b2c.attractions.manage")).toBe(false);
      expect(hasPermission("B2B_ADMIN", "b2c.packages.manage")).toBe(false);
      expect(hasPermission("B2B_ADMIN", "b2c.calendar.manage")).toBe(false);
      expect(hasPermission("B2B_ADMIN", "manage:attractions")).toBe(false);
      expect(hasPermission("B2B_ADMIN", "manage:tickets")).toBe(false);
    });

    it("prevents B2B_ADMIN from mutating system RBAC or global settings", () => {
      expect(hasPermission("B2B_ADMIN", "rbac.manage")).toBe(false);
      expect(hasPermission("B2B_ADMIN", "settings.general.manage")).toBe(false);
      expect(hasPermission("B2B_ADMIN", "hr.jobs.manage")).toBe(false);
    });
  });

  // =========================================================================
  // 2. B2C_ADMIN DOMAIN CAPABILITIES & CROSS-DOMAIN ISOLATION
  // =========================================================================
  describe("2. B2C_ADMIN Domain Access & Isolation", () => {
    it("grants full operational capabilities across B2C attractions & entertainment modules", () => {
      expect(hasPermission("B2C_ADMIN", "b2c.content.read")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "b2c.content.write")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "b2c.content.publish")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "b2c.attractions.manage")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "b2c.packages.manage")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "b2c.packages.read")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "b2c.calendar.manage")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "b2c.feedback.manage")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "b2c.inquiries.manage")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "crm.leads.manage")).toBe(true);
    });

    it("strictly isolates B2C_ADMIN from B2B corporate engineering and case study management", () => {
      expect(hasPermission("B2C_ADMIN", "b2b.services.manage")).toBe(false);
      expect(hasPermission("B2C_ADMIN", "b2b.cases.manage")).toBe(false);
      expect(hasPermission("B2C_ADMIN", "b2b.clients.manage")).toBe(false);
      expect(hasPermission("B2C_ADMIN", "b2b.rfp.manage")).toBe(false);
      expect(hasPermission("B2C_ADMIN", "b2b.faqs.manage")).toBe(false);
      expect(hasPermission("B2C_ADMIN", "manage:clients")).toBe(false);
    });

    it("prevents B2C_ADMIN from mutating system RBAC or global settings", () => {
      expect(hasPermission("B2C_ADMIN", "rbac.manage")).toBe(false);
      expect(hasPermission("B2C_ADMIN", "settings.general.manage")).toBe(false);
      expect(hasPermission("B2C_ADMIN", "hr.jobs.manage")).toBe(false);
    });
  });

  // =========================================================================
  // 3. SUPER_ADMIN CROSS-DOMAIN GOVERNANCE
  // =========================================================================
  describe("3. SUPER_ADMIN Cross-Domain Governance", () => {
    it("holds wildcard permissions across both B2B and B2C operational modules", () => {
      expect(hasPermission("SUPER_ADMIN", "b2b.content.read")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "b2b.services.manage")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "b2b.cases.manage")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "b2c.content.read")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "b2c.attractions.manage")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "b2c.packages.manage")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "rbac.manage")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "settings.general.manage")).toBe(true);
    });

    it("identifies as an administrative role across all checks", () => {
      expect(isAdminRole("SUPER_ADMIN")).toBe(true);
      expect(isAdminRole("B2B_ADMIN")).toBe(true);
      expect(isAdminRole("B2C_ADMIN")).toBe(true);
      expect(isAuthorizedForPortal("SUPER_ADMIN", "admin")).toBe(true);
      expect(isAuthorizedForPortal("B2B_ADMIN", "admin")).toBe(true);
      expect(isAuthorizedForPortal("B2C_ADMIN", "admin")).toBe(true);
    });
  });

  // =========================================================================
  // 4. UNAUTHORIZED / NON-ADMIN ROLES DENIED
  // =========================================================================
  describe("4. Non-Admin Roles Prohibited from Both Domains", () => {
    const nonAdminRoles: Role[] = ["CLIENT", "CANDIDATE", "BUSINESS_USER"];

    nonAdminRoles.forEach((role) => {
      it(`denies ${role} from all B2B and B2C admin management capabilities`, () => {
        expect(hasPermission(role, "b2b.content.read")).toBe(false);
        expect(hasPermission(role, "b2b.services.manage")).toBe(false);
        expect(hasPermission(role, "b2c.content.read")).toBe(false);
        expect(hasPermission(role, "b2c.attractions.manage")).toBe(false);
        expect(isAuthorizedForPortal(role, "admin")).toBe(false);
      });
    });
  });

  // =========================================================================
  // 5. CANONICAL ROLE NORMALIZATION
  // =========================================================================
  describe("5. Role Normalization and Portal Access Mapping", () => {
    it("normalizes B2B_ADMIN and B2C_ADMIN to valid Prisma RoleTypes while preserving specialized capabilities", () => {
      expect(normalizeRole("B2B_ADMIN")).toBe("SALES_ADMIN");
      expect(normalizeRole("B2C_ADMIN")).toBe("SUPPORT_ADMIN");
      expect(normalizeRole("SUPER_ADMIN")).toBe("SUPER_ADMIN");
    });

    it("correctly identifies admin portal access for mapped roles", () => {
      expect(isAuthorizedForPortal("SALES_ADMIN", "admin")).toBe(true);
      expect(isAuthorizedForPortal("SUPPORT_ADMIN", "admin")).toBe(true);
      expect(isAuthorizedForPortal("EVENTS_ADMIN", "admin")).toBe(true);
    });
  });
});
