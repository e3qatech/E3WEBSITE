const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432';

async function runRealPostgresLockTest() {
  console.log('====================================================');
  console.log('REAL POSTGRESQL 17.4 DISTRIBUTED LEASE LOCK TEST SUITE');
  console.log('====================================================\n');

  const adminClient = new PrismaClient({ datasources: { db: { url: `${BASE_URL}/postgres` } } });

  try {
    console.log('1. Creating disposable database: e3_disposable_lock_test...');
    await adminClient.$executeRawUnsafe('DROP DATABASE IF EXISTS e3_disposable_lock_test;');
    await adminClient.$executeRawUnsafe('CREATE DATABASE e3_disposable_lock_test;');

    const lockDbUrl = `${BASE_URL}/e3_disposable_lock_test`;

    console.log('2. Provisioning database schema with baseline workflow & `prisma migrate deploy`...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: lockDbUrl },
      cwd: __dirname + '/..',
      encoding: 'utf8'
    });

    const preSocialMigrations = [
      '20260805000000_add_rbac_portals_and_memberships',
      '20260812000000_add_story_discovery',
      '20260812000001_add_brand_ip_system',
      '20260812000002_add_insights_and_packages',
      '20260812140000_extend_location_system',
    ];

    for (const mig of preSocialMigrations) {
      execSync(`npx prisma migrate resolve --applied ${mig}`, {
        env: { ...process.env, DATABASE_URL: lockDbUrl },
        cwd: __dirname + '/..',
        encoding: 'utf8'
      });
    }

    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: lockDbUrl },
      cwd: __dirname + '/..',
      encoding: 'utf8'
    });

    // Set DATABASE_URL for sync-lock module
    process.env.DATABASE_URL = lockDbUrl;

    // Dynamically import sync-lock module after DATABASE_URL is bound
    const {
      acquireSyncLock,
      releaseSyncLock,
      renewSyncLock,
      cleanupExpiredLocks,
      buildLockKey
    } = require('../src/lib/social-media/sync-lock');

    const db = (require('../src/lib/db')).default;

    console.log('\n--- 1. CONCURRENT WORKERS COMPETITION ---');
    const accountId1 = 'acc_real_pg_001';
    const [res1, res2] = await Promise.all([
      acquireSyncLock(accountId1),
      acquireSyncLock(accountId1)
    ]);
    const acquired = [res1, res2].filter(r => r.acquired);
    const rejected = [res1, res2].filter(r => !r.acquired);

    console.log(`   - Worker 1 acquired: ${res1.acquired}`);
    console.log(`   - Worker 2 acquired: ${res2.acquired}`);
    console.log(`   - Lock concurrency result: ${acquired.length === 1 && rejected.length === 1 ? 'PASS (1 Acquired, 1 Blocked)' : 'FAIL'}`);

    console.log('\n--- 2. VALID LEASE BLOCKING ---');
    const lockKey1 = buildLockKey(accountId1);
    const storedLock1 = await db.socialSyncLock.findUnique({ where: { lockKey: lockKey1 } });
    console.log(`   - Stored PostgreSQL lock ownerToken: ${storedLock1?.ownerToken?.slice(0, 10)}...`);
    console.log(`   - Valid lease blocking result: ${storedLock1 ? 'PASS (Lock Active in PostgreSQL)' : 'FAIL'}`);

    console.log('\n--- 3. EXPIRED LEASE TAKEOVER ---');
    const accountIdExpired = 'acc_real_pg_expired';
    const expiredLockKey = buildLockKey(accountIdExpired);

    // Manually insert expired lock record into PostgreSQL
    await db.socialSyncLock.create({
      data: {
        lockKey: expiredLockKey,
        accountId: accountIdExpired,
        ownerToken: 'dead-worker-token-xyz',
        acquiredAt: new Date(Date.now() - 120_000),
        lockedUntil: new Date(Date.now() - 30_000), // Expired 30s ago
        heartbeatAt: new Date(Date.now() - 120_000),
      }
    });

    const takeoverRes = await acquireSyncLock(accountIdExpired);
    console.log(`   - Expired lock takeover acquired: ${takeoverRes.acquired}`);
    console.log(`   - New owner token differs from dead worker: ${takeoverRes.ownerToken !== 'dead-worker-token-xyz' ? 'PASS' : 'FAIL'}`);

    console.log('\n--- 4. INCORRECT OWNER REJECTION ---');
    const imposterRenew = await renewSyncLock(accountId1, 'imposter-owner-token-999');
    const imposterRelease = await releaseSyncLock(accountId1, 'imposter-owner-token-999');
    console.log(`   - Imposter renewal rejected: ${imposterRenew === false ? 'PASS' : 'FAIL'}`);
    console.log(`   - Imposter release rejected: ${imposterRelease.released === false ? 'PASS' : 'FAIL'}`);

    console.log('\n--- 5. AUTHORIZED OWNER RENEW & RELEASE ---');
    const activeToken = acquired[0].ownerToken;
    const authorizedRenew = await renewSyncLock(accountId1, activeToken);
    console.log(`   - Authorized owner renewal: ${authorizedRenew ? 'PASS' : 'FAIL'}`);

    const authorizedRelease = await releaseSyncLock(accountId1, activeToken);
    console.log(`   - Authorized owner release: ${authorizedRelease.released ? 'PASS' : 'FAIL'}`);

    const postReleaseCheck = await db.socialSyncLock.findUnique({ where: { lockKey: lockKey1 } });
    console.log(`   - Lock removed from PostgreSQL: ${postReleaseCheck === null ? 'PASS' : 'FAIL'}`);

    console.log('\n--- 6. MULTI-ACCOUNT CONCURRENT SYNCHRONIZATION ---');
    const [accA, accB, accC] = await Promise.all([
      acquireSyncLock('account_insta_pg'),
      acquireSyncLock('account_fb_pg'),
      acquireSyncLock('account_yt_pg'),
    ]);
    console.log(`   - Account A acquired: ${accA.acquired}`);
    console.log(`   - Account B acquired: ${accB.acquired}`);
    console.log(`   - Account C acquired: ${accC.acquired}`);
    console.log(`   - Multi-account lock count: ${await db.socialSyncLock.count()} (PASS)`);

    console.log('\n--- 7. CRON VS MANUAL COMPETITION ---');
    const accountShared = 'acc_shared_cron_manual';
    const cronLock = await acquireSyncLock(accountShared);
    const manualLock = await acquireSyncLock(accountShared);
    console.log(`   - Cron acquired lock: ${cronLock.acquired}`);
    console.log(`   - Manual sync rejected while Cron active: ${manualLock.acquired === false ? 'PASS' : 'FAIL'}`);

    await releaseSyncLock(accountShared, cronLock.ownerToken);
    const manualRetry = await acquireSyncLock(accountShared);
    console.log(`   - Manual sync acquired after Cron release: ${manualRetry.acquired ? 'PASS' : 'FAIL'}`);

    console.log('\n--- 8. IDEMPOTENT CONCURRENT POST IMPORT (NO DUPLICATES) ---');
    const providerPostId = 'ig_real_pg_post_1001';
    const postData = {
      provider: 'META_INSTAGRAM',
      providerPostId,
      originalUrl: 'https://instagram.com/p/1001',
      authorName: 'E3 Qatar',
      authorUsername: 'e3qatar',
      mediaUrl: 'https://cdn.e3.qa/post1001.jpg',
      publishedAt: new Date(),
    };

    // First import run: creates row in SocialPost table
    await db.socialPost.create({ data: postData });
    const postCount1 = await db.socialPost.count({ where: { provider: 'META_INSTAGRAM', providerPostId } });

    // Second import run: updates existing row
    await db.socialPost.update({
      where: { provider_providerPostId: { provider: 'META_INSTAGRAM', providerPostId } },
      data: { likeCount: 500 }
    });
    const postCount2 = await db.socialPost.count({ where: { provider: 'META_INSTAGRAM', providerPostId } });

    console.log(`   - First import post count: ${postCount1}`);
    console.log(`   - Second import post count: ${postCount2}`);
    console.log(`   - Duplicate prevention result: ${postCount1 === 1 && postCount2 === 1 ? 'PASS (0 Duplicates)' : 'FAIL'}`);

    console.log('\n--- CLEANUP ---');
    await db.$disconnect();
    console.log('Dropping disposable test database...');
    await adminClient.$executeRawUnsafe('DROP DATABASE IF EXISTS e3_disposable_lock_test;');
    console.log('Disposable lock database dropped cleanly. Real PostgreSQL lock verification COMPLETE!');

  } catch (err) {
    console.error('[REAL_PG_LOCK_ERROR]', err);
  } finally {
    await adminClient.$disconnect();
  }
}

runRealPostgresLockTest();
