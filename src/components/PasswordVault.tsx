import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface VaultEntry {
  id: string;
  site: string;
  username: string;
  password: string;
  notes?: string;
}

export function PasswordVault() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [site, setSite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mathspot_vault");
    if (saved) {
      try { setEntries(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveEntries = (updated: VaultEntry[]) => {
    setEntries(updated);
    localStorage.setItem("mathspot_vault", JSON.stringify(updated));
  };

  const addEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!site || !password) return;
    const newEntry: VaultEntry = {
      id: crypto.randomUUID(),
      site,
      username,
      password,
    };
    saveEntries([...entries, newEntry]);
    setSite("");
    setUsername("");
    setPassword("");
  };

  const deleteEntry = (id: string) => {
    saveEntries(entries.filter((e) => e.id !== id));
  };

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let gen = "";
    for (let i = 0; i < 16; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
  };

  if (!user) {
    return (
      <div className="p-8 text-center border border-neutral-800 rounded-xl bg-[#090A0F]">
        <h3 className="text-lg font-bold mb-2">Member Feature</h3>
        <p className="text-neutral-400 text-sm">Please sign in to access your secure password vault.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addEntry} className="p-4 rounded-xl border border-neutral-800 bg-[#090A0F] space-y-3">
        <h3 className="font-bold text-base">Add New Credential</h3>
        <input
          value={site}
          onChange={(e) => setSite(e.target.value)}
          placeholder="Website or Service (e.g. Google, Discord)"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-white"
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username or Email"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-white"
        />
        <div className="flex gap-2">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={generatePassword}
            className="px-3 py-2 bg-neutral-800 text-xs rounded-lg hover:bg-neutral-700"
          >
            Generate
          </button>
        </div>
        <button type="submit" className="w-full py-2 bg-white text-black font-semibold rounded-lg text-sm">
          Save Password
        </button>
      </form>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="p-3 rounded-lg border border-neutral-800 bg-[#090A0F] flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{entry.site}</div>
              <div className="text-xs text-neutral-400">{entry.username}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copy(entry.id, entry.password)}
                className="px-2.5 py-1 text-xs rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800"
              >
                {copiedId === entry.id ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="px-2.5 py-1 text-xs rounded bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
