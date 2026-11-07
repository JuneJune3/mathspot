import { useSyncExternalStore } from "react";

// One shared audio player for the whole app, so the big Music Hub and the
// small floating pill control the same song and music never stops when
// either one is closed.

export type Track = {
  id: string;
  title: string;
  artist: string;
  art: string;
  src: string;
  /** "full" plays the whole song; "preview" is a 30 second clip. */
  kind: "full" | "preview" | "radio";
};

type State = {
  track: Track | null;
  queue: Track[];
  playing: boolean;
  loading: boolean;
  error: string;
  time: number;
  duration: number;
  volume: number;
};

let state: State = { track: null, queue: [], playing: false, loading: false, error: "", time: 0, duration: 0, volume: 0.7 };
const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function el(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.preload = "none";
    audio.volume = state.volume;
    audio.addEventListener("playing", () => set({ playing: true, loading: false, error: "" }));
    audio.addEventListener("pause", () => set({ playing: false }));
    audio.addEventListener("waiting", () => set({ loading: true }));
    audio.addEventListener("timeupdate", () => set({ time: audio!.currentTime, duration: Number.isFinite(audio!.duration) ? audio!.duration : 0 }));
    audio.addEventListener("ended", () => next());
    audio.addEventListener("error", () => set({ loading: false, playing: false, error: "This song could not play. Try another." }));
  }
  return audio;
}

export async function playTrack(track: Track, queue?: Track[]) {
  const a = el();
  if (!a) return;
  set({ track, queue: queue ?? state.queue, loading: true, error: "", time: 0, duration: 0 });
  a.src = track.src;
  try {
    await a.play();
  } catch {
    set({ loading: false, playing: false, error: "Tap play to start the song." });
  }
}

export function toggle() {
  const a = el();
  if (!a || !state.track) return;
  if (a.paused) void a.play().catch(() => set({ error: "This song could not play. Try another." }));
  else a.pause();
}

export function step(d: number) {
  const { queue, track } = state;
  if (!queue.length) return;
  const i = Math.max(0, queue.findIndex((t) => t.id === track?.id));
  void playTrack(queue[(i + d + queue.length) % queue.length]!);
}
export const next = () => step(1);
export const prev = () => step(-1);

export function seek(sec: number) {
  const a = el();
  if (a && Number.isFinite(sec)) a.currentTime = sec;
}

export function setVolume(v: number) {
  const a = el();
  if (a) a.volume = v;
  set({ volume: v });
}

export function stop() {
  audio?.pause();
  set({ track: null, playing: false });
}

export function useMusic(): State {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => state,
  );
}

export const STATIONS: Track[] = [
  ["groovesalad", "Lofi Study", "Groove Salad"],
  ["thetrip", "Synthwave", "The Trip"],
  ["lush", "Chillhop", "Lush"],
  ["beatblender", "Gaming Beats", "Beat Blender"],
  ["dronezone", "Deep Focus", "Drone Zone"],
  ["indiepop", "Indie Pop", "Indie Pop Rocks"],
].map(([id, title, name]) => ({
  id: `radio-${id}`,
  title: title!,
  artist: `24/7 radio · ${name}`,
  art: `https://somafm.com/img3/${id}-400.jpg`,
  src: `https://ice1.somafm.com/${id}-128-mp3`,
  kind: "radio" as const,
}));

const AUDIUS = "https://api.audius.co/v1";
const APP = "mathspot";

type AudiusTrack = { id: string; title: string; user?: { name?: string }; artwork?: Record<string, string> | null; is_streamable?: boolean };
type ItunesTrack = { trackId: number; trackName: string; artistName: string; artworkUrl100?: string; previewUrl?: string };

/** Searches free music sources. Full songs come first, then 30 second previews of mainstream hits. */
export async function searchMusic(q: string): Promise<Track[]> {
  const term = q.trim();
  if (!term) return [];
  const [full, previews] = await Promise.all([
    fetch(`${AUDIUS}/tracks/search?query=${encodeURIComponent(term)}&app_name=${APP}`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j: { data?: AudiusTrack[] }) =>
        (j.data ?? []).filter((t) => t.is_streamable !== false).slice(0, 15).map<Track>((t) => ({
          id: `au-${t.id}`,
          title: t.title,
          artist: t.user?.name ?? "Unknown artist",
          art: t.artwork?.["480x480"] ?? t.artwork?.["150x150"] ?? "",
          src: `${AUDIUS}/tracks/${t.id}/stream?app_name=${APP}`,
          kind: "full",
        })),
      )
      .catch(() => [] as Track[]),
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=15`)
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((j: { results?: ItunesTrack[] }) =>
        (j.results ?? []).filter((t) => t.previewUrl).map<Track>((t) => ({
          id: `it-${t.trackId}`,
          title: t.trackName,
          artist: t.artistName,
          art: (t.artworkUrl100 ?? "").replace("100x100", "300x300"),
          src: t.previewUrl!,
          kind: "preview",
        })),
      )
      .catch(() => [] as Track[]),
  ]);
  return [...previews, ...full];
}

export function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  return `${m}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}
