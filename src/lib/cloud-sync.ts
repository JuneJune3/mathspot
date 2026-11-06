import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Device settings that follow a signed-in member to any computer. */
export const SYNC_KEYS = [
  "wph-prefs",
  "wph-game-ratings",
  "low_perf",
  "mathspot_cloak_preset",
  "mathspot_cloak_title",
  "mathspot_cloak_icon",
  "mathspot_panic_url",
  "mathspot_panic_key",
  "mathspot_use_cloud_kernel",
] as const;

export type Snapshot = Record<string, string>;

export function snapshot(store: Pick<Storage, "getItem">): Snapshot {
  const out: Snapshot = {};
  for (const k of SYNC_KEYS) {
    const v = store.getItem(k);
    if (v !== null) out[k] = v;
  }
  return out;
}

/** Keeps only known keys with string values from saved cloud data. */
export function cleanRemote(data: unknown): Snapshot {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const out: Snapshot = {};
  for (const k of SYNC_KEYS) {
    const v = (data as Record<string, unknown>)[k];
    if (typeof v === "string" && v.length <= 300_000) out[k] = v;
  }
  return out;
}

const RELOADED = "mathspot_sync_applied";

export function useCloudSync() {
  useEffect(() => {
    let userId: string | null = null;
    let last = "";
    let timer: ReturnType<typeof setInterval> | undefined;

    const push = async () => {
      if (!userId) return;
      const snap = snapshot(localStorage);
      const json = JSON.stringify(snap);
      if (json === last) return;
      last = json;
      await supabase.from("user_settings").upsert({ user_id: userId, data: snap, updated_at: new Date().toISOString() });
    };

    const start = async (id: string) => {
      if (userId === id) return;
      userId = id;
      const { data } = await supabase.from("user_settings").select("data").eq("user_id", id).maybeSingle();
      const remote = cleanRemote(data?.data);
      if (data && Object.keys(remote).length) {
        const local = JSON.stringify(snapshot(localStorage));
        for (const [k, v] of Object.entries(remote)) localStorage.setItem(k, v);
        last = JSON.stringify(snapshot(localStorage));
        // Reload once so every screen picks up the saved settings.
        if (last !== local && sessionStorage.getItem(RELOADED) !== id) {
          sessionStorage.setItem(RELOADED, id);
          window.location.reload();
          return;
        }
      } else {
        await push();
      }
      clearInterval(timer);
      timer = setInterval(() => { void push(); }, 4000);
    };

    const stop = () => { userId = null; last = ""; clearInterval(timer); sessionStorage.removeItem(RELOADED); };

    supabase.auth.getUser().then(({ data }) => { if (data.user) void start(data.user.id); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_OUT") stop();
      else if (event === "SIGNED_IN" && s?.user) void start(s.user.id);
    });
    const flush = () => { if (document.visibilityState === "hidden") void push(); };
    document.addEventListener("visibilitychange", flush);
    return () => { sub.subscription.unsubscribe(); clearInterval(timer); document.removeEventListener("visibilitychange", flush); };
  }, []);
}
