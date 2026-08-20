import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isMotionLabAllowedInEnvironment, generateMetadata } from '../app/[locale]/motion-lab/horizontal-cylinder/page';

describe('Motion Lab Horizontal Cylinder Route Protection', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('1. Allows access in Vercel Preview environment', () => {
    process.env.VERCEL_ENV = 'preview';
    (process.env as any).NODE_ENV = 'production';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('2. Allows access in local development environment', () => {
    delete process.env.VERCEL_ENV;
    (process.env as any).NODE_ENV = 'development';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('3. Blocks and redirects in production by default when no feature flag is provided', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as any).NODE_ENV = 'production';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(false);
  });

  it('4. Allows access in production when explicit server-only flag ENABLE_MOTION_LAB_PRODUCTION=true is set', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as any).NODE_ENV = 'production';
    process.env.ENABLE_MOTION_LAB_PRODUCTION = 'true';

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('5. Enforces noindex, nofollow metadata for English and Arabic locales', async () => {
    const metaEn = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    expect(metaEn.robots).toEqual({ index: false, follow: false });
    expect(metaEn.title).toContain('Motion Lab');

    const metaAr = await generateMetadata({ params: Promise.resolve({ locale: 'ar' }) });
    expect(metaAr.robots).toEqual({ index: false, follow: false });
    expect(metaAr.title).toContain('معمل الحركة');
  });
});
