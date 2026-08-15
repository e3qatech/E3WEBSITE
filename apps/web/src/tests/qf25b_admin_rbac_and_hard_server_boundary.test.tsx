import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import fs from 'fs';
import path from 'path';

import {
  getMaskedAdminSettings,
  isSensitiveKey,
  BOOKINGQUBE_CANONICAL_KEY,
  MASKED_SECRET_PLACEHOLDER,
} from '@/lib/settings/public-settings';
import { generateTicketUrl } from '@/lib/bookingqube-client';
import { checkAvailability, resolveBookingQubeApiKey } from '@/lib/bookingqube-server';
import { GET as settingsGET, POST as settingsPOST } from '@/app/api/settings/route';
import GeneralSettingsPage from '@/app/[locale]/dashboard/settings/general/page';
import B2BContactPage from '@/app/[locale]/b2b/contact/page';
import B2BFeedbackPage from '@/app/[locale]/b2b/feedback/page';

// Mock DB, Auth, Redis, Navigation, Store
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
    feedback: {
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

vi.mock('@/lib/db', () => ({
  default: mocks.db,
  db: mocks.db,
}));

vi.mock('@/lib/redis', () => ({
  redis: mocks.redis,
  default: mocks.redis,
}));

vi.mock('server-only', () => ({}));

vi.mock('@/store/b2b-store', () => ({
  useB2BRFP: () => ({
    inquiryType: 'general',
    setInquiryType: vi.fn(),
  }),
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

const SENSITIVE_FIXTURES = {
  BOOKINGQUBE_KEY: 'bq_live_sec_99998888777766665555',
  LEGACY_ALIAS_KEY: 'bq_legacy_secret_1111222233334444',
  MAPS_KEY: 'AIzaSySecretMapsKey999888',
  CUSTOM_DSN: 'postgres://admin:super_secret_pw@db.e3.qa:5432/prod',
  SIGNING_SECRET: 'jwt_signing_secret_xyz123',
  CERT_KEY: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...',
};

describe('QF-25-B — ADMIN RBAC & HARD SERVER-ONLY INTEGRATION BOUNDARY', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
    const defaultSettings = [
      { key: 'siteNameEn', value: 'E3 Qatar' },
      { key: 'siteNameAr', value: 'إي ثري قطر' },
      { key: 'contactEmail', value: 'contact@e3.qa' },
    ];
    (mocks.db.setting.findMany as any).mockResolvedValue(defaultSettings);
    (mocks.db.siteSettings.findMany as any).mockResolvedValue(defaultSettings);
    (mocks.db.setting.findUnique as any).mockResolvedValue(null);
    (mocks.db.siteSettings.findUnique as any).mockResolvedValue(null);
    (mocks.db.setting.upsert as any).mockImplementation(({ update, create }: any) =>
      Promise.resolve({ id: 'test-id', ...(update || create), updatedAt: new Date() })
    );
    (mocks.db.siteSettings.upsert as any).mockImplementation(({ update, create }: any) =>
      Promise.resolve({ id: 'test-id', ...(update || create), updatedAt: new Date() })
    );
  });

  // =========================================================================
  // 1. ADMIN SETTINGS AUTHORIZATION (401 Unauthenticated, 403 Unauthorized)
  // =========================================================================
  describe('1. Admin Settings Authorization & Canonical Capability Enforcement', () => {
    it('GET /api/settings?admin=true returns HTTP 401 for unauthenticated requests', async () => {
      mocks.session = null;

      const req = new Request('http://localhost:3000/api/settings?admin=true');
      const res = await settingsGET(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toContain('Unauthorized');
    });

    it('GET /api/settings?admin=true returns HTTP 403 for authenticated roles without settings.general.manage', async () => {
      const unauthorizedRoles = [
        'SALES_ADMIN',
        'B2C_ADMIN',
        'B2B_ADMIN',
        'SUPPORT_ADMIN',
        'HR_ADMIN',
        'OPERATIONS_ADMIN',
        'STAFF',
        'CLIENT',
        'BUSINESS_USER',
        'CANDIDATE',
      ];

      for (const role of unauthorizedRoles) {
        mocks.session = { user: { id: 'u1', name: 'Test User', role } };

        const req = new Request('http://localhost:3000/api/settings?admin=true');
        const res = await settingsGET(req);
        expect(res.status).toBe(403);

        const json = await res.json();
        expect(json.error).toContain('Forbidden');
      }
    });

    it('GET /api/settings?admin=true returns HTTP 200 with masked settings for SUPER_ADMIN', async () => {
      mocks.session = { user: { id: 'u1', name: 'Super Admin', role: 'SUPER_ADMIN' } };

      const records = [
        { key: 'siteNameEn', value: 'E3 Qatar' },
        { key: 'bookingQubeApiKey', value: SENSITIVE_FIXTURES.BOOKINGQUBE_KEY },
        { key: 'customConnectionString', value: SENSITIVE_FIXTURES.CUSTOM_DSN },
      ];
      (mocks.db.setting.findMany as any).mockResolvedValue(records);
      (mocks.db.siteSettings.findMany as any).mockResolvedValue(records);

      const req = new Request('http://localhost:3000/api/settings?admin=true');
      const res = await settingsGET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isAuthorized).toBe(true);
      expect(json.data.siteNameEn).toBe('E3 Qatar');

      // Credentials MUST be masked
      expect(json.data.bookingQubeApiKey).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(json.data.has_bookingQubeApiKey).toBe(true);
      expect(json.data.customConnectionString).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(json.data.has_customConnectionString).toBe(true);

      // Raw secrets must never appear in payload
      expect(JSON.stringify(json)).not.toContain(SENSITIVE_FIXTURES.BOOKINGQUBE_KEY);
      expect(JSON.stringify(json)).not.toContain(SENSITIVE_FIXTURES.CUSTOM_DSN);
    });

    it('POST /api/settings returns HTTP 401 for unauthenticated requests', async () => {
      mocks.session = null;

      const req = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'siteNameEn', value: 'New Name' }),
      });
      const res = await settingsPOST(req);
      expect(res.status).toBe(401);
    });

    it('POST /api/settings returns HTTP 403 for roles lacking settings.general.manage', async () => {
      mocks.session = { user: { id: 'u1', role: 'SALES_ADMIN' } };

      const req = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'siteNameEn', value: 'New Name' }),
      });
      const res = await settingsPOST(req);
      expect(res.status).toBe(403);
    });

    it('POST /api/settings succeeds for SUPER_ADMIN and preserves masked secret', async () => {
      mocks.session = { user: { id: 'u1', role: 'SUPER_ADMIN' } };

      const req = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'bookingQubeApiKey', value: MASKED_SECRET_PLACEHOLDER }),
      });
      const res = await settingsPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.action).toBe('PRESERVED');
    });

    it('General Settings Page redirects unauthenticated and denies unauthorized roles', async () => {
      // 1. Unauthenticated -> redirects to login
      mocks.session = null;
      await expect(
        GeneralSettingsPage({ params: Promise.resolve({ locale: 'en' }) })
      ).rejects.toThrow('NEXT_REDIRECT:/en/login/admin');

      // 2. Unauthorized role (e.g. SALES_ADMIN) -> renders Access Denied
      mocks.session = { user: { id: 'u1', role: 'SALES_ADMIN' } };
      const deniedPage = await GeneralSettingsPage({ params: Promise.resolve({ locale: 'en' }) });
      const deniedMarkup = renderToStaticMarkup(deniedPage);
      expect(deniedMarkup).toContain('Access Denied');

      // 3. SUPER_ADMIN -> renders view
      mocks.session = { user: { id: 'u1', role: 'SUPER_ADMIN' } };
      (mocks.db.setting.findMany as any).mockResolvedValue([{ key: 'siteNameEn', value: 'E3' }]);
      (mocks.db.siteSettings.findMany as any).mockResolvedValue([{ key: 'siteNameEn', value: 'E3' }]);
      const allowedPage = await GeneralSettingsPage({ params: Promise.resolve({ locale: 'en' }) });
      const allowedMarkup = renderToStaticMarkup(allowedPage);
      expect(allowedMarkup).not.toContain('Access Denied');
    });
  });

  // =========================================================================
  // 2. HARD CLIENT / SERVER BOOKINGQUBE SEPARATION
  // =========================================================================
  describe('2. Hard Client / Server BookingQube Separation', () => {
    it('client-safe generateTicketUrl generates valid URLs without server dependencies', () => {
      const url = generateTicketUrl('attr-123', 'ticket-456', 2, '2026-09-01');
      expect(url).toContain('/book');
      expect(url).toContain('attraction=attr-123');
      expect(url).toContain('ticket=ticket-456');
      expect(url).toContain('qty=2');
      expect(url).toContain('date=2026-09-01');
    });

    it('BookingQubeIframe imports exclusively from client-safe helper', () => {
      const iframeFilePath = path.resolve(__dirname, '../components/shared/BookingQubeIframe.tsx');
      const content = fs.readFileSync(iframeFilePath, 'utf-8');

      expect(content).toMatch(/import\s*\{\s*generateTicketUrl\s*\}\s*from\s*['"]@\/lib\/bookingqube-client['"]/);
      expect(content).not.toContain("from '@/lib/bookingqube-server'");
      expect(content).not.toContain("from '@/lib/db'");
      expect(content).not.toContain("from '@/lib/redis'");
      expect(content).not.toContain('getServerSecretSetting');
    });

    it('bookingqube-server.ts contains import server-only', () => {
      const serverFilePath = path.resolve(__dirname, '../lib/bookingqube-server.ts');
      const content = fs.readFileSync(serverFilePath, 'utf-8');

      expect(content).toContain("import 'server-only';");
    });

    it('checkAvailability executes server request with protected credential without logging or serializing it', async () => {
      const mockRecord = {
        key: 'bookingQubeApiKey',
        value: SENSITIVE_FIXTURES.BOOKINGQUBE_KEY,
      };
      (mocks.db.setting.findUnique as any).mockResolvedValue(mockRecord);
      (mocks.db.siteSettings.findUnique as any).mockResolvedValue(mockRecord);

      const originalFetch = global.fetch;
      let interceptedHeaders: any = null;
      let interceptedUrl = '';

      global.fetch = vi.fn(async (url: any, init: any) => {
        interceptedUrl = String(url);
        interceptedHeaders = init?.headers;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            timeSlots: [{ timeSlot: '10:00 AM', available: true, total: 50, price: 100 }],
          }),
        } as any;
      });

      const slots = await checkAvailability('desert-falls', '2026-10-15');
      expect(slots).toHaveLength(1);
      expect(slots[0].timeSlot).toBe('10:00 AM');
      expect(interceptedUrl).toContain('attraction=desert-falls');
      expect(interceptedHeaders?.Authorization).toBe(`Bearer ${SENSITIVE_FIXTURES.BOOKINGQUBE_KEY}`);

      global.fetch = originalFetch;
    });
  });

  // =========================================================================
  // 3. CREDENTIAL ALIASES & REFINED MASKING
  // =========================================================================
  describe('3. Credential Aliases & Refined Masking', () => {
    it('resolves canonical BookingQube key first, and falls back to legacy aliases deterministically without mutating DB', async () => {
      // 1. Canonical key present
      const canonicalHandler = ({ where }: any) => {
        if (where.key === BOOKINGQUBE_CANONICAL_KEY) {
          return Promise.resolve({ key: BOOKINGQUBE_CANONICAL_KEY, value: SENSITIVE_FIXTURES.BOOKINGQUBE_KEY });
        }
        return Promise.resolve(null);
      };
      (mocks.db.setting.findUnique as any).mockImplementation(canonicalHandler);
      (mocks.db.siteSettings.findUnique as any).mockImplementation(canonicalHandler);

      const key1 = await resolveBookingQubeApiKey();
      expect(key1).toBe(SENSITIVE_FIXTURES.BOOKINGQUBE_KEY);

      // 2. Canonical key absent, but legacy alias BOOKINGQUBE_API_KEY present
      const aliasHandler = ({ where }: any) => {
        if (where.key === 'BOOKINGQUBE_API_KEY') {
          return Promise.resolve({ key: 'BOOKINGQUBE_API_KEY', value: SENSITIVE_FIXTURES.LEGACY_ALIAS_KEY });
        }
        return Promise.resolve(null);
      };
      (mocks.db.setting.findUnique as any).mockImplementation(aliasHandler);
      (mocks.db.siteSettings.findUnique as any).mockImplementation(aliasHandler);

      const key2 = await resolveBookingQubeApiKey();
      expect(key2).toBe(SENSITIVE_FIXTURES.LEGACY_ALIAS_KEY);

      // Ensure no upsert / mutate calls were made to duplicate or rewrite
      expect(mocks.db.setting.upsert).not.toHaveBeenCalled();
      expect(mocks.db.setting.create).not.toHaveBeenCalled();
      expect(mocks.db.setting.update).not.toHaveBeenCalled();
      expect(mocks.db.siteSettings.upsert).not.toHaveBeenCalled();
      expect(mocks.db.siteSettings.create).not.toHaveBeenCalled();
      expect(mocks.db.siteSettings.update).not.toHaveBeenCalled();
    });

    it('identifies and masks all secret variants including DSNs, tokens, signing keys, and certificates', () => {
      const testSecretKeys = [
        'bookingQubeApiKey',
        'BOOKINGQUBE_API_KEY',
        'bookingqube_secret',
        'db_connection_string',
        'postgres_dsn',
        'jwt_signing_secret',
        'ssl_certificate_key',
        'client_secret',
        'access_token',
        'admin_password',
        'smtp_passwd',
      ];

      for (const key of testSecretKeys) {
        expect(isSensitiveKey(key)).toBe(true);
      }

      const masked = getMaskedAdminSettings(
        testSecretKeys.map((key) => ({ key, value: 'super_secret_plain_value' }))
      );

      for (const key of testSecretKeys) {
        expect(masked[key]).toBe(MASKED_SECRET_PLACEHOLDER);
        expect(masked[`has_${key}`]).toBe(true);
      }

      // Plaintext must never leak
      expect(JSON.stringify(masked)).not.toContain('super_secret_plain_value');
    });
  });

  // =========================================================================
  // 4. B2B CONTACT & FEEDBACK RESIDUE VERIFICATION
  // =========================================================================
  describe('4. B2B Contact & Feedback Clean Output Verification', () => {
    it('B2B Contact (EN & AR) and Feedback (EN & AR) pages contain zero secret names or values', async () => {
      const records = [
        { key: 'bookingQubeApiKey', value: SENSITIVE_FIXTURES.BOOKINGQUBE_KEY },
        { key: 'contactEmail', value: 'contact@e3.qa' },
      ];
      (mocks.db.setting.findMany as any).mockResolvedValue(records);
      (mocks.db.siteSettings.findMany as any).mockResolvedValue(records);

      // B2B Contact EN & AR
      const contactEn = React.createElement(B2BContactPage);
      const markupContactEn = renderToStaticMarkup(contactEn);
      expect(markupContactEn).not.toContain(SENSITIVE_FIXTURES.BOOKINGQUBE_KEY);
      expect(markupContactEn).not.toContain('bookingQubeApiKey');

      const contactAr = React.createElement(B2BContactPage);
      const markupContactAr = renderToStaticMarkup(contactAr);
      expect(markupContactAr).not.toContain(SENSITIVE_FIXTURES.BOOKINGQUBE_KEY);
      expect(markupContactAr).not.toContain('bookingQubeApiKey');

      // B2B Feedback EN & AR
      const feedbackEn = React.createElement(B2BFeedbackPage);
      const markupFeedbackEn = renderToStaticMarkup(feedbackEn);
      expect(markupFeedbackEn).not.toContain(SENSITIVE_FIXTURES.BOOKINGQUBE_KEY);
      expect(markupFeedbackEn).not.toContain('bookingQubeApiKey');

      const feedbackAr = React.createElement(B2BFeedbackPage);
      const markupFeedbackAr = renderToStaticMarkup(feedbackAr);
      expect(markupFeedbackAr).not.toContain(SENSITIVE_FIXTURES.BOOKINGQUBE_KEY);
      expect(markupFeedbackAr).not.toContain('bookingQubeApiKey');
    });
  });
});
