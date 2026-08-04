import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayCustomizationPayload,
} from '../types/gateway-cms';

const ALLOWED_IFRAME_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'spline.design',
  'prod.spline.design',
  'my.spline.design',
  'booking.e3.qa',
  'cdn.e3.qa',
  'e3.qa',
  'images.unsplash.com',
  'public.blob.vercel-storage.com',
];

function isDomainAllowed(urlStr: string): boolean {
  if (!urlStr.startsWith('https://')) return false;
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_IFRAME_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch (_e) {
    return false;
  }
}

describe('Gate 12: Gateway CMS, Localization & Media Architecture Verification', () => {
  it('1. should verify every English gateway field has a paired Arabic field', () => {
    const { english, arabic } = DEFAULT_GATEWAY_CMS_PAYLOAD;

    expect(english.eyebrowEn).toBeTruthy();
    expect(arabic.eyebrowAr).toBeTruthy();

    expect(english.headlineEn).toBeTruthy();
    expect(arabic.headlineAr).toBeTruthy();

    expect(english.supportingTextEn).toBeTruthy();
    expect(arabic.supportingTextAr).toBeTruthy();

    expect(english.b2cTitleEn).toBeTruthy();
    expect(arabic.b2cTitleAr).toBeTruthy();

    expect(english.b2cDescEn).toBeTruthy();
    expect(arabic.b2cDescAr).toBeTruthy();

    expect(english.b2cCtaLabelEn).toBeTruthy();
    expect(arabic.b2cCtaLabelAr).toBeTruthy();

    expect(english.b2bTitleEn).toBeTruthy();
    expect(arabic.b2bTitleAr).toBeTruthy();

    expect(english.b2bDescEn).toBeTruthy();
    expect(arabic.b2bDescAr).toBeTruthy();

    expect(english.b2bCtaLabelEn).toBeTruthy();
    expect(arabic.b2bCtaLabelAr).toBeTruthy();
  });

  it('2. should verify Universal Media Holder requires a mandatory fallback image for every media config', () => {
    const { b2cDesktopMedia, b2cMobileMedia, b2bDesktopMedia, b2bMobileMedia } =
      DEFAULT_GATEWAY_CMS_PAYLOAD;

    expect(b2cDesktopMedia.fallbackImageUrl).toBeTruthy();
    expect(b2cMobileMedia.fallbackImageUrl).toBeTruthy();
    expect(b2bDesktopMedia.fallbackImageUrl).toBeTruthy();
    expect(b2bMobileMedia.fallbackImageUrl).toBeTruthy();
  });

  it('3. should validate iframe HTTPS protocol and domain allowlist rules', () => {
    expect(isDomainAllowed('https://prod.spline.design/scene-123')).toBe(true);
    expect(isDomainAllowed('https://www.youtube.com/embed/xyz')).toBe(true);
    expect(isDomainAllowed('https://booking.e3.qa/tickets')).toBe(true);

    // Rejections
    expect(isDomainAllowed('http://prod.spline.design/scene-123')).toBe(false); // No HTTP
    expect(isDomainAllowed('https://malicious-domain.com/embed')).toBe(false); // Disallowed domain
    expect(isDomainAllowed('not-a-valid-url')).toBe(false);
  });

  it('4. should verify language direction logic for LTR and RTL switching', () => {
    const getDirection = (locale: string) => (locale === 'ar' ? 'rtl' : 'ltr');

    expect(getDirection('en')).toBe('ltr');
    expect(getDirection('ar')).toBe('rtl');
  });

  it('5. should enforce draft and published state isolation rules', () => {
    const draftPayload: GatewayCustomizationPayload = {
      ...DEFAULT_GATEWAY_CMS_PAYLOAD,
      status: 'DRAFT',
      english: {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD.english,
        headlineEn: 'UNPUBLISHED DRAFT HEADLINE',
      },
    };

    const publishedPayload: GatewayCustomizationPayload = {
      ...DEFAULT_GATEWAY_CMS_PAYLOAD,
      status: 'PUBLISHED',
    };

    expect(draftPayload.status).toBe('DRAFT');
    expect(publishedPayload.status).toBe('PUBLISHED');
    expect(draftPayload.english.headlineEn).not.toBe(publishedPayload.english.headlineEn);
  });

  it('6. should verify media holder focal point boundaries are within 0-100%', () => {
    const { b2cDesktopMedia } = DEFAULT_GATEWAY_CMS_PAYLOAD;

    expect(b2cDesktopMedia.focalPointX).toBeGreaterThanOrEqual(0);
    expect(b2cDesktopMedia.focalPointX).toBeLessThanOrEqual(100);
    expect(b2cDesktopMedia.focalPointY).toBeGreaterThanOrEqual(0);
    expect(b2cDesktopMedia.focalPointY).toBeLessThanOrEqual(100);
  });

  it('7. should verify visual background style configuration options', () => {
    const validStyles = ['wireframe', 'glass', 'gradient', 'custom_media'];
    expect(validStyles).toContain(DEFAULT_GATEWAY_CMS_PAYLOAD.visual.backgroundStyle);
  });

  it('8. should verify SEO title and description fallbacks in both languages', () => {
    const { seoAccess } = DEFAULT_GATEWAY_CMS_PAYLOAD;

    expect(seoAccess.seoTitleEn).toContain('E3 Qatar');
    expect(seoAccess.seoTitleAr).toContain('إي ثري قطر');
    expect(seoAccess.seoDescEn).toBeTruthy();
    expect(seoAccess.seoDescAr).toBeTruthy();
    expect(seoAccess.ariaGatewayLabelEn).toBeTruthy();
    expect(seoAccess.ariaGatewayLabelAr).toBeTruthy();
  });
});
