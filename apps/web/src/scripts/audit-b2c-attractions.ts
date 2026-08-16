import db from '../lib/db';

async function main() {
  const attractions = await db.attraction.findMany({
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      isPublished: true,
      isB2bVisible: true,
      coordinates: true,
      attractionLocations: {
        include: {
          location: true
        }
      },
      _count: {
        select: {
          featuresList: true,
          pricing: true,
          gallery: true,
          faqs: true,
          offers: true,
        }
      }
    }
  });

  console.log(`Total Attractions: ${attractions.length}`);
  const canonical = attractions.filter((a: any) => a.isB2bVisible !== false);
  const legacy = attractions.filter((a: any) => a.isB2bVisible === false);
  console.log(`Canonical (34 expected): ${canonical.length}`);
  console.log(`Legacy (4 expected): ${legacy.length}`);

  const locations = await db.location.findMany();
  console.log(`Total GIS Locations: ${locations.length}`);
  locations.forEach((l: any) => {
    console.log(`Location: [${l.id}] ${l.nameEn} (${l.venueEn || 'No venue'}) - (${l.latitude}, ${l.longitude}) - attractionId: ${l.attractionId}`);
  });

  // Scan all features and attractions for corrupted strings and translation issues
  const allFeatures = await db.attractionFeature.findMany({
    include: { attraction: true }
  });
  console.log(`\nAuditing ${allFeatures.length} AttractionFeatures for corrupted strings & translation issues:`);
  allFeatures.forEach((f: any) => {
    const descEn = f.descriptionEn || '';
    const descAr = f.descriptionAr || '';
    const titleEn = f.titleEn || '';
    const titleAr = f.titleAr || '';

    if (descEn.includes('[object Object') || descAr.includes('[object Object') || titleEn.includes('[object Object') || titleAr.includes('[object Object')) {
      console.log(`[CORRUPTION FOUND] Feature: [${f.id}] Attraction: ${f.attraction.nameEn} (${f.attraction.slug})`);
      console.log(`  titleEn: "${titleEn}" | titleAr: "${titleAr}"`);
      console.log(`  descEn: "${descEn}"`);
      console.log(`  descAr: "${descAr}"`);
    }

    if (titleEn.toLowerCase().includes('bazooka') || titleAr.toLowerCase().includes('bazooka')) {
      console.log(`[BAZOOKA BALL CHECK] Feature: [${f.id}] titleEn: "${titleEn}", titleAr: "${titleAr}"`);
    }
  });

  const allPricing = await db.attractionPricing.findMany({
    include: { attraction: true }
  });
  console.log(`\nAuditing ${allPricing.length} AttractionPricing records:`);
  allPricing.forEach((p: any) => {
    if (p.titleEn.toLowerCase().includes('rookie') || p.titleEn.toLowerCase().includes('pro pass') || p.attraction.slug.includes('urban-arena')) {
      console.log(`[PRICING TIER] [${p.id}] Attraction: ${p.attraction.nameEn} | titleEn: "${p.titleEn}" | titleAr: "${p.titleAr}" | price: ${p.price} | type: ${p.type}`);
    }
  });

  await db.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
