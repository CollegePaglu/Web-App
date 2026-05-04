"use client";
import { useState } from "react";
import { Post } from "@/store/useFeedStore";
import { useAuthStore } from "@/store/useAuthStore";
import { postsApi } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import CommentsPanel from "./CommentsPanel";

interface Props { post: Post; }

const CONTENT_TRUNCATE = 280;

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
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [shareClicked, setShareClicked] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ url: string; type: string } | null>(null);

  // Local optimistic vote state
  const [localPost, setLocalPost] = useState(post);

  // Helper to broadcast vote changes to all FeedList instances
  const broadcastVote = (upvotes: number, downvotes: number, userVote: "up" | "down" | null) => {
    setLocalPost((p) => ({ ...p, upvotes, downvotes, userVote }));
    window.dispatchEvent(new CustomEvent("post-voted", { detail: { id: localPost._id, upvotes, downvotes, userVote } }));
  };

  // Helper to broadcast comment count delta
  const broadcastComment = (delta: number) => {
    setLocalPost((p) => ({ ...p, commentsCount: (p.commentsCount || 0) + delta }));
    window.dispatchEvent(new CustomEvent("post-commented", { detail: { id: localPost._id, delta } }));
  };

  // Helper to broadcast deletion
  const broadcastDelete = () => {
    window.dispatchEvent(new CustomEvent("post-deleted", { detail: { id: localPost._id } }));
  };

  const authorName = localPost.author?.displayName || 
                     localPost.author?.name || 
                     (localPost.author?.firstName ? `${localPost.author.firstName} ${localPost.author.lastName || ""}`.trim() : null) || 
                     localPost.author?.username || 
                     "User";

  const author = localPost.isAnonymous
    ? { name: "Anonymous 🎭", avatar: null, _id: null }
    : {
        name: authorName,
        avatar: localPost.author?.avatar,
        _id: localPost.author?._id,
      };

  const isOwner = user && localPost.author && (user._id === localPost.author._id || user.id === localPost.author._id);
  
  // Handle backend image/video fields vs old demo media field
  const mediaToRender = localPost.media || [
    ...(localPost.videoUrl ? [{ url: localPost.videoUrl, type: "video" }] : []),
    ...(localPost.images?.map((url: string) => ({ url, type: "image" })) || [])
  ];

  const isTextOnly = !mediaToRender || mediaToRender.length === 0;
  const contentTooLong = (localPost.content?.length || 0) > CONTENT_TRUNCATE;

  const handleVote = async (type: "up" | "down") => {
    if (!isAuthenticated) { toast.error("Login to vote"); return; }
    if (isVoting) return;
    setIsVoting(true);

    if (localPost._id.startsWith("demo_")) {
      const isSameVote = localPost.userVote === type;
      const newVote = isSameVote ? null : type;
      let upDelta = 0; let downDelta = 0;
      if (localPost.userVote === "up") upDelta = -1;
      if (localPost.userVote === "down") downDelta = -1;
      if (type === "up" && !isSameVote) upDelta = 1;
      if (type === "down" && !isSameVote) downDelta = 1;
      broadcastVote(localPost.upvotes + upDelta, localPost.downvotes + downDelta, newVote);
      setIsVoting(false);
      return;
    }

    try {
      const isSameVote = localPost.userVote === type;
      let res;
      if (isSameVote) {
        res = await postsApi.removeVote(localPost._id);
        broadcastVote(res.data.data.upvotes, res.data.data.downvotes, null);
      } else {
        res = await postsApi.vote(localPost._id, type);
        broadcastVote(res.data.data.upvotes, res.data.data.downvotes, type);
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
      await postsApi.deletePost(localPost._id);
      broadcastDelete();
      toast.success("Post deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    
    // Check if running on mobile where native share makes the most sense
    const isMobile = typeof navigator !== "undefined" && /mobile|android|iphone|ipad/i.test(navigator.userAgent.toLowerCase());

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'CollegePaglu',
          text: 'Check out this post on CollegePaglu!',
          url: url,
        });
        setShareClicked(true);
        setTimeout(() => setShareClicked(false), 2000);
        return; // Success
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Native share failed", err);
        }
      }
    }
    
    // Fallback to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
    setShareClicked(true);
    setTimeout(() => setShareClicked(false), 2000);
  };

  const handleReport = () => {
    setMenuOpen(false);
    setReported(true);
    toast.success("Reported to our team. Thanks! 🙏");
  };

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
            {author._id && !localPost.isAnonymous ? (
              <Link href={`/profile/${author._id}`} className="w-10 h-10 rounded-full overflow-hidden shrink-0 transition-transform hover:scale-105" style={{ background: "var(--cp-surface-2)" }}>
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: "var(--cp-primary)" }}>
                    {author.name[0]}
                  </div>
                )}
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ background: "var(--cp-surface-2)" }}>
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: "var(--cp-primary)" }}>
                    {author.name[0]}
                  </div>
                )}
              </div>
            )}
            
            <div>
              {author._id && !localPost.isAnonymous ? (
                <Link href={`/profile/${author._id}`} className="font-bold text-sm hover:underline" style={{ color: "var(--cp-text)" }}>
                  {author.name}
                </Link>
              ) : (
                <h4 className="font-bold text-sm" style={{ color: "var(--cp-text)" }}>{author.name}</h4>
              )}
              <Link href={`/post/${localPost._id}`} className="text-[10px] hover:underline block" style={{ color: "var(--cp-muted)" }}>
                {timeAgo(localPost.createdAt)}
              </Link>
            </div>
          </div>

          {/* Right header actions */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <button onClick={handleDelete} className="p-2 rounded-lg transition-colors hover:text-red-500" style={{ color: "var(--cp-muted)" }}>
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            )}
            {/* ⋯ options for others' posts */}
            {!isOwner && !localPost.isAnonymous && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="p-2 rounded-lg transition-colors hover:opacity-70"
                  style={{ color: "var(--cp-muted)" }}
                >
                  <span className="material-symbols-outlined text-lg">more_vert</span>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-9 z-20 rounded-2xl overflow-hidden shadow-xl"
                    style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)", minWidth: "160px" }}
                  >
                    <button
                      onClick={handleReport}
                      disabled={reported}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm font-semibold transition-colors hover:opacity-80"
                      style={{ color: reported ? "var(--cp-muted)" : "#EF4444" }}
                    >
                      <span className="material-symbols-outlined text-base">flag</span>
                      {reported ? "Reported" : "Report post"}
                    </button>
                  </div>
                )}
                {/* Click-outside dismiss */}
                {menuOpen && (
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        {localPost.title && (
          <div className="px-5 pb-2">
            <Link href={`/post/${localPost._id}`}>
              <h3 className="font-bold text-base leading-tight hover:underline" style={{ color: "var(--cp-text)" }}>{localPost.title}</h3>
            </Link>
          </div>
        )}

        {/* Body — text-only gets AppV1's accent bar treatment */}
        {localPost.content && (
          isTextOnly ? (
            <div className="px-5 pb-4 flex items-stretch gap-4">
              {/* Green accent bar (AppV1 glassAccentBar) */}
              <div className="w-0.5 rounded-full shrink-0 self-stretch" style={{ background: "var(--cp-primary)", opacity: 0.75 }} />
              <div className="flex-1">
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium" style={{ color: "var(--cp-text)" }}>
                  {contentTooLong && !showFull
                    ? localPost.content.slice(0, CONTENT_TRUNCATE)
                    : localPost.content}
                </p>
                {contentTooLong && !showFull && (
                  <button
                    onClick={() => setShowFull(true)}
                    className="text-xs font-bold mt-1"
                    style={{ color: "var(--cp-primary)" }}
                  >
                    …more
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="px-5 pb-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--cp-text)" }}>
                {contentTooLong && !showFull
                  ? localPost.content.slice(0, CONTENT_TRUNCATE)
                  : localPost.content}
              </p>
              {contentTooLong && !showFull && (
                <button
                  onClick={() => setShowFull(true)}
                  className="text-xs font-bold mt-1"
                  style={{ color: "var(--cp-primary)" }}
                >
                  …more
                </button>
              )}
            </div>
          )
        )}

        {/* Media */}
        {mediaToRender && mediaToRender.length > 0 && (
          <div className={`${mediaToRender.length === 1 ? "" : "grid grid-cols-2 gap-0.5"} overflow-hidden`}>
            {mediaToRender.map((m: any, i: number) => (
              <div 
                key={i} 
                className={`overflow-hidden cursor-pointer ${mediaToRender.length === 1 ? "aspect-video" : "aspect-square"}`}
                onClick={(e) => {
                  // Don't trigger if they clicked the video controls
                  if (m.type === "video" && (e.target as HTMLElement).tagName.toLowerCase() === "video") {
                    // Let native controls work, but also allow fullscreen expansion if clicked outside controls (handled by browser usually, but let's allow it)
                    setFullscreenMedia(m);
                  } else {
                    setFullscreenMedia(m);
                  }
                }}
              >
                {m.type === "video" ? (
                  <video src={m.url} controls className="w-full h-full object-cover pointer-events-none" />
                ) : (
                  <img src={m.url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center gap-4" style={{ borderTop: "1px solid var(--cp-border)" }}>
          {/* Upvote — AppV1 "heart" style: shows count + "liked" */}
          <button
            onClick={() => handleVote("up")}
            disabled={isVoting}
            className="flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            style={{ color: localPost.userVote === "up" ? "var(--cp-primary)" : "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: localPost.userVote === "up" ? "'FILL' 1" : "'FILL' 0" }}>
              thumb_up
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--cp-text)" }}>
              {(localPost.upvotes || 0).toLocaleString()} liked
            </span>
          </button>

          {/* Downvote */}
          <button
            onClick={() => handleVote("down")}
            disabled={isVoting}
            className="flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            style={{ color: localPost.userVote === "down" ? "var(--cp-error)" : "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: localPost.userVote === "down" ? "'FILL' 1" : "'FILL' 0" }}>
              thumb_down
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--cp-text)" }}>{localPost.downvotes || 0}</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg">chat_bubble_outline</span>
            <span className="text-xs font-bold" style={{ color: "var(--cp-text)" }}>{localPost.commentsCount || 0}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 ml-auto transition-colors hover:opacity-70 active:scale-95"
            style={{ 
              color: shareClicked ? "var(--cp-primary)" : "var(--cp-muted)",
            }}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'wght' 300" }}>
              {shareClicked ? "check" : "share"}
            </span>
          </button>
        </div>
      </article>

      {/* Comments Drawer */}
      {showComments && <CommentsPanel postId={localPost._id} onClose={() => setShowComments(false)} updateCommentCount={broadcastComment} />}
      
      {/* Fullscreen Media Viewer */}
      {fullscreenMedia && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setFullscreenMedia(null)}
        >
          <button 
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors z-[101]"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenMedia(null);
            }}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          
          <div 
            className="relative w-full h-full max-w-5xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {fullscreenMedia.type === "video" ? (
              <video 
                src={fullscreenMedia.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
              />
            ) : (
              <img 
                src={fullscreenMedia.url} 
                alt="Fullscreen view" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}