  // eslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS runtime requirement
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log(Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
process.exit(0);
