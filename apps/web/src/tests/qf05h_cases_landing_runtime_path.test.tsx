import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CaseStudiesIndexPage, { dynamic, revalidate } from "@/app/[locale]/b2b/cases/page";
import { getPublicCaseStudies, getPublicCaseStudyBySlug, isCaseStudyEligible } from "@/lib/case-studies";

describe("QF-05-H — Real Server Loader & Runtime Boundary Regression", () => {
  it("1. Verifies server page exports force-dynamic and revalidate = 0", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(revalidate).toBe(0);
  });

  it("2. Real page server loader resolves eligible published case studies and renders EN markup", async () => {
    const pageJsx = await CaseStudiesIndexPage({
      params: Promise.resolve({ locale: "en" }),
    });

    const html = renderToStaticMarkup(pageJsx);

    // Must not render 0 Delivered Landmarks
    expect(html).not.toContain("0 Delivered Landmarks");
    expect(html).toContain("Delivered Landmarks");

    // All published live case studies must be rendered with links
    const publicCases = await getPublicCaseStudies();
    expect(publicCases.length).toBeGreaterThanOrEqual(1);

    for (const cs of publicCases) {
      expect(html).toContain(cs.slug);
      expect(html).toContain(`/en/b2b/cases/${cs.slug}`);
    }
  });

  it("3. Real page server loader resolves eligible published case studies and renders AR markup", async () => {
    const pageJsx = await CaseStudiesIndexPage({
      params: Promise.resolve({ locale: "ar" }),
    });

    const html = renderToStaticMarkup(pageJsx);

    // Must not render 0 مشروعاً موثقاً
    expect(html).not.toContain("0 مشروعاً موثقاً");
    expect(html).toContain("مشروعاً موثقاً");

    // All published live case studies must be rendered with links
    const publicCases = await getPublicCaseStudies();
    for (const cs of publicCases) {
      expect(html).toContain(cs.slug);
      expect(html).toContain(`/ar/b2b/cases/${cs.slug}`);
    }
  });

  it("4. Canonical eligibility strictly excludes unpublished, draft, or hidden records", () => {
    const draftRecord = {
      id: "draft-test-1",
      slug: "hidden-draft-project",
      titleEn: "Hidden Draft",
      isPublished: false,
      status: "DRAFT",
    };
    expect(isCaseStudyEligible(draftRecord)).toBe(false);

    const hiddenRecord = {
      id: "hidden-test-2",
      slug: "hidden-active-project",
      titleEn: "Hidden Project",
      isPublished: true,
      isHidden: true,
    };
    expect(isCaseStudyEligible(hiddenRecord)).toBe(false);
  });

  it("5. Direct slug lookup consistency with public case studies API", async () => {
    const publicCases = await getPublicCaseStudies();
    for (const cs of publicCases) {
      const single = await getPublicCaseStudyBySlug(cs.slug);
      expect(single).not.toBeNull();
      expect(single?.id).toBe(cs.id);
      expect(single?.isPublished).toBe(true);
    }
  });
});
