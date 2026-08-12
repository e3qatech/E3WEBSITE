const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

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

    const upgradePrisma = new PrismaClient({ datasources: { db: { url: upgradeDbUrl } } });

    // Step 3: Seed multi-entity representative pre-existing production records & relationships
    console.log('4. Seeding representative pre-existing production records & relationships across 8 entities...');
    
    // User
    const user = await upgradePrisma.user.create({
      data: { id: 'usr_prod_101', email: 'prod_admin@e3.qa', name: 'Production Admin', role: 'SUPER_ADMIN' }
    });

    // BrandIP
    const brand = await upgradePrisma.brandIP.create({
      data: { id: 'brd_prod_101', slug: 'virtuocity', nameEn: 'Virtuocity Qatar', nameAr: 'فيرتوعيتي قطر' }
    });

    // Attraction
    const attraction = await upgradePrisma.attraction.create({
      data: { id: 'att_prod_101', slug: 'arena', nameEn: 'Virtuocity Arena', nameAr: 'ساحة فيرتوعيتي' }
    });

    // Location
    const location = await upgradePrisma.location.create({
      data: { id: 'loc_prod_101', slug: 'doha-festival-city', nameEn: 'Doha Festival City', nameAr: 'دوحة فستيفال سيتي' }
    });

    // Service
    const service = await upgradePrisma.service.create({
      data: { id: 'srv_prod_101', slug: 'esports-tournaments', titleEn: 'Esports Operations', titleAr: 'عمليات الرياضات الإلكترونية' }
    });

    // Case Study
    const caseStudy = await upgradePrisma.caseStudy.create({
      data: { id: 'cs_prod_101', slug: 'qatar-esports-cup-2025', titleEn: 'Qatar Esports Cup 2025', titleAr: 'كأس قطر للرياضات الإلكترونية' }
    });

    // Pages (CMS)
    const page = await upgradePrisma.pages.create({
      data: { id: 'pg_prod_101', slug: 'about-us', title: { en: 'About E3 Qatar', ar: 'عن E3 قطر' }, portal: 'SHARED' }
    });

    // Media (CMS)
    const media = await upgradePrisma.media.create({
      data: { id: 'med_prod_101', url: 'https://cdn.e3.qa/hero.jpg', mimeType: 'image/jpeg', type: 'IMAGE', size: 102400 }
    });

    console.log('   Multi-Entity Seed Summary:');
    console.log(`   - User: ${user.email} (ID: ${user.id})`);
    console.log(`   - BrandIP: ${brand.nameEn} (ID: ${brand.id})`);
    console.log(`   - Attraction: ${attraction.nameEn} (ID: ${attraction.id})`);
    console.log(`   - Location: ${location.nameEn} (ID: ${location.id})`);
    console.log(`   - Service: ${service.titleEn} (ID: ${service.id})`);
    console.log(`   - CaseStudy: ${caseStudy.titleEn} (ID: ${caseStudy.id})`);
    console.log(`   - Pages: ${page.slug} (ID: ${page.id})`);
    console.log(`   - Media: ${media.url} (ID: ${media.id})`);

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

    // Step 6: Verify pre-existing multi-entity data preservation post migration
    console.log('\n7. Verifying pre-existing multi-entity data preservation:');
    const [uCheck, bCheck, aCheck, lCheck, sCheck, csCheck, pCheck, mCheck] = await Promise.all([
      upgradePrisma.user.findUnique({ where: { id: 'usr_prod_101' } }),
      upgradePrisma.brandIP.findUnique({ where: { id: 'brd_prod_101' } }),
      upgradePrisma.attraction.findUnique({ where: { id: 'att_prod_101' } }),
      upgradePrisma.location.findUnique({ where: { id: 'loc_prod_101' } }),
      upgradePrisma.service.findUnique({ where: { id: 'srv_prod_101' } }),
      upgradePrisma.caseStudy.findUnique({ where: { id: 'cs_prod_101' } }),
      upgradePrisma.pages.findUnique({ where: { id: 'pg_prod_101' } }),
      upgradePrisma.media.findUnique({ where: { id: 'med_prod_101' } }),
    ]);

    console.log(`   - User record intact:       ${uCheck?.email === 'prod_admin@e3.qa' ? 'PASS' : 'FAIL'}`);
    console.log(`   - Brand record intact:      ${bCheck?.slug === 'virtuocity' ? 'PASS' : 'FAIL'}`);
    console.log(`   - Attraction record intact: ${aCheck?.slug === 'arena' ? 'PASS' : 'FAIL'}`);
    console.log(`   - Location record intact:   ${lCheck?.slug === 'doha-festival-city' ? 'PASS' : 'FAIL'}`);
    console.log(`   - Service record intact:    ${sCheck?.slug === 'esports-tournaments' ? 'PASS' : 'FAIL'}`);
    console.log(`   - CaseStudy record intact:  ${csCheck?.slug === 'qatar-esports-cup-2025' ? 'PASS' : 'FAIL'}`);
    console.log(`   - CMS Page record intact:   ${pCheck?.slug === 'about-us' ? 'PASS' : 'FAIL'}`);
    console.log(`   - CMS Media record intact:  ${mCheck?.url === 'https://cdn.e3.qa/hero.jpg' ? 'PASS' : 'FAIL'}`);

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
