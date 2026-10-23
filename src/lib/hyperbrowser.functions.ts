import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://api.hyperbrowser.ai/api/session";

type Session = { id: string; status?: string; liveUrl?: string; computerActionEndpoint?: string };

async function hb(path: string, init: RequestInit = {}): Promise<Session> {
  const key = process.env["HYPERBROWSER_API_KEY"];
  if (!key) throw new Error("Hyperbrowser key is not set");
  const res = await fetch(API + path, {
    ...init,
    headers: { "x-api-key": key, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Hyperbrowser request failed [${res.status}]: ${body}`);
    throw new Error(`Hyperbrowser request failed [${res.status}]: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as Session;
}

async function action(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Browser action failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
}

export function toUrl(input: string): string {
  const q = input.trim();
  if (/^https?:\/\//i.test(q)) return q;
  if (/^[^\s]+\.[a-z]{2,}(\/.*)?$/i.test(q)) return "https://" + q;
  return "https://www.google.com/search?q=" + encodeURIComponent(q);
}

export const openSite = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ query: z.string().min(1).max(2000), sessionId: z.string().max(200).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    let session: Session | null = null;
    if (data.sessionId) {
      try {
        const s = await hb("/" + encodeURIComponent(data.sessionId));
        if (s.status === "active") session = s;
      } catch {
        session = null;
      }
    }
    if (!session) session = await hb("", { method: "POST", body: JSON.stringify({ useStealth: true, adblock: true }) });
    const endpoint = session.computerActionEndpoint;
    if (!endpoint) throw new Error("Hyperbrowser did not return a control link");
    const url = toUrl(data.query);
    await action(endpoint, { action: "press_keys", keys: ["Control_L", "l"] });
    await action(endpoint, { action: "type_text", text: url });
    await action(endpoint, { action: "press_keys", keys: ["Return"] });
    return { sessionId: session.id, liveUrl: session.liveUrl ?? "", url };
  });

export const closeSite = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ sessionId: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    await hb("/" + encodeURIComponent(data.sessionId) + "/stop", { method: "PUT" });
    return { ok: true };
  });
