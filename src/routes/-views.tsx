import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, Maximize, Minimize, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameRatings } from "@/lib/game-ratings";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePrefs, setPrefs, PROVIDERS, MAX_ICON_BYTES, MAX_IDLE_MINUTES, type Motion } from "@/lib/prefs";
import { providerStatus, providerKeyState, saveProviderKey, clearProviderKey } from "@/lib/hyperbrowser.functions";
import l1 from "@/assets/logo1.asset.json";
import l2 from "@/assets/logo2.asset.json";
import l3 from "@/assets/logo3.asset.json";
import l4 from "@/assets/logo4.asset.json";
import l5 from "@/assets/logo5.asset.json";
import l6 from "@/assets/logo6.asset.json";
import l7 from "@/assets/logo7.asset.json";

const LOGOS = [l7, l1, l2, l3, l4, l5, l6].map((l) => l.url);

export type View = "home" | "gaming" | "chat" | "settings" | "profile" | "browse";

export type Live = { sessionId: string; liveUrl: string; url: string; provider: string };

type Props = {
  view: View;
  setView: (v: View) => void;
  go: (q: string) => void;
  live: Live | null;
  loading: boolean;
  error: string;
};

import { GAMES, CATEGORIES } from "@/lib/games";

const icon = (u: string) => `https://www.google.com/s2/favicons?sz=64&domain=${u.split("/")[0]}`;

const card = "bg-site-import-border border border-site-import-border rounded-[1rem]";
const label = "font-heading text-site-import-muted-foreground text-[13px] font-medium tracking-[0.16em] uppercase mb-3";
const primaryBtn = "bg-site-import-primary text-site-import-foreground rounded-[.75rem] font-semibold text-[14px] px-5 py-2.5 cursor-pointer hover:opacity-90 transition-opacity";
const pill = "font-mono inline-flex items-center gap-2 bg-site-import-border border border-site-import-card rounded-full text-site-import-muted-foreground text-[10px] tracking-[0.22em] uppercase px-3 py-1 mb-5";
const inputCls = "w-full bg-site-import-background border border-site-import-card rounded-[.75rem] px-4 py-2.5 text-site-import-foreground text-[14px] outline-none focus:border-site-import-primary min-w-0";

function SignInNote() {
  const { user, username } = useAuth();
  if (user)
    return (
      <div className="flex items-center gap-3">
        <span className="text-site-import-foreground text-[13px]">@{username || "you"}</span>
        <button className={primaryBtn} onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    );
  return <Link to="/auth" className={primaryBtn + " inline-block no-underline"}>Sign in</Link>;
}

function Gaming({ go }: Props) {
  const [cat, setCat] = useState("All");
  const { ratings, rate } = useGameRatings();
  const list = cat === "All" ? GAMES : GAMES.filter((g) => g.category === cat);
  return (
    <div className="mx-auto max-w-5xl w-full py-14 px-6">
      <div className="text-center mb-8">
        <span className={pill}>Gaming</span>
        <h1 className="font-heading text-site-import-foreground font-semibold text-[36px] md:text-[48px] tracking-[-0.03em] leading-tight m-0">Ready to play?</h1>
        <p className="text-site-import-muted-foreground text-[0.875rem] leading-relaxed mt-3 mx-auto max-w-md">{GAMES.length} no-download games — pick one and it opens in your browser window. GeForce NOW needs a free NVIDIA account and may have a queue; paid tiers skip it.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`rounded-full px-3.5 py-1.5 text-[12px] cursor-pointer border ${cat === c ? "bg-site-import-primary text-site-import-foreground border-site-import-primary" : "bg-site-import-border text-site-import-muted-foreground border-site-import-card"}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {list.map((g) => (
          <div key={g.name} className={`${card} anim-card flex flex-col items-center gap-2 py-4 px-2`}>
            <span className="grid place-items-center h-12 w-12 rounded-[14px] bg-site-import-foreground">
              <img src={icon(g.url)} alt="" className="h-8 w-8 object-contain" loading="lazy" />
            </span>
            <span className="text-site-import-foreground text-[12px] font-medium w-full text-center line-clamp-2 min-h-[2.4em]">{g.name}</span>
            <span className="text-site-import-muted-foreground text-[10px] tracking-[0.1em] uppercase">{g.category}</span>
            <Button onClick={() => go(g.url)} size="sm">Play</Button>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" title={`Like ${g.name}`} aria-label={`Like ${g.name}`} aria-pressed={ratings[g.url] === "like"} onClick={() => rate(g.url, "like")} className={ratings[g.url] === "like" ? "text-site-import-primary bg-site-import-card" : "text-site-import-muted-foreground"}><ThumbsUp /></Button>
              <Button variant="ghost" size="icon" title={`Dislike ${g.name}`} aria-label={`Dislike ${g.name}`} aria-pressed={ratings[g.url] === "dislike"} onClick={() => rate(g.url, "dislike")} className={ratings[g.url] === "dislike" ? "text-site-import-primary bg-site-import-card" : "text-site-import-muted-foreground"}><ThumbsDown /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= Chat rooms =============

type ChatRoom = { id: string; name: string; created_by: string | null };
type ChatMsg = { id: string; room_id: string; user_id: string; username: string; content: string; created_at: string };

function Chat() {
  const { user, username, ready } = useAuth();
  if (!ready)
    return (
      <div className="grid place-items-center min-h-full px-6 py-14">
        <LoaderCircle className="browser-loading h-7 w-7 text-site-import-primary" />
      </div>
    );
  if (!user)
    return (
      <div className="grid place-items-center min-h-full px-6 py-14">
        <div className={`${card} rounded-[1.5rem] p-10 max-w-sm w-full text-center`}>
          <span className="grid place-items-center mx-auto h-12 w-12 rounded-[14px] bg-site-import-card text-site-import-primary mb-4">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
          </span>
          <h2 className="font-heading text-site-import-foreground text-[20px] font-semibold m-0">Sign in to chat</h2>
          <p className="text-site-import-muted-foreground text-[13px] leading-relaxed mt-2 mb-6">Chat rooms are for signed-in members. Sign in to join public rooms or create private ones.</p>
          <SignInNote />
        </div>
      </div>
    );
  return <ChatApp userId={user.id} username={username} />;
}

function ChatApp({ userId, username }: { userId: string; username: string }) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [active, setActive] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [err, setErr] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.from("chat_rooms").select("id,name,created_by").order("created_at").then(({ data }) => {
      if (cancelled) return;
      setRooms((data as ChatRoom[]) ?? []);
      if (data?.length && data[0]) setActive((a) => a || data[0]!.id);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("chat_messages").select("id,room_id,user_id,username,content,created_at").eq("room_id", active).order("created_at");
      if (!cancelled) setMessages((data as ChatMsg[]) ?? []);
    };
    void load();
    const poll = setInterval(load, 4000);
    return () => { cancelled = true; clearInterval(poll); };
  }, [active]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const activeName = rooms.find((r) => r.id === active)?.name ?? "";

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = draft.trim().slice(0, 1000);
    if (!content || !active) return;
    setDraft(""); setErr("");
    const { error } = await supabase.from("chat_messages").insert({ room_id: active, user_id: userId, username: username || "user", content });
    if (error) setErr(error.message);
  };

  const create = async () => {
    const name = newRoom.trim().slice(0, 40);
    if (!name) return;
    setErr("");
    const { data, error } = await supabase.from("chat_rooms").insert({ name, created_by: userId }).select("id,name").single();
    if (error || !data) { setErr(error?.message ?? "Could not create the room."); return; }
    setNewRoom("");
    setRooms((r) => [...r, data as ChatRoom]);
    setActive(data.id);
  };

  return (
    <div className="mx-auto max-w-3xl w-full py-10 px-6 anim-rise">
      <div className="text-center mb-6">
        <span className={pill}>Chat</span>
        <h1 className="font-heading text-site-import-foreground font-semibold text-[30px] tracking-[-0.02em] leading-tight m-0">Chat rooms</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {rooms.map((r) => (
          <button key={r.id} onClick={() => setActive(r.id)} aria-pressed={active === r.id} className={`rounded-full px-3.5 py-1.5 text-[12px] cursor-pointer border ${active === r.id ? "bg-site-import-primary text-site-import-foreground border-site-import-primary" : "bg-site-import-border text-site-import-muted-foreground border-site-import-card"}`}>#{r.name}</button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); void create(); }} className="flex gap-2 ml-1">
          <input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="New room name" maxLength={40} aria-label="New room name" className={inputCls + " !w-40 !py-1.5 text-[12px]"} />
          <button type="submit" className={primaryBtn + " !py-1.5 text-[12px]"}>Create</button>
        </form>
      </div>
      <div className={`${card} p-4 flex flex-col gap-3`}>
        <div ref={listRef} className="flex-1 min-h-[300px] max-h-[46vh] overflow-y-auto flex flex-col gap-2.5 pr-1">
          {messages.length === 0 ? (
            <p className="m-auto text-site-import-muted-foreground text-[13px]">No messages yet in #{activeName || "this room"} — say hello!</p>
          ) : (
            messages.map((m) => {
              const own = m.user_id === userId;
              return (
                <div key={m.id} className={`max-w-[80%] rounded-[.9rem] px-3.5 py-2 ${own ? "brand-gradient text-site-import-foreground self-end" : "bg-site-import-background text-site-import-foreground self-start border border-site-import-card"}`}>
                  <div className="text-[10px] tracking-[0.08em] uppercase opacity-70 mb-0.5">{own ? "You" : m.username}</div>
                  <p className="m-0 text-[13px] break-words whitespace-pre-wrap">{m.content}</p>
                </div>
              );
            })
          )}
        </div>
        {err && <p role="alert" className="text-destructive text-[12px] m-0">{err}</p>}
        <form onSubmit={send} className="flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message #${activeName || "…"}`} maxLength={1000} aria-label="Message" className={inputCls} />
          <button type="submit" className={primaryBtn} disabled={!draft.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}

// ============= Settings =============

const MOTIONS: [Motion, string][] = [["none", "None"], ["minimal", "Minimal"], ["intense", "Intense"]];

function Settings() {
  const p = usePrefs();
  const { user, username } = useAuth();
  const [iconErr, setIconErr] = useState("");
  const statusFn = useServerFn(providerStatus);
  const keyStateFn = useServerFn(providerKeyState);
  const saveFn = useServerFn(saveProviderKey);
  const clearFn = useServerFn(clearProviderKey);
  const [avail, setAvail] = useState<Record<string, boolean> | null>(null);
  const [own, setOwn] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [keyMsg, setKeyMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    statusFn().then((s) => { if (!cancelled) setAvail(s.available); }).catch(() => { if (!cancelled) setAvail({ hyperbrowser: false, steel: false, kernel: false }); });
    if (user) keyStateFn().then((s) => { if (!cancelled) { setOwn(s.own); setAvail(s.available); } }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, statusFn, keyStateFn]);

  const upload = (e: ChangeEvent<HTMLInputElement>) => {
    setIconErr("");
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpeg|gif|webp|x-icon|vnd\.microsoft\.icon)$/.test(f.type)) { setIconErr("Pick a PNG, JPG, GIF, WEBP or ICO image."); return; }
    if (f.size > MAX_ICON_BYTES) { setIconErr("Image must be under 200 KB."); return; }
    const r = new FileReader();
    r.onload = () => setPrefs({ tabIcon: String(r.result) });
    r.readAsDataURL(f);
  };
  const opt = (on: boolean) => `rounded-[.75rem] border-2 cursor-pointer anim-press ${on ? "border-site-import-primary" : "border-site-import-card"}`;

  const saveKey = async (id: string, name: string) => {
    const value = (draft[id] ?? "").trim();
    if (!user || value.length < 8) return;
    setKeyMsg("");
    try {
      await saveFn({ data: { provider: id as "hyperbrowser" | "steel" | "kernel", apiKey: value } });
      setOwn((o) => ({ ...o, [id]: true }));
      setDraft((d) => ({ ...d, [id]: "" }));
      setKeyMsg(`${name} key saved. New sessions will use it.`);
    } catch {
      setKeyMsg(`Could not save the ${name} key. Please try again.`);
    }
  };

  const removeKey = async (id: string, name: string) => {
    if (!user) return;
    setKeyMsg("");
    try {
      await clearFn({ data: { provider: id as "hyperbrowser" | "steel" | "kernel" } });
      setOwn((o) => ({ ...o, [id]: false }));
      setKeyMsg(`${name} key removed. The project key is used again.`);
    } catch {
      setKeyMsg(`Could not remove the ${name} key.`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl w-full py-14 px-6 anim-rise">
      <h1 className="font-heading text-site-import-foreground text-[30px] font-semibold mb-8">Settings</h1>
      <h2 className={label}>Account</h2>
      <div className={`${card} p-5 flex items-center gap-4 mb-8`}>
        <p className="text-site-import-muted-foreground text-[13px] flex-1 m-0">{user ? `Signed in as @${username || "you"}.` : "Sign in with email, Google or Apple."}</p>
        <SignInNote />
      </div>
      <h2 className={label}>Browsing service</h2>
      <div className={`${card} p-5 mb-8`}>
        <p className="text-site-import-muted-foreground text-[13px] m-0 mb-4">Pick which service opens sites and games. A service is gray until an API key is set up, and if one fails the next one with a key takes over automatically.</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {PROVIDERS.map((prov) => {
            const ok = Boolean(avail?.[prov.id]);
            const selected = p.provider === prov.id;
            return (
              <button
                key={prov.id}
                disabled={!ok}
                onClick={() => setPrefs({ provider: prov.id })}
                aria-pressed={selected}
                title={ok ? `Use ${prov.name}` : `${prov.name} has no API key yet`}
                className={`rounded-[.75rem] py-2.5 text-[13px] anim-press border border-site-import-card ${!ok ? "opacity-40 cursor-not-allowed text-site-import-muted-foreground bg-site-import-border" : selected ? "brand-gradient text-site-import-foreground cursor-pointer" : "text-site-import-muted-foreground hover:text-site-import-foreground bg-site-import-border cursor-pointer"}`}
              >
                {prov.name}
                <div className="text-[10px] tracking-[0.08em] uppercase opacity-70">{ok ? (own[prov.id] ? "Your key" : "Ready") : "No key"}</div>
              </button>
            );
          })}
        </div>
        {PROVIDERS.map((prov) => (
          <div key={prov.id} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-site-import-foreground text-[13px] font-medium">{prov.name} API key</span>
              <span className="text-site-import-muted-foreground text-[11px]">{own[prov.id] ? "Your key is saved" : avail?.[prov.id] ? "Using the project key" : "Not set up yet"}</span>
            </div>
            <div className="flex gap-2">
              <input
                type={show[prov.id] ? "text" : "password"}
                value={draft[prov.id] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [prov.id]: e.target.value }))}
                placeholder={own[prov.id] ? "Key saved — paste a new one to replace it" : `Paste your ${prov.name} key`}
                aria-label={`${prov.name} API key`}
                className={inputCls}
                disabled={!user}
                autoComplete="off"
              />
              <button type="button" onClick={() => setShow((s) => ({ ...s, [prov.id]: !s[prov.id] }))} className="border border-site-import-card rounded-[.75rem] px-3 text-[12px] text-site-import-muted-foreground cursor-pointer hover:text-site-import-foreground" aria-label={show[prov.id] ? `Hide ${prov.name} key` : `Show ${prov.name} key`}>{show[prov.id] ? "Hide" : "Show"}</button>
              <button type="button" onClick={() => void saveKey(prov.id, prov.name)} disabled={!user || (draft[prov.id] ?? "").trim().length < 8} className={primaryBtn + " !px-4 !py-2 text-[13px] disabled:opacity-40"}>Save</button>
              {own[prov.id] && <button type="button" onClick={() => void removeKey(prov.id, prov.name)} className="border border-site-import-card rounded-[.75rem] px-3 text-[12px] text-site-import-muted-foreground cursor-pointer hover:text-site-import-foreground" aria-label={`Remove ${prov.name} key`}>Remove</button>}
            </div>
            {!user && <p className="text-site-import-muted-foreground text-[11px] mt-1 mb-0">Sign in to save your own keys.</p>}
          </div>
        ))}
        {keyMsg && <p role="status" className="text-site-import-foreground text-[12px] mt-3 mb-0">{keyMsg}</p>}
      </div>
      <h2 className={label}>Browser tab</h2>
      <div className={`${card} p-5 mb-8`}>
        <label className="block text-site-import-foreground text-[13px] font-medium mb-2" htmlFor="tab-title">Tab name</label>
        <input id="tab-title" value={p.tabTitle} maxLength={60} onChange={(e) => setPrefs({ tabTitle: e.target.value })} placeholder="WebPortal Hub" className={inputCls} />
        <div className="text-site-import-foreground text-[13px] font-medium mt-5 mb-2">Tab logo</div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <button onClick={() => setPrefs({ tabIcon: "" })} aria-pressed={!p.tabIcon} className={opt(!p.tabIcon) + " h-12 w-12 text-[10px] text-site-import-muted-foreground"}>Default</button>
          {LOGOS.map((u) => (
            <button key={u} onClick={() => setPrefs({ tabIcon: u })} aria-pressed={p.tabIcon === u} className={opt(p.tabIcon === u) + " h-12 w-12 overflow-hidden p-0"}>
              <img src={u} alt="Tab logo option" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
          {p.tabIcon.startsWith("data:") && <span className={opt(true) + " h-12 w-12 overflow-hidden"}><img src={p.tabIcon} alt="Your logo" className="h-full w-full object-cover" /></span>}
          <label className={primaryBtn + " text-[13px]"}>Upload<input type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/x-icon" onChange={upload} className="hidden" /></label>
        </div>
        {iconErr && <p className="text-destructive text-[12px] mt-2 mb-0">{iconErr}</p>}
      </div>
      <h2 className={label}>Auto-close browser</h2>
      <div className={`${card} p-5 mb-8`}>
        <div className="flex justify-between text-site-import-foreground text-[13px] mb-3"><span>Close after no activity for</span><b>{p.idleMinutes} min</b></div>
        <input type="range" min={1} max={MAX_IDLE_MINUTES} value={p.idleMinutes} onChange={(e) => setPrefs({ idleMinutes: Number(e.target.value) })} className="w-full accent-site-import-primary" aria-label="Minutes before auto-close" />
        <p className="text-site-import-muted-foreground text-[11px] mt-2 mb-0">Saves your browsing credits. Maximum {MAX_IDLE_MINUTES} minutes.</p>
      </div>
      <h2 className={label}>Animations</h2>
      <div className={`${card} p-2 grid grid-cols-3 gap-2`}>
        {MOTIONS.map(([m, n]) => (
          <button key={m} onClick={() => setPrefs({ motion: m })} aria-pressed={p.motion === m} className={`rounded-[.75rem] py-2.5 text-[13px] cursor-pointer anim-press ${p.motion === m ? "brand-gradient text-site-import-foreground" : "text-site-import-muted-foreground hover:text-site-import-foreground"}`}>{n}</button>
        ))}
      </div>
      <p className="text-site-import-muted-foreground text-[11px] mt-2">Minimal is best for slower devices. "Intense" drops to Minimal automatically on very low-memory devices.</p>
    </div>
  );
}

function Profile() {
  const { user, username } = useAuth();
  const stats = [["6", "Pins"], ["0", "Bookmarks"], ["0", "History"], ["0", "Chats"]];
  return (
    <div className="mx-auto max-w-md w-full py-14 px-6">
      <div className={`${card} rounded-[1.5rem] p-8 text-center mb-4`}>
        <span className="grid place-items-center mx-auto h-16 w-16 rounded-[1rem] bg-site-import-primary text-site-import-foreground text-[22px] font-semibold mb-4 brand-gradient">{(username || "G").charAt(0).toUpperCase()}</span>
        <h2 className="font-heading text-site-import-foreground text-[20px] font-semibold m-0">{user ? "@" + (username || "you") : "Guest"}</h2>
        <p className="text-site-import-muted-foreground text-[13px] leading-relaxed mt-2 mb-6">{user ? user.email : "You're browsing as a guest. Sign in to open sites and sync your workspace."}</p>
        <SignInNote />
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {stats.map(([n, l]) => (
          <div key={l} className={`${card} py-4 text-center`}>
            <div className="text-site-import-foreground text-[18px] font-semibold">{n}</div>
            <div className="text-site-import-muted-foreground text-[10px] tracking-[0.12em] uppercase">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Browse({ live, loading, error, setView }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const [loadedUrl, setLoadedUrl] = useState("");
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", update);
    return () => { document.removeEventListener("fullscreenchange", update); };
  }, []);
  const toggleFullscreen = async () => {
    setFullscreenError("");
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (frame.current) await frame.current.requestFullscreen();
    } catch { setFullscreenError("Fullscreen isn't available in this window."); }
  };
  if (error)
    return (
      <div className="grid place-items-center min-h-full px-6 text-center">
        <div className={`${card} p-8 max-w-md`}>
          <h2 className="text-site-import-foreground text-[18px] font-semibold m-0 mb-2">Couldn't open that site</h2>
          <p className="text-site-import-muted-foreground text-[13px] break-words mb-5">{error}</p>
          <button className={primaryBtn} onClick={() => setView("home")}>Back home</button>
        </div>
      </div>
    );
  if (!live || loading && !live)
    return (
      <div role="status" className="grid place-content-center justify-items-center gap-3 min-h-full text-site-import-muted-foreground text-[14px]"><LoaderCircle className="browser-loading h-7 w-7 text-site-import-primary" />Starting your private browser…</div>
    );
  return (
    <div ref={frame} className="relative flex h-full min-h-0 w-full flex-col border-4 border-browser-frame bg-browser-frame">
      <div className="flex shrink-0 items-center gap-3 bg-site-import-background px-3 py-1 text-site-import-foreground">
        <span className="text-site-import-muted-foreground text-[10px] tracking-[0.14em] uppercase shrink-0">{live.provider}</span>
        <span className="min-w-0 flex-1 truncate text-xs">{live.url}</span>
        {fullscreenError && <span role="alert" className="text-xs">{fullscreenError}</span>}
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}>{fullscreen ? <Minimize /> : <Maximize />}</Button>
      </div>
      <div className="relative min-h-0 flex-1">
        <iframe title="Browser" src={live.liveUrl} onLoad={() => setLoadedUrl(live.liveUrl)} className="absolute inset-0 h-full w-full border-0" allow="clipboard-read; clipboard-write; autoplay; fullscreen; gamepad; encrypted-media" allowFullScreen />
        {(loading || loadedUrl !== live.liveUrl) && <div role="status" className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-site-import-background text-site-import-foreground text-xs rounded-md px-3 py-2"><LoaderCircle className="browser-loading h-4 w-4" />Loading…</div>}
      </div>
    </div>
  );
}

export function ExtraView(props: Props) {
  switch (props.view) {
    case "gaming": return <Gaming {...props} />;
    case "chat": return <Chat />;
    case "settings": return <Settings />;
    case "profile": return <Profile />;
    case "browse": return <Browse {...props} />;
    default: return null;
  }
}
