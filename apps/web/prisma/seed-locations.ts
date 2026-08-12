import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running Location and Brand Migration...');

  // 1. Seed Taxonomies
  const categories = [
    { slug: 'attraction-brand', nameEn: 'Attraction Brand', nameAr: 'علامة تجارية لجذب' },
    { slug: 'umbrella-brand', nameEn: 'Umbrella Brand', nameAr: 'علامة تجارية رئيسية' },
    { slug: 'experience-brand', nameEn: 'Experience Brand', nameAr: 'علامة تجارية للتجربة' },
    { slug: 'fb-concept', nameEn: 'F&B Concept', nameAr: 'مفهوم المأكولات والمشروبات' },
    { slug: 'retail-concept', nameEn: 'Retail Concept', nameAr: 'مفهوم التجزئة' },
    { slug: 'seasonal-brand', nameEn: 'Seasonal/Event Brand', nameAr: 'علامة موسمية/حدث' },
    { slug: 'digital-platform', nameEn: 'Digital Platform', nameAr: 'منصة رقمية' },
    { slug: 'corporate', nameEn: 'Corporate/Subsidiary Brand', nameAr: 'علامة تابعة/شركات' }
  ];

  for (const cat of categories) {
    await prisma.brandCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} BrandCategories`);

  const relationships = [
    { slug: 'created-by', labelEn: 'Created by E3', labelAr: 'تم الإنشاء بواسطة E3' },
    { slug: 'owned-by', labelEn: 'Owned by E3', labelAr: 'مملوكة لشركة E3' },
    { slug: 'operated-by', labelEn: 'Operated by E3', labelAr: 'مُدارة بواسطة E3' },
    { slug: 'managed-by', labelEn: 'Managed by E3', labelAr: 'بإدارة E3' },
    { slug: 'subsidiary', labelEn: 'E3 Subsidiary', labelAr: 'شركة تابعة لـ E3' },
    { slug: 'partner', labelEn: 'Partner Brand', labelAr: 'علامة شريكة' },
    { slug: 'licensed', labelEn: 'Licensed Brand', labelAr: 'علامة مرخصة' },
    { slug: 'delivered-by', labelEn: 'Delivered by E3', labelAr: 'مقدمة من E3' }
  ];

  for (const rel of relationships) {
    await prisma.brandRelationshipType.upsert({
      where: { slug: rel.slug },
      update: {},
      create: rel,
    });
  }
  console.log(`Seeded ${relationships.length} BrandRelationshipTypes`);

  // 2. Migrate Attractions to Locations
  const attractions = await prisma.attraction.findMany({
    include: {
      locations: true,
    }
  });

  let migratedCount = 0;

  for (const attraction of attractions) {
    if (attraction.locations && attraction.locations.length > 0) {
      continue; // Already migrated
    }

    const ops = attraction.operations as any || {};
    const coords = attraction.coordinates as any || {};

    const lat = coords?.lat ? parseFloat(coords.lat) : null;
    const lng = coords?.lng ? parseFloat(coords.lng) : null;

    // Create primary location
    await prisma.location.create({
      data: {
        attractionId: attraction.id,
        isPrimary: true,
        nameEn: 'Primary Location',
        nameAr: 'الموقع الرئيسي',
        venueEn: ops?.venueEn || null,
        venueAr: ops?.venueAr || null,
        addressEn: ops?.addressEn || null,
        addressAr: ops?.addressAr || null,
        googleMapsUrl: attraction.mapUrl || null,
        ticketingUrl: attraction.ticketingUrl || null,
        phone: ops?.phone || null,
        email: ops?.email || null,
        whatsapp: ops?.whatsapp || null,
        latitude: isNaN(lat!) ? null : lat,
        longitude: isNaN(lng!) ? null : lng,
        generalHours: ops?.hours || null,
        isPublished: true,
      }
    });

    migratedCount++;
  }

  console.log(`Migrated ${migratedCount} Attractions to Primary Locations.`);
  console.log('Migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
