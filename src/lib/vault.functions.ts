import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============= Password vault =============
// Members keep site logins here. Row-level security means a member can only
// ever read their own rows; nobody else's queries return anything.

const itemInput = z.object({
  siteName: z.string().trim().min(1).max(80),
  siteUrl: z.string().trim().max(400).default(""),
  username: z.string().trim().max(200).default(""),
  password: z.string().min(1).max(400),
  notes: z.string().trim().max(1000).default(""),
});

/** Adds one login to the caller's vault. */
export const vaultAdd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => itemInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("vault_items").insert({
      user_id: context.userId,
      site_name: data.siteName,
      site_url: data.siteUrl,
      username: data.username,
      password: data.password,
      notes: data.notes,
    });
    if (error) throw new Error("Could not save that login.");
    return { ok: true };
  });

/** Every login the caller owns. */
export const vaultList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("vault_items")
      .select("id,site_name,site_url,username,notes,created_at")
      .eq("user_id", context.userId)
      .order("site_name");
    return { rows: data ?? [] };
  });

/** The stored password for one of the caller's own entries. */
export const vaultReveal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("vault_items")
      .select("password")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!row) throw new Error("That entry is not in your vault.");
    return { password: row.password };
  });

/** Removes one of the caller's own entries. */
export const vaultRemove = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("vault_items")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not delete that entry.");
    return { ok: true };
  });

/** A strong random password, generated in the browser. */
export function makePassword(length = 20): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
