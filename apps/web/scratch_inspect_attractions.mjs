import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p1 = await prisma.pages.findUnique({ where: { slug: 'b2c-attractions' } });
  const p2 = await prisma.pages.findUnique({ where: { slug: 'b2c-attractions-page' } });
  
  console.log('=== b2c-attractions ===');
  console.log('content:', JSON.stringify(p1?.content, null, 2));
  
  console.log('=== b2c-attractions-page ===');
  console.log('content:', JSON.stringify(p2?.content, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
