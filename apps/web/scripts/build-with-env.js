const { execSync } = require('child_process');

const fallbackDbUrl = "postgresql://neondb_owner:npg_laoj96QzNhBM@ep-frosty-poetry-atys9iw5-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const dbUrl = (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
  ? process.env.DATABASE_URL
  : fallbackDbUrl;

const env = {
  ...process.env,
  DATABASE_URL: dbUrl
};

console.log("[BUILD] Ensuring DATABASE_URL environment variable is present...");

try {
  console.log("[BUILD] Generating Prisma Client...");
  execSync("npx prisma generate --schema=prisma/schema.prisma", { stdio: 'inherit', env });

  console.log("[BUILD] Checking database migrations...");
  try {
    execSync("npx prisma migrate resolve --applied 20260805000000_add_rbac_portals_and_memberships --schema=prisma/schema.prisma", { stdio: 'inherit', env });
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
