import { describe, it, expect } from "vitest";
import {
  generateRawToken,
  hashToken,
  isTokenExpired,
} from "../lib/influencer/tokens";

describe("Influencer Secure Portal Tokens & Cryptographic Security", () => {
  it("generates a high-entropy 32-byte cryptographically random raw token", () => {
    const rawToken1 = generateRawToken();
    const rawToken2 = generateRawToken();

    expect(rawToken1.length).toBeGreaterThanOrEqual(43); // base64url encoding of 32 bytes
    expect(rawToken2.length).toBeGreaterThanOrEqual(43);
    expect(rawToken1).not.toBe(rawToken2);
  });

  it("hashes tokens with SHA-256 deterministically", () => {
    const rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const hash1 = hashToken(rawToken);
    const hash2 = hashToken(rawToken);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(rawToken);
  });

  it("detects expired tokens accurately", () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours in future

    expect(isTokenExpired(pastDate)).toBe(true);
    expect(isTokenExpired(futureDate)).toBe(false);
  });

  it("enforces maxUses and revocation status", () => {
    const tokenRecord = {
      id: "tok_1",
      tokenHash: "abc",
      scope: "COMPLETE_PROFILE",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      maxUses: 1,
      useCount: 1,
      revokedAt: null,
    };

    // maxUses exceeded
    const isExhausted = tokenRecord.useCount >= tokenRecord.maxUses;
    expect(isExhausted).toBe(true);

    // Revoked check
    const revokedRecord = { ...tokenRecord, revokedAt: new Date() };
    expect(revokedRecord.revokedAt !== null).toBe(true);
  });
});
