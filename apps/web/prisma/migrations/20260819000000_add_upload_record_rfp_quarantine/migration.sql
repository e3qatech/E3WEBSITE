-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('INITIATED', 'UPLOADED', 'VALIDATING', 'VALIDATED', 'ATTACHED', 'REJECTED', 'EXPIRED', 'DELETED');

-- CreateEnum
CREATE TYPE "QuarantineStatus" AS ENUM ('UNSCANNED', 'QUARANTINED', 'CLEAN', 'REJECTED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "UploadRecord" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'B2B_RFP',
    "pathname" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT,
    "sessionHash" TEXT NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'INITIATED',
    "quarantineStatus" "QuarantineStatus" NOT NULL DEFAULT 'UNSCANNED',
    "leadId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UploadRecord_pathname_key" ON "UploadRecord"("pathname");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UploadRecord_sessionHash_idx" ON "UploadRecord"("sessionHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UploadRecord_status_idx" ON "UploadRecord"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UploadRecord_purpose_idx" ON "UploadRecord"("purpose");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UploadRecord_expiresAt_idx" ON "UploadRecord"("expiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UploadRecord_leadId_idx" ON "UploadRecord"("leadId");

-- AddForeignKey
ALTER TABLE "UploadRecord" ADD CONSTRAINT "UploadRecord_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
