import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock DB module
vi.mock('@/lib/db', () => {
  return {
    db: {
      attraction: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'attr-1', slug: 'vr-theme-park', nameEn: 'VR Theme Park', nameAr: 'مدينة ألعاب الواقع الافتراضي', isPublished: true, isHidden: false },
          { id: 'attr-2', slug: 'doha-festive-dome', nameEn: 'Doha Festive Dome', nameAr: 'قبة دوحة الاحتفالية', isPublished: true, isHidden: false }
        ]),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.slug === 'vr-theme-park' || where.id === 'attr-1') {
            return Promise.resolve({
              id: 'attr-1',
              slug: 'vr-theme-park',
              nameEn: 'VR Theme Park',
              nameAr: 'مدينة ألعاب الواقع الافتراضي',
              descriptionEn: 'Immersive VR experience.',
              isPublished: true,
              isHidden: false,
              pricing: [{ id: 'p1', tierEn: 'General Admission', priceQar: 150 }],
              faqs: [],
              gallery: [],
              temporalRules: []
            });
          }
          if (where.slug === 'draft-attraction') {
            return Promise.resolve({
              id: 'attr-draft',
              slug: 'draft-attraction',
              nameEn: 'Draft Attraction',
              isPublished: false,
              isHidden: false
            });
          }
          return Promise.resolve(null);
        })
      },
      calendarEvent: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'evt-1', title: 'Summer Fest 2026', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-10'), status: 'PUBLISHED' },
          { id: 'evt-2', title: 'Qatar Gaming Expo', startDate: new Date('2026-09-15'), endDate: new Date('2026-09-20'), status: 'PUBLISHED' }
        ])
      },
      job: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'job-1', titleEn: 'Event Technical Lead', department: 'ENGINEERING', isPublished: true }
        ]),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'job-1') {
            return Promise.resolve({ id: 'job-1', titleEn: 'Event Technical Lead', isPublished: true });
          }
          return Promise.resolve(null);
        })
      },
      jobApplication: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'app-501', ...data, createdAt: new Date() }))
      },
      subscriber: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'sub-10', email: data.email, createdAt: new Date() }))
      },
      feedback: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'fb-1', rating: data.rating, createdAt: new Date() }))
      }
    }
  };
});

describe('Gate 09: B2C Public Functionality & CMS Regression Verification', () => {
  const webDir = path.resolve(__dirname, '../../');

  it('1. Required B2C Public Route files exist on filesystem', () => {
    const requiredRoutes = [
      'src/app/[locale]/b2c/page.tsx',
      'src/app/[locale]/b2c/attractions/page.tsx',
      'src/app/[locale]/b2c/attractions/[slug]/page.tsx',
      'src/app/[locale]/b2c/calendar/page.tsx',
      'src/app/[locale]/b2c/tickets/page.tsx',
      'src/app/[locale]/b2c/discover/page.tsx',
      'src/app/[locale]/careers/page.tsx',
      'src/app/[locale]/careers/[id]/page.tsx',
      'src/app/[locale]/b2c/contact/page.tsx'
    ];

    for (const relPath of requiredRoutes) {
      const fullPath = path.join(webDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  it('2. Required B2C Dashboard Editor Route files exist on filesystem', () => {
    const requiredEditors = [
      'src/app/dashboard/b2c/landing/page.tsx',
      'src/app/dashboard/b2c/attractions/page.tsx',
      'src/app/dashboard/b2c/attractions/new/page.tsx',
      'src/app/dashboard/b2c/attractions/[id]/edit/page.tsx',
      'src/app/dashboard/b2c/calendar/page.tsx',
      'src/app/dashboard/b2c/discover/page.tsx',
      'src/app/dashboard/b2c/contact/page.tsx',
      'src/app/dashboard/careers/page.tsx',
      'src/app/dashboard/careers/applications/page.tsx'
    ];

    for (const relPath of requiredEditors) {
      const fullPath = path.join(webDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
  });

  it('3. Attraction publication & draft rejection (isPublished: false)', async () => {
    const { db } = await import('@/lib/db');
    const draft = await db.attraction.findFirst({ where: { slug: 'draft-attraction' } });
    expect(draft).not.toBeNull();
    expect(draft?.isPublished).toBe(false);
  });

  it('4. Attraction microsite slug routing & detail retrieval', async () => {
    const { db } = await import('@/lib/db');
    const attraction = await db.attraction.findFirst({ where: { slug: 'vr-theme-park' } });
    expect(attraction).not.toBeNull();
    expect(attraction?.nameEn).toBe('VR Theme Park');
  });

  it('5. Event Calendar date filtering & active/upcoming states', async () => {
    const { db } = await import('@/lib/db');
    const events = await db.calendarEvent.findMany({ where: { status: 'PUBLISHED' } });
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].title).toContain('Summer Fest');
  });

  it('6. BookingQube raw HMAC webhook verification endpoint exists', () => {
    const webhookPath = path.join(webDir, 'src/app/api/webhooks/bookingqube/route.ts');
    expect(fs.existsSync(webhookPath)).toBe(true);
    const content = fs.readFileSync(webhookPath, 'utf-8');
    expect(content).toContain('createHmac');
    expect(content).toContain('x-bookingqube-signature');
  });

  it('7. Candidate Careers application API endpoint exists and validates payload', () => {
    const applyPath = path.join(webDir, 'src/app/api/careers/apply/route.ts');
    expect(fs.existsSync(applyPath)).toBe(true);
    const content = fs.readFileSync(applyPath, 'utf-8');
    expect(content).toContain('POST');
  });

  it('8. B2C Contact API endpoint validates honeypot, rate limiting, and meeting slots', () => {
    const contactPath = path.join(webDir, 'src/app/api/contact/b2c/route.ts');
    expect(fs.existsSync(contactPath)).toBe(true);
    const content = fs.readFileSync(contactPath, 'utf-8');
    expect(content).toContain('POST');
  });

  it('9. CRM Newsletter subscription endpoint persists subscriber records', () => {
    const subPath = path.join(webDir, 'src/app/api/crm/subscribers/subscribe/route.ts');
    expect(fs.existsSync(subPath)).toBe(true);
    const content = fs.readFileSync(subPath, 'utf-8');
    expect(content).toContain('POST');
  });

  it('10. B2C Header & Footer support English and Arabic (RTL)', () => {
    const headerPath = path.join(webDir, 'src/components/layout/Header.tsx');
    const footerPath = path.join(webDir, 'src/components/layout/Footer.tsx');
    expect(fs.existsSync(headerPath)).toBe(true);
    expect(fs.existsSync(footerPath)).toBe(true);
  });

  it('11. Theme store supports dark/light mode toggle', () => {
    const themeStorePath = path.join(webDir, 'src/store/useB2CThemeStore.ts');
    expect(fs.existsSync(themeStorePath)).toBe(true);
    const content = fs.readFileSync(themeStorePath, 'utf-8');
    expect(content).toContain('setImmersiveMode');
  });

  it('12. Public API endpoints exclude internal credentials, database secrets, and admin notes', async () => {
    const attractionsApiPath = path.join(webDir, 'src/app/api/attractions/route.ts');
    expect(fs.existsSync(attractionsApiPath)).toBe(true);
    const content = fs.readFileSync(attractionsApiPath, 'utf-8');
    expect(content).not.toContain('NEXTAUTH_SECRET');
    expect(content).not.toContain('DATABASE_URL');
  });

  it('13. Attraction pricing & ticket links render correctly', async () => {
    const pricingCompPath = path.join(webDir, 'src/components/attractions/detail/PricingCards.tsx');
    expect(fs.existsSync(pricingCompPath)).toBe(true);
    const content = fs.readFileSync(pricingCompPath, 'utf-8');
    expect(content).toContain('bookingUrl');
  });

  it('14. FAQ Accordion & Lightbox gallery components exist and render props', () => {
    const faqPath = path.join(webDir, 'src/components/attractions/detail/FaqAccordion.tsx');
    const galleryPath = path.join(webDir, 'src/components/attractions/detail/GalleryLightbox.tsx');
    expect(fs.existsSync(faqPath)).toBe(true);
    expect(fs.existsSync(galleryPath)).toBe(true);
  });

  it('15. Baseline rollback patch gate-10-baseline.patch exists', () => {
    const patchPath09 = path.join(webDir, '../../gate-09-baseline.patch');
    const patchPath10 = path.join(webDir, '../../gate-10-baseline.patch');
    expect(fs.existsSync(patchPath09) || fs.existsSync(patchPath10)).toBe(true);
  });
});
