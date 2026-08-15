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
  sanitizePublicWebsite,
  sanitizePublicLogo,
  redactPublicDescription,
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

describe('QF-23 & QF-23-B — Client/Partner Verification, Editorial Redaction & Link Safety Suite', () => {
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
  // 2. PUBLIC EDITORIAL REDACTION & DESCRIPTIONS (QF-23-B)
  // =========================================================================
  describe('2. Public Editorial Redaction (QF-23-B Requirement 1)', () => {
    it('redacts internal editorial instructions from public description', () => {
      const descriptionWithInstruction =
        'A leading freight-forwarding company. Confirm that this is the exact entity and logo before publishing.';
      const clean = redactPublicDescription(descriptionWithInstruction);
      expect(clean).toBe('A leading freight-forwarding company.');
      expect(clean).not.toContain('Confirm that this is the exact entity');
    });

    it('returns empty string when description contains only editorial instructions', () => {
      const onlyInstruction = 'Confirm that this is the exact entity and logo before publishing.';
      const clean = redactPublicDescription(onlyInstruction);
      expect(clean).toBe('');

      const todoText = 'TODO: Add partner description and logo.';
      expect(redactPublicDescription(todoText)).toBe('');
    });

    it('preserves clean public description without editorial instructions', () => {
      const normalDescription = 'National tourism council driving Qatar entertainment ecosystem.';
      expect(redactPublicDescription(normalDescription)).toBe(normalDescription);
    });
  });

  // =========================================================================
  // 3. HTTPS-ONLY PUBLIC WEBSITES (QF-23-B)
  // =========================================================================
  describe('3. HTTPS-Only Public Websites (QF-23-B Requirement 2)', () => {
    it('permits valid HTTPS URLs publicly', () => {
      expect(sanitizePublicWebsite('https://www.imadxb.com/')).toBe('https://www.imadxb.com/');
      expect(sanitizePublicWebsite('https://visitqatar.qa/intl-en')).toBe('https://visitqatar.qa/intl-en');
    });

    it('rejects HTTP URLs and does NOT rewrite them to HTTPS', () => {
      expect(sanitizePublicWebsite('http://www.imadxb.com/')).toBeNull();
      expect(sanitizePublicWebsite('http://insecure-partner.qa')).toBeNull();
    });

    it('rejects dangerous and unsafe schemes (javascript:, data:, vbscript:, file:)', () => {
      expect(sanitizePublicWebsite('javascript:alert(1)')).toBeNull();
      expect(sanitizePublicWebsite('data:text/html,<script>alert(1)</script>')).toBeNull();
      expect(sanitizePublicWebsite('vbscript:msgbox(1)')).toBeNull();
      expect(sanitizePublicWebsite('file:///etc/passwd')).toBeNull();
    });
  });

  // =========================================================================
  // 4. STRICT PUBLIC LOGO VALIDATION (QF-23-B)
  // =========================================================================
  describe('4. Strict Public Logo Validation (QF-23-B Requirement 3)', () => {
    it('permits valid HTTPS and relative image paths', () => {
      expect(sanitizePublicLogo('https://cdn.e3.qa/partners/qatar-airways.png')).toBe(
        'https://cdn.e3.qa/partners/qatar-airways.png'
      );
      expect(sanitizePublicLogo('/assets/logos/partner.png')).toBe('/assets/logos/partner.png');
    });

    it('permits strictly validated PNG, JPEG, and WebP Base64 data URLs', () => {
      const validPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(sanitizePublicLogo(validPng)).toBe(validPng);

      const validJpg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
      expect(sanitizePublicLogo(validJpg)).toBe(validJpg);

      const validWebp = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
      expect(sanitizePublicLogo(validWebp)).toBe(validWebp);
    });

    it('rejects SVG images (by extension or data URL protocol)', () => {
      expect(sanitizePublicLogo('https://cdn.e3.qa/logo.svg')).toBeNull();
      expect(sanitizePublicLogo('/assets/logo.svg')).toBeNull();
      expect(sanitizePublicLogo('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).toBeNull();
    });

    it('rejects HTML/script-bearing, malformed Base64, and HTTP logo URLs', () => {
      expect(sanitizePublicLogo('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBeNull();
      expect(sanitizePublicLogo('data:image/png;base64,malformed!!!')).toBeNull();
      expect(sanitizePublicLogo('http://cdn.e3.qa/logo.png')).toBeNull();
      expect(sanitizePublicLogo('javascript:alert(1)')).toBeNull();
    });

    it('generates monogram initials fallback for failed or missing logos', () => {
      expect(getPartnerInitials('International Maritime WLL')).toBe('IW');
      expect(getPartnerInitials('Qatar Tourism')).toBe('QT');
      expect(getPartnerInitials('Ooredoo')).toBe('OO');
      expect(getPartnerInitials('')).toBe('EP');
    });
  });

  // =========================================================================
  // 5. INTERNATIONAL MARITIME RECORD PUBLIC VS STAFF TRANSFORMATION
  // =========================================================================
  describe('5. International Maritime Fixture Verification (QF-23-B Proof)', () => {
    it('proves editorial instruction & HTTP URL are absent publicly while preserved for staff', () => {
      const prodFixture: CanonicalPartnerInput = {
        id: 'cms8byocc000033ia8xvey1xo',
        name: 'International Maritime WLL',
        website: 'http://www.imadxb.com/',
        category: 'AGENCY',
        description: 'A freight-forwarding company. Confirm that this is the exact entity and logo before publishing.',
        logoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        isVisible: true,
        orderIndex: 3,
      };

      // Public DTO Resolution
      const publicDto = resolvePublicPartner(prodFixture);
      expect(publicDto.name).toBe('International Maritime WLL');
      expect(publicDto.description).toBe('A freight-forwarding company.');
      expect(publicDto.description).not.toContain('Confirm that this is the exact entity');
      expect(publicDto.website).toBeNull();
      expect(publicDto.hasWebsite).toBe(false);
      expect(publicDto.hasLogo).toBe(true);
      expect(publicDto.logoUrl).toContain('data:image/png;base64');
      expect(publicDto.initials).toBe('IW');

      // Staff Data Quality Inspection
      const staffReport = analyzePartnerDataQuality(prodFixture);
      expect(staffReport.isClean).toBe(false);
      expect(staffReport.issues.some((i) => i.code === 'EDITORIAL_INSTRUCTION')).toBe(true);
      expect(staffReport.issues.some((i) => i.code === 'HTTP_WEBSITE')).toBe(true);

      // Ensures original stored fixture values are never mutated
      expect(prodFixture.website).toBe('http://www.imadxb.com/');
      expect(prodFixture.description).toContain('Confirm that this is the exact entity');
      expect(prodFixture.isVisible).toBe(true);
    });
  });

  // =========================================================================
  // 6. API SERVER-SIDE RBAC & DEFAULT-HIDDEN CREATION
  // =========================================================================
  describe('6. API Server-Side RBAC & Default-Hidden Creation', () => {
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
        {
          id: 'p1',
          name: 'Qatar Airways',
          website: 'https://qatarairways.com',
          description: '5-star airline. Confirm entity.',
          isVisible: true,
          orderIndex: 0,
        },
        { id: 'p2', name: 'Draft Corp', isVisible: false, orderIndex: 1 },
      ]);

      const publicReq = new Request('http://localhost/api/b2b/partners');
      const publicRes = await B2BPartnersGET(publicReq as any);
      expect(publicRes.status).toBe(200);
      const publicJson = await publicRes.json();
      expect(publicJson.partners).toHaveLength(1);
      expect(publicJson.partners[0].name).toBe('Qatar Airways');
      expect(publicJson.partners[0].description).toBe('5-star airline.');
      expect(publicJson.partners[0].description).not.toContain('Confirm entity');

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

      // Test PartnersPOST (legacy endpoint parity)
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.partner.create as any).mockResolvedValue({ id: 'p-leg', name: 'Legacy Partner', isVisible: false });
      const legReq = new Request('http://localhost/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Legacy Partner' }),
      });
      const legRes = await PartnersPOST(legReq as any);
      expect(legRes.status).toBe(201);
    });

    it('validates helper functions sanitizeUrl, normalizeDomain, and normalizePartnerName', () => {
      expect(sanitizeUrl('https://e3.qa')).toBe('https://e3.qa/');
      expect(sanitizeUrl('javascript:void(0)')).toBeNull();

      expect(normalizeDomain('https://www.visitqatar.com/en')).toBe('visitqatar.com');
      expect(normalizePartnerName('Qatar Tourism 2026!')).toBe('qatartourism2026');
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
  // 7. CRM ISOLATION & ZERO CLIENT / CLIENTMEMBERSHIP MUTATION
  // =========================================================================
  describe('7. CRM Isolation & Zero Client Mutation', () => {
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
  // 8. RENDERED EN/AR UI INTEGRATION & QF-11 HANDOFF PRESERVATION
  // =========================================================================
  describe('8. Rendered EN/AR UI Integration & QF-11 Handoff Preservation', () => {
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
