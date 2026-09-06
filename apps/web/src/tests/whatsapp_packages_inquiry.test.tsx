import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildWhatsappUrl } from "@/lib/url-helper";
import { PackagesClient } from "@/components/b2c/PackagesClient";
import { PackagesPageEditor } from "@/components/dashboard/b2c/PackagesPageEditor";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { DEFAULT_B2C_PACKAGES_PAGE_CONTENT } from "@/lib/cms-default-pages";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/en/b2c/packages",
  useSearchParams: () => new URLSearchParams(),
}));

describe("WhatsApp Package Inquiry Feature", () => {
  describe("buildWhatsappUrl Helper", () => {
    it("formats standard phone numbers into clean wa.me links", () => {
      const url = buildWhatsappUrl({ phoneOrUrl: "+974 5113 8418" });
      expect(url).toBe("https://wa.me/97451138418");
    });

    it("attaches pre-filled encoded message query parameter", () => {
      const url = buildWhatsappUrl({
        phoneOrUrl: "+974 5113 8418",
        message: "Hello E3 Qatar, inquiry for packages",
      });
      expect(url).toBe("https://wa.me/97451138418?text=Hello%20E3%20Qatar%2C%20inquiry%20for%20packages");
    });

    it("encodes Arabic messages correctly", () => {
      const url = buildWhatsappUrl({
        phoneOrUrl: "+974 5113 8418",
        message: "مرحباً إي ثري قطر",
      });
      expect(url).toContain("https://wa.me/97451138418?text=");
      expect(decodeURIComponent(url)).toContain("مرحباً إي ثري قطر");
    });

    it("preserves full URLs and appends message if missing text param", () => {
      const fullUrl = buildWhatsappUrl({
        phoneOrUrl: "https://wa.me/97430489955",
        message: "Booking inquiry",
      });
      expect(fullUrl).toBe("https://wa.me/97430489955?text=Booking%20inquiry");
    });

    it("falls back to default E3 WhatsApp number when empty", () => {
      const url = buildWhatsappUrl({});
      expect(url).toBe("https://wa.me/97451138418");
    });
  });

  describe("PackagesClient Component", () => {
    it("maps legacy 'Plan a Custom Event' to 'Inquire via WhatsApp' and renders WhatsApp link", () => {
      const legacySettings = {
        titleEn: "Celebration Packages",
        secondaryCtaEn: "Plan a Custom Event",
        secondaryCtaAr: "خطط لفعاليتك الخاصة",
        whatsappNumber: "+974 5113 8418",
      };

      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PackagesClient
            locale="en"
            initialSettings={legacySettings}
            packages={[]}
          />
        </LocaleProvider>
      );

      // Label replaced
      expect(htmlEn).toContain("Inquire via WhatsApp");
      expect(htmlEn).not.toContain("Plan a Custom Event");

      // External WhatsApp Link present with secure target blank
      expect(htmlEn).toContain("https://wa.me/97451138418");
      expect(htmlEn).toContain('target="_blank"');
      expect(htmlEn).toContain('rel="noopener noreferrer"');
    });

    it("renders localized Arabic 'استفسار عبر واتساب' in Arabic locale", () => {
      const legacySettings = {
        titleAr: "باقات الاحتفالات",
        secondaryCtaEn: "Plan a Custom Event",
        secondaryCtaAr: "خطط لفعاليتك الخاصة",
        whatsappNumber: "+974 5113 8418",
      };

      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <PackagesClient
            locale="ar"
            initialSettings={legacySettings}
            packages={[]}
          />
        </LocaleProvider>
      );

      expect(htmlAr).toContain("استفسار عبر واتساب");
      expect(htmlAr).toContain("https://wa.me/97451138418");
    });

    it("respects custom non-legacy secondary CTA if set by admin", () => {
      const customSettings = {
        titleEn: "Celebration Packages",
        secondaryCtaEn: "Chat with Concierge",
        whatsappNumber: "+974 5113 8418",
      };

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PackagesClient
            locale="en"
            initialSettings={customSettings}
            packages={[]}
          />
        </LocaleProvider>
      );

      expect(html).toContain("Chat with Concierge");
      expect(html).toContain("https://wa.me/97451138418");
    });
  });

  describe("PackagesPageEditor Dashboard Component", () => {
    it("renders WhatsApp Package Inquiry configuration section with phone input and live preview", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PackagesPageEditor initialConfig={{}} />
        </LocaleProvider>
      );

      expect(html).toContain("WhatsApp Package Inquiry Configuration");
      expect(html).toContain("WhatsApp Phone Number (with Country Code)");
      expect(html).toContain("Custom WhatsApp URL Override (Optional)");
      expect(html).toContain("Pre-filled WhatsApp Inquiry Message");
      expect(html).toContain("Live Generated WhatsApp Link Preview:");
      expect(html).toContain("Test Link");
      expect(html).toContain("Copy Link");
      expect(html).toContain("https://wa.me/97451138418");
    });
  });

  describe("CMS Default Settings", () => {
    it("includes WhatsApp inquiry defaults in DEFAULT_B2C_PACKAGES_PAGE_CONTENT", () => {
      expect(DEFAULT_B2C_PACKAGES_PAGE_CONTENT.secondaryCtaEn).toBe("Inquire via WhatsApp");
      expect(DEFAULT_B2C_PACKAGES_PAGE_CONTENT.secondaryCtaAr).toBe("استفسار عبر واتساب");
      expect(DEFAULT_B2C_PACKAGES_PAGE_CONTENT.whatsappNumber).toBe("+974 5113 8418");
    });
  });
});
