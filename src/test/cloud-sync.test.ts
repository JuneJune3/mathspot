import { describe, it, expect } from "vitest";
import { snapshot, cleanRemote } from "@/lib/cloud-sync";

describe("cloud sync", () => {
  it("only saves known setting keys", () => {
    const m = new Map([["wph-prefs", "{}"], ["sb-token", "secret"]]);
    expect(snapshot({ getItem: (k) => m.get(k) ?? null })).toEqual({ "wph-prefs": "{}" });
  });
  it("ignores unknown or non-text saved values", () => {
    expect(cleanRemote({ low_perf: "true", evil: "x", wph_prefs: 1, "wph-prefs": 5 })).toEqual({ low_perf: "true" });
  });
});
