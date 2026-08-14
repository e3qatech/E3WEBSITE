import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CMSPagesClient } from '@/components/dashboard/cms/CMSPagesClient';
import { LocaleProvider } from '@/components/layout/LocaleProvider';

vi.mock('@/components/dashboard/ui/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('QF-10-B: CMS Pages Index Localization, Managed Handoff, and Generic Editing Isolation', () => {
  const samplePages = [
    { id: '1', slug: 'b2c-landing', status: 'PUBLISHED', updatedAt: '2026-08-14T12:00:00Z' },
    { id: '2', slug: 'b2c-discover', status: 'PUBLISHED', updatedAt: '2026-08-14T12:00:00Z' },
    { id: '3', slug: 'b2b-home', status: 'PUBLISHED', updatedAt: '2026-08-14T12:00:00Z' },
    { id: '4', slug: 'b2b-services', status: 'PUBLISHED', updatedAt: '2026-08-14T12:00:00Z' },
    { id: '5', slug: 'b2b-cases', status: 'PUBLISHED', updatedAt: '2026-08-14T12:00:00Z' },
    { id: '6', slug: 'pulse-orbit', status: 'PUBLISHED', updatedAt: '2026-08-14T12:00:00Z' },
    { id: '7', slug: 'privacy-policy', status: 'PUBLISHED', updatedAt: '2026-08-14T12:00:00Z' },
  ];

  function renderCMSPages(locale: 'en' | 'ar', initialPages = samplePages) {
    return renderToStaticMarkup(
      <LocaleProvider defaultLocale={locale}>
        <CMSPagesClient initialPages={initialPages} initialLoading={false} />
      </LocaleProvider>
    );
  }

  // 1. English Index & Links
  it('1. English CMS Index: Managed pages show only "Open Editor" with /en/... links and no Raw JSON', () => {
    const html = renderCMSPages('en');

    // Direction & Page Title
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('CMS Pages &amp; Content Registry');
    expect(html).toContain('Create New Page');

    // Managed Links (must be prefixed with /en/ and never bare /dashboard/...)
    expect(html).toContain('href="/en/dashboard/b2c/landing"');
    expect(html).toContain('href="/en/dashboard/b2c/discover"');
    expect(html).toContain('href="/en/dashboard/b2b/home"');
    expect(html).toContain('href="/en/dashboard/b2b/services-page"');
    expect(html).toContain('href="/en/dashboard/b2b/cases-page"');
    expect(html).toContain('href="/en/dashboard/b2c/pulse-orbit"');

    // Managed rows must NOT have "Raw JSON" button
    expect(html).not.toContain('Raw JSON');

    // Unmanaged generic page (privacy-policy) has Edit Page button
    expect(html).toContain('Edit Page');
    expect(html).toContain('/privacy-policy');
  });

  // 2. Arabic Index & Localized RTL Links
  it('2. Arabic CMS Index: Localized in Arabic, RTL direction, Arabic labels, and /ar/... links', () => {
    const html = renderCMSPages('ar');

    // Direction & Arabic Title
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('سجل صفحات ومحتوى الموقع (CMS)');
    expect(html).toContain('إنشاء صفحة جديدة');

    // Arabic table headers
    expect(html).toContain('الصفحة / المسار');
    expect(html).toContain('نوع المحرر');
    expect(html).toContain('الحالة');
    expect(html).toContain('آخر تحديث');
    expect(html).toContain('الإجراءات');

    // Arabic Button labels
    expect(html).toContain('فتح المحرر');
    expect(html).toContain('تعديل الصفحة');

    // Arabic Managed Links (must be prefixed with /ar/ and never bare /dashboard/...)
    expect(html).toContain('href="/ar/dashboard/b2c/landing"');
    expect(html).toContain('href="/ar/dashboard/b2c/discover"');
    expect(html).toContain('href="/ar/dashboard/b2b/home"');
    expect(html).toContain('href="/ar/dashboard/b2b/services-page"');
    expect(html).toContain('href="/ar/dashboard/b2b/cases-page"');
    expect(html).toContain('href="/ar/dashboard/b2c/pulse-orbit"');

    // Managed rows must NOT have "Raw JSON" button
    expect(html).not.toContain('Raw JSON');
  });

  // 3. Link matrix completeness check
  it('3. Every specialized link accurately preserves the active locale (/en/ and /ar/)', () => {
    const enHtml = renderCMSPages('en');
    const arHtml = renderCMSPages('ar');

    const expectedSlugsAndPaths = [
      { slug: 'b2c-landing', path: '/dashboard/b2c/landing' },
      { slug: 'b2c-discover', path: '/dashboard/b2c/discover' },
      { slug: 'b2b-home', path: '/dashboard/b2b/home' },
      { slug: 'b2b-services', path: '/dashboard/b2b/services-page' },
      { slug: 'b2b-cases', path: '/dashboard/b2b/cases-page' },
      { slug: 'pulse-orbit', path: '/dashboard/b2c/pulse-orbit' },
    ];

    for (const item of expectedSlugsAndPaths) {
      expect(enHtml).toContain(`href="/en${item.path}"`);
      expect(arHtml).toContain(`href="/ar${item.path}"`);
      expect(enHtml).not.toMatch(new RegExp(`href="${item.path}"`));
      expect(arHtml).not.toMatch(new RegExp(`href="${item.path}"`));
    }
  });
});
