"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useFeedStore } from "@/store/useFeedStore";
import toast from "react-hot-toast";
import { useTheme } from "@/app/context/ThemeContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setSearchQuery } = useFeedStore();
  const { theme, toggleTheme } = useTheme();
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== "/") router.push("/");
    setSearchQuery(searchInput);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  const displayName = user?.displayName || user?.name || user?.username || "";
  const avatar = user?.avatar;

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 px-6 py-3"
      style={{ background: "var(--cp-surface)", borderBottom: "1px solid var(--cp-border)" }}
    >
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)" }}>
          <span className="material-symbols-outlined text-lg" style={{ color: "var(--cp-muted)" }}>search</span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--cp-text)" }}
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-all hover:opacity-80"
          style={{ color: "var(--cp-muted)" }}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-xl">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
        </button>

        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <Link href="/notifications"
              className="relative p-2 rounded-xl transition-all hover:opacity-80"
              style={{ color: pathname === "/notifications" ? "var(--cp-primary)" : "var(--cp-muted)" }}>
              <span className="material-symbols-outlined text-xl">notifications</span>
            </Link>

            {/* User avatar dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 rounded-xl transition-all hover:opacity-90">
                <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: "var(--cp-surface-2)" }}>
                  {avatar
                    ? <img src={avatar} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: "var(--cp-primary)" }}>
                        {displayName[0]?.toUpperCase()}
                      </div>}
                </div>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 overflow-hidden"
                style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--cp-border)" }}>
                  <p className="text-sm font-bold" style={{ color: "var(--cp-text)" }}>{displayName}</p>
                  {user?.username && <p className="text-xs" style={{ color: "var(--cp-muted)" }}>@{user.username}</p>}
                </div>
                <Link href={`/profile/${user?._id}`} className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--cp-text)" }}>
                  <span className="material-symbols-outlined text-lg">person</span> Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--cp-text)" }}>
                  <span className="material-symbols-outlined text-lg">settings</span> Settings
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--cp-error)", borderTop: "1px solid var(--cp-border)" }}>
                  <span className="material-symbols-outlined text-lg">logout</span> Log out
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link href="/login"
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "var(--cp-primary)", color: "#fff" }}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
}