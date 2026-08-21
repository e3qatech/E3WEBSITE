import { describe, it, expect } from 'vitest';
import { generateMetadata } from '../app/[locale]/b2c/page';

describe('B2C Landing Metadata Localization', () => {
  it('1. Generates correct English metadata with English title, description, and OpenGraph', async () => {
    const metaEn = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });

    expect(metaEn.title).toBe('Experiences | E3 Qatar');
    expect(metaEn.description).toBe('Immersive entertainment landmarks, InflataRUN world records, and kinetic attraction worlds in Qatar.');
    expect(metaEn.alternates?.canonical).toBe('/en/b2c');
    expect(metaEn.alternates?.languages).toEqual({
      en: '/en/b2c',
      ar: '/ar/b2c',
    });
    expect((metaEn.openGraph as any)?.title).toBe('Experiences | E3 Qatar');
    expect((metaEn.openGraph as any)?.locale).toBe('en_US');
    expect((metaEn.twitter as any)?.title).toBe('Experiences | E3 Qatar');
  });

  it('2. Generates correct Arabic metadata with 100% Arabic title, description, and ar_QA locale', async () => {
    const metaAr = await generateMetadata({ params: Promise.resolve({ locale: 'ar' }) });

    // Absolute title prevents English layout template from polluting Arabic title
    expect(metaAr.title).toEqual({ absolute: 'التجارب | إي ثري قطر | خبراء هندسة الفعاليات' });
    expect(metaAr.description).toBe('وجهات ترفيهية غامرة، أرقام قياسية عالمية مع إنفلاتارن، وعوالم تفاعلية حركية في قطر.');
    expect(metaAr.alternates?.canonical).toBe('/ar/b2c');
    expect(metaAr.alternates?.languages).toEqual({
      en: '/en/b2c',
      ar: '/ar/b2c',
    });
    expect((metaAr.openGraph as any)?.title).toBe('التجارب | إي ثري قطر | خبراء هندسة الفعاليات');
    expect((metaAr.openGraph as any)?.locale).toBe('ar_QA');
    expect((metaAr.twitter as any)?.title).toBe('التجارب | إي ثري قطر | خبراء هندسة الفعاليات');
  });

  it('3. Proves Arabic metadata contains zero English fallback title tokens', async () => {
    const metaAr = await generateMetadata({ params: Promise.resolve({ locale: 'ar' }) });
    const titleStr = typeof metaAr.title === 'string' ? metaAr.title : (metaAr.title as any)?.absolute;
    const descStr = metaAr.description || '';

    expect(titleStr).not.toContain('Experiences');
    expect(titleStr).not.toContain('Event Engineering Experts');
    expect(descStr).not.toContain('Immersive');
    expect(descStr).not.toContain('InflataRUN');
  });
});
