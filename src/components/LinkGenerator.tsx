import { useEffect, useState, type FormEvent } from "react";

// Makes share links that only ever point at this site. The address comes from
// wherever the site is running, so links follow any future site address change.

export function buildSiteLink(origin: string, path: string) {
  const clean = path.trim().replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+/, "");
  return `${origin.replace(/\/$/, "")}/${clean}`;
}

export default function LinkGenerator() {
  const [origin, setOrigin] = useState("");
  const [path, setPath] = useState("");
  const [shorten, setShorten] = useState(false);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    const full = buildSiteLink(origin, path);
    setCopied(false);
    if (!shorten) { setLink(full); return; }
    setBusy(true);
    try {
      const r = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(full)}`);
      const s = (await r.text()).trim();
      setLink(r.ok && s.startsWith("http") ? s : full);
    } catch {
      setLink(full);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  };

  return (
    <div className="rounded-xl border border-site-import-card bg-site-import-background p-6 text-site-import-foreground">
      <h3 className="m-0 mb-4 text-xl font-bold">Link Generator</h3>
      <form onSubmit={generate} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-site-import-muted-foreground">Page (optional)</span>
          <div className="flex items-center rounded-lg border border-site-import-card bg-site-import-border">
            <span className="truncate pl-3 text-sm text-site-import-muted-foreground">{origin}/</span>
            <input value={path} onChange={(e) => setPath(e.target.value)} placeholder="" className="flex-1 bg-transparent px-1 py-2 text-site-import-foreground outline-none" aria-label="Page" />
          </div>
        </label>
        <label className="flex items-center gap-2 text-sm text-site-import-muted-foreground cursor-pointer">
          <input type="checkbox" checked={shorten} onChange={(e) => setShorten(e.target.checked)} className="accent-current" />
          Make it a TinyURL
        </label>
        <button type="submit" disabled={busy || !origin} className="w-full rounded-lg bg-site-import-foreground py-2 font-semibold text-site-import-background cursor-pointer disabled:opacity-50">
          {busy ? "Making link…" : "Generate Link"}
        </button>
      </form>
      {link && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-site-import-card bg-site-import-border p-4">
          <a href={link} target="_blank" rel="noreferrer" className="mr-2 truncate text-sm text-site-import-foreground underline">{link}</a>
          <button onClick={copy} className="rounded border border-site-import-card px-3 py-1 text-xs font-semibold text-site-import-foreground cursor-pointer">{copied ? "Copied" : "Copy"}</button>
        </div>
      )}
    </div>
  );
}
