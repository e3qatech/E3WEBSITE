import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { E3LivingHero } from '@/components/b2c/hero/E3LivingHero';
import { E3LivingHeroEditor } from '@/components/dashboard/b2c/E3LivingHeroEditor';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { HeroViewer } from '@/components/attractions/detail/HeroViewer';
import { 
  DEFAULT_B2C_LANDING_CONTENT, 
  DEFAULT_B2C_DISCOVER_CONTENT, 
  DEFAULT_B2C_PACKAGES_PAGE_CONTENT, 
  DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT, 
  DEFAULT_B2C_CALENDAR_PAGE_CONTENT 
} from '@/lib/cms-default-pages';

// Mock Next.js navigation and hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en/b2c',
}));

describe('UX-02B: E3 Living Hero System for All B2C Pages', () => {

  describe('1. E3LivingHero Public Component & Presets', () => {
    it('renders B2C Landing Living Hero with memory-engine preset and rotating words', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <E3LivingHero
              eyebrowEn="E3 QATAR ENTERTAINMENT WORLDS"
              eyebrowAr="عالم إي ثري الترفيهي بقطر"
              fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME"
              fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح"
              rotatingWordsEn={['STORIES', 'ADVENTURES', 'MOMENTS', 'MEMORIES']}
              rotatingWordsAr={['حكايات', 'مغامرات', 'لحظات', 'ذكريات']}
              descriptionEn="Step beyond observation into active wonder across Qatar's flagship entertainment ecosystem."
              descriptionAr="ادخل إلى عالم يتجاوز المألوف في منظومة إي ثري الترفيهية الرائدة بقطر."
              primaryCta={{ labelEn: 'Begin Your Story', labelAr: 'ابدأ حكايتك', url: '#explore' }}
              secondaryCta={{ labelEn: 'See What\'s On Today', labelAr: 'اكتشف فعاليات اليوم', url: '#calendar' }}
              media={{
                mediaType: 'IMAGE',
                mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop',
              }}
              preset="memory-engine"
              animationSpeed={2800}
              locale="en"
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="e3-living-hero"');
      expect(html).toContain('E3 QATAR ENTERTAINMENT WORLDS');
      expect(html).toContain('SOME DAYS PASS. OTHERS BECOME');
      expect(html).toContain('STORIES');
      expect(html).toContain('Begin Your Story');
      expect(html).toContain('See What&#x27;s On Today');
      expect(html).toContain('Step beyond observation');
      // Semantic single H1 check
      expect(html).toContain('<h1');
      expect(html).toContain('data-testid="living-hero-h1"');
    });

    it('renders Discover Living Hero with story-portal preset', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <E3LivingHero
              eyebrowEn="E3 CORPORATE STORY &amp; ECOSYSTEM"
              eyebrowAr="قصة إي ثري الترفيهية والتنفيذية"
              fixedHeadlineEn="CHOOSE HOW YOU WANT TO"
              fixedHeadlineAr="اختر كيف ترغب في أن"
              rotatingWordsEn={['EXPLORE', 'COMPETE', 'CREATE', 'DISCOVER']}
              rotatingWordsAr={['تستكشف', 'تنافس', 'تبتكر', 'تكتشف']}
              descriptionEn="We design, engineer, and operate world-record entertainment environments."
              descriptionAr="نصمم ونبتكر وندير بيئات ترفيهية استثنائية حائزة على أرقام قياسية عالمية."
              primaryCta={{ labelEn: 'Explore Ecosystem', labelAr: 'استكشف المنظومة', url: '#about' }}
              secondaryCta={{ labelEn: 'Leadership Message', labelAr: 'كلمة القيادة', url: '#leadership' }}
              media={{
                mediaType: 'VIDEO',
                mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4',
              }}
              preset="story-portal"
              locale="en"
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('CHOOSE HOW YOU WANT TO');
      expect(html).toContain('EXPLORE');
      expect(html).toContain('Explore Ecosystem');
      expect(html).toContain('Leadership Message');
    });

    it('renders Attractions Living Hero with e3-universe preset', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <E3LivingHero
              eyebrowEn="ALL-ACCESS ENTERTAINMENT DIRECTORY"
              eyebrowAr="دليل الوجهات والتجارب الترفيهية الشامل"
              fixedHeadlineEn="STEP INTO A WORLD OF"
              fixedHeadlineAr="ادخل إلى عالم من"
              rotatingWordsEn={['PLAY', 'WONDER', 'ADVENTURE', 'DISCOVERY']}
              rotatingWordsAr={['اللعب', 'الإبهار', 'المغامرة', 'الاكتشاف']}
              descriptionEn="Explore all flagship E3 entertainment worlds across Qatar."
              descriptionAr="استكشف كافة وجهات إي ثري الترفيهية في قطر."
              primaryCta={{ labelEn: 'Explore Attractions', labelAr: 'استكشف الوجهات', url: '#attractions-grid' }}
              secondaryCta={{ labelEn: 'View Live Calendar', labelAr: 'عرض جدول الفعاليات', url: '/en/b2c/calendar' }}
              preset="e3-universe"
              locale="en"
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('STEP INTO A WORLD OF');
      expect(html).toContain('PLAY');
      expect(html).toContain('Explore Attractions');
    });

    it('renders Packages Living Hero with day-builder preset', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <E3LivingHero
              eyebrowEn="E3 CELEBRATIONS &amp; GROUP PACKAGES"
              eyebrowAr="باقات الفعاليات والاحتفالات الاستثنائية"
              fixedHeadlineEn="BUILD A DAY FILLED WITH"
              fixedHeadlineAr="اصنع يوماً مليئاً بـ"
              rotatingWordsEn={['PLAY', 'CELEBRATION', 'DISCOVERY', 'MEMORIES']}
              rotatingWordsAr={['المرح', 'الاحتفال', 'الاكتشاف', 'الذكريات']}
              descriptionEn="Discover birthday celebrations, group adventures, school experiences and corporate packages."
              descriptionAr="اكتشفوا باقات أعياد الميلاد والمجموعات والمدارس والشركات في وجهات E3 الترفيهية."
              primaryCta={{ labelEn: 'Find Your Package', labelAr: 'اختر باقتك', url: '#packages' }}
              preset="day-builder"
              locale="en"
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('BUILD A DAY FILLED WITH');
      expect(html).toContain('PLAY');
      expect(html).toContain('Find Your Package');
    });

    it('renders Calendar Living Hero with living-timeline preset', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <E3LivingHero
              eyebrowEn="EVENTS &amp; OCCURRENCES TIMELINE"
              eyebrowAr="جدول الفعاليات والمواعيد الحية"
              fixedHeadlineEn="YOUR NEXT MOMENT STARTS"
              fixedHeadlineAr="لحظتك القادمة تبدأ"
              rotatingWordsEn={['TODAY', 'THIS WEEK', 'THIS WEEKEND', 'SOON']}
              rotatingWordsAr={['اليوم', 'هذا الأسبوع', 'عطلة نهاية الأسبوع', 'قريباً']}
              descriptionEn="Plan your week with scheduled parades, laser shows, and tournaments."
              descriptionAr="خطط لأسبوعك مع العروض الحية، والاستعراضات المضيئة، والبطولات التنافسية."
              primaryCta={{ labelEn: 'Browse Schedule', labelAr: 'تصفح الجدول', url: '#schedule' }}
              preset="living-timeline"
              locale="en"
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('YOUR NEXT MOMENT STARTS');
      expect(html).toContain('TODAY');
      expect(html).toContain('Browse Schedule');
    });
  });

  describe('2. Strict Arabic Localization & Zero English Leakage', () => {
    it('renders Arabic B2C Living Hero with Arabic headline, Arabic rotating words, and RTL orientation', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <ThemeProvider>
            <E3LivingHero
              eyebrowEn="E3 QATAR ENTERTAINMENT WORLDS"
              eyebrowAr="عالم إي ثري الترفيهي بقطر"
              fixedHeadlineEn="SOME DAYS PASS. OTHERS BECOME"
              fixedHeadlineAr="بعض الأيام تمضي. وأخرى تصبح"
              rotatingWordsEn={['STORIES', 'ADVENTURES', 'MOMENTS', 'MEMORIES']}
              rotatingWordsAr={['حكايات', 'مغامرات', 'لحظات', 'ذكريات']}
              descriptionEn="Step beyond observation."
              descriptionAr="ادخل إلى عالم يتجاوز المألوف في منظومة إي ثري الترفيهية الرائدة بقطر."
              primaryCta={{ labelEn: 'Begin Your Story', labelAr: 'ابدأ حكايتك', url: '#explore' }}
              secondaryCta={{ labelEn: 'See What\'s On Today', labelAr: 'اكتشف فعاليات اليوم', url: '#calendar' }}
              preset="memory-engine"
              locale="ar"
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      // Arabic content must be present
      expect(html).toContain('عالم إي ثري الترفيهي بقطر');
      expect(html).toContain('بعض الأيام تمضي. وأخرى تصبح');
      expect(html).toContain('حكايات');
      expect(html).toContain('ابدأ حكايتك');
      expect(html).toContain('اكتشف فعاليات اليوم');

      // English rotating words must NOT leak into the active Arabic headline view
      expect(html).not.toContain('STORIES');
      expect(html).not.toContain('ADVENTURES');
    });
  });

  describe('3. Detail Pages & Record-Level Rotating Words Policy', () => {
    it('falls back cleanly to static hero when record rotating phrases are empty', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <HeroViewer
              title="InflataPark Qatar"
              tagline="The World's Largest Inflatable Arena"
              mediaType="IMAGE"
              mediaUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
              ctaText="Book Attraction Pass"
              ctaLink="/en/b2c/tickets"
              accentColor="#F59E0B"
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      // Static attraction detail hero renders
      expect(html).toContain('InflataPark Qatar');
      expect(html).toContain('The World&#x27;s Largest Inflatable Arena');
      expect(html).toContain('Book Attraction Pass');
    });

    it('renders E3LivingHero with record-accent preset when record phrases exist', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <HeroViewer
              title="READY TO"
              tagline="The World's Largest Inflatable Arena"
              mediaType="IMAGE"
              mediaUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
              ctaText="Book Attraction Pass"
              ctaLink="/en/b2c/tickets"
              accentColor="#F59E0B"
              rotatingWordsEn={['BOUNCE', 'CONQUER', 'FLY', 'CELEBRATE']}
              rotatingWordsAr={['اقفز', 'تحدَّ', 'حلّق', 'احتفل']}
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="e3-living-hero"');
      expect(html).toContain('READY TO');
      expect(html).toContain('BOUNCE');
    });
  });

  describe('4. E3LivingHeroEditor Dashboard Component', () => {
    it('renders editor controls with tags manager, preset selector, and preview', () => {
      const editorData = {
        eyebrowEn: 'TEST EYEBROW EN',
        eyebrowAr: 'عنوان الشعار التجريبي',
        fixedHeadlineEn: 'START YOUR ADVENTURE IN',
        fixedHeadlineAr: 'ابدأ مغامرتك في',
        rotatingWordsEn: ['SPEED', 'RUSH', 'FLIGHT'],
        rotatingWordsAr: ['السرعة', 'الحماس', 'التحليق'],
        descriptionEn: 'Sample description',
        descriptionAr: 'وصف تجريبي',
        primaryCta: { labelEn: 'Book Now', labelAr: 'احجز الآن', url: '#book' },
        preset: 'memory-engine' as const,
        animationSpeed: 2800,
        enableRotatingWords: true,
      };

      const onChangeMock = vi.fn();

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <E3LivingHeroEditor
              value={editorData}
              onChange={onChangeMock}
              isAr={false}
              languageMode="BOTH"
              defaultPreset="memory-engine"
            />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="e3-living-hero-editor"');
      expect(html).toContain('START YOUR ADVENTURE IN');
      expect(html).toContain('SPEED');
      expect(html).toContain('RUSH');
      expect(html).toContain('FLIGHT');
      expect(html).toContain('Book Now');
      expect(html).toContain('Live Interactive Living Hero Preview');
    });
  });

  describe('5. Canonical Content Merges & Page Defaults', () => {
    it('verifies canonical defaults exist with fixedHeadline and rotatingWords for all 5 B2C pages', () => {
      expect(DEFAULT_B2C_LANDING_CONTENT.e3LivingHero).toBeDefined();
      expect(DEFAULT_B2C_LANDING_CONTENT.e3LivingHero.rotatingWordsEn).toEqual(['STORIES', 'ADVENTURES', 'MOMENTS', 'MEMORIES']);

      expect(DEFAULT_B2C_DISCOVER_CONTENT.hero.rotatingWordsEn).toEqual(['EXPLORE', 'COMPETE', 'CREATE', 'DISCOVER']);
      expect(DEFAULT_B2C_PACKAGES_PAGE_CONTENT.rotatingWordsEn).toEqual(['PLAY', 'CELEBRATION', 'DISCOVERY', 'MEMORIES']);
      expect(DEFAULT_B2C_ATTRACTIONS_PAGE_CONTENT.rotatingWordsEn).toEqual(['PLAY', 'WONDER', 'ADVENTURE', 'DISCOVERY']);
      expect(DEFAULT_B2C_CALENDAR_PAGE_CONTENT.rotatingWordsEn).toEqual(['TODAY', 'THIS WEEK', 'THIS WEEKEND', 'SOON']);
    });
  });
});
