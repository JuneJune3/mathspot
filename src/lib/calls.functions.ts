import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============= Call rooms =============
// A member opens a room and gets a short code; anyone with the code joins.
// Rooms with no heartbeat for a few minutes are swept away automatically.

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ROOM_TTL_MS = 5 * 60 * 1000;

function makeCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** Opens a room and returns its join code. */
export const callCreate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ name: z.string().trim().max(40).default("Call room") }).parse(d))
  .handler(async ({ data, context }) => {
    const code = makeCode();
    const { data: room, error } = await context.supabase
      .from("call_rooms")
      .insert({ code, name: data.name || "Call room", host_id: context.userId })
      .select("id,code,name")
      .single();
    if (error || !room) throw new Error("Could not open the room.");
    return { id: room.id, code: room.code, name: room.name };
  });

/** Live rooms: everyone who checked in within the last few minutes. */
export const callList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cutoff = new Date(Date.now() - ROOM_TTL_MS).toISOString();
    await supabaseAdmin.from("call_rooms").delete().lt("last_seen_at", cutoff);
    const { data } = await supabaseAdmin
      .from("call_rooms")
      .select("id,code,name,host_id,created_at")
      .order("created_at");
    return { rows: data ?? [] };
  });

const joinInput = z.object({ code: z.string().trim().max(10) });

/** Joins by code, or refreshes the caller's own check-in on the room. */
export const callJoin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => joinInput.parse(d))
  .handler(async ({ data, context }) => {
    const code = data.code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (code.length !== 6) throw new Error("That code is not complete.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: room } = await supabaseAdmin
      .from("call_rooms")
      .select("id,code,name,host_id")
      .eq("code", code)
      .maybeSingle();
    if (!room) throw new Error("No room with that code is open right now.");
    await supabaseAdmin.from("call_rooms").update({ last_seen_at: new Date().toISOString() }).eq("id", room.id);
    return { id: room.id, code: room.code, name: room.name, hostId: room.host_id };
  });

/** Keeps the room alive while the caller is still in it. */
export const callKeepAlive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("call_rooms").update({ last_seen_at: new Date().toISOString() }).eq("id", data.id);
    return { ok: true };
  });

/** Closes a room. Only the host who opened it (or an admin) can. */
export const callClose = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("call_rooms").delete().eq("id", data.id).eq("host_id", context.userId);
    if (error) throw new Error("Only the person who opened the room can close it.");
    return { ok: true };
  });
