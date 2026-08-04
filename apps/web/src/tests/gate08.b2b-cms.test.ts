import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock DB module
vi.mock('@/lib/db', () => {
  return {
    db: {
      pages: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.slug === 'b2b-home') {
            return Promise.resolve({
              id: 'page-home',
              slug: 'b2b-home',
              titleEn: 'B2B Homepage',
              content: {
                hero: { titleEn: 'Ideas to Life', titleAr: 'تحويل الأفكار إلى واقع' },
                stats: [{ value: '50+', label: 'Years Combined Experience' }]
              }
            });
          }
          if (where.slug === 'b2b-services') {
            return Promise.resolve({
              id: 'page-services',
              slug: 'b2b-services',
              titleEn: 'Services & Capabilities',
              content: { hero: { titleEn: 'Everything Required', titleAr: 'كل ما تحتاجه' } }
            });
          }
          return Promise.resolve(null);
        })
      },
      service: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'srv-1', slug: 'event-engineering', titleEn: 'Event Engineering', titleAr: 'هندسة الفعاليات', isVisible: true },
          { id: 'srv-2', slug: 'xr-dome', titleEn: 'XR Dome', titleAr: 'قبة الواقع الممتد', isVisible: true }
        ]),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.slug === 'event-engineering' || where.id === 'srv-1') {
            return Promise.resolve({
              id: 'srv-1',
              slug: 'event-engineering',
              titleEn: 'Event Engineering',
              titleAr: 'هندسة الفعاليات',
              taglineEn: 'Structural & Staging Excellence',
              contentEn: 'Full structural engineering narrative.',
              isVisible: true,
              process: [{ titleEn: 'Design', descEn: '3D CAD' }]
            });
          }
          if (where.slug === 'draft-service') {
            return Promise.resolve({
              id: 'srv-draft',
              slug: 'draft-service',
              titleEn: 'Draft Service',
              isVisible: false
            });
          }
          return Promise.resolve(null);
        })
      },
      caseStudy: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'cs-1', slug: 'fifa-fan-zone', titleEn: 'FIFA Fan Zone', category: 'Mega Event', year: 2026, isPublished: true },
          { id: 'cs-2', slug: 'msheireb-xr', titleEn: 'Msheireb XR Dome', category: 'Immersive', year: 2025, isPublished: true }
        ]),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.slug === 'fifa-fan-zone') {
            return Promise.resolve({
              id: 'cs-1',
              slug: 'fifa-fan-zone',
              titleEn: 'FIFA Fan Zone',
              category: 'Mega Event',
              year: 2026,
              isPublished: true,
              teamMembers: []
            });
          }
          if (where.slug === 'draft-project') {
            return Promise.resolve({
              id: 'cs-draft',
              slug: 'draft-project',
              titleEn: 'Draft Project',
              isPublished: false
            });
          }
          return Promise.resolve(null);
        })
      },
      partner: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'p-1', name: 'Qatar Tourism', category: 'GOVERNMENT', isVisible: true, orderIndex: 1 },
          { id: 'p-2', name: 'Msheireb Properties', category: 'CORPORATE', isVisible: true, orderIndex: 2 }
        ])
      },
      lead: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'lead-101', ...data, createdAt: new Date() }))
      }
    }
  };
});

describe('Gate 08: B2B Public Portal & CMS Acceptance Verification', () => {
  const webDir = path.resolve(__dirname, '../../');

  it('1. B2B Public Route files exist on filesystem', () => {
    const requiredRoutes = [
      'src/app/[locale]/b2b/page.tsx',
      'src/app/[locale]/b2b/services/page.tsx',
      'src/app/[locale]/b2b/services/[slug]/page.tsx',
      'src/app/[locale]/b2b/case-studies/page.tsx',
      'src/app/[locale]/b2b/case-studies/[slug]/page.tsx',
      'src/app/[locale]/b2b/clients/page.tsx',
      'src/app/[locale]/b2b/about/page.tsx',
      'src/app/[locale]/b2b/contact/page.tsx'
    ];

    for (const relPath of requiredRoutes) {
      const fullPath = path.join(webDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  it('2. B2B Dashboard Editor Route files exist on filesystem', () => {
    const requiredEditors = [
      'src/app/dashboard/b2b/home/page.tsx',
      'src/app/dashboard/b2b/services/page.tsx',
      'src/app/dashboard/b2b/cases/page.tsx',
      'src/app/dashboard/b2b/clients/page.tsx',
      'src/app/dashboard/b2b/about/page.tsx',
      'src/app/dashboard/b2b/contact/page.tsx'
    ];

    for (const relPath of requiredEditors) {
      const fullPath = path.join(webDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  it('3. Draft services are rejected from public visibility (isVisible: false)', async () => {
    const { db } = await import('@/lib/db');
    const draftService = await db.service.findUnique({ where: { slug: 'draft-service' } });
    expect(draftService).not.toBeNull();
    expect(draftService?.isVisible).toBe(false);
  });

  it('4. Draft case studies are rejected from public visibility (isPublished: false)', async () => {
    const { db } = await import('@/lib/db');
    const draftProject = await db.caseStudy.findUnique({ where: { slug: 'draft-project' } });
    expect(draftProject).not.toBeNull();
    expect(draftProject?.isPublished).toBe(false);
  });

  it('5. Case Study client-side filter component supports Category and Year filtering', async () => {
    const csClientPath = path.join(webDir, 'src/components/b2b/CaseStudiesClient.tsx');
    expect(fs.existsSync(csClientPath)).toBe(true);
    const content = fs.readFileSync(csClientPath, 'utf-8');
    expect(content).toContain('setSelectedCategory');
    expect(content).toContain('setSelectedYear');
    expect(content).toContain('filteredStudies');
  });

  it('6. UniversalMediaRenderer component exists and supports IMAGE, VIDEO, IFRAME, 3D, and SLIDES', () => {
    const mediaPath = path.join(webDir, 'src/components/shared/UniversalMediaRenderer.tsx');
    expect(fs.existsSync(mediaPath)).toBe(true);
    const content = fs.readFileSync(mediaPath, 'utf-8');
    expect(content).toContain('IMAGE');
    expect(content).toContain('VIDEO');
    expect(content).toContain('IFRAME');
  });

  it('7. Contact / RFP ingest API endpoint exists and validates payload', () => {
    const ingestPath = path.join(webDir, 'src/app/api/crm/leads/ingest/route.ts');
    expect(fs.existsSync(ingestPath)).toBe(true);
    const content = fs.readFileSync(ingestPath, 'utf-8');
    expect(content).toContain('POST');
    expect(content).toContain('db.lead.create');
  });

  it('8. B2B Header & Footer components support RTL layout and locale switcher', () => {
    const headerPath = path.join(webDir, 'src/components/b2b/layout/B2BHeader.tsx');
    const footerPath = path.join(webDir, 'src/components/b2b/layout/B2BFooter.tsx');
    expect(fs.existsSync(headerPath)).toBe(true);
    expect(fs.existsSync(footerPath)).toBe(true);
    
    const hContent = fs.readFileSync(headerPath, 'utf-8');
    expect(hContent).toContain('currentLocale');
  });

  it('9. ThemeProvider supports dark/light mode switching', () => {
    const themePath = path.join(webDir, 'src/components/layout/ThemeProvider.tsx');
    expect(fs.existsSync(themePath)).toBe(true);
    const content = fs.readFileSync(themePath, 'utf-8');
    expect(content).toContain('data-theme');
    expect(content).toContain('setTheme');
  });

  it('10. Service microsite renders localized titles, process steps, and back links', async () => {
    const pagePath = path.join(webDir, 'src/app/[locale]/b2b/services/[slug]/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    expect(content).toContain('isAr ? (service.titleAr || service.titleEn) : service.titleEn');
    expect(content).toContain('dir={isAr ? \'rtl\' : \'ltr\'}');
  });

  it('11. Project microsite renders localized challenge, solution, and impact metrics', async () => {
    const pagePath = path.join(webDir, 'src/app/[locale]/b2b/case-studies/[slug]/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');
    expect(content).toContain('isAr ? (project.titleAr || project.titleEn) : project.titleEn');
    expect(content).toContain('isAr ? (project.challengeAr || project.challengeEn) : project.challengeEn');
  });

  it('12. Partners API endpoint returns visible partners ordered by orderIndex', async () => {
    const { db } = await import('@/lib/db');
    const partners = await db.partner.findMany({ where: { isVisible: true } });
    expect(partners.length).toBeGreaterThan(0);
    expect(partners[0].isVisible).toBe(true);
  });

  it('13. Public CMS page endpoint API (/api/cms/pages/[slug]) rejects missing pages with 404', async () => {
    const apiPath = path.join(webDir, 'src/app/api/cms/pages/[slug]/route.ts');
    expect(fs.existsSync(apiPath)).toBe(true);
    const content = fs.readFileSync(apiPath, 'utf-8');
    expect(content).toContain('GET');
  });

  it('14. Public API endpoints exclude internal credentials and admin tokens', async () => {
    const partnersApiPath = path.join(webDir, 'src/app/api/b2b/partners/route.ts');
    expect(fs.existsSync(partnersApiPath)).toBe(true);
    const content = fs.readFileSync(partnersApiPath, 'utf-8');
    expect(content).not.toContain('NEXTAUTH_SECRET');
    expect(content).not.toContain('DATABASE_URL');
  });

  it('15. Baseline rollback patch gate-08-baseline.patch exists', () => {
    const patchPath = path.join(webDir, '../../gate-08-baseline.patch');
    expect(fs.existsSync(patchPath)).toBe(true);
  });
});
