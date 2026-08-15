-- AlterTable
ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "showOnTeamPage" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "departmentAr" TEXT,
ADD COLUMN IF NOT EXISTS "taglineAr" TEXT,
ADD COLUMN IF NOT EXISTS "heroTaglineAr" TEXT,
ADD COLUMN IF NOT EXISTS "careerJourneyAr" TEXT,
ADD COLUMN IF NOT EXISTS "keyStrengthsAr" TEXT,
ADD COLUMN IF NOT EXISTS "expertiseTagsAr" JSONB,
ADD COLUMN IF NOT EXISTS "coreCompetenciesAr" JSONB,
ADD COLUMN IF NOT EXISTS "experienceAr" JSONB,
ADD COLUMN IF NOT EXISTS "projectsAr" JSONB,
ADD COLUMN IF NOT EXISTS "certificationsAr" JSONB,
ADD COLUMN IF NOT EXISTS "educationAr" JSONB,
ADD COLUMN IF NOT EXISTS "awardsAr" JSONB,
ADD COLUMN IF NOT EXISTS "skillsMatrixAr" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmployeeProfile_showOnTeamPage_idx" ON "EmployeeProfile"("showOnTeamPage");
CREATE INDEX IF NOT EXISTS "EmployeeProfile_isFeatured_idx" ON "EmployeeProfile"("isFeatured");
CREATE INDEX IF NOT EXISTS "EmployeeProfile_displayOrder_idx" ON "EmployeeProfile"("displayOrder");
CREATE INDEX IF NOT EXISTS "EmployeeProfile_order_idx" ON "EmployeeProfile"("order");
