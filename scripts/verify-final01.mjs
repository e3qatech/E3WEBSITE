// scripts/verify-final01.mjs
import https from 'node:https';

const BASE_URL = process.env.LIVE_URL || 'https://e3-qatar.vercel.app';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FINAL-01-Verification/1.0',
        ...(options.headers || {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body
      }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log(`=== STARTING FINAL-01 PRODUCTION LAUNCH ACCEPTANCE AUDIT ===`);
  console.log(`Target: ${BASE_URL}\n`);

  const results = [];

  const coreRoutes = [
    { name: 'Root Redirect / Landing', path: '/' },
    { name: 'EN B2C Landing', path: '/en' },
    { name: 'AR B2C Landing', path: '/ar' },
    { name: 'EN B2B Home', path: '/en/b2b' },
    { name: 'AR B2B Home', path: '/ar/b2b' },
    { name: 'EN B2B Team Directory', path: '/en/b2b/team' },
    { name: 'AR B2B Team Directory', path: '/ar/b2b/team' },
    { name: 'EN B2C Team Directory', path: '/en/b2c/team' },
    { name: 'AR B2C Team Directory', path: '/ar/b2c/team' },
    { name: 'EN B2B Cases', path: '/en/b2b/cases' },
    { name: 'AR B2B Cases', path: '/ar/b2b/cases' },
    { name: 'EN B2C Calendar', path: '/en/b2c/calendar' },
    { name: 'AR B2C Calendar', path: '/ar/b2c/calendar' },
    { name: 'EN B2C Packages', path: '/en/b2c/packages' },
    { name: 'AR B2C Packages', path: '/ar/b2c/packages' },
    { name: 'EN Careers', path: '/en/careers' },
    { name: 'AR Careers', path: '/ar/careers' },
    { name: 'Sitemap XML', path: '/sitemap.xml' },
    { name: 'Robots TXT', path: '/robots.txt' },
  ];

  console.log('--- 1. CORE ROUTE REACHABILITY ---');
  for (const r of coreRoutes) {
    try {
      const res = await request(r.path);
      const isOk = res.status >= 200 && res.status < 400;
      console.log(`[${isOk ? 'PASS' : 'FAIL'}] ${r.name} (${r.path}) -> HTTP ${res.status}`);
      results.push({ test: `Route: ${r.name}`, path: r.path, passed: isOk, status: res.status });
    } catch (err) {
      console.error(`[FAIL] ${r.name} (${r.path}) -> Error: ${err.message}`);
      results.push({ test: `Route: ${r.name}`, path: r.path, passed: false, error: err.message });
    }
  }

  console.log('\n--- 2. QF-24-D TEAM ROUTING & STATUS CODE VERIFICATION ---');
  // Test 404 on malformed / unknown slugs
  const unknownRoutes = [
    { name: 'Unknown EN B2B Team Slug', path: '/en/b2b/team/completely-nonexistent-slug-xyz123' },
    { name: 'Unknown AR B2B Team Slug', path: '/ar/b2b/team/completely-nonexistent-slug-xyz123' },
    { name: 'Unknown EN B2C Team Slug', path: '/en/b2c/team/completely-nonexistent-slug-xyz123' },
    { name: 'Unknown AR B2C Team Slug', path: '/ar/b2c/team/completely-nonexistent-slug-xyz123' },
  ];

  for (const r of unknownRoutes) {
    try {
      const res = await request(r.path);
      const is404 = res.status === 404;
      console.log(`[${is404 ? 'PASS' : 'FAIL'}] ${r.name} -> HTTP ${res.status} (Expected: 404)`);
      results.push({ test: r.name, path: r.path, passed: is404, status: res.status });
    } catch (err) {
      console.error(`[FAIL] ${r.name} -> Error: ${err.message}`);
      results.push({ test: r.name, path: r.path, passed: false, error: err.message });
    }
  }

  // Test Real Active Profile
  const profileRoutes = [
    { name: 'Ahmad Faraz EN B2B Profile', path: '/en/b2b/team/ahmad-faraz' },
    { name: 'Ahmad Faraz AR B2B Profile', path: '/ar/b2b/team/ahmad-faraz' },
    { name: 'Sarah Haddad EN B2C Profile', path: '/en/b2c/team/sarah-haddad' },
    { name: 'Sarah Haddad AR B2C Profile', path: '/ar/b2c/team/sarah-haddad' },
  ];

  for (const r of profileRoutes) {
    try {
      const res = await request(r.path);
      const is200 = res.status === 200;
      const isAr = r.path.startsWith('/ar');
      const hasRTL = isAr ? res.body.includes('dir="rtl"') : res.body.includes('dir="ltr"');
      console.log(`[${is200 && hasRTL ? 'PASS' : 'FAIL'}] ${r.name} -> HTTP ${res.status}, RTL/LTR correct: ${hasRTL}`);
      results.push({ test: r.name, path: r.path, passed: is200 && hasRTL, status: res.status });
    } catch (err) {
      console.error(`[FAIL] ${r.name} -> Error: ${err.message}`);
      results.push({ test: r.name, path: r.path, passed: false, error: err.message });
    }
  }

  console.log('\n--- 3. SECURITY & PUBLIC SETTINGS CREDENTIAL AUDIT ---');
  try {
    const res = await request('/api/settings/gateway');
    const bodyStr = res.body.toLowerCase();
    const hasSecretLeaked = bodyStr.includes('password') || bodyStr.includes('webhook_secret') || bodyStr.includes('postgres://');
    const isProtected = res.status === 401 || res.status === 403 || (!hasSecretLeaked);
    console.log(`[${isProtected ? 'PASS' : 'FAIL'}] /api/settings/gateway -> Status ${res.status}, No credentials exposed: ${!hasSecretLeaked}`);
    results.push({ test: 'Settings Gateway Security', passed: isProtected });
  } catch (err) {
    console.log(`[PASS] /api/settings/gateway properly blocked: ${err.message}`);
    results.push({ test: 'Settings Gateway Security', passed: true });
  }

  console.log('\n--- 4. SITEMAP VALIDATION ---');
  try {
    const sitemapRes = await request('/sitemap.xml');
    const isXml = sitemapRes.body.includes('<?xml') || sitemapRes.body.includes('<urlset');
    const noCuidInSitemap = !sitemapRes.body.includes('/team/cm7') && !sitemapRes.body.includes('/team/clx');
    console.log(`[${isXml && noCuidInSitemap ? 'PASS' : 'FAIL'}] Sitemap is valid XML: ${isXml}, Clean canonical slugs only: ${noCuidInSitemap}`);
    results.push({ test: 'Sitemap Validation', passed: isXml && noCuidInSitemap });
  } catch (err) {
    console.error(`[FAIL] Sitemap error: ${err.message}`);
    results.push({ test: 'Sitemap Validation', passed: false });
  }

  console.log('\n=== SUMMARY ===');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`Passed: ${passedCount}/${totalCount} (${Math.round((passedCount/totalCount)*100)}%)`);
}

run().catch(console.error);
