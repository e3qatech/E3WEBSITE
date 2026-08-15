import { describe, it, expect } from "vitest";
import {
  getMergedCMSPageContent,
  DEFAULT_B2C_SECTION_SEQUENCE,
} from "@/lib/cms-default-pages";

describe("QF-25 — B2C Landing Section Sequence, Visibility, and Media Uploads", () => {
  describe("1. Section Sequence & Visibility Normalization", () => {
    it("preserves custom user-defined section sequence order when provided in sectionSequence", () => {
      const customSequence = [
        { id: "ourBrands", enabled: true },
        { id: "hero", enabled: true },
        { id: "experienceWorlds", enabled: true },
        { id: "livingDay", enabled: false }, // Hidden
      ];

      const merged = getMergedCMSPageContent("b2c-landing", {
        sectionSequence: customSequence,
      });

      expect(merged.sectionSequence).toBeDefined();
      expect(merged.sectionSequence[0].id).toBe("ourBrands");
      expect(merged.sectionSequence[1].id).toBe("hero");
      expect(merged.sectionSequence[2].id).toBe("experienceWorlds");
      expect(merged.sectionSequence[3].id).toBe("livingDay");
      expect(merged.sectionSequence[3].enabled).toBe(false);

      // Also populates sequence alias
      expect(merged.sequence).toBeDefined();
      expect(merged.sequence[0].id).toBe("ourBrands");
    });

    it("preserves custom user-defined section sequence order when provided in legacy sequence key", () => {
      const customSequence = [
        { id: "digitalTicket", enabled: true, isVisible: true },
        { id: "storyDiscovery", enabled: true, isVisible: true },
        { id: "hero", enabled: false, isVisible: false },
      ];

      const merged = getMergedCMSPageContent("b2c-landing", {
        sequence: customSequence,
      });

      expect(merged.sectionSequence[0].id).toBe("digitalTicket");
      expect(merged.sectionSequence[1].id).toBe("storyDiscovery");
      expect(merged.sectionSequence[2].id).toBe("hero");
      expect(merged.sectionSequence[2].enabled).toBe(false);
    });

    it("falls back to default sequence if sequence is empty or undefined", () => {
      const merged = getMergedCMSPageContent("b2c-landing", {});
      expect(merged.sectionSequence.length).toBe(DEFAULT_B2C_SECTION_SEQUENCE.length);
      expect(merged.sectionSequence[0].id).toBe("hero");
      expect(merged.sectionSequence[1].id).toBe("ideasToLife");
    });
  });

  describe("2. Hero Media & Background Upload Synchronization", () => {
    it("merges hero media video and poster URLs seamlessly", () => {
      const payload = {
        heroMedia: {
          mediaType: "VIDEO",
          mediaUrl: "https://e3.qa/videos/b2c-hero-4k.mp4",
          posterUrl: "https://e3.qa/images/b2c-hero-poster.webp",
          badgeEn: "E3 QATAR FESTIVALS 2026",
          badgeAr: "مهرجانات إي ثري قطر ٢٠٢٦",
        },
      };

      const merged = getMergedCMSPageContent("b2c-landing", payload);

      expect(merged.heroMedia.mediaType).toBe("VIDEO");
      expect(merged.heroMedia.mediaUrl).toBe("https://e3.qa/videos/b2c-hero-4k.mp4");
      expect(merged.heroMedia.posterUrl).toBe("https://e3.qa/images/b2c-hero-poster.webp");
      expect(merged.heroMedia.badgeEn).toBe("E3 QATAR FESTIVALS 2026");
      expect(merged.heroMedia.badgeAr).toBe("مهرجانات إي ثري قطر ٢٠٢٦");
    });
  });

  describe("3. Footer Framing & Atmospheric Media Upload Synchronization", () => {
    it("merges footer CTA background image and button destinations", () => {
      const payload = {
        cta: {
          titleEn: "Step into the stories of Qatar",
          titleAr: "ادخل إلى عالم حكايات قطر",
          buttonLabelEn: "GET YOUR VIP PASS",
          buttonLabelAr: "احصل على تذكرتك الخاصة",
          buttonUrl: "/en/b2c/tickets",
          backgroundImage: "https://e3.qa/images/b2c-footer-banner.webp",
        },
      };

      const merged = getMergedCMSPageContent("b2c-landing", payload);

      expect(merged.cta.titleEn).toBe("Step into the stories of Qatar");
      expect(merged.cta.backgroundImage).toBe("https://e3.qa/images/b2c-footer-banner.webp");
    });
  });
});
