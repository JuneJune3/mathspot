import React, { useState, useEffect } from 'react';

// Free multi-server endpoints accepting TMDB/IMDb IDs
const STREAM_SERVERS = [
  { 
    id: 'vidsrc_mov', 
    name: 'Server 1 (VidSrc Mov)', 
    getUrl: (id, type, s, e) => type === 'tv' 
      ? `https://vidsrc.mov/embed/tv/${id}/${s}/${e}` 
      : `https://vidsrc.mov/embed/movie/${id}` 
  },
  { 
    id: 'vidsrc_xyz', 
    name: 'Server 2 (VidSrc XYZ)', 
    getUrl: (id, type, s, e) => type === 'tv' 
      ? `https://vidsrc.xyz/embed/tv?imdb=${id}&season=${s}&episode=${e}` 
      : `https://vidsrc.xyz/embed/movie?imdb=${id}` 
  },
  { 
    id: 'vidsrc_top', 
    name: 'Server 3 (VidSrc Top)', 
    getUrl: (id, type, s, e) => type === 'tv' 
      ? `https://vid-src.top/embed/tv/${id}/${s}/${e}` 
      : `https://vid-src.top/embed/movie/${id}` 
  }
];

export function MovieHub() {
  const [activeTab, setActiveTab] = useState('movie'); // 'movie', 'tv', 'anime'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);
  const [currentServer, setCurrentServer] = useState(STREAM_SERVERS[0]);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  // TMDB Read-Only Demo Key for metadata search
  const TMDB_KEY = '15d2dde73f4ee803f22b923f05354063';

  useEffect(() => {
    const searchInfiniteCatalog = async () => {
      setLoading(true);
      try {
        if (activeTab === 'anime') {
          // Fetch from MyAnimeList / Jikan API
          const endpoint = query
            ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24`
            : `https://api.jikan.moe/v4/top/anime?limit=24`;

          const res = await fetch(endpoint);
          const data = await res.json();
          const items = (data.data || []).map((anime) => ({
            id: anime.mal_id,
            title: anime.title_english || anime.title,
            year: anime.year || '2024',
            poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
            type: 'tv',
            episodes: anime.episodes || 1
          }));
          setResults(items);
        } else {
          // Fetch Live Movies/TV from TMDB API
          const endpoint = query
            ? `https://api.themoviedb.org/3/search/${activeTab}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
            : `https://api.themoviedb.org/3/${activeTab}/popular?api_key=${TMDB_KEY}`;

          const res = await fetch(endpoint);
          const data = await res.json();
          const items = (data.results || []).map((item) => ({
            id: item.id,
            title: item.title || item.name,
            year: (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A',
            poster: item.poster_path 
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
              : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500',
            type: activeTab
          }));
          setResults(items);
        }
      } catch (err) {
        console.error('Catalog Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchInfiniteCatalog, 300);
    return () => clearTimeout(debounceTimer);
  }, [activeTab, query]);

  const activeUrl = activeMedia
    ? currentServer.getUrl(activeMedia.id, activeMedia.type, season, episode)
    : '';

  return (
    <div className="p-6 rounded-2xl bg-[#090A0F]/90 border border-[#9D4EDD]/30 backdrop-blur-md space-y-6 text-white shadow-2xl">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-md font-semibold text-[#9D4EDD]">MathSpot Universal Media Hub</h2>
          <p className="text-xs text-gray-400">Search and stream any movie, TV series, or anime worldwide.</p>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search millions of titles..."
          className="px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#9D4EDD] w-full md:w-80 shadow-inner"
        />
      </div>

      {/* Media Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'movie', label: '🎬 Movies' },
          { id: 'tv', label: '📺 TV Series' },
          { id: 'anime', label: '⚡ Anime' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setQuery(''); setActiveMedia(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === tab.id
                ? 'bg-[#9D4EDD]/20 border-[#9D4EDD] text-white shadow-lg'
                : 'bg-black/40 border-white/5 text-gray-400 hover:bg-black/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stream Viewport */}
      {activeMedia ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-black/60 p-3.5 rounded-xl border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">{activeMedia.title}</p>
              <p className="text-[10px] text-[#9D4EDD] font-mono">TMDB/ID: {activeMedia.id}</p>
            </div>

            {/* Season/Episode Selectors */}
            {activeMedia.type !== 'movie' && (
              <div className="flex items-center gap-2 text-xs">
                <label className="text-gray-400">Season:</label>
                <input
                  type="number"
                  min={1}
                  value={season}
                  onChange={(e) => setSeason(Number(e.target.value))}
                  className="w-12 bg-black border border-white/10 rounded px-2 py-1 text-center"
                />
                <label className="text-gray-400">Episode:</label>
                <input
                  type="number"
                  min={1}
                  value={episode}
                  onChange={(e) => setEpisode(Number(e.target.value))}
                  className="w-12 bg-black border border-white/10 rounded px-2 py-1 text-center"
                />
              </div>
            )}

            {/* Failover Servers & Close */}
            <div className="flex items-center gap-2">
              <select
                value={currentServer.id}
                onChange={(e) => setCurrentServer(STREAM_SERVERS.find((s) => s.id === e.target.value))}
                className="bg-black border border-white/10 text-xs text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#9D4EDD]"
              >
                {STREAM_SERVERS.map((server) => (
                  <option key={server.id} value={server.id}>{server.name}</option>
                ))}
              </select>

              <button
                onClick={() => setActiveMedia(null)}
                className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs transition-colors border border-red-500/30 font-bold"
              >
                Close ✕
              </button>
            </div>
          </div>

          <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-white/10 bg-black">
            <iframe
              src={activeUrl}
              title="Universal Stream Player"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        /* Dynamic Catalog Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="col-span-full py-16 text-center text-xs text-gray-400 animate-pulse">Searching global databases...</div>
          ) : results.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-gray-400">No results found for your search.</div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveMedia(item)}
                className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-[#9D4EDD] cursor-pointer transition-all bg-black/40 flex flex-col"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100"
                  />
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[#9D4EDD]">
                    {item.type.toUpperCase()}
                  </span>
                </div>
                <div className="p-2.5 bg-black/80 flex flex-col justify-between flex-1">
                  <p className="text-xs font-medium text-white truncate">{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-400">{item.year}</span>
                    <span className="text-[10px] text-[#9D4EDD] font-semibold">Watch ▶</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MovieHub;