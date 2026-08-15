import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LocaleProvider } from '@/components/layout/LocaleProvider'
import UsersSettingsPage from '@/app/[locale]/dashboard/settings/users/page'
import CRMUsersRedirectPage from '@/app/[locale]/dashboard/crm/users/page'
import { GET as getUsers, POST as createUser } from '@/app/api/admin/users/route'
import { PATCH as updateUser } from '@/app/api/admin/users/[id]/route'
import { POST as changePassword } from '@/app/api/auth/change-password/route'
import { NextRequest } from 'next/server'
import db from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

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

describe('QF-20 — Users/RBAC Manager vs CRM Users Ownership Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // =========================================================================
  // 1. EN/AR ROUTING & REDIRECTS
  // =========================================================================
  describe('1. EN/AR Routing & Redirects', () => {
    it('CRM Users route performs locale-preserving redirect to /dashboard/settings/users in EN', async () => {
      try {
        await CRMUsersRedirectPage({
          params: Promise.resolve({ locale: 'en' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/en/dashboard/settings/users')
      }
      expect(redirect).toHaveBeenCalledWith('/en/dashboard/settings/users')
    })

    it('CRM Users route performs locale-preserving redirect to /dashboard/settings/users in AR', async () => {
      try {
        await CRMUsersRedirectPage({
          params: Promise.resolve({ locale: 'ar' }),
        })
      } catch (err: any) {
        expect(err.digest).toContain('/ar/dashboard/settings/users')
      }
      expect(redirect).toHaveBeenCalledWith('/ar/dashboard/settings/users')
    })

    it('Settings Users renders canonical RBAC management in EN for SUPER_ADMIN', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'super-1', role: 'SUPER_ADMIN', permissions: ['*'] },
      } as any)

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'super-1',
        name: 'Super Admin',
        email: 'admin@e3.qa',
        role: 'SUPER_ADMIN',
        isActive: true,
        sessionVersion: 1,
      } as any)

      vi.spyOn(db.user, 'findMany').mockResolvedValue([
        {
          id: 'u-1',
          name: 'Jane Doe',
          email: 'jane@e3.qa',
          role: 'STAFF',
          isActive: true,
          sessionVersion: 1,
          createdAt: new Date('2026-01-01'),
        } as any,
      ])

      const res = await UsersSettingsPage({
        params: Promise.resolve({ locale: 'en' }),
      })

      const html = renderToStaticMarkup(<LocaleProvider defaultLocale="en">{res}</LocaleProvider>)
      expect(html).toContain('User &amp; Access Control (RBAC)')
      expect(html).toContain('RBAC Security')
      expect(html).toContain('Platform Accounts &amp; Role Assignments')
      expect(html).toContain('jane@e3.qa')
      expect(html).toContain('Change Your Password')
    })

    it('Settings Users renders canonical RBAC management in AR for SUPER_ADMIN', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'super-1', role: 'SUPER_ADMIN', permissions: ['*'] },
      } as any)

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'super-1',
        name: 'Super Admin',
        email: 'admin@e3.qa',
        role: 'SUPER_ADMIN',
        isActive: true,
        sessionVersion: 1,
      } as any)

      vi.spyOn(db.user, 'findMany').mockResolvedValue([
        {
          id: 'u-1',
          name: 'محمد علي',
          email: 'mohamed@e3.qa',
          role: 'B2C_ADMIN',
          isActive: true,
          sessionVersion: 1,
          createdAt: new Date('2026-01-01'),
        } as any,
      ])

      const res = await UsersSettingsPage({
        params: Promise.resolve({ locale: 'ar' }),
      })

      const html = renderToStaticMarkup(<LocaleProvider defaultLocale="ar">{res}</LocaleProvider>)
      expect(html).toContain('إدارة المستخدمين وصلاحيات الأدوار (RBAC)')
      expect(html).toContain('أمان وصلاحيات')
      expect(html).toContain('حسابات المنصة وتعيين صلاحيات الأدوار')
      expect(html).toContain('mohamed@e3.qa')
    })
  })

  // =========================================================================
  // 2. SERVER-SIDE PERMISSIONS & DENIAL STATES
  // =========================================================================
  describe('2. Server-Side Permissions & Denial States', () => {
    it('Unauthenticated user receives localized Access Denied on Settings Users in EN', async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      const res = await UsersSettingsPage({
        params: Promise.resolve({ locale: 'en' }),
      })

      const html = renderToStaticMarkup(<LocaleProvider defaultLocale="en">{res}</LocaleProvider>)
      expect(html).toContain('Authentication Required')
      expect(html).toContain('Please log in with an administrative account')
    })

    it('Unauthenticated user receives localized Access Denied on Settings Users in AR', async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      const res = await UsersSettingsPage({
        params: Promise.resolve({ locale: 'ar' }),
      })

      const html = renderToStaticMarkup(<LocaleProvider defaultLocale="ar">{res}</LocaleProvider>)
      expect(html).toContain('تسجيل الدخول مطلوب')
      expect(html).toContain('يرجى تسجيل الدخول بحساب إداري')
    })

    it('Unauthorized role (CLIENT) receives localized RBAC restriction in EN and AR', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'client-1', role: 'CLIENT', permissions: ['crm.leads.read'] },
      } as any)

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'client-1',
        name: 'Client User',
        email: 'client@company.qa',
        role: 'CLIENT',
        isActive: true,
        sessionVersion: 1,
      } as any)

      const resEn = await UsersSettingsPage({
        params: Promise.resolve({ locale: 'en' }),
      })
      const htmlEn = renderToStaticMarkup(<LocaleProvider defaultLocale="en">{resEn}</LocaleProvider>)
      expect(htmlEn).toContain('RBAC Access Restricted')
      expect(htmlEn).toContain('Your role does not have permission')

      const resAr = await UsersSettingsPage({
        params: Promise.resolve({ locale: 'ar' }),
      })
      const htmlAr = renderToStaticMarkup(<LocaleProvider defaultLocale="ar">{resAr}</LocaleProvider>)
      expect(htmlAr).toContain('صلاحيات الوصول مقيدة (RBAC)')
      expect(htmlAr).toContain('حسابك لا يمتلك الصلاحيات المطلوبة')
    })
  })

  // =========================================================================
  // 3. API ROUTE GUARDS & DATA SANITIZATION
  // =========================================================================
  describe('3. API Route Guards & Zero Secrets Exposure', () => {
    it('GET /api/admin/users returns 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as any)

      const req = new NextRequest('http://localhost:3000/api/admin/users')
      const res = await getUsers(req)
      expect(res.status).toBe(401)
    })

    it('GET /api/admin/users returns 403 for unauthorized role (CANDIDATE)', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'cand-1', role: 'CANDIDATE', permissions: [] },
      } as any)

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'cand-1',
        role: 'CANDIDATE',
        isActive: true,
        sessionVersion: 1,
      } as any)

      const req = new NextRequest('http://localhost:3000/api/admin/users')
      const res = await getUsers(req)
      expect(res.status).toBe(403)
    })

    it('GET /api/admin/users returns 200 for SUPER_ADMIN with zero password exposure', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'super-1', role: 'SUPER_ADMIN', permissions: ['*'] },
      } as any)

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'super-1',
        role: 'SUPER_ADMIN',
        isActive: true,
        sessionVersion: 1,
      } as any)

      vi.spyOn(db.user, 'findMany').mockResolvedValue([
        {
          id: 'u-1',
          name: 'Jane Doe',
          email: 'jane@e3.qa',
          role: 'STAFF',
          isActive: true,
          sessionVersion: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ])

      const req = new NextRequest('http://localhost:3000/api/admin/users')
      const res = await getUsers(req)
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(Array.isArray(json)).toBe(true)
      expect(json[0].email).toBe('jane@e3.qa')
      expect(json[0].password).toBeUndefined()
      expect(json[0].passwordHash).toBeUndefined()
      expect(json[0].resetToken).toBeUndefined()
    })

    it('POST /api/admin/users rejects unauthorized creation with 403', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'b2c-1', role: 'B2C_ADMIN', permissions: ['b2c.content.write'] },
      } as any)

      vi.spyOn(db.user, 'findUnique').mockResolvedValue({
        id: 'b2c-1',
        role: 'B2C_ADMIN',
        isActive: true,
        sessionVersion: 1,
      } as any)

      const req = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Hacker',
          email: 'hacker@test.com',
          role: 'SUPER_ADMIN',
        }),
      })

      const res = await createUser(req)
      expect(res.status).toBe(403)
    })

    it('POST /api/admin/users allows SUPER_ADMIN to create user with zero secrets leak', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'super-1', role: 'SUPER_ADMIN', permissions: ['*'] },
      } as any)

      vi.spyOn(db.user, 'findUnique')
        .mockResolvedValueOnce({
          id: 'super-1',
          role: 'SUPER_ADMIN',
          isActive: true,
          sessionVersion: 1,
        } as any)
        .mockResolvedValueOnce(null) // no existing user

      vi.spyOn(db.user, 'create').mockResolvedValue({
        id: 'new-u-1',
        name: 'New Admin',
        email: 'newadmin@e3.qa',
        role: 'B2B_ADMIN',
        isActive: true,
        sessionVersion: 1,
        createdAt: new Date(),
      } as any)

      const req = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Admin',
          email: 'newadmin@e3.qa',
          password: 'SecurePassword123!',
          role: 'B2B_ADMIN',
        }),
      })

      const res = await createUser(req)
      const json = await res.json()

      expect(res.status).toBe(201)
      expect(json.email).toBe('newadmin@e3.qa')
      expect(json.password).toBeUndefined()
      expect(json.passwordHash).toBeUndefined()
    })

    it('PATCH /api/admin/users/[id] allows SUPER_ADMIN to freeze account and increment sessionVersion', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'super-1', role: 'SUPER_ADMIN', permissions: ['*'] },
      } as any)

      vi.spyOn(db.user, 'findUnique')
        .mockResolvedValueOnce({
          id: 'super-1',
          role: 'SUPER_ADMIN',
          isActive: true,
          sessionVersion: 1,
        } as any)
        .mockResolvedValueOnce({
          id: 'target-u-1',
          role: 'STAFF',
          isActive: true,
          sessionVersion: 2,
        } as any)

      const userUpdateSpy = vi.spyOn(db.user, 'update').mockResolvedValue({
        id: 'target-u-1',
        name: 'Target User',
        email: 'target@e3.qa',
        role: 'STAFF',
        isActive: false,
        sessionVersion: 3,
        updatedAt: new Date(),
      } as any)

      const req = new NextRequest('http://localhost:3000/api/admin/users/target-u-1', {
        method: 'PATCH',
        body: JSON.stringify({
          isActive: false,
        }),
      })

      const res = await updateUser(req, { params: Promise.resolve({ id: 'target-u-1' }) })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.isActive).toBe(false)
      expect(userUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'target-u-1' },
          data: expect.objectContaining({
            isActive: false,
            sessionVersion: 3,
          }),
        })
      )
    })
  })

  // =========================================================================
  // 4. PRESERVE SELF-PASSWORD FUNCTIONALITY
  // =========================================================================
  describe('4. Self-Password Functionality Preserved', () => {
    it('POST /api/auth/change-password validates current password and updates hash & session', async () => {
      const hashedOldPassword = await bcrypt.hash('OldSecret123!', 10)

      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-self-1', role: 'STAFF', permissions: [] },
      } as any)

      vi.spyOn(db.user, 'findUnique')
        .mockResolvedValueOnce({
          id: 'user-self-1',
          role: 'STAFF',
          isActive: true,
          sessionVersion: 1,
        } as any)
        .mockResolvedValueOnce({
          id: 'user-self-1',
          password: hashedOldPassword,
          sessionVersion: 1,
        } as any)

      const userUpdateSpy = vi.spyOn(db.user, 'update').mockResolvedValue({} as any)

      const req = new NextRequest('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: 'OldSecret123!',
          newPassword: 'NewStrongPassword456!',
        }),
      })

      const res = await changePassword(req)
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(userUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-self-1' },
          data: expect.objectContaining({
            sessionVersion: 2,
          }),
        })
      )
    })
  })
})
