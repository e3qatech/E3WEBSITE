const base = 'https://e3-qatar-gj0s3xi3v-e3qatechs-projects.vercel.app';

async function runAudit() {
  console.log('=== 1. Services Directory (EN & AR) ===');
  const dirEn = await fetch(base + '/en/b2b/services');
  console.log('/en/b2b/services status:', dirEn.status);
  const dirAr = await fetch(base + '/ar/b2b/services');
  console.log('/ar/b2b/services status:', dirAr.status);
  
  const dirHtml = await dirEn.text();
  const cardRegex = /href="(\/en\/b2b\/services\/[a-z0-9-]+)"/g;
  const cardMatches = [];
  let match;
  while ((match = cardRegex.exec(dirHtml)) !== null) {
    cardMatches.push(match[1]);
  }
  const uniqueCards = [...new Set(cardMatches)];
  console.log('Unique service links on /en/b2b/services:', uniqueCards);
  console.log('Unique service card count:', uniqueCards.length);

  console.log('\n=== 2. Attraction Operations (Missing DB record -> 404 suppression) ===');
  const attrEn = await fetch(base + '/en/b2b/services/attraction-operations', { redirect: 'manual' });
  console.log('/en/b2b/services/attraction-operations status:', attrEn.status);
  const attrAr = await fetch(base + '/ar/b2b/services/attraction-operations', { redirect: 'manual' });
  console.log('/ar/b2b/services/attraction-operations status:', attrAr.status);

  console.log('\n=== 3. All 9 Database-Backed Microsites (EN & AR) ===');
  const micrositeSlugs = [
    'mega-events',
    'family-entertainment-centers',
    'av-stage-rentals',
    'kids-concepts',
    'experiential-activations',
    'shows-performances',
    'ticketing-solutions',
    'fabrication-branding',
    'feasibility-design-research'
  ];

  for (const slug of micrositeSlugs) {
    const enRes = await fetch(`${base}/en/b2b/services/${slug}`);
    const arRes = await fetch(`${base}/ar/b2b/services/${slug}`);
    console.log(`/b2b/services/${slug} -> EN status: ${enRes.status}, AR status: ${arRes.status}`);

    const enHtml = await enRes.text();
    // Check canonical metadata
    const hasCanonical = enHtml.includes(`rel="canonical"`) || enHtml.includes(`href="https://eeeqa.com/en/b2b/services/${slug}"`);
    const hasHreflangEn = enHtml.includes(`hreflang="en"`);
    const hasHreflangAr = enHtml.includes(`hreflang="ar"`);
    const hasXDefault = enHtml.includes(`hreflang="x-default"`);
    const hasOgUrl = enHtml.includes(`property="og:url"`);

    // Check no un-decoded entities in text
    const hasRawAmpersandInTitle = enHtml.includes('&amp;amp;');
    const hasRawRarr = enHtml.includes('&amp;rarr;');

    console.log(`  - Metadata check for ${slug}: canonical=${hasCanonical}, hreflang=${hasHreflangEn && hasHreflangAr}, x-default=${hasXDefault}, og:url=${hasOgUrl}`);
  }

  console.log('\n=== 4. FEC Canonical and Aliases ===');
  const fecCanonicalEn = await fetch(base + '/en/b2b/services/family-entertainment-centers', { redirect: 'manual' });
  console.log('/en/b2b/services/family-entertainment-centers status:', fecCanonicalEn.status);
  const fecCanonicalAr = await fetch(base + '/ar/b2b/services/family-entertainment-centers', { redirect: 'manual' });
  console.log('/ar/b2b/services/family-entertainment-centers status:', fecCanonicalAr.status);

  const fecAliases = [
    '/en/b2b/services/fec',
    '/en/b2b/services/fec-development',
    '/en/b2b/services/fec-design',
    '/en/b2b/services/family-entertainment-center',
    '/ar/b2b/services/fec',
    '/ar/b2b/services/fec-development',
  ];
  for (const a of fecAliases) {
    const res = await fetch(base + a, { redirect: 'manual' });
    console.log(a, '-> status:', res.status, 'location:', res.headers.get('location'));
  }

  console.log('\n=== 5. AV Canonical and Aliases ===');
  const avCanonicalEn = await fetch(base + '/en/b2b/services/av-stage-rentals', { redirect: 'manual' });
  console.log('/en/b2b/services/av-stage-rentals status:', avCanonicalEn.status);
  const avCanonicalAr = await fetch(base + '/ar/b2b/services/av-stage-rentals', { redirect: 'manual' });
  console.log('/ar/b2b/services/av-stage-rentals status:', avCanonicalAr.status);

  const avAliases = [
    '/en/b2b/services/audio-visual-stage',
    '/en/b2b/services/av-rentals',
    '/en/b2b/services/equipment-rentals',
    '/en/b2b/services/stage-equipment',
    '/en/b2b/services/audio-visual',
    '/ar/b2b/services/audio-visual-stage',
  ];
  for (const a of avAliases) {
    const res = await fetch(base + a, { redirect: 'manual' });
    console.log(a, '-> status:', res.status, 'location:', res.headers.get('location'));
  }

  console.log('\n=== 6. Kids Concepts Aliases ===');
  const kidsAliases = [
    '/en/b2b/services/kids-play-concepts',
    '/en/b2b/services/kids-edutainment',
    '/en/b2b/services/children-entertainment',
    '/en/b2b/services/kids-play',
  ];
  for (const a of kidsAliases) {
    const res = await fetch(base + a, { redirect: 'manual' });
    console.log(a, '-> status:', res.status, 'location:', res.headers.get('location'));
  }

  console.log('\n=== 7. Other Ecosystem Pages (B2B Home, Case Studies, Team, B2C) ===');
  const otherPages = [
    '/en',
    '/ar',
    '/en/b2b',
    '/ar/b2b',
    '/en/b2b/case-studies',
    '/ar/b2b/case-studies',
    '/en/b2b/about',
    '/ar/b2b/about',
    '/en/b2b/contact',
    '/ar/b2b/contact',
    '/en/b2c',
    '/ar/b2c',
    '/en/b2c/attractions',
    '/ar/b2c/attractions',
  ];
  for (const p of otherPages) {
    const res = await fetch(base + p);
    console.log(p, 'status:', res.status);
  }
}

runAudit().catch(console.error);
