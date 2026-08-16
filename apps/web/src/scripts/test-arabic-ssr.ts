import db from '../lib/db';
import { formatLocalizedText } from '../lib/utils';
import { toZonedTime, format } from 'date-fns-tz';
import { getDay, isWithinInterval } from 'date-fns';
import { resolveBookingUrl } from '../lib/cms-attractions';
import { getPublicCaseStudies } from '../lib/case-studies';

async function testArabicPage() {
  const slug = 'urban-arena-doha-mall';
  const locale = 'ar';

  console.log(`Testing SSR data retrieval for slug: "${slug}", locale: "${locale}"...`);

  const baseSlugKey = (slug || "").split('-')[0] || slug;
  const attraction = await db.attraction.findFirst({
    where: {
      OR: [
        { slug: slug },
        { slug: { startsWith: slug } },
        { slug: { contains: baseSlugKey, mode: 'insensitive' } }
      ]
    },
    include: {
      pricing: true,
      offers: true,
      faqs: { orderBy: { orderIndex: "asc" } },
      gallery: { orderBy: { orderIndex: "asc" } },
      featuresList: {
        include: {
          storyTypes: true,
          linkedBrand: true
        },
        orderBy: { orderIndex: "asc" }
      },
      temporalRules: true,
      brandPlacements: {
        include: {
          brand: true
        }
      },
      attractionLocations: {
        include: {
          location: true
        }
      }
    }
  });

  if (!attraction) {
    console.error('Attraction not found!');
    return;
  }

  console.log(`Attraction found: ${attraction.nameEn} (ID: ${attraction.id})`);
  console.log(`attractionLocations count: ${attraction.attractionLocations?.length}`);
  console.log(`featuresList count: ${attraction.featuresList?.length}`);
  console.log(`pricing count: ${attraction.pricing?.length}`);
  console.log(`faqs count: ${attraction.faqs?.length}`);
  console.log(`gallery count: ${attraction.gallery?.length}`);
  console.log(`partners:`, attraction.partners);
  console.log(`testimonials:`, attraction.testimonials);
  console.log(`newsCoverage:`, attraction.newsCoverage);
  console.log(`socialPreviews:`, attraction.socialPreviews);

  // Check case studies
  try {
    const projects = await getPublicCaseStudies({
      attractionId: attraction.id,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleAr: true,
        challengeEn: true,
        challengeAr: true,
        thumbnailUrl: true,
        heroImageUrl: true
      }
    });
    console.log(`Case studies count: ${projects.length}`);
  } catch (err) {
    console.error('Error fetching case studies:', err);
  }

  // Check booking URL resolution
  try {
    const bookingUrl = resolveBookingUrl(attraction, locale);
    console.log(`Resolved Booking URL: ${bookingUrl}`);
  } catch (err) {
    console.error('Error resolving booking url:', err);
  }

  await db.$disconnect();
}

testArabicPage().catch(err => {
  console.error('Fatal SSR test error:', err);
  process.exit(1);
});
