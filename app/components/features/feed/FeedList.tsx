"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import PostCard from "./PostCard";
import { useAuthStore } from "@/store/useAuthStore";
import { postsApi } from "@/lib/api";
import { Post, DEMO_POSTS } from "@/store/useFeedStore";

interface Props {
  category?: string;
  authorType?: string;
  isUpdates?: boolean;
  isConfessions?: boolean;
}

const LIMIT = 10;

export default function FeedList({ category, authorType, isUpdates, isConfessions }: Props) {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  /** Seed for recommendation engine freshness — bumped on every refresh */
  const seedRef = useRef(Date.now());

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement>(null);

  // ── Fetch a single page of posts ────────────────────────────────────────
  const fetchPage = useCallback(async (pageNum: number, reset: boolean, seed?: number) => {
    try {
      let data;
      if (isUpdates) {
        const response = await postsApi.getUpdates(pageNum, LIMIT);
        data = response.data;
      } else if (isConfessions) {
        const response = await postsApi.getConfessions(pageNum, LIMIT);
        data = response.data;
      } else {
        // Use recommendation engine by default (no sortBy → backend defaults to 'recommended')
        // Pass _t seed for Top-K shuffle freshness (same as AppV1 mobile app)
        const response = await postsApi.getFeed({
          page: pageNum,
          limit: LIMIT,
          category: category || undefined,
          authorType: authorType || undefined,
          ...(authorType ? { includeUpdates: "true" } : {}),
          // Recommendation engine seed — fresh shuffle on every refresh
          _t: seed || seedRef.current,
        });
        data = response.data;
      }

      let incoming: Post[] = data.data || data.items || [];
      // Backend returns commentCount, frontend expects commentsCount
      incoming = incoming.map(post => ({
        ...post,
        commentsCount: post.commentsCount ?? (post as unknown as Record<string, number>).commentCount ?? 0
      }));
      const pagination = data.pagination || data.meta?.pagination || { hasNext: data.hasMore };

      if (incoming.length === 0 && reset) {
        // Fallback demo data — filter by category if provided
        let demos = DEMO_POSTS;
        if (category) demos = demos.filter((p) => p.category === category);
        // We do not have authorType in DEMO_POSTS, so just don't filter or show empty if needed.
        if (authorType) demos = []; 
        
        setPosts(demos);
        setHasMore(false);
      } else {
        setPosts((prev) => (reset ? incoming : [...prev, ...incoming]));
        setHasMore(pagination?.hasNext ?? false);
        setPage(pageNum);
      }
    } catch {
      if (reset) {
        let demos = DEMO_POSTS;
        if (category) demos = demos.filter((p) => p.category === category);
        if (authorType) demos = [];
        setPosts(demos);
        setHasMore(false);
      }
    }
  }, [category, authorType, isUpdates, isConfessions]);

  // ── Initial load + refresh when category changes ─────────────────────────
  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => {
    setIsLoading(true);
    setPosts([]);
    setPage(1);
    // Generate a fresh seed for the initial load
    seedRef.current = Date.now();
    fetchPage(1, true, seedRef.current).then(() => {
      // Prepend any posts created while on a different route (sessionStorage cache)
      try {
        const EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
        const pending: Array<{ post: Post; ts: number }> = JSON.parse(
          sessionStorage.getItem("pendingPosts") || "[]"
        ).filter((item: { post: Post; ts: number }) => Date.now() - item.ts < EXPIRY_MS);
        
        const matching = pending
          .filter(({ post }) => !category || post.category === category)
          .map(({ post }) => post);
          
        if (matching.length > 0) {
          setPosts((prev) => {
            // Avoid duplicates if backend already returned them
            const existingIds = new Set(prev.map((p) => p._id));
            const fresh = matching.filter((p) => !existingIds.has(p._id));
            return fresh.length > 0 ? [
              ...fresh,
              ...prev.filter((p) => !p._id.startsWith("demo_"))
            ] : prev;
          });
        }
      } catch {}
    }).finally(() => setIsLoading(false));
  }, [category, fetchPage]);

  // ── Listen for new posts from CreatePostModal ────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { post } = (e as CustomEvent).detail as { post: Post };
      // Add to this feed if category matches or this is the home feed
      if (!category || post.category === category) {
        setPosts((prev) => [post, ...prev.filter((p) => !p._id.startsWith("demo_"))]);
      }
    };
    window.addEventListener("post-created", handler);
    return () => window.removeEventListener("post-created", handler);
  }, [category]);

  // ── Listen for post deletions ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { id } = (e as CustomEvent).detail as { id: string };
      setPosts((prev) => prev.filter((p) => p._id !== id));
    };
    window.addEventListener("post-deleted", handler);
    return () => window.removeEventListener("post-deleted", handler);
  }, []);

  // ── Listen for vote updates ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, upvotes, downvotes, userVote } = (e as CustomEvent).detail;
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, upvotes, downvotes, userVote } : p))
      );
    };
    window.addEventListener("post-voted", handler);
    return () => window.removeEventListener("post-voted", handler);
  }, []);

  // ── Listen for comment count updates ─────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, delta } = (e as CustomEvent).detail;
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, commentsCount: (p.commentsCount || 0) + delta } : p))
      );
    };
    window.addEventListener("post-commented", handler);
    return () => window.removeEventListener("post-commented", handler);
  }, []);

  // ── Listen for feed-refresh (triggered by clicking Home in sidebar) ───
  useEffect(() => {
    const handler = () => {
      // Bump seed so recommendation engine produces a new Top-K shuffle
      seedRef.current = Date.now();
      setIsLoading(true);
      setPosts([]);
      setPage(1);
      fetchPage(1, true, seedRef.current).finally(() => setIsLoading(false));
    };
    window.addEventListener("feed-refresh", handler);
    return () => window.removeEventListener("feed-refresh", handler);
  }, [fetchPage]);

  // ── Infinite scroll ───────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchPage(page + 1, false);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, page, fetchPage]);

  useEffect(() => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) loadMore();
    });
    if (loadingIndicatorRef.current) observerRef.current.observe(loadingIndicatorRef.current);
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [isLoading, hasMore, loadMore]);

  // ── Skeleton loader ───────────────────────────────────────────────────
  if (isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col gap-4 pb-20 w-full max-w-[600px] mx-auto px-4 lg:px-0 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-3xl p-5 animate-pulse" style={{ background: "var(--cp-surface)" }}>
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full" style={{ background: "var(--cp-surface-2)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded-full w-1/3" style={{ background: "var(--cp-surface-2)" }} />
                <div className="h-2 rounded-full w-1/4" style={{ background: "var(--cp-surface-2)" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded-full w-full" style={{ background: "var(--cp-surface-2)" }} />
              <div className="h-3 rounded-full w-4/5" style={{ background: "var(--cp-surface-2)" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-20 w-full max-w-[600px] mx-auto px-4 lg:px-0">
      {/* CreatePost inline prompt */}
      {isAuthenticated && (
        <div
          className="mt-4 px-5 py-4 rounded-[2rem] flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 group"
          style={{ background: "var(--cp-surface)", border: "2px solid var(--cp-border)" }}
          onClick={() => {
            const fab = document.getElementById("fab-create-post");
            if (fab) fab.click();
          }}
        >
          <div
            className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-lg shadow-sm group-hover:rotate-12 transition-transform duration-300"
            style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)" }}
          >
            ✏️
          </div>
          <span className="text-base font-bold flex-1" style={{ color: "var(--cp-text)" }}>
            {category === "GOSSIPS"     ? "Drop some gossip… ☕"
            : category === "CONFESSION" ? "Confess anonymously… 🤫"
            : category === "MEMES"       ? "Share a meme 😂"
            : "What's happening on campus? ✨"}
          </span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: "var(--cp-surface-2)", color: "var(--cp-primary)" }}>
            <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
          </div>
        </div>
      )}

      {posts.length === 0 && !isLoading ? (
        <div className="p-12 text-center rounded-3xl mt-8" style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
          <div className="text-5xl mb-4">
            {category === "GOSSIPS" ? "🗣️" : category === "CONFESSION" ? "🤫" : category === "MEMES" ? "😂" : "📭"}
          </div>
          <h3 className="font-bold text-lg mb-2" style={{ color: "var(--cp-text)" }}>Nothing here… yet!</h3>
          <p className="text-sm" style={{ color: "var(--cp-muted)" }}>
            Be the first to post in {category ? category.charAt(0) + category.slice(1).toLowerCase() : "this section"}!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Indicator */}
      <div ref={loadingIndicatorRef} className="py-8 flex justify-center">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--cp-muted)" }}>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading more…
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-xs font-bold text-center" style={{ color: "var(--cp-muted)" }}>
            You&apos;ve reached the end! 🎉
          </p>
        )}
      </div>
    </div>
  );
}