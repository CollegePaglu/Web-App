"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  Home,
  Lock,
  BookOpen,
  User,
  Bell,
} from "lucide-react";

type TabItem = {
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; fill?: string }>;
  label: string;
  highlight?: boolean;
};

const TABS: TabItem[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/notes", icon: BookOpen, label: "Notes", highlight: true },
  { href: "/confessions", icon: Lock, label: "Confess" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const profileTab: TabItem = isAuthenticated && user
    ? { href: `/profile/${user._id || user.id}`, icon: User, label: "Profile" }
    : { href: "/notifications", icon: Bell, label: "Alerts" };

  const allTabs: TabItem[] = [...TABS, profileTab];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden pb-safe"
      style={{
        background: "var(--cp-surface)",
        borderTop: "1px solid var(--cp-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex w-full items-stretch px-1 pt-1">
        {allTabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          const showBadge = tab.href === "/notifications" && unreadCount > 0;
          const highlight = tab.highlight === true;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 min-w-0 ${
                highlight
                  ? `nav-notes-bottom${isActive ? " nav-notes-bottom--active" : ""}`
                  : "py-2.5"
              }`}
              style={{
                color: isActive ? "var(--cp-primary)" : highlight ? "var(--cp-text)" : "var(--cp-muted)",
              }}
            >
              <div className="relative">
                <Icon
                  size={highlight ? 24 : 22}
                  strokeWidth={isActive || highlight ? 2.5 : 1.8}
                  fill={isActive ? "currentColor" : "none"}
                />
                {highlight && (
                  <span
                    className="absolute -top-1.5 -right-2 text-[7px] font-black px-1 py-px rounded nav-notes-badge leading-none"
                    style={{ fontSize: "6px", padding: "1px 3px" }}
                  >
                    NEW
                  </span>
                )}
                {showBadge && (
                  <span
                    className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full"
                    style={{
                      background: "var(--cp-error)",
                      border: "2px solid var(--cp-surface)",
                    }}
                  />
                )}
              </div>
              <span
                className="text-[10px] leading-none truncate max-w-full px-0.5"
                style={{ fontWeight: isActive || highlight ? 700 : 500 }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
