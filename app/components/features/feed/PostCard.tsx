"use client";
import { useState } from "react";
import { Post } from "@/store/useFeedStore";
import { useFeedStore } from "@/store/useFeedStore";
import { useAuthStore } from "@/store/useAuthStore";
import { postsApi } from "@/lib/api";
import toast from "react-hot-toast";
import CommentsPanel from "./CommentsPanel";

interface Props { post: Post; }

const REACTION_EMOJIS: Record<string, string> = {
  up: "👍", down: "👎",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostCard({ post }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { updatePostVote, removePost } = useFeedStore();
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [shareClicked, setShareClicked] = useState(false);

  const author = post.isAnonymous
    ? { name: "Anonymous 🎭", avatar: null }
    : {
        name: post.author?.displayName || post.author?.name || post.author?.username || "User",
        avatar: post.author?.avatar,
      };

  const handleVote = async (type: "up" | "down") => {
    if (!isAuthenticated) { toast.error("Login to vote"); return; }
    if (isVoting) return;
    setIsVoting(true);
    try {
      const isSameVote = post.userVote === type;
      let res;
      if (isSameVote) {
        res = await postsApi.removeVote(post._id);
        updatePostVote(post._id, res.data.data.upvotes, res.data.data.downvotes, null);
      } else {
        res = await postsApi.vote(post._id, type);
        updatePostVote(post._id, res.data.data.upvotes, res.data.data.downvotes, type);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await postsApi.deletePost(post._id);
      removePost(post._id);
      toast.success("Post deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
    setShareClicked(true);
    setTimeout(() => setShareClicked(false), 2000);
  };

  const isOwner = user && post.author && (user._id === post.author._id || user.id === post.author._id);

  const typeColors: Record<string, string> = {
    update: "var(--cp-blue)", text: "var(--cp-muted)", image: "var(--cp-success)", poll: "var(--cp-accent)", video: "var(--cp-error)",
  };

  return (
    <>
      <article className="cp-card overflow-hidden flex flex-col group" style={{ background: "var(--cp-surface)" }}>
        {/* Type badge */}
        {post.type !== "text" && (
          <div className="px-5 pt-3 flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: typeColors[post.type] + "20", color: typeColors[post.type] }}>
              {post.type === "update" ? "📢 Update" : post.type === "image" ? "🖼 Image" : post.type === "poll" ? "📊 Poll" : post.type}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"
              style={{ background: "var(--cp-surface-2)" }}>
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold"
                  style={{ color: "var(--cp-primary)" }}>
                  {author.name[0]}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm" style={{ color: "var(--cp-text)" }}>{author.name}</h4>
              <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          {isOwner && (
            <button onClick={handleDelete} className="p-2 rounded-lg transition-colors hover:text-red-500"
              style={{ color: "var(--cp-muted)" }}>
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>

        {/* Title */}
        {post.title && (
          <div className="px-5 pb-2">
            <h3 className="font-bold text-base leading-tight" style={{ color: "var(--cp-text)" }}>{post.title}</h3>
          </div>
        )}

        {/* Body */}
        {post.content && (
          <div className="px-5 pb-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--cp-text)" }}>{post.content}</p>
          </div>
        )}

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={`${post.media.length === 1 ? "" : "grid grid-cols-2 gap-0.5"} overflow-hidden`}>
            {post.media.map((m, i) => (
              <div key={i} className={`overflow-hidden ${post.media!.length === 1 ? "aspect-video" : "aspect-square"}`}>
                {m.type === "video" ? (
                  <video src={m.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={m.url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center gap-4" style={{ borderTop: "1px solid var(--cp-border)" }}>
          {/* Upvote */}
          <button
            onClick={() => handleVote("up")}
            disabled={isVoting}
            className="flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            style={{ color: post.userVote === "up" ? "var(--cp-primary)" : "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: post.userVote === "up" ? "'FILL' 1" : "'FILL' 0" }}>
              thumb_up
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--cp-text)" }}>{post.upvotes || 0}</span>
          </button>

          {/* Downvote */}
          <button
            onClick={() => handleVote("down")}
            disabled={isVoting}
            className="flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            style={{ color: post.userVote === "down" ? "var(--cp-error)" : "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: post.userVote === "down" ? "'FILL' 1" : "'FILL' 0" }}>
              thumb_down
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--cp-text)" }}>{post.downvotes || 0}</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg">chat_bubble_outline</span>
            <span className="text-xs font-bold" style={{ color: "var(--cp-text)" }}>{post.commentsCount || 0}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 ml-auto transition-colors"
            style={{ color: shareClicked ? "var(--cp-primary)" : "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg">{shareClicked ? "check" : "share"}</span>
          </button>
        </div>
      </article>

      {/* Comments Drawer */}
      {showComments && (
        <CommentsPanel postId={post._id} onClose={() => setShowComments(false)} />
      )}
    </>
  );
}