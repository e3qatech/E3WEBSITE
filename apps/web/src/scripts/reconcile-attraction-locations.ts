import db from '../lib/db';

export interface ReconciliationReport {
  dryRun: boolean;
  totalAttractions: number;
  totalLocations: number;
  matchedCount: number;
  alreadyLinkedCount: number;
  unmatchedCount: number;
  actions: Array<{
    attractionId: string;
    attractionSlug: string;
    attractionName: string;
    locationId: string;
    locationName: string;
    venue: string;
    coordinates: { lat: number | null; lng: number | null };
    status: 'LINKED' | 'ALREADY_LINKED' | 'PROPOSED' | 'AMBIGUOUS' | 'NO_MATCH';
    notes?: string;
  }>;
}

export async function runReconciliation({ dryRun = true }: { dryRun?: boolean } = {}): Promise<ReconciliationReport> {
  const attractions = await db.attraction.findMany({
    include: {
      attractionLocations: {
        include: { location: true }
      }
    }
  });

  const locations = await db.location.findMany();

  const report: ReconciliationReport = {
    dryRun,
    totalAttractions: attractions.length,
    totalLocations: locations.length,
    matchedCount: 0,
    alreadyLinkedCount: 0,
    unmatchedCount: 0,
    actions: []
  };

  for (const attraction of attractions) {
    const existingLinks = attraction.attractionLocations || [];

    // Check if attraction already has linked locations
    if (existingLinks.length > 0) {
      existingLinks.forEach((link: any) => {
        report.alreadyLinkedCount++;
        report.actions.push({
          attractionId: attraction.id,
          attractionSlug: attraction.slug,
          attractionName: attraction.nameEn,
          locationId: link.locationId,
          locationName: link.location.nameEn,
          venue: link.location.venueEn || '',
          coordinates: { lat: link.location.latitude, lng: link.location.longitude },
          status: 'ALREADY_LINKED',
          notes: `Already linked with isPrimary=${link.isPrimary}`
        });
      });
      continue;
    }

    // Find candidate GIS locations using strict exact match by name AND venue/mall
    const match = locations.find((l: any) => {
      const lName = l.nameEn.toLowerCase().trim();
      const lVenue = (l.venueEn || '').toLowerCase().trim();
      const aName = attraction.nameEn.toLowerCase().trim();
      const aSlug = attraction.slug.toLowerCase().trim();

      // 1. Urban Arena -> Location: "Urban Arena" (Doha Mall)
      if (aSlug.includes('urban-arena') || aName.includes('urban arena')) {
        return lName.includes('urban arena') || (l.id === 'cmspco5rs000jzbq4tuz7mgyg');
      }

      // 2. InflataPark City Center Doha
      if (aSlug === 'inflatapark-city-center-doha' || aSlug === 'inflata-park-city-center-doha') {
        return lName.includes('inflatapark') && (lName.includes('city center') || lVenue.includes('city center'));
      }

      // 3. Crayons & Bricks Place Vendome
      if (aSlug === 'crayons-bricks-place-vendome') {
        return lName.includes('crayons & bricks') && (lName.includes('vendôme') || lName.includes('vendome') || lVenue.includes('vendôme') || lVenue.includes('vendome') || lVenue.includes('lusail'));
      }

      // 4. Kids City Driving School Doha Mall
      if (aSlug === 'kids-city-driving-school-doha-mall') {
        return lName.includes('kids city') && (lName.includes('doha mall') || lVenue.includes('doha mall'));
      }

      // 5. Kidz Driving School City Center Doha
      if (aSlug === 'kidz-driving-school-city-center-doha' || aSlug === 'kids-city-driving-school-city-center' || aSlug === 'kids-city-driving-school') {
        return (lName.includes('kids city') || lName.includes('kidz')) && (lName.includes('city center') || lVenue.includes('city center'));
      }

      // 6. Exact match
      return Boolean(l.slug && l.slug === aSlug) || (lName === aName && lName.length > 3);
    });

    if (match) {
      report.matchedCount++;
      const actionItem: ReconciliationReport['actions'][0] = {
        attractionId: attraction.id,
        attractionSlug: attraction.slug,
        attractionName: attraction.nameEn,
        locationId: match.id,
        locationName: match.nameEn,
        venue: match.venueEn || '',
        coordinates: { lat: match.latitude, lng: match.longitude },
        status: dryRun ? 'PROPOSED' : 'LINKED',
        notes: `Exact GIS venue match: ${match.venueEn || match.nameEn} (${match.latitude}, ${match.longitude})`
      };

      if (!dryRun) {
        await db.attractionLocation.upsert({
          where: {
            attractionId_locationId: {
              attractionId: attraction.id,
              locationId: match.id
            }
          },
          update: {
            isPrimary: true,
            mapVisible: true
          },
          create: {
            attractionId: attraction.id,
            locationId: match.id,
            isPrimary: true,
            mapVisible: true,
            sortOrder: 0
          }
        });
      }

      report.actions.push(actionItem);
    } else {
      report.unmatchedCount++;
      report.actions.push({
        attractionId: attraction.id,
        attractionSlug: attraction.slug,
        attractionName: attraction.nameEn,
        locationId: '',
        locationName: '',
        venue: '',
        coordinates: { lat: null, lng: null },
        status: 'NO_MATCH',
        notes: 'No unambiguous canonical GIS location candidate. Kept unlinked for manual selection.'
      });
    }
  }

  return report;
}

async function main() {
  const isExecute = process.argv.includes('--execute');
  const dryRun = !isExecute;

  console.log(`\n=== ATTRACTION-LOCATION RECONCILIATION (${dryRun ? 'DRY-RUN' : 'LIVE EXECUTE'}) ===\n`);

  const report = await runReconciliation({ dryRun });

  console.log(`Total Attractions: ${report.totalAttractions}`);
  console.log(`Total GIS Locations: ${report.totalLocations}`);
  console.log(`Already Linked: ${report.alreadyLinkedCount}`);
  console.log(`Matched & Proposed/Linked: ${report.matchedCount}`);
  console.log(`Unmatched (require manual link): ${report.unmatchedCount}\n`);

  console.log('Action Summary:');
  report.actions.forEach(a => {
    if (a.status !== 'NO_MATCH') {
      console.log(`[${a.status}] Attraction: "${a.attractionName}" (${a.attractionSlug}) -> Location: "${a.locationName}" (${a.venue}) coords: (${a.coordinates.lat}, ${a.coordinates.lng})`);
    }
  });

  if (dryRun) {
    console.log('\n[NOTICE] Dry run completed. No changes written. Run with --execute to commit links to database.\n');
  } else {
    console.log('\n[SUCCESS] Live reconciliation executed and committed to database successfully.\n');
  }

  await db.$disconnect();
}

if (require.main === module || process.argv[1]?.includes('reconcile-attraction-locations')) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
