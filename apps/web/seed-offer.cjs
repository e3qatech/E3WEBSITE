const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
async function main() {
  const attraction = await db.attraction.findFirst({ where: { isPublished: true } });
  if (attraction) {
    const existing = await db.attractionOffer.findFirst({ where: { attractionId: attraction.id } });
    if (!existing) {
      await db.attractionOffer.create({
        data: {
          attractionId: attraction.id,
          code: 'SUMMER26',
          discount: 25,
        }
      });
      console.log('Offer created for ' + attraction.nameEn);
    } else {
      console.log('Offer already exists');
    }
  } else {
    console.log('No published attraction found');
  }
}
main().catch(console.error).finally(() => db.$disconnect());
