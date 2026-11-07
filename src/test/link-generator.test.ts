import { describe, it, expect } from "vitest";
import { buildSiteLink } from "@/components/LinkGenerator";
import { SLOT_CAPS } from "@/lib/hyperbrowser.functions";

describe("site-only links", () => {
  it("always points at the current site even if another site is pasted", () => {
    expect(buildSiteLink("https://mathspot.lovable.app", "https://evil.com/games")).toBe("https://mathspot.lovable.app/games");
  });
  it("follows the site address when it changes", () => {
    expect(buildSiteLink("https://new-mathspot.app", "")).toBe("https://new-mathspot.app/");
  });
});

describe("browser slots", () => {
  it("Hyperbrowser allows 1 session at a time", () => {
    expect(SLOT_CAPS.hyperbrowser).toBe(1);
  });
});
