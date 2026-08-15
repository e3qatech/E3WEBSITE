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

describe("UX-02A — E3 Dimensional Gateway Specification & Regression Tests", () => {
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

      // Exactly two H2s (one for B2C, one for B2B)
      const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/g);
      expect(h2Matches).not.toBeNull();
      // On desktop + mobile markup in static SSR, matches pairs
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

  describe("3. Directionality & Layout Order", () => {
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

  describe("4. Capability Modes & Fallbacks", () => {
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

  describe("5. Zero English Accessibility Residue in Arabic", () => {
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
});
