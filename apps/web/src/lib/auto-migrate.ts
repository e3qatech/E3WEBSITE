import { db } from "@/lib/db";
import crypto from "crypto";

interface MigrationDefinition {
  name: string;
  sql: string[];
}

export const PENDING_MIGRATIONS: MigrationDefinition[] = [
  {
    name: '20260813130000_add_b2b_attraction_fields',
    sql: [
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "isB2bVisible" BOOLEAN NOT NULL DEFAULT true`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "b2bCategory" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "projectType" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "clientName" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "year" INTEGER`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "attendance" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "areaSize" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "servicesDelivered" JSONB`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "operationalScope" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "challengeEn" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "challengeAr" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "solutionEn" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "solutionAr" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "resultEn" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "resultAr" TEXT`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "downloadableProfile" TEXT`,
      `CREATE INDEX IF NOT EXISTS "Attraction_isB2bVisible_idx" ON "Attraction"("isB2bVisible")`
    ]
  },
  {
    name: '20260816000000_qf24e_bilingual_team_cms',
    sql: [
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "showOnTeamPage" BOOLEAN NOT NULL DEFAULT true`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "departmentAr" TEXT`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "taglineAr" TEXT`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "heroTaglineAr" TEXT`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "careerJourneyAr" TEXT`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "keyStrengthsAr" TEXT`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "expertiseTagsAr" JSONB`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "coreCompetenciesAr" JSONB`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "experienceAr" JSONB`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "projectsAr" JSONB`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "certificationsAr" JSONB`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "educationAr" JSONB`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "awardsAr" JSONB`,
      `ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "skillsMatrixAr" JSONB`,
      `CREATE INDEX IF NOT EXISTS "EmployeeProfile_showOnTeamPage_idx" ON "EmployeeProfile"("showOnTeamPage")`,
      `CREATE INDEX IF NOT EXISTS "EmployeeProfile_isFeatured_idx" ON "EmployeeProfile"("isFeatured")`,
      `CREATE INDEX IF NOT EXISTS "EmployeeProfile_displayOrder_idx" ON "EmployeeProfile"("displayOrder")`,
      `CREATE INDEX IF NOT EXISTS "EmployeeProfile_order_idx" ON "EmployeeProfile"("order")`
    ]
  },
  {
    name: '20260817000000_add_packages_marketplace_and_studio',
    sql: [
      `CREATE TABLE IF NOT EXISTS "PackageCategory" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL,
        "nameAr" TEXT NOT NULL,
        "descriptionEn" TEXT,
        "descriptionAr" TEXT,
        "icon" TEXT,
        "coverMediaUrl" TEXT,
        "theme" TEXT,
        "audience" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "isFeatured" BOOLEAN NOT NULL DEFAULT false,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "seo" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PackageCategory_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "PackageCategory_slug_key" ON "PackageCategory"("slug")`,
      `CREATE INDEX IF NOT EXISTS "PackageCategory_slug_idx" ON "PackageCategory"("slug")`,
      `CREATE INDEX IF NOT EXISTS "PackageCategory_isActive_idx" ON "PackageCategory"("isActive")`,
      `CREATE INDEX IF NOT EXISTS "PackageCategory_sortOrder_idx" ON "PackageCategory"("sortOrder")`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "packageType" TEXT NOT NULL DEFAULT 'READY_TO_BOOK'`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PUBLISHED'`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "templateType" TEXT`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "templateCategory" TEXT`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "audienceTypes" JSONB`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "targetAudienceEn" TEXT`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "targetAudienceAr" TEXT`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "minAge" INTEGER`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "maxAge" INTEGER`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "childrenAllowed" BOOLEAN NOT NULL DEFAULT true`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "adultsAllowed" BOOLEAN NOT NULL DEFAULT true`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isPopular" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isNew" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isSeasonal" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isLimited" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "tags" JSONB`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "internalCost" DOUBLE PRECISION`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "estimatedMargin" DOUBLE PRECISION`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "depositRequired" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "depositType" TEXT`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "depositAmount" DOUBLE PRECISION`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "includedGuestCount" INTEGER`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "extraGuestPrice" DOUBLE PRECISION`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "operatingDays" JSONB`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "bookingNoticeHours" INTEGER NOT NULL DEFAULT 24`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "cutoffTime" TEXT`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "availableFrom" TIMESTAMP(3)`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "availableTo" TIMESTAMP(3)`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "blackoutDates" JSONB`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "capacityPerSlot" INTEGER`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "waitingListEnabled" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "categoryId" TEXT`,
      `CREATE INDEX IF NOT EXISTS "Package_categoryId_idx" ON "Package"("categoryId")`,
      `CREATE INDEX IF NOT EXISTS "Package_status_idx" ON "Package"("status")`,
      `CREATE INDEX IF NOT EXISTS "Package_isTemplate_idx" ON "Package"("isTemplate")`,
      `ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "budgetRange" TEXT`,
      `ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "customSelections" JSONB`,
      `ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "tasks" JSONB`,
      `ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "activityLog" JSONB`,
      `ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT`,
      `ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "couponCode" TEXT`,
      `ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "referralCode" TEXT`,
      `CREATE INDEX IF NOT EXISTS "PackageLead_assignedToId_idx" ON "PackageLead"("assignedToId")`,
      `CREATE TABLE IF NOT EXISTS "PackagePromotion" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "code" TEXT,
        "labelEn" TEXT NOT NULL,
        "labelAr" TEXT NOT NULL,
        "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
        "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "maxDiscount" DOUBLE PRECISION,
        "minSpend" DOUBLE PRECISION,
        "minGuests" INTEGER,
        "applicableCategories" JSONB,
        "applicablePackages" JSONB,
        "validFrom" TIMESTAMP(3),
        "validTo" TIMESTAMP(3),
        "daysOfWeek" JSONB,
        "usageLimit" INTEGER,
        "perUserLimit" INTEGER DEFAULT 1,
        "isStackable" BOOLEAN NOT NULL DEFAULT false,
        "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "priority" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PackagePromotion_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "PackagePromotion_code_key" ON "PackagePromotion"("code")`,
      `CREATE INDEX IF NOT EXISTS "PackagePromotion_isActive_idx" ON "PackagePromotion"("isActive")`,
      `CREATE INDEX IF NOT EXISTS "PackagePromotion_code_idx" ON "PackagePromotion"("code")`,
      `CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "promotionId" TEXT,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "validFrom" TIMESTAMP(3),
        "validTo" TIMESTAMP(3),
        "usageLimit" INTEGER,
        "perUserLimit" INTEGER DEFAULT 1,
        "minSpend" DOUBLE PRECISION,
        "usedCount" INTEGER NOT NULL DEFAULT 0,
        "discountDelivered" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "utmSource" TEXT,
        "utmCampaign" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code")`,
      `CREATE INDEX IF NOT EXISTS "Coupon_code_idx" ON "Coupon"("code")`,
      `CREATE INDEX IF NOT EXISTS "Coupon_status_idx" ON "Coupon"("status")`,
      `CREATE TABLE IF NOT EXISTS "CouponUsage" (
        "id" TEXT NOT NULL,
        "couponId" TEXT NOT NULL,
        "leadId" TEXT,
        "quotationId" TEXT,
        "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "contactEmail" TEXT,
        "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE INDEX IF NOT EXISTS "CouponUsage_couponId_idx" ON "CouponUsage"("couponId")`,
      `CREATE INDEX IF NOT EXISTS "CouponUsage_leadId_idx" ON "CouponUsage"("leadId")`,
      `CREATE TABLE IF NOT EXISTS "ReferralProgramme" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "ownerType" TEXT NOT NULL DEFAULT 'CUSTOMER',
        "rewardType" TEXT NOT NULL DEFAULT 'DISCOUNT',
        "referrerReward" TEXT,
        "referredCustomerReward" TEXT,
        "applicablePackages" JSONB,
        "validFrom" TIMESTAMP(3),
        "validTo" TIMESTAMP(3),
        "usageLimit" INTEGER,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ReferralProgramme_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE INDEX IF NOT EXISTS "ReferralProgramme_status_idx" ON "ReferralProgramme"("status")`,
      `CREATE TABLE IF NOT EXISTS "ReferralCode" (
        "id" TEXT NOT NULL,
        "programmeId" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "ownerName" TEXT NOT NULL,
        "ownerEmail" TEXT,
        "ownerPhone" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "usedCount" INTEGER NOT NULL DEFAULT 0,
        "leadsGenerated" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ReferralCode_code_key" ON "ReferralCode"("code")`,
      `CREATE INDEX IF NOT EXISTS "ReferralCode_code_idx" ON "ReferralCode"("code")`,
      `CREATE INDEX IF NOT EXISTS "ReferralCode_status_idx" ON "ReferralCode"("status")`,
      `CREATE INDEX IF NOT EXISTS "ReferralCode_programmeId_idx" ON "ReferralCode"("programmeId")`,
      `CREATE TABLE IF NOT EXISTS "LeadFormTemplate" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL,
        "nameAr" TEXT NOT NULL,
        "descriptionEn" TEXT,
        "descriptionAr" TEXT,
        "formType" TEXT NOT NULL DEFAULT 'GENERAL',
        "fields" JSONB,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LeadFormTemplate_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "LeadFormTemplate_slug_key" ON "LeadFormTemplate"("slug")`,
      `CREATE INDEX IF NOT EXISTS "LeadFormTemplate_slug_idx" ON "LeadFormTemplate"("slug")`,
      `CREATE INDEX IF NOT EXISTS "LeadFormTemplate_isActive_idx" ON "LeadFormTemplate"("isActive")`,
      `CREATE TABLE IF NOT EXISTS "PackageQuotation" (
        "id" TEXT NOT NULL,
        "quoteNumber" TEXT NOT NULL,
        "version" INTEGER NOT NULL DEFAULT 1,
        "leadId" TEXT,
        "packageId" TEXT,
        "customerName" TEXT NOT NULL,
        "customerEmail" TEXT NOT NULL,
        "customerPhone" TEXT,
        "companyOrOrg" TEXT,
        "eventDate" TIMESTAMP(3),
        "validUntil" TIMESTAMP(3),
        "currency" TEXT NOT NULL DEFAULT 'QAR',
        "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "discountTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "taxTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "paymentSchedule" JSONB,
        "termsEn" TEXT,
        "termsAr" TEXT,
        "customerNotes" TEXT,
        "internalNotes" TEXT,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "sentAt" TIMESTAMP(3),
        "acceptedAt" TIMESTAMP(3),
        "rejectedAt" TIMESTAMP(3),
        "createdById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PackageQuotation_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "PackageQuotation_quoteNumber_key" ON "PackageQuotation"("quoteNumber")`,
      `CREATE INDEX IF NOT EXISTS "PackageQuotation_quoteNumber_idx" ON "PackageQuotation"("quoteNumber")`,
      `CREATE INDEX IF NOT EXISTS "PackageQuotation_status_idx" ON "PackageQuotation"("status")`,
      `CREATE INDEX IF NOT EXISTS "PackageQuotation_leadId_idx" ON "PackageQuotation"("leadId")`,
      `CREATE INDEX IF NOT EXISTS "PackageQuotation_packageId_idx" ON "PackageQuotation"("packageId")`,
      `CREATE TABLE IF NOT EXISTS "QuotationItem" (
        "id" TEXT NOT NULL,
        "quotationId" TEXT NOT NULL,
        "itemType" TEXT NOT NULL DEFAULT 'PACKAGE_TIER',
        "titleEn" TEXT NOT NULL,
        "titleAr" TEXT,
        "descriptionEn" TEXT,
        "descriptionAr" TEXT,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE INDEX IF NOT EXISTS "QuotationItem_quotationId_idx" ON "QuotationItem"("quotationId")`
    ]
  },
  {
    name: '20260817010000_add_attraction_studio_classification_and_import_jobs',
    sql: [
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "entityType" TEXT NOT NULL DEFAULT 'ATTRACTION'`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "experienceFormat" TEXT NOT NULL DEFAULT 'PERMANENT_FEC'`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "accessModel" TEXT NOT NULL DEFAULT 'PAID'`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "durationModel" TEXT NOT NULL DEFAULT 'PERMANENT'`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'INDOOR'`,
      `ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "eventDetails" JSONB`,
      `ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "primaryStoryTypeId" TEXT`,
      `ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "secondaryStoryTypeIds" JSONB`,
      `ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "intensityLevel" TEXT DEFAULT 'MEDIUM'`,
      `ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER`,
      `ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "minAge" INTEGER`,
      `ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "minHeightCm" INTEGER`,
      `ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "targetAudience" JSONB`,
      `CREATE TABLE IF NOT EXISTS "ImportJob" (
        "id" TEXT NOT NULL,
        "batchNumber" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "fileType" TEXT NOT NULL DEFAULT 'SPREADSHEET',
        "intakeMethod" TEXT NOT NULL DEFAULT 'SPREADSHEET',
        "targetType" TEXT NOT NULL DEFAULT 'ATTRACTIONS',
        "uploadedBy" TEXT DEFAULT 'Admin',
        "recordsCreated" INTEGER NOT NULL DEFAULT 0,
        "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
        "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
        "warningsCount" INTEGER NOT NULL DEFAULT 0,
        "errorsCount" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'DRAFT_READY',
        "appliedRecordIds" JSONB,
        "snapshotData" JSONB,
        "errorReport" JSONB,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ImportJob_batchNumber_key" ON "ImportJob"("batchNumber")`,
      `CREATE INDEX IF NOT EXISTS "ImportJob_status_idx" ON "ImportJob"("status")`,
      `CREATE INDEX IF NOT EXISTS "ImportJob_targetType_idx" ON "ImportJob"("targetType")`,
      `CREATE INDEX IF NOT EXISTS "ImportJob_createdAt_idx" ON "ImportJob"("createdAt")`
    ]
  },
  {
    name: '20260821000000_add_rfp_upload_lifecycle',
    sql: [
      `DO $$ BEGIN
        CREATE TYPE "UploadStatus" AS ENUM ('INITIATED', 'VALIDATING', 'VALIDATED', 'ATTACHED', 'REJECTED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
      `CREATE TABLE IF NOT EXISTS "RfpUpload" (
        "id" TEXT NOT NULL,
        "purpose" TEXT NOT NULL DEFAULT 'B2B_RFP',
        "pathname" TEXT NOT NULL,
        "originalFileName" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "fileSize" INTEGER NOT NULL,
        "claimTokenHash" TEXT NOT NULL,
        "status" "UploadStatus" NOT NULL DEFAULT 'VALIDATING',
        "leadId" TEXT,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RfpUpload_pkey" PRIMARY KEY ("id")
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "RfpUpload_pathname_key" ON "RfpUpload"("pathname")`,
      `CREATE INDEX IF NOT EXISTS "RfpUpload_status_idx" ON "RfpUpload"("status")`,
      `CREATE INDEX IF NOT EXISTS "RfpUpload_claimTokenHash_idx" ON "RfpUpload"("claimTokenHash")`,
      `CREATE INDEX IF NOT EXISTS "RfpUpload_leadId_idx" ON "RfpUpload"("leadId")`,
      `CREATE INDEX IF NOT EXISTS "RfpUpload_expiresAt_idx" ON "RfpUpload"("expiresAt")`
    ]
  }
];

export async function applyPendingDatabaseMigrations() {
  const results: any[] = [];

  for (const mig of PENDING_MIGRATIONS) {
    const migResult = { name: mig.name, appliedStatements: 0, errors: [] as string[] };

    for (const stmt of mig.sql) {
      try {
        await db.$executeRawUnsafe(stmt);
        migResult.appliedStatements++;
      } catch (err: any) {
        // Ignore duplicate object/relation already exists
        if (!err.message?.includes('already exists')) {
          migResult.errors.push(err.message);
        }
      }
    }

    // Record in _prisma_migrations if table exists
    try {
      const id = crypto.randomUUID();
      const checksum = crypto.createHash('sha256').update(mig.sql.join('\n')).digest('hex');
      await db.$executeRawUnsafe(`
        INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
        VALUES ('${id}', '${checksum}', NOW(), '${mig.name}', NULL, NULL, NOW(), ${mig.sql.length})
        ON CONFLICT ("migration_name") DO UPDATE SET "finished_at" = NOW(), "rolled_back_at" = NULL
      `);
    } catch (_migRecordErr) {
      // Ignore if table or constraints differ
    }

    results.push(migResult);
  }

  return results;
}

export async function publishAllContent() {
  try {
    const publishedAttractions = await db.$executeRawUnsafe(`UPDATE "Attraction" SET "isPublished" = true, "isHidden" = false, "updatedAt" = NOW()`);
    const publishedPages = await db.$executeRawUnsafe(`UPDATE "Pages" SET "status" = 'PUBLISHED', "updatedAt" = NOW()`);
    
    // Copy gateway draft to published if available
    try {
      await db.$executeRawUnsafe(`
        UPDATE "Setting" 
        SET "value" = (SELECT "value" FROM "Setting" WHERE "key" = 'gateway_customization_draft'), "updatedAt" = NOW() 
        WHERE "key" = 'gateway_customization_published' 
        AND EXISTS (SELECT 1 FROM "Setting" WHERE "key" = 'gateway_customization_draft')
      `);
    } catch (_gwErr) {}

    return {
      success: true,
      publishedAttractions,
      publishedPages
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message
    };
  }
}

export async function inspectMediaState() {
  try {
    const team: any[] = await db.$queryRawUnsafe(`SELECT "id", "firstName", "lastName", "designation", "profileImage", "showOnTeamPage" FROM "EmployeeProfile" ORDER BY "createdAt" ASC`);
    const settings: any[] = await db.$queryRawUnsafe(`SELECT "key", "value" FROM "Setting" WHERE "key" IN ('lightLogoUrl', 'darkLogoUrl', 'faviconUrl', 'gateway_customization_published')`);
    const pages: any[] = await db.$queryRawUnsafe(`SELECT "slug", "status", "updatedAt" FROM "Pages" ORDER BY "slug" ASC`);
    const attractions: any[] = await db.$queryRawUnsafe(`SELECT "id", "slug", "nameEn", "isPublished", "heroImageUrl" FROM "Attraction" ORDER BY "nameEn" ASC`);

    return {
      success: true,
      team,
      settings,
      pages,
      attractions
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message
    };
  }
}
