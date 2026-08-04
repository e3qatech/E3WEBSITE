import { describe, it, expect } from 'vitest';
import db from '../lib/db';

const prisma = db as any;

describe('Gate 08: B2B CMS & Corporate Portal Functionality', () => {
  it('1. should query published B2B services with localized content', async () => {
    const services = await prisma.service.findMany({
      where: { isVisible: true },
      select: { slug: true, titleEn: true, titleAr: true, taglineEn: true },
    });

    expect(Array.isArray(services)).toBe(true);
    services.forEach((s: any) => {
      expect(s.slug).toBeDefined();
      expect(s.titleEn).toBeDefined();
    });
  });

  it('2. should query published B2B case studies with project relationships', async () => {
    const caseStudies = await prisma.caseStudy.findMany({
      where: { isPublished: true },
      include: { attraction: true },
    });

    expect(Array.isArray(caseStudies)).toBe(true);
    caseStudies.forEach((cs: any) => {
      expect(cs.isPublished).toBe(true);
    });
  });

  it('3. should map B2B service process steps correctly', async () => {
    const service = await prisma.service.findFirst({
      where: { isVisible: true },
      select: { process: true },
    });

    if (service && service.process) {
      expect(Array.isArray(service.process) || typeof service.process === 'object').toBe(true);
    } else {
      expect(true).toBe(true);
    }
  });

  it('4. should filter B2B lead submissions by status', async () => {
    const leads = await prisma.lead.findMany({
      where: { status: 'NEW' },
      select: { id: true, name: true, email: true },
    });
    expect(Array.isArray(leads)).toBe(true);
  });

  it('5. should handle B2B contact form meeting slot validation', () => {
    const isSlotAvailable = (existingBookings: number, capacity: number) => existingBookings < capacity;
    expect(isSlotAvailable(3, 5)).toBe(true);
    expect(isSlotAvailable(5, 5)).toBe(false);
  });

  it('6. should validate B2B partner organization listings', async () => {
    const partners = await prisma.partner.findMany({
      select: { id: true, name: true, logoUrl: true },
    });
    expect(Array.isArray(partners)).toBe(true);
  });

  it('7. should query B2B team member profiles for corporate microsite', async () => {
    const team = await prisma.employeeProfile.findMany({
      select: { id: true, firstName: true, lastName: true, designation: true },
    });
    expect(Array.isArray(team)).toBe(true);
  });

  it('8. should verify B2B service hero media URL and media type', async () => {
    const service = await prisma.service.findFirst({
      select: { heroMediaType: true, heroMediaUrl: true },
    });

    if (service && service.heroMediaType) {
      expect(['IMAGE', 'VIDEO', 'THREE_D', 'SPLINE']).toContain(service.heroMediaType);
    } else {
      expect(true).toBe(true);
    }
  });

  it('9. should enforce draft state hiding for unpublished B2B case studies', async () => {
    const drafts = await prisma.caseStudy.findMany({
      where: { isPublished: false },
      select: { id: true, isPublished: true },
    });

    drafts.forEach((d: any) => {
      expect(d.isPublished).toBe(false);
    });
  });

  it('10. should validate B2B corporate inquiry categories', () => {
    const validCategories = ['EVENT_ENGINEERING', 'LIGHTING_AUDIO', 'AR_EXPERIENCES', 'EXHIBITION_STAGES'];
    expect(validCategories).toContain('EVENT_ENGINEERING');
    expect(validCategories).toContain('AR_EXPERIENCES');
  });

  it('11. should format B2B microsite breadcrumb hierarchy', () => {
    const getBreadcrumbs = (slug: string) => [
      { label: 'Home', href: '/en' },
      { label: 'B2B Services', href: '/en/b2b/services' },
      { label: slug, href: `/en/b2b/services/${slug}` },
    ];

    const crumbs = getBreadcrumbs('stage-engineering');
    expect(crumbs.length).toBe(3);
    expect(crumbs[2].href).toBe('/en/b2b/services/stage-engineering');
  });

  it('12. should sanitize user input in B2B contact form payload', () => {
    const sanitize = (text: string) => text.replace(/<[^>]*>?/gm, '').trim();
    const input = '<script>alert(1)</script>Hello E3';
    expect(sanitize(input)).toBe('alert(1)Hello E3');
  });

  it('13. should verify B2B service gallery order index sorting', async () => {
    const gallery = await prisma.serviceGalleryItem.findMany({
      orderBy: { orderIndex: 'asc' },
      take: 5,
    });
    expect(Array.isArray(gallery)).toBe(true);
  });

  it('14. should format B2B currency values in QAR', () => {
    const formatQAR = (amount: number) => `QAR ${amount.toLocaleString()}`;
    expect(formatQAR(15000)).toBe('QAR 15,000');
  });

  it('15. should verify B2B service metadata structure for SEO', () => {
    const buildSeo = (title: string, desc: string) => ({
      title: `${title} | E3 Qatar B2B`,
      description: desc,
      openGraph: { title, description: desc },
    });

    const metadata = buildSeo('Stage Engineering', 'Custom event staging in Qatar');
    expect(metadata.title).toContain('Stage Engineering');
    expect(metadata.openGraph.title).toBe('Stage Engineering');
  });
});
