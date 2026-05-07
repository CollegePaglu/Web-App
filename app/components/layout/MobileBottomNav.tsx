"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  Home,
  MessageCircle,
  Lock,
  Smile,
  User,
  Bell,
} from "lucide-react";

const TABS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/gossips", icon: MessageCircle, label: "Gossips" },
  { href: "/confessions", icon: Lock, label: "Confess" },
  { href: "/memes", icon: Smile, label: "Memes" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  // Determine which tab should show profile or notifications
  const profileTab = isAuthenticated && user
    ? { href: `/profile/${user._id || user.id}`, icon: User, label: "Profile" }
    : { href: "/notifications", icon: Bell, label: "Alerts" };

  const allTabs = [...TABS, profileTab];

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
      <div className="flex w-full">
        {allTabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          const showBadge = tab.href === "/notifications" && unreadCount > 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all active:scale-90"
              style={{
                color: isActive ? "var(--cp-primary)" : "var(--cp-muted)",
              }}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  fill={isActive ? "currentColor" : "none"}
                />
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
                className="text-[10px] font-semibold leading-none"
                style={{
                  fontWeight: isActive ? 700 : 500,
                }}
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
