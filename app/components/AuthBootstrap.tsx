"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { pingUserActivity } from "@/lib/activity";

/**
 * Runs on mount to hydrate the user session from localStorage token.
 * Renders nothing — purely side-effect bootstrap.
 */
export default function AuthBootstrap() {
  const { isAuthenticated, fetchMe, accessToken } = useAuthStore();

  useEffect(() => {
    const token = accessToken || localStorage.getItem("cp_access_token");
    if (token && !isAuthenticated) {
      fetchMe().then(() => pingUserActivity());
    } else if (isAuthenticated) {
      pingUserActivity();
    } else if (!token) {
      // Emergency purge of lingering cookies that might cause Next.js middleware infinite redirect loops
      if (typeof document !== "undefined" && document.cookie.includes("cp_access_token")) {
        document.cookie = "cp_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
  }, []);

  return null;
}
