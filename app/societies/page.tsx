"use client";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import FeedList from "@/app/components/features/feed/FeedList";

export default function SocietiesPage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--cp-text)" }}>Societies 🏛️</h1>
          <p className="text-sm mt-1" style={{ color: "var(--cp-muted)" }}>
            Explore, follow and engage with your campus societies
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-6"
          style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
          <span className="material-symbols-outlined text-lg" style={{ color: "var(--cp-muted)" }}>search</span>
          <input placeholder="Search society updates…" className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--cp-text)" }} />
        </div>

        <FeedList authorType="CollegeSociety" />
      </div>
    </MainLayout>
  );
}
