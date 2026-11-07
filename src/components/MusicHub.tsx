import { useState, type FormEvent } from "react";
import { LoaderCircle, Minimize2, Pause, Play, Search, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { STATIONS, fmt, playTrack, prev, next, searchMusic, seek, setVolume, toggle, useMusic, type Track } from "@/lib/music";

/** Full music screen: search any song, pick a result, or play a radio station. */
export default function MusicHub({ onMinimize }: { onMinimize: () => void }) {
  const m = useMusic();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Track[] | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    setResults(await searchMusic(q));
    setBusy(false);
  };

  const row = (t: Track, list: Track[]) => {
    const active = m.track?.id === t.id;
    return (
      <button key={t.id} onClick={() => (active ? toggle() : void playTrack(t, list))} className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left cursor-pointer hover:bg-site-import-card ${active ? "bg-site-import-card" : ""}`}>
        {t.art ? <img src={t.art} alt="" loading="lazy" className="h-11 w-11 rounded-lg object-cover bg-site-import-border" /> : <span className="h-11 w-11 rounded-lg bg-site-import-border" />}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] text-site-import-foreground">{t.title}</span>
          <span className="block truncate text-[12px] text-site-import-muted-foreground">{t.artist}</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-site-import-muted-foreground">{t.kind === "full" ? "Full song" : t.kind === "preview" ? "30s preview" : "Live"}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full border border-site-import-card text-site-import-foreground">
          {active && m.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-site-import-background/80 p-4" role="dialog" aria-label="Music">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-site-import-card bg-site-import-background">
        <div className="flex items-center justify-between border-b border-site-import-card px-5 py-4">
          <h2 className="m-0 text-[18px] font-semibold text-site-import-foreground">Music</h2>
          <button onClick={onMinimize} className="flex items-center gap-1.5 rounded-full border border-site-import-card px-3 py-1.5 text-[12px] text-site-import-foreground cursor-pointer hover:bg-site-import-card" aria-label="Shrink to mini player">
            <Minimize2 className="h-3.5 w-3.5" /> Mini player
          </button>
        </div>

        <form onSubmit={submit} className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-site-import-card bg-site-import-border px-3 py-2">
          <Search className="h-4 w-4 text-site-import-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search any song or artist" className="flex-1 bg-transparent text-[14px] text-site-import-foreground outline-none placeholder:text-site-import-muted-foreground" aria-label="Search songs" />
          <button type="submit" className="rounded-lg bg-site-import-foreground px-3 py-1 text-[12px] font-medium text-site-import-background cursor-pointer">Search</button>
        </form>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {busy ? (
            <p className="flex items-center justify-center gap-2 py-8 text-[13px] text-site-import-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Searching…</p>
          ) : results ? (
            results.length ? results.map((t) => row(t, results)) : <p className="py-8 text-center text-[13px] text-site-import-muted-foreground">No songs found. Try another name.</p>
          ) : (
            <>
              <p className="m-0 px-2 pb-1 text-[11px] uppercase tracking-[0.16em] text-site-import-muted-foreground">Radio stations</p>
              {STATIONS.map((t) => row(t, STATIONS))}
            </>
          )}
        </div>

        {m.track && (
          <div className="border-t border-site-import-card px-5 py-3">
            <div className="flex items-center gap-3">
              {m.track.art && <img src={m.track.art} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[13px] text-site-import-foreground">{m.track.title}</p>
                <p className="m-0 truncate text-[11px] text-site-import-muted-foreground">{m.error || (m.loading ? "Loading…" : m.track.artist)}</p>
              </div>
              <button onClick={prev} className="grid h-8 w-8 place-items-center rounded-full text-site-import-foreground cursor-pointer hover:bg-site-import-card" aria-label="Previous"><SkipBack className="h-4 w-4" /></button>
              <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-full bg-site-import-foreground text-site-import-background cursor-pointer" aria-label={m.playing ? "Pause" : "Play"}>{m.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
              <button onClick={next} className="grid h-8 w-8 place-items-center rounded-full text-site-import-foreground cursor-pointer hover:bg-site-import-card" aria-label="Next"><SkipForward className="h-4 w-4" /></button>
              <label className="hidden items-center gap-1 text-site-import-muted-foreground sm:flex"><Volume2 className="h-4 w-4" /><input type="range" min={0} max={1} step={0.05} value={m.volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-20 accent-current" aria-label="Volume" /></label>
            </div>
            {m.track.kind !== "radio" && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-site-import-muted-foreground">
                <span>{fmt(m.time)}</span>
                <input type="range" min={0} max={m.duration || 0} step={1} value={m.time} onChange={(e) => seek(Number(e.target.value))} className="flex-1 accent-current" aria-label="Song position" />
                <span>{fmt(m.duration)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
