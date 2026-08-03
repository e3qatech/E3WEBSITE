import test from 'node:test';
import assert from 'node:assert';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '../../proxy';

// Force node environment to match development for tests
(process.env as any).NODE_ENV = 'development';

test('Proxy Route Matrix', async (t) => {
  
  await t.test('1. Public B2B/B2C route without locale redirects to include default locale prefix', () => {
    const req = new NextRequest('http://localhost:3000/b2b');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 307);
    assert.strictEqual(res.headers.get('Location'), 'http://localhost:3000/en/b2b');
  });

  await t.test('2. Public B2B/B2C route with locale is allowed and sets theme/locale headers', () => {
    const req = new NextRequest('http://localhost:3000/en/b2b');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 200);
    // Since Next.js NextResponse.next() request headers are modified inside NextResponse.next({ request: { headers } })
    // We can't easily inspect those headers directly from the response object without Next.js internals,
    // but we can assert it returned a success next() response.
  });

  await t.test('3. Unauthenticated dashboard route redirects to login', () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 307);
    assert.strictEqual(res.headers.get('Location'), 'http://localhost:3000/auth/login');
  });

  await t.test('4. Authenticated dashboard route (authjs.session-token) is allowed', () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    req.cookies.set('authjs.session-token', 'mock-token-value');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 200); // Allow
  });

  await t.test('5. Authenticated dashboard route (__Secure-authjs.session-token) is allowed', () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    req.cookies.set('__Secure-authjs.session-token', 'mock-token-value');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 200); // Allow
  });

  await t.test('6. Authenticated user visiting login redirects to dashboard', () => {
    const req = new NextRequest('http://localhost:3000/auth/login');
    req.cookies.set('authjs.session-token', 'mock-token-value');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 307);
    assert.strictEqual(res.headers.get('Location'), 'http://localhost:3000/dashboard');
  });

  await t.test('7. API route is excluded by proxy code checks (or next.js matcher)', () => {
    const req = new NextRequest('http://localhost:3000/api/crm/leads/ingest');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 200); // Should call NextResponse.next() directly
  });

  await t.test('8. Static files (via PUBLIC_FILE regex) bypass localization redirects', () => {
    const req = new NextRequest('http://localhost:3000/images/hero.png');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 200); // Direct NextResponse.next()
  });

  await t.test('9. RTL/Arabic locale route prefix is preserved', () => {
    const req = new NextRequest('http://localhost:3000/ar/b2c');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 200); // Direct NextResponse.next()
  });

  await t.test('10. Query parameters are fully preserved during locale redirect', () => {
    const req = new NextRequest('http://localhost:3000/b2b?query=param&test=true');
    const res = proxy(req);
    assert.ok(res instanceof NextResponse);
    assert.strictEqual(res.status, 307);
    assert.strictEqual(res.headers.get('Location'), 'http://localhost:3000/en/b2b?query=param&test=true');
  });
});
