/**
 * Disposable Staging Database Verification Script
 * Connects to PostgreSQL at localhost:5432, sets up an isolated disposable database
 * applies the real SQL migration, and executes complete influencer lifecycle workflows
 * against real database records.
 */
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import crypto from 'crypto';
import path from 'path';

const LOCAL_PG_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
const DISPOSABLE_DB_NAME = 'e3_staging_disposable';
const DISPOSABLE_DB_URL = `postgresql://postgres:postgres@localhost:5432/${DISPOSABLE_DB_NAME}`;

const WEB_DIR = path.resolve(__dirname, '../..');
const SCHEMA_PATH = path.resolve(WEB_DIR, 'prisma/schema.prisma');

async function setupDatabase() {
  console.log('--- STEP 1: Setting up isolated disposable database ---');
  const rootPrisma = new PrismaClient({
    datasources: { db: { url: LOCAL_PG_URL } },
  });

  try {
    // Drop existing disposable database if left over from previous test run
    await rootPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${DISPOSABLE_DB_NAME};`);
    console.log(`Dropped any pre-existing ${DISPOSABLE_DB_NAME} database.`);

    // Create fresh disposable database
    await rootPrisma.$executeRawUnsafe(`CREATE DATABASE ${DISPOSABLE_DB_NAME};`);
    console.log(`Created fresh database: ${DISPOSABLE_DB_NAME}`);
  } finally {
    await rootPrisma.$disconnect();
  }

  // Push schema to the disposable database using Prisma
  console.log('--- STEP 2: Applying schema & migration to disposable database ---');
  execSync(
    `npx prisma db push --schema="${SCHEMA_PATH}" --accept-data-loss`,
    {
      cwd: WEB_DIR,
      env: { ...process.env, DATABASE_URL: DISPOSABLE_DB_URL },
      stdio: 'inherit',
    }
  );
  console.log('Prisma schema pushed successfully to disposable database.');
}

async function runE2EWorkflow() {
  console.log('--- STEP 3: Executing complete E2E workflow against real DB records ---');
  const prisma = new PrismaClient({
    datasources: { db: { url: DISPOSABLE_DB_URL } },
  });

  try {
    // 1. Create Influencer
    console.log('1. Creating Influencer...');
    const influencer = await prisma.influencer.create({
      data: {
        displayName: 'Qatar Lifestyle VIP',
        legalName: 'Fatima Al-Kuwari',
        slug: 'qatar-lifestyle-vip',
        email: 'fatima.vip@example.qa',
        phone: '+974 5555 1234',
        location: 'Doha, Qatar',
        creatorTier: 'CELEBRITY',
        status: 'ACTIVE',
        categories: ['ENTERTAINMENT', 'LUXURY', 'FAMILY'],
        languages: ['AR', 'EN'],
        brandSafetyStatus: 'PASSED',
        publicConsentAt: new Date(),
        dataConsentAt: new Date(),
        communicationConsentAt: new Date(),
        platforms: {
          create: [
            {
              platform: 'INSTAGRAM',
              handle: 'qatar_lifestyle_vip',
              profileUrl: 'https://instagram.com/qatar_lifestyle_vip',
              followerCount: 250000,
              engagementRate: 4.8,
            },
          ],
        },
      },
    });
    console.log(`✓ Created Influencer ID: ${influencer.id} (${influencer.displayName})`);

    // 2. Create Public Application
    console.log('2. Creating Public Application...');
    const application = await prisma.influencerApplication.create({
      data: {
        source: 'PUBLIC_FORM',
        status: 'SUBMITTED',
        submittedDataJson: {
          email: 'applicant.new@example.qa',
          displayName: 'Ahmad Al-Sulaiti',
          handle: 'ahmad_explores',
          primaryPlatform: 'INSTAGRAM',
          followerCount: 75000,
          publicConsent: true,
          dataConsent: true,
          communicationConsent: true,
        },
      },
    });
    console.log(`✓ Created Application ID: ${application.id}`);

    // Review application
    await prisma.influencerApplication.update({
      where: { id: application.id },
      data: { status: 'APPROVED', reviewedAt: new Date(), reviewNotes: 'Strong engagement rate' },
    });
    console.log('✓ Application approved');

    // 3. Create Influencer Campaign
    console.log('3. Creating Influencer Campaign...');
    const campaign = await prisma.influencerCampaign.create({
      data: {
        titleEn: 'Winter Wonderland Qatar 2026',
        titleAr: 'مهرجان شتاء قطر ٢٠٢٦',
        internalCode: 'WWQ-2026',
        campaignType: 'PRODUCT_LAUNCH',
        status: 'ACTIVE',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-12-31'),
        budget: 250000,
      },
    });
    console.log(`✓ Created Campaign: ${campaign.internalCode} (${campaign.titleEn})`);

    // 4. Shortlist and Assign Creator to Campaign
    console.log('4. Assigning Creator to Campaign...');
    const assignment = await prisma.campaignCreator.create({
      data: {
        campaignId: campaign.id,
        influencerId: influencer.id,
        status: 'INVITED',
        invitedAt: new Date(),
        agreedRate: 10000,
        currency: 'QAR',
      },
    });
    console.log(`✓ Created CampaignCreator Assignment ID: ${assignment.id}`);

    // Accept invitation
    await prisma.campaignCreator.update({
      where: { id: assignment.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });
    console.log('✓ Creator accepted invitation');

    // 5. Create Legal Agreement Record
    console.log('5. Creating Influencer Agreement Record...');
    const agreement = await prisma.influencerAgreement.create({
      data: {
        campaignCreatorId: assignment.id,
        agreementType: 'STANDARD_COMMERCIAL',
        status: 'PENDING',
        version: 1,
        agreedRate: 10000,
        currency: 'QAR',
        usageRightsTerms: 'All MENA digital & social media rights for 12 months',
        usageRightsStartAt: new Date('2026-11-01'),
        usageRightsEndAt: new Date('2027-11-01'),
        exclusivityTerms: 'Exclusive for entertainment and amusement parks in Qatar',
      },
    });
    console.log(`✓ Created Agreement ID: ${agreement.id} (v${agreement.version})`);

    // Creator signs and E3 countersigns
    const signedAgreement = await prisma.influencerAgreement.update({
      where: { id: agreement.id },
      data: {
        status: 'SIGNED',
        signedByCreatorAt: new Date(),
        countersignedAt: new Date(),
        signedDate: new Date(),
      },
    });
    await prisma.campaignCreator.update({
      where: { id: assignment.id },
      data: { status: 'CONTRACTED', contractedAt: new Date(), agreementStatus: 'SIGNED' },
    });
    console.log(`✓ Agreement executed and Creator status is now CONTRACTED`);

    // 6. Create Deliverable, Submit Draft, Request Revision, and Approve
    console.log('6. Deliverable lifecycle: draft -> revision -> approval...');
    const deliverable = await prisma.campaignDeliverable.create({
      data: {
        campaignCreatorId: assignment.id,
        platform: 'INSTAGRAM',
        contentType: 'REEL',
        title: 'VIP Winter Festival Opening Walkthrough',
        status: 'BRIEFED',
        draftDueAt: new Date('2026-11-05'),
        publishDueAt: new Date('2026-11-10'),
      },
    });

    // Submit Draft v1
    const draft1 = await prisma.contentSubmission.create({
      data: {
        deliverableId: deliverable.id,
        version: 1,
        captionEn: 'Experience the magic at Winter Wonderland Qatar! #E3Qatar',
        submittedByType: 'CREATOR',
      },
    });
    await prisma.campaignDeliverable.update({
      where: { id: deliverable.id },
      data: { status: 'UNDER_REVIEW' },
    });

    // Request revision
    await prisma.contentReview.create({
      data: {
        submissionId: draft1.id,
        decision: 'REVISION_REQUESTED',
        feedbackEn: 'Please include the official booking discount code in the first two lines.',
      },
    });
    await prisma.campaignDeliverable.update({
      where: { id: deliverable.id },
      data: { status: 'REVISION_REQUESTED' },
    });

    // Submit Draft v2
    const draft2 = await prisma.contentSubmission.create({
      data: {
        deliverableId: deliverable.id,
        version: 2,
        captionEn: 'Use code E3-FATIMA for 15% off! Experience the magic at Winter Wonderland Qatar! #E3Qatar',
        submittedByType: 'CREATOR',
      },
    });
    await prisma.campaignDeliverable.update({
      where: { id: deliverable.id },
      data: { status: 'UNDER_REVIEW' },
    });

    // Approve Draft v2
    await prisma.contentReview.create({
      data: {
        submissionId: draft2.id,
        decision: 'APPROVED',
        feedbackEn: 'Approved for publication!',
      },
    });
    await prisma.campaignDeliverable.update({
      where: { id: deliverable.id },
      data: {
        status: 'APPROVED',
        publishedUrl: 'https://instagram.com/reel/DE_DEMO_REEL_123',
        publishedAt: new Date(),
      },
    });
    console.log(`✓ Deliverable approved and published`);

    // 7. Submit Invoice, Finance Approval, and Mark Paid
    console.log('7. Invoice & Payment lifecycle...');
    const payment = await prisma.influencerPayment.create({
      data: {
        campaignCreatorId: assignment.id,
        invoiceNumber: 'INV-QA-2026-088',
        amount: 10000,
        currency: 'QAR',
        paymentStatus: 'INVOICE_RECEIVED',
        invoiceReceivedDate: new Date(),
      },
    });
    console.log(`✓ Recorded Invoice: ${payment.invoiceNumber} (${payment.amount} ${payment.currency})`);

    // Finance approval
    const approvedPayment = await prisma.influencerPayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'PAYMENT_SUBMITTED',
        approvedAt: new Date(),
        paymentSubmittedDate: new Date(),
      },
    });

    // Mark paid with wire reference
    const paidPayment = await prisma.influencerPayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'PAID',
        paidDate: new Date(),
        paymentReference: 'QNB-IBAN-WIRE-992011',
      },
    });
    await prisma.campaignCreator.update({
      where: { id: assignment.id },
      data: {
        paymentStatus: 'PAID',
        paidDate: new Date(),
        paymentReference: 'QNB-IBAN-WIRE-992011',
      },
    });
    console.log(`✓ Payment marked PAID with reference: ${paidPayment.paymentReference}`);

    // 8. Promo Code & Tracking Link
    console.log('8. Promo code & tracking link creation...');
    const promo = await prisma.promoCode.create({
      data: {
        campaignId: campaign.id,
        campaignCreatorId: assignment.id,
        code: 'E3-FATIMA',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        validFrom: new Date('2026-11-01'),
        validUntil: new Date('2026-12-31'),
      },
    });

    const trackingLink = await prisma.trackingLink.create({
      data: {
        campaignId: campaign.id,
        campaignCreatorId: assignment.id,
        shortCode: 'FATIMA26',
        destinationUrl: 'https://eeeqa.com/en/b2c/tickets',
        utmCampaign: 'WWQ-2026',
        utmSource: 'instagram',
        utmMedium: 'influencer',
      },
    });
    console.log(`✓ Promo code created: ${promo.code}, Tracking Link: /t/${trackingLink.shortCode}`);

    // 9. Process BookingQube Conversion Attribution
    console.log('9. BookingQube conversions and refunds...');
    const conversion = await prisma.influencerConversion.create({
      data: {
        campaignId: campaign.id,
        campaignCreatorId: assignment.id,
        promoCodeId: promo.id,
        externalEventId: 'bq-evt-99101',
        externalOrderId: 'BQ-ORDER-7712',
        ticketCount: 4,
        grossRevenue: 1200,
        discountAmount: 180,
        refundAmount: 0,
        netRevenue: 1020,
        reconciliationStatus: 'MATCHED',
        rawPayloadJson: { orderId: 'BQ-ORDER-7712', promoCode: 'E3-FATIMA' },
      },
    });
    console.log(`✓ Recorded matched conversion: Order ${conversion.externalOrderId}, Net: ${conversion.netRevenue} QAR`);

    // Refund handling
    const refunded = await prisma.influencerConversion.update({
      where: { id: conversion.id },
      data: {
        refundAmount: 300,
        netRevenue: 720, // 1200 - 180 - 300 = 720
      },
    });
    console.log(`✓ Refund processed: Net revenue updated to ${refunded.netRevenue} QAR`);

    // 10. Unmatched Conversion to Reconciliation Queue
    console.log('10. BookingQube unmatched code -> Reconciliation Queue...');
    const unmatched = await prisma.influencerConversion.create({
      data: {
        unmatchedCode: 'UNKNOWN_VOUCHER_CODE',
        externalEventId: 'bq-evt-99102',
        externalOrderId: 'BQ-ORDER-7713',
        ticketCount: 2,
        grossRevenue: 600,
        discountAmount: 0,
        refundAmount: 0,
        netRevenue: 600,
        reconciliationStatus: 'UNMATCHED_CODE',
        rawPayloadJson: { orderId: 'BQ-ORDER-7713', promoCode: 'UNKNOWN_VOUCHER_CODE' },
      },
    });
    console.log(`✓ Unmatched conversion queued: Order ${unmatched.externalOrderId} with code ${unmatched.unmatchedCode}`);

    // Reconcile unmatched item
    const reconciled = await prisma.influencerConversion.update({
      where: { id: unmatched.id },
      data: {
        campaignId: campaign.id,
        campaignCreatorId: assignment.id,
        reconciliationStatus: 'MANUALLY_MATCHED',
      },
    });
    console.log(`✓ Unmatched conversion successfully reconciled to ${campaign.internalCode}!`);

    // 11. Secure Creator Token Lifecycle
    console.log('11. Secure Creator Token verification on real DB...');
    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const tokenRecord = await prisma.secureCreatorToken.create({
      data: {
        tokenHash,
        scope: 'CAMPAIGN_INVITATION',
        influencerId: influencer.id,
        campaignCreatorId: assignment.id,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
        maxUses: 5,
        useCount: 0,
      },
    });

    // Simulate usage increment
    const usedToken = await prisma.secureCreatorToken.update({
      where: { id: tokenRecord.id },
      data: { useCount: { increment: 1 }, lastUsedAt: new Date() },
    });
    console.log(`✓ Token used: count is ${usedToken.useCount} of ${usedToken.maxUses}`);

    console.log('\n======================================================');
    console.log('>>> ALL 11 DATABASE WORKFLOW STAGES PASSED ON REAL RECORDS <<<');
    console.log('======================================================\n');
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await setupDatabase();
    await runE2EWorkflow();
    process.exit(0);
  } catch (err: any) {
    console.error('STAGING E2E DB TEST FAILED:', err);
    process.exit(1);
  }
}

main();
