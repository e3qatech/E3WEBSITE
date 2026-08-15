import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/postgres'
    }
  }
});

async function main() {
  try {
    const res: any = await prisma.$queryRawUnsafe('SELECT version();');
    console.log('SUCCESS_PG_CONNECTED:', res[0]?.version);
  } catch (err: any) {
    console.log('ERROR_PG_CONNECT:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
