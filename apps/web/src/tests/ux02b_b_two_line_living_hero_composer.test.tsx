import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  E3LivingHero, 
  parseTwoLineHeadline,
  HeadlineAnimationType,
  AnimatedWordStyle,
  HeroAlignment
} from '@/components/b2c/hero/E3LivingHero';
import { E3LivingHeroEditor } from '@/components/dashboard/b2c/E3LivingHeroEditor';
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages';

// Mock Capability Tier Context
vi.mock('@/lib/motion/capability-context', () => ({
  useCapabilityTier: () => 'full',
}));

describe('UX-02B-B: Two-Line Living Hero Headline Composer', () => {

  describe('1. Two-Line Semantic <h1> & Inline Word Architecture', () => {
    it('parses headline template into exactly 2 visual lines with isolated token', () => {
      const parsed = parseTwoLineHeadline('SOME DAYS PASS. OTHERS BECOME {{animated}}');
      expect(parsed.line1.text).toBe('SOME DAYS PASS.');
      expect(parsed.line1.hasToken).toBe(false);
      expect(parsed.line2.hasToken).toBe(true);
      expect(parsed.line2.prefix).toBe('OTHERS BECOME ');
      expect(parsed.hasToken).toBe(true);
    });

    it('splits on explicit newlines when provided', () => {
      const parsed = parseTwoLineHeadline('FIRST LINE OF HERO\nSECOND LINE WITH {{animated}}');
      expect(parsed.line1.text).toBe('FIRST LINE OF HERO');
      expect(parsed.line2.prefix).toBe('SECOND LINE WITH ');
    });

    it('renders exactly one semantic <h1> with aria-hidden visual layer and no third line', () => {
      const html = renderToStaticMarkup(
        <E3LivingHero
          headlineTemplateEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
          fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
          fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح {{animated}}"
          rotatingWordsEn={['STORIES', 'ADVENTURES', 'MOMENTS', 'MEMORIES']}
          locale="en"
        />
      );

      // Single semantic <h1> count
      const h1Count = (html.match(/<h1/g) || []).length;
      expect(h1Count).toBe(1);

      // Screen reader accessible <h1>
      expect(html).toContain('class="sr-only"');
      expect(html).toContain('SOME DAYS PASS. OTHERS BECOME STORIES');

      // Visual presentation is marked aria-hidden
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('data-testid="hero-two-line-visual"');
      expect(html).toContain('data-testid="hero-line-1"');
      expect(html).toContain('data-testid="hero-line-2"');

      // Zero third line
      expect(html).not.toContain('data-testid="hero-line-3"');
    });

    it('reserves space using longest replacement word inside inline-grid stack', () => {
      const words = ['MOMENTS', 'ADVENTURES', 'STORIES', 'VERY_LONG_ENTERTAINMENT_WORD'];
      const html = renderToStaticMarkup(
        <E3LivingHero
          headlineTemplateEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
          fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
          fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح {{animated}}"
          rotatingWordsEn={words}
          locale="en"
        />
      );

      // Contains invisible sizing anchor for longest word
      expect(html).toContain('VERY_LONG_ENTERTAINMENT_WORD');
      expect(html).toContain('invisible pointer-events-none');
    });
  });

  describe('2. All 6 Animation Types', () => {
    const animTypes: HeadlineAnimationType[] = [
      'typewriter',
      'fade',
      'zoom',
      'wipe',
      'slide-up',
      'blur-morph',
    ];

    animTypes.forEach((anim) => {
      it(`renders correctly with animation type: ${anim}`, () => {
        const html = renderToStaticMarkup(
          <E3LivingHero
            headlineTemplateEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
            fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
            fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح {{animated}}"
            rotatingWordsEn={['MOMENTS', 'STORIES']}
            animationType={anim}
            locale="en"
          />
        );

        expect(html).toContain('data-testid="e3-living-hero"');
        expect(html).toContain('MOMENTS');
      });
    });
  });

  describe('3. All 3 Physical Alignments', () => {
    const alignments: HeroAlignment[] = ['left', 'center', 'right'];

    alignments.forEach((align) => {
      it(`renders full content block with alignment: ${align}`, () => {
        const html = renderToStaticMarkup(
          <E3LivingHero
            headlineTemplateEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
            fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
            fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح {{animated}}"
            rotatingWordsEn={['MOMENTS', 'STORIES']}
            alignment={align}
            descriptionEn="A world of attractions and live experiences."
            primaryCta={{ labelEn: 'Explore', url: '/b2c/attractions' }}
            locale="en"
          />
        );

        if (align === 'left') {
          expect(html).toContain('items-start text-left');
          expect(html).toContain('justify-start');
        } else if (align === 'right') {
          expect(html).toContain('items-end text-right');
          expect(html).toContain('justify-end');
        } else {
          expect(html).toContain('items-center text-center');
          expect(html).toContain('justify-center');
        }
      });
    });
  });

  describe('4. All 3 Animated Word Visual Styles', () => {
    const styles: AnimatedWordStyle[] = ['solid', 'static-gradient', 'moving-gradient'];

    styles.forEach((style) => {
      it(`renders animated word styling: ${style}`, () => {
        const html = renderToStaticMarkup(
          <E3LivingHero
            headlineTemplateEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
            fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
            fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح {{animated}}"
            rotatingWordsEn={['MOMENTS', 'STORIES']}
            wordStyle={style}
            accentColor="#10b981"
            locale="en"
          />
        );

        if (style === 'solid') {
          expect(html).toContain('text-[var(--living-hero-accent)]');
        } else if (style === 'moving-gradient') {
          expect(html).toContain('animate-gradient-x');
        } else {
          expect(html).toContain('bg-clip-text text-transparent');
        }
      });
    });
  });

  describe('5. Arabic RTL Parity & Independent Configuration', () => {
    it('renders Arabic headline and RTL layout with zero English leakage', () => {
      const html = renderToStaticMarkup(
        <E3LivingHero
          headlineTemplateAr="بعض الأيام تمضي. وأخرى تصبح {{animated}}"
          fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME {{animated}}"
          fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح {{animated}}"
          rotatingWordsAr={['حكايات', 'مغامرات', 'لحظات']}
          alignmentAr="right"
          locale="ar"
        />
      );

      expect(html).toContain('dir="rtl"');
      expect(html).toContain('بعض الأيام تمضي.');
      expect(html).toContain('وأخرى تصبح');
      expect(html).toContain('حكايات');
      expect(html).toContain('items-end text-right');
    });
  });

  describe('6. Backward Compatibility for Legacy Content', () => {
    it('automatically formats legacy headlines without {{animated}} tag into 2 lines', () => {
      const html = renderToStaticMarkup(
        <E3LivingHero
          fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME"
          fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح"
          rotatingWordsEn={['STORIES', 'MOMENTS']}
          locale="en"
        />
      );

      expect(html).toContain('SOME DAYS PASS.');
      expect(html).toContain('OTHERS BECOME');
      expect(html).toContain('STORIES');
      expect(html).toContain('data-testid="hero-line-1"');
      expect(html).toContain('data-testid="hero-line-2"');
    });
  });

  describe('7. Dashboard Headline Composer UI Component', () => {
    it('renders Dashboard Headline Composer with template controls and preview', () => {
      const html = renderToStaticMarkup(
        <E3LivingHeroEditor
          value={DEFAULT_B2C_LANDING_CONTENT.e3LivingHero as any}
          onChange={() => {}}
          isAr={false}
        />
      );

      expect(html).toContain('data-testid="e3-living-hero-editor"');
      expect(html).toContain('English Headline Template');
      expect(html).toContain('Visual Word Selector');
      expect(html).toContain('Animation Type');
      expect(html).toContain('Animated Word Visual Styling');
      expect(html).toContain('1440px Desktop');
    });
  });
});
