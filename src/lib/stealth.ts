import { useEffect } from "react";

// Shared localStorage keys for tab cloaking, panic escape and cloud browsing.
export const KEYS = {
  cloakPreset: "mathspot_cloak_preset",
  cloakTitle: "mathspot_cloak_title",
  cloakIcon: "mathspot_cloak_icon",
  panicUrl: "mathspot_panic_url",
  panicKey: "mathspot_panic_key",
  cloudKernel: "mathspot_use_cloud_kernel",
} as const;

export const SETTINGS_EVENT = "mathspot-settings";

export const CLOAKING_PRESETS = [
  { id: "default", name: "MathSpot (Default)", title: "MathSpot", icon: "/favicon.png" },
  { id: "google_classroom", name: "Google Classroom", title: "Classes", icon: "https://ssl.gstatic.com/classroom/favicon.png" },
  { id: "clever", name: "Clever", title: "Clever | Portal", icon: "https://assets.clever.com/assets/p-clever-favicon.ico" },
  { id: "canvas", name: "Canvas", title: "Dashboard", icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" },
  { id: "edpuzzle", name: "Edpuzzle", title: "Edpuzzle", icon: "https://edpuzzle.imgix.net/edpuzzle-logo-icon.png" },
  { id: "schoology", name: "Schoology", title: "Home | Schoology", icon: "https://www.schoology.com/sites/default/files/favicon.ico" },
  { id: "iready", name: "i-Ready", title: "i-Ready", icon: "https://login.i-ready.com/favicon.ico" },
  { id: "ixl", name: "IXL Learning", title: "IXL | Dashboard", icon: "https://www.ixl.com/favicon.ico" },
  { id: "khan", name: "Khan Academy", title: "Dashboard | Khan Academy", icon: "https://www.khanacademy.org/favicon.ico" },
  { id: "kahoot", name: "Kahoot!", title: "Enter Game PIN - Kahoot!", icon: "https://kahoot.it/favicon.ico" },
  { id: "blooket", name: "Blooket", title: "Blooket", icon: "https://www.blooket.com/favicon.ico" },
  { id: "seesaw", name: "Seesaw", title: "Seesaw", icon: "https://web.seesaw.me/favicon.ico" },
  { id: "nearpod", name: "Nearpod", title: "Nearpod", icon: "https://nearpod.com/favicon.ico" },
  { id: "newsela", name: "Newsela", title: "Newsela | Instructional Content Platform", icon: "https://newsela.com/favicon.ico" },
  { id: "epic", name: "Epic!", title: "Epic | Kids' Books & Reading", icon: "https://www.getepic.com/favicon.ico" },
  { id: "brainpop", name: "BrainPOP", title: "BrainPOP", icon: "https://www.brainpop.com/favicon.ico" },
  { id: "mobymax", name: "MobyMax", title: "MobyMax", icon: "https://www.mobymax.com/favicon.ico" },
  { id: "freckle", name: "Freckle", title: "Freckle Student Dashboard", icon: "https://student.freckle.com/favicon.ico" },
  { id: "dreambox", name: "DreamBox", title: "DreamBox Learning", icon: "https://play.dreambox.com/favicon.ico" },
];

export function read(key: string, fallback = ""): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

export function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage blocked */ }
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

/** Only http(s) URLs are allowed as panic targets or custom icons. */
export function safeUrl(v: string, fallback: string): string {
  return /^https?:\/\//i.test(v.trim()) ? v.trim() : fallback;
}

export function isCloaked(): boolean {
  const p = read(KEYS.cloakPreset, "default");
  return p !== "default";
}

function applyCloak() {
  const preset = read(KEYS.cloakPreset, "default");
  let title = "MathSpot";
  let icon = "/favicon.png";
  if (preset === "custom") {
    title = read(KEYS.cloakTitle) || title;
    icon = safeUrl(read(KEYS.cloakIcon), icon);
  } else {
    const p = CLOAKING_PRESETS.find((x) => x.id === preset);
    if (p) { title = p.title; icon = p.icon; }
  }
  if (preset === "default") return; // let the page keep its own title/icon
  if (document.title !== title) document.title = title;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
  if (link.getAttribute("href") !== icon) link.href = icon;
}

/** Mounted once in the root layout: keeps the tab cloak applied and listens for the panic key. */
export function useStealth() {
  useEffect(() => {
    applyCloak();
    const obs = new MutationObserver(() => { if (isCloaked()) applyCloak(); });
    const titleEl = document.querySelector("title");
    if (titleEl) obs.observe(titleEl, { childList: true });
    const onKey = (e: KeyboardEvent) => {
      const key = read(KEYS.panicKey, "Escape");
      if (e.key !== key) return;
      const t = e.target as HTMLElement | null;
      if (t?.dataset["panicCapture"] === "true") return;
      e.preventDefault();
      window.location.replace(safeUrl(read(KEYS.panicUrl), "https://classroom.google.com"));
    };
    const onChange = () => applyCloak();
    window.addEventListener("keydown", onKey);
    window.addEventListener(SETTINGS_EVENT, onChange);
    return () => {
      obs.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SETTINGS_EVENT, onChange);
    };
  }, []);
}
