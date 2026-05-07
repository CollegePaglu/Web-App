"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFeedStore } from "@/store/useFeedStore";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { Flame, Calendar } from "lucide-react";
import { postsApi, eventsApi } from "@/lib/api";

export default function RightPanel() {
  const { posts } = useFeedStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted] = useState(() => typeof window !== "undefined");
  const [showProModal, setShowProModal] = useState(false);
  const [trendingTags, setTrendingTags] = useState<{ tag: string; posts: number }[]>([]);

  interface EventType {
    _id: string;
    title: string;
    venue: string;
    time?: string;
    date: string;
    highlight?: boolean;
  }
  const [events, setEvents] = useState<EventType[]>([]);

  const fetchTrendingTags = async () => {
    try {
      const res = await postsApi.getTrendingTags(5);
      if (res.data?.success && res.data.data) {
        setTrendingTags(res.data.data);
      }
    } catch {
      // Endpoint not yet implemented
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await eventsApi.getEvents({ limit: 5 });
      if (res.data?.success && res.data.data?.data) {
        setEvents(res.data.data.data);
      }
    } catch {
      // Endpoint not yet implemented
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrendingTags();
      fetchEvents();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const displayTags = trendingTags.length > 0
    ? trendingTags
    : [
        { tag: "#CampusLife", posts: 120 },
        { tag: "#Events2025", posts: 85 },
        { tag: "#LibraryVibes", posts: 54 },
        { tag: "#TechFest", posts: 42 },
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
      className="w-72 shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-hide flex flex-col py-5 px-4 gap-5"
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
      {mounted && isAuthenticated ? (
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
              <p className="text-base font-black truncate leading-tight" style={{ color: "var(--cp-text)" }}>
                {user?.displayName || "Paglu Student"}
              </p>
              <p className="text-[10px] mb-2 truncate" style={{ color: "var(--cp-muted)" }}>
                @{user?.username || "student"}
              </p>
              <p className="text-xs font-bold" style={{ color: "var(--cp-text)" }}>
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
            style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
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
          <Flame size={18} style={{ color: "var(--cp-muted)" }} />
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
          <Calendar size={18} style={{ color: "var(--cp-muted)" }} />
        </div>
        <div className="flex flex-col gap-2">
          {events.length === 0 ? (
            <p className="text-xs text-center p-4" style={{ color: "var(--cp-muted)" }}>
              No upcoming events
            </p>
          ) : (
            events.map((ev) => {
              const dateObj = new Date(ev.date);
              const day = dateObj.getDate();
              const month = dateObj.toLocaleString("en-US", { month: "short" });
              
              return (
                <div
                  key={ev._id}
                  className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{
                    background: ev.highlight ? "var(--cp-primary-20)" : "var(--cp-surface-2)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0"
                    style={{
                      background: ev.highlight ? "var(--cp-primary)" : "var(--cp-border)",
                      color: ev.highlight ? "#fff" : "var(--cp-muted)",
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
                      {ev.title}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>
                      {ev.venue} {ev.time ? `• ${ev.time}` : ''}
                    </p>
                  </div>
                </div>
              );
            })
          )}
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
        style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
          Paglu Pro ⚡
        </p>
        <p className="text-xs leading-relaxed mb-3 opacity-90">
          Unlock priority confessions, analytics &amp; more.
        </p>
        <button
          onClick={() => setShowProModal(true)}
          className="w-full bg-white text-[10px] font-bold py-2 rounded-lg hover:opacity-90 transition-all active:scale-95"
          style={{ color: "var(--cp-primary)" }}
        >
          Upgrade Now ⚡
        </button>
      </div>

      {/* ── Paglu Pro Coming Soon Modal ── */}
      {showProModal && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", zIndex: 9999 }}
          onClick={() => setShowProModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ animation: "proModalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div
              className="relative px-6 pt-10 pb-8 text-center"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)" }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-20" style={{ background: "#fff", filter: "blur(40px)", transform: "translate(-30%, -30%)" }} />
              <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ background: "#fff", filter: "blur(30px)", transform: "translate(30%, 30%)" }} />

              <div className="relative">
                <div className="text-5xl mb-3">⚡</div>
                <h2 className="text-2xl font-black text-white mb-1">Paglu Pro</h2>
                <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>The campus experience, supercharged</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-10" style={{ background: "var(--cp-surface)" }}>
              {/* Premium Coming Soon Animation/Badge */}
              <div
                className="relative text-center py-8 rounded-3xl mb-8 overflow-hidden group"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(236,72,153,0.05))", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))" }} />
                
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)", animation: "float 3s ease-in-out infinite" }}>
                    <span className="text-3xl text-white">🚀</span>
                  </div>
                  
                  <h3 className="text-3xl font-black mb-2 tracking-tight" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Coming Soon
                  </h3>
                  
                  <p className="text-sm font-medium px-4 leading-relaxed" style={{ color: "var(--cp-muted)" }}>
                    We&apos;re brewing something extraordinary behind the scenes. The ultimate campus upgrade drops soon.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowProModal(false)}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: "var(--cp-surface-2)", color: "var(--cp-muted)" }}
              >
                Got it, I&apos;ll wait! 😎
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes proModalIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </aside>
  );
}