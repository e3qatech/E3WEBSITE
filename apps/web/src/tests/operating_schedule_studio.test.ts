import { describe, it, expect } from "vitest";
import {
  generateBilingualScheduleSummary,
  calculateQatarOperatingStatus,
  getTodayTimingDisplay,
  SCHEDULE_PRESETS,
  getDefaultTemporalStatus,
  formatTime12h,
} from "@/lib/operating-schedule-helper";

describe("Operating Schedule Helper & Studio Tests", () => {
  it("formats 24h time to 12h English and Arabic accurately", () => {
    expect(formatTime12h("10:00", false)).toBe("10:00 AM");
    expect(formatTime12h("13:00", false)).toBe("1:00 PM");
    expect(formatTime12h("22:00", false)).toBe("10:00 PM");
    expect(formatTime12h("23:30", false)).toBe("11:30 PM");

    expect(formatTime12h("10:00", true)).toContain("١٠:٠٠");
    expect(formatTime12h("10:00", true)).toContain("ص");
    expect(formatTime12h("13:00", true)).toContain("١:٠٠");
    expect(formatTime12h("13:00", true)).toContain("م");
  });

  it("compiles Qatar Mall Standard preset into concise bilingual summaries", () => {
    const qatarPreset = SCHEDULE_PRESETS.find(p => p.id === "qatar_mall_standard");
    expect(qatarPreset).toBeDefined();

    const summary = generateBilingualScheduleSummary(qatarPreset!.schedule);
    expect(summary.en).toContain("Sun–Wed: 12:00 PM – 10:00 PM");
    expect(summary.en).toContain("Thu: 12:00 PM – 11:00 PM");
    expect(summary.en).toContain("Fri: 1:00 PM – 11:00 PM");
    expect(summary.en).toContain("Sat: 10:00 AM – 10:00 PM");

    expect(summary.ar).toContain("أحد–أربعاء");
    expect(summary.ar).toContain("خميس");
    expect(summary.ar).toContain("جمعة");
    expect(summary.ar).toContain("سبت");
  });

  it("handles double/split shifts within a day in schedule summaries", () => {
    const splitPreset = SCHEDULE_PRESETS.find(p => p.id === "double_shift");
    expect(splitPreset).toBeDefined();

    const summary = generateBilingualScheduleSummary(splitPreset!.schedule);
    expect(summary.en).toContain("10:00 AM – 1:00 PM & 4:00 PM – 11:00 PM");
    expect(summary.ar).toContain("و");
  });

  it("calculates live Qatar operating status correctly for open, closed, and special dates", () => {
    const statusData = getDefaultTemporalStatus();

    // Test a specific time on a Sunday at 14:00 (Qatar Time) -> Should be OPEN
    const testSundayOpen = new Date("2026-10-18T11:00:00.000Z"); // 11:00 UTC = 14:00 Qatar GMT+3 (Sunday)
    const resultOpen = calculateQatarOperatingStatus(statusData, testSundayOpen);
    expect(resultOpen.isOpen).toBe(true);
    expect(resultOpen.statusTextEn).toBe("OPEN NOW");

    // Test a specific time on a Sunday at 08:00 (Qatar Time) -> Should be CLOSED - OPENS LATER TODAY
    const testSundayMorning = new Date("2026-10-18T05:00:00.000Z"); // 05:00 UTC = 08:00 Qatar GMT+3
    const resultClosed = calculateQatarOperatingStatus(statusData, testSundayMorning);
    expect(resultClosed.isOpen).toBe(false);
    expect(resultClosed.statusTextEn).toContain("OPENS LATER");

    // Test a special holiday exception
    const holidayData = {
      ...statusData,
      specialDates: [
        {
          id: "nd-1",
          date: "2026-12-18",
          reasonEn: "Qatar National Day",
          reasonAr: "اليوم الوطني لدولة قطر",
          isClosed: true,
        }
      ]
    };
    const testNationalDay = new Date("2026-12-18T11:00:00.000Z"); // 18 Dec 2026
    const resultHoliday = calculateQatarOperatingStatus(holidayData, testNationalDay);
    expect(resultHoliday.isOpen).toBe(false);
    expect(resultHoliday.statusTextEn).toBe("CLOSED (SPECIAL DATE)");
  });

  it("evaluates seasonal date-range lifespan", () => {
    const seasonalData = {
      ...getDefaultTemporalStatus(),
      lifespanType: "SEASONAL" as const,
      startDate: "2026-11-01",
      endDate: "2026-12-31",
      isOngoing: false,
    };

    // Before start date
    const beforeSeason = new Date("2026-10-15T10:00:00.000Z");
    const resultBefore = calculateQatarOperatingStatus(seasonalData, beforeSeason);
    expect(resultBefore.isOpen).toBe(false);
    expect(resultBefore.statusTextEn).toBe("SEASONAL - COMING SOON");

    // After end date
    const afterSeason = new Date("2027-01-10T10:00:00.000Z");
    const resultAfter = calculateQatarOperatingStatus(seasonalData, afterSeason);
    expect(resultAfter.isOpen).toBe(false);
    expect(resultAfter.statusTextEn).toBe("SEASON CONCLUDED");
  });

  it("resolves clean single-day timing for the current day without clutter", () => {
    const statusData = getDefaultTemporalStatus();

    // Test a Sunday
    const testSunday = new Date("2026-10-18T11:00:00.000Z"); // Sunday in Qatar
    const sundayTiming = getTodayTimingDisplay(statusData, "en", testSunday);
    expect(sundayTiming.timingsEn).toBe("12:00 PM – 10:00 PM");
    expect(sundayTiming.isClosed).toBe(false);
    expect(sundayTiming.todayLabelEn).toBe("Today (Sun)");

    // Test a Friday
    const testFriday = new Date("2026-10-23T11:00:00.000Z"); // Friday in Qatar
    const fridayTiming = getTodayTimingDisplay(statusData, "en", testFriday);
    expect(fridayTiming.timingsEn).toBe("1:00 PM – 11:00 PM");
    expect(fridayTiming.todayLabelEn).toBe("Today (Fri)");

    // Test a Saturday
    const testSaturday = new Date("2026-10-24T11:00:00.000Z"); // Saturday in Qatar
    const saturdayTiming = getTodayTimingDisplay(statusData, "en", testSaturday);
    expect(saturdayTiming.timingsEn).toBe("10:00 AM – 10:00 PM");
    expect(saturdayTiming.todayLabelEn).toBe("Today (Sat)");
  });

  it("filters out add-on tickets (e.g. grip socks, lockers) when calculating starting admission price", async () => {
    const { isAddonPricingTier, calculateAttractionStartingPrice } = await import("@/lib/operating-schedule-helper");

    expect(isAddonPricingTier({ titleEn: "Grip Socks", price: 5, type: "ADD_ON" })).toBe(true);
    expect(isAddonPricingTier({ titleEn: "Locker Rental", price: 10, type: "ACCESS_PASS" })).toBe(true);
    expect(isAddonPricingTier({ titleAr: "جوارب السلامة", price: 5, type: "GENERAL" })).toBe(true);
    expect(isAddonPricingTier({ titleEn: "25-Minute Session", price: 35, type: "ACCESS_PASS" })).toBe(false);
    expect(isAddonPricingTier({ titleEn: "Pro Pass – 90 Minutes", price: 90, type: "ACCESS_PASS" })).toBe(false);

    // Test InflataPark pricing with 5 QAR addon socks and 35 QAR session pass
    const inflataPark = {
      nameEn: "InflataPark",
      accessModel: "PAID",
      pricing: [
        { titleEn: "Safety Grip Socks", price: 5, type: "ADD_ON" },
        { titleEn: "25-Minute Session", price: 35, type: "ACCESS_PASS" },
        { titleEn: "50-Minute Session", price: 65, type: "ACCESS_PASS" },
        { titleEn: "Birthday / Group Package", price: 0, type: "ACCESS_PASS" }
      ]
    };

    const startingPrice = calculateAttractionStartingPrice(inflataPark);
    expect(startingPrice).toBe(35); // MUST be 35 QAR, NOT 5 QAR addon or 0 QAR inquiry package!

    // Test Free Attraction
    const freeAttraction = {
      nameEn: "Free Plaza Event",
      accessModel: "FREE",
      pricing: []
    };
    expect(calculateAttractionStartingPrice(freeAttraction)).toBe(0);
  });
});
