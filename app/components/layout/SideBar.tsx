"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/app/context/ThemeContext";
import { useState } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import CreatePostModal from "../features/feed/CreatePostModal";
import {
  Home,
  Megaphone,
  MessageCircle,
  Lock,
  Smile,
  Trophy,
  BookOpen,
  Bell,
  Settings,
  LogIn,
  Sun,
  Moon,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",        icon: Home,          href: "/" },
  { label: "Updates",     icon: Megaphone,     href: "/updates" },
  { label: "Gossips",     icon: MessageCircle, href: "/gossips" },
  { label: "Confessions", icon: Lock,          href: "/confessions" },
  { label: "Memes",       icon: Smile,         href: "/memes" },
  { label: "Notes",       icon: BookOpen,      href: "/notes", highlight: true },
  { label: "Leaderboard", icon: Trophy,        href: "/leaderboard" },
];

const AUTH_NAV = [
  { label: "Notifications", icon: Bell,     href: "/notifications" },
  { label: "Settings",      icon: Settings, href: "/settings" },
];

export default function SideBar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted] = useState(() => typeof window !== "undefined");

  const { unreadCount } = useNotificationStore();

  const displayName = user?.displayName || user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) || user?.username || "Guest";
  const avatar = user?.avatar;
  const initial = displayName[0]?.toUpperCase();

  const NavLink = ({ href, icon: Icon, label, exact = false, badge = 0, highlight = false }: { href: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; fill?: string; className?: string }>; label: string; exact?: boolean; badge?: number; highlight?: boolean }) => {
    const isActive = exact ? pathname === href : pathname === href || (href !== "/" && pathname.startsWith(href));
    
    const handleClick = (e: React.MouseEvent) => {
      if (href === "/" && pathname === "/") {
        e.preventDefault();
        const main = document.querySelector("main");
        if (main) main.scrollTo({ top: 0, behavior: "smooth" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        window.dispatchEvent(new CustomEvent("feed-refresh"));
      }
    };

    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`flex items-center gap-3 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-200 group relative ${
          highlight ? `nav-notes-highlight${isActive ? " nav-notes-highlight--active" : ""}` : ""
        }`}
        style={{
          background: highlight ? undefined : isActive ? "var(--cp-primary-10)" : "transparent",
          color: isActive ? "var(--cp-primary)" : highlight ? "var(--cp-text)" : "var(--cp-muted)",
        }}
      >
        <div className="relative shrink-0">
          <Icon
            size={highlight ? 24 : 20}
            strokeWidth={isActive || highlight ? 2.5 : 1.8}
            fill={isActive ? "currentColor" : "none"}
          />
          {badge > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
              style={{ background: "var(--cp-error)", border: "2px solid var(--cp-surface)" }}
            />
          )}
        </div>
        <span className={highlight ? "font-bold" : ""}>{label}</span>
        {highlight && <span className="ml-auto nav-notes-badge">NEW</span>}
        {isActive && !highlight && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--cp-primary)" }} />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className="hidden lg:flex w-64 shrink-0 sticky top-0 h-screen flex-col overflow-hidden"
        style={{ background: "var(--cp-surface)", borderRight: "1px solid var(--cp-border)" }}
      >
        <div className="flex flex-col h-full py-5 px-3 overflow-y-auto scrollbar-hide">
          {/* Brand */}
          <Link href="/" className="px-3 mb-6 block w-fit transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/BrandAssets/CollegePagluSVG.svg" 
              alt="College Paglu" 
              className="h-16 w-auto object-contain -ml-2"
              style={{ filter: theme === "dark" ? "invert(1)" : "none" }}
            />
          </Link>

          {/* User mini card */}
          {mounted && isAuthenticated && user && (
            <Link
              href={`/profile/${user._id || user.id}`}
              className="flex items-center gap-3 p-3 rounded-2xl mb-4 transition-all hover:opacity-90"
              style={{ background: "var(--cp-surface-2)", border: "1px solid var(--cp-border)" }}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)" }}>
                {avatar ? <Image src={avatar} width={36} height={36} className="w-full h-full object-cover" alt="" unoptimized /> : initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate" style={{ color: "var(--cp-text)" }}>{displayName}</p>
                {user.username && <p className="text-[10px] truncate" style={{ color: "var(--cp-muted)" }}>@{user.username}</p>}
              </div>
              {(user.streak ?? 0) > 0 && <span className="text-xs font-black shrink-0" style={{ color: "var(--cp-accent)" }}>🔥{user.streak}</span>}
            </Link>
          )}

          {/* Main nav */}
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => <NavLink key={item.href} {...item} exact={item.href === "/"} />)}
            {mounted && isAuthenticated && (
              <>
                <div className="my-2 mx-1" style={{ borderTop: "1px solid var(--cp-border)" }} />
                {AUTH_NAV.map((item) => (
                  <NavLink 
                    key={item.href} 
                    {...item} 
                    badge={item.href === "/notifications" ? unreadCount : 0} 
                  />
                ))}
              </>
            )}
          </nav>

          <div className="flex-1" />

          {/* Footer */}
          <div className="pt-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--cp-border)" }}>
            {!mounted || !isAuthenticated ? (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 w-full"
                style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
              >
                <LogIn size={18} />
                Login
              </Link>
            ) : null}

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

      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}