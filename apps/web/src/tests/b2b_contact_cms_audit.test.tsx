import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getMergedCMSPageContent, DEFAULT_B2B_CONTACT_CONTENT } from "@/lib/cms-default-pages";
import { B2BContactClient } from "@/components/b2b/contact/B2BContactClient";

describe("B2B Contact CMS & Hardcoded Content Audit Suite", () => {
  it("1. getMergedCMSPageContent('b2b-contact') returns complete canonical schema", () => {
    const merged = getMergedCMSPageContent("b2b-contact", null);

    expect(merged).toBeDefined();
    expect(merged.header.titleEn).toBe(DEFAULT_B2B_CONTACT_CONTENT.header.titleEn);
    expect(merged.header.titleAr).toBe(DEFAULT_B2B_CONTACT_CONTENT.header.titleAr);
    expect(merged.inquiries.business).toBe("info@eeeqa.com");
    expect(merged.inquiries.phone).toBe("+974 3048 9955");
    expect(merged.formConfig.inquiryTypes.length).toBeGreaterThanOrEqual(4);
    expect(merged.careersCta.enabled).toBe(true);
    expect(merged.feedbackCta.enabled).toBe(true);
    expect(merged.faqCta.enabled).toBe(true);
  });

  it("2. Deep merges partial admin custom content without dropping defaults", () => {
    const customPayload = {
      header: {
        titleEn: "Custom RFP Portal 2026",
      },
      inquiries: {
        business: "rfp-vip@e3.qa",
        whatsapp: "+974 5555 1234",
      },
      formConfig: {
        inquiryTypes: [
          { id: "opt-1", value: "Turnkey Arena", labelEn: "Turnkey Arena", labelAr: "ميدان متكامل" },
        ],
      },
      careersCta: {
        titleEn: "Build Attractions With Us",
      },
    };

    const merged = getMergedCMSPageContent("b2b-contact", customPayload);

    // Overridden fields
    expect(merged.header.titleEn).toBe("Custom RFP Portal 2026");
    expect(merged.inquiries.business).toBe("rfp-vip@e3.qa");
    expect(merged.inquiries.whatsapp).toBe("+974 5555 1234");
    expect(merged.formConfig.inquiryTypes).toHaveLength(1);
    expect(merged.formConfig.inquiryTypes[0].value).toBe("Turnkey Arena");
    expect(merged.careersCta.titleEn).toBe("Build Attractions With Us");

    // Preserved default fields
    expect(merged.header.titleAr).toBe(DEFAULT_B2B_CONTACT_CONTENT.header.titleAr);
    expect(merged.inquiries.phone).toBe("+974 3048 9955");
    expect(merged.formConfig.labels.submitButtonEn).toBe("Submit Inquiry / RFP");
    expect(merged.feedbackCta.titleEn).toBe(DEFAULT_B2B_CONTACT_CONTENT.feedbackCta.titleEn);
    expect(merged.faqCta.titleEn).toBe(DEFAULT_B2B_CONTACT_CONTENT.faqCta.titleEn);
  });

  it("3. B2BContactClient renders localized English markup with all dynamic CMS elements", () => {
    const cmsData = getMergedCMSPageContent("b2b-contact", {
      header: {
        titleEn: "Global Entertainment Inquiries",
        subtitleEn: "Transforming regional tourism infrastructure.",
        eyebrowEn: "ENTERPRISE RFP GATEWAY",
      },
      inquiries: {
        business: "corporate@e3.qa",
        phone: "+974 4400 9999",
      },
      formConfig: {
        inquiryTypes: [
          { id: "custom_type", value: "Kinetic Park", labelEn: "Kinetic Park", labelAr: "حديقة حركية" },
        ],
        labels: {
          submitButtonEn: "Transmit Enterprise Brief",
        },
      },
      careersCta: {
        titleEn: "Join The World Builders",
        ctaTextEn: "View Open Roles",
      },
      feedbackCta: {
        titleEn: "Share Enterprise Feedback",
      },
      faqCta: {
        titleEn: "Explore Technical Documentation",
      },
    });

    const html = renderToStaticMarkup(
      <B2BContactClient cmsData={cmsData} locale="en" />
    );

    // Header copy
    expect(html).toContain("Global Entertainment Inquiries");
    expect(html).toContain("Transforming regional tourism infrastructure.");
    expect(html).toContain("ENTERPRISE RFP GATEWAY");

    // Inquiries
    expect(html).toContain("corporate@e3.qa");
    expect(html).toContain("+974 4400 9999");

    // Form options & custom button label
    expect(html).toContain("Kinetic Park");
    expect(html).toContain("Transmit Enterprise Brief");

    // Gateway cards
    expect(html).toContain("Join The World Builders");
    expect(html).toContain("View Open Roles");
    expect(html).toContain("Share Enterprise Feedback");
    expect(html).toContain("Explore Technical Documentation");
  });

  it("4. B2BContactClient renders localized Arabic markup with RTL support", () => {
    const cmsData = getMergedCMSPageContent("b2b-contact", null);

    const html = renderToStaticMarkup(
      <B2BContactClient cmsData={cmsData} locale="ar" />
    );

    // RTL direction
    expect(html).toContain('dir="rtl"');

    // Arabic header copy
    expect(html).toContain(DEFAULT_B2B_CONTACT_CONTENT.header.titleAr);
    expect(html).toContain(DEFAULT_B2B_CONTACT_CONTENT.header.subtitleAr);

    // Arabic inquiry channels
    expect(html).toContain("استفسارات مباشرة");
    expect(html).toContain("المقر الرئيسي");
    expect(html).toContain("الدوحة، دولة قطر");

    // Arabic form controls
    expect(html).toContain("تقديم طلب عروض");
    expect(html).toContain("الاسم الكامل");
    expect(html).toContain("الشركة / المنظمة");
    expect(html).toContain("إرسال الاستفسار / طلب العروض");

    // Arabic gateway cards
    expect(html).toContain(DEFAULT_B2B_CONTACT_CONTENT.careersCta.titleAr);
    expect(html).toContain(DEFAULT_B2B_CONTACT_CONTENT.feedbackCta.titleAr);
    expect(html).toContain(DEFAULT_B2B_CONTACT_CONTENT.faqCta.titleAr);
  });
});
