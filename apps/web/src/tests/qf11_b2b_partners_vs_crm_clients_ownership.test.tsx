import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextRequest } from 'next/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { PartnersClient } from '@/components/dashboard/b2b/PartnersClient';
import { ClientsList } from '@/components/dashboard/crm/ClientsList';
import { DOMAIN_BOUNDARIES } from '@/lib/client-partner-ownership';
import { GET as getB2BPartners, POST as postB2BPartner } from '@/app/api/b2b/partners/route';
import { GET as getCRMClients, POST as postCRMClient } from '@/app/api/crm/clients/route';

const mocks = vi.hoisted(() => {
  return {
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
      systemLog: {
        create: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/auth', () => ({
  auth: () => Promise.resolve(mocks.session),
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

describe('QF-11: B2B Clients/Partners vs CRM Clients Ownership & Boundary Separation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
  });

  // 1. Contract & Registry Boundaries
  it('1. Domain boundaries contract explicitly maps public showcase vs CRM tenant domains', () => {
    expect(DOMAIN_BOUNDARIES.B2B_PARTNERS.path).toBe('/dashboard/b2b/clients');
    expect(DOMAIN_BOUNDARIES.B2B_PARTNERS.apiEndpoint).toBe('/api/b2b/partners');
    expect(DOMAIN_BOUNDARIES.B2B_PARTNERS.model).toBe('Partner');

    expect(DOMAIN_BOUNDARIES.CRM_CLIENTS.path).toBe('/dashboard/crm/clients');
    expect(DOMAIN_BOUNDARIES.CRM_CLIENTS.apiEndpoint).toBe('/api/crm/clients');
    expect(DOMAIN_BOUNDARIES.CRM_CLIENTS.model).toBe('Client');
  });

  // 2. API Isolation: Saving a B2B Partner modifies only db.partner
  it('2. Saving a B2B Partner creates/updates only Partner records and never touches CRM Client model', async () => {
    mocks.db.partner.findMany.mockResolvedValueOnce([
      { id: 'partner-1', name: 'Qatar Tourism', category: 'GOVERNMENT', isVisible: true },
    ]);
    const getReq = new NextRequest('http://localhost:3000/api/b2b/partners');
    const getRes = await getB2BPartners(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.partners).toHaveLength(1);

    mocks.db.partner.create.mockResolvedValueOnce({
      id: 'partner-1',
      name: 'Qatar Tourism',
      category: 'GOVERNMENT',
      logoUrl: 'https://cdn.e3.qa/qt-logo.png',
      isVisible: true,
      orderIndex: 1,
    });

    const req = new NextRequest('http://localhost:3000/api/b2b/partners', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Qatar Tourism',
        category: 'GOVERNMENT',
        logoUrl: 'https://cdn.e3.qa/qt-logo.png',
      }),
    });

    const res = await postB2BPartner(req);
    expect(res.status).toBe(200);
    expect(mocks.db.partner.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Qatar Tourism',
        category: 'GOVERNMENT',
        logoUrl: 'https://cdn.e3.qa/qt-logo.png',
      }),
    });
    expect(mocks.db.client.create).not.toHaveBeenCalled();
    expect(mocks.db.client.update).not.toHaveBeenCalled();
  });

  // 3. API Isolation: Saving a CRM Client modifies only db.client
  it('3. Saving a CRM Client creates only Client records and never touches public Partner model', async () => {
    mocks.db.client.create.mockResolvedValueOnce({
      id: 'client-1',
      company: 'Enterprise Corp QSTP',
      type: 'B2B',
      industry: 'Oil & Gas',
    });
    mocks.db.systemLog.create.mockResolvedValueOnce({});

    const req = new NextRequest('http://localhost:3000/api/crm/clients', {
      method: 'POST',
      body: JSON.stringify({
        company: 'Enterprise Corp QSTP',
        type: 'B2B',
        industry: 'Oil & Gas',
      }),
    });

    const res = await postCRMClient(req);
    expect(res.status).toBe(200);
    expect(mocks.db.client.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        company: 'Enterprise Corp QSTP',
        type: 'B2B',
        industry: 'Oil & Gas',
      }),
    });
    expect(mocks.db.partner.create).not.toHaveBeenCalled();
    expect(mocks.db.partner.update).not.toHaveBeenCalled();
  });

  // 4. RBAC Protection on both domains
  it('4. Both domains strictly enforce RBAC and reject unauthorized anonymous users with 401', async () => {
    mocks.session = null;

    // B2B Partner write without auth
    const reqPartner = new NextRequest('http://localhost:3000/api/b2b/partners', {
      method: 'POST',
      body: JSON.stringify({ name: 'Unauth Partner' }),
    });
    const resPartner = await postB2BPartner(reqPartner);
    expect(resPartner.status).toBe(401);

    // CRM Client read without auth
    const resCRMGet = await getCRMClients();
    expect(resCRMGet.status).toBe(401);

    // CRM Client write without auth
    const reqCRM = new NextRequest('http://localhost:3000/api/crm/clients', {
      method: 'POST',
      body: JSON.stringify({ company: 'Unauth Corp' }),
    });
    const resCRM = await postCRMClient(reqCRM);
    expect(resCRM.status).toBe(401);
  });

  // 5. Rendered Cross-Domain Handoff in English
  it('5. Rendered English handoff links correctly between B2B and CRM dashboards with /en/... prefix', () => {
    // 5a. B2B Partners Dashboard -> CRM handoff link
    const partnersHtml = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <PartnersClient initialData={[]} />
      </LocaleProvider>
    );
    expect(partnersHtml).toContain('dir="ltr"');
    expect(partnersHtml).toContain('Tenant Accounts &amp; CRM Clients Database');
    expect(partnersHtml).toContain('href="/en/dashboard/crm/clients"');
    expect(partnersHtml).not.toMatch(/href="\/dashboard\/crm\/clients"/);

    // 5b. CRM Clients Dashboard -> B2B Partners handoff link
    const crmHtml = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <ClientsList initialClients={[]} />
      </LocaleProvider>
    );
    expect(crmHtml).toContain('dir="ltr"');
    expect(crmHtml).toContain('Public B2B Partners &amp; Clients Showcase');
    expect(crmHtml).toContain('href="/en/dashboard/b2b/clients"');
    expect(crmHtml).not.toMatch(/href="\/dashboard\/b2b\/clients"/);
  });

  // 6. Rendered Cross-Domain Handoff in Arabic (RTL)
  it('6. Rendered Arabic handoff links correctly between B2B and CRM dashboards with /ar/... prefix and RTL', () => {
    // 6a. B2B Partners Dashboard -> CRM handoff link in Arabic
    const partnersHtml = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <PartnersClient initialData={[]} />
      </LocaleProvider>
    );
    expect(partnersHtml).toContain('dir="rtl"');
    expect(partnersHtml).toContain('منظومة الحسابات والشركات في CRM');
    expect(partnersHtml).toContain('إدارة عملاء CRM');
    expect(partnersHtml).toContain('href="/ar/dashboard/crm/clients"');
    expect(partnersHtml).not.toMatch(/href="\/dashboard\/crm\/clients"/);

    // 6b. CRM Clients Dashboard -> B2B Partners handoff link in Arabic
    const crmHtml = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <ClientsList initialClients={[]} />
      </LocaleProvider>
    );
    expect(crmHtml).toContain('dir="rtl"');
    expect(crmHtml).toContain('دليل شركاء وعملاء الواجهة العامة');
    expect(crmHtml).toContain('دليل الشركاء العام');
    expect(crmHtml).toContain('href="/ar/dashboard/b2b/clients"');
    expect(crmHtml).not.toMatch(/href="\/dashboard\/b2b\/clients"/);
  });
});
