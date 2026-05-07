"use client";
import { useState } from "react";
import { useFeedStore } from "@/store/useFeedStore";
import { useAuthStore } from "@/store/useAuthStore";
import { postsApi } from "@/lib/api";
import toast from "react-hot-toast";

import { Image as ImageIcon, Edit3, BarChart2, Eye, EyeOff, X, Paperclip } from "lucide-react";

const POST_TYPES = [
  { value: "text", label: "Text", icon: Edit3 },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "poll", label: "Poll", icon: BarChart2 },
];

export default function CreatePost() {
  const { user, isAuthenticated } = useAuthStore();
  const { addPost } = useFeedStore();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) return null;

  const displayName = user?.displayName || user?.name || user?.username || "You";
  const avatar = user?.avatar;

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setMediaFiles(files);
    setMediaPreviews(files.map((f) => URL.createObjectURL(f)));
    setType("image");
  };

  const removeMedia = (i: number) => {
    setMediaFiles((f) => f.filter((_, idx) => idx !== i));
    setMediaPreviews((p) => p.filter((_, idx) => idx !== i));
    if (mediaFiles.length === 1) setType("text");
  };

  const handlePollOption = (i: number, val: string) => {
    setPollOptions((opts) => opts.map((o, idx) => (idx === i ? val : o)));
  };

  const handleSubmit = async () => {
    if (!content.trim()) { toast.error("Write something first!"); return; }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("content", content.trim());
      if (title.trim()) fd.append("title", title.trim());
      fd.append("type", mediaFiles.length > 0 ? "image" : type === "poll" ? "poll" : "text");
      fd.append("isAnonymous", String(isAnonymous));
      mediaFiles.forEach((f) => fd.append("media", f));
      if (type === "poll") {
        const validOpts = pollOptions.filter((o) => o.trim());
        if (validOpts.length < 2) { toast.error("Add at least 2 poll options"); setIsSubmitting(false); return; }
        fd.append("pollOptions", JSON.stringify(validOpts));
      }
      const { data } = await postsApi.createPost(fd);
      addPost(data.data);
      toast.success("Posted! 🔥");
      // Reset
      setContent(""); setTitle(""); setType("text");
      setIsAnonymous(false); setMediaFiles([]); setMediaPreviews([]);
      setPollOptions(["", ""]); setExpanded(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cp-card p-4 mb-4">
      {/* Collapsed trigger */}
      {!expanded ? (
        <div className="flex items-center gap-3" onClick={() => setExpanded(true)}>
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: "var(--cp-surface-2)", color: "var(--cp-primary)" }}
          >
            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : displayName[0]?.toUpperCase()}
          </div>
          <div
            className="flex-1 px-4 py-3 rounded-full cursor-pointer text-sm"
            style={{ background: "var(--cp-surface-2)", color: "var(--cp-muted)", border: "1px solid var(--cp-border)" }}
          >
            What's happening on campus? ✨
          </div>
          <label className="p-2 rounded-full cursor-pointer transition-all hover:opacity-80" style={{ background: "var(--cp-primary-10)" }}>
            <ImageIcon size={20} style={{ color: "var(--cp-primary)" }} />
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaChange} />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: "var(--cp-surface-2)", color: "var(--cp-primary)" }}>
                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : displayName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>{displayName}</p>
                <button
                  onClick={() => setIsAnonymous((v) => !v)}
                  className="flex items-center gap-1 text-[10px] font-semibold transition-colors"
                  style={{ color: isAnonymous ? "var(--cp-primary)" : "var(--cp-muted)" }}
                >
                  {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                  {isAnonymous ? "Anonymous" : "Public"}
                </button>
              </div>
            </div>
            <button onClick={() => setExpanded(false)} style={{ color: "var(--cp-muted)" }}>
              <X size={20} />
            </button>
          </div>

          {/* Type selector */}
          <div className="flex gap-2">
            {POST_TYPES.map((pt) => (
              <button
                key={pt.value}
                onClick={() => setType(pt.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: type === pt.value ? "var(--cp-primary)" : "var(--cp-surface-2)",
                  color: type === pt.value ? "#fff" : "var(--cp-muted)",
                }}
              >
                <pt.icon size={16} />
                {pt.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 rounded-xl text-sm font-semibold outline-none"
            style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isAnonymous ? "Confess anonymously… 🎭" : "What's on your mind?"}
            rows={4}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
            style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
            autoFocus
            maxLength={5000}
          />
          <p className="text-right text-[10px]" style={{ color: "var(--cp-muted)" }}>{content.length}/5000</p>

          {/* Media previews */}
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {mediaPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={src} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Poll options */}
          {type === "poll" && (
            <div className="flex flex-col gap-2">
              {pollOptions.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={(e) => handlePollOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
                />
              ))}
              {pollOptions.length < 6 && (
                <button
                  onClick={() => setPollOptions((o) => [...o, ""])}
                  className="text-xs font-semibold py-2 rounded-xl"
                  style={{ color: "var(--cp-primary)", background: "var(--cp-primary-10)" }}
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid var(--cp-border)" }}>
            <label className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl transition-all hover:opacity-80" style={{ background: "var(--cp-surface-2)" }}>
              <Paperclip size={18} style={{ color: "var(--cp-primary)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--cp-muted)" }}>Media</span>
              <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaChange} />
            </label>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="px-6 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
            >
              {isSubmitting ? "Posting…" : "Post 🚀"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}