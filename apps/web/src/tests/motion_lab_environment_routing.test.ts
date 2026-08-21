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

  it('1. VERCEL_ENV=production blocks access (fail-closed)', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(false);
  });

  it('2. VERCEL_ENV=production and ENABLE_MOTION_LAB_PRODUCTION=true remains blocked', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    process.env.ENABLE_MOTION_LAB_PRODUCTION = 'true';

    expect(isMotionLabAllowedInEnvironment()).toBe(false);
  });

  it('3. VERCEL_ENV=preview allows access', () => {
    process.env.VERCEL_ENV = 'preview';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('4. NODE_ENV=development without VERCEL_ENV allows access', () => {
    delete process.env.VERCEL_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(true);
  });

  it('5. NODE_ENV=production without VERCEL_ENV blocks access', () => {
    delete process.env.VERCEL_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    delete process.env.ENABLE_MOTION_LAB_PRODUCTION;

    expect(isMotionLabAllowedInEnvironment()).toBe(false);
  });

  it('6. English redirect target is /en/b2c', () => {
    expect(getMotionLabRedirectUrl('en')).toBe('/en/b2c');
  });

  it('7. Arabic redirect target is /ar/b2c', () => {
    expect(getMotionLabRedirectUrl('ar')).toBe('/ar/b2c');
  });

  it('8. Robots metadata remains no-index/no-follow', async () => {
    const metaEn = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });
    expect(metaEn.robots).toEqual({ index: false, follow: false });
    expect(metaEn.title).toContain('Motion Lab');

    const metaAr = await generateMetadata({ params: Promise.resolve({ locale: 'ar' }) });
    expect(metaAr.robots).toEqual({ index: false, follow: false });
    expect(metaAr.title).toContain('معمل الحركة');
  });
});
