-- Ensure RoleType and PortalType exist before altering
DO $$ BEGIN
    CREATE TYPE "RoleType" AS ENUM ('CLIENT', 'STAFF', 'SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'CLIENT_ADMIN', 'CLIENT_VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PortalType" AS ENUM ('B2C', 'B2B', 'SHARED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterEnum
ALTER TYPE "RoleType" ADD VALUE IF NOT EXISTS 'CANDIDATE';

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ClientMembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure base tables exist before altering
CREATE TABLE IF NOT EXISTS "User" ("id" TEXT PRIMARY KEY, "name" TEXT, "email" TEXT UNIQUE, "role" "RoleType" DEFAULT 'CLIENT');
CREATE TABLE IF NOT EXISTS "EmployeeProfile" ("id" TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS "Talent" ("id" TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS "Client" ("id" TEXT PRIMARY KEY, "name" TEXT);
CREATE TABLE IF NOT EXISTS "Attraction" ("id" TEXT PRIMARY KEY, "slug" TEXT UNIQUE, "name" TEXT);
CREATE TABLE IF NOT EXISTS "Brand" ("id" TEXT PRIMARY KEY, "slug" TEXT UNIQUE, "name" TEXT);
CREATE TABLE IF NOT EXISTS "CaseStudy" ("id" TEXT PRIMARY KEY, "slug" TEXT UNIQUE, "title" TEXT);
CREATE TABLE IF NOT EXISTS "Service" ("id" TEXT PRIMARY KEY, "slug" TEXT UNIQUE, "title" TEXT);

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "EmployeeProfile" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- AlterTable
ALTER TABLE "Talent" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClientMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "role" "ClientMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InvitationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "RoleType" NOT NULL,
    "clientId" TEXT,
    "clientRole" "ClientMembershipRole",
    "employeeProfileId" TEXT,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AccountClaimToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "talentId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountClaimToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "portal" TEXT NOT NULL DEFAULT 'admin',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ClientMembership_userId_clientId_key" ON "ClientMembership"("userId", "clientId");
CREATE INDEX IF NOT EXISTS "ClientMembership_userId_isActive_idx" ON "ClientMembership"("userId", "isActive");
CREATE INDEX IF NOT EXISTS "ClientMembership_clientId_isActive_idx" ON "ClientMembership"("clientId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InvitationToken_token_key" ON "InvitationToken"("token");
CREATE INDEX IF NOT EXISTS "InvitationToken_token_idx" ON "InvitationToken"("token");
CREATE INDEX IF NOT EXISTS "InvitationToken_email_idx" ON "InvitationToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AccountClaimToken_token_key" ON "AccountClaimToken"("token");
CREATE INDEX IF NOT EXISTS "AccountClaimToken_token_idx" ON "AccountClaimToken"("token");
CREATE INDEX IF NOT EXISTS "AccountClaimToken_email_idx" ON "AccountClaimToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmployeeProfile_userId_key" ON "EmployeeProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Talent_userId_key" ON "Talent"("userId");

-- AddForeignKey
ALTER TABLE "ClientMembership" ADD CONSTRAINT "ClientMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientMembership" ADD CONSTRAINT "ClientMembership_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationToken" ADD CONSTRAINT "InvitationToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talent" ADD CONSTRAINT "Talent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
