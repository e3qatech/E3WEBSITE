import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { PortalGateway } from "@/components/home/PortalGateway";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams(),
}));

describe("UX-02A / UX-02A-B — E3 Dimensional Gateway Specification & Visual Correction Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Exact Content & Semantic Headings Preservation", () => {
    it("renders exactly one H1 and two semantic H2 headings in English", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );

      // Exactly one H1
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
      expect(h1Matches).not.toBeNull();
      expect(h1Matches?.length).toBe(1);
      expect(h1Matches?.[0]).toContain("TWO WORLDS. ONE E3.");

      // H2 headings for B2C & B2B
      expect(html).toContain("EXPERIENCE WHAT’S NEXT");
      expect(html).toContain("BUILD WHAT’S NEXT");
    });

    it("renders exactly one H1 and two semantic H2 headings in Arabic", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="ar">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );

      // Exactly one H1
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
      expect(h1Matches).not.toBeNull();
      expect(h1Matches?.length).toBe(1);
      expect(h1Matches?.[0]).toContain("عالمان. وجهة واحدة: E3");

      // Arabic H2s
      expect(html).toContain("عِش التجربة القادمة");
      expect(html).toContain("لنصنع القادم");
    });

    it("preserves exact descriptions, badges, and statistics", () => {
      const htmlEn = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(htmlEn).toContain("Discover live events, family attractions and unforgettable entertainment experiences across Qatar.");
      expect(htmlEn).toContain("Partner with E3 to design, produce and operate remarkable events, destinations and immersive brand experiences.");
      expect(htmlEn).toContain("EXPERIENCES &amp; ATTRACTIONS");
      expect(htmlEn).toContain("FOR BRANDS &amp; ORGANIZATIONS");
      expect(htmlEn).toContain("1.2M+ Annual Visitors");
      expect(htmlEn).toContain("450+ Corporate Activations");
    });
  });

  describe("2. CTA Labels, Destinations & Link Integrity", () => {
    it("renders exact CTA labels and canonical destinations in English", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toContain("Explore Experiences");
      expect(html).toContain("Work With E3");
      expect(html).toContain('href="/en/b2c"');
      expect(html).toContain('href="/en/b2b"');
    });

    it("renders exact CTA labels and canonical destinations in Arabic", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="ar">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toContain("استكشف التجارب");
      expect(html).toContain("تعاون مع E3");
      expect(html).toContain('href="/ar/b2c"');
      expect(html).toContain('href="/ar/b2b"');
    });
  });

  describe("3. Slanted Diagonal Divider & Theme Styling", () => {
    it("renders the slanted diagonal divider (-skew-x-6) in desktop view", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toContain("-skew-x-6");
    });

    it("applies distinct daylight light-mode tokens in light theme", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway simulation={{ theme: "light" }} />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toContain("bg-[#F7F3FF]");
      expect(html).toContain("text-[#171326]");
    });

    it("applies dark graphite/midnight tokens in dark theme", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway simulation={{ theme: "dark" }} />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toContain("bg-[#03000a]");
      expect(html).toContain("text-white");
    });
  });

  describe("4. Directionality & Layout Order", () => {
    it("sets dir='ltr' for English", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );
      expect(html).toContain('dir="ltr"');
    });

    it("sets dir='rtl' for Arabic", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="ar">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );
      expect(html).toContain('dir="rtl"');
    });
  });

  describe("5. Capability Modes & Fallbacks", () => {
    it("renders smoothly in minimal / reduced motion simulation mode", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway simulation={{ reducedMotion: true }} />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toBeDefined();
      expect(html).toContain("TWO WORLDS. ONE E3.");
      expect(html).toContain('href="/en/b2c"');
      expect(html).toContain('href="/en/b2b"');
    });

    it("renders fallback media when simulated", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway simulation={{ useFallbackMedia: true }} />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toBeDefined();
      expect(html).toContain("TWO WORLDS. ONE E3.");
    });
  });

  describe("6. Zero English Accessibility Residue in Arabic", () => {
    it("confirms Arabic markup contains localized aria labels", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="ar">
            <PortalGateway />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toContain("بوابة الاختيار الرئيسية لمنصة إي ثري قطر");
      expect(html).toContain("بوابة تجارب الأفراد والجمهور");
      expect(html).toContain("بوابة حلول الشركات والمؤسسات");
    });
  });

  describe("7. Mobile Mode 50/50 Horizontal Split & CTA-Only Verification", () => {
    it("renders equal 50/50 horizontal split with only CTAs and horizontal divider on mobile", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="en">
            <PortalGateway simulation={{ viewport: "mobile-390" }} previewMode={true} />
          </LocaleProvider>
        </ThemeProvider>
      );

      // Contains both B2C and B2B CTAs
      expect(html).toContain("Explore Experiences");
      expect(html).toContain("Work With E3");

      // Contains 50/50 half height classes and straight horizontal dividing line
      expect(html).toContain("h-1/2");
      expect(html).toContain("bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400");
    });

    it("renders equal 50/50 horizontal split with Arabic CTAs on mobile", () => {
      const html = renderToStaticMarkup(
        <ThemeProvider>
          <LocaleProvider defaultLocale="ar">
            <PortalGateway simulation={{ viewport: "mobile-390", locale: "ar" }} previewMode={true} />
          </LocaleProvider>
        </ThemeProvider>
      );

      expect(html).toContain("استكشف التجارب");
      expect(html).toContain("تعاون مع E3");
      expect(html).toContain("h-1/2");
    });
  });
});
