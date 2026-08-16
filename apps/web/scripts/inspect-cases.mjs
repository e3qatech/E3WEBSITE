import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const cases = await prisma.caseStudy.findMany({
    include: {
      teamMembers: {
        include: {
          employeeProfile: true,
        },
      },
      attraction: true,
    },
  });
  console.log(`Total case studies: ${cases.length}`);
  for (const cs of cases) {
    console.log(`--- [${cs.slug}] id: ${cs.id} ---`);
    console.log(`Title: ${cs.titleEn} / ${cs.titleAr}`);
    console.log(`Client: ${cs.clientName}, Category: ${cs.category}, Year: ${cs.year}`);
    console.log(`Hero Media: ${cs.heroMediaType} -> ${cs.heroImageUrl}`);
    console.log(`Thumbnail: ${cs.thumbnailMediaType} -> ${cs.thumbnailUrl}`);
    console.log(`Challenge: EN=${Boolean(cs.challengeEn)}, AR=${Boolean(cs.challengeAr)}`);
    console.log(`Solution: EN=${Boolean(cs.solutionEn)}, AR=${Boolean(cs.solutionAr)}`);
    console.log(`Result: EN=${Boolean(cs.resultEn)}, AR=${Boolean(cs.resultAr)}`);
    console.log(`Metrics: ${JSON.stringify(cs.metrics)}`);
    console.log(`Gallery: ${JSON.stringify(cs.gallery)}`);
    console.log(`Testimonials: ${JSON.stringify(cs.testimonials)}`);
    console.log(`Team: ${cs.teamMembers.length} members`);
    console.log(`Attraction: ${cs.attraction?.slug || cs.attractionId}`);
    console.log(`isPublished: ${cs.isPublished}, isFeatured: ${cs.isFeatured}`);
  }
}

main().finally(() => prisma.$disconnect());
