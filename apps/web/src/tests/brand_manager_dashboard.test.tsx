import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrandManagerClient } from '@/components/dashboard/brands/BrandManagerClient';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en/dashboard/brands',
}));

// Mock LocaleProvider
vi.mock('@/components/layout/LocaleProvider', () => ({
  useLocale: () => ({ locale: 'en', dir: 'ltr' }),
}));

// Mock MediaUploader
vi.mock('@/components/shared/MediaUploader', () => ({
  MediaUploader: ({ value }: any) => (
    <div data-testid="media-uploader">{value || ''}</div>
  ),
}));

describe('BrandManagerClient Dashboard', () => {
  const mockCategories = [
    { id: 'cat-1', slug: 'entertainment', nameEn: 'Entertainment', nameAr: 'ترفيه' },
    { id: 'cat-2', slug: 'ticketing', nameEn: 'Ticketing', nameAr: 'تذاكر' },
  ];

  const mockBrands = [
    {
      id: 'brand-1',
      slug: 'bookingqube',
      nameEn: 'BookingQube',
      nameAr: 'بوكينج كيوب',
      taglineEn: 'Proprietary Ticketing Engine',
      taglineAr: 'منظومة حجز التذاكر',
      shortDescriptionEn: 'Digital ticketing platform powering all E3 venues.',
      shortDescriptionAr: 'منظومة التذاكر الرقمية.',
      primaryLogoUrl: 'https://cdn.e3.qa/bookingqube.png',
      isActive: true,
      showOnB2C: true,
      showOnB2B: true,
      lifecycleStatus: 'ACTIVE',
      categoryId: 'cat-2',
      category: mockCategories[1],
    },
    {
      id: 'brand-2',
      slug: 'inflatarun',
      nameEn: 'InflataRUN',
      nameAr: 'إنفلاتارن',
      taglineEn: 'Guinness World Record Park',
      taglineAr: 'منتزه الأرقام القياسية',
      shortDescriptionEn: '1055-meter inflatable obstacle course.',
      shortDescriptionAr: 'مضمار العقبات الترفيهي.',
      primaryLogoUrl: 'https://cdn.e3.qa/inflatarun.png',
      isActive: true,
      showOnB2C: true,
      showOnB2B: false,
      lifecycleStatus: 'ACTIVE',
      categoryId: 'cat-1',
      category: mockCategories[0],
    },
  ];

  it('renders brand statistics, cards, and categories properly', () => {
    const html = renderToStaticMarkup(
      <BrandManagerClient initialBrands={mockBrands} categories={mockCategories} />
    );

    expect(html).toContain('Brand &amp; IP Management');
    expect(html).toContain('BookingQube');
    expect(html).toContain('InflataRUN');
    expect(html).toContain('Total Brands');
    expect(html).toContain('Active in B2C');
    expect(html).toContain('Active in B2B');
  });

  it('contains search and filter elements', () => {
    const html = renderToStaticMarkup(
      <BrandManagerClient initialBrands={mockBrands} categories={mockCategories} />
    );

    expect(html).toContain('Search brands, taglines, slugs...');
    expect(html).toContain('All Portals');
    expect(html).toContain('B2C');
    expect(html).toContain('B2B');
  });
});
