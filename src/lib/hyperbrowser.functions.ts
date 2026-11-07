import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============= Multi-provider cloud browser router =============
// Providers: Hyperbrowser, Steel, Kernel. The caller's chosen provider is
// tried first; any other provider with a key acts as a fallback. Keys come
// from the signed-in user's saved key (user_api_keys) or the project secrets.
// Browsing is open to guests: keys are read server-side only and never leave
// this file. Live sessions are counted in public.browser_sessions so the UI
// can show how many slots are free and refuse to start one when full.

type ProviderId = "hyperbrowser" | "steel" | "kernel";
const PROVIDER_IDS: ProviderId[] = ["hyperbrowser", "steel", "kernel"];

const ENV_KEYS: Record<ProviderId, string> = {
  hyperbrowser: "HYPERBROWSER_API_KEY",
  steel: "STEEL_API_KEY",
  kernel: "KERNEL_API_KEY",
};

/** How many live sessions each service may hold at once. */
export const SLOT_CAPS: Record<ProviderId, number> = { hyperbrowser: 1, steel: 3, kernel: 3 };
/** Guests get a smaller share of each service than signed-in members. */
export const GUEST_CAPS: Record<ProviderId, number> = { hyperbrowser: 1, steel: 1, kernel: 1 };

/** Sessions older than this are considered dead and free their slot. */
const SESSION_TTL_MS = 30 * 60 * 1000;

export type Live = { sessionId: string; liveUrl: string; url: string; provider: ProviderId };
export type Slots = Record<ProviderId, { cap: number; used: number; free: number; guests: number }>;

function providerFromEnv(p: ProviderId): string | undefined {
  const v = process.env[ENV_KEYS[p]];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

/** Who is calling, if anyone. Guests resolve to null instead of throwing. */
async function callerId(): Promise<string | null> {
  try {
    const req = getRequest();
    const auth = req?.headers?.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    if (token.split(".").length !== 3) return null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.getClaims(token);
    if (error || !data?.claims) return null;
    return typeof data.claims.sub === "string" ? data.claims.sub : null;
  } catch {
    return null;
  }
}

/** Drops dead sessions and counts what is currently occupying each service. */
async function readSlots(): Promise<Slots> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cutoff = new Date(Date.now() - SESSION_TTL_MS).toISOString();
  await supabaseAdmin.from("browser_sessions").delete().lt("last_seen_at", cutoff);

  const slots = {} as Slots;
  for (const p of PROVIDER_IDS) slots[p] = { cap: SLOT_CAPS[p], used: 0, free: SLOT_CAPS[p], guests: 0 };

  const { data } = await supabaseAdmin.from("browser_sessions").select("provider, user_id");
  for (const row of data ?? []) {
    const p = row.provider as ProviderId;
    if (!slots[p]) continue;
    slots[p].used += 1;
    if (!row.user_id) slots[p].guests += 1;
  }
  for (const p of PROVIDER_IDS) slots[p].free = Math.max(0, slots[p].cap - slots[p].used);
  return slots;
}

/** Which providers have a key, and how many of their slots are free. No secrets returned. */
export const providerStatus = createServerFn({ method: "GET" }).handler(async () => {
  const available: Record<ProviderId, boolean> = { hyperbrowser: false, steel: false, kernel: false };
  for (const p of PROVIDER_IDS) available[p] = Boolean(providerFromEnv(p));
  const slots = await readSlots();
  return { available, slots };
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

function resolveOrder(
  requested: ProviderId | undefined,
  userKeys: Partial<Record<ProviderId, string>>,
  slots: Slots,
  isGuest: boolean,
): { provider: ProviderId; key: string }[] {
  const usable = PROVIDER_IDS.filter((p) => {
    if (!(userKeys[p] || providerFromEnv(p))) return false;
    if (slots[p].free <= 0) return false;
    if (isGuest && slots[p].guests >= GUEST_CAPS[p]) return false;
    return true;
  });
  const order =
    requested && usable.includes(requested) ? [requested, ...usable.filter((p) => p !== requested)] : usable;
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
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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
      ws = new WebSocket(
        `wss://connect.steel.dev?apiKey=${encodeURIComponent(key)}&sessionId=${encodeURIComponent(id)}`,
      );
    } catch {
      resolve(false);
      return;
    }
    const t = setTimeout(() => finish(false), 8000);
    let stage = 0;
    let sessionId = "";
    const finish = (ok: boolean) => {
      clearTimeout(t);
      try {
        ws.close();
      } catch {
        /* already closed */
      }
      resolve(ok);
    };
    ws.addEventListener("open", () => ws.send(JSON.stringify({ id: 1, method: "Target.getTargets" })));
    ws.addEventListener("error", () => finish(false));
    ws.addEventListener("message", (ev) => {
      let m: {
        id?: number;
        error?: unknown;
        result?: { targetInfos?: { targetId: string; type: string }[]; sessionId?: string };
      };
      try {
        m = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (stage === 0 && m.id === 1) {
        const page = (m.result?.targetInfos ?? []).find((x) => x.type === "page");
        if (!page) return finish(false);
        stage = 1;
        ws.send(
          JSON.stringify({ id: 2, method: "Target.attachToTarget", params: { targetId: page.targetId, flatten: true } }),
        );
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

/**
 * Opens a site in a cloud browser. Guests may call this: the provider keys are
 * read from server-side config only, and every session takes a counted slot so
 * the shared services cannot be overrun.
 */
export const openSite = createServerFn({ method: "POST" })
  .inputValidator((d) => openInput.parse(d))
  .handler(async ({ data }) => {
    const userId = await callerId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const userKeys: Partial<Record<ProviderId, string>> = {};
    if (userId) {
      const { data: rows } = await supabaseAdmin.from("user_api_keys").select("provider, api_key").eq("user_id", userId);
      for (const row of rows ?? []) {
        if (PROVIDER_IDS.includes(row.provider as ProviderId)) userKeys[row.provider as ProviderId] = row.api_key;
      }
    }

    const slots = await readSlots();
    const candidates = resolveOrder(data.provider, userKeys, slots, !userId);
    if (candidates.length === 0) {
      const anyKey = PROVIDER_IDS.some((p) => userKeys[p] || providerFromEnv(p));
      throw new Error(
        anyKey
          ? "Every browser slot is busy right now. Close a tab or try again in a moment."
          : "No browser service is set up yet. Add an API key in Settings.",
      );
    }

    const url = toUrl(data.query);
    const errors: string[] = [];
    for (const { provider, key } of candidates) {
      try {
        const live =
          provider === "steel"
            ? await createSteel(key, url)
            : provider === "kernel"
              ? await createKernel(key, url)
              : await createHyper(key, url);
        await supabaseAdmin
          .from("browser_sessions")
          .upsert(
            {
              provider,
              session_id: live.sessionId,
              user_id: userId,
              url: live.url,
              last_seen_at: new Date().toISOString(),
            },
            { onConflict: "provider,session_id" },
          );
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
  .inputValidator((d) => closeInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const p: ProviderId = data.provider ?? "hyperbrowser";
    const { data: row } = await supabaseAdmin
      .from("user_api_keys")
      .select("api_key")
      .eq("provider", p)
      .maybeSingle();
    const key = row?.api_key || providerFromEnv(p);
    if (!key) return { ok: false };
    try {
      if (p === "steel") {
        await fetch(`https://api.steel.dev/v1/sessions/${encodeURIComponent(data.sessionId)}/release`, {
          method: "POST",
          headers: { "steel-api-key": key },
        });
      } else if (p === "kernel") {
        await fetch(`https://api.onkernel.com/browsers/${encodeURIComponent(data.sessionId)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${key}` },
        });
      } else {
        await fetch(`https://api.hyperbrowser.ai/api/session/${encodeURIComponent(data.sessionId)}/stop`, {
          method: "PUT",
          headers: { "x-api-key": key },
        });
      }
    } catch {
      return { ok: false };
    }
    await supabaseAdmin
      .from("browser_sessions")
      .delete()
      .eq("provider", p)
      .eq("session_id", data.sessionId);
    return { ok: true };
  });

/** Live slot counts for every service, safe to show to guests. */
export const slotStatus = createServerFn({ method: "GET" }).handler(async () => {
  const slots = await readSlots();
  const available: Record<ProviderId, boolean> = { hyperbrowser: false, steel: false, kernel: false };
  for (const p of PROVIDER_IDS) available[p] = Boolean(providerFromEnv(p));
  return { slots, available };
});
