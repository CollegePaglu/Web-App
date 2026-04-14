"use client";
import { useFeedStore } from "@/store/useFeedStore";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

const upcomingEvents = [
  { day: "18", month: "Apr", title: "Hackathon 2025", venue: "CS Dept • 9 AM", highlight: true },
  { day: "22", month: "Apr", title: "Cultural Night", venue: "Auditorium • 6 PM", highlight: false },
  { day: "25", month: "Apr", title: "Startup Mixer", venue: "Lobby • 2 PM", highlight: false },
];

export default function RightPanel() {
  const { posts, sortBy } = useFeedStore();
  const { user, isAuthenticated } = useAuthStore();

  // Compute trending tags from live posts
  const tagMap: Record<string, number> = {};
  posts.forEach((p) => {
    const words = p.content?.split(/\s+/) || [];
    words.forEach((w) => {
      if (w.startsWith("#") && w.length > 1) {
        tagMap[w] = (tagMap[w] || 0) + 1;
      }
    });
    // also count by keywords
    if (p.title) {
      p.title.split(/\s+/).forEach((w) => {
        if (w.startsWith("#")) tagMap[w] = (tagMap[w] || 0) + 1;
      });
    }
  });

  const trendingTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, posts: `${count}` }));

  // If no hashtags in posts, show static placeholder
  const displayTags = trendingTags.length > 0
    ? trendingTags
    : [
        { tag: "#LibraryVibes", posts: "1.2k" },
        { tag: "#MessFoodReview", posts: "856" },
        { tag: "#PlacementStress", posts: "540" },
      ];

  // User XP ring
  const xp = user?.xp || 0;
  const level = Math.floor(xp / 1000);
  const xpInLevel = xp % 1000;
  const xpProgress = xpInLevel / 1000;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference * (1 - xpProgress);
  const streak = user?.streak || 0;

  return (
    <aside
      className="w-80 sticky top-0 h-screen flex flex-col py-6 px-4 overflow-y-auto"
      style={{ background: "var(--cp-surface)", borderLeft: "1px solid var(--cp-border)" }}
    >
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--cp-muted)" }}>Widgets</p>
        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: "var(--cp-text)" }}>Campus Pulse</h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* Streak / XP Widget */}
        {isAuthenticated ? (
          <div className="p-5 rounded-3xl" style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)" }}>
            <div className="flex items-center gap-4">
              {/* Circular progress */}
              <div className="relative shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="transparent"
                    stroke="var(--cp-border-strong)" strokeWidth="6" />
                  <circle cx="48" cy="48" r="40" fill="transparent"
                    stroke="var(--cp-primary)" strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black" style={{ color: "var(--cp-text)" }}>{streak}</span>
                  <span className="text-[8px] uppercase font-bold" style={{ color: "var(--cp-muted)" }}>days</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>Daily Streak 🔥</h4>
                <p className="text-xs mt-0.5" style={{ color: "var(--cp-muted)" }}>Level {level}</p>
                <p className="text-xs mt-1" style={{ color: "var(--cp-muted)" }}>{1000 - xpInLevel} XP to next level</p>
                <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cp-border)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${xpProgress * 100}%`, background: "var(--cp-primary)" }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl text-center" style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)" }}>
            <p className="text-2xl mb-2">🎓</p>
            <p className="text-sm font-bold mb-1" style={{ color: "var(--cp-text)" }}>Join College Paglu</p>
            <p className="text-xs mb-3" style={{ color: "var(--cp-muted)" }}>Track XP, streaks & campus vibes</p>
            <Link href="/login" className="inline-block px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: "var(--cp-primary)", color: "#fff" }}>
              Login / Sign up
            </Link>
          </div>
        )}

        {/* Trending */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--cp-text)" }}>Trending</h4>
            <span className="material-symbols-outlined text-lg" style={{ color: "var(--cp-muted)" }}>local_fire_department</span>
          </div>
          <div className="flex flex-col gap-1">
            {displayTags.map(({ tag, posts: count }, i) => (
              <button
                key={tag}
                className="p-3 rounded-2xl text-left transition-all hover:opacity-80 w-full"
                style={{ background: i === 0 ? "var(--cp-primary-10)" : "transparent" }}
                onClick={() => {}}
              >
                <p className="text-xs font-bold" style={{ color: i === 0 ? "var(--cp-primary)" : "var(--cp-text)" }}>{tag}</p>
                <p className="text-[10px] font-medium" style={{ color: "var(--cp-muted)" }}>{count} posts today</p>
              </button>
            ))}
          </div>
        </div>

        {/* Events */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--cp-text)" }}>Events</h4>
            <span className="material-symbols-outlined text-lg" style={{ color: "var(--cp-muted)" }}>calendar_today</span>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingEvents.map(({ day, month, title, venue, highlight }) => (
              <div key={title}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: highlight ? "var(--cp-primary-20)" : "var(--cp-surface-2)" }}>
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                  style={{ background: highlight ? "var(--cp-primary)" : "var(--cp-border)", color: highlight ? "#fff" : "var(--cp-muted)" }}>
                  <span className="text-xs font-bold">{day}</span>
                  <span className="text-[8px] uppercase font-black">{month}</span>
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold truncate" style={{ color: "var(--cp-text)" }}>{title}</h5>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--cp-muted)" }}>{venue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed stats */}
        {posts.length > 0 && (
          <div className="p-4 rounded-2xl" style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--cp-muted)" }}>Feed Stats</p>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-lg font-black" style={{ color: "var(--cp-primary)" }}>{posts.length}</p>
                <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black" style={{ color: "var(--cp-accent)" }}>
                  {posts.reduce((a, p) => a + (p.upvotes || 0), 0)}
                </p>
                <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>Upvotes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black" style={{ color: "var(--cp-blue)" }}>
                  {posts.reduce((a, p) => a + (p.commentsCount || 0), 0)}
                </p>
                <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>Comments</p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        <div className="p-4 rounded-2xl" style={{ background: "var(--cp-primary)", color: "#fff" }}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Paglu Pro</p>
          <p className="text-xs leading-relaxed mb-3 opacity-90">Unlock dark mode, priority confessions &amp; more.</p>
          <button className="w-full bg-white text-[10px] font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
            style={{ color: "var(--cp-primary)" }}>
            Upgrade Now ⚡
          </button>
        </div>
      </div>
    </aside>
  );
}