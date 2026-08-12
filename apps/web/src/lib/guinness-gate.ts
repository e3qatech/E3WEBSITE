/**
 * guinness-gate.ts
 * Server-side gate for Guinness World Records™ branding publication.
 *
 * ALL FIVE conditions must be true for the badge, certificate image, and
 * Award structured-data to be rendered on the public Discover page.
 *
 * A client-side boolean (brandingUsageApproved) alone is NEVER sufficient.
 */

export interface GuinnessGateResult {
  allowed: boolean;
  reason: string;
}

export interface GuinnessRecordSection {
  enabled?: boolean;
  brandingUsageApproved?: boolean;
  approvedBadgeMediaId?: string | null;
  evidenceSource?: string | null;
  verificationStatus?: string | null;
  [key: string]: unknown;
}

/**
 * Returns { allowed: true } only when all five publication conditions pass:
 *  1. Section is not disabled
 *  2. brandingUsageApproved === true
 *  3. approvedBadgeMediaId is a non-empty string
 *  4. evidenceSource is a non-empty string
 *  5. verificationStatus === 'APPROVED'
 *
 * Any false condition returns { allowed: false, reason } immediately.
 * This function must be called server-side only (page.tsx / route.ts).
 */
export function isGuinnessPublicationAllowed(
  rec: GuinnessRecordSection | null | undefined
): GuinnessGateResult {
  if (!rec) {
    return { allowed: false, reason: "No recordBreaking section in CMS content" };
  }

  if (rec.enabled === false) {
    return { allowed: false, reason: "Condition 1 FAILED: recordBreaking section is disabled (enabled=false)" };
  }

  if (!rec.brandingUsageApproved) {
    return {
      allowed: false,
      reason: "Condition 2 FAILED: brandingUsageApproved is not true",
    };
  }

  if (!rec.approvedBadgeMediaId || typeof rec.approvedBadgeMediaId !== "string" || rec.approvedBadgeMediaId.trim() === "") {
    return {
      allowed: false,
      reason: "Condition 3 FAILED: approvedBadgeMediaId is missing or empty",
    };
  }

  if (!rec.evidenceSource || typeof rec.evidenceSource !== "string" || rec.evidenceSource.trim() === "") {
    return {
      allowed: false,
      reason: "Condition 4 FAILED: evidenceSource is missing or empty",
    };
  }

  if (rec.verificationStatus !== "APPROVED") {
    return {
      allowed: false,
      reason: `Condition 5 FAILED: verificationStatus is '${rec.verificationStatus ?? "undefined"}', must be 'APPROVED'`,
    };
  }

  return { allowed: true, reason: "All 5 publication conditions met" };
}
