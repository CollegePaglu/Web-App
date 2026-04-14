"use client";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";

const LEADERBOARD = [
  { rank: 1, name: "Aryan Singh", username: "aryan_s", xp: 12480, streak: 34, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aryan", badge: "🥇", college: "IIT Delhi" },
  { rank: 2, name: "Priya Sharma", username: "priyasharma", xp: 11230, streak: 28, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya", badge: "🥈", college: "NIT Trichy" },
  { rank: 3, name: "Rahul Verma", username: "rahulv", xp: 9870, streak: 21, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul", badge: "🥉", college: "BITS Pilani" },
  { rank: 4, name: "Nisha Kapoor", username: "nishak", xp: 8650, streak: 19, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nisha", badge: "⚡", college: "IIT Bombay" },
  { rank: 5, name: "Dev Malhotra", username: "devmalhotra", xp: 7940, streak: 15, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev", badge: "🔥", college: "DTU Delhi" },
  { rank: 6, name: "Ananya Rao", username: "ananyar", xp: 7210, streak: 12, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ananya", badge: "✨", college: "IIIT Hyderabad" },
  { rank: 7, name: "Karan Mehta", username: "karanm", xp: 6780, streak: 11, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karan", badge: "💫", college: "VIT Vellore" },
  { rank: 8, name: "Sneha Gupta", username: "snehag", xp: 6340, streak: 9, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha", badge: "🌟", college: "MNIT Jaipur" },
  { rank: 9, name: "Rohan Joshi", username: "rohanj", xp: 5920, streak: 8, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rohan", badge: "💎", college: "SRM Chennai" },
  { rank: 10, name: "Ishaan Chandra", username: "ishaanc", xp: 5480, streak: 7, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ishaan", badge: "🎯", college: "NSUT Delhi" },
];

const podiumColors = ["#FACC15", "#9CA3AF", "#C2712A"];

export default function LeaderboardPage() {
  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--cp-text)" }}>Leaderboard 🏆</h1>
          <p className="text-sm mt-1" style={{ color: "var(--cp-muted)" }}>Top campus contributors this week</p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-8">
          {[top3[1], top3[0], top3[2]].map((u, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = ["h-24", "h-32", "h-20"];
            const color = podiumColors[actualRank - 1];
            return (
              <div key={u.username} className="flex flex-col items-center gap-2">
                <img src={u.avatar} alt={u.name}
                  className="w-12 h-12 rounded-full border-2"
                  style={{ borderColor: color }} />
                <p className="text-xs font-bold text-center" style={{ color: "var(--cp-text)" }}>{u.name.split(" ")[0]}</p>
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

        {/* Rest of list */}
        <div className="flex flex-col gap-2">
          {rest.map((u) => (
            <div key={u.username} className="cp-card p-4 flex items-center gap-4">
              <span className="text-sm font-black w-6 text-center" style={{ color: "var(--cp-muted)" }}>{u.rank}</span>
              <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>{u.name}</p>
                <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>{u.college}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black" style={{ color: "var(--cp-primary)" }}>{u.xp.toLocaleString()} XP</p>
                <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>🔥 {u.streak} day streak</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
