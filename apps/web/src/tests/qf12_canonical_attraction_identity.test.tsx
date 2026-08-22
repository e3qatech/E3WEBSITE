import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextRequest } from 'next/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { B2BAttractionsList } from '@/components/dashboard/b2b/B2BAttractionsList';
import { AttractionsList } from '@/components/dashboard/b2c/AttractionsList';
import {
  ATTRACTION_CANONICAL_TOTAL,
  ATTRACTION_OWNERSHIP_DOMAINS,
  isSafeB2BAttractionPayload,
  isSafeB2CAttractionPayload,
} from '@/lib/canonical-attraction-identity';
import { PUT as putB2CFullAttraction } from '@/app/api/b2c/attractions/[id]/full/route';
import { PATCH as patchB2BAttraction } from '@/app/api/b2b/attractions/[id]/route';

const mocks = vi.hoisted(() => {
  return {
    session: null as any,
    db: {
      attraction: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
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

describe('QF-12: Canonical Attraction & Project Identity Architecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
  });

  // 1. Canonical Mapping & Total Integrity
  it('1. Canonical Attraction total maps 34 core venues and defines distinct portal registries', () => {
    expect(ATTRACTION_CANONICAL_TOTAL).toBe(34);
    expect(ATTRACTION_OWNERSHIP_DOMAINS.B2C_ATTRACTIONS.visibilityField).toBe('isPublished');
    expect(ATTRACTION_OWNERSHIP_DOMAINS.B2B_ATTRACTIONS.visibilityField).toBe('isB2bVisible');

    expect(isSafeB2BAttractionPayload({ clientName: 'Qatar Tourism', year: 2024 })).toBe(true);
    expect(isSafeB2BAttractionPayload({ pricing: [{ titleEn: 'VIP' }] })).toBe(false);

    expect(isSafeB2CAttractionPayload({ taglineEn: 'Family Fun', isPublished: true })).toBe(true);
  });

  // 2. B2C Save Isolation: Full B2C PUT preserves B2B presentation fields
  it('2. B2C full editor save updates consumer presentation and child records without wiping B2B fields', async () => {
    let txUpdateData: any = null;

    mocks.db.$transaction.mockImplementation(async (callback: any) => {
      const txMock = {
        attractionPricing: { deleteMany: vi.fn() },
        attractionFaq: { deleteMany: vi.fn() },
        attractionSocialLink: { deleteMany: vi.fn() },
        attractionGalleryItem: { deleteMany: vi.fn() },
        attractionFeature: { deleteMany: vi.fn(), create: vi.fn() },
        location: { deleteMany: vi.fn(), create: vi.fn().mockResolvedValue({ id: 'loc-1' }) },
        brandPlacement: { deleteMany: vi.fn() },
        attraction: {
          update: vi.fn().mockImplementation((args: any) => {
            txUpdateData = args.data;
            return Promise.resolve({ id: 'attr-1', ...args.data });
          }),
        },
      };
      return await callback(txMock);
    });

    const req = new NextRequest('http://localhost:3000/api/b2c/attractions/attr-1/full', {
      method: 'PUT',
      body: JSON.stringify({
        nameEn: 'Doha Balloon Parade',
        nameAr: 'استعراض بالونات الدوحة',
        slug: 'doha-balloon-parade-2022',
        taglineEn: 'A landmark celebration',
        isPublished: true,
        pricing: [{ titleEn: 'General', price: 50 }],
      }),
    });

    const res = await putB2CFullAttraction(req, { params: Promise.resolve({ id: 'attr-1' }) });
    expect(res.status).toBe(200);
    expect(txUpdateData).toBeDefined();
    expect(txUpdateData.nameEn).toBe('Doha Balloon Parade');
    expect(txUpdateData.isPublished).toBe(true);
    // Ensure B2B fields are not set to undefined/null or deleted
    expect(txUpdateData).not.toHaveProperty('isB2bVisible');
    expect(txUpdateData).not.toHaveProperty('clientName');
    expect(txUpdateData).not.toHaveProperty('year');
  });

  // 3. B2B Save Isolation: B2B PATCH updates B2B presentation without wiping B2C structures
  it('3. B2B editor save updates corporate fields and preserves B2C publication & ticketing structures', async () => {
    mocks.db.attraction.findUnique.mockResolvedValueOnce({
      id: 'attr-1',
      slug: 'doha-balloon-parade-2022',
      nameEn: 'Doha Balloon Parade',
      isPublished: true,
      isB2bVisible: true,
    });

    mocks.db.attraction.update.mockResolvedValueOnce({
      id: 'attr-1',
      clientName: 'Qatar Tourism',
      year: 2022,
      b2bCategory: 'Mega-Event',
      isB2bVisible: true,
    });

    const req = new NextRequest('http://localhost:3000/api/b2b/attractions/attr-1', {
      method: 'PATCH',
      body: JSON.stringify({
        clientName: 'Qatar Tourism',
        year: 2022,
        b2bCategory: 'Mega-Event',
        isB2bVisible: true,
      }),
    });

    const res = await patchB2BAttraction(req, { params: Promise.resolve({ id: 'attr-1' }) });
    expect(res.status).toBe(200);
    expect(mocks.db.attraction.update).toHaveBeenCalledWith({
      where: { id: 'attr-1' },
      data: {
        clientName: 'Qatar Tourism',
        year: 2022,
        b2bCategory: 'Mega-Event',
        isB2bVisible: true,
      },
    });
  });

  // 4. RBAC Protection
  it('4. Both B2C and B2B attraction save endpoints reject unauthorized users with 401/403', async () => {
    mocks.session = null;

    // B2C Full PUT without auth
    const reqB2C = new NextRequest('http://localhost:3000/api/b2c/attractions/attr-1/full', {
      method: 'PUT',
      body: JSON.stringify({ nameEn: 'Unauthorized Edit' }),
    });
    const resB2C = await putB2CFullAttraction(reqB2C, { params: Promise.resolve({ id: 'attr-1' }) });
    expect(resB2C.status).toBe(401);

    // B2B PATCH without auth
    const reqB2B = new NextRequest('http://localhost:3000/api/b2b/attractions/attr-1', {
      method: 'PATCH',
      body: JSON.stringify({ clientName: 'Unauthorized Corp' }),
    });
    const resB2B = await patchB2BAttraction(reqB2B, { params: Promise.resolve({ id: 'attr-1' }) });
    expect(resB2B.status).toBe(403);
  });

  // 5. Rendered English Cross-Portal Handoff & Localization
  it('5. Rendered English lists link cross-portal with /en/ prefix and LTR', () => {
    const mockItem = {
      id: 'attr-1',
      slug: 'doha-balloon-parade-2022',
      name: { en: 'Doha Balloon Parade', ar: 'استعراض بالونات الدوحة' },
      tagline: null,
      isPublished: true,
      isFeatured: false,
      isB2bVisible: true,
      b2bCategory: 'Mega-Event',
      projectType: 'Turnkey Production',
      clientName: 'Qatar Tourism',
      year: 2022,
      venue: 'Doha Corniche',
      temporalStatus: 'ACTIVE',
      updatedAt: '2026-08-14T00:00:00Z',
      heroMediaUrl: null,
      heroFallbackUrl: null,
      heroThumbnailUrl: null,
      heroMediaType: 'IMAGE',
      _count: { pricing: 2, offers: 1, faqs: 4 },
    };

    // B2B List English Render
    const b2bHtml = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <B2BAttractionsList initialAttractions={[mockItem]} />
      </LocaleProvider>
    );
    expect(b2bHtml).toContain('dir="ltr"');
    expect(b2bHtml).toContain('Unified Canonical Attraction Architecture');
    expect(b2bHtml).toContain('href="/en/dashboard/b2b/attractions/new"');
    expect(b2bHtml).toContain('href="/en/dashboard/b2c/attractions"');
    expect(b2bHtml).toContain('href="/en/dashboard/b2b/attractions/attr-1/edit"');
    expect(b2bHtml).toContain('href="/en/dashboard/b2c/attractions/attr-1/edit"');
    expect(b2bHtml).not.toMatch(/href="\/dashboard\/b2c\/attractions"/);
    expect(b2bHtml).not.toMatch(/href="\/dashboard\/b2b\/attractions\/new"/);

    // B2C List English Render
    const b2cHtml = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <AttractionsList initialAttractions={[mockItem as any]} />
      </LocaleProvider>
    );
    expect(b2cHtml).toContain('dir="ltr"');
    expect(b2cHtml).toContain('Unified Canonical Attraction Architecture');
    expect(b2cHtml).toContain('href="/en/dashboard/b2c/attractions/new"');
    expect(b2cHtml).toContain('href="/en/dashboard/b2b/attractions"');
    expect(b2cHtml).toContain('href="/en/dashboard/b2c/attractions/attr-1/edit"');
    expect(b2cHtml).toContain('href="/en/dashboard/b2c/attractions/attr-1/edit?stage=media"');
    expect(b2cHtml).not.toMatch(/href="\/dashboard\/b2b\/attractions"/);
    expect(b2cHtml).not.toMatch(/href="\/dashboard\/b2c\/attractions\/new"/);
  });

  // 6. Rendered Arabic Cross-Portal Handoff & Localization (RTL)
  it('6. Rendered Arabic lists link cross-portal with /ar/ prefix and RTL', () => {
    const mockItem = {
      id: 'attr-1',
      slug: 'doha-balloon-parade-2022',
      name: { en: 'Doha Balloon Parade', ar: 'استعراض بالونات الدوحة' },
      tagline: null,
      isPublished: true,
      isFeatured: false,
      isB2bVisible: true,
      b2bCategory: 'Mega-Event',
      projectType: 'Turnkey Production',
      clientName: 'Qatar Tourism',
      year: 2022,
      venue: 'Doha Corniche',
      temporalStatus: 'ACTIVE',
      updatedAt: '2026-08-14T00:00:00Z',
      heroMediaUrl: null,
      heroFallbackUrl: null,
      heroThumbnailUrl: null,
      heroMediaType: 'IMAGE',
      _count: { pricing: 2, offers: 1, faqs: 4 },
    };

    // B2B List Arabic Render
    const b2bHtml = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <B2BAttractionsList initialAttractions={[mockItem]} />
      </LocaleProvider>
    );
    expect(b2bHtml).toContain('dir="rtl"');
    expect(b2bHtml).toContain('بنية الهوية الموحدة للوجهات');
    expect(b2bHtml).toContain('قائمة وجهات B2C');
    expect(b2bHtml).toContain('محرر B2C');
    expect(b2bHtml).toContain('href="/ar/dashboard/b2b/attractions/new"');
    expect(b2bHtml).toContain('href="/ar/dashboard/b2c/attractions"');
    expect(b2bHtml).toContain('href="/ar/dashboard/b2b/attractions/attr-1/edit"');
    expect(b2bHtml).toContain('href="/ar/dashboard/b2c/attractions/attr-1/edit"');
    expect(b2bHtml).not.toMatch(/href="\/dashboard\/b2c\/attractions"/);
    expect(b2bHtml).not.toMatch(/href="\/dashboard\/b2b\/attractions\/new"/);

    // B2C List Arabic Render
    const b2cHtml = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <AttractionsList initialAttractions={[mockItem as any]} />
      </LocaleProvider>
    );
    expect(b2cHtml).toContain('dir="rtl"');
    expect(b2cHtml).toContain('الهوية الموحدة لوجهات ومشاريع E3');
    expect(b2cHtml).toContain('دليل مشاريع B2B');
    expect(b2cHtml).toContain('دراسات الحالة');
    expect(b2cHtml).toContain('href="/ar/dashboard/b2c/attractions/new"');
    expect(b2cHtml).toContain('href="/ar/dashboard/b2b/attractions"');
    expect(b2cHtml).toContain('href="/ar/dashboard/b2c/attractions/attr-1/edit"');
    expect(b2cHtml).toContain('href="/ar/dashboard/b2c/attractions/attr-1/edit?stage=media"');
    expect(b2cHtml).not.toMatch(/href="\/dashboard\/b2b\/attractions"/);
    expect(b2cHtml).not.toMatch(/href="\/dashboard\/b2c\/attractions\/new"/);
  });
});
