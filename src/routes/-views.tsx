import { useEffect, useState } from "react";

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
  const [note, setNote] = useState(false);
  return (
    <>
      <button className={primaryBtn} onClick={() => setNote(true)}>Sign in</button>
      {note && <p className="text-site-import-muted-foreground text-[12px] mt-3">Accounts aren't set up yet.</p>}
    </>
  );
}

function Gaming({ go }: Props) {
  return (
    <div className="mx-auto max-w-4xl w-full py-14 px-6">
      <div className="text-center mb-10">
        <span className={pill}>Gaming</span>
        <h1 className="font-heading text-site-import-foreground font-semibold text-[36px] md:text-[48px] tracking-[-0.03em] leading-tight m-0">Ready to play?</h1>
        <p className="text-site-import-muted-foreground text-[0.875rem] leading-relaxed mt-3 mx-auto max-w-md">24 games and game sites — pick one and it opens in your browser window.</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {GAMES.map(([name, url]) => (
          <button key={name} onClick={() => go(url)} className={`${card} group flex flex-col items-center gap-2.5 py-4 px-2 cursor-pointer transition-all duration-300 hover:-translate-y-1`}>
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

const WALLS = ["Aurora", "Midnight", "Ocean", "Sunset", "Forest"];

function Settings() {
  const [title, setTitle] = useState("");
  const [wall, setWall] = useState("Aurora");
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
  return (
    <div className="mx-auto max-w-2xl w-full py-14 px-6">
      <h1 className="font-heading text-site-import-foreground text-[30px] font-semibold mb-8">Settings</h1>
      <h2 className={label}>Account</h2>
      <div className={`${card} p-5 flex items-center gap-4 mb-8`}>
        <p className="text-site-import-muted-foreground text-[13px] flex-1 m-0">Sign in to save your pins, bookmarks, wallpaper and history to your account.</p>
        <SignInNote />
      </div>
      <h2 className={label}>Browser tab</h2>
      <div className={`${card} p-5 mb-8`}>
        <label className="block text-site-import-foreground text-[13px] font-medium mb-2" htmlFor="tab-title">Top text (your real browser tab)</label>
        <input id="tab-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="WebPortal Hub" className="w-full bg-site-import-background border border-site-import-card rounded-[.75rem] px-4 py-2.5 text-site-import-foreground text-[14px]" />
        <p className="text-site-import-muted-foreground text-[11px] mt-3 mb-0">This changes the name of your actual browser tab — not the tabs inside the app.</p>
      </div>
      <h2 className={label}>Wallpaper</h2>
      <div className={`${card} p-5 flex flex-wrap gap-3`}>
        {WALLS.map((w) => (
          <button key={w} onClick={() => setWall(w)} aria-pressed={wall === w} className="flex flex-col items-center gap-2 cursor-pointer">
            <span className={`block h-16 w-16 rounded-[.75rem] border-2 bg-site-import-background ${wall === w ? "border-site-import-primary" : "border-site-import-card"}`} />
            <span className={`text-[11px] ${wall === w ? "text-site-import-foreground" : "text-site-import-muted-foreground"}`}>{w}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Profile() {
  const stats = [["6", "Pins"], ["0", "Bookmarks"], ["0", "History"], ["0", "Chats"]];
  return (
    <div className="mx-auto max-w-md w-full py-14 px-6">
      <div className={`${card} rounded-[1.5rem] p-8 text-center mb-4`}>
        <span className="grid place-items-center mx-auto h-16 w-16 rounded-[1rem] bg-site-import-primary text-site-import-foreground text-[22px] font-semibold mb-4">G</span>
        <h2 className="font-heading text-site-import-foreground text-[20px] font-semibold m-0">Guest</h2>
        <p className="text-site-import-muted-foreground text-[13px] leading-relaxed mt-2 mb-6">You're browsing as a guest. Sign in to sync your workspace to any device.</p>
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
