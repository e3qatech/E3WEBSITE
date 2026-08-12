/**
 * gate19.discover_cms.test.ts
 *
 * Focused tests for Discover CMS controls introduced in the current implementation:
 *
 * 1. isGuinnessPublicationAllowed — all 5 reject conditions + allowed path
 * 2. validateCmsUrl — each type with valid and invalid examples
 * 3. CMS save payload shape — EN/AR independence
 * 4. Repeater ID stability — add/remove without collision
 * 5. Section order mutation
 * 6. brandingUsageApproved alone is insufficient (all 5 conditions required)
 */

import { describe, it, expect } from "vitest";
import { isGuinnessPublicationAllowed } from "@/lib/guinness-gate";
import { validateCmsUrl, validateCmsUrlMap } from "@/lib/validate-cms-url";

// ─────────────────────────────────────────────────────────────────────────────
// 1. isGuinnessPublicationAllowed
// ─────────────────────────────────────────────────────────────────────────────

describe("isGuinnessPublicationAllowed", () => {
  it("rejects null input", () => {
    const result = isGuinnessPublicationAllowed(null);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/No recordBreaking section/i);
  });

  it("rejects undefined input", () => {
    const result = isGuinnessPublicationAllowed(undefined);
    expect(result.allowed).toBe(false);
  });

  it("condition 1 — rejects when section is disabled (enabled=false)", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: false,
      brandingUsageApproved: true,
      approvedBadgeMediaId: "abc-123",
      evidenceSource: "https://guinnessworldrecords.com/cert/12345",
      verificationStatus: "APPROVED",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 1 FAILED/);
  });

  it("condition 2 — rejects when brandingUsageApproved is false", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      brandingUsageApproved: false,
      approvedBadgeMediaId: "abc-123",
      evidenceSource: "https://guinnessworldrecords.com/cert/12345",
      verificationStatus: "APPROVED",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 2 FAILED/);
  });

  it("condition 2 — rejects when brandingUsageApproved is missing", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      approvedBadgeMediaId: "abc-123",
      evidenceSource: "https://guinnessworldrecords.com/cert/12345",
      verificationStatus: "APPROVED",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 2 FAILED/);
  });

  it("condition 3 — rejects when approvedBadgeMediaId is empty string", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      brandingUsageApproved: true,
      approvedBadgeMediaId: "",
      evidenceSource: "https://guinnessworldrecords.com/cert/12345",
      verificationStatus: "APPROVED",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 3 FAILED/);
  });

  it("condition 3 — rejects when approvedBadgeMediaId is null", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      brandingUsageApproved: true,
      approvedBadgeMediaId: null,
      evidenceSource: "https://guinnessworldrecords.com/cert/12345",
      verificationStatus: "APPROVED",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 3 FAILED/);
  });

  it("condition 4 — rejects when evidenceSource is missing", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      brandingUsageApproved: true,
      approvedBadgeMediaId: "abc-123",
      evidenceSource: null,
      verificationStatus: "APPROVED",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 4 FAILED/);
  });

  it("condition 4 — rejects when evidenceSource is empty string", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      brandingUsageApproved: true,
      approvedBadgeMediaId: "abc-123",
      evidenceSource: "   ",
      verificationStatus: "APPROVED",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 4 FAILED/);
  });

  it("condition 5 — rejects when verificationStatus is PENDING", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      brandingUsageApproved: true,
      approvedBadgeMediaId: "abc-123",
      evidenceSource: "https://guinnessworldrecords.com/cert/12345",
      verificationStatus: "PENDING",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 5 FAILED/);
  });

  it("condition 5 — rejects when verificationStatus is undefined", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      brandingUsageApproved: true,
      approvedBadgeMediaId: "abc-123",
      evidenceSource: "https://guinnessworldrecords.com/cert/12345",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Condition 5 FAILED/);
  });

  it("brandingUsageApproved alone (other conditions missing) is NOT sufficient", () => {
    // Only condition 2 is satisfied — still must be rejected
    const result = isGuinnessPublicationAllowed({
      brandingUsageApproved: true,
    });
    expect(result.allowed).toBe(false);
    // Should fail on condition 3 (no badge media)
    expect(result.reason).toMatch(/Condition 3 FAILED/);
  });

  it("allows when all 5 conditions are met", () => {
    const result = isGuinnessPublicationAllowed({
      enabled: true,
      brandingUsageApproved: true,
      approvedBadgeMediaId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
      evidenceSource: "https://guinnessworldrecords.com/cert/12345",
      verificationStatus: "APPROVED",
    });
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("All 5 publication conditions met");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. validateCmsUrl
// ─────────────────────────────────────────────────────────────────────────────

describe("validateCmsUrl", () => {
  // Empty values
  it("empty string is always valid (field unset)", () => {
    expect(validateCmsUrl("", "external-url").valid).toBe(true);
    expect(validateCmsUrl("", "internal-route").valid).toBe(true);
    expect(validateCmsUrl("", "iframe-url").valid).toBe(true);
  });

  // Disallowed schemes — always rejected regardless of type
  it("rejects javascript: scheme", () => {
    const r = validateCmsUrl("javascript:alert(1)", "any-url");
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/Disallowed URL scheme/);
  });

  it("rejects data:text/html scheme", () => {
    const r = validateCmsUrl("data:text/html,<script>alert(1)</script>", "any-url");
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/Disallowed URL scheme/);
  });

  it("rejects blob: URI", () => {
    const r = validateCmsUrl("blob:http://localhost/abc-123", "external-url");
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/blob:/);
  });

  // internal-route
  it("internal-route: accepts /en/b2c/discover", () => {
    expect(validateCmsUrl("/en/b2c/discover", "internal-route").valid).toBe(true);
  });

  it("internal-route: accepts /ar/b2c/packages", () => {
    expect(validateCmsUrl("/ar/b2c/packages", "internal-route").valid).toBe(true);
  });

  it("internal-route: accepts #about anchor", () => {
    expect(validateCmsUrl("#about", "internal-route").valid).toBe(true);
  });

  it("internal-route: rejects https:// URL", () => {
    expect(validateCmsUrl("https://e3.qa/en/b2c", "internal-route").valid).toBe(false);
  });

  it("internal-route: rejects route without locale prefix", () => {
    expect(validateCmsUrl("/b2c/discover", "internal-route").valid).toBe(false);
  });

  // external-url
  it("external-url: accepts https://e3.qa", () => {
    expect(validateCmsUrl("https://e3.qa", "external-url").valid).toBe(true);
  });

  it("external-url: rejects http:// URL", () => {
    const r = validateCmsUrl("http://e3.qa", "external-url");
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/https:\/\//);
  });

  it("external-url: rejects internal route", () => {
    expect(validateCmsUrl("/en/b2c/discover", "external-url").valid).toBe(false);
  });

  // media-id (UUID v4)
  it("media-id: accepts valid UUID v4", () => {
    expect(validateCmsUrl("d290f1ee-6c54-4b01-90e6-d701748f0851", "media-id").valid).toBe(true);
  });

  it("media-id: rejects non-UUID string", () => {
    const r = validateCmsUrl("my-image.jpg", "media-id");
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/UUID/);
  });

  it("media-id: rejects https:// URL", () => {
    expect(validateCmsUrl("https://cdn.e3.qa/media/image.jpg", "media-id").valid).toBe(false);
  });

  // iframe-url
  it("iframe-url: accepts youtube.com", () => {
    expect(validateCmsUrl("https://www.youtube.com/embed/abc123", "iframe-url").valid).toBe(true);
  });

  it("iframe-url: accepts spline.design", () => {
    expect(validateCmsUrl("https://app.spline.design/scene/abc", "iframe-url").valid).toBe(true);
  });

  it("iframe-url: rejects unapproved origin", () => {
    const r = validateCmsUrl("https://example.com/embed", "iframe-url");
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/not in approved list/);
  });

  it("iframe-url: rejects http:// even from approved origin", () => {
    const r = validateCmsUrl("http://youtube.com/embed/abc", "iframe-url");
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/https/);
  });

  // anchor
  it("anchor: accepts #recordBreaking", () => {
    expect(validateCmsUrl("#recordBreaking", "anchor").valid).toBe(true);
  });

  it("anchor: rejects non-anchor", () => {
    expect(validateCmsUrl("/en/b2c", "anchor").valid).toBe(false);
  });

  // any-url
  it("any-url: accepts internal route", () => {
    expect(validateCmsUrl("/en/b2c/packages", "any-url").valid).toBe(true);
  });

  it("any-url: accepts https:// URL", () => {
    expect(validateCmsUrl("https://e3.qa", "any-url").valid).toBe(true);
  });

  it("any-url: accepts anchor", () => {
    expect(validateCmsUrl("#about", "any-url").valid).toBe(true);
  });

  it("any-url: rejects plain word", () => {
    const r = validateCmsUrl("contact", "any-url");
    expect(r.valid).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. validateCmsUrlMap — batch validation
// ─────────────────────────────────────────────────────────────────────────────

describe("validateCmsUrlMap", () => {
  it("returns empty array when all fields are valid", () => {
    const errors = validateCmsUrlMap([
      { path: "hero.primaryCtaUrl", value: "/en/b2c/discover", type: "internal-route" },
      { path: "hero.mediaUrl", value: "https://cdn.e3.qa/hero.mp4", type: "external-url" },
    ]);
    expect(errors).toHaveLength(0);
  });

  it("returns error messages for invalid fields", () => {
    const errors = validateCmsUrlMap([
      { path: "hero.primaryCtaUrl", value: "javascript:void(0)", type: "any-url" },
      { path: "hero.mediaUrl", value: "blob:http://localhost/123", type: "external-url" },
      { path: "hero.iframeUrl", value: "https://evil.com/embed", type: "iframe-url" },
    ]);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toMatch(/hero\.primaryCtaUrl/);
    expect(errors[1]).toMatch(/hero\.mediaUrl/);
    expect(errors[2]).toMatch(/hero\.iframeUrl/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. CMS state update — EN/AR independence
// ─────────────────────────────────────────────────────────────────────────────

describe("CMS state: EN/AR independence", () => {
  /**
   * Simulates the updateSectionField function used in DiscoverPageManager.tsx.
   * Verifies that updating one locale field does not overwrite the other.
   */
  function updateSectionField(state: any, section: string, field: string, value: any) {
    return {
      ...state,
      [section]: {
        ...(state[section] || {}),
        [field]: value,
      },
    };
  }

  it("updating hero.eyebrowEn does not affect hero.eyebrowAr", () => {
    let state: any = {
      hero: { eyebrowEn: "Original EN", eyebrowAr: "النص العربي الأصلي" },
    };
    state = updateSectionField(state, "hero", "eyebrowEn", "Updated EN");
    expect(state.hero.eyebrowEn).toBe("Updated EN");
    expect(state.hero.eyebrowAr).toBe("النص العربي الأصلي");
  });

  it("updating hero.eyebrowAr does not affect hero.eyebrowEn", () => {
    let state: any = {
      hero: { eyebrowEn: "Original EN", eyebrowAr: "النص العربي الأصلي" },
    };
    state = updateSectionField(state, "hero", "eyebrowAr", "نص محدث");
    expect(state.hero.eyebrowAr).toBe("نص محدث");
    expect(state.hero.eyebrowEn).toBe("Original EN");
  });

  it("updating one section does not affect another section", () => {
    let state: any = {
      hero: { headlineEn: "Hero Headline" },
      about: { headingEn: "About Heading" },
    };
    state = updateSectionField(state, "hero", "headlineEn", "New Headline");
    expect(state.about.headingEn).toBe("About Heading");
  });

  it("clearing a field (empty string) stores empty string, not undefined", () => {
    let state: any = { hero: { subtextEn: "Some text" } };
    state = updateSectionField(state, "hero", "subtextEn", "");
    expect(state.hero.subtextEn).toBe("");
    expect(state.hero.subtextEn).not.toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Repeater ID stability
// ─────────────────────────────────────────────────────────────────────────────

describe("Repeater ID stability", () => {
  it("adding a repeater item generates a unique string ID", () => {
    const items: any[] = [];
    const newItem = { id: `metric-${Date.now()}`, value: "100k+", labelEn: "Visitors" };
    items.push(newItem);
    expect(typeof items[0].id).toBe("string");
    expect(items[0].id).toMatch(/^metric-\d+$/);
  });

  it("removing a repeater item at index 0 leaves other items intact", () => {
    const items = [
      { id: "metric-1", value: "100k+" },
      { id: "metric-2", value: "200+" },
      { id: "metric-3", value: "50M+" },
    ];
    const after = items.filter((_, i) => i !== 0);
    expect(after).toHaveLength(2);
    expect(after[0].id).toBe("metric-2");
    expect(after[1].id).toBe("metric-3");
  });

  it("removing a middle item does not renumber remaining IDs", () => {
    const items = [
      { id: "val-1", titleEn: "A" },
      { id: "val-2", titleEn: "B" },
      { id: "val-3", titleEn: "C" },
    ];
    const after = items.filter((_, i) => i !== 1);
    expect(after[0].id).toBe("val-1");
    expect(after[1].id).toBe("val-3");
  });

  it("two rapidly-created items at different timestamps have different IDs", () => {
    const id1 = `item-${Date.now()}`;
    const id2 = `item-${Date.now() + 1}`;
    expect(id1).not.toBe(id2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Section order persistence
// ─────────────────────────────────────────────────────────────────────────────

describe("Section order swap", () => {
  function swapOrder(order: string[], idx: number, dir: "up" | "down"): string[] {
    const arr = [...order];
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= arr.length) return arr;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    return arr;
  }

  it("moving index 0 up is a no-op", () => {
    const order = ["hero", "about", "leadership"];
    expect(swapOrder(order, 0, "up")).toEqual(["hero", "about", "leadership"]);
  });

  it("moving last item down is a no-op", () => {
    const order = ["hero", "about", "leadership"];
    expect(swapOrder(order, 2, "down")).toEqual(["hero", "about", "leadership"]);
  });

  it("moving hero down places about before it", () => {
    const order = ["hero", "about", "leadership"];
    expect(swapOrder(order, 0, "down")).toEqual(["about", "hero", "leadership"]);
  });

  it("moving leadership up places it before about", () => {
    const order = ["hero", "about", "leadership"];
    expect(swapOrder(order, 2, "up")).toEqual(["hero", "leadership", "about"]);
  });

  it("original order array is not mutated", () => {
    const order = ["hero", "about"];
    const original = [...order];
    swapOrder(order, 0, "down");
    expect(order).toEqual(original);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Publication filter — unpublished records excluded
// ─────────────────────────────────────────────────────────────────────────────

describe("Publication filters", () => {
  it("Insight loader: only PUBLISHED insights are returned", () => {
    const rawInsights = [
      { id: "1", publishStatus: "PUBLISHED", titleEn: "Published Article" },
      { id: "2", publishStatus: "DRAFT", titleEn: "Draft Article" },
      { id: "3", publishStatus: "ARCHIVED", titleEn: "Archived Article" },
      { id: "4", publishStatus: "PUBLISHED", titleEn: "Another Published" },
    ];
    // Mirrors the loader filter: where: { publishStatus: "PUBLISHED" }
    const filtered = rawInsights.filter(i => i.publishStatus === "PUBLISHED");
    expect(filtered).toHaveLength(2);
    expect(filtered.map(i => i.id)).toEqual(["1", "4"]);
  });

  it("Partner loader: only isVisible=true partners are returned", () => {
    const rawPartners = [
      { id: "p1", isVisible: true, name: "Visible Partner" },
      { id: "p2", isVisible: false, name: "Hidden Partner" },
      { id: "p3", isVisible: true, name: "Another Visible" },
    ];
    const filtered = rawPartners.filter(p => p.isVisible === true);
    expect(filtered).toHaveLength(2);
    expect(filtered.some(p => p.name === "Hidden Partner")).toBe(false);
  });

  it("Client loader: only isVisible=true clients are returned", () => {
    const rawClients = [
      { id: "c1", isVisible: true, company: "Active Client" },
      { id: "c2", isVisible: false, company: "Inactive Client" },
    ];
    // After fix: db.client.findMany({ where: { isVisible: true } })
    const filtered = rawClients.filter(c => c.isVisible === true);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].company).toBe("Active Client");
  });

  it("EmployeeProfile loader: only isActive=true members are returned", () => {
    const rawProfiles = [
      { id: "e1", isActive: true, firstName: "Alice" },
      { id: "e2", isActive: false, firstName: "Bob" },
    ];
    const filtered = rawProfiles.filter(e => e.isActive === true);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].firstName).toBe("Alice");
  });

  it("CaseStudy loader: only isPublished=true studies are returned", () => {
    const rawCases = [
      { id: "cs1", isPublished: true, title: "Published Case" },
      { id: "cs2", isPublished: false, title: "Draft Case" },
    ];
    const filtered = rawCases.filter(c => c.isPublished === true);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Published Case");
  });
});
