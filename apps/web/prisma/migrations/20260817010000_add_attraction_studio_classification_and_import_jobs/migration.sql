-- AlterTable Attraction additive columns
ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "entityType" TEXT NOT NULL DEFAULT 'ATTRACTION';
ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "experienceFormat" TEXT NOT NULL DEFAULT 'PERMANENT_FEC';
ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "accessModel" TEXT NOT NULL DEFAULT 'PAID';
ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "durationModel" TEXT NOT NULL DEFAULT 'PERMANENT';
ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "environment" TEXT NOT NULL DEFAULT 'INDOOR';
ALTER TABLE "Attraction" ADD COLUMN IF NOT EXISTS "eventDetails" JSONB;

-- AlterTable AttractionFeature additive columns
ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "primaryStoryTypeId" TEXT;
ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "secondaryStoryTypeIds" JSONB;
ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "intensityLevel" TEXT DEFAULT 'MEDIUM';
ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER;
ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "minAge" INTEGER;
ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "minHeightCm" INTEGER;
ALTER TABLE "AttractionFeature" ADD COLUMN IF NOT EXISTS "targetAudience" JSONB;

-- CreateTable ImportJob
CREATE TABLE IF NOT EXISTS "ImportJob" (
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
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ImportJob_batchNumber_key" ON "ImportJob"("batchNumber");
CREATE INDEX IF NOT EXISTS "ImportJob_status_idx" ON "ImportJob"("status");
CREATE INDEX IF NOT EXISTS "ImportJob_targetType_idx" ON "ImportJob"("targetType");
CREATE INDEX IF NOT EXISTS "ImportJob_createdAt_idx" ON "ImportJob"("createdAt");
