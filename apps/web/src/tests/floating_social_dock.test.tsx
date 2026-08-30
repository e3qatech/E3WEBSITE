import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FloatingSocialDock } from "@/components/layout/FloatingSocialDock";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/b2b",
}));

describe("FloatingSocialDock Component", () => {
  it("renders all 5 social media platforms including WhatsApp with correct links and user IDs", () => {
    const html = renderToStaticMarkup(<FloatingSocialDock />);

    // 1. Check all 5 platforms are present
    expect(html).toContain("Instagram");
    expect(html).toContain("YouTube");
    expect(html).toContain("LinkedIn");
    expect(html).toContain("Facebook");
    expect(html).toContain("WhatsApp");

    // 2. Check User IDs / handles
    expect(html).toContain("@e3qatar");
    expect(html).toContain("E3 Qatar");
    expect(html).toContain("e3qatar");
    expect(html).toContain("+974 5113 8418");

    // 3. Check official external URLs
    expect(html).toContain("https://www.instagram.com/e3qatar");
    expect(html).toContain("https://www.youtube.com/@e3qatar");
    expect(html).toContain("https://www.linkedin.com/company/e3qatar");
    expect(html).toContain("https://www.facebook.com/e3qatar");
    expect(html).toContain("https://wa.me/97451138418");

    // 4. Check secure target blank attributes
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
