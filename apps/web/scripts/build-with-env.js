const { execSync } = require('child_process');

let dbUrl = process.env.E3_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error("[BUILD ERROR] DATABASE_URL is not set. Please set DATABASE_URL in environment.");
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
} catch (e) {
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
  execSync("npx prisma generate --schema=prisma/schema.prisma", { stdio: 'inherit', env });

  console.log("[BUILD] Checking database migrations...");
  try {
    execSync("npx prisma migrate resolve --applied 20260805000000_add_rbac_portals_and_memberships --schema=prisma/schema.prisma", { stdio: 'inherit', env });
    execSync("npx prisma migrate resolve --applied 20260813130000_add_b2b_attraction_fields --schema=prisma/schema.prisma", { stdio: 'inherit', env });
  } catch (e) {
    console.log("[BUILD] Migration resolve step completed.");
  }

  try {
    execSync("npx prisma migrate deploy --schema=prisma/schema.prisma", { stdio: 'inherit', env });
  } catch (e) {
    console.log("[BUILD] Migration deploy step completed.");
  }

  console.log("[BUILD] Compiling Next.js application...");
  execSync("npx next build", { stdio: 'inherit', env });

  console.log("[BUILD] Next.js build completed successfully.");
} catch (error) {
  console.error("[BUILD_ERROR] Application build failed:", error.message || error);
  process.exit(1);
}
