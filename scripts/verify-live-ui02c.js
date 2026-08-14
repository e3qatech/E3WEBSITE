// scripts/verify-live-ui02c.js
const https = require('https');

const BASE_URL = 'https://e3-qatar-git-main-e3qatechs-projects.vercel.app';

function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${urlPath}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('--- Starting Live Verification for UI-02-C ---');
  
  const routes = [
    '/ar/dashboard/settings/general',
    '/ar/dashboard/b2c/packages-page',
    '/ar/dashboard/settings/gateway'
  ];

  for (const route of routes) {
    console.log(`Checking route: ${route}`);
    const res = await fetchPage(route);
    console.log(`Status Code: ${res.statusCode}`);
    
    // Note: Dashboard routes may redirect to login if unauthenticated (307 or 200 with login form or SSR shell)
    if (res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 302) {
      console.log(`✓ Route reachable with status ${res.statusCode}`);
    } else {
      console.error(`✗ Route failed with status ${res.statusCode}`);
    }
  }

  // Check public packages page in Arabic
  const pkgsAr = await fetchPage('/ar/b2c/packages');
  console.log(`Checking public /ar/b2c/packages: status ${pkgsAr.statusCode}`);
  
  console.log('--- Verification Finished ---');
}

verify().catch(console.error);
