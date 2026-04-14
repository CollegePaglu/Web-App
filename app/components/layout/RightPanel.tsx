"use client";

const trendingTags = [
  { tag: "#LibraryVibes", posts: "1.2k" },
  { tag: "#MessFoodReview", posts: "856" },
  { tag: "#PlacementStress", posts: "540" },
];

const upcomingEvents = [
  { day: "14", month: "Oct", title: "Music Night", venue: "Auditorium • 6 PM", highlight: true },
  { day: "16", month: "Oct", title: "StartUp Mixer", venue: "Lobby • 2 PM", highlight: false },
];

export default function RightPanel() {
  const xpProgress = 0.76; // 76% through current level
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference * (1 - xpProgress);

  return (
    <aside
      className="w-110 sticky top-0 h-screen flex flex-col py-8 px-6 overflow-y-hidden"
      style={{
        background: "var(--cp-surface)",
        borderLeft: "1px solid var(--cp-border)",
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: "var(--cp-muted)" }}
        >
          Widgets
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: "var(--cp-text)" }}
        >
          Campus Pulse
        </h2>
      </div>

      <div className="space-y-8">
        {/* Streak Widget */}
        <div
          className="p-6 rounded-3xl"
          style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)" }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="transparent"
                  stroke="var(--cp-border-strong)"
                  strokeWidth="6"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="transparent"
                  stroke="var(--cp-primary)"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-2xl font-black"
                  style={{ color: "var(--cp-text)" }}
                >
                  12
                </span>
                <span
                  className="text-[8px] uppercase font-bold"
                  style={{ color: "var(--cp-muted)" }}
                >
                  Days
                </span>
              </div>
            </div>
            <h4
              className="text-sm font-bold"
              style={{ color: "var(--cp-text)" }}
            >
              Daily Streak
            </h4>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--cp-muted)" }}
            >
              450 XP until next level
            </p>
          </div>
        </div>

        {/* Trending */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h4
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--cp-text)" }}
            >
              Trending
            </h4>
            <span
              className="material-symbols-outlined text-lg"
              style={{ color: "var(--cp-muted)" }}
            >
              trending_up
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {trendingTags.map(({ tag, posts }, i) => (
              <a
                key={tag}
                href="#"
                className="p-3 rounded-2xl transition-all hover:opacity-80"
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
                <p
                  className="text-[10px] font-medium"
                  style={{ color: "var(--cp-muted)" }}
                >
                  {posts} posts today
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Events */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h4
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--cp-text)" }}
            >
              Events
            </h4>
            <span
              className="material-symbols-outlined text-lg"
              style={{ color: "var(--cp-muted)" }}
            >
              calendar_today
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingEvents.map(({ day, month, title, venue, highlight }) => (
              <div
                key={title}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{
                  background: highlight ? "var(--cp-primary-20)" : "transparent",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{
                    background: highlight ? "var(--cp-primary)" : "var(--cp-surface-2)",
                    color: highlight ? "#fff" : "var(--cp-muted)",
                  }}
                >
                  <span className="text-xs font-bold">{day}</span>
                  <span className="text-[8px] uppercase font-black">{month}</span>
                </div>
                <div>
                  <h5
                    className="text-xs font-bold leading-none"
                    style={{ color: "var(--cp-text)" }}
                  >
                    {title}
                  </h5>
                  <p
                    className="text-[10px] mt-1"
                    style={{ color: "var(--cp-muted)" }}
                  >
                    {venue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="mt-auto pt-6">
        <div
          className="p-4 rounded-2xl"
          style={{ background: "var(--cp-primary)", color: "#fff" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
            Paglu Pro
          </p>
          <p className="text-xs font-medium leading-relaxed mb-3 opacity-90">
            Unlock dark mode and priority confessions.
          </p>
          <button className="w-full bg-white text-[10px] font-bold py-2 rounded-lg hover:opacity-90 transition-opacity" style={{ color: "var(--cp-primary)" }}>
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}