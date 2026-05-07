"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/app/context/ThemeContext";
import toast from "react-hot-toast";
import { Sun, Moon, Check, LogOut } from "lucide-react";

// ── Appearance Section ───────────────────────────────────────────────────────
function AppearanceSection() {
  const { theme, toggleTheme } = useTheme();

  const themes = [
    { key: "light", label: "Light", icon: Sun, desc: "Clean and bright" },
    { key: "dark",  label: "Dark",  icon: Moon,  desc: "Easy on the eyes" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--cp-muted)" }}>Theme</p>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((t) => {
          const isActive = theme === t.key;
          return (
            <button key={t.key} onClick={() => { if (!isActive) toggleTheme(); }}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
              style={{
                background: isActive ? "var(--cp-primary-10)" : "var(--cp-surface-2)",
                border: `2px solid ${isActive ? "var(--cp-primary)" : "transparent"}`,
                color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
              }}>
              <t.icon size={24} />
              <span>{t.label}</span>
              <span className="text-[10px] opacity-70 font-normal">{t.desc}</span>
              {isActive && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out 👋");
    router.push("/login");
  };

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold mb-6" style={{ color: "var(--cp-text)" }}>Settings</h1>

        {/* Appearance */}
        <div className="rounded-3xl p-6 mb-4"
          style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
          <AppearanceSection />
        </div>

        {/* Logout — always visible */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-80"
          style={{ background: "#EF444415", color: "#EF4444", border: "1px solid #EF444430" }}>
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </MainLayout>
  );
}
