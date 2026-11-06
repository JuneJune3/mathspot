import React, { useState } from 'react';
import { Search, Music, Radio, Disc, Sparkles } from 'lucide-react';

export default function MusicPlayer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState('jfKfPfyJRdk'); // Default Lofi Girl stream
  const [currentTitle, setCurrentTitle] = useState('Lofi Hip Hop Radio - Beats to Relax/Study to');
  const [showVideo, setShowVideo] = useState(false);

  const presets = [
    { name: 'Lofi Study', id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio' },
    { name: 'Synthwave', id: '4xDzrJKXOOY', title: 'Synthwave / Chillwave Radio' },
    { name: 'Chillhop', id: '5wRWniH7WDA', title: 'Chillhop Radio - Jazzy Beats' },
    { name: 'Gaming Beats', id: 'TURbeWK2wwg', title: 'Gaming Music - Chilled Ambient' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    // Check if user pasted a YouTube link or video ID
    if (searchQuery.includes('v=')) {
      const id = searchQuery.split('v=')[1]?.split('&')[0] ?? '';
      setCurrentVideoId(id);
      setCurrentTitle('Custom YouTube Audio Stream');
    } else if (searchQuery.includes('youtu.be/')) {
      const id = searchQuery.split('youtu.be/')[1]?.split('?')[0] ?? '';
      setCurrentVideoId(id);
      setCurrentTitle('Custom YouTube Audio Stream');
    } else {
      // If it's a raw search term, use YouTube search embed query
      setCurrentVideoId(`select?listType=search&list=${encodeURIComponent(searchQuery)}`);
      setCurrentTitle(`Search Results: "${searchQuery}"`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-white">
      {/* Search Header */}
      <div className="p-6 rounded-2xl bg-[#090A0F]/80 backdrop-blur-xl border border-[#E5E5E5]/30 shadow-xl shadow-[#E5E5E5]/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E5E5E5]/20 border border-[#E5E5E5]/40 text-[#E5E5E5]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">MathSpot Music Hub</h2>
              <p className="text-xs text-gray-400">Ad-free streaming • Zero logins required</p>
            </div>
          </div>
          
          {/* Toggle Video/Audio View */}
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E5E5]/40 bg-[#E5E5E5]/10 text-[#E5E5E5] hover:bg-[#E5E5E5]/20 transition-all"
          >
            {showVideo ? 'Hide Video Screen' : 'Show Video Screen'}
          </button>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search song title, artist, or paste YouTube link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3 rounded-xl bg-black/60 border border-gray-800 text-white placeholder-gray-500 focus:border-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#E5E5E5] transition-all text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-1.5 bg-[#E5E5E5] hover:bg-[#8035cb] text-black font-semibold text-xs rounded-lg transition-all"
          >
            Play Stream
          </button>
        </form>

        {/* Preset Quick Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setCurrentVideoId(preset.id);
                setCurrentTitle(preset.title);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                currentVideoId === preset.id
                  ? 'border-[#E5E5E5] bg-[#E5E5E5]/20 text-white font-medium shadow-sm shadow-[#E5E5E5]/30'
                  : 'border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#E5E5E5]" />
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Music Player Card */}
      <div className="p-6 rounded-2xl bg-[#090A0F]/80 backdrop-blur-xl border border-[#E5E5E5]/30 shadow-xl shadow-[#E5E5E5]/10 space-y-6">
        {/* Now Playing Bar */}
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <Disc className="w-8 h-8 text-[#E5E5E5] animate-spin" style={{ animationDuration: '4s' }} />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#E5E5E5] font-semibold">Now Playing</span>
              <h3 className="text-base font-bold text-white truncate max-w-md">{currentTitle}</h3>
            </div>
          </div>
          
          {/* Animated Equalizer Visualizer */}
          <div className="flex items-end gap-1 h-6">
            <span className="w-1 bg-[#E5E5E5] animate-pulse h-full rounded-full"></span>
            <span className="w-1 bg-[#E5E5E5] animate-pulse h-2/3 rounded-full" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 bg-[#E5E5E5] animate-pulse h-4/5 rounded-full" style={{ animationDelay: '0.4s' }}></span>
            <span className="w-1 bg-[#E5E5E5] animate-pulse h-1/2 rounded-full" style={{ animationDelay: '0.1s' }}></span>
          </div>
        </div>

        {/* Player Window */}
        <div className={`w-full transition-all duration-300 rounded-xl overflow-hidden border border-[#E5E5E5]/20 bg-black ${
          showVideo ? 'aspect-video' : 'h-24'
        }`}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&modestbranding=1&rel=0&controls=1`}
            title="Music Stream"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}