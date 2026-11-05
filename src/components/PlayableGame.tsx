import { useEffect, useRef, useState } from "react";
import { unzipSync } from "fflate";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Turns an uploaded game file into something playable inside the page.
// A single .html file is opened straight from storage. A .zip is unpacked in
// the browser and its asset references are pointed at the unpacked copies.

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".htm": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "text/xml",
};

function extOf(path: string): string {
  const clean = path.split("?")[0];
  const dot = clean.lastIndexOf(".");
  return dot < 0 ? "" : clean.slice(dot).toLowerCase();
}

function mimeOf(path: string): string {
  return MIME[extOf(path)] ?? "application/octet-stream";
}

/** Unpacks a game ZIP and returns one self-contained HTML document. */
function buildFromZip(buffer: ArrayBuffer): { html: string; urls: string[] } {
  const files = unzipSync(new Uint8Array(buffer));
  const names = Object.keys(files).filter((n) => !n.endsWith("/") && files[n]);
  const entry =
    names.find((n) => /(^|\/)index\.html?$/i.test(n)) ??
    names.find((n) => /\.html?$/i.test(n)) ??
    names[0];
  if (!entry) throw new Error("This file has no HTML page to open.");

  const urls: string[] = [];
  const byPath = new Map<string, string>();
  for (const n of names) {
    if (n === entry) continue;
    const url = URL.createObjectURL(new Blob([files[n]!], { type: mimeOf(n) }));
    urls.push(url);
    byPath.set(n, url);
    byPath.set(n.replace(/^\.\//, ""), url);
    const base = n.split("/").pop();
    if (base && !byPath.has(base)) byPath.set(base, url);
  }

  let html = new TextDecoder().decode(files[entry]!);
  const resolve = (ref: string): string | null => {
    if (/^(https?:|data:|blob:|#|mailto:|javascript:)/i.test(ref)) return null;
    const clean = ref.replace(/^\.\//, "").split("#")[0].split("?")[0];
    if (!clean) return null;
    return byPath.get(clean) ?? byPath.get(clean.split("/").pop() ?? "") ?? null;
  };
  html = html.replace(/\b(src|href)=("|')([^"']+)\2/gi, (m, attr: string, q: string, ref: string) => {
    const url = resolve(ref);
    return url ? `${attr}=${q}${url}${q}` : m;
  });
  html = html.replace(/url\((['"]?)([^)"']+)\1\)/gi, (m, q: string, ref: string) => {
    const url = resolve(ref);
    return url ? `url(${q}${url}${q})` : m;
  });
  return { html, urls };
}

type Props = { path: string; name: string; className?: string };

/** Renders an approved upload: an HTML file, or a ZIP unpacked in the browser. */
export default function PlayableGame({ path, name, className = "" }: Props) {
  const [html, setHtml] = useState("");
  const [direct, setDirect] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    setBusy(true);
    setError("");
    setHtml("");
    setDirect("");

    (async () => {
      const { data: signed, error: signError } = await supabase.storage.from("game-files").createSignedUrl(path, 600);
      if (cancelled) return;
      if (signError || !signed?.signedUrl) {
        setError("That game file could not be opened.");
        setBusy(false);
        return;
      }
      const isZip = /\.zip$/i.test(name) || /\.zip$/i.test(path);
      if (!isZip) {
        setDirect(signed.signedUrl);
        setBusy(false);
        return;
      }
      try {
        const res = await fetch(signed.signedUrl);
        if (!res.ok) throw new Error("The download failed.");
        const built = buildFromZip(await res.arrayBuffer());
        if (cancelled) {
          built.urls.forEach((u) => URL.revokeObjectURL(u));
          return;
        }
        urls.push(...built.urls);
        objectUrls.current = urls;
        setHtml(built.html);
      } catch {
        if (!cancelled) setError("This ZIP could not be unpacked. Try uploading the game as a single HTML file.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
      objectUrls.current = [];
    };
  }, [path, name]);

  if (busy)
    return (
      <div role="status" className={`grid place-content-center justify-items-center gap-3 text-site-import-muted-foreground text-[13px] ${className}`}>
        <LoaderCircle className="browser-loading h-6 w-6" />
        {/\.zip$/i.test(name) ? "Unpacking your game…" : "Opening your game…"}
      </div>
    );

  if (error)
    return (
      <div role="alert" className={`grid place-content-center text-center text-destructive text-[13px] px-6 ${className}`}>
        {error}
      </div>
    );

  if (direct)
    return (
      <iframe
        title={name}
        src={direct}
        className={`w-full h-full border-0 bg-black ${className}`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
        allow="autoplay; fullscreen; gamepad"
        allowFullScreen
      />
    );

  return (
    <iframe
      title={name}
      srcDoc={html}
      className={`w-full h-full border-0 bg-black ${className}`}
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
      allow="autoplay; fullscreen; gamepad"
      allowFullScreen
    />
  );
}
