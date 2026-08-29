import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "fs";
import path from "path";
import {
  isApprovedClaim,
  CANONICAL_SERVICE_SLUGS,
  resolveCanonicalSlug,
  INITIAL_SERVICE_TEMPLATES,
  StructuredClaim,
  ServiceSpecificModuleConfig,
} from "@/lib/services/canonical-services";
import { ServiceEnterpriseReadiness } from "@/components/b2b/services/ServiceEnterpriseReadiness";
import { ServiceSpecificModule } from "@/components/b2b/services/ServiceSpecificModule";

describe("1. Strict Claim Governance & Public Rendering Filter", () => {
  it("approves only claims with status === 'APPROVED' and valid evidence", () => {
    const validClaim: StructuredClaim = {
      id: "c1",
      titleEn: "Valid Claim",
      titleAr: "اعتماد صالح",
      status: "APPROVED",
      evidence: "E3 Verification Dossier 2026",
    };
    expect(isApprovedClaim(validClaim)).toBe(true);
  });

  it("rejects DRAFT, VERIFIED, and EXPIRED claims", () => {
    expect(isApprovedClaim({ id: "1", status: "DRAFT", evidence: "Ref 1" })).toBe(false);
    expect(isApprovedClaim({ id: "2", status: "VERIFIED", evidence: "Ref 2" })).toBe(false);
    expect(isApprovedClaim({ id: "3", status: "EXPIRED", evidence: "Ref 3" })).toBe(false);
  });

  it("rejects claims missing evidence or with whitespace-only evidence", () => {
    expect(isApprovedClaim({ id: "4", status: "APPROVED", evidence: "" })).toBe(false);
    expect(isApprovedClaim({ id: "5", status: "APPROVED", evidence: "   " })).toBe(false);
    expect(isApprovedClaim({ id: "6", status: "APPROVED" })).toBe(false);
  });

  it("rejects claims with past expiry dates", () => {
    const expiredClaim: StructuredClaim = {
      id: "7",
      titleEn: "Expired Certification",
      titleAr: "شهادة منتهية",
      status: "APPROVED",
      evidence: "Dossier 2020",
      expiryDate: "2020-01-01T00:00:00Z",
    };
    expect(isApprovedClaim(expiredClaim)).toBe(false);
  });

  it("suppresses ServiceEnterpriseReadiness entirely when no approved claims exist", () => {
    const unapprovedClaims: any[] = [
      { id: "1", titleEn: "Draft Claim", status: "DRAFT", evidence: "Ref" },
      { id: "2", titleEn: "Expired Claim", status: "APPROVED", evidence: "Ref", expiryDate: "2019-01-01" },
      { id: "3", titleEn: "No Evidence", status: "APPROVED", evidence: "" },
    ];
    const html = renderToStaticMarkup(<ServiceEnterpriseReadiness items={unapprovedClaims} locale="en" />);
    expect(html).toBe("");
  });

  it("renders only approved claims while protecting confidential internal evidence in ServiceEnterpriseReadiness", () => {
    const mixedClaims: any[] = [
      { id: "1", titleEn: "Hidden Draft", status: "DRAFT", evidence: "Internal Ref 1" },
      { id: "2", titleEn: "Visible Approved", descriptionEn: "Approved text", status: "APPROVED", evidence: "E3 Confidential HSE Manual 2026" },
      { id: "3", titleEn: "Public Cert", descriptionEn: "Public text", status: "APPROVED", evidence: "ISO Cert", isPublicEvidence: true, publicSourceUrl: "https://e3.qa/iso.pdf" },
    ];
    const html = renderToStaticMarkup(<ServiceEnterpriseReadiness items={mixedClaims} locale="en" />);
    expect(html).toContain("Visible Approved");
    expect(html).toContain("Approved &amp; Verified");
    // Confidential internal document string must NOT leak to public markup
    expect(html).not.toContain("E3 Confidential HSE Manual 2026");
    expect(html).not.toContain("Hidden Draft");
    // Public evidence URL should render when explicitly marked
    expect(html).toContain("https://e3.qa/iso.pdf");
  });
});

describe("2. Zero Runtime Marketing Fallbacks & Pure Presentation in Service Modules", () => {
  it("suppresses ServiceSpecificModule when moduleConfig is null or empty", () => {
    const html1 = renderToStaticMarkup(<ServiceSpecificModule moduleConfig={null} locale="en" />);
    expect(html1).toBe("");

    const html2 = renderToStaticMarkup(
      <ServiceSpecificModule
        moduleConfig={{ type: "scale-explorer", titleEn: "", titleAr: "", subtitleEn: "", subtitleAr: "", options: [], sections: [] }}
        locale="en"
      />
    );
    expect(html2).toBe("");
  });

  it("renders ServiceSpecificModule dynamically strictly from CMS options without hardcoded constants", () => {
    const dynamicConfig: ServiceSpecificModuleConfig = {
      type: "scale-explorer",
      titleEn: "Dynamic Venue Explorer",
      titleAr: "مستكشف القاعات التفاعلي",
      subtitleEn: "Exploratory planning guidance for dynamic venues.",
      subtitleAr: "دليل تخطيطي استرشادي للقاعات.",
      disclaimerEn: "Custom indicative planning disclaimer.",
      disclaimerAr: "إشعار تخطيطي استرشادي مخصص.",
      options: [
        {
          id: "custom-opt-1",
          labelEn: "Custom Arena Tier",
          labelAr: "فئة الصالة المخصصة",
          tagEn: "10,000 Capacity",
          tagAr: "١٠,٠٠٠ سعة",
          descriptionEn: "Dynamic description from database.",
          descriptionAr: "وصف ديناميكي من قاعدة البيانات.",
          specs: [
            { labelEn: "Stage Type", labelAr: "نوع المسرح", valueEn: "Dynamic Proscenium", valueAr: "مسرح ديناميكي" }
          ],
          outputsEn: ["Dynamic Deliverable A"],
          outputsAr: ["المخرج الديناميكي أ"]
        }
      ]
    };

    const html = renderToStaticMarkup(<ServiceSpecificModule moduleConfig={dynamicConfig} locale="en" />);
    expect(html).toContain("Dynamic Venue Explorer");
    expect(html).toContain("Custom Arena Tier");
    expect(html).toContain("Dynamic description from database.");
    expect(html).toContain("Dynamic Proscenium");
    expect(html).toContain("Custom indicative planning disclaimer.");
  });

  it("verifies ServiceSpecificModule.tsx source code contains NO hardcoded technical claims or marketing literals", () => {
    const filePath = path.join(process.cwd(), "src/components/b2b/services/ServiceSpecificModule.tsx");
    const sourceCode = fs.readFileSync(filePath, "utf-8");

    // Prohibited unevidenced / hardcoded technical literals
    const bannedLiterals = [
      "18m–80m+",
      "18m Modular",
      "P2.6",
      "P3.9",
      "N+1 generator",
      "EN 1176",
      "ASTM F1487",
      "holographic chambers",
      "sub-300ms",
      "Class-0",
      "Class-1",
      "Class-A",
    ];

    for (const literal of bannedLiterals) {
      expect(sourceCode.includes(literal)).toBe(false);
    }
  });
});

describe("3. Canonical Slugs Resolution & Legacy Route Protection", () => {
  it("verifies all 10 canonical slugs resolve correctly", () => {
    expect(CANONICAL_SERVICE_SLUGS.length).toBe(10);
    for (const slug of CANONICAL_SERVICE_SLUGS) {
      expect(resolveCanonicalSlug(slug)).toBe(slug);
    }
  });

  it("resolves historical legacy slugs to current canonical slugs", () => {
    expect(resolveCanonicalSlug("family-entertainment-centers")).toBe("fec-development");
    expect(resolveCanonicalSlug("fec")).toBe("fec-development");
    expect(resolveCanonicalSlug("kids-play-concepts")).toBe("kids-concepts");
    expect(resolveCanonicalSlug("event-engineering")).toBe("mega-events");
    expect(resolveCanonicalSlug("audio-visual-stage")).toBe("av-stage-rentals");
    expect(resolveCanonicalSlug("e3-rentals")).toBe("av-stage-rentals");
    expect(resolveCanonicalSlug("attraction-operations-management")).toBe("attraction-operations");
    expect(resolveCanonicalSlug("bookingqube")).toBe("ticketing-solutions");
    expect(resolveCanonicalSlug("spatial-fabrication-theming")).toBe("fabrication-branding");
    expect(resolveCanonicalSlug("design-research")).toBe("feasibility-design-research");
  });
});

describe("4. Supported BookingQube Content Standards", () => {
  it("ensures initial template for ticketing-solutions uses only supported capabilities", () => {
    const ticketingTemplate = INITIAL_SERVICE_TEMPLATES["ticketing-solutions"];
    expect(ticketingTemplate).toBeDefined();

    const jsonStr = JSON.stringify(ticketingTemplate);
    // Banned unevidenced marketing claims
    expect(jsonStr.includes("sub-300ms")).toBe(false);
    expect(jsonStr.includes("cryptographic QR")).toBe(false);
    expect(jsonStr.includes("Apple Wallet passes")).toBe(false);

    // Verified supported capabilities
    expect(jsonStr.includes("Online & Box-Office Solutions") || jsonStr.includes("Event & Box-Office Ticketing")).toBe(true);
    expect(jsonStr.includes("Accreditation & Registration")).toBe(true);
    expect(jsonStr.includes("Access & Crowd Management")).toBe(true);
    expect(jsonStr.includes("Audience Insights & Reporting")).toBe(true);
  });
});

describe("5. Localization & RTL Support", () => {
  it("renders Arabic text properly when locale is 'ar'", () => {
    const dynamicConfig: ServiceSpecificModuleConfig = {
      type: "scale-explorer",
      titleEn: "Scale Explorer EN",
      titleAr: "مستكشف السعة بالعربية",
      subtitleEn: "Subtitle EN",
      subtitleAr: "الوصف بالعربية",
      disclaimerEn: "Disclaimer EN",
      disclaimerAr: "إشعار إخلاء المسؤولية بالعربية",
      options: [
        {
          id: "opt-1",
          labelEn: "Option EN",
          labelAr: "الخيار العربي",
          descriptionEn: "Desc EN",
          descriptionAr: "الوصف العربي التفصيلي",
        }
      ]
    };

    const html = renderToStaticMarkup(<ServiceSpecificModule moduleConfig={dynamicConfig} locale="ar" />);
    expect(html).toContain("مستكشف السعة بالعربية");
    expect(html).toContain("الخيار العربي");
    expect(html).toContain("الوصف العربي التفصيلي");
    expect(html).toContain("إشعار إخلاء المسؤولية بالعربية");
  });
});
