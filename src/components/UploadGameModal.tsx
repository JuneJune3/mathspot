import { useState } from "react";
import { Upload, X, CheckCircle, FileArchive, Globe, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Member game submission. Files are uploaded to private storage under the
// member's own folder; the record then waits in the admin queue.

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPTED = ".zip,.html,.htm";
const CATEGORIES = ["Action", "Puzzle", "Shooter", "Sports", "Multiplayer", "Casual", "Racing", "Strategy", "Arcade"];

export type Submission = {
  title: string;
  category: string;
  description: string;
  kind: "url" | "file";
  gameUrl?: string | undefined;
  filePath?: string | undefined;
  fileName?: string | undefined;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: Submission) => Promise<void>;
};

export default function UploadGameModal({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Action");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"url" | "file">("file");
  const [gameUrl, setGameUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setTitle("");
    setCategory("Action");
    setDescription("");
    setGameUrl("");
    setFile(null);
    setError("");
    setStep("");
    setDone(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Give the game a title.");
      return;
    }
    if (kind === "url" && !gameUrl.trim()) {
      setError("Add a playable link.");
      return;
    }
    if (kind === "file" && !file) {
      setError("Choose the game file to upload.");
      return;
    }
    if (file && file.size > MAX_BYTES) {
      setError("That file is over the 25 MB limit.");
      return;
    }

    setBusy(true);
    try {
      let filePath: string | undefined;
      if (kind === "file" && file) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sign in before uploading a game file.");
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "game.html";
        setStep("Uploading your file…");
        const path = `${user.id}/${crypto.randomUUID()}-${safe}`;
        const { error: uploadError } = await supabase.storage
          .from("game-files")
          .upload(path, file, { contentType: /\.zip$/i.test(file.name) ? "application/zip" : "text/html", upsert: false });
        if (uploadError) throw new Error(uploadError.message || "The upload failed.");
        filePath = path;
      }
      setStep("Sending it for review…");
      await onSubmit({
        title: title.trim(),
        category,
        description: description.trim(),
        kind,
        ...(gameUrl.trim() ? { gameUrl: gameUrl.trim() } : {}),
        ...(filePath ? { filePath, fileName: file?.name ?? "game file" } : {}),
      });
      setDone(true);
      setTimeout(() => {
        reset();
        onClose();
      }, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const card = "bg-site-import-background border border-site-import-card rounded-[.75rem] px-3 py-2 text-site-import-foreground text-[13px] outline-none focus:border-site-import-foreground w-full";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Submit a game"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[1rem] bg-site-import-background border border-site-import-card p-6 text-site-import-foreground shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-site-import-card">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            <h3 className="text-[16px] font-semibold">Submit a browser game</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-site-import-muted-foreground hover:text-site-import-foreground hover:bg-site-import-card cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle className="w-12 h-12 mx-auto" />
            <h4 className="text-[18px] font-semibold">Sent for review</h4>
            <p className="text-[13px] text-site-import-muted-foreground">
              An admin will check it. Approved games appear in the catalog.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-site-import-muted-foreground mb-1" htmlFor="game-title">
                Game title
              </label>
              <input id="game-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Retro Space Blaster" className={card} />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-site-import-muted-foreground mb-1" htmlFor="game-category">
                Category
              </label>
              <select id="game-category" value={category} onChange={(e) => setCategory(e.target.value)} className={card}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 p-1 bg-black rounded-[.75rem] border border-site-import-card">
              <button
                type="button"
                onClick={() => setKind("file")}
                aria-pressed={kind === "file"}
                className={`flex-1 py-1.5 text-[12px] font-semibold rounded flex items-center justify-center gap-2 cursor-pointer ${kind === "file" ? "bg-site-import-primary text-site-import-primary-foreground" : "text-site-import-muted-foreground hover:text-site-import-foreground"}`}
              >
                <FileArchive className="w-3.5 h-3.5" /> HTML / ZIP file
              </button>
              <button
                type="button"
                onClick={() => setKind("url")}
                aria-pressed={kind === "url"}
                className={`flex-1 py-1.5 text-[12px] font-semibold rounded flex items-center justify-center gap-2 cursor-pointer ${kind === "url" ? "bg-site-import-primary text-site-import-primary-foreground" : "text-site-import-muted-foreground hover:text-site-import-foreground"}`}
              >
                <Globe className="w-3.5 h-3.5" /> Web link
              </button>
            </div>

            {kind === "file" ? (
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-site-import-muted-foreground mb-1" htmlFor="game-file">
                  Game file (.zip or .html, up to 25 MB)
                </label>
                <input
                  id="game-file"
                  type="file"
                  accept={ACCEPTED}
                  required
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-[12px] text-site-import-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-site-import-primary file:text-site-import-primary-foreground hover:file:opacity-90 cursor-pointer"
                />
                {file && <p className="text-[11px] text-site-import-muted-foreground mt-1 mb-0">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
              </div>
            ) : (
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-site-import-muted-foreground mb-1" htmlFor="game-url">
                  Playable link
                </label>
                <input id="game-url" type="url" required value={gameUrl} onChange={(e) => setGameUrl(e.target.value)} placeholder="https://example.com/game" className={card} />
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-site-import-muted-foreground mb-1" htmlFor="game-desc">
                Short description
              </label>
              <textarea id="game-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="How do you play it?" className={card + " resize-none"} />
            </div>

            <p className="text-[11px] text-site-import-muted-foreground">
              Everything is checked by an admin before it reaches the catalog.
            </p>

            {error && <p role="alert" className="text-destructive text-[12px] m-0">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-[.75rem] bg-site-import-primary text-site-import-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {busy ? <LoaderCircle className="browser-loading w-4 h-4" /> : null}
              {busy ? (step || "Working…") : "Send for review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
