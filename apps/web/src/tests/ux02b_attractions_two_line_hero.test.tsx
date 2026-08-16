import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CinematicHeroUniversal } from '@/components/b2c/story/CinematicHeroUniversal';
import { 
  E3LivingHero, 
  parseTwoLineHeadline 
} from '@/components/b2c/hero/E3LivingHero';
import { 
  DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT, 
  getMergedCMSPageContent 
} from '@/lib/cms-default-pages';

// Mock Capability Tier Context
vi.mock('@/lib/motion/capability-context', () => ({
  useCapabilityTier: () => 'full',
}));

describe('Attractions Page: Two-Line Living Hero Headline Composer', () => {

  describe('1. Attractions Page CMS Defaults & Deep Merge', () => {
    it('provides canonical Two-Line Living Hero defaults for b2c-attractions', () => {
      const merged = getMergedCMSPageContent('b2c-attractions', null);
      
      expect(merged.eyebrowEn).toBe('ALL-ACCESS ENTERTAINMENT DIRECTORY');
      expect(merged.eyebrowAr).toBe('دليل الوجهات والتجارب الترفيهية الشامل');
      expect(merged.headlineTemplateEn).toBe('STEP INTO A WORLD OF {{animated}}');
      expect(merged.fixedHeadlineEn).toBe('STEP INTO A WORLD OF {{animated}}');
      expect(merged.headlineTemplateAr).toBe('ادخل إلى عالم من {{animated}}');
      expect(merged.fixedHeadlineAr).toBe('ادخل إلى عالم من {{animated}}');
      expect(merged.rotatingWordsEn).toEqual(['PLAY', 'WONDER', 'ADVENTURE', 'DISCOVERY']);
      expect(merged.rotatingWordsAr).toEqual(['اللعب', 'الإبهار', 'المغامرة', 'الاكتشاف']);
      expect(merged.preset).toBe('e3-universe');
      expect(merged.animationType).toBe('blur-morph');
      expect(merged.wordStyle).toBe('static-gradient');
      expect(merged.alignment).toBe('center');

      // Structured e3LivingHero object is also populated
      expect(merged.e3LivingHero).toBeDefined();
      expect(merged.e3LivingHero.headlineTemplateEn).toBe('STEP INTO A WORLD OF {{animated}}');
      expect(merged.e3LivingHero.rotatingWordsEn).toEqual(['PLAY', 'WONDER', 'ADVENTURE', 'DISCOVERY']);
      expect(merged.e3LivingHero.preset).toBe('e3-universe');
    });

    it('merges custom CMS updates cleanly into both top-level and e3LivingHero sub-tree', () => {
      const customContent = {
        headlineTemplateEn: 'EXPLORE UNLIMITED {{animated}}',
        rotatingWordsEn: ['THRILLS', 'MAGIC', 'EXCITEMENT'],
        animationType: 'wipe',
        wordStyle: 'moving-gradient',
        accentColor: '#10b981'
      };

      const merged = getMergedCMSPageContent('b2c-attractions', customContent);
      expect(merged.headlineTemplateEn).toBe('EXPLORE UNLIMITED {{animated}}');
      expect(merged.rotatingWordsEn).toEqual(['THRILLS', 'MAGIC', 'EXCITEMENT']);
      expect(merged.animationType).toBe('wipe');
      expect(merged.wordStyle).toBe('moving-gradient');
      expect(merged.accentColor).toBe('#10b981');
      expect(merged.e3LivingHero.headlineTemplateEn).toBe('EXPLORE UNLIMITED {{animated}}');
      expect(merged.e3LivingHero.animationType).toBe('wipe');
    });
  });

  describe('2. Two-Line Semantic Splitting & Visual Rendering', () => {
    it('parses "STEP INTO A WORLD OF {{animated}}" into exactly 2 lines', () => {
      const parsed = parseTwoLineHeadline('STEP INTO A WORLD OF {{animated}}');
      expect(parsed.line1.text).toBe('STEP INTO A');
      expect(parsed.line1.hasToken).toBe(false);
      expect(parsed.line2.hasToken).toBe(true);
      expect(parsed.line2.prefix).toBe('WORLD OF ');
      expect(parsed.hasToken).toBe(true);
    });

    it('renders exactly one semantic <h1> with two visual lines in CinematicHeroUniversal (EN)', () => {
      const cmsData = getMergedCMSPageContent('b2c-attractions', null);
      const html = renderToStaticMarkup(
        <CinematicHeroUniversal content={cmsData} locale="en" preset="e3-universe" />
      );

      // Semantic <h1> count must be exactly 1
      const h1Matches = html.match(/<h1/g) || [];
      expect(h1Matches.length).toBe(1);

      // Screen reader text matches complete headline
      expect(html).toContain('class="sr-only"');
      expect(html).toContain('STEP INTO A WORLD OF PLAY');

      // Visual container has line 1 and line 2, without a 3rd line
      expect(html).toContain('data-testid="hero-two-line-visual"');
      expect(html).toContain('data-testid="hero-line-1"');
      expect(html).toContain('data-testid="hero-line-2"');
      expect(html).not.toContain('data-testid="hero-line-3"');

      // Eyebrow and CTA buttons
      expect(html).toContain('ALL-ACCESS ENTERTAINMENT DIRECTORY');
      expect(html).toContain('Explore Attractions');
      expect(html).toContain('View Live Calendar');

      // Preserves sizing anchor with longest word
      expect(html).toContain('ADVENTURE');
      expect(html).toContain('invisible pointer-events-none');
    });

    it('renders Arabic headline and Arabic rotating words seamlessly in Arabic locale', () => {
      const cmsData = getMergedCMSPageContent('b2c-attractions', null);
      const html = renderToStaticMarkup(
        <CinematicHeroUniversal content={cmsData} locale="ar" preset="e3-universe" />
      );

      // Semantic <h1>
      expect(html).toContain('class="sr-only"');
      expect(html).toContain('ادخل إلى عالم من اللعب');

      // Arabic visual lines
      expect(html).toContain('data-testid="hero-two-line-visual"');
      expect(html).toContain('data-testid="hero-line-1"');
      expect(html).toContain('data-testid="hero-line-2"');

      // Arabic eyebrow and CTAs
      expect(html).toContain('دليل الوجهات والتجارب الترفيهية الشامل');
      expect(html).toContain('استكشف الوجهات');
      expect(html).toContain('عرض جدول الفعاليات');
    });
  });

  describe('3. Dynamic Headline & Style Overrides in CinematicHeroUniversal', () => {
    it('supports custom headline with explicit newline', () => {
      const customContent = {
        headlineTemplateEn: 'UNLEASH YOUR INNER HERO\nDISCOVER {{animated}} TODAY',
        rotatingWordsEn: ['ADVENTURES', 'CHALLENGES', 'QUESTS'],
        preset: 'e3-universe'
      };

      const html = renderToStaticMarkup(
        <CinematicHeroUniversal content={customContent} locale="en" preset="e3-universe" />
      );

      expect(html).toContain('UNLEASH YOUR INNER HERO');
      expect(html).toContain('DISCOVER');
      expect(html).toContain('ADVENTURES');
    });

    it('applies e3-universe cosmic gradient and style tokens', () => {
      const cmsData = getMergedCMSPageContent('b2c-attractions', null);
      const html = renderToStaticMarkup(
        <CinematicHeroUniversal content={cmsData} locale="en" preset="e3-universe" />
      );

      // Contains e3-universe badge styling and purple/amber sweep
      expect(html).toContain('border-purple-500/30');
      expect(html).toContain('bg-purple-500/10');
    });
  });
});
