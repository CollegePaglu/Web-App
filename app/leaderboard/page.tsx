"use client";
import { useState, useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { usersApi } from "@/lib/api";
import { Trophy } from "lucide-react";

const podiumColors = ["#FACC15", "#9CA3AF", "#C2712A"];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Array<{
    _id?: string;
    username?: string;
    name: string;
    avatar: string;
    badge: string;
    xp: number;
    rank?: number;
    college?: string;
    streak?: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await usersApi.getLeaderboard(50);
        if (res.data?.success) setLeaderboard(res.data.data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--cp-text)" }}>Leaderboard 🏆</h1>
          <p className="text-sm mt-1" style={{ color: "var(--cp-muted)" }}>Top campus contributors this week</p>
        </div>

        {/* Podium */}
        {!loading && top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {[top3[1], top3[0], top3[2]].map((u, i) => {
              if (!u) return <div key={i} className="w-20" />; // empty placeholder for missing ranks
              const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const heights = ["h-24", "h-32", "h-20"];
              const color = podiumColors[actualRank - 1];
              return (
                <div key={u.username || u._id} className="flex flex-col items-center gap-2">
                  <img src={u.avatar} alt={u.name}
                    className="w-12 h-12 rounded-full border-2 object-cover"
                    style={{ borderColor: color, background: "var(--cp-surface-2)" }} />
                  <p className="text-xs font-bold text-center w-24 truncate" style={{ color: "var(--cp-text)" }}>{u.name.split(" ")[0]}</p>
                  <div className={`w-20 ${heights[i]} rounded-t-2xl flex flex-col items-center justify-center`}
                    style={{ background: color + "30", border: `2px solid ${color}` }}>
                    <span className="text-2xl">{u.badge}</span>
                    <span className="text-xs font-black" style={{ color }}>{u.xp.toLocaleString()}</span>
                    <span className="text-[10px]" style={{ color: "var(--cp-muted)" }}>XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading / Empty states */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
          </div>
        )}
        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-10" style={{ color: "var(--cp-muted)" }}>
            <Trophy size={48} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Leaderboard is empty. Be the first to earn XP!</p>
          </div>
        )}

        {/* Rest of list */}
        {!loading && rest.length > 0 && (
          <div className="flex flex-col gap-2">
            {rest.map((u) => (
              <div key={u.username || u._id} className="cp-card p-4 flex items-center gap-4">
                <span className="text-sm font-black w-6 text-center" style={{ color: "var(--cp-muted)" }}>{u.rank}</span>
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" style={{ background: "var(--cp-surface-2)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--cp-text)" }}>{u.name}</p>
                  <p className="text-[10px] truncate" style={{ color: "var(--cp-muted)" }}>{u.college}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ color: "var(--cp-primary)" }}>{u.xp.toLocaleString()} XP</p>
                  <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>🔥 {u.streak} day streak</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
