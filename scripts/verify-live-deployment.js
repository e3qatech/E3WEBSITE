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

async function verify() {
  console.log('Testing live Vercel deployment at:', VERCEL_URL);
  
  const endpoints = [
    '/en/dashboard',
    '/ar/dashboard',
    '/en/dashboard/b2c/packages-page',
    '/ar/dashboard/b2c/packages-page',
    '/en/dashboard/settings/gateway',
    '/ar/dashboard/settings/gateway',
  ];

  for (const ep of endpoints) {
    const res = await fetchUrl(ep);
    console.log(`Endpoint: ${ep} -> Status: ${res.statusCode}`);
    if (res.statusCode === 307 || res.statusCode === 302) {
      console.log(`  Redirect to: ${res.headers.location}`);
    } else if (res.statusCode === 200) {
      console.log(`  Content length: ${res.body.length}`);
      if (res.body.includes('dir="rtl"')) console.log(`  [PASS] RTL dir detected`);
      if (res.body.includes('lang="ar"')) console.log(`  [PASS] Arabic lang detected`);
    }
  }
}

verify().catch(console.error);
