import { useCallback, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { closeSite, openSite } from "@/lib/hyperbrowser.functions";
import { useIdle, usePrefs, usePrefsEffects } from "@/lib/prefs";
import { ExtraView, type Live, type View } from "@/routes/-views";
import { createFileRoute } from "@tanstack/react-router";
import LinkGenerator from "@/components/LinkGenerator";
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
  useIdle(stopIdle, live ? prefs.idleTimeoutMs : null);

  const start = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!address.trim() || loading) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await open({ data: { url: address.trim(), provider: prefs.cloudProvider } });
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: capturedCSS }} />
      <div className="bg-site-import-background! text-site-import-foreground selection:bg-none! selection:[background-position:0%_0%]! selection:[background-size:auto_auto]! selection:[background-repeat:repeat]! selection:[background-origin:padding-box]! selection:[background-clip:border-box]! selection:[background-attachment:scroll]! selection:bg-[#ffffff33]!" data-site-import-document-lang="en">
        <div className="h-full" id="root">
          <div className="bg-site-import-background flex h-full overflow-hidden w-full">
            <aside className="bg-[hsl(240_14%_3%)] items-center border-site-import-border! border-r! flex flex-col shrink-0 gap-2 w-14 bg-site-import-background py-3 px-0 md:w-[76px] md:py-4 md:px-0">
              <button onClick={() => setView("home")} aria-pressed={view === "home"} className={(view === "home" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 hover:bg-site-import-border hover:text-site-import-foreground"} title="Home">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </button>
              <button onClick={() => setView("gaming")} aria-pressed={view === "gaming"} className={(view === "gaming" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 hover:bg-site-import-border hover:text-site-import-foreground"} title="Gaming">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" x2="10" y1="11" y2="11" />
                  <line x1="8" x2="8" y1="9" y2="13" />
                  <line x1="15" x2="15.01" y1="12" y2="12" />
                  <line x1="18" x2="18.01" y1="10" y2="10" />
                  <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
                </svg>
              </button>
              <button onClick={() => setView("chat")} aria-pressed={view === "chat"} className={(view === "chat" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 hover:bg-site-import-border hover:text-site-import-foreground"} title="Chat">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </button>
              <div className="flex-1" />
              <button onClick={() => { setMusicOpen(true); setPillOpen(false); }} aria-pressed={musicOpen} className={(musicOpen ? "bg-site-import-border" : "bg-transparent") + " rounded-[13px] text-site-import-muted-foreground cursor-pointer grid h-10 w-10 place-items-center transition-colors hover:bg-site-import-border hover:text-site-import-foreground"} title="Music">
                <svg className="block h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
              </button>
              <button onClick={() => setSettingsOpen(true)} aria-pressed={settingsOpen} className={(view === "settings" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 hover:bg-site-import-border hover:text-site-import-foreground"} title="Settings">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button onClick={() => setView("profile")} aria-pressed={view === "profile"} className={(view === "profile" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 hover:bg-site-import-border hover:text-site-import-foreground"} title="Profile">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </button>
            </aside>
            {musicOpen && <MusicHub onMinimize={() => { setMusicOpen(false); setPillOpen(true); }} />}
            {pillOpen && !musicOpen && <MusicPill onExpand={() => { setMusicOpen(true); setPillOpen(false); }} onClose={() => setPillOpen(false)} />}
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onMore={() => { setSettingsOpen(false); setView("settings"); }} />
            <div className="flex flex-1 flex-col min-w-0">
              <div className={(view === "home" ? "hidden " : "flex ") + "bg-[hsl(240_12%_4.5%)] items-center border-b! border-site-import-border! shrink-0 gap-1.5 h-11 pl-3 pr-3 bg-site-import-background"}>
                <div className="no-scrollbar items-center flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
                  <button className="group shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] items-center bg-site-import-border bg-none rounded-[.75rem] text-site-import-foreground cursor-pointer flex text-[13px] gap-2 h-8 m-0 max-w-[210px] min-w-[120px] p-0 pl-2.5! pr-2.5! relative text-left">
                    <span className="bg-[#ffffff40] rounded-[9999px] shrink-0 h-2 w-2" />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">New tab</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto">
                {view !== "home" && <ExtraView view={view} live={live} loading={loading} notice={notice} error={error} address={address} setAddress={setAddress} onStart={start} onEnd={end} go={(u) => { setAddress(u); void start(); }} />}
                {view === "home" && (
                  <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <SlotBadges />
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">MathSpot</h1>
                    <p className="text-muted-foreground text-sm max-w-md mb-8">The place where all math lives is mathspot</p>

                    <form onSubmit={start} className="w-full max-w-xl flex items-center gap-2 rounded-full border border-site-import-border bg-site-import-card/60 px-4 py-2 mb-6">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Search the web or type a URL..."
                        className="flex-1 bg-transparent border-none text-sm text-site-import-foreground focus:outline-none"
                      />
                      <button type="submit" disabled={loading} className="rounded-full bg-site-import-primary text-site-import-foreground px-4 py-1.5 text-xs font-medium cursor-pointer">
                        {loading ? "Connecting..." : "Go"}
                      </button>
                    </form>

                    <LinkGenerator />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
