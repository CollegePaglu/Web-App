"use client";
import { useEffect, useRef, useState } from "react";
import { postsApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useFeedStore } from "@/store/useFeedStore";
import toast from "react-hot-toast";

interface Comment {
  _id: string;
  content: string;
  isAnonymous: boolean;
  author?: { _id: string; displayName?: string; name?: string; username?: string; avatar?: string };
  createdAt: string;
  repliesCount?: number;
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface Props { postId: string; onClose: () => void; }

export default function CommentsPanel({ postId, onClose }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { updatePostCommentCount } = useFeedStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    postsApi.getComments(postId).then(({ data }) => {
      setComments(data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
    inputRef.current?.focus();
  }, [postId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!isAuthenticated) { toast.error("Login to comment"); return; }
    setSubmitting(true);
    try {
      const { data } = await postsApi.addComment(postId, content.trim(), isAnonymous);
      setComments((c) => [data.data, ...c]);
      updatePostCommentCount(postId, 1);
      setContent("");
      toast.success("Comment added!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{ background: "var(--cp-surface)", maxHeight: "85vh", border: "1px solid var(--cp-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--cp-border)" }}>
          <h3 className="font-bold text-base" style={{ color: "var(--cp-text)" }}>Comments</h3>
          <button onClick={onClose} style={{ color: "var(--cp-muted)" }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12" style={{ color: "var(--cp-muted)" }}>
              <span className="material-symbols-outlined text-4xl mb-2 block">chat_bubble_outline</span>
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((c) => {
              const name = c.isAnonymous ? "Anonymous 🎭" : (c.author?.displayName || c.author?.name || c.author?.username || "User");
              const av = c.isAnonymous ? null : c.author?.avatar;
              return (
                <div key={c._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--cp-surface-2)", color: "var(--cp-primary)" }}>
                    {av ? <img src={av} className="w-full h-full object-cover" alt="" /> : name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-4 py-2.5 rounded-2xl rounded-tl-sm"
                      style={{ background: "var(--cp-surface-2)" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "var(--cp-primary)" }}>{name}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--cp-text)" }}>{c.content}</p>
                    </div>
                    <p className="text-[10px] mt-1 ml-2" style={{ color: "var(--cp-muted)" }}>{timeAgo(c.createdAt)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        {isAuthenticated && (
          <div className="p-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--cp-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setIsAnonymous((v) => !v)}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-colors"
                style={{
                  background: isAnonymous ? "var(--cp-primary-10)" : "var(--cp-surface-2)",
                  color: isAnonymous ? "var(--cp-primary)" : "var(--cp-muted)",
                }}
              >
                <span className="material-symbols-outlined text-xs">{isAnonymous ? "visibility_off" : "visibility"}</span>
                {isAnonymous ? "Anonymous" : "Public"}
              </button>
            </div>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Write a comment…"
                rows={2}
                className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none resize-none"
                style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)", color: "var(--cp-text)" }}
                maxLength={1000}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 shrink-0"
                style={{ background: "var(--cp-primary)", color: "#fff" }}
              >
                {submitting
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-lg">send</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
