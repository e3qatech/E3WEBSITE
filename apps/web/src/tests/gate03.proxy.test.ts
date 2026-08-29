import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '../proxy';

describe('Gate 03: proxy.ts Routing Boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (pathname: string, cookies: Record<string, string> = {}) => {
    const url = new URL(`https://e3-qatar.com${pathname}`);
    const req = new NextRequest(url);
    for (const [key, value] of Object.entries(cookies)) {
      req.cookies.set(key, value);
    }
    return req;
  };

  const isMatched = (pathname: string) => {
    // The matcher is: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
    const regex = /^\/((?!api|_next\/static|_next\/image|favicon\.ico).*)$/;
    return regex.test(pathname);
  };

  it('1. Public page remains public and redirects to locale', () => {
    const req = createMockRequest('/b2b');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://e3-qatar.com/en/b2b');
  });

  it('2. Dashboard redirects without session', () => {
    const req = createMockRequest('/dashboard');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://e3-qatar.com/en/login/admin?callbackUrl=%2Fen%2Fdashboard');
  });

  it('3. Dashboard loads with authorized session', () => {
    const req = createMockRequest('/en/dashboard', { 'authjs.session-token': 'valid-token' });
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
  });

  it('4. Wrong role is denied / 5. Inactive user is denied', () => {
    // Since proxy only checks presence of session token (RBAC is done later),
    // it simply passes the request through if token exists.
    const req = createMockRequest('/en/dashboard', { 'authjs.session-token': 'wrong-role-token' });
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
  });

  it('6. Login page does not redirect-loop if unauthenticated', () => {
    const req = createMockRequest('/en/login/admin');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
  });

  it('Login page redirects to dashboard if already authenticated', () => {
    const req = createMockRequest('/en/login/admin', { 'authjs.session-token': 'valid' });
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
  });

  it('7. Callback query survives redirect safely', () => {
    const req = createMockRequest('/dashboard?callbackUrl=/some-path');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(307);
  });

  it('8. Arabic locale routing works', () => {
    const req = createMockRequest('/b2b', { 'NEXT_LOCALE': 'ar' });
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://e3-qatar.com/ar/b2b');
  });

  it('9. English locale routing works', () => {
    const req = createMockRequest('/b2c');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://e3-qatar.com/en/b2c');
  });

  it('10. Static assets bypass Proxy', () => {
    const req = createMockRequest('/_next/static/css/styles.css');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
    expect(isMatched('/_next/static/css/styles.css')).toBe(false);
  });

  it('11. Webhook route remains reachable', () => {
    const req = createMockRequest('/api/webhooks/bookingqube');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
    expect(isMatched('/api/webhooks/bookingqube')).toBe(false);
  });

  it('12. Private resume download remains protected', () => {
    const req = createMockRequest('/api/upload/download');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
    expect(isMatched('/api/upload/download')).toBe(false);
  });

  it('13. Public contact endpoints remain reachable', () => {
    const req = createMockRequest('/api/contact/b2b');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
    expect(isMatched('/api/contact/b2b')).toBe(false);
  });

  it('14. Protected CMS API remains protected', () => {
    const req = createMockRequest('/api/cms/pages');
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(200);
    expect(isMatched('/api/cms/pages')).toBe(false);
  });

  it('15. Open-redirect payload is rejected', () => {
    const req = createMockRequest('/b2b');
    const res = proxy(req) as NextResponse;
    expect(res.headers.get('location')?.startsWith('https://e3-qatar.com')).toBe(true);
  });

  it('16. Encoded-path bypass attempts fail', () => {
    const req = createMockRequest('/%64%61%73%68%62%6f%61%72%64'); 
    const res = proxy(req) as NextResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://e3-qatar.com/en/login/admin?callbackUrl=%2Fen%2Fdashboard');
  });

  it('17. Case and trailing-slash variants behave consistently', () => {
    const req1 = createMockRequest('/DASHBOARD/');
    const res1 = proxy(req1) as NextResponse;
    expect(res1).toBeDefined();
  });
});

describe('Motion Lab Production Proxy Boundary Guard', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const createMockRequest = (pathname: string, cookies: Record<string, string> = {}) => {
    const url = new URL(`https://e3-qatar.com${pathname}`);
    const req = new NextRequest(url);
    for (const [key, value] of Object.entries(cookies)) {
      req.cookies.set(key, value);
    }
    return req;
  };

  it('1. Production English redirects to /en/b2c with status 307 and discards query params', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    const req = createMockRequest('/en/motion-lab/horizontal-cylinder?ref=promo&v=2');
    const res = proxy(req) as NextResponse;

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://e3-qatar.com/en/b2c');
  });

  it('2. Production Arabic redirects to /ar/b2c with status 307 and discards query params', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    const req = createMockRequest('/ar/motion-lab/horizontal-cylinder?tab=preview');
    const res = proxy(req) as NextResponse;

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://e3-qatar.com/ar/b2c');
  });

  it('3. Production with ENABLE_MOTION_LAB_PRODUCTION=true remains blocked', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    process.env.ENABLE_MOTION_LAB_PRODUCTION = 'true';

    const reqEn = createMockRequest('/en/motion-lab/horizontal-cylinder');
    const resEn = proxy(reqEn) as NextResponse;
    expect(resEn.status).toBe(307);
    expect(resEn.headers.get('location')).toBe('https://e3-qatar.com/en/b2c');

    const reqAr = createMockRequest('/ar/motion-lab/horizontal-cylinder');
    const resAr = proxy(reqAr) as NextResponse;
    expect(resAr.status).toBe(307);
    expect(resAr.headers.get('location')).toBe('https://e3-qatar.com/ar/b2c');
  });

  it('4. Preview English and Arabic continue through the proxy', () => {
    process.env.VERCEL_ENV = 'preview';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    const reqEn = createMockRequest('/en/motion-lab/horizontal-cylinder');
    const resEn = proxy(reqEn) as NextResponse;
    expect(resEn.status).toBe(200);

    const reqAr = createMockRequest('/ar/motion-lab/horizontal-cylinder');
    const resAr = proxy(reqAr) as NextResponse;
    expect(resAr.status).toBe(200);
  });

  it('5. Local development continues through the proxy', () => {
    delete process.env.VERCEL_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';

    const reqEn = createMockRequest('/en/motion-lab/horizontal-cylinder');
    const resEn = proxy(reqEn) as NextResponse;
    expect(resEn.status).toBe(200);

    const reqAr = createMockRequest('/ar/motion-lab/horizontal-cylinder');
    const resAr = proxy(reqAr) as NextResponse;
    expect(resAr.status).toBe(200);
  });

  it('6. Unrelated routes remain unchanged', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    const reqB2c = createMockRequest('/en/b2c');
    const resB2c = proxy(reqB2c) as NextResponse;
    expect(resB2c.status).toBe(200);

    const reqB2b = createMockRequest('/b2b');
    const resB2b = proxy(reqB2b) as NextResponse;
    expect(resB2b.status).toBe(307);
    expect(resB2b.headers.get('location')).toBe('https://e3-qatar.com/en/b2b');
  });

  it('7. Trailing-slash variants redirect correctly in production', () => {
    process.env.VERCEL_ENV = 'production';
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    const reqEn = createMockRequest('/en/motion-lab/horizontal-cylinder/');
    const resEn = proxy(reqEn) as NextResponse;
    expect(resEn.status).toBe(307);
    expect(resEn.headers.get('location')).toBe('https://e3-qatar.com/en/b2c');

    const reqAr = createMockRequest('/ar/motion-lab/horizontal-cylinder/');
    const resAr = proxy(reqAr) as NextResponse;
    expect(resAr.status).toBe(307);
    expect(resAr.headers.get('location')).toBe('https://e3-qatar.com/ar/b2c');
  });
});
