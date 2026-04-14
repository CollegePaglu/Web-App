"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useFeedStore } from "@/store/useFeedStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setSearchQuery } = useFeedStore();
  const [searchInput, setSearchInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== "/") router.push("/");
    setSearchQuery(searchInput);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  const displayName = user?.displayName || user?.name || user?.username || "";
  const avatar = user?.avatar;
  const initial = displayName?.[0]?.toUpperCase();

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-3 px-6 py-3 shrink-0"
      style={{
        background: "var(--cp-surface)",
        borderBottom: "1px solid var(--cp-border)",
      }}
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "var(--cp-surface-2)",
            border: "1px solid var(--cp-border)",
          }}
        >
          <span className="material-symbols-outlined text-base shrink-0" style={{ color: "var(--cp-muted)" }}>
            search
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts…"
            className="flex-1 bg-transparent text-sm outline-none min-w-0"
            style={{ color: "var(--cp-text)" }}
          />
        </div>
      </form>

      {/* Right side */}
      <div className="flex items-center gap-1 ml-auto">
        {isAuthenticated ? (
          <>
            {/* Notifications */}
            <Link
              href="/notifications"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
              style={{
                color: pathname === "/notifications" ? "var(--cp-primary)" : "var(--cp-muted)",
                background: pathname === "/notifications" ? "var(--cp-primary-10)" : "transparent",
              }}
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
            </Link>

            {/* Avatar + Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 p-1.5 rounded-xl transition-all hover:opacity-90 ml-1"
              >
                <div
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)" }}
                >
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    initial || "U"
                  )}
                </div>
                <span className="material-symbols-outlined text-sm" style={{ color: "var(--cp-muted)" }}>
                  expand_more
                </span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl z-30 overflow-hidden"
                    style={{
                      background: "var(--cp-surface)",
                      border: "1px solid var(--cp-border)",
                    }}
                  >
                    {/* User info */}
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: "1px solid var(--cp-border)" }}
                    >
                      <p className="text-sm font-bold truncate" style={{ color: "var(--cp-text)" }}>
                        {displayName}
                      </p>
                      {user?.username && (
                        <p className="text-xs truncate" style={{ color: "var(--cp-muted)" }}>
                          @{user.username}
                        </p>
                      )}
                    </div>

                    {[
                      { href: `/profile/${user?._id}`, icon: "person", label: "Profile" },
                      { href: "/settings", icon: "settings", label: "Settings" },
                    ].map(({ href, icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm transition-all hover:opacity-80"
                        style={{ color: "var(--cp-text)" }}
                      >
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                        {label}
                      </Link>
                    ))}

                    <div style={{ borderTop: "1px solid var(--cp-border)" }}>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:opacity-80"
                        style={{ color: "var(--cp-error)" }}
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}