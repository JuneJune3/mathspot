import React, { useState } from 'react';

export default function LinkGenerator() {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationUrl) return;

    // This points to your Cloudflare Worker redirection endpoint
    const workerDomain = 'https://your-worker.workers.dev';
    const slug = customAlias || Math.random().toString(36).substring(2, 8);
    const finalLink = `${workerDomain}/${slug}`;

    setGeneratedLink(finalLink);
    // Optional: Here you would also send { slug, destinationUrl } to your Cloudflare Worker KV storage to save it!
  };

  return (
    <div className="p-6 rounded-xl bg-[#090A0F] border border-[#9D4EDD]/30 shadow-lg shadow-[#9D4EDD]/10 text-white">
      <h3 className="text-xl font-bold mb-4 text-[#9D4EDD]">Link Generator</h3>
      
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Destination URL</label>
          <input 
            type="url" 
            placeholder="https://example.com/resource" 
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 focus:border-[#9D4EDD] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Custom Slug / Code (Optional)</label>
          <input 
            type="text" 
            placeholder="my-cool-link" 
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 focus:border-[#9D4EDD] focus:outline-none"
          />
        </div>

        <button 
          type="submit"
          className="w-full py-2 px-4 bg-[#9D4EDD] hover:bg-[#8035cb] text-black font-semibold rounded-lg transition-colors"
        >
          Generate Link
        </button>
      </form>

      {generatedLink && (
        <div className="mt-6 p-4 rounded-lg bg-black/80 border border-[#9D4EDD]/50 flex items-center justify-between">
          <span className="text-sm text-purple-300 truncate mr-2">{generatedLink}</span>
          <button 
            onClick={() => navigator.clipboard.writeText(generatedLink)}
            className="px-3 py-1 bg-[#9D4EDD]/20 hover:bg-[#9D4EDD]/40 text-[#9D4EDD] text-xs font-semibold rounded border border-[#9D4EDD]/40"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}