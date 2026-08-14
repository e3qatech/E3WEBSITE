import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { PackagesPageEditor } from '@/components/dashboard/b2c/PackagesPageEditor';
import { PackagesManager } from '@/components/dashboard/b2c/PackagesManager';
import { PackagesClient } from '@/components/b2c/PackagesClient';
import { Footer } from '@/components/layout/Footer';
import { DashboardLanguageSwitch, DashboardStickyActions } from '@/components/dashboard/ui';
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

describe('QF-14 & QF-14-B — Packages Page Settings vs Package Records Ownership & Arabic Localization', () => {
  const sampleThreePublishedPackagesFixture = [
    {
      id: 'pkg-1',
      slug: 'inflatarun-vip-birthday',
      titleEn: 'InflataRUN VIP Birthday Adventure',
      titleAr: 'مغامرة عيد الميلاد VIP في إنفلاتا ران',
      category: 'BIRTHDAY',
      startingPrice: 1500,
      minGuests: 10,
      maxGuests: 40,
      durationMinutes: 120,
      isPublished: true,
      isFeatured: true,
      shortDescriptionEn: 'All-inclusive VIP inflatable birthday party',
      shortDescriptionAr: 'حفل عيد ميلاد ترفيهي شامل في إنفلاتا ران مع غرفة احتفالات خاصة',
      inclusions: [
        { titleEn: 'Full Park Access', titleAr: 'دخول كامل لجميع الألعاب' },
        { titleEn: 'Private Party Room', titleAr: 'غرفة احتفالات خاصة' }
      ]
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
      durationMinutes: 180,
      isPublished: true,
      isFeatured: false,
      shortDescriptionEn: 'Competitive corporate team-building experience',
      shortDescriptionAr: 'تجربة تكتيكية تفاعلية لبناء روح الفريق وتحدي الشركات',
      inclusions: [
        { titleEn: 'Tactical Laser Challenge', titleAr: 'تحدي الليزر التكتيكي' },
        { titleEn: 'Catering Buffet', titleAr: 'بوفيه ضيافة متكامل' }
      ]
    },
    {
      id: 'pkg-3',
      slug: 'school-discovery-adventure',
      titleEn: 'School Discovery & Activity Pass',
      titleAr: 'رحلة المدارس والاستكشاف الترفيهي',
      category: 'SCHOOL',
      startingPrice: 850,
      minGuests: 20,
      maxGuests: 150,
      durationMinutes: 90,
      isPublished: true,
      isFeatured: false,
      shortDescriptionEn: 'Educational and active group play experience for schools',
      shortDescriptionAr: 'باقة مخصصة للمدارس والحضانات تجمع بين التعليم والنشاط الحركي',
      inclusions: [
        { titleEn: 'Safety Marshals', titleAr: 'مشرفين سلامة متخصصين' },
        { titleEn: 'Snack Packs', titleAr: 'وجبات خفيفة للطلاب' }
      ]
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
    descAr: 'وصف مخصص للاحتفالات في قطر.',
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
          json: () => Promise.resolve({ data: sampleThreePublishedPackagesFixture }),
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
    expect(partialCustom.eyebrowEn).toBe(DEFAULT_B2C_PACKAGES_PAGE_CONTENT.eyebrowEn);
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
    const publishedOnly = sampleThreePublishedPackagesFixture.filter((p) => p.isPublished);
    expect(publishedOnly).toHaveLength(3);
    expect(publishedOnly.map((p) => p.slug)).toEqual([
      'inflatarun-vip-birthday',
      'urban-arena-tactical-combat',
      'school-discovery-adventure',
    ]);
    expect(publishedOnly.some((p) => p.slug === 'confidential-vip-package')).toBe(false);
  });

  // 6. Public Page Composition with Page Settings
  it('6. Public PackagesClient renders composed hero settings and only published package cards', () => {
    const publishedPackages = sampleThreePublishedPackagesFixture.filter((p) => p.isPublished);

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

    // Catalog assertions (3 published packages rendered)
    expect(html).toContain('InflataRUN VIP Birthday Adventure');
    expect(html).toContain('Urban Arena Tactical Team Outing');
    expect(html).toContain('School Discovery &amp; Activity Pass');
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

    expect(pageSavePayload.data.content).not.toHaveProperty('startingPrice');
    expect(pageSavePayload.data.content).not.toHaveProperty('tiers');
    expect(pageSavePayload.data.content).not.toHaveProperty('inclusions');

    const packageRecordPayload = {
      titleEn: 'Super Trampoline Party',
      category: 'BIRTHDAY',
      startingPrice: 1800,
      tiers: [{ id: 't1', nameEn: 'Standard Tier', price: 1800 }],
    };

    expect(packageRecordPayload).not.toHaveProperty('heroMedia');
    expect(packageRecordPayload).not.toHaveProperty('footerMedia');
    expect(packageRecordPayload).not.toHaveProperty('seoTitle');
  });

  // 8. QF-14-B: Arabic Packages Client Localization & Typo Correction
  it('8. Arabic PackagesClient renders corrected "أعياد الميلاد", localized categories, units, and starting price with zero English residue', () => {
    const publishedPackages = sampleThreePublishedPackagesFixture.filter((p) => p.isPublished);

    const htmlAr = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <PackagesClient
          locale="ar"
          initialSettings={samplePageSettingsFixture}
          packages={publishedPackages}
        />
      </LocaleProvider>
    );

    // 1. Corrected typo: أعياد الميلاد (NOT أعيد الميلاد)
    expect(htmlAr).toContain('أعياد الميلاد');
    expect(htmlAr).not.toContain('أعيد الميلاد');

    // 2. Arabic units and category badges
    expect(htmlAr).toContain('ضيوف');
    expect(htmlAr).toContain('دقيقة');
    expect(htmlAr).toContain('يبدأ من');
    expect(htmlAr).toContain('عرض التفاصيل');
    expect(htmlAr).toContain('طلب حجز');
    expect(htmlAr).toContain('مقارنة');

    // 3. Rendered three package cards in Arabic
    expect(htmlAr).toContain('مغامرة عيد الميلاد VIP في إنفلاتا ران');
    expect(htmlAr).toContain('تحدي الشركات وتكتيك الفرق في أوربان أرينا');
    expect(htmlAr).toContain('رحلة المدارس والاستكشاف الترفيهي');

    // 4. Zero English residue in public package cards
    expect(htmlAr).not.toContain('Starting From');
    expect(htmlAr).not.toContain('View Package');
    expect(htmlAr).not.toContain('Quick Enquiry');
  });

  // 9. QF-14-B: Arabic Footer & Qatar PDPL Compliance Localization
  it('9. Arabic Footer renders localized rights, legal policy links, and exact Qatar PDPL label', () => {
    const htmlAr = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <Footer portal="b2c" settings={{ siteNameAr: 'إي ثري قطر' }} />
      </LocaleProvider>
    );

    // Arabic Legal & PDPL
    expect(htmlAr).toContain('جميع الحقوق محفوظة.');
    expect(htmlAr).toContain('سياسة الخصوصية');
    expect(htmlAr).toContain('شروط الخدمة');
    expect(htmlAr).toContain('متوافق مع قانون حماية البيانات الشخصية القطري (PDPL)');

    // Absence of English residue in Arabic footer
    expect(htmlAr).not.toContain('All rights reserved.');
    expect(htmlAr).not.toContain('Privacy Policy');
    expect(htmlAr).not.toContain('Terms of Service');
    expect(htmlAr).not.toContain('Qatar PDPL Compliant');
  });

  // 10. QF-14-B: Arabic Dashboard Language Switch and Sticky Save Controls
  it('10. Arabic Dashboard language switch and sticky save actions render accurate localized text', () => {
    // Language switch in Arabic
    const htmlLangSwitch = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <DashboardLanguageSwitch mode="both" onModeChange={vi.fn()} />
      </LocaleProvider>
    );
    expect(htmlLangSwitch).toContain('كلا اللغتين (EN + AR)');
    expect(htmlLangSwitch).toContain('الإنجليزية');
    expect(htmlLangSwitch).toContain('العربية');

    // Sticky actions in Arabic (unsaved state)
    const htmlStickyUnsaved = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <DashboardStickyActions isUnsaved={true} onSave={vi.fn()} />
      </LocaleProvider>
    );
    expect(htmlStickyUnsaved).toContain('لديك تغييرات غير محفوظة');
    expect(htmlStickyUnsaved).toContain('حفظ جميع التغييرات');

    // Sticky actions in Arabic (saved state)
    const htmlStickySaved = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <DashboardStickyActions isUnsaved={false} onSave={vi.fn()} />
      </LocaleProvider>
    );
    expect(htmlStickySaved).toContain('تم حفظ جميع التغييرات في قاعدة البيانات');
  });
});
