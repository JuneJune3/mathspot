import React, { useState, useEffect } from 'react';

// 1. Preset list with real titles and official platform favicons
const CLOAKING_PRESETS = [
  { id: 'default', name: 'MathSpot (Default)', title: 'MathSpot', icon: '/favicon.ico' },
  { id: 'google_classroom', name: 'Google Classroom', title: 'Classes', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
  { id: 'clever', name: 'Clever', title: 'Clever | Portal', icon: 'https://assets.clever.com/assets/p-clever-favicon.ico' },
  { id: 'canvas', name: 'Canvas', title: 'Dashboard', icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
  { id: 'edpuzzle', name: 'Edpuzzle', title: 'Edpuzzle', icon: 'https://edpuzzle.imgix.net/edpuzzle-logo-icon.png' },
  { id: 'schoology', name: 'Schoology', title: 'Home | Schoology', icon: 'https://www.schoology.com/sites/default/files/favicon.ico' },
  { id: 'iready', name: 'i-Ready', title: 'i-Ready', icon: 'https://login.i-ready.com/favicon.ico' },
  { id: 'ixl', name: 'IXL Learning', title: 'IXL | Dashboard', icon: 'https://www.ixl.com/favicon.ico' },
  { id: 'khan', name: 'Khan Academy', title: 'Dashboard | Khan Academy', icon: 'https://www.khanacademy.org/favicon.ico' },
  { id: 'kahoot', name: 'Kahoot!', title: 'Enter Game PIN - Kahoot!', icon: 'https://kahoot.it/favicon.ico' },
  { id: 'blooket', name: 'Blooket', title: 'Blooket', icon: 'https://www.blooket.com/favicon.ico' },
  { id: 'seesaw', name: 'Seesaw', title: 'Seesaw', icon: 'https://web.seesaw.me/favicon.ico' },
  { id: 'nearpod', name: 'Nearpod', title: 'Nearpod', icon: 'https://nearpod.com/favicon.ico' },
  { id: 'newsela', name: 'Newsela', title: 'Newsela | Instructional Content Platform', icon: 'https://newsela.com/favicon.ico' },
  { id: 'epic', name: 'Epic!', title: 'Epic | Kids\' Books & Reading', icon: 'https://www.getepic.com/favicon.ico' },
  { id: 'brainpop', name: 'BrainPOP', title: 'BrainPOP', icon: 'https://www.brainpop.com/favicon.ico' },
  { id: 'mobymax', name: 'MobyMax', title: 'MobyMax', icon: 'https://www.mobymax.com/favicon.ico' },
  { id: 'freckle', name: 'Freckle', title: 'Freckle Student Dashboard', icon: 'https://student.freckle.com/favicon.ico' },
  { id: 'dreambox', name: 'DreamBox', title: 'DreamBox Learning', icon: 'https://play.dreambox.com/favicon.ico' },
];

export function TabCloakSettings() {
  const [activePreset, setActivePreset] = useState(
    () => localStorage.getItem('mathspot_cloak_preset') || 'default'
  );
  const [customTitle, setCustomTitle] = useState(
    () => localStorage.getItem('mathspot_cloak_title') || ''
  );
  const [customIcon, setCustomIcon] = useState(
    () => localStorage.getItem('mathspot_cloak_icon') || ''
  );

  // 2. Dynamic Tab & Favicon Updater
  useEffect(() => {
    let titleToApply = 'MathSpot';
    let iconToApply = '/favicon.ico';

    if (activePreset === 'custom') {
      titleToApply = customTitle || 'MathSpot';
      iconToApply = customIcon || '/favicon.ico';
    } else {
      const preset = CLOAKING_PRESETS.find((p) => p.id === activePreset);
      if (preset) {
        titleToApply = preset.title;
        iconToApply = preset.icon;
      }
    }

    // Update document title
    document.title = titleToApply;

    // Update favicon URL
    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(favicon);
    }
    favicon.href = iconToApply;
  }, [activePreset, customTitle, customIcon]);

  const handleSelectPreset = (id) => {
    setActivePreset(id);
    localStorage.setItem('mathspot_cloak_preset', id);
  };

  const handleCustomTitleChange = (val) => {
    setCustomTitle(val);
    localStorage.setItem('mathspot_cloak_title', val);
  };

  const handleCustomIconChange = (val) => {
    setCustomIcon(val);
    localStorage.setItem('mathspot_cloak_icon', val);
  };

  return (
    <div className="p-4 rounded-xl bg-[#090A0F]/80 border border-[#9D4EDD]/30 backdrop-blur-md text-white space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-[#9D4EDD]">Web Tab Cloaking</h3>
        <span className="text-xs text-gray-400">Presets & Custom</span>
      </div>

      {/* Grid of Preset Buttons with Logos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {CLOAKING_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-[#9D4EDD]/20 border-[#9D4EDD] text-white'
                  : 'bg-black/40 border-white/5 text-gray-300 hover:bg-black/60 hover:border-white/20'
              }`}
            >
              <img
                src={preset.icon}
                alt={preset.name}
                className="w-4 h-4 object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.src = '/favicon.ico';
                }}
              />
              <div className="truncate">
                <p className="text-xs font-medium truncate">{preset.name}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Option Button */}
      <button
        onClick={() => handleSelectPreset('custom')}
        className={`w-full text-center py-2 rounded-lg border text-xs font-medium transition-all ${
          activePreset === 'custom'
            ? 'bg-[#9D4EDD]/20 border-[#9D4EDD] text-white'
            : 'bg-black/40 border-white/5 text-gray-400 hover:bg-black/60'
        }`}
      >
        ✨ Use Custom Title & Favicon URL
      </button>

      {/* Inputs revealed only when Custom option is selected */}
      {activePreset === 'custom' && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Custom Tab Title</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => handleCustomTitleChange(e.target.value)}
              placeholder="e.g. Clever | Portal"
              className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#9D4EDD]"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Custom Favicon Image URL</label>
            <input
              type="url"
              value={customIcon}
              onChange={(e) => handleCustomIconChange(e.target.value)}
              placeholder="https://assets.clever.com/assets/p-clever-favicon.ico"
              className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#9D4EDD]"
            />
          </div>
        </div>
      )}
    </div>
  );
}