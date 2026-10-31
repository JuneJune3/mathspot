import React, { useState, useEffect } from 'react';

export function PanicEscape() {
  const [panicUrl, setPanicUrl] = useState(
    () => localStorage.getItem('mathspot_panic_url') || 'https://classroom.google.com'
  );
  const [panicKey, setPanicKey] = useState(
    () => localStorage.getItem('mathspot_panic_key') || 'Escape'
  );

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === panicKey) {
        e.preventDefault();
        window.location.replace(panicUrl);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey, panicUrl]);

  // Handler for setting a new hotkey input
  const handleKeyCapture = (e) => {
    e.preventDefault();
    const capturedKey = e.key;
    setPanicKey(capturedKey);
    localStorage.setItem('mathspot_panic_key', capturedKey);
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setPanicUrl(newUrl);
    localStorage.setItem('mathspot_panic_url', newUrl);
  };

  return (
    <div className="p-4 rounded-xl bg-[#090A0F]/80 border border-[#9D4EDD]/30 backdrop-blur-md text-white space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-[#9D4EDD]">Quick Panic Escape</h3>
        <span className="text-xs text-gray-400">Active Listener</span>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Target Redirect URL</label>
          <input
            type="url"
            value={panicUrl}
            onChange={handleUrlChange}
            placeholder="https://classroom.google.com"
            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white focus:outline-none focus:border-[#9D4EDD]"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Trigger Key (Click box & press key)</label>
          <input
            type="text"
            value={panicKey}
            onKeyDown={handleKeyCapture}
            readOnly
            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-[#9D4EDD] font-mono text-center cursor-pointer focus:outline-none focus:border-[#9D4EDD]"
          />
        </div>
      </div>
    </div>
  );
}