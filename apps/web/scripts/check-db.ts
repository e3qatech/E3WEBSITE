import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_laoj96QzNhBM@ep-frosty-poetry-atys9iw5.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

async function main() {
  const count = await prisma.service.count();
  console.log('Total services in database:', count);
  const services = await prisma.service.findMany({
    where: { isVisible: true, isPublished: true },
    select: { slug: true, titleEn: true, isVisible: true, isPublished: true }
  });
  console.log('Published & Visible services count:', services.length);
  for (const s of services) {
    console.log(` - ${s.slug} (${s.titleEn})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
