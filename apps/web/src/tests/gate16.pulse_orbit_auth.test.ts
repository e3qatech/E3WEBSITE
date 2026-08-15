 
import { describe, it, expect } from 'vitest';
import { getMergedCMSPageContent } from '../lib/cms-default-pages';
import { getAuthorizedLandingRoute, sanitizeCallbackUrl } from '../lib/landing-route';
import { POST as registerPOST } from '../app/api/auth/register/route';
import { NextRequest } from 'next/server';

describe('Gate 16: Pulse Orbit Destination & Authentication Audits', () => {
  describe('1. Pulse Orbit CMS Image Lifecycle & Merging', () => {
    it('should preserve uploaded destination mediaUrl when merging CMS content', () => {
      const customPayload = {
        titleEn: 'CUSTOM ORBIT TITLE',
        destinations: [
          {
            id: 'attractions',
            labelEn: 'Custom Snow Park',
            labelAr: 'حديقة الثلج المخصصة',
            href: '/b2c/attractions',
            descEn: 'Updated description',
            descAr: 'وصف محدث',
            mediaUrl: 'https://cdn.e3.qa/uploads/custom_hero_snow.webp',
            enabled: true,
          },
        ],
      };

      const merged = getMergedCMSPageContent('pulse-orbit', customPayload);
      expect(merged.titleEn).toBe('CUSTOM ORBIT TITLE');
      expect(merged.destinations.length).toBeGreaterThan(0);
      expect(merged.destinations[0].mediaUrl).toBe('https://cdn.e3.qa/uploads/custom_hero_snow.webp');
      expect(merged.destinations[0].labelEn).toBe('Custom Snow Park');
    });

    it('should fallback gracefully to default destination media when raw mediaUrl is empty', () => {
      const emptyMediaPayload = {
        destinations: [
          {
            id: 'attractions',
            mediaUrl: '',
          },
        ],
      };

      const merged = getMergedCMSPageContent('pulse-orbit', emptyMediaPayload);
      expect(merged.destinations[0].mediaUrl).toBeTruthy();
      expect(merged.destinations[0].mediaUrl).toContain('http');
    });
  });

  describe('2. Public vs Restricted Sign-Up Policy & RBAC Protection', () => {
    it('should allow CANDIDATE (Customer) registration', async () => {
      const req = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Customer',
          email: `test_cust_${Date.now()}@example.com`,
          password: 'Password123!',
          role: 'CANDIDATE',
        }),
      });

      const res = await registerPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.user.role).toBe('CANDIDATE');
    });

    it('should allow CLIENT (Organiser) registration', async () => {
      const req = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Organiser',
          email: `test_org_${Date.now()}@example.com`,
          password: 'Password123!',
          role: 'CLIENT',
        }),
      });

      const res = await registerPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.user.role).toBe('CLIENT');
    });

    it('should REJECT public admin and staff registration with 403 Forbidden', async () => {
      const reqAdmin = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Hacker Admin',
          email: `hacker_admin_${Date.now()}@example.com`,
          password: 'Password123!',
          role: 'SUPER_ADMIN',
        }),
      });

      const resAdmin = await registerPOST(reqAdmin);
      expect(resAdmin.status).toBe(403);
      const jsonAdmin = await resAdmin.json();
      expect(jsonAdmin.error).toContain('Admin and staff accounts cannot be created publicly');
    });
  });

  describe('3. Role Routing & Dashboard Security', () => {
    it('should map roles to correct authorized landing routes', () => {
      expect(getAuthorizedLandingRoute({ role: 'SUPER_ADMIN' }, 'en')).toBe('/en/dashboard');
      expect(getAuthorizedLandingRoute({ role: 'SALES_ADMIN' }, 'en')).toBe('/en/dashboard/b2b');
      expect(getAuthorizedLandingRoute({ role: 'SUPPORT_ADMIN' }, 'en')).toBe('/en/dashboard/b2c');
      expect(getAuthorizedLandingRoute({ role: 'CLIENT' }, 'en')).toBe('/en/business');
      expect(getAuthorizedLandingRoute({ role: 'CANDIDATE' }, 'en')).toBe('/en/candidate');
    });

    it('should sanitize callbackUrls to prevent open redirect and privilege escalation', () => {
      // Prevent CLIENT from redirecting to admin dashboard
      const sanitizedClient = sanitizeCallbackUrl('/en/dashboard/settings/users', { role: 'CLIENT' }, 'en');
      expect(sanitizedClient).toBe('/en/business');

      // Prevent CANDIDATE from accessing admin dashboard
      const sanitizedCandidate = sanitizeCallbackUrl('/en/dashboard', { role: 'CANDIDATE' }, 'en');
      expect(sanitizedCandidate).toBe('/en/candidate');

      // Reject external URLs
      const sanitizedExternal = sanitizeCallbackUrl('https://evil.com/phish', { role: 'CLIENT' }, 'en');
      expect(sanitizedExternal).toBe('/en/business');
    });
  });
});
