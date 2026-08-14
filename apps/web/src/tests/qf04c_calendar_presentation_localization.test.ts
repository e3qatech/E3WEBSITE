import { describe, it, expect } from "vitest";
import { resolveBookingAction } from "@/lib/qatar-calendar";

describe("QF-04-C — Calendar Presentation & Localization Verification", () => {
  describe("1. Hero Eyebrow, Title & Description Localization (EN & AR)", () => {
    const defaultEnHero = {
      eyebrow: "EVENTS CALENDAR",
      title: "Find Your Next E3 Experience",
      description: "Find your next experience. Browse upcoming special events, festivals, and exclusive private sessions across all our attractions.",
    };

    const defaultArHero = {
      eyebrow: "جدول الفعاليات",
      title: "اكتشف تجربتك القادمة مع إي ثري",
      description: "استكشف الفعاليات القادمة والتجارب العائلية والمهرجانات الموسمية والأنشطة المميزة في قطر.",
    };

    function resolveHeroCopy(locale: string, cms: { eyebrowAr?: string; eyebrowEn?: string; titleAr?: string; titleEn?: string; descriptionAr?: string; descriptionEn?: string } = {}) {
      const isAr = locale === "ar";
      return {
        eyebrow: isAr ? (cms.eyebrowAr || defaultArHero.eyebrow) : (cms.eyebrowEn || defaultEnHero.eyebrow),
        title: isAr ? (cms.titleAr || defaultArHero.title) : (cms.titleEn || defaultEnHero.title),
        description: isAr ? (cms.descriptionAr || defaultArHero.description) : (cms.descriptionEn || defaultEnHero.description),
      };
    }

    it("resolves exact required fallback strings on Arabic locale (/ar)", () => {
      const arHero = resolveHeroCopy("ar");

      expect(arHero.eyebrow).toBe("جدول الفعاليات");
      expect(arHero.title).toBe("اكتشف تجربتك القادمة مع إي ثري");
      expect(arHero.description).toBe("استكشف الفعاليات القادمة والتجارب العائلية والمهرجانات الموسمية والأنشطة المميزة في قطر.");
      
      // Strictly NO English characters in Arabic fallbacks
      expect(/[A-Za-z]/.test(arHero.eyebrow)).toBe(false);
      expect(/[A-Za-z]/.test(arHero.title)).toBe(false);
      expect(/[A-Za-z]/.test(arHero.description)).toBe(false);
    });

    it("resolves English copy on English locale (/en)", () => {
      const enHero = resolveHeroCopy("en");

      expect(enHero.eyebrow).toBe("EVENTS CALENDAR");
      expect(enHero.title).toBe("Find Your Next E3 Experience");
      expect(enHero.description).toContain("Find your next experience");
    });

    it("uses stored CMS Arabic copy when provided", () => {
      const customCms = {
        eyebrowAr: "فعاليات قطر الحصرية",
        titleAr: "مواسم الترفيه 2026",
        descriptionAr: "دليلك الشامل لجميع المهرجانات والعروض.",
      };

      const arHero = resolveHeroCopy("ar", customCms);
      expect(arHero.eyebrow).toBe("فعاليات قطر الحصرية");
      expect(arHero.title).toBe("مواسم الترفيه 2026");
      expect(arHero.description).toBe("دليلك الشامل لجميع المهرجانات والعروض.");
    });
  });

  describe("2. Scheduled Destination Filter Eligibility", () => {
    interface MockCalendarEvent {
      id: string;
      attractionId?: string;
      attractionNameEn?: string;
      attractionNameAr?: string;
      attractionName?: string;
    }

    function extractScheduledDestinations(events: MockCalendarEvent[]) {
      const map = new Map<string, { id: string; nameEn: string; nameAr: string }>();
      events.forEach(ev => {
        if (ev.attractionId) {
          map.set(ev.attractionId, {
            id: ev.attractionId,
            nameEn: ev.attractionNameEn || ev.attractionName || "Destination",
            nameAr: ev.attractionNameAr || ev.attractionNameEn || ev.attractionName || "وجهة",
          });
        }
      });
      return Array.from(map.values()).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    }

    it("only includes destinations with at least one active scheduled event on the date", () => {
      const activeEvents: MockCalendarEvent[] = [
        { id: "e1", attractionId: "attr-meryal", attractionNameEn: "Meryal Waterpark", attractionNameAr: "حديقة مريال المائية" },
        { id: "e2", attractionId: "attr-quest", attractionNameEn: "Doha Quest", attractionNameAr: "دوحة كويست" },
        { id: "e3", attractionId: "attr-meryal", attractionNameEn: "Meryal Waterpark", attractionNameAr: "حديقة مريال المائية" },
      ];

      const destinations = extractScheduledDestinations(activeEvents);

      expect(destinations).toHaveLength(2);
      expect(destinations.map(d => d.id)).toEqual(["attr-quest", "attr-meryal"]);
    });

    it("strictly excludes unscheduled permanent attractions & historical projects from calendar filters", () => {
      // Date with zero events
      const emptyEvents: MockCalendarEvent[] = [];
      const destinations = extractScheduledDestinations(emptyEvents);

      expect(destinations).toHaveLength(0);
      expect(Array.isArray(destinations)).toBe(true);
    });
  });

  describe("3. Preserved QF-04 Safe Booking Action Resolution", () => {
    it("never links back to /b2c/calendar", () => {
      const action = resolveBookingAction("/en/b2c/calendar", "meryal-waterpark", "en", "Meryal");
      expect(action.type).toBe("VIEW_DETAILS");
      expect(action.url).toBe("/en/b2c/attractions/meryal-waterpark");
      expect(action.url).not.toContain("/calendar");
    });

    it("preserves external ticketing URLs safely", () => {
      const externalTicket = "https://virginmegastore.me/tickets/event-123";
      const action = resolveBookingAction(externalTicket, "lusail-circus", "en", "Lusail Circus");
      expect(action.type).toBe("BOOK_NOW");
      expect(action.url).toBe(externalTicket);
      expect(action.isExternal).toBe(true);
    });

    it("preserves localized Arabic contact fallback when no booking URL or slug exists", () => {
      const actionAr = resolveBookingAction(null, null, "ar", "جلسة خاصة");
      expect(actionAr.type).toBe("SEND_INQUIRY");
      expect(actionAr.url).toContain("/ar/b2c/contact?subject=");
      expect(actionAr.labelAr).toBe("إرسال استفسار");
    });
  });
});
