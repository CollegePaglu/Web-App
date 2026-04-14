"use client";
import { useFeedStore } from "@/store/useFeedStore";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

const UPCOMING_EVENTS = [
  { day: "18", month: "Apr", title: "Hackathon 2025", venue: "CS Dept • 9 AM", highlight: true },
  { day: "22", month: "Apr", title: "Cultural Night", venue: "Auditorium • 6 PM", highlight: false },
  { day: "25", month: "Apr", title: "Startup Mixer", venue: "Lobby • 2 PM", highlight: false },
];

export default function RightPanel() {
  const { posts } = useFeedStore();
  const { user, isAuthenticated } = useAuthStore();

  /* ── Live trending hashtags from posts ── */
  const tagMap: Record<string, number> = {};
  posts.forEach((p) => {
    (p.content + " " + (p.title || "")).split(/\s+/).forEach((w) => {
      if (w.startsWith("#") && w.length > 1) {
        const tag = w.replace(/[^#\w]/g, "");
        if (tag.length > 1) tagMap[tag] = (tagMap[tag] || 0) + 1;
      }
    });
  });

  const trendingTags =
    Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, posts: count }));

  const displayTags =
    trendingTags.length > 0
      ? trendingTags
      : [
          { tag: "#LibraryVibes", posts: 1200 },
          { tag: "#MessFoodReview", posts: 856 },
          { tag: "#PlacementStress", posts: 540 },
          { tag: "#CampusLife", posts: 320 },
        ];

  /* ── XP ring ── */
  const xp = user?.xp || 0;
  const xpInLevel = xp % 1000;
  const level = Math.floor(xp / 1000);
  const progress = xpInLevel / 1000;
  const C = 2 * Math.PI * 40;
  const dashOffset = C * (1 - progress);
  const streak = user?.streak || 0;

  /* ── Feed stats ── */
  const totalUpvotes = posts.reduce((a, p) => a + (p.upvotes || 0), 0);
  const totalComments = posts.reduce((a, p) => a + (p.commentsCount || 0), 0);

  return (
    <aside
      className="w-72 flex-shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-hide flex flex-col py-5 px-4 gap-5"
      style={{
        background: "var(--cp-surface)",
        borderLeft: "1px solid var(--cp-border)",
      }}
    >
      {/* ── Header ── */}
      <div>
        <p
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: "var(--cp-muted)" }}
        >
          Campus Pulse
        </p>
      </div>

      {/* ── Streak / XP card ── */}
      {isAuthenticated ? (
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "var(--cp-surface-2)",
            border: "1px solid var(--cp-border)",
          }}
        >
          <div className="flex items-center gap-4">
            {/* Ring */}
            <div className="relative shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48" cy="48" r="40" fill="transparent"
                  stroke="var(--cp-border)" strokeWidth="8"
                />
                <circle
                  cx="48" cy="48" r="40" fill="transparent"
                  stroke="var(--cp-primary)" strokeWidth="8"
                  strokeDasharray={C}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-black" style={{ color: "var(--cp-text)" }}>
                  {streak}
                </span>
                <span className="text-[8px] uppercase font-bold" style={{ color: "var(--cp-muted)" }}>
                  days
                </span>
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>
                Daily Streak 🔥
              </p>
              <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>
                Level {level}
              </p>
              <div
                className="mt-2 w-full h-1 rounded-full overflow-hidden"
                style={{ background: "var(--cp-border)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    background: "var(--cp-primary)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <p className="text-[10px] mt-1" style={{ color: "var(--cp-muted)" }}>
                {1000 - xpInLevel} XP to next level
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="p-4 rounded-2xl text-center"
          style={{
            background: "var(--cp-surface-2)",
            border: "1px solid var(--cp-border)",
          }}
        >
          <p className="text-2xl mb-1">🎓</p>
          <p className="text-sm font-bold mb-0.5" style={{ color: "var(--cp-text)" }}>
            Join College Paglu
          </p>
          <p className="text-[10px] mb-3" style={{ color: "var(--cp-muted)" }}>
            Track XP, streaks &amp; campus vibes
          </p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: "var(--cp-primary)", color: "#fff" }}
          >
            Login / Sign up
          </Link>
        </div>
      )}

      {/* ── Trending ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: "var(--cp-text)" }}
          >
            Trending
          </h4>
          <span className="material-symbols-outlined text-base" style={{ color: "var(--cp-muted)" }}>
            local_fire_department
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          {displayTags.map(({ tag, posts: count }, i) => (
            <button
              key={tag}
              className="p-2.5 rounded-xl text-left transition-all hover:opacity-80 w-full"
              style={{
                background: i === 0 ? "var(--cp-primary-10)" : "transparent",
              }}
            >
              <p
                className="text-xs font-bold"
                style={{ color: i === 0 ? "var(--cp-primary)" : "var(--cp-text)" }}
              >
                {tag}
              </p>
              <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>
                {count.toLocaleString()} posts today
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Events ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: "var(--cp-text)" }}
          >
            Events
          </h4>
          <span className="material-symbols-outlined text-base" style={{ color: "var(--cp-muted)" }}>
            calendar_today
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {UPCOMING_EVENTS.map(({ day, month, title, venue, highlight }) => (
            <div
              key={title}
              className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{
                background: highlight ? "var(--cp-primary-20)" : "var(--cp-surface-2)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0"
                style={{
                  background: highlight ? "var(--cp-primary)" : "var(--cp-border)",
                  color: highlight ? "#fff" : "var(--cp-muted)",
                }}
              >
                <span className="text-xs font-bold leading-none">{day}</span>
                <span className="text-[8px] uppercase font-black">{month}</span>
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-bold truncate"
                  style={{ color: "var(--cp-text)" }}
                >
                  {title}
                </p>
                <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>
                  {venue}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feed stats ── */}
      {posts.length > 0 && (
        <div
          className="p-3 rounded-2xl"
          style={{
            background: "var(--cp-surface-2)",
            border: "1px solid var(--cp-border)",
          }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-widest mb-2"
            style={{ color: "var(--cp-muted)" }}
          >
            Feed Stats
          </p>
          <div className="grid grid-cols-3 gap-1 text-center">
            {[
              { label: "Posts", value: posts.length, color: "var(--cp-primary)" },
              { label: "Upvotes", value: totalUpvotes, color: "var(--cp-accent)" },
              { label: "Comments", value: totalComments, color: "var(--cp-blue)" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-sm font-black" style={{ color }}>
                  {value.toLocaleString()}
                </p>
                <p className="text-[9px]" style={{ color: "var(--cp-muted)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pro CTA ── */}
      <div
        className="p-4 rounded-2xl mt-auto"
        style={{ background: "var(--cp-primary)", color: "#fff" }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
          Paglu Pro ⚡
        </p>
        <p className="text-xs leading-relaxed mb-3 opacity-90">
          Unlock priority confessions, analytics &amp; more.
        </p>
        <button
          className="w-full bg-white text-[10px] font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
          style={{ color: "var(--cp-primary)" }}
        >
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}