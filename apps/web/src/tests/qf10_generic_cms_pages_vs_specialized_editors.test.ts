import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  isManagedCMSPage,
  getManagedCMSPage,
  getAllManagedCMSPages,
} from '../lib/cms-ownership';
import { GET as getPageList } from '../app/api/cms/pages/route';
import { GET as getPageBySlug, PUT as updatePageBySlug } from '../app/api/cms/pages/[slug]/route';

const mocks = vi.hoisted(() => {
  return {
    session: null as any,
    db: {
      pages: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      siteSettings: {
        findUnique: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/auth', () => ({
  auth: () => Promise.resolve(mocks.session),
}));

vi.mock('@/lib/db', () => ({
  default: mocks.db,
}));

describe('QF-10: Generic CMS Pages vs Specialized Editors Ownership & Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = { user: { role: 'SUPER_ADMIN', name: 'Admin' } };
  });

  // 1. Ownership Registry Completeness
  it('1. Ownership registry maps all 5 required slugs to their canonical specialized editors and APIs', () => {
    const requiredSlugs = [
      'b2c-landing',
      'b2c-discover',
      'b2b-home',
      'b2b-services',
      'b2b-cases',
    ];

    for (const slug of requiredSlugs) {
      expect(isManagedCMSPage(slug)).toBe(true);
      const entry = getManagedCMSPage(slug);
      expect(entry).not.toBeNull();
      expect(entry?.slug).toBe(slug);
      expect(entry?.specializedEditorPath).toMatch(/^\/dashboard\/(b2c|b2b)\//);
      expect(entry?.canonicalApiEndpoint).toMatch(/^\/api\/(cms\/pages|b2c)\//);
      expect(entry?.nameEn).toBeTruthy();
      expect(entry?.nameAr).toBeTruthy();
      expect(entry?.isSpecialized).toBe(true);
    }

    expect(getManagedCMSPage('b2c-landing')?.specializedEditorPath).toBe('/dashboard/b2c/landing');
    expect(getManagedCMSPage('b2c-discover')?.specializedEditorPath).toBe('/dashboard/b2c/discover');
    expect(getManagedCMSPage('b2b-home')?.specializedEditorPath).toBe('/dashboard/b2b/home');
    expect(getManagedCMSPage('b2b-services')?.specializedEditorPath).toBe('/dashboard/b2b/services-page');
    expect(getManagedCMSPage('b2b-cases')?.specializedEditorPath).toBe('/dashboard/b2b/cases-page');

    const all = getAllManagedCMSPages();
    expect(all.length).toBeGreaterThanOrEqual(5);
  });

  // 2. Unmanaged generic page recognition
  it('2. Unmanaged generic pages return isManaged = false and can be identified cleanly', () => {
    expect(isManagedCMSPage('privacy-policy')).toBe(false);
    expect(isManagedCMSPage('terms-of-service')).toBe(false);
    expect(isManagedCMSPage('about-custom')).toBe(false);
    expect(getManagedCMSPage('random-page')).toBeNull();
  });

  // 3. API GET /api/cms/pages/[slug] includes managed metadata
  it('3. GET /api/cms/pages/[slug] informs client whether page is managed and provides deep link info', async () => {
    mocks.db.pages.findUnique.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/cms/pages/b2c-landing');
    const res = await getPageBySlug(req, { params: Promise.resolve({ slug: 'b2c-landing' }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.slug).toBe('b2c-landing');
    expect(body.data.isManaged).toBe(true);
    expect(body.data.managedInfo).not.toBeNull();
    expect(body.data.managedInfo.specializedEditorPath).toBe('/dashboard/b2c/landing');
    expect(body.data.content).toBeDefined();
  });

  // 4. Structured field preservation during partial save
  it('4. Partial JSON payload save to managed page preserves structured fields and sections', async () => {
    // Mock existing content in database
    mocks.db.pages.findUnique.mockResolvedValue({
      slug: 'b2c-landing',
      content: {
        hero: { headerEn: 'Original Hero', headerAr: 'العنوان الأصلي' },
        act1: { headlineEn: 'Act 1 Original' },
        liveFeed: { isLiveNow: true, streamUrl: 'https://stream.e3.qa' },
      },
    });

    mocks.db.pages.upsert.mockImplementation(async ({ create, update }: any) => {
      return { id: 'page-1', ...(update || create) };
    });

    const req = new NextRequest('http://localhost:3000/api/cms/pages/b2c-landing', {
      method: 'PUT',
      body: JSON.stringify({
        content: {
          hero: { headerEn: 'Updated Hero Title Only' },
        },
      }),
    });

    const res = await updatePageBySlug(req, { params: Promise.resolve({ slug: 'b2c-landing' }) });
    expect(res.status).toBe(200);

    // Verify upsert call merged existing content and did not delete act1 or liveFeed
    expect(mocks.db.pages.upsert).toHaveBeenCalled();
    const upsertArgs = mocks.db.pages.upsert.mock.calls[0][0];
    const savedContent = upsertArgs.update.content;

    expect(savedContent.hero.headerEn).toBe('Updated Hero Title Only');
    // Existing structured properties are preserved!
    expect(savedContent.act1).toBeDefined();
    expect(savedContent.liveFeed).toBeDefined();
  });

  // 5. RBAC Protection on GET /api/cms/pages
  it('5. RBAC Protection: Anonymous/Unauthorized request to /api/cms/pages is rejected with 401', async () => {
    mocks.session = null;
    const res = await getPageList();
    expect(res.status).toBe(401);

    // Authorized admin gets 200
    mocks.session = { user: { role: 'SUPER_ADMIN' } };
    mocks.db.pages.findMany.mockResolvedValueOnce([
      { id: '1', slug: 'b2c-landing', status: 'PUBLISHED', updatedAt: new Date() },
    ]);
    const resAuthed = await getPageList();
    expect(resAuthed.status).toBe(200);
  });
});
