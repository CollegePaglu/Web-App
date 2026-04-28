"use client";
import { useEffect, useState } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useNotificationStore } from "@/store/useNotificationStore";

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const NOTIF_ICONS: Record<string, string> = {
  LIKE: "thumb_up",
  COMMENT: "chat_bubble",
  FOLLOW: "person_add",
  SYSTEM: "notifications",
};

const NOTIF_COLORS: Record<string, string> = {
  LIKE: "var(--cp-accent)",
  COMMENT: "var(--cp-blue)",
  FOLLOW: "var(--cp-primary)",
  SYSTEM: "var(--cp-muted)",
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const { 
    notifications, 
    isLoading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    unreadCount 
  } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchNotifications(true);
  }, [isAuthenticated, fetchNotifications]);

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--cp-text)" }}>Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs mt-0.5" style={{ color: "var(--cp-muted)" }}>{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ color: "var(--cp-primary)", background: "var(--cp-primary-10)" }}>
              Mark all read
            </button>
          )}
        </div>

        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cp-card p-4 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full" style={{ background: "var(--cp-surface-2)" }} />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 rounded w-3/4" style={{ background: "var(--cp-surface-2)" }} />
                  <div className="h-2 rounded w-1/3" style={{ background: "var(--cp-surface-2)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--cp-muted)" }}>
            <span className="material-symbols-outlined text-6xl block mb-3 opacity-30">notifications_none</span>
            <p className="text-base font-bold">All caught up!</p>
            <p className="text-sm opacity-70">No new notifications</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <div key={n._id}
                className="cp-card p-4 flex items-center gap-4 transition-all cursor-pointer hover:opacity-90"
                style={{
                  background: n.isRead ? "var(--cp-surface)" : "var(--cp-primary-10)",
                  borderLeft: n.isRead ? undefined : `3px solid var(--cp-primary)`,
                }}
                onClick={() => !n.isRead && markAsRead(n._id)}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: (NOTIF_COLORS[n.type] || NOTIF_COLORS.SYSTEM) + "20" }}>
                  <span className="material-symbols-outlined text-lg" style={{ color: NOTIF_COLORS[n.type] || NOTIF_COLORS.SYSTEM }}>
                    {NOTIF_ICONS[n.type] || NOTIF_ICONS.SYSTEM}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug" style={{ color: "var(--cp-text)", fontWeight: n.isRead ? 400 : 600 }}>
                    {n.message}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--cp-muted)" }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--cp-primary)" }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
