import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getAllCanonicalServices, getCanonicalService, resolveServiceSlug } from '@/lib/services/canonical-services';
import { adaptDbCaseStudyToPresentation } from '@/lib/case-studies/case-adapters';
import { canonicalizeRoute, localizeHref } from '@/lib/url-helper';

vi.mock('@/lib/db', () => ({
  db: {
    lead: {
      create: vi.fn(),
    },
    leadActivity: {
      create: vi.fn(),
    },
    service: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    pages: {
      findUnique: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
import { POST as projectBriefPost } from '@/app/api/leads/project-brief/route';

describe('B2B Services & Case Studies Directory Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Canonical Services Directory & Integrity', () => {
    const services = getAllCanonicalServices();

    it('contains all authoritative canonical services with required fields', () => {
      expect(services.length).toBeGreaterThanOrEqual(8);

      services.forEach((service) => {
        expect(service.slug).toBeDefined();
        expect(service.titleEn).toBeTruthy();
        expect(service.titleAr).toBeTruthy();
        expect(service.categoryEn).toBeTruthy();
        expect(service.categoryAr).toBeTruthy();
        expect(service.heroOutcomeEn).toBeTruthy();
        expect(service.heroOutcomeAr).toBeTruthy();
        expect(Array.isArray(service.verifiedProofPoints)).toBe(true);
        expect(Array.isArray(service.engagementModels)).toBe(true);
        expect(Array.isArray(service.deliverables)).toBe(true);
        expect(Array.isArray(service.lifecycleStages)).toBe(true);
        expect(Array.isArray(service.enterpriseReadiness)).toBe(true);
      });
    });

    it('resolves legacy aliases to canonical service slugs correctly', () => {
      expect(resolveServiceSlug('fec')).toBe('family-entertainment-centers');
      expect(resolveServiceSlug('fec-development')).toBe('family-entertainment-centers');
      expect(resolveServiceSlug('av-rentals')).toBe('av-stage-rentals');
      expect(resolveServiceSlug('audio-visual')).toBe('av-stage-rentals');
      expect(resolveServiceSlug('kids-play')).toBe('kids-concepts');
      expect(resolveServiceSlug('event-engineering')).toBe('mega-events');
      expect(resolveServiceSlug('design-research')).toBe('feasibility-design-research');
    });

    it('finds canonical service by alias or primary slug', () => {
      const canonicalFec = getCanonicalService('fec');
      expect(canonicalFec).toBeDefined();
      expect(canonicalFec?.slug).toBe('family-entertainment-centers');

      const canonicalAv = getCanonicalService('av-stage-rentals');
      expect(canonicalAv).toBeDefined();
      expect(canonicalAv?.slug).toBe('av-stage-rentals');
    });
  });

  describe('2. Project Brief Builder API (/api/leads/project-brief)', () => {
    it('returns 400 if name or email is missing', async () => {
      const req = new NextRequest('http://localhost/api/leads/project-brief', {
        method: 'POST',
        body: JSON.stringify({ name: 'VIP Inquirer' }), // missing email
      });

      const res = await projectBriefPost(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/Name and email are required/i);
    });

    it('creates Lead and LeadActivity in DB and returns briefSummary on valid submission', async () => {
      const mockLead = {
        id: 'lead_cly123456789',
        name: 'Nasser Al-Kuwari',
        email: 'nasser@alkuwari.qa',
        company: 'Doha Festival Bureau',
        phone: '+974 5555 1234',
        status: 'NEW',
      };

      (db.lead.create as any).mockResolvedValue(mockLead);
      (db.leadActivity.create as any).mockResolvedValue({ id: 'act_1' });

      const payload = {
        name: 'Nasser Al-Kuwari',
        email: 'nasser@alkuwari.qa',
        phone: '+974 5555 1234',
        company: 'Doha Festival Bureau',
        serviceSlug: 'mega-events',
        objective: 'Host a world-class national festival',
        venueType: 'Outdoor Promenade',
        audienceSize: '10,000 - 50,000 Guests',
        targetDate: '2026-12-18',
        duration: '3 - 7 Days',
        indoorOutdoor: 'Outdoor',
        budgetRange: 'Enterprise / Landmark',
        briefNotes: 'Require turnkey crowd control, kinetic stage, and drone show.',
        selectedRelatedServices: ['av-stage-rentals', 'drone-light-shows'],
      };

      const req = new NextRequest('http://localhost/api/leads/project-brief', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await projectBriefPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.leadId).toBe(mockLead.id);
      expect(json.briefSummary).toBeDefined();
      expect(json.briefSummary.referenceNumber).toMatch(/^E3-BRF-/);
      expect(json.briefSummary.clientName).toBe(payload.name);
      expect(json.briefSummary.serviceSlug).toBe('mega-events');

      expect(db.lead.create).toHaveBeenCalledTimes(1);
      expect(db.leadActivity.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Case Study Presentation Adapter', () => {
    it('adapts raw database case study into complete presentation object', () => {
      const rawCaseStudy = {
        id: 'cs_101',
        slug: 'lusail-winter-wonderland',
        titleEn: 'Lusail Winter Wonderland Mega Project',
        titleAr: 'مشروع لوسيل وينتر وندرلاند الضخم',
        clientName: 'Qatari Diar',
        year: 2024,
        category: 'Mega Events & Attractions',
        isFeatured: true,
        heroImageUrl: 'https://cdn.e3.qa/lusail-hero.jpg',
        thumbnailUrl: 'https://cdn.e3.qa/lusail-thumb.jpg',
        challengeEn: 'Short 45-day deployment window before tourist season.',
        challengeAr: 'نافذة تنفيذ ضيقة مدتها 45 يوماً قبل الموسم السياحي.',
        solutionEn: 'Pre-fabricated modular structures and automated electrical engineering.',
        solutionAr: 'هياكل مسبقة الصنع وهندسة كهربائية مؤتمتة.',
        resultEn: 'Delivered on time with zero safety incidents.',
        resultAr: 'تم التسليم في الموعد المحدد دون أي حوادث سلامة.',
        metrics: [
          { labelEn: 'Visitors', valueEn: '1.2M+' },
          { labelEn: 'Attractions', valueEn: '50+' },
        ],
        servicesUsed: ['mega-events', 'av-stage-rentals'],
      };

      const presentation = adaptDbCaseStudyToPresentation(rawCaseStudy);

      expect(presentation.id).toBe('cs_101');
      expect(presentation.slug).toBe('lusail-winter-wonderland');
      expect(presentation.titleEn).toBe(rawCaseStudy.titleEn);
      expect(presentation.clientName).toBe(rawCaseStudy.clientName);
      expect(presentation.isFeatured).toBe(true);
      expect(presentation.metrics.length).toBe(2);
      expect(presentation.relatedServiceSlugs).toContain('mega-events');
      expect(presentation.relatedServiceSlugs).toContain('av-stage-rentals');
    });
  });

  describe('4. Routing, Localization & Directory Aliases', () => {
    it('canonicalizes /services to /b2b/services', () => {
      expect(canonicalizeRoute('/services')).toBe('/b2b/services');
      expect(canonicalizeRoute('/services/fec')).toBe('/b2b/services/family-entertainment-centers');
    });

    it('canonicalizes /case-studies and /cases to /b2b/case-studies', () => {
      expect(canonicalizeRoute('/case-studies')).toBe('/b2b/case-studies');
      expect(canonicalizeRoute('/cases')).toBe('/b2b/case-studies');
      expect(canonicalizeRoute('/cases/doha-balloon-parade')).toBe('/b2b/case-studies/doha-balloon-parade');
    });

    it('localizes internal directory routes cleanly in English and Arabic', () => {
      expect(localizeHref('/services', 'en')).toBe('/en/b2b/services');
      expect(localizeHref('/services', 'ar')).toBe('/ar/b2b/services');
      expect(localizeHref('/case-studies', 'en')).toBe('/en/b2b/case-studies');
      expect(localizeHref('/case-studies', 'ar')).toBe('/ar/b2b/case-studies');
      expect(localizeHref('/b2b/services/av-rentals', 'en')).toBe('/en/b2b/services/av-stage-rentals');
    });
  });
});
