"use client";
import SideBar from "./SideBar";
import MobileBottomNav from "./MobileBottomNav";
import { useState } from "react";
import CreatePostModal from "../features/feed/CreatePostModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Edit3 } from "lucide-react";

type Category = "GOSSIPS" | "CONFESSION" | "MEMES" | "GENERAL";

const SPEED_DIAL = [
  { category: "GENERAL"    as Category, emoji: "📝", label: "Post",        color: "#3B82F6" },
  { category: "GOSSIPS"    as Category, emoji: "🗣️", label: "Gossips",     color: "#8B5CF6" },
  { category: "CONFESSION" as Category, emoji: "🤫", label: "Confessions", color: "#EC4899" },
  { category: "MEMES"      as Category, emoji: "😂", label: "Memes",       color: "#F59E0B" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [fabOpen, setFabOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleFabClick = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setFabOpen((v) => !v);
  };

  const handleCategoryClick = (cat: Category) => {
    setFabOpen(false);
    setActiveCategory(cat);
  };

  return (
    <div
      className="flex w-full relative"
      style={{ background: "var(--cp-bg)", minHeight: "100vh" }}
    >
      {/* Left Sidebar (Desktop only) */}
      <SideBar />

      {/* Center scrollable feed */}
      <main
        className="flex-1 min-w-0 flex flex-col overflow-y-auto relative pb-20 lg:pb-0"
        style={{ height: "100vh" }}
      >
        {children}

        {/* Backdrop to close FAB on outside click */}
        {fabOpen && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setFabOpen(false)}
          />
        )}

        {/* Speed-dial sub-buttons (shown when open) */}
        {fabOpen && (
          <div className="fixed bottom-24 right-6 lg:bottom-28 lg:right-10 flex flex-col gap-3 items-end z-40">
            {SPEED_DIAL.map((item, i) => (
              <button
                key={item.category}
                onClick={() => handleCategoryClick(item.category)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: item.color,
                  color: "#fff",
                  animation: `fabItem 0.2s ease ${i * 0.05}s both`,
                  boxShadow: `0 8px 20px -4px ${item.color}80`,
                }}
              >
                <span className="text-lg leading-none">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          id="fab-create-post"
          onClick={handleFabClick}
          className="fixed bottom-20 lg:bottom-8 right-6 lg:right-10 shadow-2xl rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40"
          style={{
            background: "var(--cp-primary)", color: "var(--cp-primary-text)",
            width: "64px",
            height: "64px",
            boxShadow: "0 10px 25px -5px rgba(0,200,100,0.35)",
            transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          aria-label="Create Post"
        >
          <Edit3 size={28} />
        </button>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Create Post Modal */}
      {activeCategory && (
        <CreatePostModal
          onClose={() => setActiveCategory(null)}
          initialCategory={activeCategory}
        />
      )}

      <style>{`
        @keyframes fabItem {
          from { opacity: 0; transform: translateY(16px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}