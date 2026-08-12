import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultStoryTypes = [
  {
    slug: 'drive',
    titleEn: 'Drive',
    titleAr: 'القيادة',
    icon: 'car',
    accentColor: '#3b82f6',
    orderIndex: 1
  },
  {
    slug: 'bounce',
    titleEn: 'Bounce',
    titleAr: 'القفز والمرح',
    icon: 'activity',
    accentColor: '#f59e0b',
    orderIndex: 2
  },
  {
    slug: 'compete',
    titleEn: 'Compete',
    titleAr: 'التحدي والمنافسة',
    icon: 'trophy',
    accentColor: '#ef4444',
    orderIndex: 3
  },
  {
    slug: 'explore',
    titleEn: 'Explore',
    titleAr: 'الاستكشاف',
    icon: 'compass',
    accentColor: '#10b981',
    orderIndex: 4
  },
  {
    slug: 'celebrate',
    titleEn: 'Celebrate',
    titleAr: 'الاحتفال',
    icon: 'gift',
    accentColor: '#8b5cf6',
    orderIndex: 5
  },
  {
    slug: 'family-time',
    titleEn: 'Family Time',
    titleAr: 'وقت العائلة',
    icon: 'users',
    accentColor: '#ec4899',
    orderIndex: 6
  }
]

async function main() {
  console.log('Seeding Story Types...')
  for (const type of defaultStoryTypes) {
    await prisma.storyType.upsert({
      where: { slug: type.slug },
      update: {},
      create: {
        slug: type.slug,
        titleEn: type.titleEn,
        titleAr: type.titleAr,
        icon: type.icon,
        accentColor: type.accentColor,
        orderIndex: type.orderIndex,
        isActive: true,
      }
    })
  }
  console.log('Story Types Seeded.')

  console.log('Migrating Attraction Features from JSON to Relational...')
  const attractions = await prisma.attraction.findMany({
    select: { id: true, features: true }
  })

  let count = 0;
  for (const attraction of attractions) {
    if (attraction.features && Array.isArray(attraction.features)) {
      const featuresArray = attraction.features as any[];
      for (let index = 0; index < featuresArray.length; index++) {
        const featureObj = featuresArray[index];
        if (!featureObj.titleEn) continue;

        // Check if it already exists to avoid duplicates if run multiple times
        const existing = await prisma.attractionFeature.findFirst({
          where: {
            attractionId: attraction.id,
            titleEn: featureObj.titleEn
          }
        });

        if (!existing) {
          await prisma.attractionFeature.create({
            data: {
              attractionId: attraction.id,
              titleEn: featureObj.titleEn,
              titleAr: featureObj.titleAr || null,
              descriptionEn: featureObj.descriptionEn || null,
              descriptionAr: featureObj.descriptionAr || null,
              imageUrl: featureObj.imageUrl || null,
              orderIndex: index
            }
          });
          count++;
        }
      }
    }
  }

  console.log(`Migrated ${count} features to AttractionFeature table.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
