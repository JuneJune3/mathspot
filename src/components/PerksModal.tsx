import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function PerksModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) return;
    const seen = localStorage.getItem("mathspot_seen_perks");
    if (!seen) setOpen(true);
  }, [user]);

  const dismiss = () => {
    localStorage.setItem("mathspot_seen_perks", "true");
    setOpen(false);
  };

  if (!open || user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#090A0F] p-6 text-white shadow-2xl">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome to MathSpot</h2>
        <p className="text-sm text-neutral-400 mb-6">
          Create a free account to unlock all features, or continue as a guest.
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <span className="text-sm font-medium">Free Proxy & Games</span>
            <span className="text-xs text-neutral-300">Guests & Members</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <span className="text-sm font-medium">Password Vault & History</span>
            <span className="text-xs text-emerald-400 font-semibold">Members Only</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <span className="text-sm font-medium">Game Submissions & Call Rooms</span>
            <span className="text-xs text-emerald-400 font-semibold">Members Only</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <span className="text-sm font-medium">Cloud-Synced Settings</span>
            <span className="text-xs text-emerald-400 font-semibold">Members Only</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to="/auth"
            onClick={dismiss}
            className="w-full text-center py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
          >
            Create Account / Sign In
          </Link>
          <button
            onClick={dismiss}
            className="w-full py-2.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-sm font-medium"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
