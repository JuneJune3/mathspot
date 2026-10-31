import ProxySearch from '@/components/ProxySearch';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useState } from 'react';
import { Music, Disc, X, Play, Square, Radio, Sparkles } from 'lucide-react';

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('jfKfPfyJRdk'); // Default Lofi
  const [currentTitle, setCurrentTitle] = useState('Lofi Hip Hop Radio');
  const [isPlaying, setIsPlaying] = useState(false);

  const presets = [
    { name: 'Lofi Study', id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio' },
    { name: 'Synthwave', id: '4xDzrJKXOOY', title: 'Synthwave Chillwave' },
    { name: 'Chillhop', id: '5wRWniH7WDA', title: 'Chillhop Jazzy Beats' },
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-white relative flex flex-col">
      {/* 🔮 Top Navigation Bar */}
      <header className="border-b border-[#9D4EDD]/20 bg-[#090A0F]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <Link to="/" className="text-xl font-bold text-[#9D4EDD] tracking-wide">
            MathSpot
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-gray-300 hover:text-[#9D4EDD] transition-colors [&.active]:text-[#9D4EDD]">Home</Link>
            <Link to="/music" className="text-gray-300 hover:text-[#9D4EDD] transition-colors [&.active]:text-[#9D4EDD]">Music Hub</Link>
            <Link to="/t9flix" className="text-gray-300 hover:text-[#9D4EDD] transition-colors [&.active]:text-[#9D4EDD]">T9Flix</Link>
            <Link to="/proxy" className="text-gray-300 hover:text-[#9D4EDD] transition-colors [&.active]:text-[#9D4EDD]">Proxy</Link>
            <Link to="/call" className="text-gray-300 hover:text-[#9D4EDD] transition-colors [&.active]:text-[#9D4EDD]">CallRoom</Link>
          </nav>

          {/* Quick Open Side Music Button */}
          <button
            onClick={() => setIsMusicOpen(!isMusicOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#9D4EDD]/40 bg-[#9D4EDD]/10 text-[#9D4EDD] hover:bg-[#9D4EDD]/20 transition-all text-xs font-semibold cursor-pointer"
          >
            <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>Music Drawer</span>
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

      {/* 🎵 Persistent Side Music Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 md:w-96 bg-[#090A0F]/95 backdrop-blur-2xl border-l border-[#9D4EDD]/30 shadow-2xl shadow-[#9D4EDD]/20 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        isMusicOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Drawer Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 text-[#9D4EDD]">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Side Music Hub</h3>
                <p className="text-[10px] text-gray-400">Plays while you browse</p>
              </div>
            </div>
            <button
              onClick={() => setIsMusicOpen(false)}
              className="p-1.5 rounded-lg bg-gray-800/60 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Now Playing Info */}
          <div className="p-4 rounded-xl bg-black/50 border border-gray-800/80 space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-[#9D4EDD] font-bold">Active Stream</span>
            <p className="text-xs font-medium text-white truncate">{currentTitle}</p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Presets</span>
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
                      ? 'border-[#9D4EDD] bg-[#9D4EDD]/20 text-white font-medium'
                      : 'border-gray-800 bg-black/30 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-[#9D4EDD]" />
                    {preset.name}
                  </span>
                  {currentVideoId === preset.id && isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-[#9D4EDD] animate-ping" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden or Active Audio Iframe Engine */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full py-2.5 bg-[#9D4EDD] hover:bg-[#8035cb] text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPlaying ? <><Square className="w-3.5 h-3.5 fill-black" /> Pause Stream</> : <><Play className="w-3.5 h-3.5 fill-black" /> Play Stream</>}
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

          <p className="text-[10px] text-center text-gray-500">
            Powered by MathSpot • Zero Ads
          </p>
        </div>

      </div>
    </div>
  )
}
<Link to="/proxy" className="text-gray-300 hover:text-[#9D4EDD] transition-colors">
  Proxy
</Link>
<Link to="/t9flix" className="text-gray-300 hover:text-[#9D4EDD] transition-colors">
  T9Flix
</Link>
<Link to="/music" className="text-gray-300 hover:text-[#9D4EDD] transition-colors">
  Music
</Link>
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

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
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}