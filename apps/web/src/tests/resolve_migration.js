/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Recording 20260812000002_add_insights_and_packages as applied...');
  const m = '20260812000002_add_insights_and_packages';
  const existing = await prisma.$queryRawUnsafe(
    `SELECT id FROM _prisma_migrations WHERE migration_name = '${m}'`
  );
  if (existing.length > 0) {
    await prisma.$executeRawUnsafe(
      `UPDATE _prisma_migrations SET finished_at = NOW(), logs = NULL, rolled_back_at = NULL WHERE migration_name = '${m}'`
    );
  } else {
    const id = `mig_${Date.now()}_2`.slice(0, 36);
    await prisma.$executeRawUnsafe(
      `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
       VALUES ('${id}', 'checksum_2', NOW(), '${m}', NULL, NULL, NOW(), 1)`
    );
  }
  console.log('Successfully recorded 20260812000002_add_insights_and_packages!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
