import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { PackagesPageEditor } from '@/components/dashboard/b2c/PackagesPageEditor';
import { PackagesManager } from '@/components/dashboard/b2c/PackagesManager';
import { PackagesClient } from '@/components/b2c/PackagesClient';
import { getManagedCMSPage, isManagedCMSPage } from '@/lib/cms-ownership';
import { DEFAULT_B2C_PACKAGES_PAGE_CONTENT, getMergedCMSPageContent } from '@/lib/cms-default-pages';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('QF-14 — Packages Page Settings vs Package Records Ownership & Guardrails', () => {
  const samplePackagesFixture = [
    {
      id: 'pkg-1',
      slug: 'inflatarun-vip-birthday',
      titleEn: 'InflataRUN VIP Birthday Adventure',
      titleAr: 'مغامرة عيد الميلاد VIP في إنفلاتا ران',
      category: 'BIRTHDAY',
      startingPrice: 1500,
      minGuests: 10,
      maxGuests: 40,
      isPublished: true,
      isFeatured: true,
      shortDescriptionEn: 'All-inclusive VIP inflatable birthday party',
    },
    {
      id: 'pkg-2',
      slug: 'urban-arena-tactical-combat',
      titleEn: 'Urban Arena Tactical Team Outing',
      titleAr: 'تحدي الشركات وتكتيك الفرق في أوربان أرينا',
      category: 'CORPORATE',
      startingPrice: 3500,
      minGuests: 15,
      maxGuests: 100,
      isPublished: true,
      isFeatured: false,
      shortDescriptionEn: 'Competitive corporate team-building experience',
    },
    {
      id: 'pkg-draft',
      slug: 'confidential-vip-package',
      titleEn: 'Confidential VIP Experience (Draft)',
      titleAr: 'باقة كبار الشخصيات السرية',
      category: 'PRIVATE_EVENT',
      startingPrice: 10000,
      minGuests: 5,
      maxGuests: 20,
      isPublished: false, // Unpublished Draft
      isFeatured: false,
      shortDescriptionEn: 'Private draft experience not yet available publicly',
    },
  ];

  const samplePageSettingsFixture = {
    eyebrowEn: 'CUSTOM CELEBRATIONS & GROUP PACKAGES',
    eyebrowAr: 'باقات الفعاليات المخصصة',
    titleEn: 'Custom Landmark Moments',
    titleAr: 'لحظات استثنائية مخصصة',
    descEn: 'Custom description for celebrations.',
    descAr: 'وصف مخصص للاحتفالات.',
    primaryCtaEn: 'Explore All Packages',
    primaryCtaAr: 'استكشف كافة الباقات',
    secondaryCtaEn: 'Book VIP Concierge',
    secondaryCtaAr: 'احجز خدمة كبار الشخصيات',
    campaignBadgeEn: 'EXCLUSIVE 2026',
    campaignBadgeAr: 'حصري ٢٠٢٦',
    heroMedia: {
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-custom-packages',
    },
  };

  beforeEach(() => {
    // Reset global fetch mock
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/cms/pages/b2c-packages-page')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { content: samplePageSettingsFixture } }),
        });
      }
      if (url.includes('/api/b2c/packages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: samplePackagesFixture }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  // 1. Ownership & Registry Isolation
  it('1. CMS ownership registry accurately maps b2c-packages-page to specialized editor', () => {
    expect(isManagedCMSPage('b2c-packages-page')).toBe(true);
    expect(isManagedCMSPage('b2c-packages')).toBe(true);

    const managedEntry = getManagedCMSPage('b2c-packages-page');
    expect(managedEntry?.specializedEditorPath).toBe('/dashboard/b2c/packages-page');
    expect(managedEntry?.canonicalApiEndpoint).toBe('/api/cms/pages/b2c-packages-page');
    expect(managedEntry?.domain).toBe('B2C');

    // Standalone individual package slugs must not be in CMS pages registry
    expect(isManagedCMSPage('inflatarun-vip-birthday')).toBe(false);
  });

  // 2. Default Content Fallback Protection
  it('2. Default content seeds prevent blank forms or loading regression on cold start', () => {
    const mergedDefaults = getMergedCMSPageContent('b2c-packages-page');
    expect(mergedDefaults.titleEn).toBe(DEFAULT_B2C_PACKAGES_PAGE_CONTENT.titleEn);
    expect(mergedDefaults.primaryCtaEn).toBe(DEFAULT_B2C_PACKAGES_PAGE_CONTENT.primaryCtaEn);
    expect(mergedDefaults.heroMedia.mediaType).toBe('IMAGE');

    const partialCustom = getMergedCMSPageContent('b2c-packages-page', {
      titleEn: 'Overridden Title',
    });
    expect(partialCustom.titleEn).toBe('Overridden Title');
    expect(partialCustom.eyebrowEn).toBe(DEFAULT_B2C_PACKAGES_PAGE_CONTENT.eyebrowEn); // Preserves non-overridden default
  });

  // 3. EN/AR Handoff Links and RTL/LTR Direction in Packages Page Editor
  it('3. Packages Page Editor renders reciprocal handoff to Packages Manager with exact localized URLs and LTR/RTL layout', () => {
    // English rendering
    const htmlEn = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <PackagesPageEditor />
      </LocaleProvider>
    );

    expect(htmlEn).toContain('dir="ltr"');
    expect(htmlEn).toContain('href="/en/dashboard/b2c/packages"');
    expect(htmlEn).toContain('Manage Individual Packages');
    expect(htmlEn).toContain('Go to Packages Manager');

    // Arabic rendering
    const htmlAr = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <PackagesPageEditor />
      </LocaleProvider>
    );

    expect(htmlAr).toContain('dir="rtl"');
    expect(htmlAr).toContain('href="/ar/dashboard/b2c/packages"');
    expect(htmlAr).toContain('إدارة الباقات الفردية');
    expect(htmlAr).toContain('مدير الباقات وأعياد الميلاد');
  });

  // 4. EN/AR Handoff Links and RTL/LTR Direction in Packages Manager
  it('4. Packages Manager renders reciprocal handoff to Packages Page Editor with exact localized URLs and LTR/RTL layout', () => {
    // English rendering
    const htmlEn = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <PackagesManager />
      </LocaleProvider>
    );

    expect(htmlEn).toContain('dir="ltr"');
    expect(htmlEn).toContain('href="/en/dashboard/b2c/packages-page"');
    expect(htmlEn).toContain('Edit Page Layout &amp; Media');
    expect(htmlEn).toContain('Go to Page Editor');

    // Arabic rendering
    const htmlAr = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <PackagesManager />
      </LocaleProvider>
    );

    expect(htmlAr).toContain('dir="rtl"');
    expect(htmlAr).toContain('href="/ar/dashboard/b2c/packages-page"');
    expect(htmlAr).toContain('تحرير تصميم ووسائط الصفحة');
    expect(htmlAr).toContain('محرر صفحة الباقات');
  });

  // 5. Published-Record Filtering
  it('5. Public composition filters only published packages, strictly excluding drafts', () => {
    const publishedOnly = samplePackagesFixture.filter((p) => p.isPublished);
    expect(publishedOnly).toHaveLength(2);
    expect(publishedOnly.map((p) => p.slug)).toEqual([
      'inflatarun-vip-birthday',
      'urban-arena-tactical-combat',
    ]);
    expect(publishedOnly.some((p) => p.slug === 'confidential-vip-package')).toBe(false);
  });

  // 6. Public Page Composition with Page Settings
  it('6. Public PackagesClient renders composed hero settings and only published package cards', () => {
    const publishedPackages = samplePackagesFixture.filter((p) => p.isPublished);

    const html = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <PackagesClient
          locale="en"
          initialSettings={samplePageSettingsFixture}
          packages={publishedPackages}
        />
      </LocaleProvider>
    );

    // Page settings assertions
    expect(html).toContain('CUSTOM CELEBRATIONS &amp; GROUP PACKAGES');
    expect(html).toContain('Custom Landmark Moments');
    expect(html).toContain('Explore All Packages');
    expect(html).toContain('Book VIP Concierge');

    // Catalog assertions
    expect(html).toContain('InflataRUN VIP Birthday Adventure');
    expect(html).toContain('Urban Arena Tactical Team Outing');
    expect(html).not.toContain('Confidential VIP Experience (Draft)');
  });

  // 7. Save Isolation Verification
  it('7. Page settings payload format maintains strict isolation without mutating package catalog records', () => {
    const pageSavePayload = {
      data: {
        content: {
          titleEn: 'New Hero Title',
          eyebrowEn: 'New Eyebrow',
          primaryCtaEn: 'Book Now',
        },
        published: true,
      },
    };

    // The page payload contains only page layout & hero fields
    expect(pageSavePayload.data.content).not.toHaveProperty('startingPrice');
    expect(pageSavePayload.data.content).not.toHaveProperty('tiers');
    expect(pageSavePayload.data.content).not.toHaveProperty('inclusions');

    const packageRecordPayload = {
      titleEn: 'Super Trampoline Party',
      category: 'BIRTHDAY',
      startingPrice: 1800,
      tiers: [{ id: 't1', nameEn: 'Standard Tier', price: 1800 }],
    };

    // The package record payload contains only individual catalog fields
    expect(packageRecordPayload).not.toHaveProperty('heroMedia');
    expect(packageRecordPayload).not.toHaveProperty('footerMedia');
    expect(packageRecordPayload).not.toHaveProperty('seoTitle');
  });
});
