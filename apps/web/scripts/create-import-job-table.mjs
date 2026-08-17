import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load env files if not set
if (!process.env.DATABASE_URL && !process.env.E3_DATABASE_URL && !process.env.POSTGRES_PRISMA_URL) {
  const envFiles = ['.env.production', '.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.resolve(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

let dbUrl = process.env.E3_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error("[ERROR] DATABASE_URL is not set.");
  process.exit(1);
}

try {
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    const parsedUrl = new URL(dbUrl);
    if (parsedUrl.hostname.includes('ep-snowy-hall-atkbimek')) {
      parsedUrl.hostname = 'ep-frosty-poetry-atys9iw5-pooler.c-9.us-east-1.aws.neon.tech';
    }
    if (parsedUrl.hostname.endsWith('.neon.tech') && !parsedUrl.hostname.includes('-pooler')) {
      const parts = parsedUrl.hostname.split('.');
      parts[0] = parts[0] + '-pooler';
      parsedUrl.hostname = parts.join('.');
    }
    if (parsedUrl.hostname.includes('-pooler')) {
      parsedUrl.searchParams.set('pgbouncer', 'true');
    }
    parsedUrl.searchParams.delete('channel_binding');
    dbUrl = parsedUrl.toString();
  }
} catch (_e) {}

process.env.DATABASE_URL = dbUrl;

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log("=== CREATING IMPORTJOB TABLE AND GENERATING PRISMA ===");

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS "ImportJob" (
      "id" TEXT NOT NULL,
      "batchNumber" TEXT NOT NULL,
      "fileName" TEXT NOT NULL,
      "fileType" TEXT NOT NULL DEFAULT 'SPREADSHEET',
      "intakeMethod" TEXT NOT NULL DEFAULT 'SPREADSHEET',
      "targetType" TEXT NOT NULL DEFAULT 'ATTRACTIONS',
      "uploadedBy" TEXT DEFAULT 'Admin',
      "recordsCreated" INTEGER NOT NULL DEFAULT 0,
      "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
      "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
      "warningsCount" INTEGER NOT NULL DEFAULT 0,
      "errorsCount" INTEGER NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'DRAFT_READY',
      "appliedRecordIds" JSONB,
      "snapshotData" JSONB,
      "errorReport" JSONB,
      "metadata" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
    );
  `;

  await db.$executeRawUnsafe(createTableSql);
  console.log("✓ Created ImportJob table");

  const indexes = [
    `CREATE UNIQUE INDEX IF NOT EXISTS "ImportJob_batchNumber_key" ON "ImportJob"("batchNumber")`,
    `CREATE INDEX IF NOT EXISTS "ImportJob_status_idx" ON "ImportJob"("status")`,
    `CREATE INDEX IF NOT EXISTS "ImportJob_targetType_idx" ON "ImportJob"("targetType")`,
    `CREATE INDEX IF NOT EXISTS "ImportJob_createdAt_idx" ON "ImportJob"("createdAt")`
  ];

  for (const idx of indexes) {
    await db.$executeRawUnsafe(idx);
    console.log(`✓ Executed index: ${idx.slice(0, 50)}...`);
  }

  console.log("=== COMPLETED SUCCESSFULLY ===");
}

main().catch(console.error).finally(async () => {
  await db.$disconnect();
  process.exit(0);
});
