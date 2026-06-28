import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const seedFile = 'c:\\Users\\Admin\\Downloads\\e3_live_activations_bilingual_seed.json';
  
  if (!fs.existsSync(seedFile)) {
    console.error(`Seed file not found: ${seedFile}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(seedFile, 'utf-8');
  const seedData = JSON.parse(fileContent);

  console.log(`Starting to seed ${seedData.activations.length} attractions...`);

  for (const activation of seedData.activations) {
    const slug = activation.slug;

    // Build the main Attraction data
    const attractionData = {
      nameEn: activation.coreDetails.name.en,
      nameAr: activation.coreDetails.name.ar,
      taglineEn: activation.coreDetails.tagline?.en || null,
      taglineAr: activation.coreDetails.tagline?.ar || null,
      descriptionEn: activation.coreDetails.description?.en || null,
      descriptionAr: activation.coreDetails.description?.ar || null,
      
      heroMediaType: activation.heroMediaController?.mediaType === 'IMAGE_CAROUSEL' ? 'IMAGE' : activation.heroMediaController?.mediaType || 'IMAGE',
      heroMediaUrl: activation.heroMediaController?.primaryMediaUrl || null,
      heroFallbackUrl: activation.heroMediaController?.fallbackImageUrl || null,
      heroThumbnailUrl: activation.heroMediaController?.thumbnailImageUrl || null,
      
      mapUrl: activation.bookingAndMaps?.mapUrl || null,
      ticketingUrl: activation.bookingAndMaps?.ticketingUrl || null,
      
      features: activation.whatsInside || [],
      partnerOffers: activation.partnerOffer ? [activation.partnerOffer] : [],
      partners: activation.generalPartners || [],
      socialPreviews: activation.socialPreviews || [],
      newsCoverage: activation.newsAndCoverage || [],
      operations: activation.operations || {},
      temporalStatus: activation.temporalRules || {},
      
      isPublished: true,
    };

    console.log(`Upserting attraction: ${slug}`);

    const upsertedAttraction = await prisma.attraction.upsert({
      where: { slug },
      update: attractionData,
      create: {
        slug,
        ...attractionData,
      },
    });

    // Handle Pricing
    if (activation.pricingAndTickets && activation.pricingAndTickets.length > 0) {
      for (const pricing of activation.pricingAndTickets) {
        // Attempt to match existing pricing by title
        const existingPricing = await prisma.attractionPricing.findFirst({
          where: { attractionId: upsertedAttraction.id, titleEn: pricing.tierTitle.en }
        });

        const pricingData = {
          attractionId: upsertedAttraction.id,
          titleEn: pricing.tierTitle.en,
          titleAr: pricing.tierTitle.ar,
          descriptionEn: pricing.shortDescription?.en || null,
          descriptionAr: pricing.shortDescription?.ar || null,
          price: pricing.priceBase || 0,
          discount: pricing.discountPercent || null,
        };

        if (existingPricing) {
          await prisma.attractionPricing.update({
            where: { id: existingPricing.id },
            data: pricingData
          });
        } else {
          await prisma.attractionPricing.create({
            data: pricingData
          });
        }
      }
    }

    // Handle Gallery
    if (activation.mediaGallery && activation.mediaGallery.length > 0) {
      // Clear existing gallery and recreate
      await prisma.attractionGalleryItem.deleteMany({
        where: { attractionId: upsertedAttraction.id }
      });
      
      const galleryData = activation.mediaGallery.map((item: any, index: number) => ({
        attractionId: upsertedAttraction.id,
        url: item.mediaUrl,
        orderIndex: index
      }));

      await prisma.attractionGalleryItem.createMany({
        data: galleryData
      });
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
