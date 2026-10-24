import { useState, type ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePrefs, setPrefs, MAX_ICON_BYTES, MAX_IDLE_MINUTES, type Motion } from "@/lib/prefs";
import l1 from "@/assets/logo1.asset.json";
import l2 from "@/assets/logo2.asset.json";
import l3 from "@/assets/logo3.asset.json";
import l4 from "@/assets/logo4.asset.json";
import l5 from "@/assets/logo5.asset.json";
import l6 from "@/assets/logo6.asset.json";
import l7 from "@/assets/logo7.asset.json";

const LOGOS = [l7, l1, l2, l3, l4, l5, l6].map((l) => l.url);

export type View = "home" | "gaming" | "chat" | "settings" | "profile" | "browse";

type Props = {
  view: View;
  setView: (v: View) => void;
  go: (q: string) => void;
  live: { liveUrl: string; url: string } | null;
  loading: boolean;
  error: string;
};

const GAMES: [string, string][] = [
  ["Eaglercraft", "eaglercraft.com"], ["Minecraft Classic", "classic.minecraft.net"], ["CloudMoon", "web.cloudmoonapp.com"], ["EasyFun", "easyfun.gg"],
  ["GeForce NOW", "play.geforcenow.com"], ["Xbox Cloud", "xbox.com/play"], ["Now.gg", "now.gg"], ["Roblox", "roblox.com"],
  ["Geometry Dash", "geometrydash.com"], ["Poki", "poki.com"], ["CrazyGames", "crazygames.com"], ["Coolmath Games", "coolmathgames.com"],
  ["Retro Bowl", "poki.com/en/g/retro-bowl"], ["Subway Surfers", "poki.com/en/g/subway-surfers"], ["Moto X3M", "poki.com/en/g/moto-x3m"], ["Drive Mad", "poki.com/en/g/drive-mad"],
  ["Bloons TD 5", "poki.com/en/g/bloons-tower-defense-5"], ["Slope", "slopegame.io"], ["Run 3", "coolmathgames.com/0-run-3"], ["Fireboy & Watergirl", "coolmathgames.com/0-fireboy-and-water-girl-in-the-forest-temple"],
  ["Happy Wheels", "totaljerkface.com/happy_wheels.tjf"], ["Krunker", "krunker.io"], ["Shell Shockers", "shellshock.io"], ["1v1.LOL", "1v1.lol"],
  ["Smash Karts", "smashkarts.io"], ["Bonk.io", "bonk.io"], ["Venge.io", "venge.io"], ["Ev.io", "ev.io"],
  ["Agar.io", "agar.io"], ["Slither.io", "slither.io"], ["Diep.io", "diep.io"], ["Paper.io 2", "paper-io.com"],
  ["Hole.io", "hole-io.com"], ["Surviv / Suroi", "suroi.io"], ["Zombs Royale", "zombsroyale.io"], ["Skribbl.io", "skribbl.io"],
  ["Gartic Phone", "garticphone.com"], ["GeoGuessr", "geoguessr.com"], ["Chess", "chess.com"], ["Lichess", "lichess.org"],
  ["Wordle", "nytimes.com/games/wordle"], ["2048", "play2048.co"], ["Tetris", "tetris.com/play-tetris"], ["Pac-Man", "freepacman.org"],
  ["Cookie Clicker", "orteil.dashnet.org/cookieclicker"], ["Little Alchemy 2", "littlealchemy2.com"], ["Scratch", "scratch.mit.edu"], ["Armor Games", "armorgames.com"],
  ["Kongregate", "kongregate.com"], ["Newgrounds", "newgrounds.com/games"], ["itch.io (web)", "itch.io/games/platform-web"], ["Friv", "friv.com"],
  ["Miniclip", "miniclip.com"], ["Y8", "y8.com"], ["Lagged", "lagged.com"], ["Twitch", "twitch.tv"],
];

const icon = (u: string) => `https://www.google.com/s2/favicons?sz=64&domain=${u.split("/")[0]}`;

const card = "bg-site-import-border border border-site-import-border rounded-[1rem]";
const label = "font-heading text-site-import-muted-foreground text-[13px] font-medium tracking-[0.16em] uppercase mb-3";
const primaryBtn = "bg-site-import-primary text-site-import-foreground rounded-[.75rem] font-semibold text-[14px] px-5 py-2.5 cursor-pointer hover:opacity-90 transition-opacity";
const pill = "font-mono inline-flex items-center gap-2 bg-site-import-border border border-site-import-card rounded-full text-site-import-muted-foreground text-[10px] tracking-[0.22em] uppercase px-3 py-1 mb-5";

function SignInNote() {
  const { user, username } = useAuth();
  if (user)
    return (
      <div className="flex items-center gap-3">
        <span className="text-site-import-foreground text-[13px]">@{username || "you"}</span>
        <button className={primaryBtn} onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    );
  return <Link to="/auth" className={primaryBtn + " inline-block no-underline"}>Sign in</Link>;
}

function Gaming({ go }: Props) {
  return (
    <div className="mx-auto max-w-4xl w-full py-14 px-6">
      <div className="text-center mb-10">
        <span className={pill}>Gaming</span>
        <h1 className="font-heading text-site-import-foreground font-semibold text-[36px] md:text-[48px] tracking-[-0.03em] leading-tight m-0">Ready to play?</h1>
        <p className="text-site-import-muted-foreground text-[0.875rem] leading-relaxed mt-3 mx-auto max-w-md">{GAMES.length} no-download games and game sites — pick one and it opens in your browser window.</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {GAMES.map(([name, url]) => (
          <button key={name} onClick={() => go(url)} className={`${card} anim-card group flex flex-col items-center gap-2.5 py-4 px-2 cursor-pointer`}>
            <span className="grid place-items-center h-12 w-12 rounded-[14px] bg-site-import-foreground">
              <img src={icon(url)} alt="" className="h-8 w-8" loading="lazy" />
            </span>
            <span className="text-site-import-muted-foreground text-[12px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Chat() {
  return (
    <div className="grid place-items-center min-h-full px-6 py-14">
      <div className={`${card} rounded-[1.5rem] p-10 max-w-sm w-full text-center`}>
        <span className="grid place-items-center mx-auto h-12 w-12 rounded-[14px] bg-site-import-card text-site-import-primary mb-4">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
        </span>
        <h2 className="font-heading text-site-import-foreground text-[20px] font-semibold m-0">Sign in to chat</h2>
        <p className="text-site-import-muted-foreground text-[13px] leading-relaxed mt-2 mb-6">Chat rooms are for signed-in members. Sign in to join public rooms or create private ones.</p>
        <SignInNote />
      </div>
    </div>
  );
}

const MOTIONS: [Motion, string][] = [["none", "None"], ["minimal", "Minimal"], ["intense", "Intense"]];

function Settings() {
  const p = usePrefs();
  const [iconErr, setIconErr] = useState("");
  const upload = (e: ChangeEvent<HTMLInputElement>) => {
    setIconErr("");
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpeg|gif|webp|x-icon|vnd\.microsoft\.icon)$/.test(f.type)) { setIconErr("Pick a PNG, JPG, GIF, WEBP or ICO image."); return; }
    if (f.size > MAX_ICON_BYTES) { setIconErr("Image must be under 200 KB."); return; }
    const r = new FileReader();
    r.onload = () => setPrefs({ tabIcon: String(r.result) });
    r.readAsDataURL(f);
  };
  const opt = (on: boolean) => `rounded-[.75rem] border-2 cursor-pointer anim-press ${on ? "border-site-import-primary" : "border-site-import-card"}`;
  return (
    <div className="mx-auto max-w-2xl w-full py-14 px-6 anim-rise">
      <h1 className="font-heading text-site-import-foreground text-[30px] font-semibold mb-8">Settings</h1>
      <h2 className={label}>Account</h2>
      <div className={`${card} p-5 flex items-center gap-4 mb-8`}>
        <p className="text-site-import-muted-foreground text-[13px] flex-1 m-0">Sign in with email, Google or Apple.</p>
        <SignInNote />
      </div>
      <h2 className={label}>Browser tab</h2>
      <div className={`${card} p-5 mb-8`}>
        <label className="block text-site-import-foreground text-[13px] font-medium mb-2" htmlFor="tab-title">Tab name</label>
        <input id="tab-title" value={p.tabTitle} maxLength={60} onChange={(e) => setPrefs({ tabTitle: e.target.value })} placeholder="WebPortal Hub" className="w-full bg-site-import-background border border-site-import-card rounded-[.75rem] px-4 py-2.5 text-site-import-foreground text-[14px]" />
        <div className="text-site-import-foreground text-[13px] font-medium mt-5 mb-2">Tab logo</div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <button onClick={() => setPrefs({ tabIcon: "" })} aria-pressed={!p.tabIcon} className={opt(!p.tabIcon) + " h-12 w-12 text-[10px] text-site-import-muted-foreground"}>Default</button>
          {LOGOS.map((u) => (
            <button key={u} onClick={() => setPrefs({ tabIcon: u })} aria-pressed={p.tabIcon === u} className={opt(p.tabIcon === u) + " h-12 w-12 overflow-hidden p-0"}>
              <img src={u} alt="Tab logo option" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
          {p.tabIcon.startsWith("data:") && <span className={opt(true) + " h-12 w-12 overflow-hidden"}><img src={p.tabIcon} alt="Your logo" className="h-full w-full object-cover" /></span>}
          <label className={primaryBtn + " text-[13px]"}>Upload<input type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/x-icon" onChange={upload} className="hidden" /></label>
        </div>
        {iconErr && <p className="text-destructive text-[12px] mt-2 mb-0">{iconErr}</p>}
      </div>
      <h2 className={label}>Auto-close browser</h2>
      <div className={`${card} p-5 mb-8`}>
        <div className="flex justify-between text-site-import-foreground text-[13px] mb-3"><span>Close after no activity for</span><b>{p.idleMinutes} min</b></div>
        <input type="range" min={1} max={MAX_IDLE_MINUTES} value={p.idleMinutes} onChange={(e) => setPrefs({ idleMinutes: Number(e.target.value) })} className="w-full accent-site-import-primary" aria-label="Minutes before auto-close" />
        <p className="text-site-import-muted-foreground text-[11px] mt-2 mb-0">Saves your browsing credits. Maximum {MAX_IDLE_MINUTES} minutes.</p>
      </div>
      <h2 className={label}>Animations</h2>
      <div className={`${card} p-2 grid grid-cols-3 gap-2`}>
        {MOTIONS.map(([m, n]) => (
          <button key={m} onClick={() => setPrefs({ motion: m })} aria-pressed={p.motion === m} className={`rounded-[.75rem] py-2.5 text-[13px] cursor-pointer anim-press ${p.motion === m ? "brand-gradient text-site-import-foreground" : "text-site-import-muted-foreground hover:text-site-import-foreground"}`}>{n}</button>
        ))}
      </div>
      <p className="text-site-import-muted-foreground text-[11px] mt-2">Minimal is best for slower devices. "Intense" drops to Minimal automatically on very low-memory devices.</p>
    </div>
  );
}

function Profile() {
  const { user, username } = useAuth();
  const stats = [["6", "Pins"], ["0", "Bookmarks"], ["0", "History"], ["0", "Chats"]];
  return (
    <div className="mx-auto max-w-md w-full py-14 px-6">
      <div className={`${card} rounded-[1.5rem] p-8 text-center mb-4`}>
        <span className="grid place-items-center mx-auto h-16 w-16 rounded-[1rem] bg-site-import-primary text-site-import-foreground text-[22px] font-semibold mb-4 brand-gradient">{(username || "G").charAt(0).toUpperCase()}</span>
        <h2 className="font-heading text-site-import-foreground text-[20px] font-semibold m-0">{user ? "@" + (username || "you") : "Guest"}</h2>
        <p className="text-site-import-muted-foreground text-[13px] leading-relaxed mt-2 mb-6">{user ? user.email : "You're browsing as a guest. Sign in to open sites and sync your workspace."}</p>
        <SignInNote />
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {stats.map(([n, l]) => (
          <div key={l} className={`${card} py-4 text-center`}>
            <div className="text-site-import-foreground text-[18px] font-semibold">{n}</div>
            <div className="text-site-import-muted-foreground text-[10px] tracking-[0.12em] uppercase">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Browse({ live, loading, error, setView }: Props) {
  if (error)
    return (
      <div className="grid place-items-center min-h-full px-6 text-center">
        <div className={`${card} p-8 max-w-md`}>
          <h2 className="text-site-import-foreground text-[18px] font-semibold m-0 mb-2">Couldn't open that site</h2>
          <p className="text-site-import-muted-foreground text-[13px] break-words mb-5">{error}</p>
          <button className={primaryBtn} onClick={() => setView("home")}>Back home</button>
        </div>
      </div>
    );
  if (!live || loading && !live)
    return (
      <div className="grid place-items-center min-h-full text-site-import-muted-foreground text-[14px]">Starting your private browser…</div>
    );
  return (
    <div className="relative h-full w-full">
      <iframe title="Browser" src={live.liveUrl} className="absolute inset-0 h-full w-full border-0" allow="clipboard-read; clipboard-write; autoplay; fullscreen" />
      {loading && <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-site-import-border text-site-import-foreground text-[12px] rounded-full px-3 py-1">Loading…</div>}
    </div>
  );
}

export function ExtraView(props: Props) {
  switch (props.view) {
    case "gaming": return <Gaming {...props} />;
    case "chat": return <Chat />;
    case "settings": return <Settings />;
    case "profile": return <Profile />;
    case "browse": return <Browse {...props} />;
    default: return null;
  }
}
