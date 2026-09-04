import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { isAttractionActiveByDate } from "@/lib/cms-attractions";
import { memoryCache } from "@/lib/cache/memory-cache";

const MAX_BATCH_SIZE = 20;
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SLUG_CLEAN_REGEX = /[^a-z0-9-]/g;

interface ValidatedStoryTypeInput {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  icon?: string | null;
  accentColor?: string | null;
  coverMediaUrl?: string | null;
  coverMediaType?: string;
  orderIndex: number;
  isActive: boolean;
}

function sanitizeUrl(urlStr: string | null | undefined): string | null {
  if (!urlStr || typeof urlStr !== 'string') return null;
  const trimmed = urlStr.trim();
  if (!trimmed) return null;
  if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) {
    throw new Error('Invalid media URL scheme: Only http(s):// or relative paths are permitted.');
  }
  return trimmed;
}

function normalizeSlug(slugOrTitle: string): string {
  const cleaned = slugOrTitle
    .toLowerCase()
    .trim()
    .replace(SLUG_CLEAN_REGEX, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!cleaned) {
    throw new Error('Slug must contain valid alphanumeric characters.');
  }
  if (cleaned.length > 60) {
    throw new Error('Slug must not exceed 60 characters.');
  }
  return cleaned;
}

function validateAndSanitizeStoryType(raw: any, fallbackIndex: number): ValidatedStoryTypeInput {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid payload: Story Type must be an object.');
  }

  // 1. Title validation
  const titleEn = typeof raw.titleEn === 'string' ? raw.titleEn.trim() : '';
  if (!titleEn || titleEn.length < 1 || titleEn.length > 100) {
    throw new Error('Title (English) is required and must be between 1 and 100 characters.');
  }

  const titleAr = typeof raw.titleAr === 'string' && raw.titleAr.trim() ? raw.titleAr.trim() : titleEn;
  if (titleAr.length > 100) {
    throw new Error('Title (Arabic) must not exceed 100 characters.');
  }

  // 2. Slug validation
  const rawSlug = raw.slug || titleEn;
  const slug = normalizeSlug(rawSlug);

  // 3. Accent Color validation
  let accentColor: string | null = null;
  if (raw.accentColor && typeof raw.accentColor === 'string') {
    const trimmedColor = raw.accentColor.trim();
    if (trimmedColor) {
      if (!HEX_COLOR_REGEX.test(trimmedColor)) {
        throw new Error(`Invalid accentColor format "${trimmedColor}": must be a valid 3 or 6-digit hex color (e.g. #8b5cf6).`);
      }
      accentColor = trimmedColor;
    }
  }

  // 4. Media URL validation
  const coverMediaUrl = sanitizeUrl(raw.coverMediaUrl);

  // 5. Icon sanitization
  let icon: string | null = null;
  if (raw.icon && typeof raw.icon === 'string') {
    const cleanIcon = raw.icon.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
    icon = cleanIcon || null;
  }

  // 6. Descriptions
  const descriptionEn = typeof raw.descriptionEn === 'string' ? raw.descriptionEn.trim().slice(0, 1000) || null : null;
  const descriptionAr = typeof raw.descriptionAr === 'string' ? raw.descriptionAr.trim().slice(0, 1000) || null : null;

  // 7. Order & Active status
  const orderIndex = typeof raw.orderIndex === 'number' && !isNaN(raw.orderIndex) ? Math.max(0, Math.floor(raw.orderIndex)) : fallbackIndex;
  const isActive = typeof raw.isActive === 'boolean' ? raw.isActive : true;

  // 8. ID (only pass through if non-empty string and not marked isNew)
  const id = typeof raw.id === 'string' && raw.id.trim() && !raw.isNew ? raw.id.trim() : undefined;

  return {
    id,
    slug,
    titleEn,
    titleAr,
    descriptionEn,
    descriptionAr,
    icon,
    accentColor: accentColor || '#8b5cf6',
    coverMediaUrl,
    coverMediaType: 'IMAGE',
    orderIndex,
    isActive,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const isManager = Boolean(userRole && hasPermission(userRole, 'b2c.content.read'));

    const requestedActive = url.searchParams.get("active");
    // Public callers can ONLY access active story tracks. Managers can query active or all.
    const activeOnly = !isManager || requestedActive === "true";
    const cacheKey = `api_story_types_public_${activeOnly}`;

    if (!isManager) {
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
        });
      }
    }

    const totalCount = await db.storyType.count();
    if (totalCount === 0) {
      const defaultStoryTypes = [
        { slug: 'drive', titleEn: 'Drive', titleAr: 'القيادة', icon: 'car', accentColor: '#3b82f6', orderIndex: 1, isActive: true },
        { slug: 'bounce', titleEn: 'Bounce', titleAr: 'القفز والمرح', icon: 'activity', accentColor: '#f59e0b', orderIndex: 2, isActive: true },
        { slug: 'compete', titleEn: 'Compete', titleAr: 'التحدي والمنافسة', icon: 'trophy', accentColor: '#ef4444', orderIndex: 3, isActive: true },
        { slug: 'explore', titleEn: 'Explore', titleAr: 'الاستكشاف', icon: 'compass', accentColor: '#10b981', orderIndex: 4, isActive: true },
        { slug: 'celebrate', titleEn: 'Celebrate', titleAr: 'الاحتفال', icon: 'gift', accentColor: '#8b5cf6', orderIndex: 5, isActive: true },
        { slug: 'family-time', titleEn: 'Family Time', titleAr: 'وقت العائلة', icon: 'users', accentColor: '#ec4899', orderIndex: 6, isActive: true }
      ];
      for (const st of defaultStoryTypes) {
        await db.storyType.upsert({
          where: { slug: st.slug },
          update: {},
          create: st
        });
      }
    }

    const storyTypes = await db.storyType.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { orderIndex: 'asc' },
      include: {
        features: {
          include: {
            attraction: {
              select: {
                heroThumbnailUrl: true,
                heroMediaUrl: true,
                isPublished: true,
                slug: true,
                nameEn: true,
                nameAr: true,
                taglineEn: true,
                taglineAr: true,
              }
            }
          }
        },
        _count: {
          select: { features: true }
        }
      }
    });

    // Fetch published attractions to extract JSON features activations for currently active destinations
    const publishedAttractions = await db.attraction.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        heroThumbnailUrl: true,
        heroMediaUrl: true,
        features: true,
        temporalStatus: true,
        operations: true,
      }
    });

    const activeAttractions = publishedAttractions.filter(isAttractionActiveByDate);

    // Attach matching JSON features activations from active attractions to each story type
    const enrichedStoryTypes = storyTypes.map((st: any) => {
      const jsonActivations: any[] = [];

      activeAttractions.forEach((attraction: any) => {
        const featList = Array.isArray(attraction.features) ? attraction.features : [];
        featList.forEach((feat: any, idx: number) => {
          const storyTypeIds = Array.isArray(feat.storyTypeIds) 
            ? feat.storyTypeIds.map((s: string) => s.toLowerCase())
            : [(feat.storyType || '').toLowerCase()];
          
          if (storyTypeIds.includes(st.slug.toLowerCase())) {
            jsonActivations.push({
              id: feat.id || `${attraction.id}-feat-${idx}`,
              titleEn: feat.titleEn || feat.title || attraction.nameEn,
              titleAr: feat.titleAr || feat.title || attraction.nameAr,
              descriptionEn: feat.descriptionEn || feat.description || '',
              descriptionAr: feat.descriptionAr || feat.description || '',
              highlightType: feat.highlightType || "Activity",
              iconUrl: feat.iconUrl,
              imageUrl: feat.imageUrl || attraction.heroThumbnailUrl || attraction.heroMediaUrl,
              attractionSlug: attraction.slug,
              attractionNameEn: attraction.nameEn,
              attractionNameAr: attraction.nameAr
            });
          }
        });
      });

      // Extract safe features from st.features
      const relationalActivations = (st.features || []).map((f: any) => ({
        id: f.id,
        titleEn: f.titleEn,
        titleAr: f.titleAr,
        descriptionEn: f.descriptionEn,
        descriptionAr: f.descriptionAr,
        highlightType: f.highlightType || "Activity",
        imageUrl: f.imageUrl || f.attraction?.heroThumbnailUrl || f.attraction?.heroMediaUrl || null,
        orderIndex: f.orderIndex ?? 0,
        attractionSlug: f.attraction?.slug,
        attractionNameEn: f.attraction?.nameEn,
        attractionNameAr: f.attraction?.nameAr,
        attraction: f.attraction ? {
          slug: f.attraction.slug,
          nameEn: f.attraction.nameEn,
          nameAr: f.attraction.nameAr,
          taglineEn: f.attraction.taglineEn,
          taglineAr: f.attraction.taglineAr,
          heroThumbnailUrl: f.attraction.heroThumbnailUrl,
          heroMediaUrl: f.attraction.heroMediaUrl,
          isPublished: f.attraction.isPublished,
          operations: f.attraction.operations,
          temporalStatus: f.attraction.temporalStatus
        } : null
      }));

      const allActivations = [...relationalActivations, ...jsonActivations];

      // If public user (non-manager), expose only safe fields
      if (!isManager) {
        return {
          id: st.id,
          slug: st.slug,
          titleEn: st.titleEn,
          titleAr: st.titleAr,
          descriptionEn: st.descriptionEn,
          descriptionAr: st.descriptionAr,
          icon: st.icon,
          coverMediaUrl: st.coverMediaUrl,
          coverMediaType: st.coverMediaType,
          accentColor: st.accentColor,
          orderIndex: st.orderIndex,
          isActive: st.isActive,
          activations: allActivations
        };
      }

      return {
        ...st,
        activations: allActivations
      };
    });
    
    if (!isManager) {
      memoryCache.set(cacheKey, enrichedStoryTypes, 60_000);
      return NextResponse.json(enrichedStoryTypes, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
      });
    }
    
    return NextResponse.json(enrichedStoryTypes);
  } catch (error: any) {
    console.error("[STORY_TYPES_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch story types" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access. Authentication required." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!hasPermission(userRole, 'b2c.content.write')) {
      return NextResponse.json({ error: "Forbidden. Insufficient permissions for B2C story type management." }, { status: 403 });
    }

    const body = await request.json();

    // 1. Handle batch save of story types from StoryDiscoveryManager
    if (Array.isArray(body.storyTypes)) {
      if (body.storyTypes.length > MAX_BATCH_SIZE) {
        return NextResponse.json(
          { error: `Batch limit exceeded. Maximum ${MAX_BATCH_SIZE} story types allowed per request.` },
          { status: 400 }
        );
      }

      const validatedBatch: ValidatedStoryTypeInput[] = [];
      const seenSlugs = new Set<string>();

      for (let i = 0; i < body.storyTypes.length; i++) {
        try {
          const validated = validateAndSanitizeStoryType(body.storyTypes[i], i);
          if (seenSlugs.has(validated.slug)) {
            return NextResponse.json(
              { error: `Duplicate slug "${validated.slug}" detected in batch payload.` },
              { status: 400 }
            );
          }
          seenSlugs.add(validated.slug);
          validatedBatch.push(validated);
        } catch (valErr: any) {
          return NextResponse.json({ error: valErr.message || "Invalid story type entry in batch." }, { status: 400 });
        }
      }

      // Execute upserts transactionally
      const upsertPromises = validatedBatch.map((st) => {
        if (st.id) {
          return db.storyType.update({
            where: { id: st.id },
            data: {
              slug: st.slug,
              titleEn: st.titleEn,
              titleAr: st.titleAr,
              descriptionEn: st.descriptionEn,
              descriptionAr: st.descriptionAr,
              icon: st.icon,
              coverMediaUrl: st.coverMediaUrl,
              accentColor: st.accentColor,
              orderIndex: st.orderIndex,
              isActive: st.isActive,
            }
          });
        } else {
          return db.storyType.upsert({
            where: { slug: st.slug },
            update: {
              titleEn: st.titleEn,
              titleAr: st.titleAr,
              descriptionEn: st.descriptionEn,
              descriptionAr: st.descriptionAr,
              icon: st.icon,
              coverMediaUrl: st.coverMediaUrl,
              accentColor: st.accentColor,
              orderIndex: st.orderIndex,
              isActive: st.isActive,
            },
            create: {
              slug: st.slug,
              titleEn: st.titleEn,
              titleAr: st.titleAr,
              descriptionEn: st.descriptionEn,
              descriptionAr: st.descriptionAr,
              icon: st.icon,
              coverMediaUrl: st.coverMediaUrl,
              accentColor: st.accentColor,
              orderIndex: st.orderIndex,
              isActive: st.isActive,
            }
          });
        }
      });

      const results = await db.$transaction(upsertPromises);
      return NextResponse.json({ success: true, count: results.length, data: results });
    }

    // 2. Single Story Type creation
    let validated: ValidatedStoryTypeInput;
    try {
      validated = validateAndSanitizeStoryType(body, 0);
    } catch (valErr: any) {
      return NextResponse.json({ error: valErr.message || "Invalid story type payload." }, { status: 400 });
    }

    const existingSlug = await db.storyType.findUnique({
      where: { slug: validated.slug }
    });
    if (existingSlug && (!validated.id || existingSlug.id !== validated.id)) {
      return NextResponse.json(
        { error: `Story track with slug "${validated.slug}" already exists.` },
        { status: 409 }
      );
    }

    const storyType = await db.storyType.create({
      data: {
        slug: validated.slug,
        titleEn: validated.titleEn,
        titleAr: validated.titleAr,
        descriptionEn: validated.descriptionEn,
        descriptionAr: validated.descriptionAr,
        icon: validated.icon,
        coverMediaUrl: validated.coverMediaUrl,
        accentColor: validated.accentColor,
        orderIndex: validated.orderIndex,
        isActive: validated.isActive,
      }
    });

    return NextResponse.json({ success: true, data: storyType }, { status: 201 });
  } catch (error: any) {
    console.error("[STORY_TYPES_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create story type" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access. Authentication required." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!hasPermission(userRole, 'b2c.content.write')) {
      return NextResponse.json({ error: "Forbidden. Insufficient permissions for B2C story type management." }, { status: 403 });
    }

    const body = await request.json();
    if (!body || !body.id) {
      return NextResponse.json({ error: "Missing Story Type ID" }, { status: 400 });
    }

    let validated: ValidatedStoryTypeInput;
    try {
      validated = validateAndSanitizeStoryType(body, 0);
    } catch (valErr: any) {
      return NextResponse.json({ error: valErr.message || "Invalid story type payload." }, { status: 400 });
    }

    const existing = await db.storyType.findUnique({
      where: { id: body.id }
    });
    if (!existing) {
      return NextResponse.json({ error: "Story Type not found" }, { status: 404 });
    }

    if (validated.slug !== existing.slug) {
      const conflict = await db.storyType.findUnique({
        where: { slug: validated.slug }
      });
      if (conflict && conflict.id !== existing.id) {
        return NextResponse.json({ error: `Slug "${validated.slug}" is already taken by another track.` }, { status: 409 });
      }
    }

    const updated = await db.storyType.update({
      where: { id: existing.id },
      data: {
        slug: validated.slug,
        titleEn: validated.titleEn,
        titleAr: validated.titleAr,
        descriptionEn: validated.descriptionEn,
        descriptionAr: validated.descriptionAr,
        icon: validated.icon,
        coverMediaUrl: validated.coverMediaUrl,
        accentColor: validated.accentColor,
        orderIndex: validated.orderIndex,
        isActive: validated.isActive,
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[STORY_TYPES_PUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update story type" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access. Authentication required." }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!hasPermission(userRole, 'b2c.content.write')) {
      return NextResponse.json({ error: "Forbidden. Insufficient permissions for B2C story type management." }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id")?.trim();
    const slug = url.searchParams.get("slug")?.trim();

    // Reject bulk or unspecified deletion
    if (!id && !slug) {
      return NextResponse.json({ error: "Missing Story Type ID or slug" }, { status: 400 });
    }
    if (id && slug) {
      return NextResponse.json({ error: "Provide either ID or slug, not both." }, { status: 400 });
    }

    const existing = await db.storyType.findFirst({
      where: id ? { id } : { slug },
      include: {
        _count: {
          select: { features: true }
        }
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "Story Type not found" }, { status: 404 });
    }

    const relationalFeaturesCount = existing._count?.features || 0;

    // Check JSON features in published attractions
    const matchingAttractions = await db.attraction.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        nameEn: true,
        features: true,
      }
    });

    let jsonFeatureReferences = 0;
    matchingAttractions.forEach((attr: any) => {
      const featList = Array.isArray(attr.features) ? attr.features : [];
      featList.forEach((feat: any) => {
        const storyTypeIds = Array.isArray(feat.storyTypeIds)
          ? feat.storyTypeIds.map((s: string) => s.toLowerCase())
          : [(feat.storyType || '').toLowerCase()];
        if (storyTypeIds.includes(existing.slug.toLowerCase())) {
          jsonFeatureReferences++;
        }
      });
    });

    const totalReferences = relationalFeaturesCount + jsonFeatureReferences;

    if (totalReferences > 0) {
      if (url.searchParams.get("forceDeactivate") === "true") {
        const deactivated = await db.storyType.update({
          where: { id: existing.id },
          data: { isActive: false }
        });
        return NextResponse.json({
          success: true,
          action: "deactivated",
          message: `Story Track "${existing.titleEn}" has active references and was safely deactivated instead of deleted.`,
          data: deactivated
        });
      }

      return NextResponse.json(
        {
          error: "Conflict: Cannot delete referenced Story Track.",
          message: `Story Track "${existing.titleEn}" is referenced by ${totalReferences} attraction feature(s). Deactivate the track instead of hard-deleting it.`,
          isReferenced: true,
          referenceCount: totalReferences,
          id: existing.id,
          slug: existing.slug
        },
        { status: 409 }
      );
    }

    await db.storyType.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({
      success: true,
      action: "deleted",
      id: existing.id,
      slug: existing.slug
    });
  } catch (error: any) {
    console.error("[STORY_TYPES_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to delete story type" }, { status: 500 });
  }
}
