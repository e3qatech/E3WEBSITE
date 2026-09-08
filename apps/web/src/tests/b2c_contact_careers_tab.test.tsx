import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ContactClient } from "@/components/b2c/ContactClient";

describe("B2C Contact Page Careers Tab Integration Suite", () => {
  const MOCK_ATTRACTIONS = [
    { attractionId: "attr-1", attractionNameEn: "InflataCity", attractionNameAr: "إنفلاتاسيتي" },
  ];

  const MOCK_PAGE_SETTINGS = {
    title: "How Can We Help?",
    tagline: "Need support with a ticket, want to leave feedback, or just have a general question?",
  };

  it("renders 4 tabs including the new Careers tab in English", () => {
    const html = renderToStaticMarkup(
      <ContactClient
        locale="en"
        attractions={MOCK_ATTRACTIONS}
        attractionFaqs={[]}
        generalFaqs={[]}
        pageSettings={MOCK_PAGE_SETTINGS}
        featuredFeedbacks={[]}
      />
    );

    // Verify 4 tab triggers exist
    expect(html).toContain('data-testid="contact-tab-support"');
    expect(html).toContain('data-testid="contact-tab-feedback"');
    expect(html).toContain('data-testid="contact-tab-faq"');
    expect(html).toContain('data-testid="contact-tab-careers"');

    // Tab labels
    expect(html).toContain("Support");
    expect(html).toContain("Feedback");
    expect(html).toContain("FAQ");
    expect(html).toContain("Careers");
  });

  it("renders localized Careers tab trigger and contents in Arabic", () => {
    const html = renderToStaticMarkup(
      <ContactClient
        locale="ar"
        attractions={MOCK_ATTRACTIONS}
        attractionFaqs={[]}
        generalFaqs={[]}
        pageSettings={MOCK_PAGE_SETTINGS}
        featuredFeedbacks={[]}
      />
    );

    expect(html).toContain('data-testid="contact-tab-careers"');
    expect(html).toContain("الوظائف والمهن");
    expect(html).toContain("الدعم الفني");
    expect(html).toContain("التقييم والآراء");
    expect(html).toContain("الأسئلة الشائعة");
  });

  it("renders Careers tab content with direct links to B2B Careers portal and CV application", () => {
    const html = renderToStaticMarkup(
      <ContactClient
        locale="en"
        defaultTab="careers"
        attractions={MOCK_ATTRACTIONS}
        attractionFaqs={[]}
        generalFaqs={[]}
        pageSettings={MOCK_PAGE_SETTINGS}
        featuredFeedbacks={[]}
      />
    );

    // Verify Careers tab content elements
    expect(html).toContain('data-testid="careers-tab-content"');
    expect(html).toContain('data-testid="careers-tab-explore-jobs-btn"');
    expect(html).toContain("/en/b2b/careers");
    expect(html).toContain('data-testid="careers-tab-apply-btn"');
    expect(html).toContain("/en/apply");

    // Verify recruitment enquiry form
    expect(html).toContain('data-testid="careers-tab-form"');
    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('name="enquiryType"');
    expect(html).toContain('name="message"');
    expect(html).toContain('data-testid="careers-tab-submit-btn"');
  });

  it("renders Arabic Careers tab content with Arabic portal links and labels", () => {
    const html = renderToStaticMarkup(
      <ContactClient
        locale="ar"
        defaultTab="careers"
        attractions={MOCK_ATTRACTIONS}
        attractionFaqs={[]}
        generalFaqs={[]}
        pageSettings={MOCK_PAGE_SETTINGS}
        featuredFeedbacks={[]}
      />
    );

    expect(html).toContain('data-testid="careers-tab-content"');
    expect(html).toContain("/ar/b2b/careers");
    expect(html).toContain("تصفح الشواغر المتاحة");
    expect(html).toContain("/ar/apply");
    expect(html).toContain("تقديم طلب عام / السيرة الذاتية");
    expect(html).toContain("إرسال استفسار مباشر لفريق التوظيف");
    expect(html).toContain("إرسال الاستفسار");
  });
});
