import https from 'https';

const previewUrl = 'https://e3-qatar-61mnoazpu-e3qatechs-projects.vercel.app';
const slugs = [
  'mega-events',
  'fec-development',
  'kids-concepts',
  'experiential-activations',
  'shows-performances',
  'av-stage-rentals',
  'attraction-operations',
  'ticketing-solutions',
  'fabrication-branding',
  'feasibility-design-research'
];

function fetchHtml(url: string): Promise<{ url: string; status: number; html: string }> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ url, status: res.statusCode || 0, html: data }));
    }).on('error', (e) => resolve({ url, status: 0, html: e.message }));
  });
}

function extractH1(html: string): string {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) return 'NONE';
  return match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return 'NONE';
  return match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
}

async function run() {
  console.log('===============================================================');
  console.log('1. DIRECTORY PAGES RENDERED CARD COUNT (EN & AR)');
  console.log('===============================================================');

  for (const lang of ['en', 'ar']) {
    const dirRes = await fetchHtml(`${previewUrl}/${lang}/b2b/services`);
    const title = extractTitle(dirRes.html);
    let cardCount = 0;
    for (const slug of slugs) {
      if (dirRes.html.includes(`/b2b/services/${slug}`)) {
        cardCount++;
      }
    }
    console.log(`[${lang.toUpperCase()}] Directory Status: ${dirRes.status} | Title: "${title}" | Found ${cardCount}/10 Canonical Service Links`);
  }

  console.log('\n===============================================================');
  console.log('2. CANONICAL 10 SERVICE DETAIL PAGES (20 ROUTES: EN & AR)');
  console.log('===============================================================');

  let successCount = 0;
  for (const slug of slugs) {
    for (const lang of ['en', 'ar']) {
      const url = `${previewUrl}/${lang}/b2b/services/${slug}`;
      const res = await fetchHtml(url);
      const title = extractTitle(res.html);
      const h1 = extractH1(res.html);
      const has404 = res.html.includes('Service Not Found') || res.html.includes('الخدمة غير موجودة') || res.html.includes('404');
      const hasBriefCta = res.html.includes('Project Brief') || res.html.includes('موجز المشروع') || res.html.includes('Brief Builder');
      
      const pass = res.status === 200 && !has404 && h1 !== 'NONE' && hasBriefCta;
      if (pass) successCount++;

      console.log(`[${lang.toUpperCase()}] ${slug}`);
      console.log(`     Status: ${res.status} | H1: "${h1}"`);
      console.log(`     Title: "${title}"`);
      console.log(`     404 absent: ${!has404} | Brief CTA present: ${hasBriefCta} | Result: ${pass ? 'PASS' : 'FAIL'}`);
    }
  }

  console.log('\n===============================================================');
  console.log(`TOTAL DETAIL ROUTES PASSED: ${successCount} / 20`);
  console.log('===============================================================');
}

run();
