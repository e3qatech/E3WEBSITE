import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LocaleProvider } from '@/components/layout/LocaleProvider'
import { PulseOrbitCMSView } from '@/components/dashboard/b2c/PulseOrbitCMSView'
import PulseOrbitSettingsPage from '@/app/[locale]/dashboard/settings/pulse-orbit/page'
import B2CPulseOrbitCMSPage from '@/app/[locale]/dashboard/b2c/pulse-orbit/page'
import B2BPulseOrbitCMSPage from '@/app/[locale]/dashboard/b2b/pulse-orbit/page'
import { PUT as updateCMSPage } from '@/app/api/cms/pages/[slug]/route'
import { getManagedCMSPage, isManagedCMSPage } from '@/lib/cms-ownership'
import { NextRequest } from 'next/server'
import db from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn((url: string) => {
    const error = new Error(`NEXT_REDIRECT: ${url}`)
    ;(error as any).digest = `NEXT_REDIRECT;replace;${url};307;;`
    throw error
  }),
}))

describe('QF-19 — Pulse Orbit Editor Ownership & Scoped Routing Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // 1. EN/AR ROUTES AND SCOPED RENDERING
  // =========================================================================
  describe('1. EN/AR Routes and Scoped Rendering', () => {
    it('Settings Pulse Orbit Hub renders unified cross-portal navigation in EN', () => {
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PulseOrbitCMSView
            scopedPortal="ALL"
            allowedTabs={['B2C', 'B2B']}
            defaultTab="B2C"
            initialData={{ titleEn: 'B2C Pulse Orbit', destinations: [] }}
            initialB2BData={{ titleEn: 'B2B Enterprise Orbit', destinations: [] }}
          />
        </LocaleProvider>
      )

      expect(htmlEn).toContain('Pulse Orbit 3D Portal Settings')
      expect(htmlEn).toContain('Cross-Portal Hub')
      expect(htmlEn).toContain('1. B2C Entertainment Orbit')
      expect(htmlEn).toContain('2. B2B Enterprise Orbit')
      expect(htmlEn).toContain('Save B2C Orbit')
    })

    it('Settings Pulse Orbit Hub renders unified cross-portal navigation in AR', () => {
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <PulseOrbitCMSView
            scopedPortal="ALL"
            allowedTabs={['B2C', 'B2B']}
            defaultTab="B2C"
            initialData={{ titleAr: 'مدار الفعاليات للأفراد', destinations: [] }}
            initialB2BData={{ titleAr: 'مدار الشركات', destinations: [] }}
          />
        </LocaleProvider>
      )

      expect(htmlAr).toContain('مركز نبض الأنظمة ثلاثي الأبعاد (Pulse Orbit Hub)')
      expect(htmlAr).toContain('شامل المنصة')
      expect(htmlAr).toContain('١. مدار الفعاليات والترفيه (B2C)')
      expect(htmlAr).toContain('٢. مدار قطاع الأعمال والشركات (B2B)')
    })

    it('B2C Pulse Orbit renders scoped B2C view and reciprocal handoff to B2B in EN and AR', () => {
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PulseOrbitCMSView
            scopedPortal="B2C"
            allowedTabs={['B2C']}
            defaultTab="B2C"
            initialData={{ titleEn: 'B2C Destinations' }}
          />
        </LocaleProvider>
      )

      expect(htmlEn).toContain('B2C Pulse Orbit 3D Navigation')
      expect(htmlEn).toContain('B2C Public')
      expect(htmlEn).toContain('B2B Enterprise Orbit (Corporate)')
      expect(htmlEn).toContain('href="/en/dashboard/b2b/pulse-orbit"')
      expect(htmlEn).toContain('Open B2B Orbit')
      expect(htmlEn).not.toContain('2. B2B Enterprise Orbit')

      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <PulseOrbitCMSView
            scopedPortal="B2C"
            allowedTabs={['B2C']}
            defaultTab="B2C"
            initialData={{ titleAr: 'وجهات الفعاليات' }}
          />
        </LocaleProvider>
      )

      expect(htmlAr).toContain('محرر نبض الفعاليات ثلاثي الأبعاد (B2C)')
      expect(htmlAr).toContain('ترفيه للأفراد')
      expect(htmlAr).toContain('مدار قطاع الأعمال والشركات (B2B)')
      expect(htmlAr).toContain('href="/ar/dashboard/b2b/pulse-orbit"')
      expect(htmlAr).toContain('فتح محرر B2B')
    })

    it('B2B Pulse Orbit renders scoped B2B view and reciprocal handoff to B2C in EN and AR', () => {
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PulseOrbitCMSView
            scopedPortal="B2B"
            allowedTabs={['B2B']}
            defaultTab="B2B"
            initialB2BData={{ titleEn: 'B2B Solutions' }}
          />
        </LocaleProvider>
      )

      expect(htmlEn).toContain('B2B Pulse Orbit 3D Navigation')
      expect(htmlEn).toContain('B2B Enterprise')
      expect(htmlEn).toContain('B2C Entertainment Orbit (Public)')
      expect(htmlEn).toContain('href="/en/dashboard/b2c/pulse-orbit"')
      expect(htmlEn).toContain('Open B2C Orbit')

      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <PulseOrbitCMSView
            scopedPortal="B2B"
            allowedTabs={['B2B']}
            defaultTab="B2B"
            initialB2BData={{ titleAr: 'حلول الشركات' }}
          />
        </LocaleProvider>
      )

      expect(htmlAr).toContain('محرر نبض قطاع الأعمال ثلاثي الأبعاد (B2B)')
      expect(htmlAr).toContain('قطاع الأعمال')
      expect(htmlAr).toContain('مدار الفعاليات والترفيه للأفراد (B2C)')
      expect(htmlAr).toContain('href="/ar/dashboard/b2c/pulse-orbit"')
      expect(htmlAr).toContain('فتح محرر B2C')
    })
  })

  // =========================================================================
  // 2. ROLE & SCOPE PERMISSIONS (RBAC & DEEP LINKING)
  // =========================================================================
  describe('2. Role and Scope Permissions', () => {
    it('SUPER_ADMIN accessing /dashboard/settings/pulse-orbit renders unified hub', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'super-1', role: 'SUPER_ADMIN' },
      } as any)

      vi.spyOn(db.pages, 'findUnique').mockResolvedValue(null)

      const res = await PulseOrbitSettingsPage({
        params: Promise.resolve({ locale: 'en' }),
      })
      expect(res).toBeDefined()
    })

    it('B2C_ADMIN accessing /dashboard/settings/pulse-orbit is deep-linked to /dashboard/b2c/pulse-orbit', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'b2c-admin-1', role: 'B2C_ADMIN' },
      } as any)

      try {
        await PulseOrbitSettingsPage({
          params: Promise.resolve({ locale: 'en' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard/b2c/pulse-orbit')
      }
      expect(redirect).toHaveBeenCalledWith('/en/dashboard/b2c/pulse-orbit')
    })

    it('B2B_ADMIN accessing /dashboard/settings/pulse-orbit is deep-linked to /dashboard/b2b/pulse-orbit in AR', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'b2b-admin-1', role: 'B2B_ADMIN' },
      } as any)

      try {
        await PulseOrbitSettingsPage({
          params: Promise.resolve({ locale: 'ar' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/ar/dashboard/b2b/pulse-orbit')
      }
      expect(redirect).toHaveBeenCalledWith('/ar/dashboard/b2b/pulse-orbit')
    })

    it('B2C_ADMIN can access /dashboard/b2c/pulse-orbit but is rejected from /dashboard/b2b/pulse-orbit', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'b2c-1', role: 'B2C_ADMIN' },
      } as any)

      vi.spyOn(db.pages, 'findUnique').mockResolvedValue(null)

      const b2cPage = await B2CPulseOrbitCMSPage({
        params: Promise.resolve({ locale: 'en' }),
      })
      expect(b2cPage).toBeDefined()

      try {
        await B2BPulseOrbitCMSPage({
          params: Promise.resolve({ locale: 'en' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard')
      }
      expect(redirect).toHaveBeenCalledWith('/en/dashboard')
    })

    it('B2B_ADMIN can access /dashboard/b2b/pulse-orbit but is rejected from /dashboard/b2c/pulse-orbit', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'b2b-1', role: 'B2B_ADMIN' },
      } as any)

      vi.spyOn(db.pages, 'findUnique').mockResolvedValue(null)

      const b2bPage = await B2BPulseOrbitCMSPage({
        params: Promise.resolve({ locale: 'en' }),
      })
      expect(b2bPage).toBeDefined()

      try {
        await B2CPulseOrbitCMSPage({
          params: Promise.resolve({ locale: 'en' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard')
      }
      expect(redirect).toHaveBeenCalledWith('/en/dashboard')
    })

    it('Unauthorized role (CLIENT) is rejected from all Pulse Orbit pages', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'client-1', role: 'CLIENT' },
      } as any)

      try {
        await B2CPulseOrbitCMSPage({
          params: Promise.resolve({ locale: 'en' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard')
      }

      try {
        await B2BPulseOrbitCMSPage({
          params: Promise.resolve({ locale: 'en' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard')
      }

      try {
        await PulseOrbitSettingsPage({
          params: Promise.resolve({ locale: 'en' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard')
      }
    })
  })

  // =========================================================================
  // 3. EXACT CMS PAGES & OWNERSHIP HANDOFFS
  // =========================================================================
  describe('3. Exact CMS Pages & Ownership Handoffs', () => {
    it('isManagedCMSPage correctly identifies all Pulse Orbit page slugs', () => {
      expect(isManagedCMSPage('pulse-orbit')).toBe(true)
      expect(isManagedCMSPage('b2c-pulse-orbit')).toBe(true)
      expect(isManagedCMSPage('b2b-pulse-orbit')).toBe(true)
      expect(isManagedCMSPage('unknown-page')).toBe(false)
    })

    it('getManagedCMSPage returns exact specialized routes and endpoints', () => {
      const b2cEntry = getManagedCMSPage('b2c-pulse-orbit')
      expect(b2cEntry?.specializedEditorPath).toBe('/dashboard/b2c/pulse-orbit')
      expect(b2cEntry?.canonicalApiEndpoint).toBe('/api/cms/pages/b2c-pulse-orbit')
      expect(b2cEntry?.domain).toBe('B2C')

      const b2bEntry = getManagedCMSPage('b2b-pulse-orbit')
      expect(b2bEntry?.specializedEditorPath).toBe('/dashboard/b2b/pulse-orbit')
      expect(b2bEntry?.canonicalApiEndpoint).toBe('/api/cms/pages/b2b-pulse-orbit')
      expect(b2bEntry?.domain).toBe('B2B')

      const legacyEntry = getManagedCMSPage('pulse-orbit')
      expect(legacyEntry?.specializedEditorPath).toBe('/dashboard/b2c/pulse-orbit')
      expect(legacyEntry?.canonicalApiEndpoint).toBe('/api/cms/pages/pulse-orbit')
    })
  })

  // =========================================================================
  // 4. B2C/B2B SAVE ISOLATION
  // =========================================================================
  describe('4. B2C / B2B Save Isolation', () => {
    it('Saving B2C Pulse Orbit updates b2c-pulse-orbit & pulse-orbit without altering b2b-pulse-orbit', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'B2C_ADMIN' },
      } as any)

      const pagesUpsertSpy = vi.spyOn(db.pages, 'upsert').mockResolvedValue({} as any)

      const req = new NextRequest('http://localhost:3000/api/cms/pages/b2c-pulse-orbit', {
        method: 'PUT',
        body: JSON.stringify({
          content: {
            titleEn: 'Updated B2C Headline',
            destinations: [{ id: 'attractions', labelEn: 'Snow Park', href: '/b2c/attractions' }],
          },
        }),
      })

      const res = await updateCMSPage(req, { params: Promise.resolve({ slug: 'b2c-pulse-orbit' }) })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)

      // Verified: saved to b2c-pulse-orbit and synced to pulse-orbit
      const savedSlugs = pagesUpsertSpy.mock.calls.map((call: any) => call[0]?.where?.slug)
      expect(savedSlugs).toContain('b2c-pulse-orbit')
      expect(savedSlugs).toContain('pulse-orbit')
      expect(savedSlugs).not.toContain('b2b-pulse-orbit')
    })

    it('Saving B2B Pulse Orbit updates b2b-pulse-orbit without altering b2c-pulse-orbit or pulse-orbit', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-2', role: 'B2B_ADMIN' },
      } as any)

      const pagesUpsertSpy = vi.spyOn(db.pages, 'upsert').mockResolvedValue({} as any)

      const req = new NextRequest('http://localhost:3000/api/cms/pages/b2b-pulse-orbit', {
        method: 'PUT',
        body: JSON.stringify({
          content: {
            titleEn: 'Updated B2B Enterprise Solutions',
            destinations: [{ id: 'services', labelEn: 'Turnkey AV', href: '/b2b/services' }],
          },
        }),
      })

      const res = await updateCMSPage(req, { params: Promise.resolve({ slug: 'b2b-pulse-orbit' }) })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)

      // Verified: saved exclusively to b2b-pulse-orbit
      const savedSlugs = pagesUpsertSpy.mock.calls.map((call: any) => call[0]?.where?.slug)
      expect(savedSlugs).toContain('b2b-pulse-orbit')
      expect(savedSlugs).not.toContain('b2c-pulse-orbit')
      expect(savedSlugs).not.toContain('pulse-orbit')
    })
  })
})
