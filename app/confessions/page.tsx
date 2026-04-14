"use client";
import { useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { useFeedStore, DEMO_POSTS } from "@/store/useFeedStore";
import PostCard from "@/app/components/features/feed/PostCard";

export default function ConfessionsPage() {
  const { posts, isLoading, fetchFeed, filterType, setFilterType } = useFeedStore();

  useEffect(() => {
    setFilterType("text");
  }, []);

  const confessions = posts.filter((p) => p.isAnonymous);
  const demoCons = DEMO_POSTS.filter((p) => p.isAnonymous);
  const display = confessions.length > 0 ? confessions : demoCons;

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
        {/* Header */}
        <div className="cp-card p-6 mb-6 text-center"
          style={{ background: "linear-gradient(135deg, var(--cp-primary-10), var(--cp-primary-20))" }}>
          <div className="text-4xl mb-2">🎭</div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--cp-text)" }}>Confessions</h1>
          <p className="text-sm" style={{ color: "var(--cp-muted)" }}>
            Anonymous space for your campus secrets, crushes & unfiltered thoughts
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
          </div>
        ) : display.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--cp-muted)" }}>
            <span className="text-5xl block mb-3">🤫</span>
            <p className="text-base font-bold">No confessions yet</p>
            <p className="text-sm opacity-70">Be the first to spill the tea</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {display.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
