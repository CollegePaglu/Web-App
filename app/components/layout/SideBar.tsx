"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/app/context/ThemeContext";

const NAV_ITEMS = [
  { label: "Home", icon: "home", href: "/" },
  { label: "Explore", icon: "explore", href: "/explore" },
  { label: "Confessions", icon: "chat_bubble", href: "/confessions" },
  { label: "Memes", icon: "mood", href: "/memes" },
  { label: "Societies", icon: "groups", href: "/societies" },
  { label: "Leaderboard", icon: "leaderboard", href: "/leaderboard" },
];

const AUTH_NAV = [
  { label: "Notifications", icon: "notifications", href: "/notifications" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export default function SideBar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const displayName = user?.displayName || user?.name || user?.username || "Guest";
  const avatar = user?.avatar;
  const initial = displayName[0]?.toUpperCase();

  const NavLink = ({
    href,
    icon,
    label,
    exact = false,
  }: {
    href: string;
    icon: string;
    label: string;
    exact?: boolean;
  }) => {
    const isActive = exact ? pathname === href : pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className="flex items-center gap-3 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-200 group"
        style={{
          background: isActive ? "var(--cp-primary-10)" : "transparent",
          color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
        }}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={{
            fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
            color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
          }}
        >
          {icon}
        </span>
        <span>{label}</span>
        {isActive && (
          <div
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--cp-primary)" }}
          />
        )}
      </Link>
    );
  };

  return (
    <aside
      className="w-64 flex-shrink-0 sticky top-0 h-screen flex flex-col overflow-hidden"
      style={{
        background: "var(--cp-surface)",
        borderRight: "1px solid var(--cp-border)",
      }}
    >
      {/* Inner scroll container */}
      <div className="flex flex-col h-full py-5 px-3 overflow-y-auto scrollbar-hide">
        {/* ── Brand ── */}
        <div className="flex items-center gap-3 px-3 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: "var(--cp-primary)", color: "#fff" }}
          >
            CP
          </div>
          <div>
            <p className="text-sm font-extrabold leading-none" style={{ color: "var(--cp-text)" }}>
              College Paglu
            </p>
            <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>
              Campus community
            </p>
          </div>
        </div>

        {/* ── User mini card ── */}
        {isAuthenticated && user && (
          <Link
            href={`/profile/${user._id}`}
            className="flex items-center gap-3 p-3 rounded-2xl mb-4 transition-all hover:opacity-90"
            style={{
              background: "var(--cp-surface-2)",
              border: "1px solid var(--cp-border)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)" }}
            >
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate" style={{ color: "var(--cp-text)" }}>
                {displayName}
              </p>
              {user.username && (
                <p className="text-[10px] truncate" style={{ color: "var(--cp-muted)" }}>
                  @{user.username}
                </p>
              )}
            </div>
            {(user.streak ?? 0) > 0 && (
              <span className="text-xs font-black shrink-0" style={{ color: "var(--cp-accent)" }}>
                🔥{user.streak}
              </span>
            )}
          </Link>
        )}

        {/* ── Main nav ── */}
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} exact={item.href === "/"} />
          ))}

          {isAuthenticated && (
            <>
              <div
                className="my-2 mx-1"
                style={{ borderTop: "1px solid var(--cp-border)" }}
              />
              {AUTH_NAV.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}
        </nav>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Footer ── */}
        <div
          className="pt-4 flex flex-col gap-2"
          style={{ borderTop: "1px solid var(--cp-border)" }}
        >
          {/* Post button */}
          {isAuthenticated ? (
            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--cp-primary)", color: "#fff" }}
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              New Post
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--cp-primary)", color: "#fff" }}
            >
              <span className="material-symbols-outlined text-lg">login</span>
              Login
            </Link>
          )}

          {/* Theme toggle — single source of truth */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ color: "var(--cp-muted)" }}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>
    </aside>
  );
}