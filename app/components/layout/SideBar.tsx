"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";

const navItems = [
  { label: "Home", icon: "home", href: "/feed" },
  { label: "Confessions", icon: "chat_bubble", href: "/confessions" },
  { label: "Memes", icon: "mood", href: "/memes" },
  { label: "Societies", icon: "groups", href: "/societies" },
  { label: "Leaderboard", icon: "leaderboard", href: "/leaderboard" },
];

export default function SideBar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="w-80 sticky top-0 h-screen flex flex-col py-8 px-4"
      style={{
        background: "var(--cp-surface)",
        borderRight: "1px solid var(--cp-border)",
      }}
    >
      {/* Brand */}
      <div className="mb-10 px-2">
        <img src="/BrandAssets/CollegePagluSVG/svg" alt="" />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-semibold transition-all duration-200"
              style={{
                background: isActive ? "var(--cp-primary-10)" : "transparent",
                color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
              }}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="mt-auto pt-6 flex flex-col gap-4"
        style={{ borderTop: "1px solid var(--cp-border)" }}
      >
        <button
          className="w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "var(--cp-primary)",
            color: "#fff",
          }}
        >
          Post Update
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-semibold transition-all"
          style={{ color: "var(--cp-muted)" }}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-lg">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <div className="flex flex-col gap-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 py-2 px-4 text-xs transition-all"
            style={{ color: "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            Settings
          </Link>
          <Link
            href="/support"
            className="flex items-center gap-3 py-2 px-4 text-xs transition-all"
            style={{ color: "var(--cp-muted)" }}
          >
            <span className="material-symbols-outlined text-lg">help</span>
            Support
          </Link>
        </div>
      </div>
    </aside>
  );
}