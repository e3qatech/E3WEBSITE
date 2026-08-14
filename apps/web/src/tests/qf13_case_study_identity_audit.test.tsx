import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { CasesListClient } from '@/components/dashboard/b2b/CasesListClient';
import {
  auditCaseStudyDuplicates,
  normalizeCaseStudyTitle,
} from '@/lib/case-study-identity-audit';
import { isCaseStudyEligible } from '@/lib/case-studies';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('QF-13: Duplicate Case-Study Identity Audit & Guardrails', () => {
  const publishedCasesFixture = [
    {
      id: 'cs-1',
      slug: 'case-urban-arena',
      titleEn: 'Urban Arena Stage Construction',
      titleAr: 'إنشاء مسرح أوربان أرينا',
      clientName: 'Private Enterprise',
      year: 2023,
      category: 'Venue Engineering',
      isFeatured: true,
      isPublished: true,
      metrics: { attendees: 120000 },
    },
    {
      id: 'cs-2',
      slug: 'doha-balloon-parade-2022',
      titleEn: 'Doha Balloon Parade 2022',
      titleAr: 'استعراض بالونات الدوحة 2022',
      clientName: 'Qatar Tourism',
      year: 2022,
      category: 'Festival & Parade',
      isFeatured: true,
      isPublished: true,
      metrics: { visitors: 760000, balloons: 50 },
    },
    {
      id: 'cs-3',
      slug: 'doha-balloon-parade',
      titleEn: 'Doha Balloon Parade',
      titleAr: 'موكب بالونات الدوحة',
      clientName: 'Qatar Tourism',
      year: 2022,
      category: 'Festival & Parade',
      isFeatured: true,
      isPublished: true,
      metrics: { visitors: 760000, staff: 2500 },
    },
    {
      id: 'cs-draft',
      slug: 'confidential-draft',
      titleEn: 'Confidential Draft',
      titleAr: 'مسودة سرية',
      clientName: 'Confidential',
      year: 2025,
      isPublished: false,
      status: 'DRAFT',
    },
  ];

  // 1. Normalization & Detection Engine
  it('1. Title normalization cleanly extracts root identifiers regardless of year or punctuation', () => {
    expect(normalizeCaseStudyTitle('Doha Balloon Parade 2022')).toBe('doha balloon parade');
    expect(normalizeCaseStudyTitle('Doha Balloon Parade')).toBe('doha balloon parade');
    expect(normalizeCaseStudyTitle('Urban Arena Stage Construction!')).toBe('urban arena stage construction');
  });

  it('2. Audit detects duplicate representation between doha-balloon-parade and doha-balloon-parade-2022', () => {
    const auditMap = auditCaseStudyDuplicates(publishedCasesFixture);

    const parade2022 = auditMap.get('doha-balloon-parade-2022');
    const paradeRoot = auditMap.get('doha-balloon-parade');
    const urbanArena = auditMap.get('case-urban-arena');

    expect(parade2022?.status).toBe('POTENTIAL_DUPLICATE');
    expect(parade2022?.matchedSlug).toBe('doha-balloon-parade');
    expect(parade2022?.suggestedAction).toBe('REVIEW_DUPLICATE_CONSOLIDATION');

    expect(paradeRoot?.status).toBe('POTENTIAL_DUPLICATE');
    expect(paradeRoot?.matchedSlug).toBe('doha-balloon-parade-2022');

    expect(urbanArena?.status).toBe('UNIQUE');
    expect(urbanArena?.suggestedAction).toBe('NONE');
  });

  // 3. Multi-year recurring edition distinction
  it('3. Audit flags distinct multi-year annual editions as RECURRING_EDITION rather than exact duplicate', () => {
    const multiEditionFixture = [
      {
        id: 'cs-2022',
        slug: 'doha-balloon-parade-2022',
        titleEn: 'Doha Balloon Parade 2022',
        clientName: 'Qatar Tourism',
        year: 2022,
        metrics: { visitors: 500000 },
      },
      {
        id: 'cs-2023',
        slug: 'doha-balloon-parade-2023',
        titleEn: 'Doha Balloon Parade 2023',
        clientName: 'Qatar Tourism',
        year: 2023,
        metrics: { visitors: 900000 },
      },
    ];

    const auditMap = auditCaseStudyDuplicates(multiEditionFixture);
    expect(auditMap.get('doha-balloon-parade-2022')?.status).toBe('RECURRING_EDITION');
    expect(auditMap.get('doha-balloon-parade-2023')?.status).toBe('RECURRING_EDITION');
  });

  // 4. Public Eligibility & Unchanged Visible IDs
  it('4. Preserves all 3 published case studies as eligible under QF-05 rules and excludes drafts', () => {
    const eligible = publishedCasesFixture.filter(isCaseStudyEligible);
    expect(eligible).toHaveLength(3);
    expect(eligible.map((c) => c.slug)).toEqual([
      'case-urban-arena',
      'doha-balloon-parade-2022',
      'doha-balloon-parade',
    ]);
  });

  // 5. Rendered English Cases List & Non-destructive Warnings
  it('5. Rendered English manager displays non-destructive duplicate warning badge and LTR layout', () => {
    const html = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <CasesListClient initialData={publishedCasesFixture} />
      </LocaleProvider>
    );

    expect(html).toContain('dir="ltr"');
    expect(html).toContain('Identity &amp; Edition Audit');
    expect(html).toContain('Duplicate / Edition with /doha-balloon-parade-2022');
    expect(html).toContain('Duplicate / Edition with /doha-balloon-parade');
    expect(html).toContain('href="/en/b2b/cases/doha-balloon-parade-2022"');
    expect(html).toContain('href="/en/b2b/cases/doha-balloon-parade"');
    expect(html).toContain('href="/en/b2b/cases/case-urban-arena"');
  });

  // 6. Rendered Arabic Cases List & Non-destructive Warnings (RTL)
  it('6. Rendered Arabic manager displays non-destructive duplicate warning badge in Arabic and RTL layout', () => {
    const html = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <CasesListClient initialData={publishedCasesFixture} />
      </LocaleProvider>
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('حالة الهوية / التكرار');
    expect(html).toContain('تطابق محتمل مع /doha-balloon-parade-2022');
    expect(html).toContain('تطابق محتمل مع /doha-balloon-parade');
    expect(html).toContain('href="/ar/b2b/cases/doha-balloon-parade-2022"');
    expect(html).toContain('href="/ar/b2b/cases/doha-balloon-parade"');
  });
});
