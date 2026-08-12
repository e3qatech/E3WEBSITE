const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res1 = await prisma.$queryRawUnsafe(`SELECT current_database(), current_schema();`);
    console.log("DB/Schema:", res1);
    
    const res2 = await prisma.$queryRawUnsafe(`SELECT to_regclass('public."Pages"')::text;`);
    console.log("Regclass 'Pages':", res2);
    
    const res3 = await prisma.$queryRawUnsafe(`SELECT to_regclass('public."Page"')::text;`);
    console.log("Regclass 'Page':", res3);
    
    // We will attempt to select from whatever exists
    try {
        const res4 = await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM public."Pages";`);
        console.log("Count Pages:", res4);
    } catch (e) {
        console.log("Could not count public.Pages");
    }
    
    try {
        const res5 = await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM public."Page";`);
        console.log("Count Page:", res5);
    } catch (e) {
        console.log("Could not count public.Page");
    }
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
