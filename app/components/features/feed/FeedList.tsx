"use client";
import { useEffect, useRef, useCallback } from "react";
import { useFeedStore } from "@/store/useFeedStore";
import PostCard from "./PostCard";
import ConfessionCard from "./ConfessionCard";
import EventCard from "./EventCard";

const SORT_OPTIONS = [
  { value: "recent" as const, label: "Recent", icon: "schedule" },
  { value: "trending" as const, label: "Trending", icon: "local_fire_department" },
  { value: "top" as const, label: "Top", icon: "trending_up" },
];

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "poll", label: "Poll" },
  { value: "update", label: "Updates" },
];

export default function FeedList() {
  const {
    posts, isLoading, isLoadingMore, pagination,
    sortBy, filterType, fetchFeed, loadMore, setSortBy, setFilterType,
  } = useFeedStore();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchFeed(true);
  }, []);

  // Infinite scroll
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
  }, [loadMore]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver, posts.length]);

  return (
    <div className="flex flex-col gap-0">
      {/* Controls */}
      <div className="sticky top-0 z-10 pb-3" style={{ background: "var(--cp-bg)" }}>
        {/* Sort */}
        <div className="flex gap-2 mb-2 pt-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={{
                background: sortBy === opt.value ? "var(--cp-primary)" : "var(--cp-surface)",
                color: sortBy === opt.value ? "#fff" : "var(--cp-muted)",
                border: `1px solid ${sortBy === opt.value ? "var(--cp-primary)" : "var(--cp-border)"}`,
              }}
            >
              <span className="material-symbols-outlined text-sm">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0"
              style={{
                background: filterType === f.value ? "var(--cp-primary-10)" : "transparent",
                color: filterType === f.value ? "var(--cp-primary)" : "var(--cp-muted)",
                border: `1px solid ${filterType === f.value ? "var(--cp-primary)" : "var(--cp-border)"}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="cp-card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full" style={{ background: "var(--cp-surface-2)" }} />
                <div className="flex flex-col gap-2">
                  <div className="w-28 h-3 rounded-full" style={{ background: "var(--cp-surface-2)" }} />
                  <div className="w-16 h-2 rounded-full" style={{ background: "var(--cp-surface-2)" }} />
                </div>
              </div>
              <div className="w-full h-3 rounded-full mb-2" style={{ background: "var(--cp-surface-2)" }} />
              <div className="w-3/4 h-3 rounded-full mb-2" style={{ background: "var(--cp-surface-2)" }} />
              <div className="w-1/2 h-3 rounded-full" style={{ background: "var(--cp-surface-2)" }} />
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {!isLoading && (
        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20"
              style={{ color: "var(--cp-muted)" }}>
              <span className="material-symbols-outlined text-6xl mb-4 opacity-30">feed</span>
              <p className="text-base font-bold mb-1">No posts yet</p>
              <p className="text-sm opacity-70">Be the first to post something!</p>
            </div>
          ) : (
            posts.map((post) => {
              if (post.isAnonymous) return <ConfessionCard key={post._id} post={post} />;
              if (post.type === "update") return <EventCard key={post._id} post={post} />;
              return <PostCard key={post._id} post={post} />;
            })
          )}
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="h-8 flex items-center justify-center mt-4">
        {isLoadingMore && (
          <div className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
        )}
        {!isLoadingMore && pagination && !pagination.hasNext && posts.length > 0 && (
          <p className="text-xs" style={{ color: "var(--cp-muted)" }}>You've seen it all ✨</p>
        )}
      </div>
    </div>
  );
}