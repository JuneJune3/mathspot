import { useEffect, useState } from "react";
import { CLOAKING_PRESETS, KEYS, read, write } from "@/lib/stealth";

export function TabCloakSettings() {
  const [activePreset, setActivePreset] = useState("default");
  const [customTitle, setCustomTitle] = useState("");
  const [customIcon, setCustomIcon] = useState("");

  useEffect(() => {
    setActivePreset(read(KEYS.cloakPreset, "default"));
    setCustomTitle(read(KEYS.cloakTitle));
    setCustomIcon(read(KEYS.cloakIcon));
  }, []);

  const select = (id: string) => {
    setActivePreset(id);
    write(KEYS.cloakPreset, id);
    if (id === "default") window.location.reload();
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand">Web Tab Cloaking</h3>
        <span className="text-xs text-muted-foreground">Presets & Custom</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {CLOAKING_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => select(p.id)}
            aria-pressed={activePreset === p.id}
            className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-colors cursor-pointer ${activePreset === p.id ? "bg-brand/20 border-brand text-foreground" : "bg-background/40 border-border text-muted-foreground hover:text-foreground"}`}
          >
            <img src={p.icon} alt="" loading="lazy" className="w-4 h-4 object-contain shrink-0" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
            <span className="text-xs font-medium truncate">{p.name}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => select("custom")}
        aria-pressed={activePreset === "custom"}
        className={`w-full py-2 rounded-lg border text-xs font-medium cursor-pointer ${activePreset === "custom" ? "bg-brand/20 border-brand text-foreground" : "bg-background/40 border-border text-muted-foreground"}`}
      >
        Use custom title & icon
      </button>
      {activePreset === "custom" && (
        <div className="space-y-3 pt-2 border-t border-border">
          <label className="block text-[11px] text-muted-foreground">Custom tab title
            <input value={customTitle} maxLength={80} onChange={(e) => { setCustomTitle(e.target.value); write(KEYS.cloakTitle, e.target.value); }} placeholder="e.g. Clever | Portal" className="glass-input mt-1" />
          </label>
          <label className="block text-[11px] text-muted-foreground">Custom icon link (https://…)
            <input type="url" value={customIcon} maxLength={500} onChange={(e) => { setCustomIcon(e.target.value); write(KEYS.cloakIcon, e.target.value); }} placeholder="https://example.com/favicon.ico" className="glass-input mt-1" />
          </label>
        </div>
      )}
    </div>
  );
}
