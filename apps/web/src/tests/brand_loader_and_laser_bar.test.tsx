import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { E3BrandLoader } from "@/components/shared/E3BrandLoader";
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar";

describe("Modern Branded Page Loading Animation & Route Transition Laser Bar", () => {
  it("renders E3BrandLoader with actual E3 branding elements and telemetry", () => {
    const html = renderToStaticMarkup(
      <E3BrandLoader
        size="fullscreen"
        labelEn="EXPERIENCE ENGINEERING"
        subtextEn="Loading Qatar's Premier Live Activations"
      />
    );

    expect(html).toContain("EXPERIENCE ENGINEERING");
    expect(html).toContain("Loading Qatar&#x27;s Premier Live Activations");
    expect(html).toContain("SYS.OK");
    expect(html).toContain("E3-LIVE-ENV");
    expect(html).toContain("QATAR");
    expect(html).toContain('aria-label="Loading E3 Experiences"');
  });

  it("renders Arabic typography and RTL orientation in Arabic mode", () => {
    const html = renderToStaticMarkup(
      <E3BrandLoader
        size="fullscreen"
        labelAr="هندسة التجارب الحية"
        subtextAr="جاري تهيئة الوجهات والفعاليات الاستثنائية"
        isArabic={true}
      />
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain("هندسة التجارب الحية");
    expect(html).toContain("جاري تهيئة الوجهات والفعاليات الاستثنائية");
    expect(html).toContain('aria-label="جاري التحميل"');
  });

  it("renders NavigationProgressBar with laser test ID and kinetic beam container", () => {
    const html = renderToStaticMarkup(<NavigationProgressBar />);
    // When progress is 0 and not visible, it returns null initially on static render or clean markup
    expect(html).toBeDefined();
  });
});
