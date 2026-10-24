import { useEffect, useState } from "react";

export type Motion = "none" | "minimal" | "intense";
export type Prefs = { motion: Motion; idleMinutes: number; tabTitle: string; tabIcon: string };

export const DEFAULT_PREFS: Prefs = { motion: "minimal", idleMinutes: 10, tabTitle: "", tabIcon: "" };
export const MAX_IDLE_MINUTES = 15;
export const MAX_ICON_BYTES = 200_000;
const KEY = "wph-prefs";

export function clampIdle(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PREFS.idleMinutes;
  return Math.min(MAX_IDLE_MINUTES, Math.max(1, Math.round(n)));
}

function sanitize(p: Partial<Prefs>): Prefs {
  const motion: Motion = p.motion === "none" || p.motion === "intense" ? p.motion : "minimal";
  const icon = typeof p.tabIcon === "string" && (p.tabIcon.startsWith("data:image/") || p.tabIcon.startsWith("/")) ? p.tabIcon : "";
  return {
    motion,
    idleMinutes: clampIdle(Number(p.idleMinutes ?? DEFAULT_PREFS.idleMinutes)),
    tabTitle: String(p.tabTitle ?? "").slice(0, 60),
    tabIcon: icon.length <= MAX_ICON_BYTES * 1.4 ? icon : "",
  };
}

const listeners = new Set<(p: Prefs) => void>();
let current: Prefs = DEFAULT_PREFS;

function load(): Prefs {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY) ?? "{}"));
  } catch {
    return DEFAULT_PREFS;
  }
}

export function setPrefs(patch: Partial<Prefs>) {
  current = sanitize({ ...current, ...patch });
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* storage full */ }
  listeners.forEach((l) => l(current));
}

export function usePrefs(): Prefs {
  const [p, setP] = useState<Prefs>(DEFAULT_PREFS);
  useEffect(() => {
    current = load();
    setP(current);
    listeners.add(setP);
    return () => { listeners.delete(setP); };
  }, []);
  return p;
}

/** Applies motion level, tab title and tab icon to the page. */
export function usePrefsEffects(p: Prefs) {
  useEffect(() => {
    const low = typeof navigator !== "undefined" && ((navigator as { deviceMemory?: number }).deviceMemory ?? 8) <= 2;
    document.documentElement.dataset["motion"] = low && p.motion === "intense" ? "minimal" : p.motion;
  }, [p.motion]);
  useEffect(() => {
    document.title = p.tabTitle || "WebPortal Hub";
  }, [p.tabTitle]);
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = p.tabIcon || "/favicon.png";
  }, [p.tabIcon]);
}

/** Calls onIdle after `minutes` without mouse/keyboard/touch activity. */
export function useIdle(minutes: number, enabled: boolean, onIdle: () => void) {
  useEffect(() => {
    if (!enabled) return;
    let t: ReturnType<typeof setTimeout>;
    const reset = () => { clearTimeout(t); t = setTimeout(onIdle, clampIdle(minutes) * 60_000); };
    const evs = ["pointerdown", "keydown", "wheel", "touchstart", "mousemove"] as const;
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { clearTimeout(t); evs.forEach((e) => window.removeEventListener(e, reset)); };
  }, [minutes, enabled, onIdle]);
}
