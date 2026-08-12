-- CreateTable
CREATE TABLE IF NOT EXISTS "Insight" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'ARTICLE',
    "publishStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "subtitleEn" TEXT,
    "subtitleAr" TEXT,
    "excerptEn" TEXT,
    "excerptAr" TEXT,
    "bodyEn" TEXT,
    "bodyAr" TEXT,
    "featuredMediaId" TEXT,
    "featuredMediaUrl" TEXT,
    "mobileMediaUrl" TEXT,
    "galleryMediaIds" JSONB,
    "category" TEXT,
    "tags" JSONB,
    "authorEmployeeProfileId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "metaTitleEn" TEXT,
    "metaTitleAr" TEXT,
    "metaDescriptionEn" TEXT,
    "metaDescriptionAr" TEXT,
    "canonicalUrlEn" TEXT,
    "canonicalUrlAr" TEXT,
    "ogTitleEn" TEXT,
    "ogTitleAr" TEXT,
    "ogDescriptionEn" TEXT,
    "ogDescriptionAr" TEXT,
    "ogImageMediaId" TEXT,
    "twitterTitleEn" TEXT,
    "twitterTitleAr" TEXT,
    "twitterDescriptionEn" TEXT,
    "twitterDescriptionAr" TEXT,
    "twitterImageMediaId" TEXT,
    "indexingDirective" TEXT DEFAULT 'INDEX_FOLLOW',
    "focusTopicEn" TEXT,
    "focusTopicAr" TEXT,
    "secondaryTopicsEn" JSONB,
    "secondaryTopicsAr" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Package" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT,
    "taglineEn" TEXT,
    "taglineAr" TEXT,
    "shortDescriptionEn" TEXT,
    "shortDescriptionAr" TEXT,
    "fullDescriptionEn" TEXT,
    "fullDescriptionAr" TEXT,
    "category" TEXT NOT NULL DEFAULT 'BIRTHDAY',
    "audienceType" TEXT NOT NULL DEFAULT 'KIDS',
    "coverMediaUrl" TEXT,
    "heroMediaUrl" TEXT,
    "heroMediaType" TEXT NOT NULL DEFAULT 'IMAGE',
    "brochureUrl" TEXT,
    "startingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceDisplayMode" TEXT NOT NULL DEFAULT 'STARTING_FROM',
    "currency" TEXT NOT NULL DEFAULT 'QAR',
    "minGuests" INTEGER NOT NULL DEFAULT 10,
    "maxGuests" INTEGER NOT NULL DEFAULT 100,
    "durationMinutes" INTEGER NOT NULL DEFAULT 120,
    "ageSuitabilityEn" TEXT,
    "ageSuitabilityAr" TEXT,
    "indoorOutdoor" TEXT NOT NULL DEFAULT 'INDOOR',
    "badgeTextEn" TEXT,
    "badgeTextAr" TEXT,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "bookingType" TEXT NOT NULL DEFAULT 'ENQUIRY_REQUIRED',
    "bookingQubeUrl" TEXT,
    "attractionId" TEXT,
    "brandId" TEXT,
    "locationId" TEXT,
    "tiers" JSONB,
    "inclusions" JSONB,
    "addOns" JSONB,
    "journeySteps" JSONB,
    "gallery" JSONB,
    "testimonials" JSONB,
    "faqs" JSONB,
    "termsConditions" JSONB,
    "seo" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PackageLead" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "leadType" TEXT NOT NULL DEFAULT 'BIRTHDAY',
    "customerName" TEXT NOT NULL,
    "companyOrOrg" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "whatsApp" TEXT,
    "contactMethod" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "celebrationName" TEXT,
    "ageGroup" TEXT,
    "preferredDate" TIMESTAMP(3),
    "alternativeDate" TIMESTAMP(3),
    "preferredTimeSlot" TEXT,
    "expectedGuests" INTEGER NOT NULL DEFAULT 10,
    "expectedChildren" INTEGER,
    "expectedAdults" INTEGER,
    "estimatedValue" DOUBLE PRECISION,
    "packageId" TEXT,
    "selectedTierId" TEXT,
    "selectedTierName" TEXT,
    "selectedAddOns" JSONB,
    "themePreference" TEXT,
    "cateringRequirements" TEXT,
    "accessibilityReqs" TEXT,
    "specialRequests" TEXT,
    "attachments" JSONB,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedToId" TEXT,
    "internalNotes" JSONB,
    "sourcePage" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT true,
    "termsAcceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Insight_slug_key" ON "Insight"("slug");
CREATE INDEX IF NOT EXISTS "Insight_publishStatus_idx" ON "Insight"("publishStatus");
CREATE INDEX IF NOT EXISTS "Insight_contentType_idx" ON "Insight"("contentType");
CREATE INDEX IF NOT EXISTS "Insight_publishedAt_idx" ON "Insight"("publishedAt");
CREATE INDEX IF NOT EXISTS "Insight_featured_idx" ON "Insight"("featured");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Package_slug_key" ON "Package"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Package_code_key" ON "Package"("code");
CREATE INDEX IF NOT EXISTS "Package_category_idx" ON "Package"("category");
CREATE INDEX IF NOT EXISTS "Package_isPublished_idx" ON "Package"("isPublished");
CREATE INDEX IF NOT EXISTS "Package_isFeatured_idx" ON "Package"("isFeatured");
CREATE INDEX IF NOT EXISTS "Package_attractionId_idx" ON "Package"("attractionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PackageLead_leadId_key" ON "PackageLead"("leadId");
CREATE INDEX IF NOT EXISTS "PackageLead_status_idx" ON "PackageLead"("status");
CREATE INDEX IF NOT EXISTS "PackageLead_leadType_idx" ON "PackageLead"("leadType");
CREATE INDEX IF NOT EXISTS "PackageLead_packageId_idx" ON "PackageLead"("packageId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Insight_authorEmployeeProfileId_fkey') THEN
        ALTER TABLE "Insight" ADD CONSTRAINT "Insight_authorEmployeeProfileId_fkey" FOREIGN KEY ("authorEmployeeProfileId") REFERENCES "EmployeeProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Package_attractionId_fkey') THEN
        ALTER TABLE "Package" ADD CONSTRAINT "Package_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Package_brandId_fkey') THEN
        ALTER TABLE "Package" ADD CONSTRAINT "Package_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandIP"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Package_locationId_fkey') THEN
        ALTER TABLE "Package" ADD CONSTRAINT "Package_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PackageLead_packageId_fkey') THEN
        ALTER TABLE "PackageLead" ADD CONSTRAINT "PackageLead_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PackageLead_assignedToId_fkey') THEN
        ALTER TABLE "PackageLead" ADD CONSTRAINT "PackageLead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
