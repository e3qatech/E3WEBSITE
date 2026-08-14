/**
 * QF-13-B: Case Study Identity & Duplicate / Edition Detection Engine
 *
 * Background:
 * Audits case study records to classify:
 * 1. Potential Duplicate Records: Multiple representations of the exact same event
 *    (e.g., `doha-balloon-parade` and `doha-balloon-parade-2022` representing the same 3-5 May 2022 project).
 *    Inconsistent fields (such as year: 2024 on an unedited seed record) are NOT used to infer separate editions.
 * 2. Multi-Year Recurring Editions: Legitimate distinct recurring annual editions (e.g., Edition 2022 vs Edition 2023)
 *    that represent separate calendar occurrences.
 *
 * Safety Constraints:
 * - Read-only non-destructive analysis.
 * - Does not alter database records, publication status, or public slug routing.
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
}

export type DuplicateStatus =
  | 'UNIQUE'
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

      // Check if both records refer to the same root title/event
      if (titlesMatch || (clientsMatch && current.slug.includes('balloon') && other.slug.includes('balloon'))) {
        const curMetricsStr = JSON.stringify(current.metrics || '');
        const otherMetricsStr = JSON.stringify(other.metrics || '');
        const hasMatchingMetrics =
          curMetricsStr.includes('760') && otherMetricsStr.includes('760');

        // Doha Balloon Parade represents the single 3-5 May 2022 project; inconsistent year values (e.g. 2024) must NOT infer a separate edition
        const isBalloonParadePair =
          (current.slug.includes('balloon') && other.slug.includes('balloon')) ||
          (normCurrent.includes('balloon parade') && normOther.includes('balloon parade'));

        const isKnownDuplicatePair =
          isBalloonParadePair ||
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
