import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — WebPortal Hub" },
      { name: "description", content: "Sign in or create your WebPortal Hub account with email, Google or Apple." },
      { property: "og:title", content: "Sign in — WebPortal Hub" },
      { property: "og:description", content: "Sign in or create your WebPortal Hub account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const email = z.string().trim().email("Enter a valid email").max(255);
const password = z.string().min(8, "Password must be at least 8 characters").max(72);
const username = z.string().trim().regex(/^[a-zA-Z0-9_]{3,24}$/, "Username: 3–24 letters, numbers or _");

const input = "w-full bg-site-import-background border border-site-import-card rounded-[.75rem] px-4 py-2.5 text-site-import-foreground text-[14px] outline-none focus:border-site-import-primary";
const social = "w-full flex items-center justify-center gap-2 border border-site-import-card bg-site-import-border rounded-[.75rem] py-2.5 text-site-import-foreground text-[14px] font-medium cursor-pointer hover:bg-site-import-card anim-press";

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(""); setMsg("");
    const f = new FormData(e.currentTarget);
    const parsed = z.object({ email, password, ...(mode === "up" ? { username } : {}) }).safeParse(Object.fromEntries(f));
    if (!parsed.success) { setErr(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    const d = parsed.data as { email: string; password: string; username?: string };
    setBusy(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email: d.email, password: d.password, options: { emailRedirectTo: window.location.origin, data: { username: d.username } } });
      if (error) setErr(error.message); else setMsg("Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: d.email, password: d.password });
      if (error) setErr("Wrong email or password."); else nav({ to: "/", replace: true });
    }
    setBusy(false);
  };

  const oauth = async (p: "google" | "apple") => {
    setErr("");
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) { setErr("Sign-in didn't finish. Please try again."); return; }
    if (r.redirected) return;
    nav({ to: "/", replace: true });
  };

  return (
    <main className="min-h-screen grid place-items-center bg-site-import-background px-6 py-12 brand-glow">
      <div className="w-full max-w-sm bg-site-import-border border border-site-import-card rounded-[1.5rem] p-8 anim-rise">
        <Link to="/" className="text-site-import-muted-foreground text-[12px] hover:text-site-import-foreground">← Back</Link>
        <h1 className="font-heading text-site-import-foreground text-[24px] font-semibold mt-4 mb-1">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-site-import-muted-foreground text-[13px] mb-6">{mode === "in" ? "Sign in to keep your workspace in sync." : "Pick a username and you're in."}</p>
        <div className="grid gap-2.5 mb-5">
          <button type="button" className={social} onClick={() => oauth("google")}>Continue with Google</button>
          <button type="button" className={social} onClick={() => oauth("apple")}>Continue with Apple</button>
        </div>
        <div className="text-center text-site-import-muted-foreground text-[11px] uppercase tracking-[0.2em] mb-5">or</div>
        <form onSubmit={submit} className="grid gap-3">
          {mode === "up" && <input name="username" placeholder="Username" autoComplete="username" className={input} maxLength={24} />}
          <input name="email" type="email" placeholder="Email" autoComplete="email" className={input} maxLength={255} />
          <input name="password" type="password" placeholder="Password" autoComplete={mode === "up" ? "new-password" : "current-password"} className={input} maxLength={72} />
          {err && <p className="text-destructive text-[12px] m-0">{err}</p>}
          {msg && <p className="text-site-import-foreground text-[12px] m-0">{msg}</p>}
          <button disabled={busy} className="brand-gradient text-site-import-foreground rounded-[.75rem] font-semibold text-[14px] py-2.5 cursor-pointer disabled:opacity-60 anim-press">{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
        </form>
        <button type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); setMsg(""); }} className="mt-5 w-full text-site-import-muted-foreground text-[13px] cursor-pointer hover:text-site-import-foreground">
          {mode === "in" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
