import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import {
  clearProviderKey,
  providerKeyState,
  providerStatus,
  saveProviderKey,
} from "@/lib/hyperbrowser.functions";
import { PROVIDERS, setPrefs, usePrefs, type Provider } from "@/lib/prefs";

export function ProviderKeysSettings() {
  const prefs = usePrefs();
  const { user } = useAuth();
  const statusFn = useServerFn(providerStatus);
  const keyStateFn = useServerFn(providerKeyState);
  const saveFn = useServerFn(saveProviderKey);
  const clearFn = useServerFn(clearProviderKey);
  const [available, setAvailable] = useState<Record<string, boolean> | null>(null);
  const [own, setOwn] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    statusFn()
      .then((status) => {
        if (!cancelled) setAvailable(status.available);
      })
      .catch(() => {
        if (!cancelled) setAvailable({ hyperbrowser: false, steel: false, kernel: false });
      });
    if (user) {
      keyStateFn()
        .then((state) => {
          if (!cancelled) {
            setOwn(state.own);
            setAvailable(state.available);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [user, statusFn, keyStateFn]);

  const saveKey = async (provider: Provider, name: string) => {
    const apiKey = (draft[provider] ?? "").trim();
    if (!user || apiKey.length < 8) return;
    setMessage("");
    try {
      await saveFn({ data: { provider, apiKey } });
      setOwn((current) => ({ ...current, [provider]: true }));
      setAvailable((current) => ({ ...current, [provider]: true }));
      setDraft((current) => ({ ...current, [provider]: "" }));
      setMessage(`${name} key saved. New sessions will use it.`);
    } catch {
      setMessage(`Could not save the ${name} key. Please try again.`);
    }
  };

  const removeKey = async (provider: Provider, name: string) => {
    if (!user) return;
    setMessage("");
    try {
      await clearFn({ data: { provider } });
      setOwn((current) => ({ ...current, [provider]: false }));
      setMessage(`${name} key removed. The project key is used again.`);
    } catch {
      setMessage(`Could not remove the ${name} key.`);
    }
  };

  return (
    <>
      <p className="text-site-import-muted-foreground text-[13px] m-0 mb-4">
        Choose a browsing service and enter its API key. Keys are stored server-side and never shown
        again after saving.
      </p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {PROVIDERS.map((provider) => {
          const ready = Boolean(available?.[provider.id]);
          const selected = prefs.provider === provider.id;
          return (
            <button
              key={provider.id}
              disabled={!ready}
              onClick={() => setPrefs({ provider: provider.id })}
              aria-pressed={selected}
              title={ready ? `Use ${provider.name}` : `${provider.name} has no API key yet`}
              className={`rounded-[.75rem] py-2.5 text-[13px] anim-press border border-site-import-card ${!ready ? "opacity-40 cursor-not-allowed text-site-import-muted-foreground bg-site-import-border" : selected ? "brand-gradient text-site-import-foreground cursor-pointer" : "text-site-import-foreground hover:text-site-import-foreground bg-site-import-border cursor-pointer hover:bg-site-import-card"}`}
            >
              {provider.name}
              <div className="text-[10px] tracking-[0.08em] uppercase opacity-70">
                {ready ? (own[provider.id] ? "Your key" : "Ready") : "No key"}
              </div>
            </button>
          );
        })}
      </div>
      {PROVIDERS.map((provider) => (
        <div key={provider.id} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={`provider-key-${provider.id}`}
              className="text-site-import-foreground text-[13px] font-medium"
            >
              {provider.name} API key
            </label>
            <span className="text-site-import-muted-foreground text-[11px]">
              {own[provider.id]
                ? "Your key is saved"
                : available?.[provider.id]
                  ? "Using the project key"
                  : "Not set up yet"}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              id={`provider-key-${provider.id}`}
              type={show[provider.id] ? "text" : "password"}
              value={draft[provider.id] ?? ""}
              onChange={(event) =>
                setDraft((current) => ({ ...current, [provider.id]: event.target.value }))
              }
              placeholder={
                own[provider.id]
                  ? "Key saved — paste a new one to replace it"
                  : `Paste your ${provider.name} key`
              }
              autoComplete="new-password"
              disabled={!user}
              className="min-w-0 flex-1 rounded-[.75rem] border border-site-import-card bg-site-import-background px-3 py-2 text-[13px] text-site-import-foreground"
            />
            <button
              type="button"
              onClick={() =>
                setShow((current) => ({ ...current, [provider.id]: !current[provider.id] }))
              }
              aria-label={
                show[provider.id] ? `Hide ${provider.name} key` : `Show ${provider.name} key`
              }
              className="border border-site-import-card rounded-[.75rem] px-3 text-[12px] text-site-import-muted-foreground cursor-pointer hover:text-site-import-foreground"
            >
              {show[provider.id] ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              onClick={() => void saveKey(provider.id, provider.name)}
              disabled={!user || (draft[provider.id] ?? "").trim().length < 8}
              className="brand-gradient rounded-[.75rem] px-4 py-2 text-[13px] text-site-import-foreground disabled:opacity-40"
            >
              Save
            </button>
            {own[provider.id] && (
              <button
                type="button"
                onClick={() => void removeKey(provider.id, provider.name)}
                className="border border-site-import-card rounded-[.75rem] px-3 text-[12px] text-site-import-muted-foreground cursor-pointer hover:text-site-import-foreground"
                aria-label={`Remove ${provider.name} key`}
              >
                Remove
              </button>
            )}
          </div>
          {!user && (
            <p className="text-site-import-muted-foreground text-[11px] mt-1 mb-0">
              Sign in to save your own keys.
            </p>
          )}
        </div>
      ))}
      {message && (
        <p role="status" className="text-site-import-foreground text-[12px] mt-3 mb-0">
          {message}
        </p>
      )}
    </>
  );
}
