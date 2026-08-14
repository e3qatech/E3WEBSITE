const https = require('https');

const VERCEL_URL = 'https://e3-qatar-git-main-e3qatechs-projects.vercel.app';

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    https.get(`${VERCEL_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function verifyLivePages() {
  console.log('=== Vercel Live Deployment Verification ===\n');

  const pages = [
    { path: '/en/login/admin', expectedLang: 'en', expectedDir: 'ltr' },
    { path: '/ar/login/admin', expectedLang: 'ar', expectedDir: 'rtl' },
    { path: '/en/b2b', expectedLang: 'en', expectedDir: 'ltr' },
    { path: '/ar/b2b', expectedLang: 'ar', expectedDir: 'rtl' },
    { path: '/en/b2c', expectedLang: 'en', expectedDir: 'ltr' },
    { path: '/ar/b2c', expectedLang: 'ar', expectedDir: 'rtl' },
  ];

  for (const p of pages) {
    const res = await fetchUrl(p.path);
    console.log(`[${res.statusCode}] ${p.path}`);
    const hasLang = res.body.includes(`lang="${p.expectedLang}"`) || res.body.includes(`lang='${p.expectedLang}'`);
    const hasDir = res.body.includes(`dir="${p.expectedDir}"`) || res.body.includes(`dir='${p.expectedDir}'`);
    console.log(`  lang="${p.expectedLang}": ${hasLang ? 'PASS' : 'FAIL'}, dir="${p.expectedDir}": ${hasDir ? 'PASS' : 'FAIL'}`);
  }
}

verifyLivePages().catch(console.error);
