import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { closeSite, openSite } from "@/lib/hyperbrowser.functions";
import { useIdle, usePrefs, usePrefsEffects } from "@/lib/prefs";
import { ExtraView, type Live, type View } from "@/routes/-views";
import { createFileRoute } from "@tanstack/react-router";
import { ContactInbox, ContactModal } from "@/components/Contact";
import MusicPill from "@/components/MusicPill";
import MusicHub from "@/components/MusicHub";
import SlotBadges from "@/components/SlotBadges";
import { SettingsModal } from "@/components/SettingsModal";
import capturedCSS from "../styles/site.css?inline";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MathSpot — The place where all math lives" },
      { name: "description", content: "The place where all math lives is mathspot" },
      { property: "og:title", content: "MathSpot — The place where all math lives" },
      { property: "og:description", content: "The place where all math lives is mathspot" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [pillOpen, setPillOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  const [view, setView] = useState<View>("home");
  const [live, setLive] = useState<Live | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const open = useServerFn(openSite);
  const close = useServerFn(closeSite);
  const prefs = usePrefs();
  usePrefsEffects(prefs);
  const [notice, setNotice] = useState("");
  const closing = useRef(false);
  const stopIdle = useCallback(async () => {
    if (!live || closing.current || loading) return;
    closing.current = true;
    try {
      await close({ data: { sessionId: live.sessionId, provider: live.provider as "hyperbrowser" | "steel" | "kernel" } });
      setLive(null);
      setView("home");
      setNotice("Browser closed after inactivity.");
    } catch {
      setNotice("Could not close the browser. It will retry after the next idle period.");
    } finally { closing.current = false; }
  }, [close, live, loading]);
  useIdle(prefs.idleMinutes, Boolean(live), stopIdle);

  const start = async (e?: FormEvent, override?: string) => {
    e?.preventDefault();
    const target = (override ?? address).trim();
    if (!target || loading) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await open({ data: { query: target, provider: prefs.provider } });
      setLive(res);
      setView("browse");
    } catch (err: any) {
      setError(err?.message || "Failed to start cloud browser.");
    } finally {
      setLoading(false);
    }
  };

  const end = async () => {
    if (!live || loading) return;
    setLoading(true);
    try {
      await close({ data: { sessionId: live.sessionId, provider: live.provider as "hyperbrowser" | "steel" | "kernel" } });
      setLive(null);
      setView("home");
    } catch (err: any) {
      setError(err?.message || "Failed to close cloud browser.");
    } finally {
      setLoading(false);
    }
  };

  const NavBtn = ({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) => (
    <button onClick={onClick} aria-pressed={active} title={label} className={(active ? "bg-site-import-border text-site-import-foreground " : "text-site-import-muted-foreground ") + "flex items-center gap-3 h-11 rounded-xl px-3 w-full text-[15px] cursor-pointer transition-colors hover:bg-site-import-border hover:text-site-import-foreground"}>
      <span className="shrink-0 h-[18px] w-[18px] grid place-items-center">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
  const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24", className: "h-[18px] w-[18px]" };
  const I = {
    home: <svg {...ic}><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>,
    chat: <svg {...ic}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    games: <svg {...ic}><rect x="2" y="7" width="20" height="10" rx="5" /><line x1="7" y1="12" x2="9" y2="12" /><line x1="15" y1="12" x2="15.01" y2="12" /></svg>,
    music: <svg {...ic}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
    user: <svg {...ic}><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>,
    gear: <svg {...ic}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    search: <svg {...ic}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  };
  const openMusic = () => { setMusicOpen(true); setPillOpen(false); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: capturedCSS }} />
      <div className="bg-[#000]! text-site-import-foreground h-screen flex overflow-hidden" data-site-import-document-lang="en">
        <aside className={(collapsed ? "w-[68px] " : "w-[240px] ") + "shrink-0 flex flex-col gap-1 p-2 border-r border-site-import-border bg-[#050507]"}>
          <NavBtn label="Home" active={view === "home"} onClick={() => setView("home")} icon={I.home} />
          <NavBtn label="Chat" active={view === "chat"} onClick={() => setView("chat")} icon={I.chat} />
          <NavBtn label="Games" active={view === "gaming"} onClick={() => setView("gaming")} icon={I.games} />
          <NavBtn label="Music" active={musicOpen} onClick={openMusic} icon={I.music} />
          <div className="flex-1" />
          <NavBtn label="Account" active={view === "profile"} onClick={() => setView("profile")} icon={I.user} />
          <NavBtn label="Settings" active={settingsOpen} onClick={() => setSettingsOpen(true)} icon={I.gear} />
          <NavBtn label={collapsed ? "Expand" : "Collapse"} active={false} onClick={() => setCollapsed((c) => !c)} icon={<span className="text-lg leading-none">{collapsed ? "›" : "‹"}</span>} />
        </aside>
        {musicOpen && <MusicHub onMinimize={() => { setMusicOpen(false); setPillOpen(true); }} />}
        {pillOpen && !musicOpen && <MusicPill onExpand={openMusic} onClose={() => setPillOpen(false)} />}
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onMore={() => { setSettingsOpen(false); setView("settings"); }} />
        {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
        <main className="relative flex flex-1 flex-col min-w-0 overflow-y-auto">
          {view === "profile" && <ContactInbox />}
          {view !== "home" && <ExtraView view={view} setView={setView} live={live} loading={loading} error={error} go={(u) => { setAddress(u); void start(undefined, u); }} />}
          {view === "home" && (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="absolute top-4 right-5"><SlotBadges /></div>
              <h1 className="m-0 mb-12 text-6xl md:text-8xl font-black tracking-tight text-white [text-shadow:0_0_30px_rgba(255,255,255,0.45)]">mathspot</h1>
              <form onSubmit={start} className="w-full max-w-[850px] flex items-center gap-3 rounded-full border border-site-import-border bg-[#0b0b10] px-6 h-[70px] shadow-[0_0_24px_rgba(255,255,255,0.18)]">
                <span className="text-site-import-muted-foreground">{I.search}</span>
                <input ref={searchRef} type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={loading ? "Connecting…" : "Search games, songs, or chats..."} className="flex-1 bg-transparent border-none text-lg text-site-import-foreground outline-none" />
                <kbd className="text-xs text-site-import-muted-foreground border border-site-import-border rounded px-1.5">/</kbd>
              </form>
              {error && <p role="alert" className="text-destructive text-sm mt-3">{error}</p>}
              <div className="flex gap-10 mt-12">
                {([["Games", I.games, () => setView("gaming")], ["Music", I.music, openMusic], ["Chat", I.chat, () => setView("chat")]] as const).map(([l, icon, fn]) => (
                  <button key={l} onClick={fn} className="flex flex-col items-center gap-2 text-site-import-muted-foreground hover:text-site-import-foreground cursor-pointer">
                    <span className="grid place-items-center h-[74px] w-[74px] rounded-full border border-site-import-border bg-[#0b0b10]">{icon}</span>
                    <span className="text-sm">{l}</span>
                  </button>
                ))}
              </div>
              <div className="absolute bottom-4 right-5 flex gap-2">
                <span className="rounded-lg border border-site-import-border px-3 py-1.5 text-sm text-site-import-muted-foreground">ESC · Panic</span>
                <button onClick={() => setContactOpen(true)} className="rounded-lg border border-site-import-border px-3 py-1.5 text-sm text-site-import-muted-foreground hover:text-site-import-foreground cursor-pointer">Contact</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}