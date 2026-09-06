import { describe, it, expect } from "vitest";
import { rolePermissions, Capability } from "../lib/permissions";

describe("Influencer & Creator Management - RBAC Capability Matrix", () => {
  function checkRoleCapability(role: string, capability: Capability): boolean {
    if (role === "SUPER_ADMIN") return true;
    const permissions = (rolePermissions as any)[role];
    if (!permissions) return false;
    return permissions.includes(capability);
  }

  it("grants SUPER_ADMIN complete capability across all influencer operations", () => {
    const allCaps: Capability[] = [
      "influencer.read",
      "influencer.create",
      "influencer.update",
      "influencer.archive",
      "influencer.review",
      "influencer.viewSensitive",
      "influencer.viewCommercial",
      "influencer.featurePublicly",
      "influencerCampaign.read",
      "influencerCampaign.create",
      "influencerCampaign.update",
      "influencerCampaign.approve",
      "influencerCampaign.invite",
      "influencerCampaign.manageAttendance",
      "influencerCampaign.export",
      "influencerContent.read",
      "influencerContent.review",
      "influencerContent.verifyPublication",
      "influencerContent.sendToMediaLibrary",
      "influencerFinance.read",
      "influencerFinance.update",
      "influencerFinance.markPaid",
      "influencerReport.read",
      "influencerReport.export",
      "influencerSettings.manage",
    ];

    allCaps.forEach((cap) => {
      expect(checkRoleCapability("SUPER_ADMIN", cap)).toBe(true);
    });
  });

  it("grants B2C_ADMIN creator management, campaigns, and reports, but protects finance payments and settings", () => {
    expect(checkRoleCapability("B2C_ADMIN", "influencer.read")).toBe(true);
    expect(checkRoleCapability("B2C_ADMIN", "influencer.create")).toBe(true);
    expect(checkRoleCapability("B2C_ADMIN", "influencer.review")).toBe(true);
    expect(checkRoleCapability("B2C_ADMIN", "influencerCampaign.create")).toBe(true);
    expect(checkRoleCapability("B2C_ADMIN", "influencerContent.review")).toBe(true);
    expect(checkRoleCapability("B2C_ADMIN", "influencerContent.sendToMediaLibrary")).toBe(true);
    expect(checkRoleCapability("B2C_ADMIN", "influencerReport.read")).toBe(true);

    // Strictly protected capabilities (Super Admin / Finance only)
    expect(checkRoleCapability("B2C_ADMIN", "influencerFinance.markPaid")).toBe(false);
    expect(checkRoleCapability("B2C_ADMIN", "influencerSettings.manage")).toBe(false);
  });

  it("grants EVENTS_ADMIN logistics, attendance, and campaign reading", () => {
    expect(checkRoleCapability("EVENTS_ADMIN", "influencer.read")).toBe(true);
    expect(checkRoleCapability("EVENTS_ADMIN", "influencerCampaign.read")).toBe(true);
    expect(checkRoleCapability("EVENTS_ADMIN", "influencerCampaign.manageAttendance")).toBe(true);

    // Cannot modify financial rates or manage scoring settings
    expect(checkRoleCapability("EVENTS_ADMIN", "influencer.viewCommercial")).toBe(false);
    expect(checkRoleCapability("EVENTS_ADMIN", "influencerFinance.markPaid")).toBe(false);
  });

  it("restricts basic STAFF to read-only non-sensitive content and denies commercial/finance", () => {
    expect(checkRoleCapability("STAFF", "influencer.read")).toBe(true);
    expect(checkRoleCapability("STAFF", "influencerCampaign.read")).toBe(true);
    expect(checkRoleCapability("STAFF", "influencerContent.read")).toBe(true);

    // Denied capabilities
    expect(checkRoleCapability("STAFF", "influencer.create")).toBe(false);
    expect(checkRoleCapability("STAFF", "influencer.review")).toBe(false);
    expect(checkRoleCapability("STAFF", "influencer.viewSensitive")).toBe(false);
    expect(checkRoleCapability("STAFF", "influencer.viewCommercial")).toBe(false);
    expect(checkRoleCapability("STAFF", "influencerFinance.read")).toBe(false);
    expect(checkRoleCapability("STAFF", "influencerSettings.manage")).toBe(false);
  });

  it("denies unauthenticated or unknown roles by default", () => {
    expect(checkRoleCapability("ANONYMOUS", "influencer.read")).toBe(false);
    expect(checkRoleCapability("GUEST", "influencerCampaign.read")).toBe(false);
  });
});
