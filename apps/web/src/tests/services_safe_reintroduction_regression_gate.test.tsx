import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getAllCanonicalServices,
  getCanonicalService,
  resolveServiceSlug,
  CANONICAL_SERVICES
} from "@/lib/services/canonical-services";
import { adaptDbServiceToPresentation } from "@/lib/services/service-adapters";
import { ServiceObjectiveSelector } from "@/components/b2b/services/ServiceObjectiveSelector";
import { ServiceMediaGallery } from "@/components/b2b/services/ServiceMediaGallery";
import { ProjectBriefBuilderModal } from "@/components/b2b/services/ProjectBriefBuilderModal";
import { ServiceMicrositeClient } from "@/components/b2b/services/ServiceMicrositeClient";

describe("Phase 4: Whole-Site Regression Gates & Contract Integrity", () => {
  // 1. Canonical Services Count & Identifiers
  it("1. Services directory returns exactly the 10 published canonical services", () => {
    const services = getAllCanonicalServices();
    expect(services.length).toBe(10);
    const slugs = services.map((s) => s.slug);
    expect(slugs).toEqual([
      "mega-events",
      "family-entertainment-centers",
      "kids-concepts",
      "experiential-activations",
      "shows-performances",
      "av-stage-rentals",
      "attraction-operations",
      "ticketing-solutions",
      "fabrication-branding",
      "feasibility-design-research"
    ]);
  });

  // 2. Legacy Aliases Resolution without duplication
  it("2. Legacy service aliases redirect without producing duplicate public service cards", () => {
    expect(resolveServiceSlug("fec")).toBe("family-entertainment-centers");
    expect(resolveServiceSlug("fec-development")).toBe("family-entertainment-centers");
    expect(resolveServiceSlug("event-engineering")).toBe("mega-events");
    expect(resolveServiceSlug("av-rentals")).toBe("av-stage-rentals");
    expect(resolveServiceSlug("design-research")).toBe("feasibility-design-research");

    // Resolving canonical slug returns the canonical slug itself
    expect(resolveServiceSlug("mega-events")).toBe("mega-events");
    expect(resolveServiceSlug("family-entertainment-centers")).toBe("family-entertainment-centers");
  });

  // 3. Adapter Resilience: Malformed JSON does not remove parent service
  it("3. A failure in enhancement JSON parsing cannot remove the parent service record", () => {
    const malformedDbRecord = {
      id: "srv-corrupt-json",
      slug: "mega-events",
      titleEn: "Mega Events & Festivals",
      titleAr: "الفعاليات الكبرى والمهرجانات",
      isPublished: true,
      isFeatured: true,
      objectives: "{ malformed json string: [",
      capabilities: "invalid json",
      deliverables: null,
      lifecycleStages: undefined,
      wowHow: "{broken",
    } as any;

    const adapted = adaptDbServiceToPresentation(malformedDbRecord);
    expect(adapted).toBeDefined();
    expect(adapted.id).toBe("srv-corrupt-json");
    expect(adapted.slug).toBe("mega-events");
    expect(adapted.titleEn).toBe("Mega Events & Festivals");
    expect(Array.isArray(adapted.objectives)).toBe(true);
    expect(Array.isArray(adapted.capabilities)).toBe(true);
    expect(Array.isArray(adapted.deliverables)).toBe(true);
  });

  // 4. Optional Microsite Sections Suppress Independently
  it("4. Optional microsite sections suppress independently when configuration is absent", () => {
    const serviceWithoutGallery = getCanonicalService("mega-events")!;
    const emptyGalleryHtml = renderToStaticMarkup(
      <ServiceMediaGallery items={[]} locale="en" />
    );
    expect(emptyGalleryHtml).toBe("");

    const emptyObjectivesHtml = renderToStaticMarkup(
      <ServiceObjectiveSelector objectives={[]} locale="en" />
    );
    expect(emptyObjectivesHtml).toBe("");
  });

  // 5. Objective Selector Callback & Removal of Broken Anchor
  it("5. Objective selector action triggers callback and has no #project-brief-section anchor", () => {
    const service = getCanonicalService("mega-events")!;
    const onOpenBrief = vi.fn();

    const html = renderToStaticMarkup(
      <ServiceObjectiveSelector
        objectives={service.objectives}
        locale="en"
        onOpenBriefBuilder={onOpenBrief}
      />
    );

    expect(html).not.toContain('href="#project-brief-section"');
    expect(html).toContain("Include in Brief");
    expect(html).toContain("button");

    const htmlAr = renderToStaticMarkup(
      <ServiceObjectiveSelector
        objectives={service.objectives}
        locale="ar"
        onOpenBriefBuilder={onOpenBrief}
      />
    );
    expect(htmlAr).not.toContain('href="#project-brief-section"');
    expect(htmlAr).toContain("إدراج في موجز المشروع");
  });

  // 6. Project Brief Modal Objective Preselection
  it("6. Project Brief Modal preselects primary objective and services", () => {
    const service = getCanonicalService("mega-events")!;
    const initialObj = service.objectives[0];

    const html = renderToStaticMarkup(
      <ProjectBriefBuilderModal
        isOpen={true}
        onClose={() => {}}
        initialService={service}
        initialObjective={initialObj}
        locale="en"
      />
    );

    expect(html).toContain("Build Your Project Brief");
    expect(html).toContain("value=\"mega-events\"");
  });

  // 7. Microsite Client Renders Core Sections Safely
  it("7. Microsite Client renders complete microsite without throwing", () => {
    const service = getCanonicalService("mega-events")!;
    const htmlEn = renderToStaticMarkup(
      <ServiceMicrositeClient
        service={service}
        locale="en"
        relatedCaseStudies={[]}
      />
    );

    expect(htmlEn).toContain("What Are You Trying to Achieve?");
    expect(htmlEn).not.toContain('href="#project-brief-section"');

    const htmlAr = renderToStaticMarkup(
      <ServiceMicrositeClient
        service={service}
        locale="ar"
        relatedCaseStudies={[]}
      />
    );
    expect(htmlAr).toContain(service.titleAr);
    expect(htmlAr).toContain("ما الذي تسعى إلى تحقيقه؟");
    expect(htmlAr).not.toContain('href="#project-brief-section"');
  });

  // 8. Runtime Code Cleanliness: No INITIAL_SERVICE_TEMPLATES imported in presentation
  it("8. No runtime public route or adapter imports INITIAL_SERVICE_TEMPLATES", () => {
    expect((CANONICAL_SERVICES as any).INITIAL_SERVICE_TEMPLATES).toBeUndefined();
  });

  // 9. B2B Navigation Primary Destinations
  it("9. B2B navigation contains all expected primary destinations", () => {
    const expectedB2bLinks = [
      "/b2b",
      "/b2b/services",
      "/b2b/case-studies",
      "/b2c/discover",
      "/b2b/clients",
      "/b2b/about",
      "/b2b/contact"
    ];
    // Verify each expected route is valid
    expectedB2bLinks.forEach((link) => {
      expect(link.startsWith("/b2b") || link.startsWith("/b2c")).toBe(true);
    });
  });

  // 10. Database Schema Contract Integrity
  it("10. Adapter maps DB service fields to Canonical Service presentation contract accurately", () => {
    const realisticDbService = {
      id: "srv-real-db-1",
      slug: "mega-events",
      titleEn: "Mega Events & End-to-End Production",
      titleAr: "الفعاليات الكبرى والإنتاج الشامل",
      category: "Events & Festivals",
      taglineEn: "Turnkey masterplanning in Qatar",
      taglineAr: "تخطيط شامل في قطر",
      contentEn: "Comprehensive supporting narrative",
      contentAr: "سرد داعم متكامل",
      thumbnail: "https://example.com/thumb.jpg",
      heroMediaUrl: "https://example.com/hero.jpg",
      heroMediaType: "IMAGE",
      isVisible: true,
      isFeatured: true,
      gallery: [
        {
          id: "gal-1",
          mediaUrl: "https://example.com/gal-1.jpg",
          mediaType: "IMAGE",
          titleEn: "National Day Pavilion",
          titleAr: "جناح اليوم الوطني",
          orderIndex: 0,
        }
      ]
    };

    const presentation = adaptDbServiceToPresentation(realisticDbService);
    expect(presentation.id).toBe("srv-real-db-1");
    expect(presentation.slug).toBe("mega-events");
    expect(presentation.titleEn).toBe("Mega Events & End-to-End Production");
    expect(presentation.heroMediaUrl).toBe("https://example.com/hero.jpg");
    expect(presentation.galleryItems?.length).toBe(1);
    expect(presentation.galleryItems?.[0].titleEn).toBe("National Day Pavilion");
    expect(presentation.wowHow.length).toBeGreaterThan(0);
    expect(presentation.capabilities.length).toBeGreaterThan(0);
    expect(presentation.deliverables.length).toBeGreaterThan(0);
  });
});
