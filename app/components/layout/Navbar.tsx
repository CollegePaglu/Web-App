"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useFeedStore } from "@/store/useFeedStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import toast from "react-hot-toast";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import MobileDrawer from "./MobileDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { setSearchQuery } = useFeedStore();
  const [searchInput, setSearchInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Poll for notifications every 30 seconds if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const intervalId = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, fetchUnreadCount]);

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
    <>
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-4 lg:px-6 py-3 shrink-0"
        style={{
          background: "var(--cp-surface)",
          borderBottom: "1px solid var(--cp-border)",
        }}
      >
        {/* Mobile Hamburger Menu */}
        <button
          className="lg:hidden p-2 -ml-2 rounded-xl transition-colors hover:opacity-80"
          style={{ color: "var(--cp-text)" }}
          onClick={() => setMobileDrawerOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/BrandAssets/CollegePagluSVG.svg"
            alt="College Paglu"
            className="h-8 w-auto object-contain dark:invert"
          />
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden sm:block ml-auto lg:ml-0">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "var(--cp-surface-2)",
              border: "1px solid var(--cp-border)",
            }}
          >
            <Search size={18} className="shrink-0" style={{ color: "var(--cp-muted)" }} />
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

        {/* Mobile Search Icon (only visible on very small screens if needed, otherwise hidden) */}
        <div className="sm:hidden ml-auto">
           <Link href="/explore" className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
             <Search size={22} />
           </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:ml-auto">
          {mounted && isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                style={{
                  color: pathname === "/notifications" ? "var(--cp-primary)" : "var(--cp-muted)",
                  background: pathname === "/notifications" ? "var(--cp-primary-10)" : "transparent",
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span 
                    className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
                    style={{ background: "var(--cp-error)", border: "2px solid var(--cp-surface)" }}
                  />
                )}
              </Link>

              {/* Avatar + Dropdown (Desktop Only) */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 p-1.5 rounded-xl transition-all hover:opacity-90 ml-1"
                >
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)" }}
                  >
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      initial || "U"
                    )}
                  </div>
                  <ChevronDown size={16} style={{ color: "var(--cp-muted)" }} />
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
                        { href: `/profile/${user?._id}`, icon: User, label: "Profile" },
                        { href: "/settings", icon: Settings, label: "Settings" },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm transition-all hover:opacity-80"
                          style={{ color: "var(--cp-text)" }}
                        >
                          <Icon size={18} />
                          {label}
                        </Link>
                      ))}

                      <div style={{ borderTop: "1px solid var(--cp-border)" }}>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:opacity-80"
                          style={{ color: "var(--cp-error)" }}
                        >
                          <LogOut size={18} />
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

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </>
  );
}