import { useEffect, useRef, useState, type PointerEvent } from "react";
import { GripVertical, Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react";

// Floating, draggable music pill. Plays free 24/7 internet radio streams with
// the browser's own audio player (no video embeds, so it works on more networks).

export const STATIONS = [
  { title: "Lofi Study", artist: "SomaFM · Groove Salad", url: "https://ice1.somafm.com/groovesalad-128-mp3", art: "https://somafm.com/img3/groovesalad-400.jpg" },
  { title: "Synthwave", artist: "SomaFM · The Trip", url: "https://ice1.somafm.com/thetrip-128-mp3", art: "https://somafm.com/img3/thetrip-400.jpg" },
  { title: "Chillhop", artist: "SomaFM · Lush", url: "https://ice1.somafm.com/lush-128-mp3", art: "https://somafm.com/img3/lush-400.jpg" },
  { title: "Gaming Beats", artist: "SomaFM · Beat Blender", url: "https://ice1.somafm.com/beatblender-128-mp3", art: "https://somafm.com/img3/beatblender-400.jpg" },
  { title: "Deep Focus", artist: "SomaFM · Drone Zone", url: "https://ice1.somafm.com/dronezone-128-mp3", art: "https://somafm.com/img3/dronezone-400.jpg" },
  { title: "Indie Pop", artist: "SomaFM · Indie Pop Rocks", url: "https://ice1.somafm.com/indiepop-128-mp3", art: "https://somafm.com/img3/indiepop-400.jpg" },
];

const POS_KEY = "music_pill_pos";

/** Keeps the pill fully on screen. */
export function clampPos(x: number, y: number, w: number, h: number, vw: number, vh: number) {
  return { x: Math.min(Math.max(8, x), Math.max(8, vw - w - 8)), y: Math.min(Math.max(8, y), Math.max(8, vh - h - 8)) };
}

export default function MusicPill({ onClose }: { onClose: () => void }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const box = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(0.7);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const station = STATIONS[index]!;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(POS_KEY) ?? "null");
      if (saved && typeof saved.x === "number") { setPos(saved); return; }
    } catch { /* ignore */ }
    setPos({ x: window.innerWidth / 2 - 180, y: window.innerHeight - 96 });
  }, []);

  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume]);
  useEffect(() => () => { audio.current?.pause(); }, []);

  const play = async (i = index) => {
    const el = audio.current;
    if (!el) return;
    setError("");
    if (i !== index || !el.src) { el.src = STATIONS[i]!.url; setIndex(i); }
    setLoading(true);
    try { await el.play(); setPlaying(true); }
    catch { setError("This station could not play. Try another."); setPlaying(false); }
    finally { setLoading(false); }
  };
  const toggle = () => { if (playing) { audio.current?.pause(); setPlaying(false); } else void play(); };
  const step = (d: number) => void play((index + d + STATIONS.length) % STATIONS.length);

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
  const btn = "grid place-items-center h-8 w-8 rounded-full text-site-import-foreground hover:bg-site-import-card cursor-pointer";
  return (
    <div ref={box} style={{ left: pos.x, top: pos.y }} className="fixed z-50 flex items-center gap-2 rounded-full border border-site-import-card bg-site-import-background/95 pl-1 pr-2 py-1.5 shadow-lg select-none max-w-[94vw]" role="region" aria-label="Music player">
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} className="cursor-grab active:cursor-grabbing text-site-import-muted-foreground touch-none px-0.5" title="Drag to move" aria-label="Drag to move">
        <GripVertical className="h-4 w-4" />
      </div>
      <img src={station.art} alt="" className={`h-9 w-9 rounded-full object-cover border border-site-import-card ${playing ? "anim-spin-slow" : ""}`} />
      <div className="min-w-0 w-[110px] sm:w-[140px]">
        <p className="m-0 truncate text-[13px] font-medium text-site-import-foreground">{station.title}</p>
        <p className="m-0 truncate text-[11px] text-site-import-muted-foreground">{error || (loading ? "Connecting…" : station.artist)}</p>
      </div>
      <button className={btn} onClick={() => step(-1)} aria-label="Previous station"><SkipBack className="h-4 w-4" /></button>
      <button className="grid place-items-center h-9 w-9 rounded-full bg-site-import-foreground text-site-import-background cursor-pointer" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button className={btn} onClick={() => step(1)} aria-label="Next station"><SkipForward className="h-4 w-4" /></button>
      <label className="hidden sm:flex items-center gap-1 text-site-import-muted-foreground">
        <Volume2 className="h-4 w-4" />
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-16 accent-current" aria-label="Volume" />
      </label>
      <button className={btn} onClick={() => { audio.current?.pause(); onClose(); }} aria-label="Close music"><X className="h-4 w-4" /></button>
      <audio ref={audio} preload="none" onPause={() => setPlaying(false)} onPlaying={() => setPlaying(true)} />
    </div>
  );
}
