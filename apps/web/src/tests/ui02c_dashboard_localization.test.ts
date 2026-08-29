import { describe, it, expect } from "vitest";
import {
  getBreadcrumbTranslation,
  getDashboardControlTranslation,
  DASHBOARD_SEGMENT_MAP,
  GENERAL_SETTINGS_SECTIONS,
  PACKAGES_PAGE_SECTIONS,
  GATEWAY_PAGE_SECTIONS,
} from "@/lib/dashboard-dictionary";
import { localizeHref } from "@/lib/url-helper";

describe("UI-02-C Arabic Dashboard Localization & Controls", () => {
  describe("1. Shared Breadcrumb Dictionary & Path Segment Translations", () => {
    it("translates primary navigation segments to Arabic accurately", () => {
      expect(getBreadcrumbTranslation("dashboard", "ar")).toBe("لوحة التحكم");
      expect(getBreadcrumbTranslation("b2c", "ar")).toBe("الأفراد والتجارب");
      expect(getBreadcrumbTranslation("b2b", "ar")).toBe("الأعمال والمشاريع");
      expect(getBreadcrumbTranslation("settings", "ar")).toBe("الإعدادات");
      expect(getBreadcrumbTranslation("general", "ar")).toBe("الإعدادات العامة");
      expect(getBreadcrumbTranslation("gateway", "ar")).toBe("بوابة الدخول");
      expect(getBreadcrumbTranslation("packages", "ar")).toBe("الباقات والاحتفالات");
      expect(getBreadcrumbTranslation("packages-page", "ar")).toBe("محرر صفحة الباقات");
      expect(getBreadcrumbTranslation("attractions", "ar")).toBe("الوجهات والتجارب");
      expect(getBreadcrumbTranslation("calendar", "ar")).toBe("جدول المواعيد والفعاليات");
      expect(getBreadcrumbTranslation("crm", "ar")).toBe("إدارة العملاء والاستفسارات");
      expect(getBreadcrumbTranslation("leads", "ar")).toBe("العملاء المحتملين");
      expect(getBreadcrumbTranslation("social-media", "ar")).toBe("إدارة التواصل الاجتماعي");
      expect(getBreadcrumbTranslation("temporal-rules", "ar")).toBe("القواعد الزمنية");
      expect(getBreadcrumbTranslation("insights", "ar")).toBe("التحليلات والمؤشرات");
      expect(getBreadcrumbTranslation("ui", "ar")).toBe("واجهة المستخدم والمظهر");
      expect(getBreadcrumbTranslation("seo", "ar")).toBe("محركات البحث والبيانات الوصفية");
      expect(getBreadcrumbTranslation("operations", "ar")).toBe("العمليات التشغيلية");
      expect(getBreadcrumbTranslation("events", "ar")).toBe("جداول المواعيد والسعة");
    });

    it("returns correct English fallback labels for English locale", () => {
      expect(getBreadcrumbTranslation("dashboard", "en")).toBe("Dashboard");
      expect(getBreadcrumbTranslation("packages-page", "en")).toBe("Packages Page Editor");
      expect(getBreadcrumbTranslation("gateway", "en")).toBe("Portal Gateway");
      expect(getBreadcrumbTranslation("general", "en")).toBe("General Settings");
      expect(getBreadcrumbTranslation("operations", "en")).toBe("Operations");
      expect(getBreadcrumbTranslation("events", "en")).toBe("Events");
    });

    it("handles unknown segment gracefully by capitalizing and removing dashes", () => {
      expect(getBreadcrumbTranslation("custom-unknown-path", "ar")).toBe("Custom unknown path");
      expect(getBreadcrumbTranslation("custom-unknown-path", "en")).toBe("Custom unknown path");
    });
  });

  describe("2. Shared Dashboard Chrome & Standard Controls", () => {
    it("provides Arabic translations for all shared action controls", () => {
      expect(getDashboardControlTranslation("jumpTo", "ar")).toBe("الانتقال السريع");
      expect(getDashboardControlTranslation("allSections", "ar")).toBe("جميع الأقسام");
      expect(getDashboardControlTranslation("prevSection", "ar")).toBe("القسم السابق");
      expect(getDashboardControlTranslation("nextSection", "ar")).toBe("القسم التالي");
      expect(getDashboardControlTranslation("saveSettings", "ar")).toBe("حفظ الإعدادات");
      expect(getDashboardControlTranslation("saving", "ar")).toBe("جاري الحفظ...");
      expect(getDashboardControlTranslation("saved", "ar")).toBe("تم الحفظ");
      expect(getDashboardControlTranslation("unsavedChanges", "ar")).toBe("تغييرات غير محفوظة");
      expect(getDashboardControlTranslation("previewPublicPage", "ar")).toBe("معاينة الصفحة العامة");
      expect(getDashboardControlTranslation("themePreference", "ar")).toBe("تفضيل المظهر");
      expect(getDashboardControlTranslation("themeLight", "ar")).toBe("فاتح");
      expect(getDashboardControlTranslation("themeDark", "ar")).toBe("داكن");
      expect(getDashboardControlTranslation("themeSystem", "ar")).toBe("تلقائي (النظام)");
      expect(getDashboardControlTranslation("searchPlaceholder", "ar")).toBe("البحث في لوحة التحكم...");
      expect(getDashboardControlTranslation("openMenu", "ar")).toBe("فتح قائمة التنقل");
    });

    it("provides English fallback translations for English locale", () => {
      expect(getDashboardControlTranslation("jumpTo", "en")).toBe("Jump to");
      expect(getDashboardControlTranslation("prevSection", "en")).toBe("Previous Section");
      expect(getDashboardControlTranslation("nextSection", "en")).toBe("Next Section");
      expect(getDashboardControlTranslation("themePreference", "en")).toBe("Theme Preference");
    });
  });

  describe("3. Dynamic Preview Link Localization", () => {
    it("prepends /ar for Arabic dashboard preview links without trailing slash duplicates", () => {
      expect(localizeHref("/b2c/packages", "ar")).toBe("/ar/b2c/packages");
      expect(localizeHref("/", "ar")).toBe("/ar");
      expect(localizeHref("/b2b", "ar")).toBe("/ar/b2b");
      expect(localizeHref("/b2b/services/family-entertainment-centers", "ar")).toBe(
        "/ar/b2b/services/fec-development"
      );
      expect(localizeHref("/b2c/attractions/snow-dunes", "ar")).toBe(
        "/ar/b2c/attractions/snow-dunes"
      );
    });

    it("prepends /en for English dashboard preview links", () => {
      expect(localizeHref("/b2c/packages", "en")).toBe("/en/b2c/packages");
      expect(localizeHref("/", "en")).toBe("/en");
      expect(localizeHref("/b2b", "en")).toBe("/en/b2b");
    });

    it("swaps existing locale prefix correctly when switching locales", () => {
      expect(localizeHref("/en/b2c/packages", "ar")).toBe("/ar/b2c/packages");
      expect(localizeHref("/ar/b2c/packages", "en")).toBe("/en/b2c/packages");
    });

    it("leaves external preview links untouched", () => {
      expect(localizeHref("https://booking.e3.qa", "ar")).toBe("https://booking.e3.qa");
      expect(localizeHref("https://instagram.com/e3qatar", "ar")).toBe("https://instagram.com/e3qatar");
    });
  });

  describe("4. Pilot Pages Section Dictionaries", () => {
    it("has complete Arabic section labels for General Settings", () => {
      const ids = ["identity", "branding", "contact", "social", "tickets", "integrations", "gateway"];
      ids.forEach((id) => {
        const item = GENERAL_SETTINGS_SECTIONS[id];
        expect(item).toBeDefined();
        expect(item.ar).toBeTruthy();
        expect(item.en).toBeTruthy();
      });
      expect(GENERAL_SETTINGS_SECTIONS.identity.ar).toBe("1. هوية المنصة");
      expect(GENERAL_SETTINGS_SECTIONS.branding.ar).toBe("2. الشعارات والأيقونة");
    });

    it("has complete Arabic section labels for Packages Page Editor", () => {
      const ids = ["headlines", "ctas", "hero-media", "footer-media"];
      ids.forEach((id) => {
        const item = PACKAGES_PAGE_SECTIONS[id];
        expect(item).toBeDefined();
        expect(item.ar).toBeTruthy();
        expect(item.en).toBeTruthy();
      });
      expect(PACKAGES_PAGE_SECTIONS.headlines.ar).toBe("1. العناوين والنصوص الترويجية");
      expect(PACKAGES_PAGE_SECTIONS.ctas.ar).toBe("2. أزرار الحجز والأسعار والشارات");
    });

    it("has complete Arabic section labels for Gateway Customization", () => {
      const ids = ["english", "arabic", "logo", "b2c_media", "b2b_media", "visual", "seo", "preview", "versions"];
      ids.forEach((id) => {
        const item = GATEWAY_PAGE_SECTIONS[id];
        expect(item).toBeDefined();
        expect(item.ar).toBeTruthy();
        expect(item.en).toBeTruthy();
      });
      expect(GATEWAY_PAGE_SECTIONS.english.ar).toBe("1. المحتوى الإنجليزي");
      expect(GATEWAY_PAGE_SECTIONS.arabic.ar).toBe("2. المحتوى العربي");
      expect(GATEWAY_PAGE_SECTIONS.versions.ar).toBe("9. سجل الإصدارات والاسترجاع");
    });
  });

  describe("5. Dictionary Coverage Audit Across Dashboard Segments", () => {
    it("contains translations for all standard dashboard root and sub routes", () => {
      const requiredSegments = [
        "dashboard",
        "b2c",
        "b2b",
        "settings",
        "general",
        "gateway",
        "packages",
        "packages-page",
        "attractions",
        "attractions-page",
        "calendar",
        "calendar-page",
        "contact",
        "landing",
        "discover",
        "locations",
        "brands",
        "crm",
        "leads",
        "inquiries",
        "clients",
        "subscribers",
        "talent",
        "careers",
        "applications",
        "operations",
        "broadcast",
        "catalog",
        "recap",
        "temporal-rules",
        "ticketing",
        "partners",
        "social-media",
        "insights",
        "seo",
        "ui",
        "approvals",
        "pulse-orbit",
        "users",
        "media",
        "services",
        "cases",
        "team",
        "faqs",
        "feedback",
        "about",
      ];

      requiredSegments.forEach((segment) => {
        expect(
          DASHBOARD_SEGMENT_MAP[segment],
          `Missing translation entry for dashboard segment: ${segment}`
        ).toBeDefined();
        expect(DASHBOARD_SEGMENT_MAP[segment].ar.length).toBeGreaterThan(0);
        expect(DASHBOARD_SEGMENT_MAP[segment].en.length).toBeGreaterThan(0);
      });
    });
  });
});
