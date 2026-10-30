import React, { useState } from 'react';
import { Film, Play, Tv, Sparkles, Search } from 'lucide-react';

export default function T9FlixHub() {
  const [activeMedia, setActiveMedia] = useState('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'); // Placeholder stream or trailer
  const [mediaTitle, setMediaTitle] = useState('Select a title or category below');

  // Sample categories or media items you can customize
  const mediaList = [
    { title: 'Free Movie Stream 1', type: 'Movie', id: 'dQw4w9WgXcQ', desc: 'Curated public domain or educational feature film.' },
    { title: 'Sci-Fi Short Animation', type: 'Short Film', id: 'geos_qlvZKs', desc: 'Stunning zero-budget independent sci-fi project.' },
    { title: 'Lofi Cinematic Chill', type: 'Ambient', id: 'jfKfPfyJRdk', desc: 'Relaxing ambient visualizer and background media.' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-white">
      {/* T9Flix Header */}
      <div className="p-6 rounded-2xl bg-[#090A0F]/80 backdrop-blur-xl border border-[#9D4EDD]/30 shadow-xl shadow-[#9D4EDD]/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 text-[#9D4EDD]">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide text-[#9D4EDD]">T9Flix Hub</h2>
            <p className="text-xs text-gray-400">Stream curated media • Zero sign-ups • Ad-free experience</p>
          </div>
        </div>
      </div>

      {/* Main Video Player Screen */}
      <div className="p-6 rounded-2xl bg-[#090A0F]/80 backdrop-blur-xl border border-[#9D4EDD]/30 shadow-xl shadow-[#9D4EDD]/10 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-[#9D4EDD]" />
            {mediaTitle}
          </h3>
          <span className="text-xs px-2.5 py-1 rounded bg-[#9D4EDD]/20 text-[#9D4EDD] border border-[#9D4EDD]/40 font-semibold">
            HD Stream
          </span>
        </div>

        {/* Video Embed Frame */}
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#9D4EDD]/20 bg-black shadow-inner">
          <iframe
            src={activeMedia}
            title="T9Flix Player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Media Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mediaList.map((item, idx) => (
          <div 
            key={idx}
            onClick={() => {
              setActiveMedia(`https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1`);
              setMediaTitle(item.title);
            }}
            className="p-4 rounded-xl bg-[#090A0F]/60 border border-gray-800 hover:border-[#9D4EDD] transition-all cursor-pointer group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#9D4EDD] bg-[#9D4EDD]/10 px-2 py-0.5 rounded border border-[#9D4EDD]/30">
                {item.type}
              </span>
              <Tv className="w-4 h-4 text-gray-500 group-hover:text-[#9D4EDD] transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-[#9D4EDD] transition-colors">
              {item.title}
            </h4>
            <p className="text-xs text-gray-400 line-clamp-2">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}