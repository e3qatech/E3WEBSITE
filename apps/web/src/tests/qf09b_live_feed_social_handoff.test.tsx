import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LiveFeedManager } from '@/components/dashboard/b2c/content/LiveFeedManager';
import { LocaleProvider } from '@/components/layout/LocaleProvider';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/components/dashboard/ui/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/components/dashboard/ui/AdminMediaPicker', () => ({
  AdminMediaPicker: () => <div data-testid="admin-media-picker-mock" />,
}));

describe('QF-09-B: Live Feed Manager Social Media Manager Handoff & Localization', () => {
  function renderLiveFeed(locale: 'en' | 'ar') {
    return renderToStaticMarkup(
      <LocaleProvider defaultLocale={locale}>
        <LiveFeedManager />
      </LocaleProvider>
    );
  }

  it('1. English handoff renders correct label, localized href (/en/dashboard/social-media), and LTR direction', () => {
    const html = renderLiveFeed('en');

    // Check banner direction
    expect(html).toContain('dir="ltr"');

    // Check English label
    expect(html).toContain('Social Media Manager');
    expect(html).toContain('Canonical Social Media Manager Available');
    expect(html).toContain('System Boundary');

    // Check localized href (must be /en/dashboard/social-media, never bare /dashboard/social-media)
    expect(html).toContain('href="/en/dashboard/social-media"');
    expect(html).not.toMatch(/href="\/dashboard\/social-media"/);
  });

  it('2. Arabic handoff renders correct label, localized href (/ar/dashboard/social-media), and RTL direction', () => {
    const html = renderLiveFeed('ar');

    // Check banner direction
    expect(html).toContain('dir="rtl"');

    // Check Arabic label and text
    expect(html).toContain('إدارة التواصل الاجتماعي');
    expect(html).toContain('إدارة منصات التواصل الاجتماعي المركزية');
    expect(html).toContain('حدود النظام');

    // Check localized href (must be /ar/dashboard/social-media, never bare /dashboard/social-media)
    expect(html).toContain('href="/ar/dashboard/social-media"');
    expect(html).not.toMatch(/href="\/dashboard\/social-media"/);
  });
});
