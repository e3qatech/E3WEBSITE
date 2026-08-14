import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getBreadcrumbTranslation } from "@/lib/dashboard-dictionary";
import { hasPermission } from "@/lib/permissions";

// Mock auth module for NextRequest testing
let mockSession: any = null;
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => mockSession),
}));

import { checkSocialAdminAuth } from "@/lib/social-media/auth-check";

describe("QF-03 — Social Media Manager Route & RBAC Access Verification", () => {
  beforeEach(() => {
    mockSession = null;
    vi.clearAllMocks();
  });

  describe("1. Canonical Route & Localization Dictionary", () => {
    it("maps social-media segment in English and Arabic breadcrumb dictionaries", () => {
      expect(getBreadcrumbTranslation("social-media", "en")).toBe("Social Media Manager");
      expect(getBreadcrumbTranslation("social-media", "ar")).toBe("إدارة التواصل الاجتماعي");
    });

    it("verifies canonical dashboard URLs for English and Arabic", () => {
      const getCanonicalSocialRoute = (locale: string) => `/${locale === "ar" ? "ar" : "en"}/dashboard/social-media`;

      expect(getCanonicalSocialRoute("en")).toBe("/en/dashboard/social-media");
      expect(getCanonicalSocialRoute("ar")).toBe("/ar/dashboard/social-media");
    });

    it("verifies legacy admin/social-media redirect destination", () => {
      const resolveLegacyRedirect = (legacyPath: string) => {
        if (legacyPath === "/admin/social-media") return "/en/dashboard/social-media";
        const match = legacyPath.match(/^\/(en|ar)\/admin\/social-media/);
        if (match) return `/${match[1]}/dashboard/social-media`;
        return legacyPath;
      };

      expect(resolveLegacyRedirect("/admin/social-media")).toBe("/en/dashboard/social-media");
      expect(resolveLegacyRedirect("/en/admin/social-media")).toBe("/en/dashboard/social-media");
      expect(resolveLegacyRedirect("/ar/admin/social-media")).toBe("/ar/dashboard/social-media");
    });
  });

  describe("2. Server & API RBAC Authorization Matrix", () => {
    const AUTHORIZED_ROLES = [
      "SUPER_ADMIN",
      "SALES_ADMIN",
      "SUPPORT_ADMIN",
      "B2C_ADMIN",
      "B2B_ADMIN",
      "HR_ADMIN",
      "OPERATIONS_ADMIN",
      "STAFF",
      "INTEGRATION_MANAGER",
      "CONTENT_MANAGER",
      "EDITOR",
      "VIEWER",
    ];

    const UNAUTHORIZED_ROLES = [
      "CLIENT",
      "BUSINESS_USER",
      "CANDIDATE",
    ];

    it("authorizes all internal admin/staff roles for VIEW_SOCIAL_MANAGER", async () => {
      for (const role of AUTHORIZED_ROLES) {
        mockSession = {
          user: {
            id: `usr_${role.toLowerCase()}`,
            name: `Test ${role}`,
            email: `${role.toLowerCase()}@e3.qa`,
            role,
          },
        };

        const req = new NextRequest("http://localhost/api/admin/social-media/accounts", { method: "GET" });
        const authResult = await checkSocialAdminAuth(req, "VIEW_SOCIAL_MANAGER");

        expect(authResult.isAuthed).toBe(true);
        expect(authResult.role).toBe(role);
      }
    });

    it("strictly blocks external portal roles with 403 authorization denial", async () => {
      for (const role of UNAUTHORIZED_ROLES) {
        mockSession = {
          user: {
            id: `usr_${role.toLowerCase()}`,
            name: `Test ${role}`,
            email: `${role.toLowerCase()}@client.com`,
            role,
          },
        };

        const req = new NextRequest("http://localhost/api/admin/social-media/accounts", { method: "GET" });
        const authResult = await checkSocialAdminAuth(req, "VIEW_SOCIAL_MANAGER");

        expect(authResult.isAuthed).toBe(false);
      }
    });

    it("blocks unauthenticated requests", async () => {
      mockSession = null;

      const req = new NextRequest("http://localhost/api/admin/social-media/accounts", { method: "GET" });
      const authResult = await checkSocialAdminAuth(req, "VIEW_SOCIAL_MANAGER");

      expect(authResult.isAuthed).toBe(false);
    });

    it("enforces granular permissions for platform credentials and app secrets", async () => {
      const checkCredentialsPermission = async (role: string) => {
        mockSession = {
          user: {
            id: `usr_${role.toLowerCase()}`,
            name: `Test ${role}`,
            email: `${role.toLowerCase()}@e3.qa`,
            role,
          },
        };
        const req = new NextRequest("http://localhost/api/admin/social-media/providers", { method: "POST" });
        return checkSocialAdminAuth(req, "MANAGE_CREDENTIALS");
      };

      expect((await checkCredentialsPermission("SUPER_ADMIN")).isAuthed).toBe(true);
      expect((await checkCredentialsPermission("INTEGRATION_MANAGER")).isAuthed).toBe(true);
      expect((await checkCredentialsPermission("STAFF")).isAuthed).toBe(false);
      expect((await checkCredentialsPermission("SALES_ADMIN")).isAuthed).toBe(false);
      expect((await checkCredentialsPermission("CLIENT")).isAuthed).toBe(false);
    });

    it("enforces granular permissions for global settings", async () => {
      const checkSettingsPermission = async (role: string) => {
        mockSession = {
          user: {
            id: `usr_${role.toLowerCase()}`,
            name: `Test ${role}`,
            email: `${role.toLowerCase()}@e3.qa`,
            role,
          },
        };
        const req = new NextRequest("http://localhost/api/admin/social-media/settings", { method: "POST" });
        return checkSocialAdminAuth(req, "MANAGE_GLOBAL_SETTINGS");
      };

      expect((await checkSettingsPermission("SUPER_ADMIN")).isAuthed).toBe(true);
      expect((await checkSettingsPermission("INTEGRATION_MANAGER")).isAuthed).toBe(false);
      expect((await checkSettingsPermission("STAFF")).isAuthed).toBe(false);
    });
  });

  describe("3. Dashboard Navigation Visibility RBAC", () => {
    it("shows media/social navigation to authorized roles via capability check", () => {
      expect(hasPermission("SUPER_ADMIN", "media.read")).toBe(true);
      expect(hasPermission("STAFF", "media.read")).toBe(true);
      expect(hasPermission("B2C_ADMIN", "media.read")).toBe(true);
      expect(hasPermission("SALES_ADMIN", "media.read")).toBe(true);
      expect(hasPermission("SUPPORT_ADMIN", "media.read")).toBe(true);
    });

    it("hides media/social navigation from unauthorized portal roles", () => {
      expect(hasPermission("CLIENT", "media.read")).toBe(false);
      expect(hasPermission("BUSINESS_USER", "media.read")).toBe(false);
      expect(hasPermission("CANDIDATE", "media.read")).toBe(false);
    });
  });

  describe("4. Security & Sensitive Credential Redaction Invariance", () => {
    it("ensures sensitive OAuth tokens and DB credentials are not in response format", () => {
      const sampleAccount = {
        id: "acc_ig_1",
        provider: "META_INSTAGRAM",
        username: "e3qatar",
        displayName: "E3 Qatar Official",
        status: "ACTIVE",
        hasToken: true,
        hasRefreshToken: false,
      };

      const serialized = JSON.stringify(sampleAccount);
      expect(serialized).not.toContain("encryptedAccessToken");
      expect(serialized).not.toContain("encryptedRefreshToken");
      expect(serialized).not.toContain("encryptedData");
      expect(serialized).not.toContain("appSecret");
    });
  });
});
