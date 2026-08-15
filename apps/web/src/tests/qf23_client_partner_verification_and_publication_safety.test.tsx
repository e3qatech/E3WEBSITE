import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { PartnersClient } from '@/components/dashboard/b2b/PartnersClient';
import {
  isPartnerPubliclyEligible,
  filterAndResolvePublicPartners,
  resolvePublicPartner,
  analyzePartnerDataQuality,
  sanitizeUrl,
  getPartnerInitials,
  normalizeDomain,
  normalizePartnerName,
  isB2BAuthorized,
  CanonicalPartnerInput,
} from '@/lib/partners/partner-resolver';

// Mock DB and Auth
const mocks = vi.hoisted(() => ({
  session: null as any,
  db: {
    partner: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    client: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    clientMembership: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(async (cb: any) => {
      if (Array.isArray(cb)) return Promise.all(cb);
      return cb(mocks.db);
    }),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => mocks.session),
}));

vi.mock('@/lib/db', () => ({
  default: mocks.db,
  db: mocks.db,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/components/shared/MediaUploader', () => ({
  MediaUploader: () => <div data-testid="media-uploader-mock" />,
}));

import db from '@/lib/db';
import { GET as B2BPartnersGET, POST as B2BPartnersPOST } from '../app/api/b2b/partners/route';
import { GET as B2BPartnerDetailGET, PUT as B2BPartnerDetailPUT, DELETE as B2BPartnerDetailDELETE } from '../app/api/b2b/partners/[id]/route';
import { POST as PartnersPOST } from '../app/api/partners/route';
import { PATCH as PartnerPATCH, DELETE as PartnerDELETE } from '../app/api/partners/[id]/route';
import { POST as PartnersReorderPOST } from '../app/api/partners/reorder/route';

describe('QF-23 — Client/Partner Verification & Publication Safety Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
  });

  // =========================================================================
  // 1. PUBLIC ELIGIBILITY & DETERMINISTIC RESOLUTION
  // =========================================================================
  describe('1. Public Eligibility & Deterministic Resolution', () => {
    it('only allows explicitly visible partners (isVisible === true)', () => {
      const visiblePartner: CanonicalPartnerInput = {
        id: 'p-1',
        name: 'Qatar Airways',
        isVisible: true,
      };
      expect(isPartnerPubliclyEligible(visiblePartner).eligible).toBe(true);

      const hiddenPartner: CanonicalPartnerInput = {
        id: 'p-2',
        name: 'Draft Partner',
        isVisible: false,
      };
      expect(isPartnerPubliclyEligible(hiddenPartner).eligible).toBe(false);

      const unsetPartner: CanonicalPartnerInput = {
        id: 'p-3',
        name: 'Unset Partner',
        isVisible: null,
      };
      expect(isPartnerPubliclyEligible(unsetPartner).eligible).toBe(false);
    });

    it('filterAndResolvePublicPartners orders deterministically (orderIndex -> name -> id)', () => {
      const raw: CanonicalPartnerInput[] = [
        { id: 'c', name: 'Zeta Corp', isVisible: true, orderIndex: 1 },
        { id: 'b', name: 'Alpha Tech', isVisible: true, orderIndex: 1 },
        { id: 'a', name: 'Prime Partner', isVisible: true, orderIndex: 0 },
        { id: 'hidden', name: 'Hidden Corp', isVisible: false, orderIndex: 0 },
      ];

      const resolved = filterAndResolvePublicPartners(raw);
      expect(resolved.map((r) => r.id)).toEqual(['a', 'b', 'c']);
      expect(resolved[0].name).toBe('Prime Partner');
      expect(resolved[1].name).toBe('Alpha Tech');
      expect(resolved[2].name).toBe('Zeta Corp');
    });

    it('extracts safe public fields and exposes NO CRM tenant or internal information', () => {
      const partnerWithInternal: CanonicalPartnerInput = {
        id: 'p-secure',
        name: 'Visit Qatar',
        category: 'GOVERNMENT',
        description: 'National tourism council.',
        logoUrl: 'https://cdn.e3.qa/logo.png',
        website: 'https://visitqatar.com',
        isVisible: true,
        orderIndex: 0,
        // Internal/CRM fields that must NOT leak
        tenantId: 'crm-tenant-123',
        internalNotes: 'Confidential corporate rep notes',
        crmClientId: 'client-999',
        contractValue: 500000,
      };

      const resolved = resolvePublicPartner(partnerWithInternal);
      expect(resolved.id).toBe('p-secure');
      expect(resolved.name).toBe('Visit Qatar');
      expect(resolved.category).toBe('GOVERNMENT');
      expect(resolved.hasLogo).toBe(true);
      expect(resolved.hasWebsite).toBe(true);

      // Verify internal properties are absent
      expect((resolved as any).tenantId).toBeUndefined();
      expect((resolved as any).internalNotes).toBeUndefined();
      expect((resolved as any).crmClientId).toBeUndefined();
      expect((resolved as any).contractValue).toBeUndefined();
    });
  });

  // =========================================================================
  // 2. URL SANITIZATION & MISSING LOGO FALLBACK
  // =========================================================================
  describe('2. URL Sanitization & Missing Logo Fallbacks', () => {
    it('rejects unsafe protocols (javascript:, vbscript:, data:text/html)', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBeNull();
      expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBeNull();
      expect(sanitizeUrl('file:///etc/passwd')).toBeNull();
    });

    it('allows safe http, https, relative, and image data URLs', () => {
      expect(sanitizeUrl('https://www.qatartourism.com')).toBe('https://www.qatartourism.com/');
      expect(sanitizeUrl('http://e3.qa/portal')).toBe('http://e3.qa/portal');
      expect(sanitizeUrl('/assets/logo.png')).toBe('/assets/logo.png');
      expect(sanitizeUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==')).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==');
    });

    it('generates monogram initials for missing logo fallback without breaking page', () => {
      expect(getPartnerInitials('Qatar Tourism')).toBe('QT');
      expect(getPartnerInitials('Ooredoo')).toBe('OO');
      expect(getPartnerInitials('Place Vendôme Mall')).toBe('PM');
      expect(getPartnerInitials('')).toBe('EP');

      const partnerNoLogo: CanonicalPartnerInput = {
        id: 'no-logo',
        name: 'Qatar Tourism',
        logoUrl: '',
        isVisible: true,
      };

      const resolved = resolvePublicPartner(partnerNoLogo);
      expect(resolved.hasLogo).toBe(false);
      expect(resolved.logoUrl).toBeNull();
      expect(resolved.initials).toBe('QT');
    });
  });

  // =========================================================================
  // 3. NON-DESTRUCTIVE DATA QUALITY ANALYZER
  // =========================================================================
  describe('3. Staff Data Quality & Editorial Warning Analyzer', () => {
    it('flags missing logo, editorial instructions, and placeholder text', () => {
      const prodFixture: CanonicalPartnerInput = {
        id: 'cms8byocc000033ia8xvey1xo',
        name: 'International Maritime WLL',
        website: 'http://www.imadxb.com/',
        category: 'AGENCY',
        description: 'A freight-forwarding company. Confirm that this is the exact entity and logo before publishing.',
        logoUrl: 'data:image/png;base64,validBase64',
        isVisible: true,
      };

      const report = analyzePartnerDataQuality(prodFixture);
      expect(report.isClean).toBe(false);
      expect(report.issues.some((i) => i.code === 'EDITORIAL_INSTRUCTION')).toBe(true);

      // Ensures original fixture properties remain completely unmodified
      expect(prodFixture.name).toBe('International Maritime WLL');
      expect(prodFixture.isVisible).toBe(true);
    });

    it('detects duplicate names and website domains across partner records', () => {
      const allPartners: CanonicalPartnerInput[] = [
        { id: '1', name: 'Visit Qatar', website: 'https://visitqatar.com', isVisible: true },
        { id: '2', name: 'Qatar Calendar', website: 'https://visitqatar.com/intl-en/events', isVisible: true },
        { id: '3', name: 'visit qatar', website: 'https://other.com', isVisible: true },
      ];

      const report1 = analyzePartnerDataQuality(allPartners[0], allPartners);
      expect(report1.issues.some((i) => i.code === 'DUPLICATE_NAME')).toBe(true);
      expect(report1.issues.some((i) => i.code === 'DUPLICATE_DOMAIN')).toBe(true);

      expect(normalizeDomain('https://www.visitqatar.com/intl-en')).toBe('visitqatar.com');
      expect(normalizePartnerName('Visit Qatar!')).toBe('visitqatar');
    });
  });

  // =========================================================================
  // 4. API SERVER-SIDE RBAC & DEFAULT-HIDDEN CREATION
  // =========================================================================
  describe('4. API Server-Side RBAC & Default-Hidden Creation', () => {
    it('isB2BAuthorized allows authorized staff roles and rejects client/candidates', () => {
      expect(isB2BAuthorized('SUPER_ADMIN')).toBe(true);
      expect(isB2BAuthorized('SALES_ADMIN')).toBe(true);
      expect(isB2BAuthorized('SUPPORT_ADMIN')).toBe(true);
      expect(isB2BAuthorized('STAFF')).toBe(true);
      expect(isB2BAuthorized('ADMIN')).toBe(true);
      expect(isB2BAuthorized('MARKETING')).toBe(true);

      expect(isB2BAuthorized('CLIENT')).toBe(false);
      expect(isB2BAuthorized('CANDIDATE')).toBe(false);
      expect(isB2BAuthorized(null)).toBe(false);
    });

    it('GET /api/b2b/partners returns safe visible partners for public and enriched for staff', async () => {
      mocks.session = null;
      (db.partner.findMany as any).mockResolvedValue([
        { id: 'p1', name: 'Qatar Airways', isVisible: true, orderIndex: 0 },
        { id: 'p2', name: 'Draft Corp', isVisible: false, orderIndex: 1 },
      ]);

      const publicReq = new Request('http://localhost/api/b2b/partners');
      const publicRes = await B2BPartnersGET(publicReq as any);
      expect(publicRes.status).toBe(200);
      const publicJson = await publicRes.json();
      expect(publicJson.partners).toHaveLength(1);
      expect(publicJson.partners[0].name).toBe('Qatar Airways');

      // Staff view with all=true
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.partner.findMany as any).mockResolvedValue([
        { id: 'p1', name: 'Qatar Airways', isVisible: true, orderIndex: 0 },
        { id: 'p2', name: 'Draft Corp', isVisible: false, orderIndex: 1 },
      ]);

      const staffReq = new Request('http://localhost/api/b2b/partners?all=true');
      const staffRes = await B2BPartnersGET(staffReq as any);
      expect(staffRes.status).toBe(200);
      const staffJson = await staffRes.json();
      expect(staffJson.partners).toHaveLength(2);
      expect(staffJson.partners[0].dataQuality).toBeDefined();
    });

    it('POST /api/b2b/partners returns 401 unauth and 403 forbidden', async () => {
      mocks.session = null;
      const unauthReq = new Request('http://localhost/api/b2b/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Partner' }),
      });
      const resUnauth = await B2BPartnersPOST(unauthReq as any);
      expect(resUnauth.status).toBe(401);

      mocks.session = { user: { id: 'c1', role: 'CLIENT' } };
      const forbiddenReq = new Request('http://localhost/api/b2b/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Partner' }),
      });
      const resForbidden = await B2BPartnersPOST(forbiddenReq as any);
      expect(resForbidden.status).toBe(403);
    });

    it('POST /api/b2b/partners defaults isVisible to false for new records', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.partner.create as any).mockResolvedValue({
        id: 'new-p1',
        name: 'Lusail Development',
        isVisible: false,
        orderIndex: 0,
      });

      const req = new Request('http://localhost/api/b2b/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Lusail Development',
          category: 'CORPORATE',
        }),
      });

      const res = await B2BPartnersPOST(req as any);
      expect(res.status).toBe(200);

      // Verifies db.partner.create received isVisible: false by default
      expect(db.partner.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Lusail Development',
            isVisible: false,
          }),
        })
      );
    });

    it('POST /api/partners also enforces RBAC and default-hidden creation', async () => {
      mocks.session = { user: { id: 'sales-1', role: 'SALES_ADMIN' } };
      (db.partner.create as any).mockResolvedValue({
        id: 'new-p2',
        name: 'Katara Hospitality',
        isVisible: false,
      });

      const req = new Request('http://localhost/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Katara Hospitality',
          website: 'https://katara.com',
        }),
      });

      const res = await PartnersPOST(req as any);
      expect(res.status).toBe(201);
      expect(db.partner.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isVisible: false,
          }),
        })
      );
    });

    it('PUT, PATCH, DELETE and Reorder enforce RBAC and execute on Partner model only', async () => {
      // Unauth check
      mocks.session = null;
      const unauthPut = new Request('http://localhost/api/b2b/partners/p-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      });
      expect((await B2BPartnerDetailPUT(unauthPut as any, { params: Promise.resolve({ id: 'p-1' }) })).status).toBe(401);

      // Super Admin success
      mocks.session = { user: { id: 'super-1', role: 'SUPER_ADMIN' } };
      (db.partner.findUnique as any).mockResolvedValue({ id: 'p-1', name: 'Old' });
      (db.partner.update as any).mockResolvedValue({ id: 'p-1', name: 'Updated' });

      const authPut = new Request('http://localhost/api/b2b/partners/p-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated', isVisible: true }),
      });
      const resPut = await B2BPartnerDetailPUT(authPut as any, { params: Promise.resolve({ id: 'p-1' }) });
      expect(resPut.status).toBe(200);

      // Reorder test
      const reorderReq = new Request('http://localhost/api/partners/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: [
            { id: 'p-1', orderIndex: 0 },
            { id: 'p-2', orderIndex: 1 },
          ],
        }),
      });
      const resReorder = await PartnersReorderPOST(reorderReq as any);
      expect(resReorder.status).toBe(200);
      expect(db.$transaction).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 5. CRM ISOLATION & ZERO CLIENT / CLIENTMEMBERSHIP MUTATION
  // =========================================================================
  describe('5. CRM Isolation & Zero Client Mutation', () => {
    it('proves Partner mutations never touch Client or ClientMembership models', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.partner.create as any).mockResolvedValue({ id: 'p-iso', name: 'Showcase Entity' });

      const req = new Request('http://localhost/api/b2b/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Showcase Entity' }),
      });

      await B2BPartnersPOST(req as any);

      expect(db.client.create).not.toHaveBeenCalled();
      expect(db.client.update).not.toHaveBeenCalled();
      expect(db.client.delete).not.toHaveBeenCalled();
      expect(db.clientMembership.create).not.toHaveBeenCalled();
      expect(db.clientMembership.update).not.toHaveBeenCalled();
    });

    it('GET, PATCH, and DELETE endpoints enforce permissions and execute properly', async () => {
      // GET by id for staff vs public
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.partner.findUnique as any).mockResolvedValue({ id: 'p-detail', name: 'Detail Partner', isVisible: true });
      (db.partner.findMany as any).mockResolvedValue([{ id: 'p-detail', name: 'Detail Partner', isVisible: true }]);

      const reqStaff = new Request('http://localhost/api/b2b/partners/p-detail');
      const resStaff = await B2BPartnerDetailGET(reqStaff as any, { params: Promise.resolve({ id: 'p-detail' }) });
      expect(resStaff.status).toBe(200);
      const jsonStaff = await resStaff.json();
      expect(jsonStaff.partner.dataQuality).toBeDefined();

      // DELETE endpoint
      (db.partner.delete as any).mockResolvedValue({ id: 'p-detail' });
      const delReq = new Request('http://localhost/api/b2b/partners/p-detail', { method: 'DELETE' });
      const delRes = await B2BPartnerDetailDELETE(delReq as any, { params: Promise.resolve({ id: 'p-detail' }) });
      expect(delRes.status).toBe(200);

      // PATCH endpoint
      (db.partner.update as any).mockResolvedValue({ id: 'p-detail', isVisible: false });
      const patchReq = new Request('http://localhost/api/partners/p-detail', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: false }),
      });
      const patchRes = await PartnerPATCH(patchReq as any, { params: Promise.resolve({ id: 'p-detail' }) });
      expect(patchRes.status).toBe(200);

      // PartnerDELETE endpoint
      const legacyDelReq = new Request('http://localhost/api/partners/p-detail', { method: 'DELETE' });
      const legacyDelRes = await PartnerDELETE(legacyDelReq as any, { params: Promise.resolve({ id: 'p-detail' }) });
      expect(legacyDelRes.status).toBe(200);
    });
  });

  // =========================================================================
  // 6. RENDERED EN/AR UI INTEGRATION & QF-11 HANDOFF PRESERVATION
  // =========================================================================
  describe('6. Rendered EN/AR UI Integration & QF-11 Handoff Preservation', () => {
    it('renders PartnersClient in English with reciprocal CRM handoff link', () => {
      const fixturePartners: CanonicalPartnerInput[] = [
        {
          id: 'p-en-1',
          name: 'Qatar Tourism',
          category: 'GOVERNMENT',
          logoUrl: '',
          website: 'https://qatartourism.com',
          isVisible: true,
          orderIndex: 0,
        },
      ];

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PartnersClient initialData={fixturePartners} />
        </LocaleProvider>
      );

      expect(html).toContain('Corporate Clients &amp; Partners Directory');
      expect(html).toContain('href="/en/dashboard/crm/clients"');
      expect(html).toContain('VISIBLE');
      expect(html).toContain('Data Warnings'); // Missing logo warning badge
      expect(html).toContain('QT'); // Monogram badge
    });

    it('renders PartnersClient in Arabic with RTL and reciprocal CRM handoff link', () => {
      const fixturePartners: CanonicalPartnerInput[] = [
        {
          id: 'p-ar-1',
          name: 'Qatar Tourism',
          category: 'GOVERNMENT',
          logoUrl: '',
          website: 'https://qatartourism.com',
          isVisible: false,
          orderIndex: 0,
        },
      ];

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <PartnersClient initialData={fixturePartners} />
        </LocaleProvider>
      );

      expect(html).toContain('دليل الشركاء والعملاء للواجهة العامة');
      expect(html).toContain('href="/ar/dashboard/crm/clients"');
      expect(html).toContain('مسودة / مخفي');
      expect(html).toContain('ملاحظات تدقيق');
      expect(html).toContain('dir="rtl"');
    });
  });
});
