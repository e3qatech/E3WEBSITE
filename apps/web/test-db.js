const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.pages.findUnique({
    where: { slug: 'b2c-discover' }
  });
  console.log(JSON.stringify(page, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
