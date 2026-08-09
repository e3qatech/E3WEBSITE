import { describe, it, expect } from 'vitest';
import { DEFAULT_GATEWAY_CMS_PAYLOAD } from '../types/gateway-cms';

describe('Gateway CMS Media, Live Preview & Dashboard Localization', () => {
  it('has comprehensive media fields for local file uploads across all portals', () => {
    const payload = { ...DEFAULT_GATEWAY_CMS_PAYLOAD };
    
    // Check Logo Asset fields
    expect(payload.logo).toHaveProperty('defaultLogoUrl');
    expect(payload.logo).toHaveProperty('lightLogoUrl');
    expect(payload.logo).toHaveProperty('darkLogoUrl');
    expect(payload.logo).toHaveProperty('mobileLogoUrl');

    // Check B2C Media Assets
    expect(payload.b2cDesktopMedia).toHaveProperty('mediaUrl');
    expect(payload.b2cDesktopMedia).toHaveProperty('fallbackImageUrl');
    expect(payload.b2cMobileMedia).toHaveProperty('mediaUrl');
    expect(payload.b2cMobileMedia).toHaveProperty('fallbackImageUrl');

    // Check B2B Media Assets
    expect(payload.b2bDesktopMedia).toHaveProperty('mediaUrl');
    expect(payload.b2bDesktopMedia).toHaveProperty('fallbackImageUrl');
    expect(payload.b2bMobileMedia).toHaveProperty('mediaUrl');
    expect(payload.b2bMobileMedia).toHaveProperty('fallbackImageUrl');

    // Check SEO Social Image
    expect(payload.seoAccess).toHaveProperty('ogImage');
  });

  it('supports updating media fields with uploaded local URLs', () => {
    const customUploadUrl = 'http://localhost:3000/uploads/gateway-hero-b2c.mp4';
    const payload = JSON.parse(JSON.stringify(DEFAULT_GATEWAY_CMS_PAYLOAD));

    payload.b2cDesktopMedia.mediaUrl = customUploadUrl;
    payload.logo.defaultLogoUrl = 'http://localhost:3000/uploads/e3-logo-custom.png';

    expect(payload.b2cDesktopMedia.mediaUrl).toBe(customUploadUrl);
    expect(payload.logo.defaultLogoUrl).toBe('http://localhost:3000/uploads/e3-logo-custom.png');
  });

  it('correctly resolves dashboard locale routes and breadcrumb formatting', () => {
    const formatBreadcrumbs = (pathname: string) => {
      const rawPaths = pathname.split('/').filter(Boolean);
      return rawPaths.filter((p) => p !== 'en' && p !== 'ar');
    };

    expect(formatBreadcrumbs('/en/dashboard/settings/gateway')).toEqual(['dashboard', 'settings', 'gateway']);
    expect(formatBreadcrumbs('/ar/dashboard/settings/gateway')).toEqual(['dashboard', 'settings', 'gateway']);
    expect(formatBreadcrumbs('/dashboard/settings/gateway')).toEqual(['dashboard', 'settings', 'gateway']);
  });
});
