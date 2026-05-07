"use client";
import { useState, useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { useFeedStore } from "@/store/useFeedStore";
import PostCard from "@/app/components/features/feed/PostCard";
import { Search, SearchX } from "lucide-react";

export default function ExplorePage() {
  const { posts, isLoading, setSearchQuery, setFilterType, setSortBy, filterType, sortBy } = useFeedStore();
  const [input, setInput] = useState("");

  useEffect(() => {
    setSortBy("trending");
  }, [setSortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(input);
  };

  const TYPE_FILTERS = [
    { value: "", label: "All 🌐" },
    { value: "text", label: "Text ✍️" },
    { value: "image", label: "Images 🖼" },
    { value: "poll", label: "Polls 📊" },
    { value: "update", label: "Updates 📢" },
  ];

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
        <h1 className="text-2xl font-extrabold mb-4" style={{ color: "var(--cp-text)" }}>
          Explore 🔍
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
              <Search size={18} style={{ color: "var(--cp-muted)" }} />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search posts, confessions, events…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--cp-text)" }}
              />
            </div>
            <button type="submit"
              className="px-5 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>
              Search
            </button>
          </div>
        </form>

        {/* Controls — single scrollable row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {TYPE_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilterType(f.value)}
              className="px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0"
              style={{
                background: filterType === f.value ? "var(--cp-primary)" : "var(--cp-surface)",
                color: filterType === f.value ? "#fff" : "var(--cp-muted)",
                border: `1px solid ${filterType === f.value ? "var(--cp-primary)" : "var(--cp-border)"}`,
              }}>
              {f.label}
            </button>
          ))}

          <div className="w-px h-5 shrink-0" style={{ background: "var(--cp-border)" }} />

          {[
            { v: "trending" as const, l: "🔥 Trending" },
            { v: "recent" as const, l: "🕐 Recent" },
            { v: "top" as const, l: "⭐ Top" },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setSortBy(v)}
              className="px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0"
              style={{
                background: sortBy === v ? "var(--cp-primary-10)" : "transparent",
                color: sortBy === v ? "var(--cp-primary)" : "var(--cp-muted)",
                border: `1px solid ${sortBy === v ? "var(--cp-primary)" : "var(--cp-border)"}`,
              }}>
              {l}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cp-card p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full" style={{ background: "var(--cp-surface-2)" }} />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="w-24 h-3 rounded" style={{ background: "var(--cp-surface-2)" }} />
                    <div className="w-16 h-2 rounded" style={{ background: "var(--cp-surface-2)" }} />
                  </div>
                </div>
                <div className="w-full h-3 rounded mb-2" style={{ background: "var(--cp-surface-2)" }} />
                <div className="w-2/3 h-3 rounded" style={{ background: "var(--cp-surface-2)" }} />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--cp-muted)" }}>
            <SearchX size={64} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-bold">Nothing found</p>
            <p className="text-sm opacity-70">Try different keywords or filters</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
