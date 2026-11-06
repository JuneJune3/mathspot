import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============= Community game submissions =============
// Members submit a game (a link or an uploaded file). Nothing is public until
// an admin approves it. Guests can still see everything already approved.

const CATEGORIES = [
  "Action",
  "Puzzle",
  "Shooter",
  "Sports",
  "Multiplayer",
  "Casual",
  "Racing",
  "Strategy",
  "Arcade",
  "Cloud & platforms",
];

async function isAdmin(context: { supabase: { from: (t: string) => any }; userId: string }) {
  const { data } = await context.supabase.from("user_roles").select("id").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  return Boolean(data);
}

const submitInput = z.object({
  title: z.string().trim().min(2).max(80),
  category: z.string().trim().max(40).default("Casual"),
  description: z.string().trim().max(600).default(""),
  kind: z.enum(["url", "file"]),
  gameUrl: z.string().trim().max(2000).optional(),
  filePath: z.string().trim().max(400).optional(),
  fileName: z.string().trim().max(200).optional(),
});

/** A member sends a game to the admin queue. Links and uploaded files both work. */
export const submitGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => submitInput.parse(d))
  .handler(async ({ data, context }) => {
    if (data.kind === "url" && !data.gameUrl) throw new Error("Add a playable link.");
    if (data.kind === "file" && !data.filePath) throw new Error("Upload the game file first.");
    const category = CATEGORIES.includes(data.category) ? data.category : "Casual";
    const { error } = await context.supabase.from("game_submissions").insert({
      title: data.title,
      category,
      description: data.description,
      kind: data.kind,
      game_url: data.kind === "url" ? (data.gameUrl ?? null) : null,
      file_path: data.kind === "file" ? (data.filePath ?? null) : null,
      file_name: data.kind === "file" ? (data.fileName ?? "game file") : null,
      status: "pending",
      submitted_by: context.userId,
    });
    if (error) throw new Error("Could not send your game. Please try again.");
    return { ok: true };
  });

/** Everything this member has sent, in any state. */
export const mySubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("game_submissions")
      .select("id,title,category,description,kind,game_url,file_name,status,review_note,created_at,reviewed_at")
      .eq("submitted_by", context.userId)
      .order("created_at", { ascending: false });
    return { rows: data ?? [] };
  });

/** The admin queue: every submission still waiting. */
export const pendingSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context))) throw new Error("Admins only.");
    const { data } = await context.supabase
      .from("game_submissions")
      .select("id,title,category,description,kind,game_url,file_path,file_name,status,submitted_by,created_at")
      .eq("status", "pending")
      .order("created_at");
    return { rows: data ?? [] };
  });

const reviewInput = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approved", "declined"]),
  note: z.string().trim().max(400).default(""),
});

/** An admin approves or declines one submission. Only admins reach this. */
export const reviewSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => reviewInput.parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context))) throw new Error("Admins only.");
    const { error } = await context.supabase
      .from("game_submissions")
      .update({
        status: data.decision,
        review_note: data.note,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("status", "pending");
    if (error) throw new Error("Could not record that decision.");
    return { ok: true };
  });

/** Approved community games, visible to everyone including guests. */
export const approvedGames = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("game_submissions")
      .select("title,category,game_url,file_path")
      .eq("status", "approved")
      .order("title");
    return { rows: data ?? [] };
  });

/** True when the signed-in account can see the review queue. */
export const amAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => ({ admin: await isAdmin(context) }));

/** A signed link to an uploaded game file, for admins reviewing it. */
export const gameFileLink = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ path: z.string().trim().max(400) }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context))) throw new Error("Admins only.");
    const { data: signed } = await context.supabase.storage.from("game-files").createSignedUrl(data.path, 600);
    if (!signed?.signedUrl) throw new Error("That file is not available.");
    return { url: signed.signedUrl };
  });
