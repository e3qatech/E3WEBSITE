import { describe, it, expect } from "vitest";
import {
  QATAR_TIMEZONE,
  QATAR_UTC_OFFSET_HOURS,
  getQatarDayBoundaries,
  isEventActiveOnQatarDate,
  resolveBookingAction,
} from "@/lib/qatar-calendar";

describe("QF-04 — Qatar Calendar Date, Event-Occurrence & Booking Logic Verification", () => {
  describe("1. Qatar Timezone & Day Boundaries (Asia/Qatar UTC+3)", () => {
    it("verifies constant Qatar timezone metadata", () => {
      expect(QATAR_TIMEZONE).toBe("Asia/Qatar");
      expect(QATAR_UTC_OFFSET_HOURS).toBe(3);
    });

    it("calculates exact UTC boundaries for a given Qatar date (e.g. 2026-08-14)", () => {
      const bounds = getQatarDayBoundaries("2026-08-14");

      expect(bounds.qatarDateString).toBe("2026-08-14");
      expect(bounds.year).toBe(2026);
      expect(bounds.month).toBe(8);
      expect(bounds.day).toBe(14);

      // Qatar Midnight (00:00:00.000 +03:00) = 2026-08-13T21:00:00.000Z in UTC
      expect(bounds.startUtc.toISOString()).toBe("2026-08-13T21:00:00.000Z");

      // Qatar End of Day (23:59:59.999 +03:00) = 2026-08-14T20:59:59.999Z in UTC
      expect(bounds.endUtc.toISOString()).toBe("2026-08-14T20:59:59.999Z");

      // 2026-08-14 is a Friday (dayOfWeek = 5)
      expect(bounds.dayOfWeek).toBe(5);
    });

    it("handles Date objects and parses boundaries consistently", () => {
      const dateObj = new Date("2026-12-18T10:00:00Z"); // Qatar National Day
      const bounds = getQatarDayBoundaries(dateObj);

      expect(bounds.qatarDateString).toBe("2026-12-18");
      expect(bounds.startUtc.toISOString()).toBe("2026-12-17T21:00:00.000Z");
      expect(bounds.endUtc.toISOString()).toBe("2026-12-18T20:59:59.999Z");
    });
  });

  describe("2. Single-Day and Multi-Day Event Occurrence Matching", () => {
    it("matches a single-day event occurring within the target Qatar day", () => {
      const singleDayEvent = {
        startDate: "2026-08-14T14:00:00.000Z", // 17:00 Qatar time
        endDate: "2026-08-14T20:00:00.000Z",   // 23:00 Qatar time
        status: "PUBLISHED",
        isPublished: true,
      };

      expect(isEventActiveOnQatarDate(singleDayEvent, "2026-08-14")).toBe(true);
      expect(isEventActiveOnQatarDate(singleDayEvent, "2026-08-15")).toBe(false);
      expect(isEventActiveOnQatarDate(singleDayEvent, "2026-08-13")).toBe(false);
    });

    it("matches multi-day festivals across all spanned dates", () => {
      const festivalEvent = {
        startDate: "2026-08-10T09:00:00.000Z", // 12:00 Qatar time on Aug 10
        endDate: "2026-08-20T18:00:00.000Z",   // 21:00 Qatar time on Aug 20
        status: "PUBLISHED",
        isPublished: true,
      };

      // Spanned dates
      expect(isEventActiveOnQatarDate(festivalEvent, "2026-08-10")).toBe(true);
      expect(isEventActiveOnQatarDate(festivalEvent, "2026-08-14")).toBe(true);
      expect(isEventActiveOnQatarDate(festivalEvent, "2026-08-20")).toBe(true);

      // Outside dates in Qatar
      expect(isEventActiveOnQatarDate(festivalEvent, "2026-08-09")).toBe(false);
      expect(isEventActiveOnQatarDate(festivalEvent, "2026-08-21")).toBe(false);
    });
  });

  describe("3. Recurring Events & Day-of-Week Filtering", () => {
    it("respects recurring day-of-week constraints (e.g. weekend only)", () => {
      const weekendEvent = {
        startDate: "2026-08-01T00:00:00.000Z",
        endDate: "2026-08-31T23:59:59.000Z",
        status: "PUBLISHED",
        daysOfWeek: [5, 6], // Friday (5) and Saturday (6) in Qatar
      };

      // 2026-08-14 is Friday (5) -> Matches
      expect(isEventActiveOnQatarDate(weekendEvent, "2026-08-14")).toBe(true);

      // 2026-08-15 is Saturday (6) -> Matches
      expect(isEventActiveOnQatarDate(weekendEvent, "2026-08-15")).toBe(true);

      // 2026-08-16 is Sunday (0) -> Rejected
      expect(isEventActiveOnQatarDate(weekendEvent, "2026-08-16")).toBe(false);

      // 2026-08-17 is Monday (1) -> Rejected
      expect(isEventActiveOnQatarDate(weekendEvent, "2026-08-17")).toBe(false);
    });
  });

  describe("4. Historical & Past Events Exclusion", () => {
    it("strictly excludes past 2024 events when querying 2026 dates", () => {
      const historicalEvent = {
        startDate: "2024-04-10T13:00:00.000Z",
        endDate: "2024-04-25T23:00:00.000Z",
        status: "PUBLISHED",
      };

      expect(isEventActiveOnQatarDate(historicalEvent, "2026-08-14")).toBe(false);
      expect(isEventActiveOnQatarDate(historicalEvent, "2024-04-15")).toBe(true);
    });
  });

  describe("5. Status Guard: Cancelled, Postponed, Draft, and Hidden Events", () => {
    it("rejects CANCELLED and POSTPONED events", () => {
      const cancelledEvent = {
        startDate: "2026-08-14T10:00:00.000Z",
        endDate: "2026-08-14T20:00:00.000Z",
        status: "CANCELLED",
      };
      const postponedEvent = {
        startDate: "2026-08-14T10:00:00.000Z",
        endDate: "2026-08-14T20:00:00.000Z",
        status: "POSTPONED",
      };

      expect(isEventActiveOnQatarDate(cancelledEvent, "2026-08-14")).toBe(false);
      expect(isEventActiveOnQatarDate(postponedEvent, "2026-08-14")).toBe(false);
    });

    it("rejects DRAFT, UNPUBLISHED, and isHidden events", () => {
      const draftEvent = {
        startDate: "2026-08-14T10:00:00.000Z",
        endDate: "2026-08-14T20:00:00.000Z",
        status: "DRAFT",
      };
      const hiddenEvent = {
        startDate: "2026-08-14T10:00:00.000Z",
        endDate: "2026-08-14T20:00:00.000Z",
        status: "PUBLISHED",
        isHidden: true,
      };

      expect(isEventActiveOnQatarDate(draftEvent, "2026-08-14")).toBe(false);
      expect(isEventActiveOnQatarDate(hiddenEvent, "2026-08-14")).toBe(false);
    });
  });

  describe("6. Booking URL Safety & Self-Referencing Loop Prevention", () => {
    it("rejects self-referencing calendar links and falls back to View Details / Send Inquiry", () => {
      const selfLinks = [
        "/b2c/calendar",
        "/calendar",
        "/events",
        "/en/b2c/calendar",
        "/ar/b2c/calendar",
        "https://e3.qa/b2c/calendar",
        "https://e3.qa/en/b2c/calendar",
      ];

      for (const link of selfLinks) {
        const action = resolveBookingAction(link, "meryal-waterpark", "en", "Meryal Waterpark");
        expect(action.type).toBe("VIEW_DETAILS");
        expect(action.url).toBe("/en/b2c/attractions/meryal-waterpark");
        expect(action.url).not.toContain("/calendar");
      }
    });

    it("handles valid external ticketing URLs (e.g. BookingQube, Virgin Megastore)", () => {
      const externalUrl = "https://bookingqube.com/checkout?slot=123";
      const action = resolveBookingAction(externalUrl, "doha-quest", "en", "Doha Quest");

      expect(action.type).toBe("BOOK_NOW");
      expect(action.url).toBe(externalUrl);
      expect(action.isExternal).toBe(true);
      expect(action.labelEn).toBe("Book Now");
      expect(action.labelAr).toBe("احجز الآن");
    });

    it("handles valid internal booking URLs without looping to calendar", () => {
      const internalUrl = "/b2c/attractions/doha-quest#tickets";
      const action = resolveBookingAction(internalUrl, "doha-quest", "en", "Doha Quest");

      expect(action.type).toBe("BOOK_NOW");
      expect(action.url).toBe("/en/b2c/attractions/doha-quest#tickets");
      expect(action.isExternal).toBe(false);
    });

    it("falls back to Send Inquiry when no ticketing URL and no attraction slug exist", () => {
      const action = resolveBookingAction(null, null, "en", "Custom Expo Session");

      expect(action.type).toBe("SEND_INQUIRY");
      expect(action.url).toContain("/en/b2c/contact?subject=");
      expect(action.labelEn).toBe("Send Inquiry");
      expect(action.labelAr).toBe("إرسال استفسار");
    });
  });

  describe("7. Bilingual Route & Action Label Verification", () => {
    it("generates correct Arabic routes and labels when locale is ar", () => {
      const actionEn = resolveBookingAction(null, "doha-quest", "en", "Doha Quest");
      const actionAr = resolveBookingAction(null, "doha-quest", "ar", "دوحة كويست");

      expect(actionEn.url).toBe("/en/b2c/attractions/doha-quest");
      expect(actionAr.url).toBe("/ar/b2c/attractions/doha-quest");

      expect(actionEn.labelEn).toBe("View Details");
      expect(actionAr.labelAr).toBe("عرض التفاصيل");
    });
  });
});
