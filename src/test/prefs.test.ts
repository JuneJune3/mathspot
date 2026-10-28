import { describe, expect, it } from "vitest";
import { clampIdle, normalizeProvider, MAX_IDLE_MINUTES, DEFAULT_PREFS } from "@/lib/prefs";

describe("normalizeProvider", () => {
  it("accepts the three configured providers", () => {
    expect(normalizeProvider("hyperbrowser")).toBe("hyperbrowser");
    expect(normalizeProvider("steel")).toBe("steel");
    expect(normalizeProvider("kernel")).toBe("kernel");
  });

  it("falls back to hyperbrowser for anything unknown", () => {
    expect(normalizeProvider("bogus")).toBe("hyperbrowser");
    expect(normalizeProvider(undefined)).toBe("hyperbrowser");
    expect(normalizeProvider(42)).toBe("hyperbrowser");
  });

  it("keeps hyperbrowser as the default preference", () => {
    expect(DEFAULT_PREFS.provider).toBe("hyperbrowser");
  });
});

describe("clampIdle", () => {
  it("caps at the 15 minute maximum", () => {
    expect(clampIdle(99)).toBe(MAX_IDLE_MINUTES);
    expect(clampIdle(16)).toBe(15);
  });

  it("never goes below 1 minute", () => {
    expect(clampIdle(0)).toBe(1);
    expect(clampIdle(Number.NaN)).toBe(DEFAULT_PREFS.idleMinutes);
  });
});
