const https = require('https');

const VERCEL_URL = 'https://e3-qatar-git-main-e3qatechs-projects.vercel.app';

function checkEndpoint(path) {
  return new Promise((resolve) => {
    const url = `${VERCEL_URL}${path}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          dataLength: data.length,
          hasAriaLabel: data.includes('aria-label='),
          hasBlueprint: data.includes('CAD Blueprint') || data.includes('المخطط الهيكلي') || data.includes('E3 SPATIAL SCHEMATIC'),
          hasRtl: data.includes('dir="rtl"'),
          hasLtr: data.includes('dir="ltr"'),
        });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function main() {
  console.log('Testing live Vercel motion pilot at:', VERCEL_URL);
  
  const results = await Promise.all([
    checkEndpoint('/en/b2b'),
    checkEndpoint('/ar/b2b'),
  ]);

  for (const r of results) {
    console.log(`Endpoint: ${r.path} -> Status: ${r.status}`);
    console.log(`  Data Length: ${r.dataLength} bytes`);
    console.log(`  Has aria-label accessibility: ${r.hasAriaLabel}`);
    console.log(`  Has Blueprint-to-Live section: ${r.hasBlueprint}`);
    console.log(`  Dir RTL: ${r.hasRtl}, Dir LTR: ${r.hasLtr}`);
  }
}

main();
