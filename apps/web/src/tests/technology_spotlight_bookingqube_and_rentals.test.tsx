import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DiscoverClient } from "@/components/b2c/DiscoverClient";
import { DEFAULT_B2C_DISCOVER_CONTENT } from "@/lib/cms-default-pages";

describe("BookingQube & E3 Rentals Technology Spotlights", () => {
  it("renders centered BookingQube and complete E3 Rentals spotlight sections", () => {
    const html = renderToStaticMarkup(
      <DiscoverClient
        locale="en"
        initialSettings={DEFAULT_B2C_DISCOVER_CONTENT}
      />
    );

    // 1. Check BookingQube spotlight exists
    expect(html).toContain("BookingQube™");
    expect(html).toContain("PROPRIETARY ECOSYSTEM TECH");
    expect(html).toContain("Instant Mobile Ticketing");
    expect(html).toContain("Turnstile &amp; Gate Control");
    expect(html).toContain("Live Capacity Analytics");

    // 2. Check E3 Rentals spotlight exists as complete duplicate
    expect(html).toContain("E3 Rentals™");
    expect(html).toContain("PROPRIETARY FLEET &amp; STAGING TECH");
    expect(html).toContain("Rapid Asset &amp; Fleet Deployment");
    expect(html).toContain("Concert Audio, Lighting &amp; FX");
    expect(html).toContain("Structural Rigging &amp; Load Safety");
    expect(html).toContain("Synchronized Power &amp; Grid Distribution");

    // 3. Check cards use centered flex layout
    expect(html).toContain("flex flex-wrap justify-center items-stretch gap-6 max-w-7xl mx-auto");
  });

  it("renders both spotlights with Arabic translations in Arabic mode", () => {
    const htmlAr = renderToStaticMarkup(
      <DiscoverClient
        locale="ar"
        initialSettings={DEFAULT_B2C_DISCOVER_CONTENT}
      />
    );

    expect(htmlAr).toContain("مدعوم بنظام بوكينج كيوب™");
    expect(htmlAr).toContain("مدعوم بمنظومة إي ثري للتأجير والتجهيز™");
    expect(htmlAr).toContain("تجهيز وتوريد الأصول والأسطول");
    expect(htmlAr).toContain("أنظمة الصوت والإضاءة والمؤثرات");
    expect(htmlAr).toContain("هندسة التعليق والسلامة الإنشائية");
    expect(htmlAr).toContain("شبكات الطاقة والتوزيع المتزامن");
  });
});
