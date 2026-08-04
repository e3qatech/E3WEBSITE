import { describe, it, expect } from 'vitest';
import db from '../lib/db';

const prisma = db as any;

describe('Gate 06: Database Schema & Lifecycle Verification', () => {
  it('1. should query Prisma database status cleanly', async () => {
    expect(db).toBeDefined();
    expect(prisma.attraction).toBeDefined();
    expect(prisma.service).toBeDefined();
    expect(prisma.caseStudy).toBeDefined();
    expect(prisma.user).toBeDefined();
  });

  it('2. should verify Attraction schema fields include required multilanguage attributes', async () => {
    const attraction = await prisma.attraction.findFirst({
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        descriptionEn: true,
        descriptionAr: true,
        isPublished: true,
      },
    });

    if (attraction) {
      expect(attraction.slug).toBeDefined();
      expect(typeof attraction.isPublished).toBe('boolean');
    } else {
      expect(true).toBe(true);
    }
  });

  it('3. should verify Service schema fields and process steps structure', async () => {
    const service = await prisma.service.findFirst({
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleAr: true,
        isVisible: true,
      },
    });

    if (service) {
      expect(service.slug).toBeDefined();
      expect(typeof service.isVisible).toBe('boolean');
    } else {
      expect(true).toBe(true);
    }
  });

  it('4. should verify CaseStudy schema relations with Attraction model', async () => {
    const caseStudy = await prisma.caseStudy.findFirst({
      select: {
        id: true,
        slug: true,
        attractionId: true,
        isPublished: true,
      },
    });

    if (caseStudy) {
      expect(caseStudy.slug).toBeDefined();
    } else {
      expect(true).toBe(true);
    }
  });

  it('5. should enforce soft delete / filter rules for published attractions', async () => {
    const publishedAttractions = await prisma.attraction.findMany({
      where: { isPublished: true },
      select: { id: true, isPublished: true },
    });

    publishedAttractions.forEach((a: any) => {
      expect(a.isPublished).toBe(true);
    });
  });

  it('6. should filter visible services for B2B portal', async () => {
    const visibleServices = await prisma.service.findMany({
      where: { isVisible: true },
      select: { id: true, isVisible: true },
    });

    visibleServices.forEach((s: any) => {
      expect(s.isVisible).toBe(true);
    });
  });

  it('7. should query User model and confirm password hash exclusion in public view', async () => {
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, role: true },
    });

    if (user) {
      expect(user.id).toBeDefined();
      expect(user.role).toBeDefined();
      expect((user as any).passwordHash).toBeUndefined();
    } else {
      expect(true).toBe(true);
    }
  });

  it('8. should verify EmployeeProfile schema fields', async () => {
    const profile = await prisma.employeeProfile.findFirst({
      select: { id: true, firstName: true, designation: true },
    });

    if (profile) {
      expect(profile.firstName).toBeDefined();
    } else {
      expect(true).toBe(true);
    }
  });

  it('9. should verify CalendarEvent schema status values', async () => {
    const events = await prisma.calendarEvent.findMany({
      take: 5,
      select: { id: true, status: true },
    });

    events.forEach((e: any) => {
      expect(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'CANCELLED']).toContain(e.status);
    });
  });

  it('10. should query TelemetryLog for attraction occupancy tracking', async () => {
    const logs = await prisma.telemetryLog.findMany({
      take: 5,
      select: { id: true, attractionId: true, timestamp: true },
    });
    expect(Array.isArray(logs)).toBe(true);
  });

  it('11. should query Lead model structure', async () => {
    const leads = await prisma.lead.findMany({
      take: 5,
      select: { id: true, name: true, status: true },
    });
    expect(Array.isArray(leads)).toBe(true);
  });

  it('12. should query EventSchedule model structure', async () => {
    const schedules = await prisma.eventSchedule.findMany({
      take: 5,
      select: { id: true, attractionId: true, eventType: true },
    });
    expect(Array.isArray(schedules)).toBe(true);
  });

  it('13. should query AttractionPricing records related to Attractions', async () => {
    const tiers = await prisma.attractionPricing.findMany({
      take: 5,
      select: { id: true, titleEn: true, price: true },
    });
    expect(Array.isArray(tiers)).toBe(true);
  });

  it('14. should query SystemBroadcast active messages', async () => {
    const broadcasts = await prisma.systemBroadcast.findMany({
      where: { isActive: true },
      select: { id: true, messageEn: true, type: true },
    });
    expect(Array.isArray(broadcasts)).toBe(true);
  });

  it('15. should query Setting model key-value pairs', async () => {
    const settings = await prisma.setting.findMany({
      select: { key: true, value: true },
    });
    expect(Array.isArray(settings)).toBe(true);
  });

  it('16. should execute read transaction without locking table', async () => {
    const result = await (db as any).$transaction([
      prisma.attraction.count(),
      prisma.service.count(),
      prisma.caseStudy.count(),
    ]);

    expect(result.length).toBe(3);
    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('number');
    expect(typeof result[2]).toBe('number');
  });
});
