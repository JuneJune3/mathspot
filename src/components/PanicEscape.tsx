import { useEffect, useState, type KeyboardEvent } from "react";
import { KEYS, read, write } from "@/lib/stealth";

/** Settings for the panic key; the listener itself runs globally from the root layout. */
export function PanicEscape() {
  const [panicUrl, setPanicUrl] = useState("https://classroom.google.com");
  const [panicKey, setPanicKey] = useState("Escape");

  useEffect(() => {
    setPanicUrl(read(KEYS.panicUrl, "https://classroom.google.com"));
    setPanicKey(read(KEYS.panicKey, "Escape"));
  }, []);

  const capture = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPanicKey(e.key);
    write(KEYS.panicKey, e.key);
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand">Quick Panic Escape</h3>
        <span className="text-xs text-muted-foreground">Works on every page</span>
      </div>
      <label className="block text-xs text-muted-foreground">Go to this site
        <input type="url" value={panicUrl} maxLength={500} onChange={(e) => { setPanicUrl(e.target.value); write(KEYS.panicUrl, e.target.value); }} placeholder="https://classroom.google.com" className="glass-input mt-1" />
      </label>
      <label className="block text-xs text-muted-foreground">Panic key (click the box, then press a key)
        <input data-panic-capture="true" value={panicKey} onKeyDown={capture} readOnly className="glass-input mt-1 font-mono text-center text-brand cursor-pointer" />
      </label>
    </div>
  );
}
