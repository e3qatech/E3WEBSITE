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

  // Must have isPublished === true, or be a valid public DTO from getPublicCaseStudies
  return cs.isPublished === true || (Boolean(cs.id) && Boolean(cs.slug) && cs.isPublished !== false);
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
 * Shared canonical database fetcher for public case studies.
 * Guarantees that only published records are ever returned across all public consumers.
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

    const orderBy: Prisma.CaseStudyOrderByWithRelationInput[] = featuredFirst
      ? [{ isFeatured: "desc" }, { year: "desc" }, { createdAt: "desc" }]
      : [{ year: "desc" }, { createdAt: "desc" }];

    const queryArgs: any = {
      where,
      orderBy,
    };

    if (typeof limit === "number" && limit > 0 && (!ids || ids.length === 0)) {
      queryArgs.take = limit;
    }

    if (select) {
      queryArgs.select = select;
    } else {
      const include: Prisma.CaseStudyInclude = {};
      if (includeTeam) {
        include.teamMembers = {
          include: {
            employeeProfile: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        };
      }
      if (includeAttraction) {
        include.attraction = true;
      }
      if (Object.keys(include).length > 0) {
        queryArgs.include = include;
      }
    }

    const results = await db.caseStudy.findMany(queryArgs);
    const eligibleResults = results.filter(isCaseStudyEligible);

    // If specific IDs were requested, preserve their designated manual ordering
    if (Array.isArray(ids) && ids.length > 0) {
      const idMap = new Map((eligibleResults as any[]).map((item: any) => [item.id, item]));
      const ordered = ids.map((id) => idMap.get(id)).filter(Boolean) as typeof eligibleResults;
      return typeof limit === "number" && limit > 0 ? ordered.slice(0, limit) : ordered;
    }

    return eligibleResults;
  } catch (error) {
    console.error("[GET_PUBLIC_CASE_STUDIES_ERROR]", error);
    return [];
  }
}

/**
 * Fetch a single published case study by slug.
 * Returns null if the case study does not exist or is unpublished/draft.
 */
export async function getPublicCaseStudyBySlug(
  slug: string,
  options: { includeTeam?: boolean; includeAttraction?: boolean } = {}
) {
  if (!slug) return null;

  try {
    const include: Prisma.CaseStudyInclude = {};
    if (options.includeTeam) {
      include.teamMembers = {
        include: {
          employeeProfile: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      };
    }
    if (options.includeAttraction) {
      include.attraction = true;
    }

    const caseStudy = await db.caseStudy.findUnique({
      where: { slug },
      ...(Object.keys(include).length > 0 ? { include } : {}),
    });

    if (!isCaseStudyEligible(caseStudy)) {
      return null;
    }

    return caseStudy;
  } catch (error) {
    console.error("[GET_PUBLIC_CASE_STUDY_BY_SLUG_ERROR]", error);
    return null;
  }
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
      })) ||
      (await db.caseStudy.findFirst({
        where: {
          isPublished: true,
          id: { not: currentId },
        },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      }));

    return isCaseStudyEligible(nextStudy) ? nextStudy : null;
  } catch (error) {
    console.error("[GET_NEXT_PUBLIC_CASE_STUDY_ERROR]", error);
    return null;
  }
}
