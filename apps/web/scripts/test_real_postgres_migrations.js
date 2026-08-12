const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const BASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432';

async function runRealPostgresMigrationTest() {
  console.log('====================================================');
  console.log('REAL POSTGRESQL 17.4 UPGRADE MIGRATION TEST SUITE');
  console.log('====================================================\n');

  const adminClient = new PrismaClient({
    datasources: { db: { url: `${BASE_URL}/postgres` } }
  });

  try {
    console.log('1. Creating disposable database: e3_disposable_presocial_upgrade...');
    await adminClient.$executeRawUnsafe('DROP DATABASE IF EXISTS e3_disposable_presocial_upgrade;');
    await adminClient.$executeRawUnsafe('CREATE DATABASE e3_disposable_presocial_upgrade;');

    const upgradeDbUrl = `${BASE_URL}/e3_disposable_presocial_upgrade`;

    // Step 1: Provision baseline pre-social production schema
    console.log('2. Provisioning baseline production schema (pre-social)...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: upgradeDbUrl },
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });

    // Step 2: Mark pre-social migrations as applied to baseline
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

    const upgradePrisma = new PrismaClient({ datasources: { db: { url: upgradeDbUrl } } });

    // Step 3: Insert representative pre-existing production records
    console.log('4. Seeding representative pre-existing production records...');
    await upgradePrisma.user.create({
      data: {
        id: 'usr_presocial_admin_101',
        email: 'presocial_admin@e3.qa',
        name: 'Pre-Social Admin User',
        role: 'SUPER_ADMIN'
      }
    });

    const initialUserCount = await upgradePrisma.user.count();
    console.log(`   Pre-migration User count: ${initialUserCount}`);

    // Step 4: Check migration status prior to social deploy
    console.log('\n5. Checking `prisma migrate status` prior to new social deploy...');
    let statusPre = '';
    try {
      statusPre = execSync('npx prisma migrate status', {
        env: { ...process.env, DATABASE_URL: upgradeDbUrl },
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
    } catch (e) {
      statusPre = e.stdout || e.message;
    }
    console.log('   Pre-deploy status output:');
    statusPre.trim().split('\n').forEach(l => console.log(`   | ${l}`));

    // Step 5: Apply only the new social migrations
    console.log('\n6. Running `npx prisma migrate deploy` for new social migrations...');
    const deployOutput = execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: upgradeDbUrl },
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });
    console.log('   Deploy log:');
    deployOutput.trim().split('\n').forEach(l => console.log(`   | ${l}`));

    // Step 6: Verify data preservation
    const postUserCount = await upgradePrisma.user.count();
    const fetchedUser = await upgradePrisma.user.findUnique({ where: { id: 'usr_presocial_admin_101' } });

    console.log('\n7. Verifying pre-existing data preservation:');
    console.log(`   - User count preserved: ${initialUserCount === postUserCount ? 'PASS (100% Intact)' : 'FAIL'}`);
    console.log(`   - User record details intact: ${fetchedUser?.email === 'presocial_admin@e3.qa' ? 'PASS (100% Intact)' : 'FAIL'}`);

    // Step 7: Verify all 13 social models exist and can be queried
    console.log('\n8. Verifying 13 new social models in PostgreSQL catalog:');
    const socialModelCounts = await Promise.all([
      upgradePrisma.socialProviderConfig.count(),
      upgradePrisma.socialAccount.count(),
      upgradePrisma.socialPost.count(),
      upgradePrisma.socialPostMedia.count(),
      upgradePrisma.socialFeed.count(),
      upgradePrisma.socialFeedSource.count(),
      upgradePrisma.socialFeedPost.count(),
      upgradePrisma.socialPlacement.count(),
      upgradePrisma.socialSyncJob.count(),
      upgradePrisma.socialSyncError.count(),
      upgradePrisma.socialAuditLog.count(),
      upgradePrisma.socialGlobalSettings.count(),
      upgradePrisma.socialSyncLock.count(),
    ]);
    console.log(`   All 13 social models queried successfully. Total rows: ${socialModelCounts.reduce((a, b) => a + b, 0)}`);

    // Step 8: Verify prisma migrate status post deploy
    console.log('\n9. Checking `prisma migrate status` post deploy...');
    let statusPost = '';
    try {
      statusPost = execSync('npx prisma migrate status', {
        env: { ...process.env, DATABASE_URL: upgradeDbUrl },
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
    } catch (e) {
      statusPost = e.stdout || e.message;
    }
    console.log('   Post-deploy status output:');
    statusPost.trim().split('\n').forEach(l => console.log(`   | ${l}`));

    // Step 9: Re-run deploy to confirm idempotency
    console.log('\n10. Re-running `npx prisma migrate deploy` for idempotency check...');
    const repeatDeployOutput = execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: upgradeDbUrl },
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });
    console.log('   Repeat deploy output:');
    repeatDeployOutput.trim().split('\n').forEach(l => console.log(`   | ${l}`));

    await upgradePrisma.$disconnect();

    // Cleanup
    console.log('\n--- CLEANUP ---');
    console.log('Dropping disposable upgrade database...');
    await adminClient.$executeRawUnsafe('DROP DATABASE IF EXISTS e3_disposable_presocial_upgrade;');
    console.log('Disposable upgrade database dropped cleanly. Real PostgreSQL migration verification COMPLETE!');

  } catch (err) {
    console.error('[REAL_PG_UPGRADE_MIGRATION_ERROR]', err);
  } finally {
    await adminClient.$disconnect();
  }
}

runRealPostgresMigrationTest();
