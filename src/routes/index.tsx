import { createFileRoute } from '@tanstack/react-router'
import LinkGenerator from '../components/LinkGenerator' // 👈 1. Add this import at the top

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[#9D4EDD]">MathSpot Directory</h1>
        
        {/* 👈 2. Drop your Link Generator right here */}
        <LinkGenerator />
        
      </div>
    </div>
  )
}import { useCallback, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { closeSite, openSite } from "@/lib/hyperbrowser.functions";
import { useIdle, usePrefs, usePrefsEffects } from "@/lib/prefs";
import { ExtraView, type Live, type View } from "@/routes/-views";
import logoC from "@/assets/logo7.asset.json";
import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/site.css?inline";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "WebPortal Hub" }, { name: "description", content: "Aperture browser: pinned apps, games and private browsing in one window." }, { property: "og:title", content: "WebPortal Hub" }, { property: "og:description", content: "Aperture browser: pinned apps, games and private browsing in one window." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Index,
});

function Index() {
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
  useIdle(prefs.idleMinutes, Boolean(live) && !loading, stopIdle);
  const go = async (query: string) => {
    if (!query.trim() || closing.current || loading) return;
    setNotice("");
    setView("browse"); setLoading(true); setError(""); setAddress(query);
    try {
      const r = await open({ data: { query, sessionId: live?.sessionId, provider: (live?.provider ?? prefs.provider) as "hyperbrowser" | "steel" | "kernel" } });
      setLive(r); setAddress(r.url);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Could not open this site";
      setError(/unauthorized|no authorization header/i.test(raw) ? "Sign in to browse sites." : raw);
    } finally { setLoading(false); }
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = String(new FormData(e.currentTarget).get("q") ?? "");
    void go(v);
  };
  return (<><style>{capturedCSS.replace(/(<\/|<)(s)(tyle)/gi, (_, prefix, letter, rest) => prefix + (letter === "s" ? "\\73 " : "\\53 ") + rest)}</style>
    <>
      <div className="bg-site-import-background! text-site-import-foreground selection:bg-none! selection:[background-position:0%_0%]! selection:[background-size:auto_auto]! selection:[background-repeat:repeat]! selection:[background-origin:padding-box]! selection:[background-clip:border-box]! selection:[background-attachment:scroll]! selection:bg-[#9166f552]!" data-site-import-document-lang="en">
        <div className="h-full" id="root">
          <div className="bg-site-import-background flex h-dvh overflow-hidden w-full">
            <aside className="bg-[hsl(240_14%_3%)] items-center border-site-import-border! border-r! flex flex-col shrink-0 gap-2 w-14 bg-site-import-background py-3 px-0 md:w-[76px] md:py-4 md:px-0">
              <button onClick={() => setView("home")} aria-label="Aperture home" title="Home" className="cursor-pointer rounded-[13px] p-1 hover:opacity-80 transition-opacity">
                <img src={logoC.url} alt="Aperture logo" className="h-8 w-8 rounded-[8px] object-cover" />
              </button>
              <button onClick={() => setView("home")} aria-pressed={view === "home"} className={(view === "home" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:text-site-import-foreground"} title="Home">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </button>
              <button onClick={() => setView("gaming")} aria-pressed={view === "gaming"} className={(view === "gaming" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:text-site-import-foreground"} title="Gaming">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                  <line x1="6" x2="10" y1="11" y2="11" />
                  <line x1="8" x2="8" y1="9" y2="13" />
                  <line x1="15" x2="15.01" y1="12" y2="12" />
                  <line x1="18" x2="18.01" y1="10" y2="10" />
                  <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
                </svg>
              </button>
              <button onClick={() => setView("chat")} aria-pressed={view === "chat"} className={(view === "chat" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:text-site-import-foreground"} title="Chat">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </button>
              <div className="flex-1" />
              <button onClick={() => setView("settings")} aria-pressed={view === "settings"} className={(view === "settings" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:text-site-import-foreground"} title="Settings">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button onClick={() => setView("profile")} aria-pressed={view === "profile"} className={(view === "profile" ? "bg-site-import-border" : "bg-transparent") + " bg-none rounded-[13px] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-10 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-10 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:text-site-import-foreground"} title="Profile">
                <svg className="block h-[18px] align-middle w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </button>
            </aside>
            <div className="flex flex-1 flex-col min-w-0">
              <div className="bg-[hsl(240_12%_4.5%)] items-center border-b! border-site-import-border! flex shrink-0 gap-1.5 h-11 pl-3 pr-3 bg-site-import-background">
                <div className="no-scrollbar items-center flex flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
                  <button className="group shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] items-center bg-site-import-border bg-none rounded-[.75rem] shadow-[var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--tw-shadow)] text-site-import-foreground cursor-pointer flex text-[13px] gap-2 h-8 m-0 max-w-[210px] min-w-[120px] p-0 pl-2.5! pr-2.5! relative text-left normal-case duration-200 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] [animation-duration:0.2s] [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit]">
                    <span className="bg-[#ffffff40] rounded-[9999px] shrink-0 h-2 w-2" />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">New tab</span>
                    <span className="group-hover:opacity-100 rounded-[0.25rem] text-site-import-muted-foreground cursor-pointer grid shrink-0 h-5 ml-auto opacity-0 place-items-center duration-150 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] w-5 hover:bg-[#ffffff26] hover:text-site-import-foreground" role="button" tabIndex={-1}>
                      <svg className="block h-3 align-middle w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </span>
                  </button>
                  <button className="bg-transparent bg-none rounded-[calc(.75rem_-_2px)] text-site-import-muted-foreground cursor-pointer grid shrink-0 text-[100%] h-7 m-0 ml-1! p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-7 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-card hover:text-site-import-foreground" title="New tab">
                    <svg className="block h-4 align-middle w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </button>
                </div>
                <span className="items-center bg-[#34d3991a] border-site-import-accent! rounded-[9999px] border! text-[#6ee7b7e6] shrink-0 text-[10px] font-medium gap-1.5 tracking-[0.14em] pb-1 pl-2.5 pr-2.5 pt-1 uppercase hidden md:flex"><span className="bg-emerald-400 rounded-[9999px] h-1.5 w-1.5 bg-[#34d399]" />Private session</span>
              </div>
              <div className="bg-[hsl(240_12%_5%)] items-center border-b! border-site-import-border! flex shrink-0 gap-1.5 h-14 pl-3 pr-3 bg-[#0b0b0e]">
                <div className="items-center gap-0.5 hidden md:flex">
                  <button className="bg-transparent bg-none rounded-[.75rem] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-8 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-8 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] disabled:opacity-30 hover:bg-site-import-border hover:text-site-import-foreground hover:disabled:bg-transparent" disabled title="Back">
                    <svg className="block h-4 align-middle w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                      <path d="m12 19-7-7 7-7" />
                      <path d="M19 12H5" />
                    </svg>
                  </button>
                  <button className="bg-transparent bg-none rounded-[.75rem] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-8 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-8 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] disabled:opacity-30 hover:bg-site-import-border hover:text-site-import-foreground hover:disabled:bg-transparent" disabled title="Forward">
                    <svg className="block h-4 align-middle w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                  <button className="bg-transparent bg-none rounded-[.75rem] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-8 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-8 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] disabled:opacity-30 hover:bg-site-import-border hover:text-site-import-foreground hover:disabled:bg-transparent" title="Reload">
                    <svg className="block h-[15px] align-middle w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </svg>
                  </button>
                  <button className="bg-transparent bg-none rounded-[.75rem] text-site-import-muted-foreground cursor-pointer grid text-[100%] h-8 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-8 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] disabled:opacity-30 hover:bg-site-import-border hover:text-site-import-foreground hover:disabled:bg-transparent" title="Home">
                    <svg className="block h-[15px] align-middle w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={submit} className="group items-center bg-site-import-border border-site-import-border! rounded-[9999px] border! flex flex-1 gap-2 h-9 pl-3.5 pr-3.5 relative duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] focus-within:bg-site-import-border focus-within:border-[hsl(258_88%_68%/.5)]!">
                  <svg className="text-[#34d399cc] block shrink-0 h-3 align-middle w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                    <rect x="3" y="11" rx="2" ry="2" {...({ width: "18", height: "11" } as any)} />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input className="font-mono bg-transparent text-site-import-foreground text-[12.5px] m-0 p-0 w-full [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] focus:outline-transparent focus:outline-solid focus:outline-2 focus:outline-offset-2 placeholder:text-[hsl(240_7%_60%/.7)] placeholder:opacity-100" name="q" placeholder="Search the web or type a URL" spellCheck="false" value={address} onChange={(e) => setAddress(e.target.value)} />
                </form>
                <button className="bg-transparent bg-none rounded-[.75rem] text-site-import-muted-foreground cursor-pointer text-[100%] h-8 m-0 p-0 place-items-center normal-case duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] w-8 hidden [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] disabled:opacity-30 hover:bg-site-import-border hover:text-site-import-foreground hover:disabled:bg-transparent md:grid" disabled title="Open in a real browser tab">
                  <svg className="block h-[15px] align-middle w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                </button>
              </div>
              <div className="soft-scroll aurora bg-site-import-background flex-1 overflow-y-auto relative">
                {notice && <p role="status" className="text-site-import-muted-foreground text-sm px-6 py-2">{notice}</p>}
                {view !== "home" ? <ExtraView view={view} setView={setView} go={go} live={live} loading={loading} error={error} /> : (
<div className="ml-auto mr-auto max-w-3xl w-full py-14 px-6 md:py-20 md:px-6">
                  <div className="mb-10 text-center">
                    <span className="font-mono items-center bg-site-import-border border-site-import-card! rounded-[9999px] border! text-site-import-muted-foreground inline-flex text-[10px] gap-2 tracking-[0.22em] mb-5 pb-1 pl-3 pr-3 pt-1 uppercase"><svg className="text-site-import-primary block h-3 align-middle w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>Aperture browser</span>
                    <h1 className="font-heading text-site-import-foreground font-semibold m-0 text-[36px] tracking-[-1.08px] leading-10 md:text-[48px] md:tracking-[-1.44px] md:leading-12">Where do you want to go?</h1>
                    <p className="text-site-import-muted-foreground text-[0.875rem] leading-relaxed m-0 ml-auto! mr-auto! mt-3! max-w-md">Your pinned apps, tabs and history in one place. Anything you open lives inside this window.</p>
                  </div>
                  <form onSubmit={submit} className="group shadow-[0_20px_60px_-30px_rgba(124,92,255,0.8)] items-center bg-site-import-border border-site-import-card! rounded-[1rem] border! shadow-[var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--tw-shadow)] flex gap-3 mb-12 pb-3 pl-4 pr-4 pt-3 duration-150 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] focus-within:bg-site-import-border focus-within:border-[hsl(258_88%_68%/.6)]!">
                    <svg className="text-site-import-muted-foreground block shrink-0 h-4 align-middle w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input className="bg-transparent text-site-import-foreground text-[15px] m-0 p-0 w-full [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] focus:outline-transparent focus:outline-solid focus:outline-2 focus:outline-offset-2 placeholder:text-[hsl(240_7%_60%/.7)] placeholder:opacity-100" name="q" placeholder="Search or enter an address" defaultValue="" />
                    <button className="hover:scale-105 bg-site-import-primary bg-none rounded-[.75rem] text-[hsl(0_0%_100%)] cursor-pointer grid shrink-0 text-[100%] h-8 m-0 p-0 place-items-center normal-case duration-150 transition-transform ease-[cubic-bezier(0.4,0,0.2,1)] w-8 [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]" type="submit" aria-label="Go">
                      <svg className="block h-4 align-middle w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...({ xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24" } as any)}>
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </button>
                  </form>
                  <div className="items-baseline flex justify-between mb-3">
                    <h2 className="font-heading text-site-import-muted-foreground text-[13px] font-medium tracking-[0.16em] m-0 uppercase">Pinned</h2>
                    <span className="font-mono text-[hsl(240_7%_60%/.6)] text-[11px]">6 sites</span>
                  </div>
                  <div className="grid gap-2.5 grid-cols-3 mb-12 sm:grid-cols-6">
                    <div role="button" tabIndex={0} onClick={() => go("youtube.com")} onKeyDown={(e) => { if (e.key === "Enter") void go("youtube.com"); }} className="group hover:-translate-y-1 items-center bg-site-import-border bg-none border-site-import-border! rounded-[1rem] border! cursor-pointer flex flex-col text-[100%] gap-2.5 m-0 p-0 pb-4! pl-2! pr-2! pt-4! normal-case duration-300 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] text-site-import-foreground [animation-duration:0.3s] [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:border-[#ffffff26]! hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]">
                    <span className="group text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 bg-transparent rounded-[14px] shadow-[var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0_0_#0000)] cursor-pointer grid shrink-0 text-[1.125rem] font-semibold h-12 leading-7 m-0 p-0 place-items-center relative normal-case duration-300 transition-all ease-[cubic-bezier(0,0,0.2,1)] w-12 text-white [animation-duration:0.3s] [animation-timing-function:cubic-bezier(0,0,0.2,1)] [appearance:button] [background-image:linear-gradient(145deg,_rgb(255,_107,_107),_rgb(176,_30,_30))] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [letter-spacing:inherit] hover:shadow-[var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--tw-shadow)] hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]" title="YouTube" aria-label="YouTube">
                      <span className="drop-shadow-sm [filter:var(--tw-blur)_var(--tw-drop-shadow)]">▶</span>
                      <span className="from-white/25 to-transparent rounded-[14px] inset-0 opacity-60 pointer-events-none absolute [background-image:linear-gradient(to_bottom,var(--tw-gradient-stops))]" />
                    </span>
                    <span className="group-hover:text-foreground text-site-import-muted-foreground text-[12px] overflow-hidden text-center text-ellipsis duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap w-full">YouTube</span>
</div>
                    <div role="button" tabIndex={0} onClick={() => go("tiktok.com")} onKeyDown={(e) => { if (e.key === "Enter") void go("tiktok.com"); }} className="group hover:-translate-y-1 items-center bg-site-import-border bg-none border-site-import-border! rounded-[1rem] border! cursor-pointer flex flex-col text-[100%] gap-2.5 m-0 p-0 pb-4! pl-2! pr-2! pt-4! normal-case duration-300 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] text-site-import-foreground [animation-duration:0.3s] [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:border-[#ffffff26]! hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]">
                    <span className="group text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 bg-transparent rounded-[14px] shadow-[var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0_0_#0000)] cursor-pointer grid shrink-0 text-[1.125rem] font-semibold h-12 leading-7 m-0 p-0 place-items-center relative normal-case duration-300 transition-all ease-[cubic-bezier(0,0,0.2,1)] w-12 text-white [animation-duration:0.3s] [animation-timing-function:cubic-bezier(0,0,0.2,1)] [appearance:button] [background-image:linear-gradient(145deg,_rgb(34,_227,_224),_rgb(254,_44,_85))] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [letter-spacing:inherit] hover:shadow-[var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--tw-shadow)] hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]" title="TikTok" aria-label="TikTok">
                      <span className="drop-shadow-sm [filter:var(--tw-blur)_var(--tw-drop-shadow)]">♪</span>
                      <span className="from-white/25 to-transparent rounded-[14px] inset-0 opacity-60 pointer-events-none absolute [background-image:linear-gradient(to_bottom,var(--tw-gradient-stops))]" />
                    </span>
                    <span className="group-hover:text-foreground text-site-import-muted-foreground text-[12px] overflow-hidden text-center text-ellipsis duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap w-full">TikTok</span>
</div>
                    <div role="button" tabIndex={0} onClick={() => go("open.spotify.com")} onKeyDown={(e) => { if (e.key === "Enter") void go("open.spotify.com"); }} className="group hover:-translate-y-1 items-center bg-site-import-border bg-none border-site-import-border! rounded-[1rem] border! cursor-pointer flex flex-col text-[100%] gap-2.5 m-0 p-0 pb-4! pl-2! pr-2! pt-4! normal-case duration-300 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] text-site-import-foreground [animation-duration:0.3s] [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:border-[#ffffff26]! hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]">
                    <span className="group text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 bg-transparent rounded-[14px] shadow-[var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0_0_#0000)] cursor-pointer grid shrink-0 text-[1.125rem] font-semibold h-12 leading-7 m-0 p-0 place-items-center relative normal-case duration-300 transition-all ease-[cubic-bezier(0,0,0.2,1)] w-12 text-white [animation-duration:0.3s] [animation-timing-function:cubic-bezier(0,0,0.2,1)] [appearance:button] [background-image:linear-gradient(145deg,_rgb(59,_228,_119),_rgb(11,_122,_62))] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [letter-spacing:inherit] hover:shadow-[var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--tw-shadow)] hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]" title="Spotify" aria-label="Spotify">
                      <span className="drop-shadow-sm [filter:var(--tw-blur)_var(--tw-drop-shadow)]">♫</span>
                      <span className="from-white/25 to-transparent rounded-[14px] inset-0 opacity-60 pointer-events-none absolute [background-image:linear-gradient(to_bottom,var(--tw-gradient-stops))]" />
                    </span>
                    <span className="group-hover:text-foreground text-site-import-muted-foreground text-[12px] overflow-hidden text-center text-ellipsis duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap w-full">Spotify</span>
</div>
                    <div role="button" tabIndex={0} onClick={() => go("now.gg")} onKeyDown={(e) => { if (e.key === "Enter") void go("now.gg"); }} className="group hover:-translate-y-1 items-center bg-site-import-border bg-none border-site-import-border! rounded-[1rem] border! cursor-pointer flex flex-col text-[100%] gap-2.5 m-0 p-0 pb-4! pl-2! pr-2! pt-4! normal-case duration-300 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] text-site-import-foreground [animation-duration:0.3s] [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:border-[#ffffff26]! hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]">
                    <span className="group text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 bg-transparent rounded-[14px] shadow-[var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0_0_#0000)] cursor-pointer grid shrink-0 text-[1.125rem] font-semibold h-12 leading-7 m-0 p-0 place-items-center relative normal-case duration-300 transition-all ease-[cubic-bezier(0,0,0.2,1)] w-12 text-white [animation-duration:0.3s] [animation-timing-function:cubic-bezier(0,0,0.2,1)] [appearance:button] [background-image:linear-gradient(145deg,_rgb(156,_140,_255),_rgb(75,_52,_201))] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [letter-spacing:inherit] hover:shadow-[var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--tw-shadow)] hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]" title="Now.gg" aria-label="Now.gg">
                      <span className="drop-shadow-sm [filter:var(--tw-blur)_var(--tw-drop-shadow)]">⬢</span>
                      <span className="from-white/25 to-transparent rounded-[14px] inset-0 opacity-60 pointer-events-none absolute [background-image:linear-gradient(to_bottom,var(--tw-gradient-stops))]" />
                    </span>
                    <span className="group-hover:text-foreground text-site-import-muted-foreground text-[12px] overflow-hidden text-center text-ellipsis duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap w-full">Now.gg</span>
</div>
                    <div role="button" tabIndex={0} onClick={() => go("roblox.com")} onKeyDown={(e) => { if (e.key === "Enter") void go("roblox.com"); }} className="group hover:-translate-y-1 items-center bg-site-import-border bg-none border-site-import-border! rounded-[1rem] border! cursor-pointer flex flex-col text-[100%] gap-2.5 m-0 p-0 pb-4! pl-2! pr-2! pt-4! normal-case duration-300 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] text-site-import-foreground [animation-duration:0.3s] [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:border-[#ffffff26]! hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]">
                    <span className="group text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 bg-transparent rounded-[14px] shadow-[var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0_0_#0000)] cursor-pointer grid shrink-0 text-[1.125rem] font-semibold h-12 leading-7 m-0 p-0 place-items-center relative normal-case duration-300 transition-all ease-[cubic-bezier(0,0,0.2,1)] w-12 text-white [animation-duration:0.3s] [animation-timing-function:cubic-bezier(0,0,0.2,1)] [appearance:button] [background-image:linear-gradient(145deg,_rgb(255,_112,_112),_rgb(138,_27,_27))] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [letter-spacing:inherit] hover:shadow-[var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--tw-shadow)] hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]" title="Roblox" aria-label="Roblox">
                      <span className="drop-shadow-sm [filter:var(--tw-blur)_var(--tw-drop-shadow)]">▣</span>
                      <span className="from-white/25 to-transparent rounded-[14px] inset-0 opacity-60 pointer-events-none absolute [background-image:linear-gradient(to_bottom,var(--tw-gradient-stops))]" />
                    </span>
                    <span className="group-hover:text-foreground text-site-import-muted-foreground text-[12px] overflow-hidden text-center text-ellipsis duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap w-full">Roblox</span>
</div>
                    <div role="button" tabIndex={0} onClick={() => go("twitch.tv")} onKeyDown={(e) => { if (e.key === "Enter") void go("twitch.tv"); }} className="group hover:-translate-y-1 items-center bg-site-import-border bg-none border-site-import-border! rounded-[1rem] border! cursor-pointer flex flex-col text-[100%] gap-2.5 m-0 p-0 pb-4! pl-2! pr-2! pt-4! normal-case duration-300 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] text-site-import-foreground [animation-duration:0.3s] [appearance:button] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [font-weight:inherit] [letter-spacing:inherit] [line-height:inherit] hover:bg-site-import-border hover:border-[#ffffff26]! hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]">
                    <span className="group text-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 bg-transparent rounded-[14px] shadow-[var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0_0_#0000)] cursor-pointer grid shrink-0 text-[1.125rem] font-semibold h-12 leading-7 m-0 p-0 place-items-center relative normal-case duration-300 transition-all ease-[cubic-bezier(0,0,0.2,1)] w-12 text-white [animation-duration:0.3s] [animation-timing-function:cubic-bezier(0,0,0.2,1)] [appearance:button] [background-image:linear-gradient(145deg,_rgb(181,_137,_255),_rgb(91,_33,_182))] [font-family:inherit] [font-feature-settings:inherit] [font-variation-settings:inherit] [letter-spacing:inherit] hover:shadow-[var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--tw-shadow)] hover:transform-[translate(var(--tw-translate-x),var(--tw-translate-y))_rotate(var(--tw-rotate))_skewX(0)_skewY(0)_scaleX(var(--tw-scale-x))_scaleY(var(--tw-scale-y))]" title="Twitch" aria-label="Twitch">
                      <span className="drop-shadow-sm [filter:var(--tw-blur)_var(--tw-drop-shadow)]">◉</span>
                      <span className="from-white/25 to-transparent rounded-[14px] inset-0 opacity-60 pointer-events-none absolute [background-image:linear-gradient(to_bottom,var(--tw-gradient-stops))]" />
                    </span>
                    <span className="group-hover:text-foreground text-site-import-muted-foreground text-[12px] overflow-hidden text-center text-ellipsis duration-150 transition-colors ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap w-full">Twitch</span>
</div>
                  </div>
                  <p className="text-[hsl(240_7%_60%/.5)] text-[11px] leading-relaxed m-0 mt-12! text-center">Some sites refuse to load inside another site. When that happens, Aperture offers to open them in a full browser tab instead.</p>
                </div>
                )}
              </div>
            </div>
          </div>
          <div className="pointer-events-none" role="region" aria-label="Notifications (F8)" tabIndex={-1}>
            <ol className="flex list-none m-0 max-h-screen p-4 fixed top-0 w-full z-100 flex-col-reverse md:max-w-[420px] md:flex-col sm:bottom-0 sm:right-0 sm:top-auto" tabIndex={-1} />
          </div>
        </div>
      </div>
    </>
  </>);
}
