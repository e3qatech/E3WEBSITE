import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CinematicHeroUniversal } from '@/components/b2c/story/CinematicHeroUniversal';
import { 
  DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT, 
  getMergedCMSPageContent 
} from '@/lib/cms-default-pages';
import { AttractionsPageEditor } from '@/components/dashboard/b2c/AttractionsPageEditor';

// Mock Capability Tier Context
vi.mock('@/lib/motion/capability-context', () => ({
  useCapabilityTier: () => 'full',
}));

// Mock Next.js navigation and UI Toast
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard/b2c/attractions-page',
}));

vi.mock('@/components/dashboard/ui/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('UX-02B: Attraction Page Two-Line Living Hero Headline Composer', () => {

  describe('1. Default Content & CMS Merging Architecture', () => {
    it('has canonical Two-Line Headline Composer defaults for Attractions Page', () => {
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.eyebrowEn).toBe('ALL-ACCESS ENTERTAINMENT DIRECTORY');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.eyebrowAr).toBe('دليل الوجهات والتجارب الترفيهية الشامل');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.fixedHeadlineEn).toBe('STEP INTO A WORLD OF {{animated}}');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.fixedHeadlineAr).toBe('ادخل إلى عالم من {{animated}}');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.headlineTemplateEn).toBe('STEP INTO A WORLD OF {{animated}}');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.headlineTemplateAr).toBe('ادخل إلى عالم من {{animated}}');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.rotatingWordsEn).toEqual(['PLAY', 'WONDER', 'ADVENTURE', 'DISCOVERY']);
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.rotatingWordsAr).toEqual(['اللعب', 'الإبهار', 'المغامرة', 'الاكتشاف']);
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.preset).toBe('e3-universe');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.animationType).toBe('blur-morph');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.wordStyle).toBe('static-gradient');
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.alignmentEn).toBe('center');
    });

    it('deeply merges attractions content and constructs e3LivingHero sub-object', () => {
      const merged = getMergedCMSPageContent('b2c-attractions', {
        headlineTemplateEn: 'EXPLORE UNLIMITED {{animated}} ATTRACTIONS',
        rotatingWordsEn: ['FUN', 'THRILL', 'MAGIC'],
      });

      expect(merged.headlineTemplateEn).toBe('EXPLORE UNLIMITED {{animated}} ATTRACTIONS');
      expect(merged.rotatingWordsEn).toEqual(['FUN', 'THRILL', 'MAGIC']);
      expect(merged.e3LivingHero).toBeDefined();
      expect(merged.e3LivingHero.headlineTemplateEn).toBe('EXPLORE UNLIMITED {{animated}} ATTRACTIONS');
      expect(merged.e3LivingHero.preset).toBe('e3-universe');
      expect(merged.e3LivingHero.eyebrowEn).toBe('ALL-ACCESS ENTERTAINMENT DIRECTORY');
    });
  });

  describe('2. Attractions Hero 2-Line Visual Rendering & Zero Third Line', () => {
    it('renders exactly one semantic <h1> with 2 visual lines and rotating words', () => {
      const mergedContent = getMergedCMSPageContent('b2c-attractions', {});
      const html = renderToStaticMarkup(
        <CinematicHeroUniversal content={mergedContent} locale="en" preset="e3-universe" />
      );

      // Semantic <h1> count is exactly 1
      const h1Matches = html.match(/<h1/g) || [];
      expect(h1Matches.length).toBe(1);

      // Eyebrow badge
      expect(html).toContain('ALL-ACCESS ENTERTAINMENT DIRECTORY');

      // Visual line test IDs
      expect(html).toContain('data-testid="hero-two-line-visual"');
      expect(html).toContain('data-testid="hero-line-1"');
      expect(html).toContain('data-testid="hero-line-2"');
      expect(html).not.toContain('data-testid="hero-line-3"');

      // First rotating word rendered
      expect(html).toContain('PLAY');

      // CTAs rendered
      expect(html).toContain('Explore Attractions');
      expect(html).toContain('View Live Calendar');
    });

    it('reserves space for longest rotating word in attractions roster', () => {
      const contentWithLongWord = getMergedCMSPageContent('b2c-attractions', {
        rotatingWordsEn: ['PLAY', 'WONDER', 'EXTRAORDINARY_EXPERIENCES'],
      });
      const html = renderToStaticMarkup(
        <CinematicHeroUniversal content={contentWithLongWord} locale="en" preset="e3-universe" />
      );

      expect(html).toContain('EXTRAORDINARY_EXPERIENCES');
      expect(html).toContain('invisible pointer-events-none');
    });
  });

  describe('3. Arabic RTL Parity for Attractions Hero', () => {
    it('renders Arabic headline and RTL layout with zero English leakage', () => {
      const mergedContent = getMergedCMSPageContent('b2c-attractions', {});
      const html = renderToStaticMarkup(
        <CinematicHeroUniversal content={mergedContent} locale="ar" preset="e3-universe" />
      );

      expect(html).toContain('dir="rtl"');
      expect(html).toContain('دليل الوجهات والتجارب الترفيهية الشامل');
      expect(html).toContain('ادخل إلى عالم من');
      expect(html).toContain('اللعب');
      expect(html).toContain('استكشف الوجهات');
      expect(html).toContain('عرض جدول الفعاليات');
    });
  });

  describe('4. Dynamic Customizations Support', () => {
    it('renders with custom animation type, word style, and alignment', () => {
      const customContent = getMergedCMSPageContent('b2c-attractions', {
        headlineTemplateEn: 'DISCOVER IMMERSIVE {{animated}} IN QATAR',
        rotatingWordsEn: ['REALMS', 'ARENAS'],
        animationType: 'wipe',
        wordStyle: 'moving-gradient',
        alignmentEn: 'left',
        accentColor: '#ec4899',
      });

      const html = renderToStaticMarkup(
        <CinematicHeroUniversal content={customContent} locale="en" preset="e3-universe" />
      );

      expect(html).toContain('data-testid="e3-living-hero"');
      expect(html).toContain('DISCOVER IMMERSIVE');
      expect(html).toContain('REALMS');
      expect(html).toContain('items-start text-left');
    });
  });

  describe('5. Dashboard AttractionsPageEditor Integration', () => {
    it('renders AttractionsPageEditor with the Two-Line Living Hero Composer', () => {
      const html = renderToStaticMarkup(<AttractionsPageEditor />);
      expect(html).toContain('Attractions Page Editor');
      expect(html).toContain('data-testid="e3-living-hero-editor"');
      expect(html).toContain('English Headline Template');
      expect(html).toContain('STEP INTO A WORLD OF {{animated}}');
      expect(html).toContain('Visual Word Selector');
      expect(html).toContain('Animation Type');
      expect(html).toContain('Animated Word Visual Styling');
      expect(html).toContain('1440px Desktop');
    });
  });
});
