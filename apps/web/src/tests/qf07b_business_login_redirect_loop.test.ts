import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';
import { sanitizeCallbackUrl, getAuthorizedLandingRoute } from '../lib/landing-route';
import { normalizeRole, isAuthorizedForPortal } from '../lib/auth-roles';

describe('QF-07-B: Business Login Redirect Loop & Multi-Tenant Authorization', () => {
  // Helper to create mock NextRequest
  function createReq(url: string, cookies: Record<string, string> = {}) {
    const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
      headers: new Headers({
        cookie: Object.entries(cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join('; '),
      }),
    });
    return req;
  }

  // 1. Signed-out user requests to /en/business and /ar/business
  it('1. Signed-out user accessing /en/business or /ar/business redirects to localized business login exactly once', () => {
    const reqEn = createReq('http://localhost:3000/en/business');
    const resEn = proxy(reqEn);
    expect(resEn.status).toBe(307);
    const locationEn = resEn.headers.get('location');
    expect(locationEn).toBe('http://localhost:3000/en/login/business');

    const reqAr = createReq('http://localhost:3000/ar/business');
    const resAr = proxy(reqAr);
    expect(resAr.status).toBe(307);
    const locationAr = resAr.headers.get('location');
    expect(locationAr).toBe('http://localhost:3000/ar/login/business');

    // Query parameters like callbackUrl are preserved safely without loop
    const reqWithCb = createReq('http://localhost:3000/en/business?callbackUrl=/en/business/rfps/123');
    const resWithCb = proxy(reqWithCb);
    expect(resWithCb.status).toBe(307);
    expect(resWithCb.headers.get('location')).toBe('http://localhost:3000/en/login/business?callbackUrl=/en/business/rfps/123');
  });

  // 2. Signed-out user requesting the login page directly (NO REDIRECT LOOP)
  it('2. Signed-out user accessing /en/login/business or /ar/login/business receives 200/next, NEVER another redirect', () => {
    const reqEn = createReq('http://localhost:3000/en/login/business');
    const resEn = proxy(reqEn);
    // Should NOT redirect (status is 200 / Next response)
    expect(resEn.status).toBe(200);
    expect(resEn.headers.get('location')).toBeNull();

    const reqEnWithCb = createReq('http://localhost:3000/en/login/business?callbackUrl=/en/business');
    const resEnWithCb = proxy(reqEnWithCb);
    expect(resEnWithCb.status).toBe(200);
    expect(resEnWithCb.headers.get('location')).toBeNull();

    const reqAr = createReq('http://localhost:3000/ar/login/business');
    const resAr = proxy(reqAr);
    expect(resAr.status).toBe(200);
    expect(resAr.headers.get('location')).toBeNull();

    const reqArWithCb = createReq('http://localhost:3000/ar/login/business?callbackUrl=/ar/business');
    const resArWithCb = proxy(reqArWithCb);
    expect(resArWithCb.status).toBe(200);
    expect(resArWithCb.headers.get('location')).toBeNull();
  });

  // 3. Signed-in user with session cookie can access protected business portal
  it('3. Authenticated user with session cookie passes edge guard to /en/business and /ar/business', () => {
    const cookies = {
      'next-auth.session-token': 'mock-valid-session-jwt',
    };

    const reqEn = createReq('http://localhost:3000/en/business', cookies);
    const resEn = proxy(reqEn);
    expect(resEn.status).toBe(200);
    expect(resEn.headers.get('location')).toBeNull();

    const reqAr = createReq('http://localhost:3000/ar/business', cookies);
    const resAr = proxy(reqAr);
    expect(resAr.status).toBe(200);
    expect(resAr.headers.get('location')).toBeNull();
  });

  // 4. Legacy root /client/login redirects to localized business login
  it('4. Legacy /client/login redirects cleanly to /en/login/business or /ar/login/business', () => {
    const reqEn = createReq('http://localhost:3000/client/login');
    const resEn = proxy(reqEn);
    expect(resEn.status).toBe(307);
    expect(resEn.headers.get('location')).toContain('/en/login/business');

    const reqAr = createReq('http://localhost:3000/client/login', { NEXT_LOCALE: 'ar' });
    const resAr = proxy(reqAr);
    expect(resAr.status).toBe(307);
    expect(resAr.headers.get('location')).toContain('/ar/login/business');
  });

  // 5. Unsafe callbackUrl sanitization
  it('5. Unsafe callbackUrl sanitization: blocks open redirects, javascript:, protocol-relative, and login loops', () => {
    const clientUser = { id: 'u-1', role: 'CLIENT' };

    // External URLs
    expect(sanitizeCallbackUrl('https://malicious.com', clientUser, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('http://phishing.org/login', clientUser, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('//evil.com', clientUser, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('\\\\evil.com', clientUser, 'en')).toBe('/en/business');

    // Script protocols
    expect(sanitizeCallbackUrl('javascript:alert(document.cookie)', clientUser, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('data:text/html,<script>evil()</script>', clientUser, 'en')).toBe('/en/business');

    // Login loops
    expect(sanitizeCallbackUrl('/en/login/business', clientUser, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('/ar/login/admin', clientUser, 'ar')).toBe('/ar/business');
    expect(sanitizeCallbackUrl('/client/login', clientUser, 'en')).toBe('/en/business');

    // Safe valid internal routes
    expect(sanitizeCallbackUrl('/en/business', clientUser, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('/ar/business/rfps/rfp-123', clientUser, 'ar')).toBe('/ar/business/rfps/rfp-123');
    expect(sanitizeCallbackUrl('/en/business/company', clientUser, 'en')).toBe('/en/business/company');

    // Role boundary: Client attempting dashboard callback is redirected to business portal
    expect(sanitizeCallbackUrl('/en/dashboard/b2b', clientUser, 'en')).toBe('/en/business');
  });

  // 6. Role normalization & portal authorization checks
  it('6. Role normalization and authorized portal routing', () => {
    expect(normalizeRole('CLIENT')).toBe('CLIENT');
    expect(normalizeRole('client')).toBe('CLIENT');
    expect(normalizeRole('BUSINESS_USER')).toBe('CLIENT');
    expect(normalizeRole('business_user')).toBe('CLIENT');

    expect(isAuthorizedForPortal('CLIENT', 'business')).toBe(true);
    expect(isAuthorizedForPortal('SUPER_ADMIN', 'admin')).toBe(true);
    expect(isAuthorizedForPortal('STAFF', 'staff')).toBe(true);
    expect(isAuthorizedForPortal('CANDIDATE', 'careers')).toBe(true);
    expect(isAuthorizedForPortal('STAFF', 'business')).toBe(false);
    expect(isAuthorizedForPortal('CANDIDATE', 'business')).toBe(false);

    expect(getAuthorizedLandingRoute({ role: 'CLIENT' }, 'en')).toBe('/en/business');
    expect(getAuthorizedLandingRoute({ role: 'CLIENT' }, 'ar')).toBe('/ar/business');
    expect(getAuthorizedLandingRoute({ role: 'BUSINESS_USER' }, 'ar')).toBe('/ar/business');
  });
});
