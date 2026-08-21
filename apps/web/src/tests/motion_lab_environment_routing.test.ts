import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isMotionLabAllowedInEnvironment,
  getMotionLabRedirectUrl,
  generateMetadata,
} from '../app/[locale]/motion-lab/horizontal-cylinder/page';

describe('Motion Lab Horizontal Cylinder Route Protection & Environment Routing', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('1. VERCEL_ENV=preview renders motion lab directly without redirect', () => {
    process.env.VERCEL_ENV = 'preview';
    (process.env as any).NODE_ENV = 'production';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('2. VERCEL_ENV=production without feature flag blocks access and requires redirect', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as any).NODE_ENV = 'production';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(false);
  });

  it('3. VERCEL_ENV=production with ENABLE_MOTION_LAB_PRODUCTION=true renders motion lab', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as any).NODE_ENV = 'production';
    process.env.ENABLE_MOTION_LAB_PRODUCTION = 'true';

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('4. Arabic redirect preserves /ar/b2c and English redirect preserves /en/b2c', () => {
    expect(getMotionLabRedirectUrl('ar')).toBe('/ar/b2c');
    expect(getMotionLabRedirectUrl('en')).toBe('/en/b2c');
  });

  it('5. Missing Vercel environment in normal local development renders directly', () => {
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    (process.env as any).NODE_ENV = 'development';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('6. Missing Vercel environment without NODE_ENV defaults safely to rendering in development', () => {
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    delete (process.env as any).NODE_ENV;
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('7. Enforces noindex, nofollow metadata for English and Arabic locales', async () => {
    const metaEn = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    expect(metaEn.robots).toEqual({ index: false, follow: false });
    expect(metaEn.title).toContain('Motion Lab');

    const metaAr = await generateMetadata({ params: Promise.resolve({ locale: 'ar' }) });
    expect(metaAr.robots).toEqual({ index: false, follow: false });
    expect(metaAr.title).toContain('معمل الحركة');
  });
});
