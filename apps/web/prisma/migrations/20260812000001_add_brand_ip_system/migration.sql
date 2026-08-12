-- CreateTable
CREATE TABLE "BrandCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BrandCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BrandCategory_slug_key" ON "BrandCategory"("slug");

-- CreateTable
CREATE TABLE "BrandRelationshipType" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    CONSTRAINT "BrandRelationshipType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BrandRelationshipType_slug_key" ON "BrandRelationshipType"("slug");

-- CreateTable
CREATE TABLE "BrandIP" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "taglineEn" TEXT,
    "taglineAr" TEXT,
    "shortDescriptionEn" TEXT,
    "shortDescriptionAr" TEXT,
    "fullStoryEn" TEXT,
    "fullStoryAr" TEXT,
    "launchYear" INTEGER,
    "parentEntity" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lifecycleStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "primaryLogoUrl" TEXT,
    "lightLogoUrl" TEXT,
    "darkLogoUrl" TEXT,
    "compactLogoUrl" TEXT,
    "logoAltEn" TEXT,
    "logoAltAr" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'IMAGE',
    "primaryMediaUrl" TEXT,
    "coverMediaUrl" TEXT,
    "detailMediaUrl" TEXT,
    "fallbackImageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "mediaGallery" JSONB,
    "mediaAltEn" TEXT,
    "mediaAltAr" TEXT,
    "categoryId" TEXT,
    "primaryRelationshipId" TEXT,
    "showOnB2C" BOOLEAN NOT NULL DEFAULT true,
    "showInWorldsCreated" BOOLEAN NOT NULL DEFAULT true,
    "featureOnB2C" BOOLEAN NOT NULL DEFAULT false,
    "b2cDisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "b2cTitleOverrideEn" TEXT,
    "b2cTitleOverrideAr" TEXT,
    "b2cShortDescOverrideEn" TEXT,
    "b2cShortDescOverrideAr" TEXT,
    "b2cDetailCopyEn" TEXT,
    "b2cDetailCopyAr" TEXT,
    "b2cCtaLabelEn" TEXT,
    "b2cCtaLabelAr" TEXT,
    "b2cCtaUrl" TEXT,
    "showOnB2B" BOOLEAN NOT NULL DEFAULT true,
    "showInB2BPortfolio" BOOLEAN NOT NULL DEFAULT true,
    "featureOnB2B" BOOLEAN NOT NULL DEFAULT false,
    "b2bDisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "b2bBusinessOverviewEn" TEXT,
    "b2bBusinessOverviewAr" TEXT,
    "b2bBusinessValueEn" TEXT,
    "b2bBusinessValueAr" TEXT,
    "b2bCapabilitiesEn" TEXT,
    "b2bCapabilitiesAr" TEXT,
    "b2bCtaLabelEn" TEXT,
    "b2bCtaLabelAr" TEXT,
    "b2bInquiryUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BrandIP_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BrandIP_slug_key" ON "BrandIP"("slug");

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "venueEn" TEXT,
    "venueAr" TEXT,
    "addressEn" TEXT,
    "addressAr" TEXT,
    "googleMapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openingDate" TIMESTAMP(3),
    "closingDate" TIMESTAMP(3),
    "generalHours" JSONB,
    "timingRules" JSONB,
    "ticketingUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "chatLink" TEXT,
    "coverMediaUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "attractionId" TEXT,
    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandPlacement" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "attractionId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'HOSTED_EXPERIENCE',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    CONSTRAINT "BrandPlacement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BrandPlacement_brandId_attractionId_role_key" ON "BrandPlacement"("brandId", "attractionId", "role");

-- AlterTable AttractionFeature
ALTER TABLE "AttractionFeature" ADD COLUMN "iconUrl" TEXT;
ALTER TABLE "AttractionFeature" ADD COLUMN "highlightType" TEXT NOT NULL DEFAULT 'ACTIVITY';
ALTER TABLE "AttractionFeature" ADD COLUMN "linkedBrandId" TEXT;
ALTER TABLE "AttractionFeature" ADD COLUMN "showBrandLogo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AttractionFeature" ADD COLUMN "logoVariant" TEXT NOT NULL DEFAULT 'AUTO';
ALTER TABLE "AttractionFeature" ADD COLUMN "ctaLabelEn" TEXT;
ALTER TABLE "AttractionFeature" ADD COLUMN "ctaLabelAr" TEXT;
ALTER TABLE "AttractionFeature" ADD COLUMN "ctaUrl" TEXT;
ALTER TABLE "AttractionFeature" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "AttractionFeature" ADD COLUMN "endDate" TIMESTAMP(3);

-- CreateTable for implicit m:n BrandIP to BrandRelationshipType
CREATE TABLE "_BrandIPToBrandRelationshipType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX "_BrandIPToBrandRelationshipType_AB_unique" ON "_BrandIPToBrandRelationshipType"("A", "B");
CREATE INDEX "_BrandIPToBrandRelationshipType_B_index" ON "_BrandIPToBrandRelationshipType"("B");

-- CreateTable for implicit m:n BrandPlacement to Location
CREATE TABLE "_BrandPlacementToLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX "_BrandPlacementToLocation_AB_unique" ON "_BrandPlacementToLocation"("A", "B");
CREATE INDEX "_BrandPlacementToLocation_B_index" ON "_BrandPlacementToLocation"("B");

-- CreateTable for implicit m:n AttractionFeature to Location
CREATE TABLE "_AttractionFeatureToLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX "_AttractionFeatureToLocation_AB_unique" ON "_AttractionFeatureToLocation"("A", "B");
CREATE INDEX "_AttractionFeatureToLocation_B_index" ON "_AttractionFeatureToLocation"("B");

-- Foreign Keys
ALTER TABLE "BrandIP" ADD CONSTRAINT "BrandIP_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BrandCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Location" ADD CONSTRAINT "Location_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BrandPlacement" ADD CONSTRAINT "BrandPlacement_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "BrandIP"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BrandPlacement" ADD CONSTRAINT "BrandPlacement_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AttractionFeature" ADD CONSTRAINT "AttractionFeature_linkedBrandId_fkey" FOREIGN KEY ("linkedBrandId") REFERENCES "BrandIP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "_BrandIPToBrandRelationshipType" ADD CONSTRAINT "_BrandIPToBrandRelationshipType_A_fkey" FOREIGN KEY ("A") REFERENCES "BrandIP"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_BrandIPToBrandRelationshipType" ADD CONSTRAINT "_BrandIPToBrandRelationshipType_B_fkey" FOREIGN KEY ("B") REFERENCES "BrandRelationshipType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_BrandPlacementToLocation" ADD CONSTRAINT "_BrandPlacementToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "BrandPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_BrandPlacementToLocation" ADD CONSTRAINT "_BrandPlacementToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_AttractionFeatureToLocation" ADD CONSTRAINT "_AttractionFeatureToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "AttractionFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_AttractionFeatureToLocation" ADD CONSTRAINT "_AttractionFeatureToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
