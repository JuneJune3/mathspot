import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TabCloakSettings } from "./Webcloaking";
import { PanicEscape } from "./PanicEscape";
import { KEYS, read, write } from "@/lib/stealth";

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [cloud, setCloud] = useState(false);
  useEffect(() => { setCloud(read(KEYS.cloudKernel) === "true"); }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="MathSpot settings" onClick={onClose}>
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-brand">Settings</h2>
          <button onClick={onClose} aria-label="Close settings" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="glass-card p-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Cloud browser</h3>
            <p className="text-xs text-muted-foreground m-0">Open proxy searches in a cloud browser instead of loading them directly. Uses the site's own browsing service.</p>
          </div>
          <input type="checkbox" checked={cloud} onChange={(e) => { setCloud(e.target.checked); write(KEYS.cloudKernel, String(e.target.checked)); }} className="w-4 h-4 accent-brand cursor-pointer" aria-label="Use cloud browser" />
        </div>
        <TabCloakSettings />
        <PanicEscape />
      </div>
    </div>
  );
}
