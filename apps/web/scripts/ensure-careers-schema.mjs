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

let dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.E3_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  console.log("[CAREERS SCHEMA NOTE] DATABASE_URL is not set; skipping standalone schema verification.");
  process.exit(0);
}

try {
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    const parsedUrl = new URL(dbUrl);
    if (parsedUrl.hostname.includes('-pooler')) {
      parsedUrl.hostname = parsedUrl.hostname.replace('-pooler', '');
    }
    if (!parsedUrl.searchParams.has('sslmode')) {
      parsedUrl.searchParams.set('sslmode', 'require');
    }
    parsedUrl.searchParams.delete('pgbouncer');
    parsedUrl.searchParams.delete('channel_binding');
    dbUrl = parsedUrl.toString();
  }
} catch (_e) {}

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  console.log("=== ENSURING CAREERS SCHEMA (JOB DEADLINE COLUMN) ===");
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "deadline" TIMESTAMP(3);`);
    console.log("[CAREERS SCHEMA] Verified deadline column on Job table.");
  } catch (err) {
    console.error("[CAREERS SCHEMA] Warning verifying deadline column:", err.message || err);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error("[CAREERS SCHEMA ERROR]", err);
  process.exit(0); // Non-blocking
});
