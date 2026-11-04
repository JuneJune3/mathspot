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
import { useEffect, type ReactNode } from "react";
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
  { to: "/proxy", label: "Proxy" },
] as const;

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useStealth();
  const isHome = useLocation({ select: (l) => l.pathname === "/" });
  useEffect(() => {
    try { document.documentElement.classList.toggle("low-perf", localStorage.getItem("low_perf") === "true"); } catch { /* storage blocked */ }
  }, []);

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
          </div>
        </header>
        <main className={`flex-1 min-h-0 overflow-auto ${isHome ? "" : "p-6"}`}>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>

      </div>
      </div>
    </QueryClientProvider>
  );
}
