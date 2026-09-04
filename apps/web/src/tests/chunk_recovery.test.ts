import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isChunkLoadError,
  shouldAttemptChunkReload,
  recordChunkReloadAttempt,
  clearChunkReloadAttempts,
} from "../lib/chunk-recovery";

describe("Chunk Error Recovery Utilities", () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockSessionStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = String(val);
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };

    (global as any).window = {
      sessionStorage: mockSessionStorage,
      location: {
        reload: () => {},
      },
    };
    (global as any).sessionStorage = mockSessionStorage;
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).sessionStorage;
  });

  describe("isChunkLoadError Detection", () => {
    it("identifies Next.js Turbopack failed to load chunk error reported in production", () => {
      const prodErrorMsg = "Failed to load chunk /_next/static/chunks/2ad-wdq5cz9nk.js from module 334890";
      const errorObj = new Error(prodErrorMsg);

      expect(isChunkLoadError(errorObj)).toBe(true);
      expect(isChunkLoadError(prodErrorMsg)).toBe(true);
    });

    it("identifies standard Webpack ChunkLoadError", () => {
      const err = new Error("Loading chunk 419 failed.");
      err.name = "ChunkLoadError";

      expect(isChunkLoadError(err)).toBe(true);
    });

    it("identifies CSS chunk loading failure", () => {
      const cssErr = new Error("Loading CSS chunk app/layout failed.");
      expect(isChunkLoadError(cssErr)).toBe(true);
    });

    it("identifies promise rejection with chunk error details", () => {
      const rejection = {
        reason: {
          message: "Failed to load chunk /_next/static/chunks/pages/dashboard.js",
        },
      };
      expect(isChunkLoadError(rejection)).toBe(true);
    });

    it("does not misidentify standard runtime errors", () => {
      expect(isChunkLoadError(new Error("Cannot read properties of undefined"))).toBe(false);
      expect(isChunkLoadError(new Error("NetworkError: Failed to fetch"))).toBe(false);
      expect(isChunkLoadError(new Error("Unauthorized: Invalid session"))).toBe(false);
      expect(isChunkLoadError(null)).toBe(false);
      expect(isChunkLoadError(undefined)).toBe(false);
    });
  });

  describe("Auto-Reload Guard & Cooldown Logic", () => {
    it("allows reload on the first chunk load error", () => {
      expect(shouldAttemptChunkReload()).toBe(true);
    });

    it("tracks retry attempts in sessionStorage and throttles after max retries", () => {
      expect(shouldAttemptChunkReload()).toBe(true);
      recordChunkReloadAttempt();

      expect(shouldAttemptChunkReload()).toBe(true);
      recordChunkReloadAttempt();

      // After 2 retries within cooldown, it should guard against infinite loops
      expect(shouldAttemptChunkReload()).toBe(false);
    });

    it("resets retry counter when cleared on clean navigation", () => {
      recordChunkReloadAttempt();
      recordChunkReloadAttempt();
      expect(shouldAttemptChunkReload()).toBe(false);

      clearChunkReloadAttempts();
      expect(shouldAttemptChunkReload()).toBe(true);
    });
  });
});
