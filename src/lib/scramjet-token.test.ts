import { describe, expect, it } from "vitest";
import { createScramjetToken, revokeScramjetSession, verifyScramjetToken } from "./scramjet-token.mjs";

const SECRET = "scramjet-test-secret-with-at-least-32-characters";
const SESSION_ID = "e165fa44-3bb5-4e16-b01e-fc2dab79b331";

describe("Scramjet session tokens", () => {
  it("verifies a token only with its secret and before expiration", () => {
    const now = Date.now();
    const token = createScramjetToken(SESSION_ID, now + 60_000, SECRET);

    expect(verifyScramjetToken(token, SECRET, now)?.sessionId).toBe(SESSION_ID);
    expect(verifyScramjetToken(token, "wrong-secret-value-that-is-long-enough", now)).toBeNull();
    expect(verifyScramjetToken(token, SECRET, now + 60_000)).toBeNull();
  });

  it("rejects tampered and revoked tokens", () => {
    const token = createScramjetToken(SESSION_ID, Date.now() + 60_000, SECRET);
    const [sessionId, expiry, signature] = token.split(".");

    expect(verifyScramjetToken(`${sessionId}.${Number(expiry) + 1}.${signature}`, SECRET)).toBeNull();
    revokeScramjetSession(SESSION_ID);
    expect(verifyScramjetToken(token, SECRET)).toBeNull();
  });
});
