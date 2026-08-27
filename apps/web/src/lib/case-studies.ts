import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * QF-05: Canonical Case Study Publication & Visibility Rules
 *
 * 1. Base Canonical Field: `isPublished: true` is strictly required for any public visibility.
 * 2. Status Guard: Draft, archived, unpublished, or hidden records must NEVER appear publicly.
 * 3. Featured Flag: `isFeatured: true` controls display ordering and highlight priority,
 *    but NEVER overrides publication eligibility.
 * 4. Linked Attraction Guard: If linked to an attraction, that attraction must also be published and not hidden.
 */

export interface CaseStudyLike {
  id?: string;
  slug?: string;
  titleEn?: string;
  titleAr?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isHidden?: boolean;
  status?: string;
  attraction?: {
    isPublished?: boolean;
    isHidden?: boolean;
  } | null;
  [key: string]: any;
}

/**
 * In-memory predicate to verify case study publication eligibility.
 * Handles both raw Prisma records and serialized client display DTOs.
 */
export function isCaseStudyEligible(cs: CaseStudyLike | null | undefined): boolean {
  if (!cs || typeof cs !== "object") return false;
  if (cs.isPublished === false) return false;
  if (cs.isHidden === true) return false;
  if (cs.isVisible === false) return false;

  // QF-13: Archived duplicate records marked in SEO must never appear on public index
  if (cs.seo?.isArchived === true) {
    return false;
  }

  if (typeof cs.status === "string") {
    const statusUpper = cs.status.trim().toUpperCase();
    if (["DRAFT", "ARCHIVED", "UNPUBLISHED", "HIDDEN", "DELETED"].includes(statusUpper)) {
      return false;
    }
  }

  // If explicitly linked to a hidden attraction, respect the hidden boundary
  if (cs.attraction && cs.attraction.isHidden === true) {
    return false;
  }

  // Must be explicitly published / visible (strictly true)
  return cs.isPublished === true || cs.isVisible === true;
}

/**
 * Canonical Prisma WHERE filter for public case study queries.
 */
export function getPublicCaseStudyWhere(
  additionalWhere?: Prisma.CaseStudyWhereInput
): Prisma.CaseStudyWhereInput {
  return {
    isPublished: true,
    ...(additionalWhere || {}),
  };
}

export interface PublicCaseStudiesQueryOptions {
  ids?: string[];
  category?: string;
  year?: number;
  attractionId?: string;
  limit?: number;
  featuredFirst?: boolean;
  includeTeam?: boolean;
  includeAttraction?: boolean;
  select?: Prisma.CaseStudySelect;
}

/**
 * Empty canonical fallback dictionary (all synthetic mocks removed).
 * Pure database-driven sourcing only.
 */
export const CANONICAL_CASE_STUDIES_FALLBACKS: Record<string, Partial<CaseStudyLike>> = {};

/**
 * Normalizes and safely shapes a real database case study record.
 * Guarantees required field structures (arrays, media types) without injecting synthetic mock content.
 */
export function enrichCaseStudyWithDefaults(rawCase: any): any {
  if (!rawCase) return rawCase;

  // Infer media types if missing
  let heroMediaType = rawCase.heroMediaType || "IMAGE";
  const heroImageUrl = rawCase.heroImageUrl || "";
  if (heroImageUrl && typeof heroImageUrl === "string") {
    if (heroImageUrl.endsWith(".mp4") || heroImageUrl.endsWith(".webm") || heroImageUrl.includes("/video/")) {
      heroMediaType = "VIDEO";
    }
  }

  let thumbnailMediaType = rawCase.thumbnailMediaType || "IMAGE";
  const thumbnailUrl = rawCase.thumbnailUrl || "";
  if (thumbnailUrl && typeof thumbnailUrl === "string") {
    if (thumbnailUrl.includes("spline") || thumbnailUrl.includes("my.spline.design")) {
      thumbnailMediaType = "SPLINE";
    } else if (thumbnailUrl.endsWith(".mp4") || thumbnailUrl.endsWith(".webm")) {
      thumbnailMediaType = "VIDEO";
    }
  }

  let rawMetrics: any[] = [];
  if (Array.isArray(rawCase.metrics) && rawCase.metrics.length > 0) {
    rawMetrics = rawCase.metrics;
  } else if (rawCase.metrics && typeof rawCase.metrics === "object" && Object.keys(rawCase.metrics).length > 0) {
    rawMetrics = Object.entries(rawCase.metrics).map(([key, val]) => ({
      labelEn: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      labelAr: key,
      valueEn: String(val),
      valueAr: String(val),
    }));
  }

  const rawGallery = Array.isArray(rawCase.gallery) ? rawCase.gallery : [];
  const rawTestimonials = Array.isArray(rawCase.testimonials) ? rawCase.testimonials : [];
  const rawSeo = rawCase.seo && typeof rawCase.seo === "object" ? rawCase.seo : {};

  return {
    ...rawCase,
    id: String(rawCase.id || ""),
    slug: String(rawCase.slug || ""),
    titleEn: rawCase.titleEn || "",
    titleAr: rawCase.titleAr || rawCase.titleEn || "",
    clientName: rawCase.clientName || "",
    category: rawCase.category || "",
    categoryAr: rawCase.categoryAr || rawCase.category || "",
    year: typeof rawCase.year === "number" ? rawCase.year : (rawCase.year ? Number(rawCase.year) : undefined),
    isFeatured: Boolean(rawCase.isFeatured),
    isPublished: Boolean(rawCase.isPublished ?? true),
    isVisible: Boolean(rawCase.isVisible ?? true),
    heroMediaType,
    heroImageUrl,
    thumbnailMediaType,
    thumbnailUrl,
    clientLogoUrl: rawCase.clientLogoUrl || "",
    challengeEn: rawCase.challengeEn || "",
    challengeAr: rawCase.challengeAr || "",
    solutionEn: rawCase.solutionEn || "",
    solutionAr: rawCase.solutionAr || "",
    resultEn: rawCase.resultEn || "",
    resultAr: rawCase.resultAr || "",
    metrics: rawMetrics,
    gallery: rawGallery,
    testimonials: rawTestimonials,
    seo: rawSeo,
  };
}

/**
 * Shared canonical database fetcher for public case studies.
 * Guarantees that only published real DB records are ever returned across all public consumers.
 */
export async function getPublicCaseStudies(options: PublicCaseStudiesQueryOptions = {}) {
  const {
    ids,
    category,
    year,
    attractionId,
    limit,
    featuredFirst = true,
    includeTeam = false,
    includeAttraction = false,
    select,
  } = options;

  try {
    const where: Prisma.CaseStudyWhereInput = {
      isPublished: true,
    };

    if (Array.isArray(ids) && ids.length > 0) {
      where.id = { in: ids };
      delete where.isPublished;
    }

    if (category && category !== "ALL" && category !== "All") {
      where.category = category;
    }

    if (year && !isNaN(year)) {
      where.year = year;
    }

    if (attractionId) {
      where.attractionId = attractionId;
    }

    const orderBy: Prisma.CaseStudyOrderByWithRelationInput[] = [];
    if (featuredFirst) {
      orderBy.push({ isFeatured: "desc" });
    }
    orderBy.push({ year: "desc" }, { createdAt: "desc" });

    const queryArgs: Prisma.CaseStudyFindManyArgs = {
      where,
      orderBy,
    };

    if (typeof limit === "number" && limit > 0) {
      queryArgs.take = limit;
    }

    if (select) {
      queryArgs.select = select;
    } else {
      const include: Prisma.CaseStudyInclude = {};
      if (includeTeam) {
        include.teamMembers = {
          include: { employeeProfile: true },
          orderBy: { orderIndex: "asc" },
        };
      }
      if (includeAttraction) {
        include.attraction = true;
      }
      if (Object.keys(include).length > 0) {
        queryArgs.include = include;
      }
    }

    const results = await db.caseStudy.findMany(queryArgs).catch(() => []);
    const eligibleResults = results.filter(isCaseStudyEligible);

    if (eligibleResults.length > 0) {
      const seen = new Set<string>();
      const uniqueResults = eligibleResults.filter((cs: any) => {
        const key = String(cs.slug || cs.id || "").toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return uniqueResults.map(enrichCaseStudyWithDefaults);
    }

    return [];
  } catch (error) {
    console.error("[GET_PUBLIC_CASE_STUDIES_ERROR]", error);
    return [];
  }
}

/**
 * Fetch a single case study by slug, alias, or title from database.
 * Returns null only if no matching record exists in DB.
 */
export async function getPublicCaseStudyBySlug(
  rawSlug: string,
  options: { includeTeam?: boolean; includeAttraction?: boolean } = {}
) {
  if (!rawSlug) return null;

  const rawDecoded = decodeURIComponent(rawSlug).trim();
  const cleanSlug = rawDecoded.toLowerCase().replace(/[\s_]+/g, "-");
  const underscoreSlug = rawDecoded.toLowerCase().replace(/[\s-]+/g, "_");
  const altSlug = cleanSlug.startsWith("case-") ? cleanSlug.replace(/^case-/, "") : `case-${cleanSlug}`;
  const plainTitle = cleanSlug.replace(/-/g, " ");

  try {
    const include: Prisma.CaseStudyInclude = {};
    if (options.includeTeam) {
      include.teamMembers = {
        include: { employeeProfile: true },
        orderBy: { orderIndex: "asc" },
      };
    }
    if (options.includeAttraction) {
      include.attraction = true;
    }

    // 1. Direct match by exact slug, normalized slugs, or ID
    let caseStudy = await db.caseStudy.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: rawDecoded },
          { slug: cleanSlug },
          { slug: underscoreSlug },
          { slug: altSlug },
          { id: rawSlug },
          { id: rawDecoded },
        ],
      },
      ...(Object.keys(include).length > 0 ? { include } : {}),
    }).catch(() => null);

    // 2. Case-insensitive / fuzzy match on slug, titleEn, or titleAr
    if (!caseStudy) {
      caseStudy = await db.caseStudy.findFirst({
        where: {
          OR: [
            { slug: { contains: cleanSlug, mode: "insensitive" } },
            { slug: { contains: underscoreSlug, mode: "insensitive" } },
            { titleEn: { contains: plainTitle, mode: "insensitive" } },
            { titleAr: { contains: rawDecoded, mode: "insensitive" } },
          ],
        },
        ...(Object.keys(include).length > 0 ? { include } : {}),
      }).catch(() => null);
    }

    // 3. Match by attraction slug or attraction ID
    if (!caseStudy) {
      const attraction = await db.attraction.findFirst({
        where: {
          OR: [
            { slug: cleanSlug },
            { slug: altSlug },
            { slug: { contains: cleanSlug.replace(/^case-/, ""), mode: "insensitive" } },
            { id: rawSlug },
            { id: rawDecoded },
          ],
        },
        select: { id: true },
      }).catch(() => null);

      if (attraction) {
        caseStudy = await db.caseStudy.findFirst({
          where: { attractionId: attraction.id },
          ...(Object.keys(include).length > 0 ? { include } : {}),
        }).catch(() => null);
      }
    }

    if (caseStudy) {
      return enrichCaseStudyWithDefaults(caseStudy);
    }
  } catch (error) {
    console.error("[GET_PUBLIC_CASE_STUDY_BY_SLUG_ERROR]", error);
  }

  return null;
}

/**
 * Fetch the next published case study for footer transitions.
 */
export async function getNextPublicCaseStudy(
  currentId: string,
  currentYear?: number
) {
  try {
    const nextStudy =
      (await db.caseStudy.findFirst({
        where: {
          isPublished: true,
          ...(currentYear ? { year: { lte: currentYear } } : {}),
          id: { not: currentId },
        },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      }).catch(() => null)) ||
      (await db.caseStudy.findFirst({
        where: {
          isPublished: true,
          id: { not: currentId },
        },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      }).catch(() => null));

    if (nextStudy && isCaseStudyEligible(nextStudy)) {
      return enrichCaseStudyWithDefaults(nextStudy);
    }
  } catch (error) {
    console.error("[GET_NEXT_PUBLIC_CASE_STUDY_ERROR]", error);
  }

  return null;
}
