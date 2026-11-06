import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { slotStatus } from "@/lib/hyperbrowser.functions";

type Data = Awaited<ReturnType<typeof slotStatus>>;
const NAMES = { hyperbrowser: "Hyperbrowser", steel: "Steel", kernel: "Kernel" } as const;

/** Live cloud browser slots. Full or unconfigured services show gray. */
export default function SlotBadges() {
  const fetchSlots = useServerFn(slotStatus);
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => fetchSlots().then((d) => { if (alive) setData(d); }).catch(() => {});
    void load();
    const t = setInterval(load, 20000);
    return () => { alive = false; clearInterval(t); };
  }, [fetchSlots]);
  if (!data) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10" aria-label="Cloud browser slots">
      {(Object.keys(NAMES) as (keyof typeof NAMES)[]).map((p) => {
        const s = data.slots[p];
        const off = !data.available[p] || s.free <= 0;
        return (
          <span key={p} aria-disabled={off} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] ${off ? "border-site-import-border text-site-import-muted-foreground opacity-40" : "border-site-import-card text-site-import-foreground"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${off ? "bg-site-import-muted-foreground" : "bg-site-import-foreground"}`} />
            {NAMES[p]} · {data.available[p] ? `${s.used}/${s.cap} in use` : "offline"}
          </span>
        );
      })}
    </div>
  );
}
