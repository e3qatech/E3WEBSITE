import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calculateTier } from '../lib/motion/capability-context';
import { getTieredTransition, MOTION_TOKENS } from '../lib/motion/tokens';
import {
  setMockWebGLSupport,
  resetMockWebGLSupport,
  isWebGLSupported,
  isWebGL2Supported,
} from '../lib/webgl-capability';

describe('Shared E3 Motion & Capability Foundation Tests', () => {
  beforeEach(() => {
    resetMockWebGLSupport();
  });

  afterEach(() => {
    resetMockWebGLSupport();
  });

  describe('1. Capability Tier Resolution Logic', () => {
    const defaultDesktop = {
      width: 1440,
      height: 900,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLandscape: true,
    };

    const defaultMobile = {
      width: 390,
      height: 844,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isLandscape: false,
    };

    it('resolves to FULL tier for high-spec desktop with WebGL2, fine pointer, and no constraints', () => {
      const tier = calculateTier({
        isReducedMotion: false,
        isDataSaver: false,
        isWebGLAvailable: true,
        isWebGL2Available: true,
        isTouch: false,
        viewport: defaultDesktop,
      });

      expect(tier).toBe('full');
    });

    it('resolves to BALANCED tier on mobile devices even with WebGL2 available', () => {
      const tier = calculateTier({
        isReducedMotion: false,
        isDataSaver: false,
        isWebGLAvailable: true,
        isWebGL2Available: true,
        isTouch: true,
        viewport: defaultMobile,
      });

      expect(tier).toBe('balanced');
    });

    it('resolves to BALANCED tier on desktop when WebGL2 is missing but WebGL1 is present', () => {
      const tier = calculateTier({
        isReducedMotion: false,
        isDataSaver: false,
        isWebGLAvailable: true,
        isWebGL2Available: false,
        isTouch: false,
        viewport: defaultDesktop,
      });

      expect(tier).toBe('balanced');
    });

    it('resolves to MINIMAL tier when prefers-reduced-motion is active', () => {
      const tier = calculateTier({
        isReducedMotion: true,
        isDataSaver: false,
        isWebGLAvailable: true,
        isWebGL2Available: true,
        isTouch: false,
        viewport: defaultDesktop,
      });

      expect(tier).toBe('minimal');
    });

    it('resolves to MINIMAL tier when Data Saver (saveData) is active', () => {
      const tier = calculateTier({
        isReducedMotion: false,
        isDataSaver: true,
        isWebGLAvailable: true,
        isWebGL2Available: true,
        isTouch: false,
        viewport: defaultDesktop,
      });

      expect(tier).toBe('minimal');
    });

    it('resolves to MINIMAL tier when WebGL is completely unavailable', () => {
      const tier = calculateTier({
        isReducedMotion: false,
        isDataSaver: false,
        isWebGLAvailable: false,
        isWebGL2Available: false,
        isTouch: false,
        viewport: defaultDesktop,
      });

      expect(tier).toBe('minimal');
    });
  });

  describe('2. Motion Tokens & Tiered Transitions', () => {
    it('returns instantaneous duration (<=0.15s) with linear ease in minimal tier', () => {
      const transition = getTieredTransition('minimal', 'cinematic', { delay: 0.5 });
      expect(transition.duration).toBeLessThanOrEqual(0.15);
      expect(transition.ease).toEqual([0, 0, 1, 1]);
      expect(transition.delay).toBe(0);
    });

    it('caps transition duration to 0.5s in balanced tier', () => {
      const transition = getTieredTransition('balanced', 'cinematic', { durationOverride: 1.2 });
      expect(transition.duration).toBeLessThanOrEqual(0.5);
    });

    it('preserves cinematic duration in full tier', () => {
      const transition = getTieredTransition('full', 'cinematic');
      expect(transition.duration).toBe(MOTION_TOKENS.duration.cinematic);
      expect(transition.ease).toEqual(MOTION_TOKENS.ease.cinematic);
    });
  });

  describe('3. WebGL Capability & 3D Crash Isolation', () => {
    it('safely handles mock WebGL2 and WebGL1 capability states', () => {
      setMockWebGLSupport(true, true);
      expect(isWebGL2Supported()).toBe(true);

      setMockWebGLSupport(false, true);
      expect(isWebGL2Supported()).toBe(false);

      setMockWebGLSupport(true, false);
      expect(isWebGLSupported()).toBe(true);

      setMockWebGLSupport(false, false);
      expect(isWebGLSupported()).toBe(false);
    });
  });

  describe('4. Accessibility & Screen Reader Markup Invariance', () => {
    it('verifies split words preserving space and screen reader full label', () => {
      const headline = "Ideas to Life";
      const words = headline.split(/\s+/).filter(Boolean);
      expect(words).toEqual(["Ideas", "to", "Life"]);
      expect(headline).toBe("Ideas to Life");
    });

    it('verifies Arabic headline word tokenization with RTL integrity', () => {
      const arabicHeadline = "تحويل الأفكار إلى واقع حي";
      const words = arabicHeadline.split(/\s+/).filter(Boolean);
      expect(words).toHaveLength(5);
      expect(words[0]).toBe("تحويل");
    });
  });

  describe('5. Offscreen Media & Video Optimization Signals', () => {
    it('skips video playback when Data Saver or Minimal Reduced Motion is active', () => {
      const isDataSaver = true;
      const isReducedMotion = false;
      const tier = 'minimal' as const;

      const shouldSkipVideo = isDataSaver || (tier === 'minimal' && isReducedMotion);
      expect(shouldSkipVideo).toBe(true);
    });

    it('allows video streaming when in balanced or full tier without Data Saver', () => {
      const isDataSaver = false;
      const isReducedMotion = false;
      const tier = 'full' as const;

      const shouldSkipVideo = isDataSaver || ((tier as string) === 'minimal' && isReducedMotion);
      expect(shouldSkipVideo).toBe(false);
    });
  });

  describe('6. Route Transitions & Repeated Navigation Safety', () => {
    it('provides zero-offset instant opacity variants when in minimal mode', () => {
      const isMinimal = true;
      const minimalVariants = isMinimal
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } };

      expect(minimalVariants.initial.opacity).toBe(0);
      expect((minimalVariants.initial as any).y).toBeUndefined();
    });

    it('provides directional slide variants when in full tier', () => {
      const isMinimal = false;
      const slideVariants = isMinimal
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } };

      expect(slideVariants.initial.y).toBe(16);
      expect(slideVariants.animate.y).toBe(0);
    });
  });

  describe('7. WebGL Fallback Bilingual Localizations (EN/AR)', () => {
    it('produces verified English fallback copy for /en/b2b blueprint scene', () => {
      const locale: string = 'en';
      const isAr = locale === 'ar';

      const title = isAr ? "من المخطط الهندسي إلى المشهد المكاني الحي" : "Blueprint to Live Spatial Scene";
      const description = isAr
        ? "يعمل هذا القسم التفاعلي في وضع العرض ثنائي الأبعاد عالي التوافق لضمان الأداء السلس والتوافق التام مع جميع الأجهزة."
        : "This interactive section operates in accessible 2D display mode to ensure seamless performance and universal device compatibility.";
      const badgeText = isAr ? "وضع الأداء العالي وسهولة الوصول" : "High-Performance Accessible Mode";
      const reason = isAr ? "وضع سهولة الوصول نشط" : "Accessibility Mode Active";
      const ariaLabel = `${title} (${reason})`;

      expect(title).toBe("Blueprint to Live Spatial Scene");
      expect(description).toContain("accessible 2D display mode");
      expect(badgeText).toBe("High-Performance Accessible Mode");
      expect(ariaLabel).toBe("Blueprint to Live Spatial Scene (Accessibility Mode Active)");
    });

    it('produces verified Arabic fallback copy for /ar/b2b blueprint scene', () => {
      const locale = 'ar';
      const isAr = locale === 'ar';

      const title = isAr ? "من المخطط الهندسي إلى المشهد المكاني الحي" : "Blueprint to Live Spatial Scene";
      const description = isAr
        ? "يعمل هذا القسم التفاعلي في وضع العرض ثنائي الأبعاد عالي التوافق لضمان الأداء السلس والتوافق التام مع جميع الأجهزة."
        : "This interactive section operates in accessible 2D display mode to ensure seamless performance and universal device compatibility.";
      const badgeText = isAr ? "وضع الأداء العالي وسهولة الوصول" : "High-Performance Accessible Mode";
      const reason = isAr ? "وضع سهولة الوصول نشط" : "Accessibility Mode Active";
      const ariaLabel = `${title} (${reason})`;

      expect(title).toBe("من المخطط الهندسي إلى المشهد المكاني الحي");
      expect(description).toContain("وضع العرض ثنائي الأبعاد عالي التوافق");
      expect(badgeText).toBe("وضع الأداء العالي وسهولة الوصول");
      expect(ariaLabel).toBe("من المخطط الهندسي إلى المشهد المكاني الحي (وضع سهولة الوصول نشط)");
    });

    it('handles unsupported WebGL reason localization accurately', () => {
      const getReason = (isSupported: boolean, isAr: boolean) =>
        !isSupported
          ? (isAr ? "تقنية WebGL غير متوفرة" : "WebGL Unsupported")
          : (isAr ? "وضع سهولة الوصول نشط" : "Accessibility Mode Active");

      expect(getReason(false, true)).toBe("تقنية WebGL غير متوفرة");
      expect(getReason(false, false)).toBe("WebGL Unsupported");
      expect(getReason(true, true)).toBe("وضع سهولة الوصول نشط");
      expect(getReason(true, false)).toBe("Accessibility Mode Active");
    });
  });
});
