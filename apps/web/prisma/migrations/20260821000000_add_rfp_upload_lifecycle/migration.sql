-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "UploadStatus" AS ENUM ('INITIATED', 'VALIDATING', 'VALIDATED', 'ATTACHED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "RfpUpload" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RfpUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RfpUpload_pathname_key" ON "RfpUpload"("pathname");

-- CreateIndex
CREATE INDEX "RfpUpload_status_idx" ON "RfpUpload"("status");

-- CreateIndex
CREATE INDEX "RfpUpload_claimTokenHash_idx" ON "RfpUpload"("claimTokenHash");

-- CreateIndex
CREATE INDEX "RfpUpload_leadId_idx" ON "RfpUpload"("leadId");

-- CreateIndex
CREATE INDEX "RfpUpload_expiresAt_idx" ON "RfpUpload"("expiresAt");
