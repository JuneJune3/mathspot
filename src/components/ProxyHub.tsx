import React, { useState } from 'react';
import { Shield, Globe, ArrowRight, Lock, ExternalLink } from 'lucide-react';

export default function ProxyHub() {
  const [targetUrl, setTargetUrl] = useState('');
  const [activeProxyUrl, setActiveProxyUrl] = useState('');

  // You can point this to your own hosted proxy server (e.g. Ultraviolet/Rammerhead) or a custom proxy worker
  const primaryProxyServer = 'https://uv.studentdirectory.app/service/'; 

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    let formattedUrl = targetUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    // Encodes or formats the URL for the proxy endpoint
    const proxied = `${primaryProxyServer}${encodeURIComponent(formattedUrl)}`;
    setActiveProxyUrl(proxied);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-white">
      {/* Proxy Navigation Header */}
      <div className="p-6 rounded-2xl bg-[#090A0F]/80 backdrop-blur-xl border border-[#9D4EDD]/30 shadow-xl shadow-[#9D4EDD]/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 text-[#9D4EDD]">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide text-[#9D4EDD]">MathSpot Secure Proxy</h2>
            <p className="text-xs text-gray-400">Encrypted Web Browser • Bypass Network Restrictions</p>
          </div>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleLaunch} className="relative flex items-center">
          <Globe className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter URL to browse securely (e.g., wikipedia.org)..."
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full pl-12 pr-32 py-3 rounded-xl bg-black/60 border border-gray-800 text-white placeholder-gray-500 focus:border-[#9D4EDD] focus:outline-none focus:ring-1 focus:ring-[#9D4EDD] transition-all text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-1.5 bg-[#9D4EDD] hover:bg-[#8035cb] text-black font-semibold text-xs rounded-lg transition-all flex items-center gap-1"
          >
            Launch <ArrowRight className="w-3 h-3" />
          </button>
        </form>
      </div>

      {/* Embed Frame / Proxy Screen */}
      <div className="p-6 rounded-2xl bg-[#090A0F]/80 backdrop-blur-xl border border-[#9D4EDD]/30 shadow-xl shadow-[#9D4EDD]/10 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="w-4 h-4 text-[#9D4EDD]" />
            <span>Proxy Status: {activeProxyUrl ? 'Active' : 'Standby'}</span>
          </div>
          {activeProxyUrl && (
            <a
              href={activeProxyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#9D4EDD] hover:underline flex items-center gap-1"
            >
              Open in Full Tab <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#9D4EDD]/20 bg-black/90 flex items-center justify-center">
          {activeProxyUrl ? (
            <iframe
              src={activeProxyUrl}
              title="Web Proxy View"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="text-center p-8 space-y-2">
              <Globe className="w-12 h-12 text-[#9D4EDD]/40 mx-auto" />
              <p className="text-sm font-medium text-gray-300">No active proxy session</p>
              <p className="text-xs text-gray-500">Enter a website URL above to start browsing securely.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}