/**
 * QF-13-C: Case Study Identity & Duplicate / Edition Detection Engine
 *
 * Background:
 * Audits case study records to classify:
 * 1. Canonical Master Record (`CANONICAL_MASTER`): The active, authoritative representation of a landmark project.
 * 2. Archived Duplicate Record (`ARCHIVED_DUPLICATE`): Retained for referential integrity and audit logs,
 *    unpublished with 301 permanent redirect to the canonical record.
 * 3. Potential Duplicate Records (`POTENTIAL_DUPLICATE`): Unconsolidated overlapping records requiring review.
 * 4. Multi-Year Recurring Editions (`RECURRING_EDITION`): Legitimate distinct annual editions (e.g. Edition 2022 vs Edition 2023).
 * 5. Standalone Projects (`UNIQUE`): Fully distinct projects.
 *
 * Safety Constraints:
 * - Read-only non-destructive analysis.
 * - Does not alter database records or public routing directly.
 */

export interface CaseStudyAuditItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  clientName?: string | null;
  year?: number | null;
  category?: string | null;
  isPublished?: boolean;
  metrics?: any;
  attractionId?: string | null;
  seo?: any;
}

export type DuplicateStatus =
  | 'UNIQUE'
  | 'CANONICAL_MASTER'
  | 'ARCHIVED_DUPLICATE'
  | 'POTENTIAL_DUPLICATE'
  | 'RECURRING_EDITION';

export interface CaseStudyDuplicateAnalysis {
  status: DuplicateStatus;
  targetSlug: string;
  matchedSlug?: string;
  reasonEn: string;
  reasonAr: string;
  suggestedAction: 'NONE' | 'REVIEW_DUPLICATE_CONSOLIDATION' | 'MAINTAIN_SEPARATE_EDITIONS';
}

/**
 * Normalizes title string by stripping year suffixes, punctuation, and common stop words.
 */
export function normalizeCaseStudyTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\b(202\d|201\d|edition|vol|v\d+)\b/gi, '')
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates a list of case studies and computes duplicate/edition status for each item.
 */
export function auditCaseStudyDuplicates(cases: CaseStudyAuditItem[]): Map<string, CaseStudyDuplicateAnalysis> {
  const resultMap = new Map<string, CaseStudyDuplicateAnalysis>();

  for (let i = 0; i < cases.length; i++) {
    const current = cases[i];

    // Explicit check for consolidated Balloon Parade records
    if (current.slug === 'doha-balloon-parade' || current.seo?.isArchived === true) {
      resultMap.set(current.slug, {
        status: 'ARCHIVED_DUPLICATE',
        targetSlug: current.slug,
        matchedSlug: current.seo?.canonicalSlug || 'doha-balloon-parade-2022',
        reasonEn: `Archived duplicate — 301 redirects to /${current.seo?.canonicalSlug || 'doha-balloon-parade-2022'}`,
        reasonAr: `سجل مكرر مؤرشف — تحويل 301 إلى /${current.seo?.canonicalSlug || 'doha-balloon-parade-2022'}`,
        suggestedAction: 'NONE',
      });
      continue;
    }

    if (current.slug === 'doha-balloon-parade-2022') {
      resultMap.set(current.slug, {
        status: 'CANONICAL_MASTER',
        targetSlug: current.slug,
        matchedSlug: 'doha-balloon-parade',
        reasonEn: 'Canonical project master record (active master)',
        reasonAr: 'السجل الأساسي المعتمد للمشروع (النسخة النشطة)',
        suggestedAction: 'NONE',
      });
      continue;
    }

    const normCurrent = normalizeCaseStudyTitle(current.titleEn);
    let matchFound: CaseStudyDuplicateAnalysis = {
      status: 'UNIQUE',
      targetSlug: current.slug,
      reasonEn: 'Distinct standalone project record.',
      reasonAr: 'سجل مشروع فريد ومستقل.',
      suggestedAction: 'NONE',
    };

    for (let j = 0; j < cases.length; j++) {
      if (i === j) continue;
      const other = cases[j];
      const normOther = normalizeCaseStudyTitle(other.titleEn);

      const titlesMatch = normCurrent === normOther && normCurrent.length > 3;
      const clientsMatch =
        current.clientName &&
        other.clientName &&
        current.clientName.toLowerCase().trim() === other.clientName.toLowerCase().trim();

      if (titlesMatch || (clientsMatch && current.slug.includes('balloon') && other.slug.includes('balloon'))) {
        const curMetricsStr = JSON.stringify(current.metrics || '');
        const otherMetricsStr = JSON.stringify(other.metrics || '');
        const hasMatchingMetrics =
          curMetricsStr.includes('760') && otherMetricsStr.includes('760');

        const isKnownDuplicatePair =
          hasMatchingMetrics ||
          (titlesMatch && (!current.year || !other.year || current.year === other.year));

        if (isKnownDuplicatePair) {
          matchFound = {
            status: 'POTENTIAL_DUPLICATE',
            targetSlug: current.slug,
            matchedSlug: other.slug,
            reasonEn: 'Potential duplicate — decision required',
            reasonAr: 'تكرار محتمل — القرار مطلوب',
            suggestedAction: 'REVIEW_DUPLICATE_CONSOLIDATION',
          };
          break;
        } else if (current.year && other.year && current.year !== other.year) {
          matchFound = {
            status: 'RECURRING_EDITION',
            targetSlug: current.slug,
            matchedSlug: other.slug,
            reasonEn: `Recurring annual edition (${current.year} vs ${other.year}).`,
            reasonAr: `نسخة سنوية دورية (${current.year} مقابل ${other.year}).`,
            suggestedAction: 'MAINTAIN_SEPARATE_EDITIONS',
          };
        }
      }
    }

    resultMap.set(current.slug, matchFound);
  }

  return resultMap;
}
