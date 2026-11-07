import { useEffect, useRef, useState, type PointerEvent } from "react";
import { GripVertical, Maximize2, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { next, prev, stop, toggle, useMusic } from "@/lib/music";

// Small floating, draggable mini player shown after the Music screen is shrunk.

const POS_KEY = "music_pill_pos";

/** Keeps the pill fully on screen. */
export function clampPos(x: number, y: number, w: number, h: number, vw: number, vh: number) {
  return { x: Math.min(Math.max(8, x), Math.max(8, vw - w - 8)), y: Math.min(Math.max(8, y), Math.max(8, vh - h - 8)) };
}

export default function MusicPill({ onExpand, onClose }: { onExpand: () => void; onClose: () => void }) {
  const m = useMusic();
  const box = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(POS_KEY) ?? "null");
      if (saved && typeof saved.x === "number") { setPos(clampPos(saved.x, saved.y, 360, 56, window.innerWidth, window.innerHeight)); return; }
    } catch { /* ignore */ }
    setPos({ x: window.innerWidth / 2 - 180, y: window.innerHeight - 96 });
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!pos) return;
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !box.current) return;
    const r = box.current.getBoundingClientRect();
    setPos(clampPos(e.clientX - drag.current.dx, e.clientY - drag.current.dy, r.width, r.height, window.innerWidth, window.innerHeight));
  };
  const onUp = () => {
    drag.current = null;
    if (pos) try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* ignore */ }
  };

  if (!pos) return null;
  const t = m.track;
  const btn = "grid place-items-center h-8 w-8 rounded-full text-site-import-foreground hover:bg-site-import-card cursor-pointer";
  return (
    <div ref={box} style={{ left: pos.x, top: pos.y }} className="fixed z-50 flex items-center gap-2 rounded-full border border-site-import-card bg-site-import-background/95 pl-1 pr-2 py-1.5 shadow-lg select-none max-w-[94vw]" role="region" aria-label="Mini music player">
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} className="cursor-grab active:cursor-grabbing text-site-import-muted-foreground touch-none px-0.5" title="Drag to move" aria-label="Drag to move">
        <GripVertical className="h-4 w-4" />
      </div>
      {t?.art ? <img src={t.art} alt="" className={`h-9 w-9 rounded-full object-cover border border-site-import-card ${m.playing ? "anim-spin-slow" : ""}`} /> : <span className="h-9 w-9 rounded-full bg-site-import-card" />}
      <button onClick={onExpand} className="min-w-0 w-[110px] sm:w-[140px] text-left cursor-pointer" title="Open music">
        <p className="m-0 truncate text-[13px] font-medium text-site-import-foreground">{t?.title ?? "Nothing playing"}</p>
        <p className="m-0 truncate text-[11px] text-site-import-muted-foreground">{m.error || (m.loading ? "Loading…" : t?.artist ?? "Tap to pick a song")}</p>
      </button>
      <button className={btn} onClick={prev} aria-label="Previous"><SkipBack className="h-4 w-4" /></button>
      <button className="grid place-items-center h-9 w-9 rounded-full bg-site-import-foreground text-site-import-background cursor-pointer" onClick={() => (t ? toggle() : onExpand())} aria-label={m.playing ? "Pause" : "Play"}>
        {m.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button className={btn} onClick={next} aria-label="Next"><SkipForward className="h-4 w-4" /></button>
      <button className={btn} onClick={onExpand} aria-label="Open music"><Maximize2 className="h-4 w-4" /></button>
      <button className={btn} onClick={() => { stop(); onClose(); }} aria-label="Close music"><X className="h-4 w-4" /></button>
    </div>
  );
}
