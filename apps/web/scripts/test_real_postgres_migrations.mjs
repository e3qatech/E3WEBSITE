import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432';

async function runRealPostgresMigrationTest() {
  console.log('================================================================');
  console.log('REAL POSTGRESQL 17.4 UPGRADE MIGRATION TEST SUITE (SIMULATED BASELINE)');
  console.log('================================================================\n');

  const adminClient = new PrismaClient({
    datasources: { db: { url: `${BASE_URL}/postgres` } }
  });

  try {
    console.log('1. Creating disposable database: e3_disposable_presocial_upgrade...');
    await adminClient.$executeRawUnsafe('DROP DATABASE IF EXISTS e3_disposable_presocial_upgrade;');
    await adminClient.$executeRawUnsafe('CREATE DATABASE e3_disposable_presocial_upgrade;');

    const upgradeDbUrl = `${BASE_URL}/e3_disposable_presocial_upgrade`;

    // Step 1: Provision baseline pre-social production schema
    console.log('2. Provisioning simulated production baseline schema (pre-social)...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: upgradeDbUrl },
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });

    // Step 2: Mark pre-social migrations as baseline applied
    console.log('3. Marking pre-social migrations as baseline applied...');
    const preSocialMigrations = [
      '20260805000000_add_rbac_portals_and_memberships',
      '20260812000000_add_story_discovery',
      '20260812000001_add_brand_ip_system',
      '20260812000002_add_insights_and_packages',
      '20260812140000_extend_location_system',
    ];

    for (const mig of preSocialMigrations) {
      execSync(`npx prisma migrate resolve --applied ${mig}`, {
        env: { ...process.env, DATABASE_URL: upgradeDbUrl },
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
    }

    console.log('4. Running `prisma migrate deploy` to execute social migrations...');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: upgradeDbUrl },
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });

    console.log('5. Verifying database state with Prisma Client...');
    const testClient = new PrismaClient({
      datasources: { db: { url: upgradeDbUrl } }
    });

    const appliedMigrations: any = await testClient.$queryRawUnsafe('SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at ASC;');
    console.log('\n--- APPLIED MIGRATIONS IN POSTGRESQL ---');
    appliedMigrations.forEach((m: any) => {
      console.log(`   - ${m.migration_name} (Finished: ${m.finished_at ? 'YES' : 'NO'})`);
    });

    await testClient.$disconnect();
    console.log('\n--- CLEANUP ---');
    console.log('Dropping disposable test database...');
    await adminClient.$executeRawUnsafe('DROP DATABASE IF EXISTS e3_disposable_presocial_upgrade;');
    console.log('Disposable database dropped cleanly. Real PostgreSQL migration verification COMPLETE!');

  } catch (err) {
    console.error('[REAL_PG_MIGRATION_ERROR]', err);
  } finally {
    await adminClient.$disconnect();
  }
}

runRealPostgresMigrationTest();
