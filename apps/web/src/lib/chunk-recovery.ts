/**
 * Chunk Error Detection & Auto-Recovery Utilities
 * Protects Next.js SPA clients from crashing when new deployments invalidate stale chunk hashes.
 */

const RETRY_KEY = "e3_chunk_reload_time";
const COUNT_KEY = "e3_chunk_reload_count";
const MAX_AUTO_RETRIES = 2;
const RETRY_COOLDOWN_MS = 20_000;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;

  const err = error as Record<string, any>;
  const name = String(err?.name || "");
  const message = String(err?.message || err?.reason?.message || (typeof error === "string" ? error : ""));

  if (name === "ChunkLoadError") {
    return true;
  }

  const chunkPatterns = [
    /Failed to load chunk/i,
    /Loading (?:CSS )?chunk.*failed/i,
    /ChunkLoadError/i,
    /missing in chunk manifest/i,
    /Cannot find module.*chunks\//i,
    /webpackChunk/i,
    /_next\/static\/chunks/i,
  ];

  return chunkPatterns.some((pattern) => pattern.test(message));
}

export function shouldAttemptChunkReload(): boolean {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return false;
  }

  try {
    const lastAttempt = Number(sessionStorage.getItem(RETRY_KEY) || 0);
    const retryCount = Number(sessionStorage.getItem(COUNT_KEY) || 0);
    const now = Date.now();

    // If cooldown passed, reset retry counter
    if (now - lastAttempt > RETRY_COOLDOWN_MS) {
      return true;
    }

    // Allow up to MAX_AUTO_RETRIES within cooldown window
    return retryCount < MAX_AUTO_RETRIES;
  } catch {
    return true;
  }
}

export function recordChunkReloadAttempt(): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;

  try {
    const lastAttempt = Number(sessionStorage.getItem(RETRY_KEY) || 0);
    const retryCount = Number(sessionStorage.getItem(COUNT_KEY) || 0);
    const now = Date.now();

    const newCount = now - lastAttempt > RETRY_COOLDOWN_MS ? 1 : retryCount + 1;

    sessionStorage.setItem(RETRY_KEY, String(now));
    sessionStorage.setItem(COUNT_KEY, String(newCount));
  } catch {
    // Ignore storage quota or access errors
  }
}

export function clearChunkReloadAttempts(): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;

  try {
    sessionStorage.removeItem(RETRY_KEY);
    sessionStorage.removeItem(COUNT_KEY);
  } catch {
    // Ignore storage quota or access errors
  }
}

export function triggerSafeChunkReload(): boolean {
  if (typeof window === "undefined") return false;

  if (shouldAttemptChunkReload()) {
    recordChunkReloadAttempt();
    // Hard refresh to fetch updated HTML and current deployment chunks
    window.location.reload();
    return true;
  }

  return false;
}
