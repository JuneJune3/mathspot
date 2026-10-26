import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============= Multi-provider cloud browser router =============
// Providers: Hyperbrowser, Steel, Kernel. The caller's chosen provider is
// tried first; any other provider with a key acts as a fallback. Keys come
// from the signed-in user's saved key (user_api_keys) or the project secrets.

type ProviderId = "hyperbrowser" | "steel" | "kernel";
const PROVIDER_IDS: ProviderId[] = ["hyperbrowser", "steel", "kernel"];

const ENV_KEYS: Record<ProviderId, string> = {
  hyperbrowser: "HYPERBROWSER_API_KEY",
  steel: "STEEL_API_KEY",
  kernel: "KERNEL_API_KEY",
};

export type Live = { sessionId: string; liveUrl: string; url: string; provider: ProviderId };

function providerFromEnv(p: ProviderId): string | undefined {
  const v = process.env[ENV_KEYS[p]];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

/** Which providers have any key configured (project secret). No secrets returned. */
export const providerStatus = createServerFn({ method: "GET" }).handler(async () => {
  const available: Record<ProviderId, boolean> = { hyperbrowser: false, steel: false, kernel: false };
  for (const p of PROVIDER_IDS) available[p] = Boolean(providerFromEnv(p));
  return { available };
});

/** Saves the signed-in user's own API key for a provider (overrides the project key). */
export const saveProviderKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        provider: z.enum(["hyperbrowser", "steel", "kernel"]),
        apiKey: z.string().trim().min(8).max(300),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_api_keys")
      .upsert(
        { user_id: context.userId, provider: data.provider, api_key: data.apiKey, updated_at: new Date().toISOString() },
        { onConflict: "user_id,provider" },
      );
    if (error) throw new Error("Could not save the key. Please try again.");
    return { ok: true };
  });

/** Removes the signed-in user's saved key for a provider (falls back to the project key). */
export const clearProviderKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ provider: z.enum(["hyperbrowser", "steel", "kernel"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("user_api_keys").delete().eq("user_id", context.userId).eq("provider", data.provider);
    return { ok: true };
  });

/** Which providers the signed-in user has saved a personal key for (no values returned). */
export const providerKeyState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("user_api_keys").select("provider, updated_at");
    const own: Record<string, boolean> = { hyperbrowser: false, steel: false, kernel: false };
    if (!error) for (const row of data ?? []) own[row.provider] = true;
    const available: Record<ProviderId, boolean> = { hyperbrowser: false, steel: false, kernel: false };
    for (const p of PROVIDER_IDS) available[p] = Boolean(own[p] || providerFromEnv(p));
    return { own, available };
  });

function resolveOrder(requested: ProviderId | undefined, userKeys: Partial<Record<ProviderId, string>>): { provider: ProviderId; key: string }[] {
  const keyed = PROVIDER_IDS.filter((p) => userKeys[p] || providerFromEnv(p));
  const order = requested && keyed.includes(requested)
    ? [requested, ...keyed.filter((p) => p !== requested)]
    : keyed;
  return order.map((p) => ({ provider: p, key: userKeys[p] ?? providerFromEnv(p)! }));
}

export function toUrl(input: string): string {
  const q = input.trim();
  if (/^https?:\/\//i.test(q)) return q;
  if (/^[^\s]+\.[a-z]{2,}(\/.*)?$/i.test(q)) return "https://" + q;
  return "https://www.google.com/search?q=" + encodeURIComponent(q);
}

// ---------- Hyperbrowser ----------

type HbSession = { id: string; liveUrl?: string; computerActionEndpoint?: string };

async function hyperAction(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Hyperbrowser action failed [${res.status}]`);
}

async function createHyper(key: string, url: string): Promise<Live> {
  const res = await fetch("https://api.hyperbrowser.ai/api/session", {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ useStealth: true, adblock: true }),
  });
  if (!res.ok) throw new Error(`Hyperbrowser could not start [${res.status}]`);
  const s = (await res.json()) as HbSession;
  const endpoint = s.computerActionEndpoint;
  if (!endpoint) throw new Error("Hyperbrowser did not return a control link");
  await hyperAction(endpoint, { action: "press_keys", keys: ["Control_L", "l"] });
  await hyperAction(endpoint, { action: "type_text", text: url });
  await hyperAction(endpoint, { action: "press_keys", keys: ["Return"] });
  return { sessionId: s.id, liveUrl: s.liveUrl ?? "", url, provider: "hyperbrowser" };
}

// ---------- Steel ----------

async function createSteel(key: string, url: string): Promise<Live> {
  const res = await fetch("https://api.steel.dev/v1/sessions", {
    method: "POST",
    headers: { "steel-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ debugConfig: { interactive: true } }),
  });
  if (!res.ok) throw new Error(`Steel could not start [${res.status}]`);
  const s = (await res.json()) as { id: string; debugUrl?: string; sessionViewerUrl?: string };
  const base = s.debugUrl || s.sessionViewerUrl || "";
  if (!base) throw new Error("Steel did not return a live view");
  const liveUrl = base + (base.includes("?") ? "&" : "?") + "interactive=true";
  const navigated = await steelNavigate(key, s.id, url).catch(() => false);
  if (!navigated) console.error(`Steel navigation via CDP failed for ${url}; viewer controls still work`);
  return { sessionId: s.id, liveUrl, url, provider: "steel" };
}

/** Navigates a Steel session by speaking Chrome DevTools Protocol over websocket. */
async function steelNavigate(key: string, id: string, url: string): Promise<boolean> {
  return new Promise((resolve) => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(`wss://connect.steel.dev?apiKey=${encodeURIComponent(key)}&sessionId=${encodeURIComponent(id)}`);
    } catch {
      resolve(false);
      return;
    }
    const t = setTimeout(() => finish(false), 8000);
    let stage = 0;
    let sessionId = "";
    const finish = (ok: boolean) => {
      clearTimeout(t);
      try { ws.close(); } catch { /* already closed */ }
      resolve(ok);
    };
    ws.addEventListener("open", () => ws.send(JSON.stringify({ id: 1, method: "Target.getTargets" })));
    ws.addEventListener("error", () => finish(false));
    ws.addEventListener("message", (ev) => {
      let m: { id?: number; error?: unknown; result?: { targetInfos?: { targetId: string; type: string }[]; sessionId?: string } };
      try { m = JSON.parse(String(ev.data)); } catch { return; }
      if (stage === 0 && m.id === 1) {
        const page = (m.result?.targetInfos ?? []).find((x) => x.type === "page");
        if (!page) return finish(false);
        stage = 1;
        ws.send(JSON.stringify({ id: 2, method: "Target.attachToTarget", params: { targetId: page.targetId, flatten: true } }));
      } else if (stage === 1 && m.id === 2) {
        sessionId = m.result?.sessionId ?? "";
        if (!sessionId) return finish(false);
        stage = 2;
        ws.send(JSON.stringify({ id: 3, method: "Page.navigate", params: { url }, sessionId }));
      } else if (stage === 2 && m.id === 3) {
        finish(!m.error);
      }
    });
  });
}

// ---------- Kernel ----------

async function createKernel(key: string, url: string): Promise<Live> {
  const res = await fetch("https://api.onkernel.com/browsers", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ headless: false, stealth: true, start_url: url }),
  });
  if (!res.ok) throw new Error(`Kernel could not start [${res.status}]`);
  const s = (await res.json()) as { session_id: string; browser_live_view_url?: string };
  if (!s.browser_live_view_url) throw new Error("Kernel did not return a live view");
  return { sessionId: s.session_id, liveUrl: s.browser_live_view_url, url, provider: "kernel" };
}

// ---------- Public server functions ----------

const openInput = z.object({
  query: z.string().min(1).max(2000),
  sessionId: z.string().max(200).optional(),
  provider: z.enum(["hyperbrowser", "steel", "kernel"]).optional(),
});

/** Opens a site in the user's chosen cloud browser, falling back to other configured providers. */
export const openSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => openInput.parse(d))
  .handler(async ({ data, context }) => {
    const userKeys: Partial<Record<ProviderId, string>> = {};
    const { data: rows, error } = await context.supabase.from("user_api_keys").select("provider, api_key");
    if (!error) for (const row of rows ?? []) if (PROVIDER_IDS.includes(row.provider as ProviderId)) userKeys[row.provider as ProviderId] = row.api_key;

    const candidates = resolveOrder(data.provider, userKeys);
    if (candidates.length === 0) throw new Error("No browser service is set up yet. Add an API key in Settings.");

    const url = toUrl(data.query);
    const errors: string[] = [];
    for (const { provider, key } of candidates) {
      try {
        const live = provider === "steel" ? await createSteel(key, url) : provider === "kernel" ? await createKernel(key, url) : await createHyper(key, url);
        return live;
      } catch (e) {
        errors.push(`${provider}: ${e instanceof Error ? e.message : "unknown error"}`);
      }
    }
    throw new Error(`Could not start a browser session. ${errors.join(" | ")}`);
  });

const closeInput = z.object({
  sessionId: z.string().max(200),
  provider: z.enum(["hyperbrowser", "steel", "kernel"]).optional(),
});

/** Stops the session on its provider so idle windows stop consuming credits. */
export const closeSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => closeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("user_api_keys")
      .select("api_key")
      .eq("provider", data.provider ?? "hyperbrowser")
      .maybeSingle();
    const key = (!error && row?.api_key) || providerFromEnv(data.provider ?? "hyperbrowser");
    if (!key) return { ok: false };
    const p = data.provider ?? "hyperbrowser";
    try {
      if (p === "steel") {
        await fetch(`https://api.steel.dev/v1/sessions/${encodeURIComponent(data.sessionId)}/release`, { method: "POST", headers: { "steel-api-key": key } });
      } else if (p === "kernel") {
        await fetch(`https://api.onkernel.com/browsers/${encodeURIComponent(data.sessionId)}`, { method: "DELETE", headers: { Authorization: `Bearer ${key}` } });
      } else {
        await fetch(`https://api.hyperbrowser.ai/api/session/${encodeURIComponent(data.sessionId)}/stop`, { method: "PUT", headers: { "x-api-key": key } });
      }
    } catch {
      return { ok: false };
    }
    return { ok: true };
  });
