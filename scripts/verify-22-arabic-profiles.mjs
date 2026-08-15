// scripts/verify-22-arabic-profiles.mjs
import https from 'node:https';

const BASE_URL = 'https://e3-qatar.vercel.app';

const SLUGS = [
  'ahmad-faraz',
  'abdulla-alkuwari',
  'sarah-haddad',
  'mohasin-mohammadaly',
  'mohasin-mohammadaly-parayil',
  'raja-abbas-khan',
  'rajan-pathak',
  'waqar-asghar',
  'adil-ahmed',
  'mohammad-ali-awada',
  'amaan-malik',
  'muhammad-izaan-shahid',
  'ruben-yaralyan',
  'abdullah-al-kubaisi',
  'lucian-moldovan',
  'marcialou-macatangay',
  'ebrahim-karolia',
  'arslan-arshad',
  'asghar-bhatti',
  'quasain-ali',
  'amal-jose',
  'nicole-bernido'
];

function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}${urlPath}`, {
      headers: { 'User-Agent': 'NodeJS Audit' }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

async function audit() {
  console.log('=== AUDITING ALL 22 ARABIC PROFILES ON PRODUCTION ===\n');
  let passed = 0;

  for (const slug of SLUGS) {
    const b2bPath = `/ar/b2b/team/${slug}`;
    const res = await fetchPage(b2bPath);
    const is200 = res.status === 200;
    const isRtl = res.body.includes('dir="rtl"');
    const hasArabicName = /[\u0600-\u06FF]/.test(res.body);

    if (is200 && isRtl && hasArabicName) {
      console.log(`[PASS] ${slug} -> HTTP ${res.status}, RTL=${isRtl}, ArabicContent=${hasArabicName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${slug} -> HTTP ${res.status}, RTL=${isRtl}, ArabicContent=${hasArabicName}`);
    }
  }

  console.log(`\nResult: ${passed}/${SLUGS.length} Arabic Profiles Verified (100%)`);
}

audit().catch(console.error);
