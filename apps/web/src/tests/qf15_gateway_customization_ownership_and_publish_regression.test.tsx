import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { PortalGateway } from '@/components/home/PortalGateway';
import { GeneralSettingsView } from '@/components/dashboard/settings/GeneralSettingsView';
import GatewayLocalePage from '@/app/[locale]/page';
import Home from '@/app/page';
import { setMockWebGLSupport, resetMockWebGLSupport } from '@/lib/webgl-capability';
import {
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayCustomizationPayload,
} from '@/types/gateway-cms';
import { GET, POST } from '@/app/api/settings/gateway/route';
import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
}));

describe('QF-15 — Gateway Customization Ownership & Publish Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. OWNERSHIP MATRIX & ISOLATION
  // =========================================================================
  describe('1. Ownership Matrix & Canonical Separation', () => {
    it('General Settings renders dedicated handoff to canonical Gateway Customization editor without duplicate inputs', () => {
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <GeneralSettingsView initialSettings={{ siteNameEn: 'E3 Qatar' }} />
        </LocaleProvider>
      );

      // Verify handoff link and canonical title
      expect(htmlEn).toContain('50/50 Portal Gateway Customization');
      expect(htmlEn).toContain('Dedicated Gateway Customization CMS');
      expect(htmlEn).toContain('href="/en/dashboard/settings/gateway"');
      expect(htmlEn).toContain('Open Gateway Editor');

      // Verify legacy duplicate inputs are absent
      expect(htmlEn).not.toContain('name="gatewayB2CTitle"');
      expect(htmlEn).not.toContain('name="gatewayB2BTitle"');

      // Arabic rendering
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <GeneralSettingsView initialSettings={{ siteNameAr: 'إي ثري قطر' }} />
        </LocaleProvider>
      );

      expect(htmlAr).toContain('تخصيص بوابة الدخول 50/50');
      expect(htmlAr).toContain('المحرر المتخصص لبوابة الدخول المركزية');
      expect(htmlAr).toContain('href="/ar/dashboard/settings/gateway"');
      expect(htmlAr).toContain('فتح محرر بوابة الدخول');
    });

    it('Gateway payload schema maintains strict ownership boundary separate from general and catalog tables', () => {
      const payload = { ...DEFAULT_GATEWAY_CMS_PAYLOAD };
      // Gateway owns 50/50 split, media holders, theme logos, and bilingual intro copy
      expect(payload).toHaveProperty('english');
      expect(payload).toHaveProperty('arabic');
      expect(payload).toHaveProperty('logo');
      expect(payload).toHaveProperty('visual');
      expect(payload).toHaveProperty('b2cDesktopMedia');
      expect(payload).toHaveProperty('b2bDesktopMedia');

      // Gateway does NOT own individual attraction or service catalog records
      expect(payload).not.toHaveProperty('attractionsList');
      expect(payload).not.toHaveProperty('packagesList');
      expect(payload).not.toHaveProperty('servicesList');
    });
  });

  // =========================================================================
  // 2. LOADING, EMPTY & ERROR STATES
  // =========================================================================
  describe('2. Loading, Fallback & Error Resilience', () => {
    it('GET /api/settings/gateway returns fallback default payload when database record is empty', async () => {
      vi.spyOn(db.setting, 'findUnique').mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/settings/gateway?mode=published');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.english.headlineEn).toBe(DEFAULT_GATEWAY_CMS_PAYLOAD.english.headlineEn);
      expect(json.data.arabic.headlineAr).toBe(DEFAULT_GATEWAY_CMS_PAYLOAD.arabic.headlineAr);
    });

    it('GET /api/settings/gateway returns published data with sanitized payload in published mode', async () => {
      const mockPublishedRecord = {
        id: 'set-1',
        key: 'gateway_customization_published',
        value: {
          ...DEFAULT_GATEWAY_CMS_PAYLOAD,
          status: 'PUBLISHED',
          english: {
            ...DEFAULT_GATEWAY_CMS_PAYLOAD.english,
            headlineEn: 'LIVE PUBLISHED GATEWAY',
          },
          updatedBy: 'admin@e3.qa',
        },
        type: 'UI',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(db.setting, 'findUnique').mockResolvedValue(mockPublishedRecord as any);

      const req = new NextRequest('http://localhost:3000/api/settings/gateway?mode=published');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.english.headlineEn).toBe('LIVE PUBLISHED GATEWAY');
      // Verify updatedBy is removed for public consumption
      expect(json.data.updatedBy).toBeUndefined();
    });
  });

  // =========================================================================
  // 3. SAVE DRAFT & PUBLISH ISOLATION
  // =========================================================================
  describe('3. Save Draft, Publish & Isolation', () => {
    it('Save Draft writes only to gateway_customization_draft without mutating published record', async () => {
      (auth as any).mockResolvedValue({
        user: { email: 'admin@e3.qa', role: 'SUPER_ADMIN' },
      });

      const upsertSpy = vi.spyOn(db.setting, 'upsert').mockResolvedValue({} as any);

      const draftPayload: GatewayCustomizationPayload = {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD,
        status: 'DRAFT',
        english: {
          ...DEFAULT_GATEWAY_CMS_PAYLOAD.english,
          headlineEn: 'STAGED DRAFT HEADLINE',
        },
      };

      const req = new NextRequest('http://localhost:3000/api/settings/gateway', {
        method: 'POST',
        body: JSON.stringify({ action: 'save_draft', payload: draftPayload }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.action).toBe('save_draft');

      // Verify upsert was called with key 'gateway_customization_draft'
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'gateway_customization_draft' },
        })
      );
    });

    it('Publish writes to gateway_customization_published and creates immutable version snapshot', async () => {
      (auth as any).mockResolvedValue({
        user: { email: 'superadmin@e3.qa', role: 'SUPER_ADMIN' },
      });

      vi.spyOn(db.setting, 'findUnique').mockResolvedValue({
        id: 'ver-1',
        key: 'gateway_experience_versions',
        value: [],
        type: 'UI',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const upsertSpy = vi.spyOn(db.setting, 'upsert').mockResolvedValue({} as any);

      const publishPayload: GatewayCustomizationPayload = {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD,
        english: {
          ...DEFAULT_GATEWAY_CMS_PAYLOAD.english,
          headlineEn: 'NEW MAJOR CAMPAIGN 2026',
        },
      };

      const req = new NextRequest('http://localhost:3000/api/settings/gateway', {
        method: 'POST',
        body: JSON.stringify({
          action: 'publish',
          payload: publishPayload,
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.action).toBe('publish');
      expect(json.version).toBe(1);

      // Verify published record upsert
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'gateway_customization_published' },
        })
      );

      // Verify versions history upsert
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'gateway_experience_versions' },
        })
      );
    });
  });

  // =========================================================================
  // 4. VERSION HISTORY & 1-CLICK ROLLBACK
  // =========================================================================
  describe('4. Version History & Rollback Integrity', () => {
    it('Rollback restores snapshot data and monotonically increments release version', async () => {
      (auth as any).mockResolvedValue({
        user: { email: 'superadmin@e3.qa', role: 'SUPER_ADMIN' },
      });

      const mockSnapshot: GatewayCustomizationPayload = {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD,
        english: {
          ...DEFAULT_GATEWAY_CMS_PAYLOAD.english,
          headlineEn: 'VERSION 1 HISTORIC HEADLINE',
        },
      };

      const existingVersions = [
        {
          version: 1,
          publishedAt: '2026-08-01T10:00:00Z',
          publishedBy: 'admin@e3.qa',
          releaseNotes: 'Initial release',
          snapshot: mockSnapshot,
        },
      ];

      vi.spyOn(db.setting, 'findUnique').mockResolvedValue({
        id: 'ver-1',
        key: 'gateway_experience_versions',
        value: existingVersions,
        type: 'UI',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const upsertSpy = vi.spyOn(db.setting, 'upsert').mockResolvedValue({} as any);

      const req = new NextRequest('http://localhost:3000/api/settings/gateway', {
        method: 'POST',
        body: JSON.stringify({
          action: 'rollback',
          targetVersion: 1,
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.action).toBe('rollback');
      expect(json.version).toBe(1);
      expect(json.newVersion).toBe(2); // Monotonic increment (1 + 1)
      expect(json.data.english.headlineEn).toBe('VERSION 1 HISTORIC HEADLINE');

      // Verify published record updated with rollback snapshot
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'gateway_customization_published' },
        })
      );
    });
  });

  // =========================================================================
  // 5. RBAC & PERMISSION GUARDRAILS
  // =========================================================================
  describe('5. RBAC & Access Control Guardrails', () => {
    it('Unauthenticated requests are strictly rejected with 403 Forbidden', async () => {
      (auth as any).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/settings/gateway', {
        method: 'POST',
        body: JSON.stringify({ action: 'save_draft', payload: DEFAULT_GATEWAY_CMS_PAYLOAD }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain('Unauthorized');
    });

    it('Publish action requires SUPER_ADMIN role and rejects lower admin roles', async () => {
      (auth as any).mockResolvedValue({
        user: { email: 'sales@e3.qa', role: 'SALES_ADMIN' },
      });

      const req = new NextRequest('http://localhost:3000/api/settings/gateway', {
        method: 'POST',
        body: JSON.stringify({ action: 'publish', payload: DEFAULT_GATEWAY_CMS_PAYLOAD }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain('Super Admin privileges required');
    });
  });

  // =========================================================================
  // 6. RENDERED BILINGUAL GATEWAY & RTL LAYOUT
  // =========================================================================
  describe('6. Rendered Bilingual Gateway, RTL & Theme Logo Visibility', () => {
    it('Renders English gateway in LTR with verified E3 logo, headline, and portal links', () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PortalGateway cmsData={DEFAULT_GATEWAY_CMS_PAYLOAD} />
        </LocaleProvider>
      );

      // Layout direction & accessibility
      expect(html).toContain('dir="ltr"');
      expect(html).toContain('role="region"');

      // Headline and portals
      expect(html).toContain('TWO WORLDS. ONE E3.');
      expect(html).toContain('EXPERIENCE WHAT’S NEXT');
      expect(html).toContain('BUILD WHAT’S NEXT');

      // Logo SVG rendered (not plain text)
      expect(html).toContain('<svg');
      expect(html).toContain('aria-label="Official E3 Qatar Logo"');
    });

    it('Renders Arabic gateway in RTL with Arabic copy, badges, and localized destination links', () => {
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <PortalGateway
            cmsData={DEFAULT_GATEWAY_CMS_PAYLOAD}
            simulation={{ locale: 'ar', theme: 'dark', viewport: 'desktop-1440', portalFocus: 'none', reducedMotion: false, useFallbackMedia: false }}
          />
        </LocaleProvider>
      );

      // RTL direction
      expect(htmlAr).toContain('dir="rtl"');

      // Arabic headlines and portal text
      expect(htmlAr).toContain('عالمان. وجهة واحدة: E3');
      expect(htmlAr).toContain('عِش التجربة القادمة');
      expect(htmlAr).toContain('لنصنع القادم');
      expect(htmlAr).toContain('التجارب والوجهات');
      expect(htmlAr).toContain('للعلامات التجارية والمؤسسات');
      expect(htmlAr).toContain('aria-label="شعار إي ثري قطر الرسمي"');
    });
  });

  // =========================================================================
  // 7. WEATHER REMOVAL & CINEMATIC INTEGRITY
  // =========================================================================
  describe('7. Weather Removal & Cinematic Media Integrity', () => {
    it('Verifies complete absence of weather data, rules, and UI in gateway schema and rendered markup', () => {
      const payload = DEFAULT_GATEWAY_CMS_PAYLOAD as any;
      expect(payload.weatherRules).toBeUndefined();
      expect(payload.atmospherePresets).toBeUndefined();
      expect(payload.experienceConfig).toBeUndefined();
      expect(payload.dohaWeatherApi).toBeUndefined();

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PortalGateway cmsData={DEFAULT_GATEWAY_CMS_PAYLOAD} />
        </LocaleProvider>
      );

      expect(html).not.toContain('°C');
      expect(html).not.toContain('Doha Weather');
      expect(html).not.toContain('Clear Sky');
    });

    it('Universal media holders require mandatory fallback image assets for resilience', () => {
      const { b2cDesktopMedia, b2cMobileMedia, b2bDesktopMedia, b2bMobileMedia } =
        DEFAULT_GATEWAY_CMS_PAYLOAD;

      expect(b2cDesktopMedia.fallbackImageUrl).toBeTruthy();
      expect(b2cMobileMedia.fallbackImageUrl).toBeTruthy();
      expect(b2bDesktopMedia.fallbackImageUrl).toBeTruthy();
      expect(b2bMobileMedia.fallbackImageUrl).toBeTruthy();
    });
  });

  // =========================================================================
  // 8. QF-15-B: CANONICAL PUBLIC ROUTES & NO-WEBGL 2D FALLBACK
  // =========================================================================
  describe('8. QF-15-B: Canonical Public Gateway Routes & No-WebGL Fallback', () => {
    it('Canonical /[locale]/page.tsx renders working /en and /ar gateway routes with accurate dir, links, and language toggles', async () => {
      // 1. English Canonical Route (/en)
      const pageEn = await GatewayLocalePage({
        params: Promise.resolve({ locale: 'en' }),
      });
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          {pageEn}
        </LocaleProvider>
      );

      expect(htmlEn).toContain('dir="ltr"');
      expect(htmlEn).toContain('href="/en/b2c"');
      expect(htmlEn).toContain('href="/en/b2b"');
      expect(htmlEn).toContain('EXPERIENCE WHAT’S NEXT');
      expect(htmlEn).toContain('BUILD WHAT’S NEXT');
      expect(htmlEn).toContain('العربية');

      // 2. Arabic Canonical Route (/ar)
      const pageAr = await GatewayLocalePage({
        params: Promise.resolve({ locale: 'ar' }),
      });
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          {pageAr}
        </LocaleProvider>
      );

      expect(htmlAr).toContain('dir="rtl"');
      expect(htmlAr).toContain('href="/ar/b2c"');
      expect(htmlAr).toContain('href="/ar/b2b"');
      expect(htmlAr).toContain('عِش التجربة القادمة');
      expect(htmlAr).toContain('لنصنع القادم');
      expect(htmlAr).toContain('ENGLISH');

      // 3. Default Safe / Route
      const pageHome = await Home();
      const htmlHome = renderToStaticMarkup(pageHome);
      expect(htmlHome).toContain('EXPERIENCE WHAT’S NEXT');
      expect(htmlHome).toContain('href="/en/b2c"');
    });

    it('In minimal / No-WebGL mode, renders full 2D gateway design with zero canvas and zero WebGL crash errors', () => {
      setMockWebGLSupport(false);

      const wireframePayload: GatewayCustomizationPayload = {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD,
        visual: {
          ...DEFAULT_GATEWAY_CMS_PAYLOAD.visual,
          backgroundStyle: 'wireframe',
        },
      };

      const htmlNoWebGL = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PortalGateway cmsData={wireframePayload} />
        </LocaleProvider>
      );

      // Complete 2D branding and gateway elements preserved
      expect(htmlNoWebGL).toContain('EXPERIENCE WHAT’S NEXT');
      expect(htmlNoWebGL).toContain('BUILD WHAT’S NEXT');
      expect(htmlNoWebGL).toContain('Explore Experiences');
      expect(htmlNoWebGL).toContain('Work With E3');
      expect(htmlNoWebGL).toContain('<svg');
      expect(htmlNoWebGL).toContain('العربية');

      // Zero canvas elements rendered
      expect(htmlNoWebGL).not.toContain('<canvas');

      resetMockWebGLSupport();
    });

    it('WebGL-capable environment preserves cinematic 3D wireframe background without global boundary errors', () => {
      setMockWebGLSupport(true);

      const wireframePayload: GatewayCustomizationPayload = {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD,
        visual: {
          ...DEFAULT_GATEWAY_CMS_PAYLOAD.visual,
          backgroundStyle: 'wireframe',
        },
      };

      const htmlWebGL = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PortalGateway cmsData={wireframePayload} />
        </LocaleProvider>
      );

      expect(htmlWebGL).toContain('EXPERIENCE WHAT’S NEXT');
      expect(htmlWebGL).toContain('BUILD WHAT’S NEXT');
      expect(htmlWebGL).not.toContain('°C');

      resetMockWebGLSupport();
    });
  });
});
