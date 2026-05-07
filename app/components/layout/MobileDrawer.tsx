"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/app/context/ThemeContext";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  Home,
  Megaphone,
  MessageCircle,
  Lock,
  Smile,
  Trophy,
  Bell,
  Settings,
  LogIn,
  LogOut,
  Sun,
  Moon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home",        icon: Home,          href: "/" },
  { label: "Updates",     icon: Megaphone,     href: "/updates" },
  { label: "Gossips",     icon: MessageCircle, href: "/gossips" },
  { label: "Confessions", icon: Lock,          href: "/confessions" },
  { label: "Memes",       icon: Smile,         href: "/memes" },
  { label: "Leaderboard", icon: Trophy,        href: "/leaderboard" },
];

const AUTH_NAV = [
  { label: "Notifications", icon: Bell,     href: "/notifications" },
  { label: "Settings",      icon: Settings, href: "/settings" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotificationStore();

  const displayName =
    user?.displayName ||
    user?.name ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) ||
    user?.username ||
    "Guest";
  const avatar = user?.avatar;
  const initial = displayName[0]?.toUpperCase();

  const handleLogout = async () => {
    onClose();
    await logout();
    toast.success("Logged out");
    router.push("/login");
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 lg:hidden animate-fade-in"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col overflow-y-auto scrollbar-hide animate-slide-in-left lg:hidden"
        style={{
          background: "var(--cp-surface)",
          borderRight: "1px solid var(--cp-border)",
        }}
      >
        <div className="flex flex-col h-full py-5 px-3">
          {/* Header with close */}
          <div className="flex items-center justify-between px-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/BrandAssets/CollegePagluSVG.svg"
              alt="College Paglu"
              className="h-12 w-auto object-contain"
              style={{ filter: theme === "dark" ? "invert(1)" : "none" }}
            />
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all hover:opacity-70"
              style={{ color: "var(--cp-muted)", background: "var(--cp-surface-2)" }}
            >
              <X size={18} />
            </button>
          </div>

          {/* User mini card */}
          {isAuthenticated && user && (
            <Link
              href={`/profile/${user._id || user.id}`}
              onClick={onClose}
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
                  <Image
                    src={avatar}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    alt=""
                    unoptimized
                  />
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

          {/* Main nav */}
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: isActive ? "var(--cp-primary-10)" : "transparent",
                    color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    fill={isActive ? "currentColor" : "none"}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--cp-primary)" }}
                    />
                  )}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <div
                  className="my-2 mx-1"
                  style={{ borderTop: "1px solid var(--cp-border)" }}
                />
                {AUTH_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  const badge = item.href === "/notifications" ? unreadCount : 0;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: isActive ? "var(--cp-primary-10)" : "transparent",
                        color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
                      }}
                    >
                      <div className="relative">
                        <Icon
                          size={20}
                          strokeWidth={isActive ? 2.5 : 1.8}
                          fill={isActive ? "currentColor" : "none"}
                        />
                        {badge > 0 && (
                          <span
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                            style={{
                              background: "var(--cp-error)",
                              border: "2px solid var(--cp-surface)",
                            }}
                          />
                        )}
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="flex-1" />

          {/* Footer */}
          <div className="pt-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--cp-border)" }}>
            {!isAuthenticated ? (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 w-full"
                style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
              >
                <LogIn size={18} />
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-sm transition-all hover:opacity-80 w-full"
                style={{ background: "#EF444415", color: "#EF4444" }}
              >
                <LogOut size={18} />
                Log Out
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 py-2 px-4 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: "var(--cp-muted)" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
