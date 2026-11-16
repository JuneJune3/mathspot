import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Search, UserPlus, UserCheck, Send, PlusCircle, Video, User } from 'lucide-react';

interface Post {
  id: string;
  creator: string;
  avatar: string;
  caption: string;
  videoUrl: string;
  likes: number;
  likedByMe: boolean;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export const PulseFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'profile'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  
  // LocalStorage-backed state for zero-backend persistence
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('mathspot_pulse_posts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        creator: '@math_wizard',
        avatar: '🧙‍♂️',
        caption: 'Bypassing lag on school Chromebooks with clean Vite builds ⚡',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-coder-working-on-his-computer-42861-large.mp4',
        likes: 24,
        likedByMe: false,
      },
      {
        id: '2',
        creator: '@proxy_master',
        avatar: '🛡️',
        caption: 'New proxy nodes loaded into MathSpot. Test them out!',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31910-large.mp4',
        likes: 42,
        likedByMe: true,
      },
    ];
  });

  const [following, setFollowing] = useState<string[]>(() => {
    const saved = localStorage.getItem('mathspot_pulse_following');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('mathspot_pulse_messages');
    return saved ? JSON.parse(saved) : [
      { id: '1', sender: '@math_wizard', text: 'Hey! Check out the new proxy update.', timestamp: '10:42 AM' }
    ];
  });

  const [newMessage, setNewMessage] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');

  // Persist states
  useEffect(() => {
    localStorage.setItem('mathspot_pulse_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('mathspot_pulse_following', JSON.stringify(following));
  }, [following]);

  useEffect(() => {
    localStorage.setItem('mathspot_pulse_messages', JSON.stringify(messages));
  }, [messages]);

  const toggleLike = (id: string) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
          likedByMe: !p.likedByMe
        };
      }
      return p;
    }));
  };

  const toggleFollow = (creator: string) => {
    if (following.includes(creator)) {
      setFollowing(following.filter(f => f !== creator));
    } else {
      setFollowing([...following, creator]);
    }
  };

  const handlePostVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl || !newCaption) return;

    const newPost: Post = {
      id: Date.now().toString(),
      creator: '@you',
      avatar: '😎',
      caption: newCaption,
      videoUrl: newVideoUrl,
      likes: 0,
      likedByMe: false,
    };

    setPosts([newPost, ...posts]);
    setNewVideoUrl('');
    setNewCaption('');
    setActiveTab('feed');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      sender: '@you',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const filteredPosts = posts.filter(p => 
    p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-5rem)] w-full max-w-lg mx-auto bg-[#090A0F] text-white border border-[#9D4EDD]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-md border-b border-[#9D4EDD]/20 z-20">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('feed')} 
            className={`font-bold text-sm transition-colors ${activeTab === 'feed' ? 'text-[#9D4EDD] border-b-2 border-[#9D4EDD]' : 'text-zinc-400 hover:text-white'}`}
          >
            Pulse Feed
          </button>
          <button 
            onClick={() => setActiveTab('messages')} 
            className={`font-bold text-sm transition-colors ${activeTab === 'messages' ? 'text-[#9D4EDD] border-b-2 border-[#9D4EDD]' : 'text-zinc-400 hover:text-white'}`}
          >
            DMs ({messages.length})
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`font-bold text-sm transition-colors ${activeTab === 'profile' ? 'text-[#9D4EDD] border-b-2 border-[#9D4EDD]' : 'text-zinc-400 hover:text-white'}`}
          >
            Post / Profile
          </button>
        </div>
      </div>

      {/* TAB 1: FEED + SEARCH */}
      {activeTab === 'feed' && (
        <div className="flex-1 overflow-y-scroll snap-y snap-mandatory relative scrollbar-none">
          
          {/* Search bar overlay */}
          <div className="sticky top-2 z-30 px-4 mb-2">
            <div className="flex items-center bg-black/80 backdrop-blur-md border border-[#9D4EDD]/40 rounded-full px-4 py-2 shadow-lg">
              <Search className="w-4 h-4 text-[#9D4EDD] mr-2" />
              <input 
                type="text" 
                placeholder="Search tags or creators..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full outline-none text-white placeholder-zinc-500"
              />
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 text-sm">
              No clips found. Try posting one!
            </div>
          ) : (
            filteredPosts.map(post => {
              const isFollowing = following.includes(post.creator);
              return (
                <div key={post.id} className="h-full w-full snap-start relative flex items-center justify-center bg-black/30 border-b border-zinc-900">
                  {/* Lightweight Video Player */}
                  <video
                    src={post.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none" />

                  {/* Right Action Bar */}
                  <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-10">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className="flex flex-col items-center group active:scale-90 transition-transform"
                    >
                      <div className={`p-3 rounded-full backdrop-blur-md ${post.likedByMe ? 'bg-[#9D4EDD] text-white' : 'bg-black/50 text-white'}`}>
                        <Heart className={`w-5 h-5 ${post.likedByMe ? 'fill-white' : ''}`} />
                      </div>
                      <span className="text-xs font-medium mt-1">{post.likes}</span>
                    </button>

                    {post.creator !== '@you' && (
                      <button 
                        onClick={() => toggleFollow(post.creator)}
                        className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-[#9D4EDD] transition-colors"
                      >
                        {isFollowing ? <UserCheck className="w-5 h-5 text-[#9D4EDD]" /> : <UserPlus className="w-5 h-5" />}
                      </button>
                    )}
                  </div>

                  {/* Bottom Caption Info */}
                  <div className="absolute left-4 bottom-6 right-16 z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{post.avatar}</span>
                      <span className="font-bold text-sm text-white">{post.creator}</span>
                    </div>
                    <p className="text-xs text-zinc-200 line-clamp-2">{post.caption}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: DICARECT MESSAGES (DMs) */}
      {activeTab === 'messages' && (
        <div className="flex-1 flex flex-col p-4 justify-between bg-[#090A0F]">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <div className="text-xs text-zinc-500 text-center mb-2">Local Encrypted Chat Session</div>
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === '@you' ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-zinc-500 mb-0.5">{msg.sender}</span>
                <div className={`px-4 py-2 rounded-xl text-xs max-w-[80%] ${msg.sender === '@you' ? 'bg-[#9D4EDD] text-white' : 'bg-zinc-800 text-zinc-200'}`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-zinc-600 mt-0.5">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 mt-3 pt-2 border-t border-zinc-800">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#9D4EDD]"
            />
            <button type="submit" className="bg-[#9D4EDD] hover:bg-[#8032cb] p-2 rounded-lg text-white transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PROFILE & UPLOADER */}
      {activeTab === 'profile' && (
        <div className="flex-1 p-6 overflow-y-auto bg-[#090A0F]">
          <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-[#9D4EDD]/20 border border-[#9D4EDD] flex items-center justify-center text-2xl mb-2">
              😎
            </div>
            <h2 className="font-bold text-base">@you</h2>
            <div className="flex gap-6 mt-3 text-xs text-zinc-400">
              <div><strong className="text-white">{following.length}</strong> Following</div>
              <div><strong className="text-white">{posts.filter(p => p.creator === '@you').length}</strong> Posts</div>
            </div>
          </div>

          <form onSubmit={handlePostVideo} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9D4EDD]">Post New Clip</h3>
            
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Video URL (.mp4 link)</label>
              <input 
                type="url" 
                placeholder="https://example.com/video.mp4" 
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#9D4EDD]"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Caption / Tags</label>
              <textarea 
                placeholder="What's this video about? #mathspot" 
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#9D4EDD] h-20 resize-none"
                required
              />
            </div>

            <button type="submit" className="w-full bg-[#9D4EDD] hover:bg-[#8032cb] py-2.5 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Publish Clip
            </button>
          </form>
        </div>
      )}

    </div>
  );
};