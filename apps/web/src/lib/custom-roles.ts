import db from "@/lib/db";

const CUSTOM_ROLES_KEY = "rbac_custom_roles";

/**
 * In-memory short-lived cache for fast lookup during requests
 */
let memoryCache: { data: Record<string, string>; timestamp: number } | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds

export async function getCustomRolesMap(): Promise<Record<string, string>> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.data;
  }

  try {
    if (!db?.setting?.findUnique) return memoryCache?.data || {};
    const setting = await db.setting.findUnique({
      where: { key: CUSTOM_ROLES_KEY },
    });
    if (setting && setting.value && typeof setting.value === "object" && !Array.isArray(setting.value)) {
      const map = setting.value as Record<string, string>;
      memoryCache = { data: map, timestamp: now };
      return map;
    }
  } catch (_e) {
    // If setting table or key is missing, return empty fallback
  }

  return {};
}

export async function setCustomRoleForUser(identifier: string, role: string): Promise<void> {
  try {
    const cleanKey = identifier.toLowerCase().trim();
    const cleanRole = String(role).trim().toUpperCase();
    const current = await getCustomRolesMap();
    const updated = { ...current, [cleanKey]: cleanRole };

    // Invalidate local cache
    memoryCache = { data: updated, timestamp: Date.now() };

    if (!db?.setting?.upsert) return;

    await db.setting.upsert({
      where: { key: CUSTOM_ROLES_KEY },
      create: {
        key: CUSTOM_ROLES_KEY,
        value: updated,
        type: "SECURITY",
      },
      update: {
        value: updated,
      },
    });
  } catch (err: any) {
    console.warn("[SET_CUSTOM_ROLE_WARNING]", err?.message || err);
  }
}

export function resolveUserPlatformRole(
  emailOrId: string | null | undefined,
  dbRole: string,
  customMap: Record<string, string>
): string {
  if (!emailOrId) return dbRole;
  const key = emailOrId.toLowerCase().trim();
  if (customMap[key]) {
    return customMap[key];
  }
  return dbRole;
}
