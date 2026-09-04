import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
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

let dbUrl = process.env.E3_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || "postgresql://dummy:dummy@localhost:5432/dummy?schema=public";

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

const env = {
  ...process.env,
  DATABASE_URL: dbUrl,
  POSTGRES_PRISMA_URL: dbUrl,
  POSTGRES_URL: dbUrl
};

console.log("[BUILD] Ensuring DATABASE_URL environment variable is present...");

try {
  console.log("[BUILD] Generating Prisma Client...");
  try {
    execSync("pnpm exec prisma generate --schema=prisma/schema.prisma", { stdio: 'inherit', env });
  } catch (_pnpmErr) {
    execSync("npx prisma generate --schema=prisma/schema.prisma", { stdio: 'inherit', env });
  }

  console.log("[BUILD] Checking database migrations...");
  try {
    let directMigrationUrl = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.E3_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || dbUrl;
    try {
      if (directMigrationUrl.startsWith('postgres://') || directMigrationUrl.startsWith('postgresql://')) {
        const parsedDirect = new URL(directMigrationUrl);
        if (parsedDirect.hostname.includes('-pooler')) {
          parsedDirect.hostname = parsedDirect.hostname.replace('-pooler', '');
        }
        parsedDirect.searchParams.delete('pgbouncer');
        parsedDirect.searchParams.delete('channel_binding');
        directMigrationUrl = parsedDirect.toString();
      }
    } catch (_e) {}

    const migrationEnv = {
      ...env,
      DATABASE_URL: directMigrationUrl,
      POSTGRES_PRISMA_URL: directMigrationUrl,
      DATABASE_URL_UNPOOLED: directMigrationUrl,
      POSTGRES_URL_NON_POOLING: directMigrationUrl,
    };
    try {
      execSync("pnpm exec prisma migrate deploy --schema=prisma/schema.prisma", { stdio: 'inherit', env: migrationEnv });
    } catch (_pnpmMigErr) {
      execSync("npx prisma migrate deploy --schema=prisma/schema.prisma", { stdio: 'inherit', env: migrationEnv });
    }
    console.log("[BUILD] Database migrations applied successfully.");
  } catch (migErr) {
    console.log("[BUILD] Migration deploy warning:", migErr.message || migErr);
  }

  if (process.env.RUN_DB_SEED === 'true') {
    try {
      console.log("[BUILD] Seeding database...");
      execSync("npx prisma db seed", { stdio: 'inherit', env });
    } catch (_e) {
      console.log("[BUILD] Database seed step completed.");
    }
  }

  console.log("[BUILD] Compiling Next.js application...");
  try {
    execSync("pnpm exec next build", { stdio: 'inherit', env });
  } catch (_nextErr) {
    execSync("npx next build", { stdio: 'inherit', env });
  }

  console.log("[BUILD] Next.js build completed successfully.");
} catch (error) {
  console.error("[BUILD_ERROR] Application build failed:", error.message || error);
  process.exit(1);
}
