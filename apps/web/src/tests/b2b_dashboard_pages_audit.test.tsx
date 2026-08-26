import { describe, it, expect } from "vitest";
import {
  getMergedCMSPageContent,
  DEFAULT_B2B_HOME_CONTENT,
  DEFAULT_B2B_ABOUT_CONTENT,
  DEFAULT_B2B_CAREERS_CONTENT,
  DEFAULT_B2B_SERVICES_CONTENT,
  DEFAULT_B2B_CASES_CONTENT,
  DEFAULT_B2B_PARTNERS_CONTENT,
  DEFAULT_B2B_FAQS_CONTENT,
  DEFAULT_B2B_FEEDBACK_CONTENT,
} from "@/lib/cms-default-pages";

describe("B2B Dashboard Pages & CMS Schema Audit Suite", () => {
  it("1. B2B Home Editor receives complete canonical content", () => {
    const content = getMergedCMSPageContent("b2b-home", null);
    expect(content).toBeDefined();
    expect(content.hero.titleEn).toBe(DEFAULT_B2B_HOME_CONTENT.hero.titleEn);
    expect(content.stats.length).toBeGreaterThanOrEqual(4);
    expect(content.capabilities.titleEn).toBe(DEFAULT_B2B_HOME_CONTENT.capabilities.titleEn);
    expect(content.deliveryProcess.steps.length).toBeGreaterThanOrEqual(5);
  });

  it("2. B2B About Editor receives complete canonical content", () => {
    const content = getMergedCMSPageContent("b2b-about", null);
    expect(content).toBeDefined();
    expect(content.header.titleEn).toBe(DEFAULT_B2B_ABOUT_CONTENT.header.titleEn);
    expect(content.stats.items.length).toBeGreaterThanOrEqual(4);
    expect(content.values.length).toBeGreaterThanOrEqual(3);
    expect(content.cta.primaryCtaTextEn).toBe("Submit RFP Inquiry");
  });

  it("3. B2B Careers Editor receives complete canonical content", () => {
    const content = getMergedCMSPageContent("b2b-careers", null);
    expect(content).toBeDefined();
    expect(content.hero.titleEn).toBe(DEFAULT_B2B_CAREERS_CONTENT.hero.titleEn);
    expect(content.lifeAtE3.items.length).toBeGreaterThanOrEqual(4);
    expect(content.hiringJourney.steps.length).toBeGreaterThanOrEqual(4);
  });

  it("4. B2B Services Page Editor receives complete canonical content", () => {
    const content = getMergedCMSPageContent("b2b-services", null);
    expect(content).toBeDefined();
    expect(content.hero.titleEn).toBe(DEFAULT_B2B_SERVICES_CONTENT.hero.titleEn);
    expect(content.deliveryMethodology.steps.length).toBeGreaterThanOrEqual(5);
  });

  it("5. B2B Cases Page Editor receives complete canonical content", () => {
    const content = getMergedCMSPageContent("b2b-cases", null);
    expect(content).toBeDefined();
    expect(content.hero.titleEn).toBe(DEFAULT_B2B_CASES_CONTENT.hero.titleEn);
    expect(content.factStream.titleEn).toBe(DEFAULT_B2B_CASES_CONTENT.factStream.titleEn);
  });

  it("6. B2B Partners Page Editor receives complete canonical content", () => {
    const content = getMergedCMSPageContent("b2b-partners", null);
    expect(content).toBeDefined();
    expect(content.hero.titleEn).toBe(DEFAULT_B2B_PARTNERS_CONTENT.hero.titleEn);
    expect(content.hero.subtitleEn).toBe(DEFAULT_B2B_PARTNERS_CONTENT.hero.subtitleEn);
  });

  it("7. B2B FAQs Editor receives complete canonical content", () => {
    const content = getMergedCMSPageContent("b2b-faqs", null);
    expect(content).toBeDefined();
    expect(content.header.titleEn).toBe(DEFAULT_B2B_FAQS_CONTENT.header.titleEn);
    expect(content.items.length).toBeGreaterThanOrEqual(3);
  });

  it("8. B2B Feedback Editor receives complete canonical content", () => {
    const content = getMergedCMSPageContent("b2b-feedback", null);
    expect(content).toBeDefined();
    expect(content.header.titleEn).toBe(DEFAULT_B2B_FEEDBACK_CONTENT.header.titleEn);
    expect(content.success.titleEn).toBe(DEFAULT_B2B_FEEDBACK_CONTENT.success.titleEn);
  });
});
