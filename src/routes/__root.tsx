import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  useLocation,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Disc, X, Play, Square, Radio, Sparkles, Settings } from "lucide-react";
import { SettingsModal } from "@/components/SettingsModal";
import { useStealth } from "@/lib/stealth";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MathSpot" },
      { name: "description", content: "Mathspot is the plsce where all math live" },
            { property: "og:title", content: "MathSpot" },
      { property: "og:description", content: "Mathspot is the plsce where all math live" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/music", label: "Music Hub" },
  { to: "/t9flix", label: "T9Flix" },
  { to: "/proxy", label: "Proxy" },
] as const;

const PRESETS = [
  { name: "Lofi Study", id: "jfKfPfyJRdk", title: "Lofi Hip Hop Radio" },
  { name: "Synthwave", id: "4xDzrJKXOOY", title: "Synthwave Chillwave" },
  { name: "Chillhop", id: "5wRWniH7WDA", title: "Chillhop Jazzy Beats" },
];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useStealth();
  const isHome = useLocation({ select: (l) => l.pathname === "/" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(PRESETS[0].id);
  const [currentTitle, setCurrentTitle] = useState(PRESETS[0].title);
  const [isPlaying, setIsPlaying] = useState(false);
  const presets = PRESETS;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-dvh bg-mathspot-bg text-site-import-foreground relative flex flex-col overflow-hidden">
        <header className="shrink-0 border-b border-brand/20 bg-mathspot-bg/80 backdrop-blur-md z-40">
          <div className="px-4 py-2.5 flex items-center justify-between gap-4">
            <nav className="flex items-center gap-5 text-sm font-medium overflow-x-auto">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="text-muted-foreground hover:text-brand transition-colors whitespace-nowrap [&.active]:text-brand">{n.label}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setIsMusicOpen((o) => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand/40 bg-brand/10 text-brand hover:bg-brand/20 transition-colors text-xs font-semibold cursor-pointer">
                <Disc className={`w-4 h-4 ${isPlaying ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Music</span>
              </button>
              <button onClick={() => setSettingsOpen(true)} aria-label="Open settings" className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand/40 bg-brand/10 text-brand hover:bg-brand/20 transition-colors text-xs font-semibold cursor-pointer">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Cloak & Panic</span>
              </button>
            </div>
          </div>
        </header>
        <main className={`flex-1 min-h-0 overflow-auto ${isHome ? "" : "p-6"}`}>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {/* 🎵 Persistent Side Music Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 md:w-96 bg-mathspot-bg/95 backdrop-blur-2xl border-l border-brand/30 shadow-2xl shadow-brand/20 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        isMusicOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Drawer Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-brand/20 border border-brand/40 text-brand">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Side Music Hub</h3>
                <p className="text-[10px] text-muted-foreground">Plays while you browse</p>
              </div>
            </div>
            <button
              onClick={() => setIsMusicOpen(false)}
              className="p-1.5 rounded-lg bg-background/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Now Playing Info */}
          <div className="p-4 rounded-xl bg-background/50 border border-border space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-brand font-bold">Active Stream</span>
            <p className="text-xs font-medium text-foreground truncate">{currentTitle}</p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Presets</span>
            <div className="space-y-1.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setCurrentVideoId(preset.id);
                    setCurrentTitle(preset.title);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    currentVideoId === preset.id
                      ? 'border-brand bg-brand/20 text-foreground font-medium'
                      : 'border-border bg-background/30 text-muted-foreground hover:border-brand/40 hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-brand" />
                    {preset.name}
                  </span>
                  {currentVideoId === preset.id && isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden or Active Audio Iframe Engine */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full py-2.5 bg-brand hover:bg-brand/80 text-background font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPlaying ? <><Square className="w-3.5 h-3.5 fill-current" /> Pause Stream</> : <><Play className="w-3.5 h-3.5 fill-current" /> Play Stream</>}
            </button>
          </div>

          {/* Iframe renders in background so audio keeps playing across routes */}
          {isPlaying && (
            <div className="hidden">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1`}
                title="Background Audio Stream"
                allow="autoplay"
              />
            </div>
          )}

          <p className="text-[10px] text-center text-muted-foreground">
            Powered by MathSpot • Zero Ads
          </p>
        </div>

      </div>
      </div>
    </QueryClientProvider>
  );
}
