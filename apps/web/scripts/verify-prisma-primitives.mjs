import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { RoleType, PrismaClient } from '@prisma/client';

const require = createRequire(import.meta.url);

console.log('--- Verifying Authoritative Prisma Client Primitives ---');

// 1. Verify RoleType enum
if (!RoleType || !RoleType.SUPER_ADMIN || !RoleType.SALES_ADMIN || !RoleType.SUPPORT_ADMIN) {
  console.error('❌ RoleType enum verification failed!');
  process.exit(1);
}
console.log('✓ RoleType enum verified:', Object.keys(RoleType).join(', '));

// 2. Verify singular model delegates on PrismaClient
const client = new PrismaClient();
const requiredDelegates = ['user', 'attraction', 'caseStudy', 'service', 'employeeProfile', 'pages', 'media'];
for (const delegate of requiredDelegates) {
  if (typeof client[delegate]?.findUnique !== 'function') {
    console.error(`❌ Prisma delegate '${delegate}' missing on PrismaClient!`);
    process.exit(1);
  }
}
console.log('✓ Model delegates verified:', requiredDelegates.join(', '));

// 3. Verify TypeScript type definitions in generated .prisma/client/index.d.ts
const mainJsPath = require.resolve('@prisma/client');
const prismaClientDtsPath = path.join(path.dirname(mainJsPath), '..', '..', '.prisma', 'client', 'index.d.ts');

if (!fs.existsSync(prismaClientDtsPath)) {
  console.error(`❌ Prisma Client type definition file not found at: ${prismaClientDtsPath}`);
  process.exit(1);
}

const dtsContent = fs.readFileSync(prismaClientDtsPath, 'utf-8');

const requiredTypes = [
  'AttractionWhereInput',
  'RoleType',
  'sessionVersion',
  'CaseStudyWhereInput',
  'ServiceWhereInput',
  'EmployeeProfileWhereInput'
];

for (const typeName of requiredTypes) {
  if (!dtsContent.includes(typeName)) {
    console.error(`❌ Type definition '${typeName}' missing from generated Prisma Client type definitions!`);
    process.exit(1);
  }
}
console.log('✓ Type definitions verified in index.d.ts:', requiredTypes.join(', '));

console.log('✅ ALL AUTHORITATIVE PRISMA PRIMITIVES VERIFIED SUCCESSFULLY.');
