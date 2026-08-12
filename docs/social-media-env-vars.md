# E3 Qatar — Social Media Manager: Required Vercel Environment Variables

## IMPORTANT: This document lists required variable NAMES only.
## Never store actual values in source code or tracked files.

---

## Social Media Manager (Required for production deployment)

### Encryption
SOCIAL_CREDENTIALS_ENCRYPTION_KEY
  Format: Exactly 64 hexadecimal characters (decodes to 32 bytes AES-256 key)
  OR:     Valid Base64 string decoding to exactly 32 bytes
  Required: YES (production fails closed without this key)
  Where to set: Vercel Dashboard → Project Settings → Environment Variables

### Cron Security
CRON_SECRET
  Format: Any strong random string (min 32 characters recommended)
  Required: YES (cron endpoint returns 503 if missing)
  Used as: Authorization: Bearer <CRON_SECRET>
  Where to set: Vercel Dashboard → Project Settings → Environment Variables

---

## Existing Required Variables (already configured)

DATABASE_URL
  Format: PostgreSQL connection string (Neon pooled endpoint)
  Required: YES

NEXTAUTH_SECRET
  Format: Random string (min 32 characters)
  Required: YES

NEXTAUTH_URL
  Format: Full production URL (https://your-domain.vercel.app)
  Required: YES

---

## Optional Social Provider Variables
## (Provider credentials are stored encrypted in the database via the admin UI,
##  not as environment variables. These are only needed for initial OAuth registration.)

# No provider secrets should be stored as environment variables.
# All provider app IDs, secrets, and tokens are stored AES-256-GCM encrypted
# in SocialProviderConfig and SocialAccount database tables.

---

## Vercel Plan Requirement
CRON_SCHEDULE: */30 * * * * (every 30 minutes)
Required Vercel Plan: Pro or Enterprise
(Hobby plan only supports daily cron at minimum)
