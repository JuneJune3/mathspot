import React, { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { openSite } from '@/lib/hyperbrowser.functions';
import { checkFrame } from '@/lib/frame-check.functions';
import { KEYS, read } from '@/lib/stealth';
import { PROXY_SERVER } from './ProxyHub';
import { Search, Globe, RefreshCw, ExternalLink, Shield } from 'lucide-react';

interface ProxySearchProps {
  defaultUrl?: string;
}

export default function ProxySearch({ defaultUrl = 'https://www.crazygames.com' }: ProxySearchProps) {
  const [inputUrl, setInputUrl] = useState(defaultUrl);
  const [activeUrl, setActiveUrl] = useState(defaultUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [tier, setTier] = useState<'Direct' | 'Proxy' | 'Cloud'>('Direct');
  const open = useServerFn(openSite);
  const check = useServerFn(checkFrame);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    let target = inputUrl.trim();

    // Auto-prefix HTTP/HTTPS if missing
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      // Check if it's a domain or search query
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
    }

    setIsLoading(true);
    setCloudError('');
    void route(target);
  };

  // Tier 1: direct frame → Tier 2: repository proxy → Tier 3: cloud browser relay.
  const route = async (target: string) => {
    const forceCloud = read(KEYS.cloudKernel) === 'true';
    if (!forceCloud) {
      const direct = await check({ data: { url: target } }).catch(() => ({ frameable: false }));
      if (direct.frameable) { setTier('Direct'); setActiveUrl(target); return; }
      const proxied = `${PROXY_SERVER}${encodeURIComponent(target)}`;
      const viaProxy = await check({ data: { url: proxied } }).catch(() => ({ frameable: false }));
      if (viaProxy.frameable) { setTier('Proxy'); setActiveUrl(proxied); return; }
    }
    try {
      const live = await open({ data: { query: target } });
      setTier('Cloud'); setActiveUrl(live.liveUrl);
    } catch (err) {
      setCloudError(/unauthorized|authorization/i.test(String((err as Error)?.message)) ? 'This site blocks direct loading. Sign in to use the cloud browser.' : 'Every route failed. Try opening the site in a new tab.');
      setTier('Direct'); setActiveUrl(target);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#090A0F] text-white p-4 gap-4 rounded-xl border border-purple-900/30">
      {/* Top Search Controls Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 bg-[#12131A] p-2 rounded-lg border border-purple-800/40 shadow-md">
        <div className="flex items-center gap-2 pl-2 text-purple-400">
          <Globe className="w-5 h-5" />
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search Google or enter a web address (e.g., crazygames.com)..."
            className="w-full bg-[#090A0F] text-sm text-slate-200 placeholder-slate-500 px-4 py-2 rounded-md border border-slate-800 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-[#9D4EDD] hover:bg-purple-600 px-4 py-2 rounded-md text-xs font-semibold text-white transition active:scale-95"
        >
          <Search className="w-4 h-4" /> Go
        </button>

        {activeUrl && (
          <div className="flex items-center gap-2 pr-2 border-l border-slate-800 pl-3">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                const current = activeUrl;
                setActiveUrl('');
                setTimeout(() => setActiveUrl(current), 50);
              }}
              className="text-slate-400 hover:text-purple-400 transition"
              title="Reload Frame"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-purple-400 transition"
              title="Open in Direct Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </form>

      <p className="text-[11px] text-muted-foreground m-0">Route: {tier}</p>
      {cloudError && <p role="status" className="text-xs text-muted-foreground m-0">{cloudError}</p>}
      {/* Embed Display Container */}
      <div className="relative flex-1 min-h-[600px] w-full bg-[#050508] rounded-lg border border-slate-800 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-[#090A0F]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#9D4EDD] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Routing through secure stream...</span>
          </div>
        )}

        {activeUrl ? (
          <iframe
            src={activeUrl}
            title="Proxy Window"
            className="w-full h-full border-0 bg-white"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
            allow="fullscreen; gamepad; autoplay"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 gap-2">
            <Shield className="w-10 h-10 text-purple-900/50" />
            <p className="text-sm">Enter a search term or target URL above to initialize browsing.</p>
          </div>
        )}
      </div>
    </div>
  );
}