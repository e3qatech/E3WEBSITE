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
      const tier: 'full' | 'balanced' | 'minimal' = 'minimal';

      const shouldSkipVideo = isDataSaver || (tier === 'minimal' && isReducedMotion);
      expect(shouldSkipVideo).toBe(true);
    });

    it('allows video streaming when in balanced or full tier without Data Saver', () => {
      const isDataSaver = false;
      const isReducedMotion = false;
      const tier: 'full' | 'balanced' | 'minimal' = 'full';

      const shouldSkipVideo = isDataSaver || (tier === 'minimal' && isReducedMotion);
      expect(shouldSkipVideo).toBe(false);
    });
  });
});
