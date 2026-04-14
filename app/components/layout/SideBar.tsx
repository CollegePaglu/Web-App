"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/app/context/ThemeContext";

const navItems = [
  { label: "Home", icon: "home", href: "/" },
  { label: "Explore", icon: "explore", href: "/explore" },
  { label: "Confessions", icon: "chat_bubble", href: "/confessions" },
  { label: "Memes", icon: "mood", href: "/memes" },
  { label: "Societies", icon: "groups", href: "/societies" },
  { label: "Leaderboard", icon: "leaderboard", href: "/leaderboard" },
];

const authNavItems = [
  { label: "Notifications", icon: "notifications", href: "/notifications" },
  { label: "Profile", icon: "person", href: "/profile" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuthStore();

  const displayName = user?.displayName || user?.name || user?.username || "Guest";
  const avatar = user?.avatar;

  return (
    <aside
      className="w-72 sticky top-0 h-screen flex flex-col py-6 px-3 overflow-y-auto"
      style={{ background: "var(--cp-surface)", borderRight: "1px solid var(--cp-border)" }}
    >
      {/* Brand */}
      <div className="mb-8 px-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shrink-0"
            style={{ background: "var(--cp-primary)", color: "#fff" }}
          >CP</div>
          <div>
            <h1 className="text-base font-extrabold leading-none" style={{ color: "var(--cp-text)" }}>
              College Paglu
            </h1>
            <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>Campus community</p>
          </div>
        </div>
      </div>

      {/* User mini card (if logged in) */}
      {isAuthenticated && user && (
        <Link
          href={`/profile/${user._id}`}
          className="flex items-center gap-3 p-3 rounded-2xl mb-4 transition-all hover:opacity-90"
          style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)" }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"
            style={{ background: "var(--cp-primary-10)" }}>
            {avatar
              ? <img src={avatar} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-sm font-bold"
                  style={{ color: "var(--cp-primary)" }}>
                  {displayName[0]?.toUpperCase()}
                </div>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: "var(--cp-text)" }}>{displayName}</p>
            {user.username && (
              <p className="text-[10px] truncate" style={{ color: "var(--cp-muted)" }}>@{user.username}</p>
            )}
          </div>
          {user.streak != null && user.streak > 0 && (
            <div className="ml-auto text-xs font-black shrink-0 flex items-center gap-0.5" style={{ color: "var(--cp-accent)" }}>
              🔥 {user.streak}
            </div>
          )}
        </Link>
      )}

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
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
              <span className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--cp-primary)" }} />
              )}
            </Link>
          );
        })}

        {isAuthenticated && (
          <>
            <div className="my-2 mx-4" style={{ borderTop: "1px solid var(--cp-border)" }} />
            {authNavItems.map((item) => {
              const href = item.href === "/profile" ? `/profile/${user?._id}` : item.href;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={href}
                  className="flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: isActive ? "var(--cp-primary-10)" : "transparent",
                    color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
                  }}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="pt-4 flex flex-col gap-3" style={{ borderTop: "1px solid var(--cp-border)" }}>
        {isAuthenticated ? (
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              document.dispatchEvent(new CustomEvent("open-create-post"));
            }}
            className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-center transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--cp-primary)", color: "#fff" }}
          >
            ✍️ Post Update
          </Link>
        ) : (
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-center transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--cp-primary)", color: "#fff" }}
          >
            Login to Post
          </Link>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-semibold transition-all"
          style={{ color: "var(--cp-muted)" }}
        >
          <span className="material-symbols-outlined text-lg">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}