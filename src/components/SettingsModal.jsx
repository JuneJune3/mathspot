import React, { useState } from 'react';
import { TabCloakSettings } from './TabCloakSettings';
import { PanicEscape } from './PanicEscape';

export function SettingsModal({ isOpen, onClose }) {
  const [useCloudKernel, setUseCloudKernel] = useState(
    () => localStorage.getItem('mathspot_use_cloud_kernel') === 'true'
  );
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('mathspot_kernel_api_key') || ''
  );

  const handleKernelToggle = (val) => {
    setUseCloudKernel(val);
    localStorage.setItem('mathspot_use_cloud_kernel', val);
  };

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    localStorage.setItem('mathspot_kernel_api_key', val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#090A0F] border border-[#9D4EDD]/30 p-6 shadow-2xl space-y-6 text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-[#9D4EDD]">MathSpot Settings</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Browser Kernel / Steel.dev Integration Settings */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Cloud Browser Kernel (Steel.dev / Hyperbrowser)</h3>
              <p className="text-xs text-gray-400">Route complex proxy sessions through headless cloud runners.</p>
            </div>
            <input
              type="checkbox"
              checked={useCloudKernel}
              onChange={(e) => handleKernelToggle(e.target.checked)}
              className="w-4 h-4 accent-[#9D4EDD] cursor-pointer"
            />
          </div>

          {useCloudKernel && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kernel API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Enter your Steel.dev / Hyperbrowser API key"
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#9D4EDD]"
              />
            </div>
          )}
        </div>

        {/* Tab Cloaking Settings Component */}
        <TabCloakSettings />

        {/* Panic Escape Settings Component */}
        <PanicEscape />

      </div>
    </div>
  );
}