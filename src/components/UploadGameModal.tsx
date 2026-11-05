import React, { useState } from 'react';
import { Upload, X, CheckCircle, FileArchive, Globe } from 'lucide-react';

interface UploadGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gameData: {
    title: string;
    category: string;
    description: string;
    type: 'file' | 'url';
    gameUrl?: string | undefined;
    file?: File | undefined;
  }) => Promise<void>;
}

export default function UploadGameModal({ isOpen, onClose, onSubmit }: UploadGameModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Action');
  const [description, setDescription] = useState('');
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [gameUrl, setGameUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        category,
        description,
        type: uploadType,
        ...(gameUrl ? { gameUrl } : {}),
        ...(file ? { file } : {}),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch {
      alert('Error submitting game for review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#090A0F] border border-white/10 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold">Submit a Browser Game</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-white mx-auto animate-bounce" />
            <h4 className="text-xl font-bold">Game Submitted!</h4>
            <p className="text-sm text-white/60">Your submission has been sent to the admin queue for review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Game Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Retro Space Blaster"
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm focus:border-white focus:outline-none"
              >
                {['Action', 'Puzzle', 'Shooter', 'Sports', 'Multiplayer', 'Casual'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 p-1 bg-black rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setUploadType('url')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-2 ${
                  uploadType === 'url' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Web Link
              </button>
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-2 ${
                  uploadType === 'file' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <FileArchive className="w-3.5 h-3.5" /> HTML / ZIP File
              </button>
            </div>

            {uploadType === 'url' ? (
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Playable Link</label>
                <input
                  type="url"
                  required
                  value={gameUrl}
                  onChange={(e) => setGameUrl(e.target.value)}
                  placeholder="https://example.com/game"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm focus:border-white focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Upload File (.zip, .html)</label>
                <input
                  type="file"
                  accept=".zip,.html"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-white/60 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-white/90 cursor-pointer"
                />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-1">Short Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly explain the controls or game premise..."
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm focus:border-white focus:outline-none resize-none"
              />
            </div>

            <p className="text-[11px] text-white/40">
              Submissions undergo admin verification before appearing in the public catalog.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send for Admin Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
