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
} catch (_e) {
  // Ignore URL parse errors
}

process.env.DATABASE_URL = dbUrl;

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log("=== APPLYING ATTRACTION CLASSIFICATION & IMPORT JOBS MIGRATION ===");

  const sqlPath = path.resolve(__dirname, "../prisma/migrations/20260817010000_add_attraction_studio_classification_and_import_jobs/migration.sql");
  const fullSql = fs.readFileSync(sqlPath, "utf-8");

  const cleanSql = fullSql
    .split("\n")
    .map(line => line.trim().startsWith("--") ? "" : line)
    .join("\n");

  const statements = cleanSql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    try {
      await db.$executeRawUnsafe(stmt);
      console.log(`[${i + 1}/${statements.length}] Executed: ${stmt.slice(0, 60).replace(/\n/g, ' ')}...`);
    } catch (e) {
      console.warn(`[${i + 1}/${statements.length}] Warning:`, e.message);
    }
  }

  console.log("✓ All migration statements processed!");
  console.log("=== MIGRATION COMPLETE ===");
}

main().catch(console.error).finally(async () => {
  await db.$disconnect();
  process.exit(0);
});
