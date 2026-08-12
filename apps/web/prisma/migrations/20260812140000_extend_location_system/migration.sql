-- AlterTable Location: add extended canonical fields
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "shortDescriptionEn" TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "shortDescriptionAr" TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "directionsUrl" TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "locationType" TEXT NOT NULL DEFAULT 'PERMANENT_ATTRACTION';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "operationalStatus" TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Asia/Qatar';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "thumbnailMediaId" TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "mapPinMediaId" TEXT;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "pinColorToken" TEXT NOT NULL DEFAULT 'CYAN';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "mapVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "publicationStatus" TEXT NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex for Location
CREATE UNIQUE INDEX IF NOT EXISTS "Location_slug_key" ON "Location"("slug");
CREATE INDEX IF NOT EXISTS "Location_locationType_operationalStatus_idx" ON "Location"("locationType", "operationalStatus");
CREATE INDEX IF NOT EXISTS "Location_publicationStatus_mapVisible_idx" ON "Location"("publicationStatus", "mapVisible");

-- CreateTable AttractionLocation
CREATE TABLE IF NOT EXISTS "AttractionLocation" (
    "id" TEXT NOT NULL,
    "attractionId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "mapVisible" BOOLEAN NOT NULL DEFAULT true,
    "availabilityStatus" TEXT DEFAULT 'AVAILABLE',
    "openingHoursOverride" JSONB,
    "bookingUrlOverride" TEXT,
    "startingPriceOverride" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'QAR',
    "shortLabelEn" TEXT,
    "shortLabelAr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttractionLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for AttractionLocation
CREATE UNIQUE INDEX IF NOT EXISTS "AttractionLocation_attractionId_locationId_key" ON "AttractionLocation"("attractionId", "locationId");
CREATE INDEX IF NOT EXISTS "AttractionLocation_attractionId_idx" ON "AttractionLocation"("attractionId");
CREATE INDEX IF NOT EXISTS "AttractionLocation_locationId_idx" ON "AttractionLocation"("locationId");

-- AddForeignKey
ALTER TABLE "AttractionLocation" ADD CONSTRAINT "AttractionLocation_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttractionLocation" ADD CONSTRAINT "AttractionLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
