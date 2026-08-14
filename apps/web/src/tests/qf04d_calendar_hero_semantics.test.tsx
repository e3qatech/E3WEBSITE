import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CalendarView } from "@/components/calendar/CalendarView";
import { LocaleProvider } from "@/components/layout/LocaleProvider";

describe("QF-04-D — Rendered Calendar Hero Semantics & DOM Verification", () => {
  function renderCalendar(locale: "en" | "ar", props: any = {}) {
    const html = renderToStaticMarkup(
      <LocaleProvider defaultLocale={locale}>
        <CalendarView {...props} />
      </LocaleProvider>
    );
    return html;
  }

  function extractH1s(html: string): string[] {
    const matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi));
    return matches.map((m) => m[1].replace(/<[^>]*>/g, "").trim());
  }

  function extractEyebrow(html: string): string | null {
    const match = html.match(/data-testid="calendar-hero-eyebrow"[^>]*>([\s\S]*?)<\/div>/i);
    if (!match) return null;
    return match[1].replace(/<[^>]*>/g, "").trim();
  }

  describe("1. English Hero DOM Semantics (/en/b2c/calendar)", () => {
    it("renders exactly one H1 tag on English locale", () => {
      const html = renderCalendar("en");
      const h1s = extractH1s(html);

      expect(h1s).toHaveLength(1);
    });

    it("H1 contains title-only and excludes eyebrow text", () => {
      const html = renderCalendar("en");
      const h1s = extractH1s(html);

      expect(h1s[0]).toBe("Find Your Next E3 Experience");
      expect(h1s[0]).not.toContain("Events Calendar");
      expect(h1s[0]).not.toContain("EVENTS CALENDAR");
    });

    it("renders separate visible eyebrow outside H1 with English copy", () => {
      const html = renderCalendar("en");
      const eyebrow = extractEyebrow(html);

      expect(eyebrow).toBe("Events Calendar");
      
      // Prove eyebrow is outside H1 by checking H1 does not contain the eyebrow markup
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      expect(h1Match?.[1]).not.toContain("data-testid=\"calendar-hero-eyebrow\"");
      expect(h1Match?.[1]).not.toContain("Events Calendar");
    });

    it("guarantees no concatenated 'Events CalendarFind Your Next E3 Experience' text in the DOM", () => {
      const html = renderCalendar("en");
      expect(html).not.toContain("Events CalendarFind Your Next E3 Experience");
      expect(html).not.toContain("EVENTS CALENDARFind Your Next E3 Experience");
      expect(html).not.toContain("Events Calendar Find Your Next E3 Experience");
    });

    it("renders LTR direction attribute for English layout", () => {
      const html = renderCalendar("en");
      expect(html).toContain('dir="ltr"');
    });
  });

  describe("2. Arabic Hero DOM Semantics (/ar/b2c/calendar)", () => {
    it("renders exactly one H1 tag on Arabic locale", () => {
      const html = renderCalendar("ar");
      const h1s = extractH1s(html);

      expect(h1s).toHaveLength(1);
    });

    it("H1 contains Arabic title-only and excludes English or eyebrow copy", () => {
      const html = renderCalendar("ar");
      const h1s = extractH1s(html);

      expect(h1s[0]).toBe("اكتشف تجربتك القادمة مع إي ثري");
      expect(/[A-Za-z]/.test(h1s[0])).toBe(false);
      expect(h1s[0]).not.toContain("جدول الفعاليات");
    });

    it("renders separate visible eyebrow outside H1 with Arabic copy", () => {
      const html = renderCalendar("ar");
      const eyebrow = extractEyebrow(html);

      expect(eyebrow).toBe("جدول الفعاليات");
      expect(/[A-Za-z]/.test(eyebrow!)).toBe(false);
    });

    it("renders Arabic description paragraph without English text", () => {
      const html = renderCalendar("ar");
      const descMatch = html.match(/data-testid="calendar-hero-description"[^>]*>([\s\S]*?)<\/p>/i);
      const desc = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";

      expect(desc).toBe("استكشف الفعاليات القادمة والتجارب العائلية والمهرجانات الموسمية والأنشطة المميزة في قطر.");
      expect(/[A-Za-z]/.test(desc)).toBe(false);
    });

    it("renders RTL direction attribute for Arabic layout", () => {
      const html = renderCalendar("ar");
      expect(html).toContain('dir="rtl"');
    });
  });

  describe("3. Concatenated CMS Input Sanitization (Anti-Concatenation Defense)", () => {
    it("strips concatenated English eyebrow prefix from raw CMS title string", () => {
      const corruptedCmsProps = {
        eyebrowEn: "Events Calendar",
        title: "Events CalendarFind Your Next E3 Experience",
      };

      const html = renderCalendar("en", corruptedCmsProps);
      const h1s = extractH1s(html);
      const eyebrow = extractEyebrow(html);

      expect(h1s[0]).toBe("Find Your Next E3 Experience");
      expect(eyebrow).toBe("Events Calendar");
      expect(h1s[0]).not.toContain("Events Calendar");
    });

    it("strips uppercase concatenated English eyebrow prefix from raw CMS titleEn", () => {
      const corruptedCmsProps = {
        eyebrowEn: "Events Calendar",
        titleEn: "EVENTS CALENDAR: Find Your Next E3 Experience",
      };

      const html = renderCalendar("en", corruptedCmsProps);
      const h1s = extractH1s(html);
      const eyebrow = extractEyebrow(html);

      expect(h1s[0]).toBe("Find Your Next E3 Experience");
      expect(eyebrow).toBe("Events Calendar");
    });

    it("strips concatenated Arabic eyebrow prefix from raw CMS titleAr", () => {
      const corruptedCmsProps = {
        eyebrowAr: "جدول الفعاليات",
        titleAr: "جدول الفعاليات: اكتشف تجربتك القادمة مع إي ثري",
      };

      const html = renderCalendar("ar", corruptedCmsProps);
      const h1s = extractH1s(html);
      const eyebrow = extractEyebrow(html);

      expect(h1s[0]).toBe("اكتشف تجربتك القادمة مع إي ثري");
      expect(eyebrow).toBe("جدول الفعاليات");
    });
  });

  describe("4. Preserved Hero Media Background Behavior", () => {
    it("preserves semantic header and separate eyebrow when heroMediaUrl is provided", () => {
      const mediaProps = {
        heroMediaType: "IMAGE",
        heroMediaUrl: "https://images.unsplash.com/photo-1540039155733",
      };

      const html = renderCalendar("en", mediaProps);
      const h1s = extractH1s(html);
      const eyebrow = extractEyebrow(html);

      expect(h1s).toHaveLength(1);
      expect(h1s[0]).toBe("Find Your Next E3 Experience");
      expect(eyebrow).toBe("Events Calendar");
      expect(html).toContain(mediaProps.heroMediaUrl);
    });
  });
});
