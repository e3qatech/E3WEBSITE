import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LocaleProvider } from '@/components/layout/LocaleProvider'
import { AdminThemeProvider } from '@/components/dashboard/ui/AdminThemeProvider'
import { AdminTopBar } from '@/components/dashboard/ui/AdminTopBar'
import { PulseOrbitCMSView } from '@/components/dashboard/b2c/PulseOrbitCMSView'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { MediaUploader } from '@/components/shared/MediaUploader'
import { ApplicationFormClient } from '@/components/careers/ApplicationFormClient'
import { EventScheduleManager } from '@/components/dashboard/operations/EventScheduleManager'
import { SubscribeSection } from '@/components/calendar/SubscribeSection'

let mockPathname = '/ar'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/upload', () => ({
  uploadFile: vi.fn().mockResolvedValue({ url: 'https://cdn.e3.qa/media/test.png', fileName: 'test.png' }),
}))

describe('QF-21 — Bounded Arabic Residue Cleanup Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname = '/ar'
  })

  // =========================================================================
  // 1. MEDIA-UPLOAD HELPER LABELS IN PULSE ORBIT (SETTINGS, B2C, B2B)
  // =========================================================================
  describe('1. Pulse Orbit Media-Upload Helper Labels', () => {
    it('AdminMediaPicker renders pure Arabic controls and zero English upload residue in AR mode', () => {
      mockPathname = '/ar/dashboard/settings/pulse-orbit'
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <AdminMediaPicker
            value={null}
            onChange={() => {}}
            accept="image/*"
          />
        </LocaleProvider>
      )

      expect(htmlAr).toContain('انقر لرفع ملف صورة')
      expect(htmlAr).toContain('اختر ملف صورة أو فيديو من جهازك')
      expect(htmlAr).toContain('رفع ملف')
      expect(htmlAr).toContain('المكتبة / لصق الرابط')
      expect(htmlAr).not.toContain('Click to Upload Image File')
      expect(htmlAr).not.toContain('Select image or video from your computer')
      expect(htmlAr).not.toContain('Upload File')
      expect(htmlAr).not.toContain('Library / Paste URL')
    })

    it('AdminMediaPicker with existing media renders Arabic preview action buttons in AR mode', () => {
      mockPathname = '/ar/dashboard/b2c/pulse-orbit'
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <AdminMediaPicker
            value="https://cdn.e3.qa/banner.jpg"
            onChange={() => {}}
            accept="image/*"
          />
        </LocaleProvider>
      )

      expect(htmlAr).toContain('رفع ملف جديد')
      expect(htmlAr).toContain('المكتبة / الرابط')
      expect(htmlAr).toContain('إزالة')
      expect(htmlAr).toContain('انقر على الصورة لرفع ملف جديد من جهازك')
      expect(htmlAr).not.toContain('Upload New File')
      expect(htmlAr).not.toContain('Library / URL')
      expect(htmlAr).not.toContain('Click image to upload new file from computer')
    })

    it('AdminMediaPicker preserves English text in EN mode', () => {
      mockPathname = '/en/dashboard/settings/pulse-orbit'
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <AdminMediaPicker
            value="https://cdn.e3.qa/banner.jpg"
            onChange={() => {}}
            accept="image/*"
          />
        </LocaleProvider>
      )

      expect(htmlEn).toContain('Upload New File')
      expect(htmlEn).toContain('Library / URL')
      expect(htmlEn).toContain('Remove')
      expect(htmlEn).toContain('Click image to upload new file from computer')
    })

    it('Pulse Orbit views render Arabic upload labels across Settings, B2C, and B2B in AR mode', () => {
      mockPathname = '/ar/dashboard/b2c/pulse-orbit'
      const htmlPulseB2C = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <PulseOrbitCMSView
            scopedPortal="B2C"
            allowedTabs={['B2C']}
            defaultTab="B2C"
            initialData={{ logoUrl: '' }}
          />
        </LocaleProvider>
      )

      expect(htmlPulseB2C).toContain('رفع شعار مدار الفعاليات')
      expect(htmlPulseB2C).toContain('انقر لرفع ملف صورة')
      expect(htmlPulseB2C).toContain('المكتبة / لصق الرابط')

      mockPathname = '/ar/dashboard/b2b/pulse-orbit'
      const htmlPulseB2B = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <PulseOrbitCMSView
            scopedPortal="B2B"
            allowedTabs={['B2B']}
            defaultTab="B2B"
            initialB2BData={{ logoUrl: '' }}
          />
        </LocaleProvider>
      )

      expect(htmlPulseB2B).toContain('رفع شعار مدار الشركات')
      expect(htmlPulseB2B).toContain('انقر لرفع ملف صورة')
    })
  })

  // =========================================================================
  // 2. ENGLISH UPLOAD / DROP-ZONE INSTRUCTIONS ON /ar/apply
  // =========================================================================
  describe('2. Apply Page Upload & Drop-Zone Instructions', () => {
    it('MediaUploader renders Arabic dropzone instructions in AR mode', () => {
      mockPathname = '/ar/apply'
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <MediaUploader
            value={null}
            onChange={() => {}}
            accept=".pdf,.doc,.docx"
            context="public_resume"
          />
        </LocaleProvider>
      )

      expect(htmlAr).toContain('انقر للتحميل أو اسحب الملف وأفلته هنا')
      expect(htmlAr).toContain('الحد الأقصى ٥٠ ميغابايت')
      expect(htmlAr).not.toContain('Click to upload or drag and drop')
      expect(htmlAr).not.toContain('(max. 50MB)')
    })

    it('MediaUploader preserves English dropzone instructions in EN mode', () => {
      mockPathname = '/en/apply'
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <MediaUploader
            value={null}
            onChange={() => {}}
            accept=".pdf,.doc,.docx"
            context="public_resume"
          />
        </LocaleProvider>
      )

      expect(htmlEn).toContain('Click to upload or drag and drop')
      expect(htmlEn).toContain('(max. 50MB)')
    })

    it('ApplicationFormClient on /ar/apply renders pure Arabic upload section and action buttons', () => {
      mockPathname = '/ar/apply'
      const htmlApplyAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <ApplicationFormClient locale="ar" />
        </LocaleProvider>
      )

      expect(htmlApplyAr).toContain('تحميل السيرة الذاتية (PDF أو DOC) *')
      expect(htmlApplyAr).toContain('انقر للتحميل أو اسحب الملف وأفلته هنا')
      expect(htmlApplyAr).toContain('إرسال طلب التوظيف')
      expect(htmlApplyAr).toContain('الاسم الأول *')
      expect(htmlApplyAr).toContain('اسم العائلة *')
      expect(htmlApplyAr).toContain('البريد الإلكتروني *')
    })
  })

  // =========================================================================
  // 3. OPERATIONS EVENTS BREADCRUMB & SHARED TOPBAR SEGMENTS (QF-21 / QF-21-B)
  // =========================================================================
  describe('3. Operations Events Breadcrumb & Shared Topbar Segments', () => {
    it('EventScheduleManager renders localized Arabic breadcrumbs without English "Events" segment', () => {
      mockPathname = '/ar/dashboard/operations/events'
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <EventScheduleManager
            initialSchedules={[]}
            attractions={[]}
          />
        </LocaleProvider>
      )

      expect(htmlAr).toContain('العمليات')
      expect(htmlAr).toContain('جداول المواعيد والسعة')
      expect(htmlAr).toContain('جداول الفعاليات وسعة الحضور')
      expect(htmlAr).not.toContain('>Events<')
      expect(htmlAr).not.toContain('>Operations<')
    })

    it('EventScheduleManager preserves English breadcrumbs in EN mode', () => {
      mockPathname = '/en/dashboard/operations/events'
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <EventScheduleManager
            initialSchedules={[]}
            attractions={[]}
          />
        </LocaleProvider>
      )

      expect(htmlEn).toContain('Operations')
      expect(htmlEn).toContain('Event Schedules &amp; Capacity')
      expect(htmlEn).toContain('Event Schedules &amp; Capacity Gates')
    })

    it('AdminTopBar on /ar/dashboard/operations/events renders "جداول المواعيد والسعة" and no visible exact "Events"', () => {
      mockPathname = '/ar/dashboard/operations/events'
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <AdminThemeProvider>
            <AdminTopBar />
          </AdminThemeProvider>
        </LocaleProvider>
      )

      expect(htmlAr).toContain('لوحة التحكم')
      expect(htmlAr).toContain('العمليات التشغيلية')
      expect(htmlAr).toContain('جداول المواعيد والسعة')
      expect(htmlAr).not.toContain('>Events<')
    })

    it('AdminTopBar on /en/dashboard/operations/events continues to show "Dashboard", "Operations", and "Events"', () => {
      mockPathname = '/en/dashboard/operations/events'
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <AdminThemeProvider>
            <AdminTopBar />
          </AdminThemeProvider>
        </LocaleProvider>
      )

      expect(htmlEn).toContain('Dashboard')
      expect(htmlEn).toContain('Operations')
      expect(htmlEn).toContain('Events')
    })
  })

  // =========================================================================
  // 4. B2C CALENDAR NEWSLETTER BLOCK (SubscribeSection)
  // =========================================================================
  describe('4. B2C Calendar Newsletter Block Localization', () => {
    it('SubscribeSection renders pure Arabic heading, description, contact methods, fields, and button in AR mode', () => {
      mockPathname = '/ar/b2c/calendar'
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <SubscribeSection />
        </LocaleProvider>
      )

      // Heading & Description
      expect(htmlAr).toContain('لا تفوّت أي')
      expect(htmlAr).toContain('فعالية')
      expect(htmlAr).toContain('احصل على تنبيهات فورية عند طرح التذاكر، والمهرجانات الحصرية')

      // Contact Methods
      expect(htmlAr).toContain('البريد الإلكتروني')
      expect(htmlAr).toContain('واتساب')
      expect(htmlAr).toContain('كلاهما')

      // Form Field Labels
      expect(htmlAr).toContain('عنوان البريد الإلكتروني')

      // Preferences
      expect(htmlAr).toContain('الفعاليات الخاصة والمهرجانات')
      expect(htmlAr).toContain('إطلاق الوجهات والمرافق الجديدة')

      // Action Button
      expect(htmlAr).toContain('اشترك الآن')

      // English residue absence verification
      expect(htmlAr).not.toContain('Never Miss an')
      expect(htmlAr).not.toContain('Stay ahead of the crowd')
      expect(htmlAr).not.toContain('>Both<')
      expect(htmlAr).not.toContain('>Email<')
      expect(htmlAr).not.toContain('>WhatsApp<')
      expect(htmlAr).not.toContain('Subscribe Now')
    })

    it('SubscribeSection preserves exact English copy in EN mode', () => {
      mockPathname = '/en/b2c/calendar'
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <SubscribeSection />
        </LocaleProvider>
      )

      expect(htmlEn).toContain('Never Miss an')
      expect(htmlEn).toContain('Event')
      expect(htmlEn).toContain('Get alerts for ticket launches, special festivals')
      expect(htmlEn).toContain('Email')
      expect(htmlEn).toContain('WhatsApp')
      expect(htmlEn).toContain('Both')
      expect(htmlEn).toContain('Email Address')
      expect(htmlEn).toContain('Special Events &amp; Festivals')
      expect(htmlEn).toContain('New Attraction Launches')
      expect(htmlEn).toContain('Subscribe Now')
    })
  })
})
