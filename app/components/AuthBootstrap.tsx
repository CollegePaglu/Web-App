"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Runs on mount to hydrate the user session from localStorage token.
 * Renders nothing — purely side-effect bootstrap.
 */
export default function AuthBootstrap() {
  const { isAuthenticated, fetchMe, accessToken } = useAuthStore();

  useEffect(() => {
    const token = accessToken || localStorage.getItem("cp_access_token");
    if (token && !isAuthenticated) {
      fetchMe();
    }
  }, []);

  return null;
}
