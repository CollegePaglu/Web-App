"use client";
import { useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { postsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, X, ImagePlus } from "lucide-react";

type Category = "GOSSIPS" | "CONFESSION" | "MEMES" | "GENERAL";

const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string; placeholder: string }> = {
  GENERAL:     { label: "General",     emoji: "📝", color: "#3B82F6", placeholder: "What's on your mind? 💭" },
  GOSSIPS:     { label: "Gossips",     emoji: "🗣️", color: "#8B5CF6", placeholder: "Share the campus gossip… ☕" },
  CONFESSION:  { label: "Confessions", emoji: "🤫", color: "#EC4899", placeholder: "Confess anonymously… 🎭 No one will know it's you." },
  MEMES:       { label: "Memes",       emoji: "😂", color: "#F59E0B", placeholder: "Drop a meme or a funny take 😂" },
};

interface Props {
  onClose: () => void;
  initialCategory?: Category;
}

export default function CreatePostModal({ onClose, initialCategory = "GENERAL" }: Props) {
  const { user } = useAuthStore();
  const [category, setCategory] = useState<Category>(initialCategory);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(category === "CONFESSION");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = CATEGORY_META[category];
  const displayName = user?.displayName || user?.name || user?.username || "You";
  const avatar = user?.avatar;

  const switchCategory = (c: Category) => {
    setCategory(c);
    if (c === "CONFESSION") setIsAnonymous(true);
    else setIsAnonymous(false);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setMediaFiles(files);
    setMediaPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeMedia = (i: number) => {
    setMediaFiles((f) => f.filter((_, idx) => idx !== i));
    setMediaPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Write something or attach a photo first!");
      return;
    }
    setIsSubmitting(true);
    setUploadProgress(0);

    const progressTimer = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 12 : p));
    }, 200);

    try {
      const fd = new FormData();
      fd.append("content", content.trim());
      if (title.trim()) fd.append("title", title.trim());
      fd.append("type", mediaFiles.length > 0 ? "image" : "text");
      fd.append("category", category);
      fd.append("isAnonymous", String(isAnonymous));
      mediaFiles.forEach((f) => fd.append("media", f));

      const { data } = await postsApi.createPost(fd);
      setUploadProgress(100);
      
      const newPost = data.data;
      // Inject author info so it immediately renders correctly in the feed
      if (!newPost.author && !isAnonymous && user) {
        newPost.author = {
          _id: user._id || user.id,
          displayName: user.displayName,
          name: user.name,
          username: user.username,
          avatar: user.avatar
        };
      }

      // Dispatch a window event so only the matching FeedList sections update
      window.dispatchEvent(new CustomEvent("post-created", { detail: { post: newPost } }));
      
      // Also persist in sessionStorage so any FeedList that mounts later picks it up
      try {
        const pending = JSON.parse(sessionStorage.getItem("pendingPosts") || "[]");
        pending.unshift({ post: newPost, ts: Date.now() });
        sessionStorage.setItem("pendingPosts", JSON.stringify(pending.slice(0, 20)));
      } catch {}
      
      toast.success(`Posted to ${meta.label}! 🔥`);
      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to post");
    } finally {
      clearInterval(progressTimer);
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const canPost = (content.trim().length > 0 || mediaFiles.length > 0) && !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{
          background: "var(--cp-surface)",
          border: "1px solid var(--cp-border)",
          maxHeight: "92vh",
          animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Category Tabs */}
        <div className="flex gap-2 px-5 pt-4 pb-2">
          {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
            const m = CATEGORY_META[c];
            const isActive = c === category;
            return (
              <button
                key={c}
                onClick={() => switchCategory(c)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: isActive ? m.color + "20" : "var(--cp-surface-2)",
                  color: isActive ? m.color : "var(--cp-muted)",
                  border: `1.5px solid ${isActive ? m.color : "transparent"}`,
                }}
              >
                <span>{m.emoji}</span>
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--cp-border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)" }}
            >
              {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : displayName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>
                {isAnonymous ? "Anonymous 🎭" : displayName}
              </p>
              <button
                onClick={() => setIsAnonymous((v) => !v)}
                className="flex items-center gap-1 text-[10px] font-semibold transition-all mt-0.5"
                style={{ color: isAnonymous ? meta.color : "var(--cp-muted)" }}
              >
                {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                {isAnonymous ? "Posting anonymously" : "Post publicly"}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:opacity-70"
            style={{ color: "var(--cp-muted)", background: "var(--cp-surface-2)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-5 overflow-y-auto flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold outline-none"
            style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={meta.placeholder}
            rows={5}
            className="w-full px-3 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
            autoFocus
            maxLength={5000}
          />
          <p className="text-right text-[10px]" style={{ color: "var(--cp-muted)" }}>
            {content.length}/5000
          </p>

          {mediaPreviews.length > 0 && (
            <div className={`grid gap-2 rounded-xl overflow-hidden ${mediaPreviews.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {mediaPreviews.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: mediaPreviews.length === 1 ? "16/9" : "1" }}>
                  <img src={src} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: "rgba(0,0,0,0.65)" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {isSubmitting && (
          <div className="px-5 pb-2">
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--cp-surface-2)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%`, background: meta.color }}
              />
            </div>
            <p className="text-[10px] mt-1 text-center" style={{ color: "var(--cp-muted)" }}>
              {uploadProgress < 100 ? "Uploading…" : "Almost done!"}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid var(--cp-border)" }}>
          <label
            className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all hover:opacity-80"
            style={{ background: "var(--cp-surface-2)", color: "var(--cp-muted)" }}
          >
            <ImagePlus size={18} style={{ color: meta.color }} />
            <span className="text-xs font-semibold">
              {mediaFiles.length > 0 ? `${mediaFiles.length} photo${mediaFiles.length > 1 ? "s" : ""}` : "Photo / Video"}
            </span>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaChange} />
          </label>

          <button
            onClick={handleSubmit}
            disabled={!canPost}
            className="px-7 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{ background: meta.color, color: "#fff" }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting…
              </span>
            ) : (
              `Post to ${meta.label} 🚀`
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
