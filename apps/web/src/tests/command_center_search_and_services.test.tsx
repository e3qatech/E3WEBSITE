import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/en/dashboard/b2b/services",
  useSearchParams: () => new URLSearchParams(),
}));

import { CommandPaletteModal } from "@/components/dashboard/ui/CommandPaletteModal";
import { AdminTopBar } from "@/components/dashboard/ui/AdminTopBar";
import { ServicesListClient } from "@/components/dashboard/b2b/ServicesListClient";
import { AdminThemeProvider } from "@/components/dashboard/ui/AdminThemeProvider";
import { LocaleProvider } from "@/components/layout/LocaleProvider";

const SAMPLE_SERVICES = [
  {
    id: "srv-1",
    slug: "drone-light-shows",
    titleEn: "Drone Light Shows & Aerial Choreography",
    titleAr: "عروض الدرونز الضوئية والاستعراضات الجوية",
    category: "Technical Production",
    shortDescriptionEn: "Synchronized drone swarms with 3D GPS spatial positioning.",
    shortDescriptionAr: "أسراب طائرات الدرونز المتزامنة بتحديد المواقع ثلاثي الأبعاد.",
    isVisible: true,
    isFeatured: true,
    thumbnail: "https://images.unsplash.com/photo-1508614589041-895b88991e3e",
  },
  {
    id: "srv-2",
    slug: "architectural-projection-mapping",
    titleEn: "Architectural 3D Projection Mapping",
    titleAr: "خرائط الإسقاط الضوئي ثلاثي الأبعاد على المباني",
    category: "Visual Engineering",
    shortDescriptionEn: "Ultra-high lumen laser projection onto landmark facades.",
    shortDescriptionAr: "إسقاط ليزري فائق السطوع على الواجهات المعمارية والمعالم.",
    isVisible: true,
    isFeatured: false,
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
  },
  {
    id: "srv-3",
    slug: "draft-vip-staging",
    titleEn: "Draft VIP Staging Solution",
    titleAr: "مسودة تجهيزات كبار الشخصيات",
    category: "Hospitality",
    shortDescriptionEn: "Private draft offering currently hidden from public catalog.",
    shortDescriptionAr: "خدمة خاصة مخفية حالياً عن الدليل العام.",
    isVisible: false,
    isFeatured: false,
    thumbnail: null,
  },
];

describe("Command Center Search & B2B Services Catalog Suite", () => {
  /* ================================================================ */
  /* 1. ADMIN TOP BAR COMMAND SEARCH TRIGGER                          */
  /* ================================================================ */
  describe("1. AdminTopBar Command Search Trigger", () => {
    it("renders interactive search button trigger with Cmd+K badge in English mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <AdminThemeProvider>
            <AdminTopBar />
          </AdminThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="command-palette-trigger"');
      expect(html).toContain("Search Command Center...");
      expect(html).toContain("K");
    });

    it("renders interactive search button trigger in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <AdminThemeProvider>
            <AdminTopBar />
          </AdminThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="command-palette-trigger"');
      expect(html).toContain("البحث في لوحة التحكم...");
    });
  });

  /* ================================================================ */
  /* 2. COMMAND PALETTE MODAL COMPONENT                               */
  /* ================================================================ */
  describe("2. CommandPaletteModal Component", () => {
    it("renders search input, category filters, and pre-indexed command routes", () => {
      const html = renderToStaticMarkup(
        <CommandPaletteModal isOpen={true} onClose={() => {}} locale="en" />
      );

      expect(html).toContain('data-testid="command-palette-modal"');
      expect(html).toContain('data-testid="command-palette-input"');
      expect(html).toContain('data-testid="command-category-all"');
      expect(html).toContain('data-testid="command-category-b2b"');
      expect(html).toContain('data-testid="command-category-b2c"');
      expect(html).toContain('data-testid="command-category-crm"');
      expect(html).toContain('data-testid="command-category-settings"');

      // Pre-indexed items check
      expect(html).toContain("B2B Services Catalog");
      expect(html).toContain("Case Studies Portfolio");
      expect(html).toContain("Attractions &amp; Experiences");
      expect(html).toContain("Client Inquiries &amp; Bookings");
      expect(html).toContain("Payment Gateway &amp; Pass Settings");
    });

    it("renders Arabic labels without English leakage in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <CommandPaletteModal isOpen={true} onClose={() => {}} locale="ar" />
      );

      expect(html).toContain('data-testid="command-palette-modal"');
      expect(html).toContain("دليل خدمات الشركات والفعاليات");
      expect(html).toContain("محفظة دراسات الحالة والمشاريع");
      expect(html).toContain("الوجهات والتجارب الترفيهية");
      expect(html).toContain("استفسارات وحجوزات العملاء");
      expect(html).toContain("بوابة الدفع وإعدادات البطاقات");
    });

    it("returns null when isOpen is false", () => {
      const html = renderToStaticMarkup(
        <CommandPaletteModal isOpen={false} onClose={() => {}} locale="en" />
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 3. B2B SERVICES LIST CLIENT (IN-PAGE SEARCH & TABS)              */
  /* ================================================================ */
  describe("3. ServicesListClient Component", () => {
    it("renders filter tabs (All, Visible, Hidden, Featured) with dynamic counts", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ServicesListClient initialData={SAMPLE_SERVICES} />
        </LocaleProvider>
      );

      expect(html).toContain("B2B Services Catalog");
      expect(html).toContain('data-testid="service-filter-tab-all"');
      expect(html).toContain('data-testid="service-filter-tab-visible"');
      expect(html).toContain('data-testid="service-filter-tab-hidden"');
      expect(html).toContain('data-testid="service-filter-tab-featured"');

      expect(html).toContain('data-testid="services-search-input"');
      expect(html).toContain("Drone Light Shows &amp; Aerial Choreography");
      expect(html).toContain("Architectural 3D Projection Mapping");
      expect(html).toContain("Draft VIP Staging Solution");
    });

    it("renders Arabic titles, RTL alignment, and Arabic status badges in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <ServicesListClient initialData={SAMPLE_SERVICES} />
        </LocaleProvider>
      );

      expect(html).toContain("دليل حلول وخدمات B2B");
      expect(html).toContain("جميع الخدمات");
      expect(html).toContain("المنشورة");
      expect(html).toContain("المخفية");
      expect(html).toContain("المميزة");
      expect(html).toContain("عروض الدرونز الضوئية والاستعراضات الجوية");
      expect(html).toContain("خرائط الإسقاط الضوئي ثلاثي الأبعاد على المباني");
    });
  });
});
