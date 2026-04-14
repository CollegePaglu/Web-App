"use client";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import Link from "next/link";

const DEMO_SOCIETIES = [
  { id: "s1", name: "Tech Society", description: "Hackathons, coding contests, workshops & more.", members: 842, avatar: "💻", color: "#3B82F6", posts: 156 },
  { id: "s2", name: "Cultural Society", description: "Dance, drama, music and everything creative.", members: 634, avatar: "🎭", color: "#8B5CF6", posts: 98 },
  { id: "s3", name: "Sports Club", description: "Cricket, football, badminton & inter-college competitions.", members: 512, avatar: "⚽", color: "#10B981", posts: 74 },
  { id: "s4", name: "E-Cell", description: "Startup ideas, pitching, mentorship & funding guidance.", members: 389, avatar: "🚀", color: "#F59E0B", posts: 62 },
  { id: "s5", name: "Photography Club", description: "Campus clicks, photo walks, editing workshops.", members: 267, avatar: "📸", color: "#EC4899", posts: 88 },
  { id: "s6", name: "Debate Society", description: "MUNs, debates, public speaking & leadership.", members: 198, avatar: "🎤", color: "#EF4444", posts: 45 },
  { id: "s7", name: "Robotics Club", description: "Build, code and compete in robo-wars nationally.", members: 156, avatar: "🤖", color: "#06B6D4", posts: 39 },
  { id: "s8", name: "Music Club", description: "Jam sessions, college band, open mics & concerts.", members: 423, avatar: "🎸", color: "#F97316", posts: 71 },
];

export default function SocietiesPage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
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
          <input placeholder="Search societies…" className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--cp-text)" }} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4">
          {DEMO_SOCIETIES.map((soc) => (
            <div key={soc.id} className="cp-card p-5 flex items-center gap-4 hover:opacity-90 transition-all cursor-pointer group">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: soc.color + "20" }}>
                {soc.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base" style={{ color: "var(--cp-text)" }}>{soc.name}</h3>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--cp-muted)" }}>{soc.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: "var(--cp-muted)" }}>
                    <span className="material-symbols-outlined text-xs">group</span> {soc.members} members
                  </span>
                  <span className="text-[10px] font-semibold flex items-center gap-0.5" style={{ color: "var(--cp-muted)" }}>
                    <span className="material-symbols-outlined text-xs">feed</span> {soc.posts} posts
                  </span>
                </div>
              </div>

              {/* Follow button */}
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all hover:opacity-90 active:scale-95"
                style={{ background: soc.color + "20", color: soc.color }}>
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
