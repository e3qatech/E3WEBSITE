import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  resolvePublicSiteSettings,
  getMaskedAdminSettings,
  isSensitiveKey,
  isMaskedOrBlankSecretSubmission,
  getServerSecretSetting,
  PUBLIC_SETTINGS_KEYS,
  SENSITIVE_SECRET_KEYS,
  MASKED_SECRET_PLACEHOLDER,
} from '@/lib/settings/public-settings';

// Mock DB, Auth, Redis, Next Cache, Navigation, Next-Auth
const mocks = vi.hoisted(() => ({
  session: null as any,
  db: {
    setting: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    siteSettings: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    pages: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    attraction: {
      findMany: vi.fn(),
    },
    attractionFaq: {
      findMany: vi.fn(),
    },
    feedback: {
      findMany: vi.fn(),
    },
    employeeProfile: {
      findMany: vi.fn(),
    },
    storyType: {
      findMany: vi.fn(),
    },
    service: {
      findMany: vi.fn(),
    },
    caseStudy: {
      findMany: vi.fn(),
    },
    partner: {
      findMany: vi.fn(),
    },
    brand: {
      findMany: vi.fn(),
    },
  },
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => mocks.session),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: mocks.session,
    status: mocks.session ? 'authenticated' : 'unauthenticated',
  }),
  SessionProvider: ({ children }: any) => children,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'en' }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('@/lib/db', () => ({
  default: mocks.db,
  db: mocks.db,
}));

vi.mock('@/lib/redis', () => ({
  redis: mocks.redis,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import db from '@/lib/db';
import { GET as SettingsGET, POST as SettingsPOST } from '../app/api/settings/route';
import RootB2BLayout from '../app/[locale]/b2b/layout';
import B2CLayout from '../app/[locale]/b2c/layout';
import B2BLandingPage from '../app/[locale]/b2b/page';
import B2CLandingPage from '../app/[locale]/b2c/page';
import B2CContactPage from '../app/[locale]/b2c/contact/page';
import B2BFAQsPage from '../app/[locale]/b2b/faqs/page';
import GatewayPage from '../app/[locale]/page';
import RootPage from '../app/page';

describe('QF-25 — Public Settings Credential Redaction & Server-Only Integration Boundary Suite', () => {
  const SENTINEL_BOOKINGQUBE_KEY = 'bq_live_sentinel_xyz123_secret_must_never_leak';
  const SENTINEL_MAPS_KEY = 'maps_sentinel_secret_456_forbidden_in_html';
  const SENTINEL_EMAIL_KEY = 'email_sentinel_secret_789_confidential';

  const MOCK_DB_SETTINGS_RECORDS = [
    { key: 'siteNameEn', value: 'E3 Corporate', type: 'GENERAL' },
    { key: 'siteNameAr', value: 'إي ثري للشركات', type: 'GENERAL' },
    { key: 'contactEmail', value: 'info@e3.qa', type: 'GENERAL' },
    { key: 'contactPhone', value: '+974 4400 0000', type: 'GENERAL' },
    { key: 'bookingqubeWebsite', value: 'https://bookingqube.com', type: 'GENERAL' },
    { key: 'lightLogoUrl', value: 'https://e3.qa/logo-light.png', type: 'GENERAL' },
    { key: 'darkLogoUrl', value: 'https://e3.qa/logo-dark.png', type: 'GENERAL' },
    { key: 'faviconUrl', value: 'https://e3.qa/favicon.ico', type: 'GENERAL' },
    { key: 'bookTicketsUrl', value: '/b2c/tickets', type: 'GENERAL' },
    { key: 'bookTicketsLabelEn', value: 'BOOK TICKETS', type: 'GENERAL' },
    { key: 'bookTicketsLabelAr', value: 'احجز التذاكر', type: 'GENERAL' },
    // Sensitive Credentials in DB
    { key: 'bookingQubeApiKey', value: SENTINEL_BOOKINGQUBE_KEY, type: 'GENERAL' },
    { key: 'mapsApiKey', value: SENTINEL_MAPS_KEY, type: 'GENERAL' },
    { key: 'emailGatewayKey', value: SENTINEL_EMAIL_KEY, type: 'GENERAL' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
    (db.setting.findMany as any).mockResolvedValue(MOCK_DB_SETTINGS_RECORDS);
    (db.siteSettings.findMany as any).mockResolvedValue(MOCK_DB_SETTINGS_RECORDS);
    (db.setting.findUnique as any).mockImplementation(({ where }: any) => {
      const match = MOCK_DB_SETTINGS_RECORDS.find((s) => s.key === where.key);
      return Promise.resolve(match || null);
    });
    (db.siteSettings.findUnique as any).mockImplementation(({ where }: any) => {
      const match = MOCK_DB_SETTINGS_RECORDS.find((s) => s.key === where.key);
      return Promise.resolve(match || null);
    });
    (db.setting.upsert as any).mockResolvedValue({ id: 's-1', key: 'bookingQubeApiKey' });
    (db.siteSettings.upsert as any).mockResolvedValue({ id: 's-1', key: 'bookingQubeApiKey' });
    (db.pages.findUnique as any).mockResolvedValue(null);
    (db.pages.findMany as any).mockResolvedValue([]);
    (db.attraction.findMany as any).mockResolvedValue([]);
    (db.attractionFaq.findMany as any).mockResolvedValue([]);
    (db.feedback.findMany as any).mockResolvedValue([]);
    (db.employeeProfile.findMany as any).mockResolvedValue([]);
    (db.storyType.findMany as any).mockResolvedValue([]);
    (db.service.findMany as any).mockResolvedValue([]);
    (db.caseStudy.findMany as any).mockResolvedValue([]);
    (db.partner.findMany as any).mockResolvedValue([]);
    (db.brand.findMany as any).mockResolvedValue([]);
  });

  // =========================================================================
  // 1. SAFE PUBLIC SETTINGS DTO CONTRACT
  // =========================================================================
  describe('1. Safe Public Settings DTO Contract', () => {
    it('resolvePublicSiteSettings extracts allowlisted fields and strictly excludes all sensitive secrets', () => {
      const rawPayload = {
        siteNameEn: 'E3 Custom Name',
        siteNameAr: 'إي ثري',
        contactEmail: 'contact@e3.qa',
        bookingqubeWebsite: 'https://bookingqube.com',
        bookingQubeApiKey: SENTINEL_BOOKINGQUBE_KEY,
        mapsApiKey: SENTINEL_MAPS_KEY,
        emailGatewayKey: SENTINEL_EMAIL_KEY,
        unallowlistedRandomField: 'random_value',
      };

      const publicDto = resolvePublicSiteSettings(rawPayload);

      // Safe fields present
      expect(publicDto.siteNameEn).toBe('E3 Custom Name');
      expect(publicDto.siteNameAr).toBe('إي ثري');
      expect(publicDto.contactEmail).toBe('contact@e3.qa');
      expect(publicDto.bookingqubeWebsite).toBe('https://bookingqube.com');

      // Sensitive fields completely absent
      expect((publicDto as any).bookingQubeApiKey).toBeUndefined();
      expect((publicDto as any).mapsApiKey).toBeUndefined();
      expect((publicDto as any).emailGatewayKey).toBeUndefined();
      expect((publicDto as any).unallowlistedRandomField).toBeUndefined();

      // Serialized string contains no sentinel credentials
      const serialized = JSON.stringify(publicDto);
      expect(serialized).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(serialized).not.toContain(SENTINEL_MAPS_KEY);
      expect(serialized).not.toContain(SENTINEL_EMAIL_KEY);
      expect(serialized).not.toContain('bookingQubeApiKey');
    });

    it('isSensitiveKey reliably flags secret credentials', () => {
      expect(isSensitiveKey('bookingQubeApiKey')).toBe(true);
      expect(isSensitiveKey('mapsApiKey')).toBe(true);
      expect(isSensitiveKey('emailGatewayKey')).toBe(true);
      expect(isSensitiveKey('stripeSecretKey')).toBe(true);
      expect(isSensitiveKey('webhookSecret')).toBe(true);
      expect(isSensitiveKey('custom_api_key')).toBe(true);
      expect(isSensitiveKey('user_password')).toBe(true);

      // Non-secret fields
      expect(isSensitiveKey('siteNameEn')).toBe(false);
      expect(isSensitiveKey('contactEmail')).toBe(false);
      expect(isSensitiveKey('bookingqubeWebsite')).toBe(false);
      expect(isSensitiveKey('bookTicketsUrl')).toBe(false);

      // Key sets integrity
      expect(PUBLIC_SETTINGS_KEYS.has('siteNameEn')).toBe(true);
      expect(PUBLIC_SETTINGS_KEYS.has('bookingqubeWebsite')).toBe(true);
      expect(SENSITIVE_SECRET_KEYS.has('bookingQubeApiKey')).toBe(true);
      expect(SENSITIVE_SECRET_KEYS.has('mapsApiKey')).toBe(true);
    });

    it('getMaskedAdminSettings masks secret entries and sets presence indicators', () => {
      const masked = getMaskedAdminSettings(MOCK_DB_SETTINGS_RECORDS);
      expect(masked.bookingQubeApiKey).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(masked.mapsApiKey).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(masked.emailGatewayKey).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(masked.has_bookingQubeApiKey).toBe(true);
      expect(masked.siteNameEn).toBe('E3 Corporate');
    });

    it('isMaskedOrBlankSecretSubmission correctly detects preserve intent', () => {
      expect(isMaskedOrBlankSecretSubmission('')).toBe(true);
      expect(isMaskedOrBlankSecretSubmission('   ')).toBe(true);
      expect(isMaskedOrBlankSecretSubmission(undefined)).toBe(true);
      expect(isMaskedOrBlankSecretSubmission(null)).toBe(true);
      expect(isMaskedOrBlankSecretSubmission(MASKED_SECRET_PLACEHOLDER)).toBe(true);
      expect(isMaskedOrBlankSecretSubmission('••••••••')).toBe(true);
      expect(isMaskedOrBlankSecretSubmission('***')).toBe(true);
      expect(isMaskedOrBlankSecretSubmission('fresh_unmasked_secret')).toBe(false);
    });
  });

  // =========================================================================
  // 2. PUBLIC API ENDPOINT SANITIZATION (GET /api/settings)
  // =========================================================================
  describe('2. Public API Endpoint Sanitization (GET /api/settings)', () => {
    it('GET /api/settings returns only allowlisted public fields with 0 credentials for unauthenticated calls', async () => {
      mocks.session = null;
      const req = new Request('http://localhost:3000/api/settings');
      const res = await SettingsGET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.siteNameEn).toBe('E3 Corporate');

      // Verify zero credentials in response body
      const jsonString = JSON.stringify(json);
      expect(jsonString).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(jsonString).not.toContain(SENTINEL_MAPS_KEY);
      expect(jsonString).not.toContain(SENTINEL_EMAIL_KEY);
      expect(json.data.bookingQubeApiKey).toBeUndefined();
    });

    it('GET /api/settings?admin=true returns masked metadata for authorized managers without exposing raw secrets', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      const req = new Request('http://localhost:3000/api/settings?admin=true');
      const res = await SettingsGET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isAuthorized).toBe(true);

      // Masked placeholder returned instead of raw secret
      expect(json.data.bookingQubeApiKey).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(json.data.mapsApiKey).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(json.data.emailGatewayKey).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(json.data.has_bookingQubeApiKey).toBe(true);

      // Raw secrets never present
      const jsonString = JSON.stringify(json);
      expect(jsonString).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(jsonString).not.toContain(SENTINEL_MAPS_KEY);
      expect(jsonString).not.toContain(SENTINEL_EMAIL_KEY);
    });
  });

  // =========================================================================
  // 3. WRITE-ONLY REPLACEMENT SEMANTICS & PRESERVE-ON-BLANK (POST /api/settings)
  // =========================================================================
  describe('3. Write-Only Replacement Semantics & Preserve-on-Blank (POST /api/settings)', () => {
    it('POST /api/settings enforces 401 unauth and 403 unauthorized', async () => {
      // Unauthenticated
      mocks.session = null;
      const unauthReq = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'siteNameEn', value: 'New Name' }),
      });
      expect((await SettingsPOST(unauthReq)).status).toBe(401);

      // Unauthorized Role (CLIENT)
      mocks.session = { user: { id: 'client-1', role: 'CLIENT' } };
      expect((await SettingsPOST(unauthReq)).status).toBe(403);
    });

    it('POST /api/settings preserves existing secret on blank or masked submission', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };

      // 1. Masked submission (••••••••••••••••)
      const maskedReq = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'bookingQubeApiKey', value: MASKED_SECRET_PLACEHOLDER }),
      });
      const maskedRes = await SettingsPOST(maskedReq);
      expect(maskedRes.status).toBe(200);
      const maskedJson = await maskedRes.json();
      expect(maskedJson.action).toBe('PRESERVED');
      expect(db.setting.upsert).not.toHaveBeenCalled();
      expect(db.siteSettings.upsert).not.toHaveBeenCalled();

      // 2. Empty string submission
      const blankReq = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'mapsApiKey', value: '   ' }),
      });
      const blankRes = await SettingsPOST(blankReq);
      expect(blankRes.status).toBe(200);
      const blankJson = await blankRes.json();
      expect(blankJson.action).toBe('PRESERVED');
    });

    it('POST /api/settings replaces secret when new non-empty plaintext is submitted by authorized admin', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.siteSettings.upsert as any).mockResolvedValue({
        key: 'bookingQubeApiKey',
        type: 'INTEGRATION',
        updatedAt: new Date('2026-08-15'),
      });
      (db.setting.upsert as any).mockResolvedValue({
        key: 'bookingQubeApiKey',
        type: 'INTEGRATION',
        updatedAt: new Date('2026-08-15'),
      });

      const updateReq = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'bookingQubeApiKey', value: 'new_fresh_secret_key_999' }),
      });

      const res = await SettingsPOST(updateReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.action).toBe('UPDATED');
    });
  });

  // =========================================================================
  // 4. RENDERED PAGES & LAYOUT CREDENTIAL ZERO-LEAK VERIFICATION
  // =========================================================================
  describe('4. Rendered Pages & Layout Credential Zero-Leak Verification', () => {
    it('B2B Layout renders without leaking sensitive credentials into markup or props', async () => {
      const layout = await RootB2BLayout({
        params: Promise.resolve({ locale: 'en' }),
        children: <div data-testid="b2b-child">B2B Content</div>,
      });

      const markup = renderToStaticMarkup(layout);
      expect(markup).toContain('B2B Content');
      expect(markup).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(markup).not.toContain(SENTINEL_MAPS_KEY);
      expect(markup).not.toContain(SENTINEL_EMAIL_KEY);
      expect(markup).not.toContain('bookingQubeApiKey');
    });

    it('B2C Layout renders without leaking sensitive credentials into markup or props', async () => {
      const layout = await B2CLayout({
        params: Promise.resolve({ locale: 'en' }),
        children: <div data-testid="b2c-child">B2C Content</div>,
      });

      const markup = renderToStaticMarkup(layout);
      expect(markup).toContain('B2C Content');
      expect(markup).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(markup).not.toContain(SENTINEL_MAPS_KEY);
      expect(markup).not.toContain(SENTINEL_EMAIL_KEY);
      expect(markup).not.toContain('bookingQubeApiKey');
    });

    it('Root and Localized Gateway Pages (/, /en, /ar) contain zero sensitive credentials', async () => {
      // Root Page
      const rootPage = await RootPage();
      const rootMarkup = renderToStaticMarkup(rootPage);
      expect(rootMarkup).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(rootMarkup).not.toContain(SENTINEL_MAPS_KEY);
      expect(rootMarkup).not.toContain(SENTINEL_EMAIL_KEY);

      // EN Gateway
      const enGateway = await GatewayPage({ params: Promise.resolve({ locale: 'en' }) });
      const enMarkup = renderToStaticMarkup(enGateway);
      expect(enMarkup).not.toContain(SENTINEL_BOOKINGQUBE_KEY);

      // AR Gateway
      const arGateway = await GatewayPage({ params: Promise.resolve({ locale: 'ar' }) });
      const arMarkup = renderToStaticMarkup(arGateway);
      expect(arMarkup).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
    });

    it('B2C Landing Page (EN & AR) contains zero sensitive credentials', async () => {
      const b2cPageEn = await B2CLandingPage({ params: Promise.resolve({ locale: 'en' }) });
      const markupEn = renderToStaticMarkup(b2cPageEn);
      expect(markupEn).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(markupEn).not.toContain(SENTINEL_MAPS_KEY);

      const b2cPageAr = await B2CLandingPage({ params: Promise.resolve({ locale: 'ar' }) });
      const markupAr = renderToStaticMarkup(b2cPageAr);
      expect(markupAr).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(markupAr).not.toContain(SENTINEL_MAPS_KEY);
    });

    it('B2B Homepage (EN & AR) contains zero sensitive credentials', async () => {
      const b2bHomeEn = await B2BLandingPage({ params: Promise.resolve({ locale: 'en' }) });
      const markupEn = renderToStaticMarkup(b2bHomeEn);
      expect(markupEn).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(markupEn).not.toContain(SENTINEL_MAPS_KEY);

      const b2bHomeAr = await B2BLandingPage({ params: Promise.resolve({ locale: 'ar' }) });
      const markupAr = renderToStaticMarkup(b2bHomeAr);
      expect(markupAr).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(markupAr).not.toContain(SENTINEL_MAPS_KEY);
    });

    it('B2C Contact and B2B FAQs pages contain zero sensitive credentials', async () => {
      const contactPage = await B2CContactPage();
      const contactMarkup = renderToStaticMarkup(contactPage);
      expect(contactMarkup).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(contactMarkup).not.toContain(SENTINEL_MAPS_KEY);

      const faqsPage = await B2BFAQsPage({ params: Promise.resolve({ locale: 'en' }) });
      const faqsMarkup = renderToStaticMarkup(faqsPage);
      expect(faqsMarkup).not.toContain(SENTINEL_BOOKINGQUBE_KEY);
      expect(faqsMarkup).not.toContain(SENTINEL_MAPS_KEY);
    });
  });

  // =========================================================================
  // 5. SERVER-ONLY INTEGRATION BOUNDARY (BookingQube & Server Secrets)
  // =========================================================================
  describe('5. Server-Only Integration Boundary (BookingQube & Server Secrets)', () => {
    it('getServerSecretSetting reads credentials directly on the server without leaking to public DTO', async () => {
      (db.setting.findUnique as any).mockResolvedValue({
        key: 'bookingQubeApiKey',
        value: SENTINEL_BOOKINGQUBE_KEY,
      });

      const serverSecret = await getServerSecretSetting('bookingQubeApiKey');
      expect(serverSecret).toBe(SENTINEL_BOOKINGQUBE_KEY);

      // Public DTO never contains it
      const publicDto = resolvePublicSiteSettings([{ key: 'bookingQubeApiKey', value: serverSecret }]);
      expect((publicDto as any).bookingQubeApiKey).toBeUndefined();
    });
  });

  // =========================================================================
  // 6. SOURCE GUARD & ARCHITECTURE INVARIANTS
  // =========================================================================
  describe('6. Source Guard & Architecture Invariants', () => {
    it('source files enforce getPublicSettingsServer and banned raw spreads', async () => {
      const fs = await import('fs');
      const path = await import('path');

      const b2bLayoutContent = fs.readFileSync(
        path.resolve(__dirname, '../app/[locale]/b2b/layout.tsx'),
        'utf-8'
      );
      const b2cLayoutContent = fs.readFileSync(
        path.resolve(__dirname, '../app/[locale]/b2c/layout.tsx'),
        'utf-8'
      );
      const resolverContent = fs.readFileSync(
        path.resolve(__dirname, '../lib/settings/public-settings.ts'),
        'utf-8'
      );

      // Both layouts MUST use getPublicSettingsServer
      expect(b2bLayoutContent).toContain('getPublicSettingsServer');
      expect(b2cLayoutContent).toContain('getPublicSettingsServer');

      // Neither layout may directly query GENERAL settings and spread without filter
      expect(b2bLayoutContent).not.toMatch(/where:\s*\{\s*type:\s*['"]GENERAL['"]\s*\}/);

      // Resolver must NOT use delete secret patterns
      expect(resolverContent).not.toContain('delete ');
    });
  });
});
