-- CreateTable: PackageCategory
CREATE TABLE IF NOT EXISTS "PackageCategory" (
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
);

-- Add unique index on PackageCategory(slug)
CREATE UNIQUE INDEX IF NOT EXISTS "PackageCategory_slug_key" ON "PackageCategory"("slug");
CREATE INDEX IF NOT EXISTS "PackageCategory_slug_idx" ON "PackageCategory"("slug");
CREATE INDEX IF NOT EXISTS "PackageCategory_isActive_idx" ON "PackageCategory"("isActive");
CREATE INDEX IF NOT EXISTS "PackageCategory_sortOrder_idx" ON "PackageCategory"("sortOrder");

-- Add columns to Package if not exists
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "packageType" TEXT NOT NULL DEFAULT 'READY_TO_BOOK';
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "templateType" TEXT;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "templateCategory" TEXT;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "audienceTypes" JSONB;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "targetAudienceEn" TEXT;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "targetAudienceAr" TEXT;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "minAge" INTEGER;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "maxAge" INTEGER;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "childrenAllowed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "adultsAllowed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isPopular" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isNew" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isSeasonal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "isLimited" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "tags" JSONB;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "internalCost" DOUBLE PRECISION;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "estimatedMargin" DOUBLE PRECISION;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "depositRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "depositType" TEXT;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "depositAmount" DOUBLE PRECISION;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "includedGuestCount" INTEGER;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "extraGuestPrice" DOUBLE PRECISION;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "operatingDays" JSONB;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "bookingNoticeHours" INTEGER NOT NULL DEFAULT 24;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "cutoffTime" TEXT;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "availableFrom" TIMESTAMP(3);
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "availableTo" TIMESTAMP(3);
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "blackoutDates" JSONB;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "capacityPerSlot" INTEGER;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "waitingListEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- Create indexes on Package
CREATE INDEX IF NOT EXISTS "Package_categoryId_idx" ON "Package"("categoryId");
CREATE INDEX IF NOT EXISTS "Package_status_idx" ON "Package"("status");
CREATE INDEX IF NOT EXISTS "Package_isTemplate_idx" ON "Package"("isTemplate");

-- Add foreign key constraint to Package
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Package_categoryId_fkey'
  ) THEN
    ALTER TABLE "Package" ADD CONSTRAINT "Package_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PackageCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add columns to PackageLead if not exists
ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "budgetRange" TEXT;
ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "customSelections" JSONB;
ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "tasks" JSONB;
ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "activityLog" JSONB;
ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
ALTER TABLE "PackageLead" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;

CREATE INDEX IF NOT EXISTS "PackageLead_assignedToId_idx" ON "PackageLead"("assignedToId");

-- CreateTable: PackagePromotion
CREATE TABLE IF NOT EXISTS "PackagePromotion" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "PackagePromotion_code_key" ON "PackagePromotion"("code");
CREATE INDEX IF NOT EXISTS "PackagePromotion_isActive_idx" ON "PackagePromotion"("isActive");
CREATE INDEX IF NOT EXISTS "PackagePromotion_code_idx" ON "PackagePromotion"("code");

-- CreateTable: Coupon
CREATE TABLE IF NOT EXISTS "Coupon" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX IF NOT EXISTS "Coupon_code_idx" ON "Coupon"("code");
CREATE INDEX IF NOT EXISTS "Coupon_status_idx" ON "Coupon"("status");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Coupon_promotionId_fkey'
  ) THEN
    ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "PackagePromotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable: CouponUsage
CREATE TABLE IF NOT EXISTS "CouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "leadId" TEXT,
    "quotationId" TEXT,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contactEmail" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");
CREATE INDEX IF NOT EXISTS "CouponUsage_leadId_idx" ON "CouponUsage"("leadId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CouponUsage_couponId_fkey'
  ) THEN
    ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable: ReferralProgramme
CREATE TABLE IF NOT EXISTS "ReferralProgramme" (
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
);

CREATE INDEX IF NOT EXISTS "ReferralProgramme_status_idx" ON "ReferralProgramme"("status");

-- CreateTable: ReferralCode
CREATE TABLE IF NOT EXISTS "ReferralCode" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReferralCode_code_key" ON "ReferralCode"("code");
CREATE INDEX IF NOT EXISTS "ReferralCode_code_idx" ON "ReferralCode"("code");
CREATE INDEX IF NOT EXISTS "ReferralCode_status_idx" ON "ReferralCode"("status");
CREATE INDEX IF NOT EXISTS "ReferralCode_programmeId_idx" ON "ReferralCode"("programmeId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ReferralCode_programmeId_fkey'
  ) THEN
    ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "ReferralProgramme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable: LeadFormTemplate
CREATE TABLE IF NOT EXISTS "LeadFormTemplate" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "LeadFormTemplate_slug_key" ON "LeadFormTemplate"("slug");
CREATE INDEX IF NOT EXISTS "LeadFormTemplate_slug_idx" ON "LeadFormTemplate"("slug");
CREATE INDEX IF NOT EXISTS "LeadFormTemplate_isActive_idx" ON "LeadFormTemplate"("isActive");

-- CreateTable: PackageQuotation
CREATE TABLE IF NOT EXISTS "PackageQuotation" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "PackageQuotation_quoteNumber_key" ON "PackageQuotation"("quoteNumber");
CREATE INDEX IF NOT EXISTS "PackageQuotation_quoteNumber_idx" ON "PackageQuotation"("quoteNumber");
CREATE INDEX IF NOT EXISTS "PackageQuotation_status_idx" ON "PackageQuotation"("status");
CREATE INDEX IF NOT EXISTS "PackageQuotation_leadId_idx" ON "PackageQuotation"("leadId");
CREATE INDEX IF NOT EXISTS "PackageQuotation_packageId_idx" ON "PackageQuotation"("packageId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PackageQuotation_leadId_fkey'
  ) THEN
    ALTER TABLE "PackageQuotation" ADD CONSTRAINT "PackageQuotation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "PackageLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PackageQuotation_packageId_fkey'
  ) THEN
    ALTER TABLE "PackageQuotation" ADD CONSTRAINT "PackageQuotation_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable: QuotationItem
CREATE TABLE IF NOT EXISTS "QuotationItem" (
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
);

CREATE INDEX IF NOT EXISTS "QuotationItem_quotationId_idx" ON "QuotationItem"("quotationId");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'QuotationItem_quotationId_fkey'
  ) THEN
    ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "PackageQuotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
