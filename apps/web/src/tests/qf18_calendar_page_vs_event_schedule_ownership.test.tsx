import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { CalendarPageManager } from '@/components/dashboard/b2c/CalendarPageManager';
import { EventScheduleManager } from '@/components/dashboard/operations/EventScheduleManager';
import B2CCalendarRedirectPage from '@/app/[locale]/dashboard/b2c/calendar/page';
import CalendarPageEditorPage from '@/app/[locale]/dashboard/b2c/calendar-page/page';
import OperationsEventsPage from '@/app/[locale]/dashboard/operations/events/page';
import { GET as getCalendarSettings, POST as postCalendarSettings } from '@/app/api/b2c/calendar-settings/route';
import { GET as getSchedules, POST as postSchedules } from '@/app/api/operations/schedules/route';
import { generateMetadata as generateCalendarMetadata } from '@/app/[locale]/b2c/calendar/page';
import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn((url: string) => {
    const error = new Error(`NEXT_REDIRECT: ${url}`);
    (error as any).digest = `NEXT_REDIRECT;replace;${url};307;;`;
    throw error;
  }),
}));

describe('QF-18 — Calendar Page vs Event-Schedule Ownership Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. LOCALE-PRESERVING ROUTE REDIRECT
  // =========================================================================
  describe('1. Locale-Preserving Route Redirect', () => {
    it('redirects /en/dashboard/b2c/calendar to /en/dashboard/b2c/calendar-page', async () => {
      try {
        await B2CCalendarRedirectPage({
          params: Promise.resolve({ locale: 'en' }),
        });
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard/b2c/calendar-page');
      }
      expect(redirect).toHaveBeenCalledWith('/en/dashboard/b2c/calendar-page');
    });

    it('redirects /ar/dashboard/b2c/calendar to /ar/dashboard/b2c/calendar-page', async () => {
      try {
        await B2CCalendarRedirectPage({
          params: Promise.resolve({ locale: 'ar' }),
        });
      } catch (err: any) {
        expect(err.digest).toContain('/ar/dashboard/b2c/calendar-page');
      }
      expect(redirect).toHaveBeenCalledWith('/ar/dashboard/b2c/calendar-page');
    });
  });

  // =========================================================================
  // 2. RECIPROCAL OWNERSHIP HANDOFFS
  // =========================================================================
  describe('2. Reciprocal Ownership Handoffs', () => {
    it('CalendarPageManager renders presentation ownership and reciprocal handoff to Operations in EN', () => {
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CalendarPageManager
            initialPageSettings={{
              titleEn: 'Events & Entertainment Calendar',
              titleAr: 'جدول الفعاليات والتجارب',
            }}
          />
        </LocaleProvider>
      );

      // Presentation Owner Details
      expect(htmlEn).toContain('Events &amp; Calendar Page Editor');
      expect(htmlEn).toContain('Hero Titles &amp; Copy');
      expect(htmlEn).toContain('Hero Media');
      expect(htmlEn).toContain('Promo Discounts');
      expect(htmlEn).toContain('SEO Metadata');

      // Reciprocal Handoff to Operations
      expect(htmlEn).toContain('Event Schedules &amp; Operating Windows (Operations)');
      expect(htmlEn).toContain('href="/en/dashboard/operations/events"');
      expect(htmlEn).toContain('Open Operations Schedules');
    });

    it('CalendarPageManager renders presentation ownership and reciprocal handoff to Operations in AR', () => {
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <CalendarPageManager
            initialPageSettings={{
              titleEn: 'Events & Entertainment Calendar',
              titleAr: 'جدول الفعاليات والتجارب',
            }}
          />
        </LocaleProvider>
      );

      // Localized Presentation Owner Details
      expect(htmlAr).toContain('محرر صفحة التقويم والفعاليات');
      expect(htmlAr).toContain('عناوين ونصوص الهيرو');
      expect(htmlAr).toContain('وسائط الهيرو');
      expect(htmlAr).toContain('العروض والخصومات');
      expect(htmlAr).toContain('محركات البحث والميتا');

      // Localized Reciprocal Handoff to Operations
      expect(htmlAr).toContain('جداول الفعاليات والمواعيد التشغيلية (إدارة العمليات)');
      expect(htmlAr).toContain('href="/ar/dashboard/operations/events"');
      expect(htmlAr).toContain('فتح جداول العمليات');
    });

    it('EventScheduleManager renders schedule ownership and reciprocal handoff to B2C Calendar Page in EN', () => {
      const mockSchedules = [
        {
          id: 'sch-1',
          attractionId: 'attr-1',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          eventType: 'REGULAR',
          capacityGate: 150,
          currentCount: 45,
          attraction: { nameEn: 'Doha Quest', nameAr: 'دوحة كويست' },
        },
      ];

      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <EventScheduleManager
            initialSchedules={mockSchedules}
            attractions={[{ id: 'attr-1', nameEn: 'Doha Quest' }]}
          />
        </LocaleProvider>
      );

      // Schedule Owner Details
      expect(htmlEn).toContain('Event Schedules &amp; Capacity Gates');
      expect(htmlEn).toContain('Doha Quest');
      expect(htmlEn).toContain('Capacity');

      // Reciprocal Handoff to B2C Presentation Editor
      expect(htmlEn).toContain('Public Calendar Page &amp; Presentation CMS (B2C)');
      expect(htmlEn).toContain('href="/en/dashboard/b2c/calendar-page"');
      expect(htmlEn).toContain('Open Calendar Page Editor');
    });

    it('EventScheduleManager renders schedule ownership and reciprocal handoff to B2C Calendar Page in AR', () => {
      const mockSchedules = [
        {
          id: 'sch-1',
          attractionId: 'attr-1',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          eventType: 'REGULAR',
          capacityGate: 150,
          currentCount: 45,
          attraction: { nameEn: 'Doha Quest', nameAr: 'دوحة كويست' },
        },
      ];

      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <EventScheduleManager
            initialSchedules={mockSchedules}
            attractions={[{ id: 'attr-1', nameEn: 'Doha Quest', nameAr: 'دوحة كويست' }]}
          />
        </LocaleProvider>
      );

      // Localized Schedule Owner Details
      expect(htmlAr).toContain('جداول الفعاليات وسعة الحضور');
      expect(htmlAr).toContain('دوحة كويست');
      expect(htmlAr).toContain('السعة');

      // Localized Reciprocal Handoff to B2C Presentation Editor
      expect(htmlAr).toContain('محرر صفحة التقويم والفعاليات العامة (B2C)');
      expect(htmlAr).toContain('href="/ar/dashboard/b2c/calendar-page"');
      expect(htmlAr).toContain('فتح محرر صفحة التقويم');
    });
  });

  // =========================================================================
  // 3. RBAC & ROUTE PROTECTION BOUNDARIES
  // =========================================================================
  describe('3. RBAC & Route Protection Boundaries', () => {
    it('CalendarPageEditorPage rejects unauthorized users lacking B2C read/write capabilities', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-client', role: 'CLIENT' },
      } as any);

      try {
        await CalendarPageEditorPage({
          params: Promise.resolve({ locale: 'en' }),
        });
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard');
      }
      expect(redirect).toHaveBeenCalledWith('/en/dashboard');
    });

    it('CalendarPageEditorPage allows authorized B2C_ADMIN and SUPER_ADMIN users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'B2C_ADMIN' },
      } as any);

      const res = await CalendarPageEditorPage({
        params: Promise.resolve({ locale: 'en' }),
      });
      expect(res).toBeDefined();
    });

    it('OperationsEventsPage rejects non-operations roles', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-b2c', role: 'B2C_ADMIN' },
      } as any);

      try {
        await OperationsEventsPage();
      } catch (err: any) {
        expect(err.digest).toContain('/login');
      }
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('OperationsEventsPage allows OPERATIONS_ADMIN and SUPER_ADMIN roles', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'ops-1', role: 'OPERATIONS_ADMIN' },
      } as any);

      vi.spyOn(db.eventSchedule, 'findMany').mockResolvedValue([]);
      vi.spyOn(db.attraction, 'findMany').mockResolvedValue([]);

      const res = await OperationsEventsPage();
      expect(res).toBeDefined();
    });
  });

  // =========================================================================
  // 4. SAVE ISOLATION & API SEPARATION
  // =========================================================================
  describe('4. Save Isolation & API Separation', () => {
    it('GET /api/b2c/calendar-settings retrieves presentation settings and promo discounts', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'B2C_ADMIN' },
      } as any);

      vi.spyOn(db.setting, 'findMany').mockResolvedValue([
        {
          key: 'B2C_CALENDAR_PAGE_SETTINGS',
          value: { titleEn: 'Events Calendar', titleAr: 'جدول الفعاليات' },
        },
        {
          key: 'B2C_CALENDAR_DISCOUNTS',
          value: [{ id: 'd-1', code: 'PROMO10', discount: 10 }],
        },
      ] as any);

      const req = new NextRequest('http://localhost:3000/api/b2c/calendar-settings');
      const res = await getCalendarSettings(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.pageSettings.titleEn).toBe('Events Calendar');
      expect(json.discounts.length).toBe(1);
    });

    it('GET /api/operations/schedules retrieves event schedule blocks for operations roles', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'ops-1', role: 'OPERATIONS_ADMIN' },
      } as any);

      vi.spyOn(db.eventSchedule, 'findMany').mockResolvedValue([
        {
          id: 'sch-1',
          attractionId: 'attr-1',
          startTime: new Date('2026-09-01T10:00:00Z'),
          endTime: new Date('2026-09-01T18:00:00Z'),
          eventType: 'REGULAR',
          capacityGate: 100,
          currentCount: 20,
          attraction: { nameEn: 'Doha Quest', slug: 'doha-quest' },
        },
      ] as any);

      const req = new NextRequest('http://localhost:3000/api/operations/schedules');
      const res = await getSchedules(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
      expect(json[0].id).toBe('sch-1');
    });

    it('POST /api/b2c/calendar-settings modifies settings and pages without mutating EventSchedule table', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'B2C_ADMIN' },
      } as any);

      const settingUpsertSpy = vi.spyOn(db.setting, 'upsert').mockResolvedValue({} as any);
      const pagesUpsertSpy = vi.spyOn(db.pages, 'upsert').mockResolvedValue({} as any);
      const scheduleCreateSpy = vi.spyOn(db.eventSchedule, 'create').mockResolvedValue({} as any);

      const req = new NextRequest('http://localhost:3000/api/b2c/calendar-settings', {
        method: 'POST',
        body: JSON.stringify({
          pageSettings: {
            titleEn: 'Special Calendar Title',
            titleAr: 'عنوان التقويم الخاص',
          },
          discounts: [{ code: 'SUMMER2026', discount: 25 }],
        }),
      });

      const res = await postCalendarSettings(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(settingUpsertSpy).toHaveBeenCalled();
      expect(pagesUpsertSpy).toHaveBeenCalled();
      expect(scheduleCreateSpy).not.toHaveBeenCalled();
    });

    it('POST /api/operations/schedules creates event schedule block without mutating page settings', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'ops-1', role: 'OPERATIONS_ADMIN' },
      } as any);

      const scheduleCreateSpy = vi.spyOn(db.eventSchedule, 'create').mockResolvedValue({
        id: 'sch-new',
        attractionId: 'attr-1',
        startTime: new Date('2026-09-01T10:00:00Z'),
        endTime: new Date('2026-09-01T18:00:00Z'),
        eventType: 'SPECIAL',
        capacityGate: 200,
        currentCount: 0,
        attraction: { nameEn: 'Doha Quest', slug: 'doha-quest' },
      } as any);

      const settingUpsertSpy = vi.spyOn(db.setting, 'upsert').mockResolvedValue({} as any);

      const req = new NextRequest('http://localhost:3000/api/operations/schedules', {
        method: 'POST',
        body: JSON.stringify({
          attractionId: 'attr-1',
          startTime: '2026-09-01T10:00:00Z',
          endTime: '2026-09-01T18:00:00Z',
          eventType: 'SPECIAL',
          capacityGate: 200,
        }),
      });

      const res = await postSchedules(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.id).toBe('sch-new');
      expect(scheduleCreateSpy).toHaveBeenCalled();
      expect(settingUpsertSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 5. PUBLIC CALENDAR PAGE COMPOSITION
  // =========================================================================
  describe('5. Public Calendar Page Composition', () => {
    it('generateMetadata generates canonical URLs and localized metadata for EN and AR', async () => {
      vi.spyOn(db.pages, 'findUnique').mockResolvedValue({
        id: 'p-1',
        slug: 'b2c-calendar',
        content: {
          seo: {
            metaTitleEn: 'Events & Experiences — E3 Qatar',
            metaTitleAr: 'الفعاليات والتجارب — إي ثري قطر',
            metaDescriptionEn: 'Explore upcoming experiences in Qatar.',
            metaDescriptionAr: 'استكشف التجارب القادمة في قطر.',
          },
        },
      } as any);

      const metaEn = await generateCalendarMetadata({
        params: Promise.resolve({ locale: 'en' }),
      });
      expect(metaEn.title).toBe('Events & Experiences — E3 Qatar');
      expect(metaEn.description).toBe('Explore upcoming experiences in Qatar.');
      expect(metaEn.alternates?.canonical).toBe('https://e3.qa/en/b2c/calendar');

      const metaAr = await generateCalendarMetadata({
        params: Promise.resolve({ locale: 'ar' }),
      });
      expect(metaAr.title).toBe('الفعاليات والتجارب — إي ثري قطر');
      expect(metaAr.description).toBe('استكشف التجارب القادمة في قطر.');
      expect(metaAr.alternates?.canonical).toBe('https://e3.qa/ar/b2c/calendar');
    });
  });
});
