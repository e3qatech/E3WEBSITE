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
import nextConfig from '../../next.config';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  permanentRedirect: vi.fn((url: string) => {
    const error = new Error(`NEXT_REDIRECT: 308/301 to ${url}`);
    (error as any).digest = `NEXT_REDIRECT;replace;${url};308;`;
    throw error;
  }),
  notFound: vi.fn(() => {
    const error = new Error('NEXT_NOT_FOUND');
    (error as any).digest = 'NEXT_NOT_FOUND';
    throw error;
  }),
}));

describe('QF-13-C: Balloon Parade Case-Study Consolidation & 301 Redirect Guardrails', () => {
  // Fixture representing post-consolidation live state
  const postConsolidationFixture = [
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
      id: 'cms8cp8e7000090rn4zyp9h5d',
      slug: 'doha-balloon-parade-2022',
      titleEn: 'DOHA BALLOON PARADE 2022',
      titleAr: 'استعراض بالونات الدوحة 2022',
      clientName: 'Visit Qatar',
      year: 2022,
      category: 'Mega Events',
      isFeatured: true,
      isPublished: true,
      attractionId: 'cmsrbcjh90000mwwc6hgg4agx',
      metrics: [
        { labelEn: 'Attendees', valueEn: '760,000+' },
        { labelEn: 'Parade Route', valueEn: '3 KM' },
      ],
    },
    {
      id: 'cmqwzkn6200072opctgzr29o2',
      slug: 'doha-balloon-parade',
      titleEn: 'Doha Balloon Parade',
      titleAr: 'موكب بالونات الدوحة',
      clientName: 'E3 Owned & Operated',
      year: 2024,
      category: 'Corporate',
      isFeatured: false,
      isPublished: false, // Archived duplicate
      seo: {
        isArchived: true,
        archivedReason: 'DUPLICATE_CONSOLIDATION_QF13C',
        canonicalSlug: 'doha-balloon-parade-2022',
        canonicalId: 'cms8cp8e7000090rn4zyp9h5d',
        redirectTarget: '/b2b/cases/doha-balloon-parade-2022',
      },
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

  // 2. Post-Consolidation Status Audit
  it('2. Audit classifies canonical record as CANONICAL_MASTER and duplicate as ARCHIVED_DUPLICATE', () => {
    const auditMap = auditCaseStudyDuplicates(postConsolidationFixture);

    const parade2022 = auditMap.get('doha-balloon-parade-2022');
    const paradeArchived = auditMap.get('doha-balloon-parade');
    const urbanArena = auditMap.get('case-urban-arena');

    expect(parade2022?.status).toBe('CANONICAL_MASTER');
    expect(parade2022?.reasonEn).toContain('Canonical project master record');

    expect(paradeArchived?.status).toBe('ARCHIVED_DUPLICATE');
    expect(paradeArchived?.matchedSlug).toBe('doha-balloon-parade-2022');
    expect(paradeArchived?.reasonEn).toContain('301 redirects to /doha-balloon-parade-2022');

    expect(urbanArena?.status).toBe('UNIQUE');
  });

  // 3. Multi-year recurring edition distinction
  it('3. Audit flags distinct non-overlapping annual editions as RECURRING_EDITION rather than duplicate', () => {
    const multiEditionFixture = [
      {
        id: 'cs-eid-2022',
        slug: 'eid-festival-2022',
        titleEn: 'Eid Festival 2022',
        clientName: 'Qatar National Tourism',
        year: 2022,
        metrics: { visitors: 300000 },
      },
      {
        id: 'cs-eid-2023',
        slug: 'eid-festival-2023',
        titleEn: 'Eid Festival 2023',
        clientName: 'Qatar National Tourism',
        year: 2023,
        metrics: { visitors: 550000 },
      },
    ];

    const auditMap = auditCaseStudyDuplicates(multiEditionFixture);
    expect(auditMap.get('eid-festival-2022')?.status).toBe('RECURRING_EDITION');
    expect(auditMap.get('eid-festival-2023')?.status).toBe('RECURRING_EDITION');
  });

  // 4. Public Eligibility: Canonical is eligible, archived duplicate is strictly excluded
  it('4. Public predicate isCaseStudyEligible returns true for canonical and false for archived duplicate', () => {
    const eligible = postConsolidationFixture.filter(isCaseStudyEligible);
    expect(eligible).toHaveLength(2); // Only urban arena and canonical balloon parade
    expect(eligible.map((c) => c.slug)).toEqual([
      'case-urban-arena',
      'doha-balloon-parade-2022',
    ]);
    expect(eligible.some((c) => c.slug === 'doha-balloon-parade')).toBe(false);
  });

  // 5. Next.js Redirects Config: Exact HTTP 301 permanent redirects configured for EN and AR
  it('5. Next.js configuration defines exact 301 permanent redirect rules for balloon parade duplicate', async () => {
    const redirectsFn = nextConfig.redirects;
    expect(redirectsFn).toBeDefined();

    const redirects = await (redirectsFn ? redirectsFn() : []);
    const balloonParadeLocalizedRedirect = redirects.find(
      (r: any) => r.source === '/:locale(en|ar)/b2b/cases/doha-balloon-parade'
    );
    const balloonParadeBareRedirect = redirects.find(
      (r: any) => r.source === '/b2b/cases/doha-balloon-parade'
    );

    expect(balloonParadeLocalizedRedirect).toBeDefined();
    expect(balloonParadeLocalizedRedirect?.destination).toBe('/:locale/b2b/case-studies/doha-balloon-parade-2022');
    expect(balloonParadeLocalizedRedirect?.permanent).toBe(true);

    expect(balloonParadeBareRedirect).toBeDefined();
    expect(balloonParadeBareRedirect?.destination).toBe('/en/b2b/case-studies/doha-balloon-parade-2022');
    expect(balloonParadeBareRedirect?.permanent).toBe(true);
  });

  // 6. Rendered English Manager: Shows Canonical Master and Archived Duplicate badges (LTR)
  it('6. Rendered English manager displays Canonical Master and Archived (301) badges with LTR layout', () => {
    const html = renderToStaticMarkup(
      <LocaleProvider defaultLocale="en">
        <CasesListClient initialData={postConsolidationFixture} />
      </LocaleProvider>
    );

    expect(html).toContain('dir="ltr"');
    expect(html).toContain('Canonical Master');
    expect(html).toContain('Archived (301 → /doha-balloon-parade-2022)');
    expect(html).toContain('Archived (Staff)');
    expect(html).toContain('href="/en/b2b/case-studies/doha-balloon-parade-2022"');
    expect(html).toContain('href="/en/dashboard/b2b/cases/doha-balloon-parade"'); // Staff can still edit archived record
  });

  // 7. Rendered Arabic Manager: Shows Canonical Master and Archived Duplicate badges (RTL)
  it('7. Rendered Arabic manager displays Arabic badges and RTL layout', () => {
    const html = renderToStaticMarkup(
      <LocaleProvider defaultLocale="ar">
        <CasesListClient initialData={postConsolidationFixture} />
      </LocaleProvider>
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('النسخة الأساسية المعتمدة');
    expect(html).toContain('مؤرشف (301 → /doha-balloon-parade-2022)');
    expect(html).toContain('مؤرشف (للموظفين)');
    expect(html).toContain('href="/ar/b2b/case-studies/doha-balloon-parade-2022"');
  });
});
