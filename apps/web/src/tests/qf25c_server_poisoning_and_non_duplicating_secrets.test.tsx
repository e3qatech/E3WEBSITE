import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

import {
  resolvePublicSiteSettings,
  isSensitiveKey,
  BOOKINGQUBE_CANONICAL_KEY,
  BOOKINGQUBE_LEGACY_KEY_ALIASES,
  MASKED_SECRET_PLACEHOLDER,
} from '@/lib/settings/public-settings-dto';
import { getMaskedAdminSettings } from '@/lib/settings/public-settings';
import { checkAvailability, resolveBookingQubeApiKey } from '@/lib/bookingqube-server';
import { POST as settingsPOST } from '@/app/api/settings/route';

// Mock DB, Auth, Redis
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

describe('QF-25-C — Final Server Poisoning & Non-Duplicating Secret Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
    const findManyMock = vi.fn().mockResolvedValue([]);
    const findUniqueMock = vi.fn().mockResolvedValue(null);
    const updateMock = vi.fn().mockImplementation(({ where, data }: any) =>
      Promise.resolve({ id: 'test-id', key: where.key, ...data, updatedAt: new Date() })
    );
    const createMock = vi.fn().mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'test-id', ...data, updatedAt: new Date() })
    );

    mocks.db.setting.findMany = findManyMock;
    mocks.db.siteSettings.findMany = findManyMock;
    mocks.db.setting.findUnique = findUniqueMock;
    mocks.db.siteSettings.findUnique = findUniqueMock;
    mocks.db.setting.update = updateMock;
    mocks.db.siteSettings.update = updateMock;
    mocks.db.setting.create = createMock;
    mocks.db.siteSettings.create = createMock;
  });

  // =========================================================================
  // 1. SERVER-ONLY IMPORT ENFORCEMENT & PURE DTO MODULE BOUNDARY
  // =========================================================================
  describe('1. Server-Only Import Enforcement & Pure DTO Boundary', () => {
    it('public-settings.ts, bookingqube-server.ts, and bookingqube.ts contain import server-only', () => {
      const publicSettingsPath = path.resolve(__dirname, '../lib/settings/public-settings.ts');
      const bqServerPath = path.resolve(__dirname, '../lib/bookingqube-server.ts');
      const bqFacadePath = path.resolve(__dirname, '../lib/bookingqube.ts');

      const publicSettingsContent = fs.readFileSync(publicSettingsPath, 'utf-8');
      const bqServerContent = fs.readFileSync(bqServerPath, 'utf-8');
      const bqFacadeContent = fs.readFileSync(bqFacadePath, 'utf-8');

      expect(publicSettingsContent).toContain("import 'server-only';");
      expect(bqServerContent).toContain("import 'server-only';");
      expect(bqFacadeContent).toContain("import 'server-only';");
    });

    it('public-settings-dto.ts and bookingqube-client.ts are pure with zero server dependencies', () => {
      const dtoPath = path.resolve(__dirname, '../lib/settings/public-settings-dto.ts');
      const clientPath = path.resolve(__dirname, '../lib/bookingqube-client.ts');

      const dtoContent = fs.readFileSync(dtoPath, 'utf-8');
      const clientContent = fs.readFileSync(clientPath, 'utf-8');

      // Zero DB, Redis, or server-only imports
      expect(dtoContent).not.toContain("from '@/lib/db'");
      expect(dtoContent).not.toContain("from '@/lib/redis'");
      expect(dtoContent).not.toContain("import 'server-only'");

      expect(clientContent).not.toContain("from '@/lib/db'");
      expect(clientContent).not.toContain("from '@/lib/redis'");
      expect(clientContent).not.toContain("import 'server-only'");
    });

    it('BookingQube compatibility facade does not re-export client URL generator', () => {
      const bqFacadePath = path.resolve(__dirname, '../lib/bookingqube.ts');
      const bqFacadeContent = fs.readFileSync(bqFacadePath, 'utf-8');

      expect(bqFacadeContent).not.toContain("from './bookingqube-client'");
      expect(bqFacadeContent).toContain("from './bookingqube-server'");
    });
  });

  // =========================================================================
  // 2. NON-DUPLICATING SECRET STORAGE & LEGACY ALIAS REJECTION
  // =========================================================================
  describe('2. Non-Duplicating Secret Storage & Legacy Alias Rejection', () => {
    it('rejects direct POST writes using any legacy alias with HTTP 400', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };

      for (const legacyAlias of BOOKINGQUBE_LEGACY_KEY_ALIASES) {
        const req = new Request('http://localhost:3000/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: legacyAlias, value: 'test-secret-val' }),
        });

        const res = await settingsPOST(req);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.action).toBe('REJECTED_LEGACY_ALIAS');
        expect(json.error).toContain('Direct writes to legacy alias');
      }

      expect(mocks.db.siteSettings.update).not.toHaveBeenCalled();
      expect(mocks.db.siteSettings.create).not.toHaveBeenCalled();
      expect(mocks.db.siteSettings.upsert).not.toHaveBeenCalled();
    });

    it('updates canonical row when canonical row exists', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };

      const existingRows = [
        { id: 'canon-1', key: BOOKINGQUBE_CANONICAL_KEY, value: 'old-canon-sec', type: 'INTEGRATION' },
      ];
      (mocks.db.siteSettings.findMany as any).mockResolvedValue(existingRows);

      const req = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: BOOKINGQUBE_CANONICAL_KEY, value: 'new-canon-sec-999' }),
      });

      const res = await settingsPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.action).toBe('UPDATED');
      expect(json.setting.key).toBe(BOOKINGQUBE_CANONICAL_KEY);

      // Verify DB update targeted the canonical row
      expect(mocks.db.siteSettings.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: BOOKINGQUBE_CANONICAL_KEY },
          data: expect.objectContaining({ value: 'new-canon-sec-999' }),
        })
      );
      expect(mocks.db.siteSettings.create).not.toHaveBeenCalled();
    });

    it('updates single legacy row in place when canonical row is absent (without renaming or creating new row)', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };

      const existingLegacyRows = [
        { id: 'legacy-1', key: 'bookingqube_api_key', value: 'old-legacy-sec', type: 'INTEGRATION' },
      ];
      (mocks.db.siteSettings.findMany as any).mockResolvedValue(existingLegacyRows);

      const req = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: BOOKINGQUBE_CANONICAL_KEY, value: 'updated-legacy-sec-555' }),
      });

      const res = await settingsPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.action).toBe('UPDATED');
      expect(json.setting.key).toBe('bookingqube_api_key');

      // Verify update in place targeting the legacy key
      expect(mocks.db.siteSettings.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'bookingqube_api_key' },
          data: expect.objectContaining({ value: 'updated-legacy-sec-555' }),
        })
      );
      // Ensure no new canonical row was created
      expect(mocks.db.siteSettings.create).not.toHaveBeenCalled();
    });

    it('returns HTTP 409 Conflict with zero mutations when multiple conflicting records exist', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };

      const multipleConflictingRows = [
        { id: 'row-1', key: BOOKINGQUBE_CANONICAL_KEY, value: 'canon-val' },
        { id: 'row-2', key: 'BOOKINGQUBE_API_KEY', value: 'legacy-val' },
      ];
      (mocks.db.siteSettings.findMany as any).mockResolvedValue(multipleConflictingRows);

      const req = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: BOOKINGQUBE_CANONICAL_KEY, value: 'conflict-attempt-val' }),
      });

      const res = await settingsPOST(req);
      expect(res.status).toBe(409);

      const json = await res.json();
      expect(json.conflict).toBe(true);
      expect(json.action).toBe('REVIEW_REQUIRED');

      // Zero mutations executed
      expect(mocks.db.siteSettings.update).not.toHaveBeenCalled();
      expect(mocks.db.siteSettings.create).not.toHaveBeenCalled();
      expect(mocks.db.siteSettings.upsert).not.toHaveBeenCalled();
    });

    it('creates canonical row when zero matching rows exist', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };

      (mocks.db.siteSettings.findMany as any).mockResolvedValue([]);

      const req = new Request('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: BOOKINGQUBE_CANONICAL_KEY, value: 'fresh-secret-123' }),
      });

      const res = await settingsPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.action).toBe('UPDATED');
      expect(mocks.db.siteSettings.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            key: BOOKINGQUBE_CANONICAL_KEY,
            value: 'fresh-secret-123',
          }),
        })
      );
    });
  });

  // =========================================================================
  // 3. CANONICAL COLLAPSED PRESENCE DISPLAY
  // =========================================================================
  describe('3. Canonical Collapsed Presence Display in Admin Views', () => {
    it('collapses single legacy row into canonical masked presence', () => {
      const records = [
        { key: 'BOOKINGQUBE_API_KEY', value: 'legacy-stored-secret-val' },
        { key: 'siteNameEn', value: 'E3 Qatar' },
      ];

      const masked = getMaskedAdminSettings(records);

      // Canonical key is populated with masked placeholder and presence metadata
      expect(masked.bookingQubeApiKey).toBe(MASKED_SECRET_PLACEHOLDER);
      expect(masked.has_bookingQubeApiKey).toBe(true);
      expect(masked.bookingQubeApiKey_isConfigured).toBe(true);

      // Raw legacy key is not separately exposed in manager object
      expect(masked.BOOKINGQUBE_API_KEY).toBeUndefined();
      expect(JSON.stringify(masked)).not.toContain('legacy-stored-secret-val');
    });

    it('shows unconfigured when no BookingQube representation has a value', () => {
      const records = [
        { key: 'siteNameEn', value: 'E3 Qatar' },
      ];

      const masked = getMaskedAdminSettings(records);

      expect(masked.bookingQubeApiKey).toBe('');
      expect(masked.has_bookingQubeApiKey).toBe(false);
      expect(masked.bookingQubeApiKey_isConfigured).toBe(false);
    });
  });

  // =========================================================================
  // 4. NORMALIZED KEY SEPARATOR MASKING & SAFE NEGATIVE FIXTURES
  // =========================================================================
  describe('4. Normalized Key Separator Masking & Negative Fixtures', () => {
    it('accurately masks hyphenated, underscored, and camelCase secret variants', () => {
      const positiveFixtures = [
        'api-key',
        'api_key',
        'apiKey',
        'API-KEY',
        'private-key',
        'private_key',
        'privateKey',
        'connection-string',
        'connection_string',
        'connectionString',
        'db-url',
        'db_url',
        'dbUrl',
        'database-url',
        'cert-key',
        'cert_key',
        'certKey',
        'signing-key',
        'signing_secret',
        'auth-token',
        'client-secret',
        'smtp-password',
      ];

      for (const key of positiveFixtures) {
        expect(isSensitiveKey(key)).toBe(true);
      }
    });

    it('prevents over-classification of ordinary editorial/public keys (negative fixtures)', () => {
      const negativeFixtures = [
        'authorName',
        'authorBio',
        'authorEmail',
        'passengerCount',
        'compassHeading',
        'descriptionEn',
        'descriptionAr',
        'serviceKeyFacts',
        'keyHighlights',
        'authenticityNotice',
        'authenticityGuarantee',
        'siteNameEn',
        'siteNameAr',
        'contactEmail',
        'workingHours',
        'footerMediaUrl',
      ];

      for (const key of negativeFixtures) {
        expect(isSensitiveKey(key)).toBe(false);
      }
    });
  });

  // =========================================================================
  // 5. MISSING-CREDENTIAL NO-FETCH BEHAVIOR (FAIL CLOSED)
  // =========================================================================
  describe('5. Missing-Credential No-Fetch Behavior (Fail Closed)', () => {
    it('fails closed and makes zero fetch calls when no protected credential resolves', async () => {
      (mocks.db.siteSettings.findUnique as any).mockResolvedValue(null);

      const savedEnv = process.env.BOOKINGQUBE_API_KEY;
      const savedEnvAlt = process.env.BOOKING_QUBE_API_KEY;
      delete process.env.BOOKINGQUBE_API_KEY;
      delete process.env.BOOKING_QUBE_API_KEY;

      const originalFetch = global.fetch;
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      try {
        const key = await resolveBookingQubeApiKey();
        expect(key).toBeNull();

        const slots = await checkAvailability('attraction-99', '2026-11-20');
        expect(slots).toEqual([]);
        expect(fetchSpy).not.toHaveBeenCalled();
      } finally {
        global.fetch = originalFetch;
        if (savedEnv !== undefined) process.env.BOOKINGQUBE_API_KEY = savedEnv;
        if (savedEnvAlt !== undefined) process.env.BOOKING_QUBE_API_KEY = savedEnvAlt;
      }
    });
  });

  // =========================================================================
  // 6. EXACT IFRAME-ORIGIN ACCEPTANCE AND REJECTION
  // =========================================================================
  describe('6. Exact Iframe-Origin Acceptance and Rejection', () => {
    it('BookingQubeIframe enforces exact origin check against trusted domain', () => {
      const iframeFilePath = path.resolve(__dirname, '../components/shared/BookingQubeIframe.tsx');
      const content = fs.readFileSync(iframeFilePath, 'utf-8');

      // Must check exact equality with origin, not includes hostname substring
      expect(content).toContain('event.origin !== trustedOrigin');
      expect(content).not.toContain('!event.origin.includes');
    });
  });

  // =========================================================================
  // 7. PRESERVATION OF VERIFIED 24-FIELD PUBLIC DTO
  // =========================================================================
  describe('7. Preservation of Verified 24-Field Public DTO', () => {
    it('resolvePublicSiteSettings constructs complete allowlisted DTO with zero leaks', () => {
      const rawSettings = [
        { key: 'siteNameEn', value: 'E3 Platform' },
        { key: 'siteNameAr', value: 'منصة إي ثري' },
        { key: 'contactEmail', value: 'info@e3.qa' },
        { key: 'contactPhone', value: '+974 4400 0000' },
        { key: 'contactWhatsapp', value: '+974 5500 0000' },
        { key: 'addressEn', value: 'Doha, Qatar' },
        { key: 'addressAr', value: 'الدوحة، قطر' },
        { key: 'workingHours', value: '8:00 AM - 5:00 PM' },
        { key: 'socialInstagram', value: 'https://instagram.com/e3' },
        { key: 'socialTwitter', value: 'https://x.com/e3' },
        { key: 'socialLinkedin', value: 'https://linkedin.com/company/e3' },
        { key: 'socialYoutube', value: 'https://youtube.com/e3' },
        { key: 'socialSnapchat', value: 'https://snapchat.com/add/e3' },
        { key: 'socialFacebook', value: 'https://facebook.com/e3' },
        { key: 'bookingqubeWebsite', value: 'https://booking.e3.qa' },
        { key: 'lightLogoUrl', value: 'https://e3.qa/logo-light.svg' },
        { key: 'darkLogoUrl', value: 'https://e3.qa/logo-dark.svg' },
        { key: 'faviconUrl', value: 'https://e3.qa/favicon.ico' },
        { key: 'bookTicketsUrl', value: '/b2c/tickets' },
        { key: 'bookTicketsLabelEn', value: 'BOOK TICKETS' },
        { key: 'bookTicketsLabelAr', value: 'احجز التذاكر' },
        { key: 'bookTicketsEnabled', value: 'true' },
        { key: 'bookTicketsExternal', value: 'false' },
        { key: 'bookingQubeApiKey', value: 'secret-leaked-raw-api-key' },
        { key: 'api-key', value: 'hyphenated-secret-key' },
      ];

      const dto = resolvePublicSiteSettings(rawSettings);

      expect(dto.siteNameEn).toBe('E3 Platform');
      expect(dto.siteNameAr).toBe('منصة إي ثري');
      expect(dto.contactEmail).toBe('info@e3.qa');
      expect(dto.contactPhone).toBe('+974 4400 0000');
      expect(dto.bookTicketsUrl).toBe('/b2c/tickets');

      // Zero sensitive keys or secret field names present
      expect((dto as any).bookingQubeApiKey).toBeUndefined();
      expect((dto as any)['api-key']).toBeUndefined();
      expect(JSON.stringify(dto)).not.toContain('secret-leaked-raw-api-key');
      expect(JSON.stringify(dto)).not.toContain('hyphenated-secret-key');
    });
  });
});
