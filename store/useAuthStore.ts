"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, usersApi } from "@/lib/api";

export interface User {
  _id: string;
  id?: string;
  name?: string;
  displayName?: string;
  username?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  college?: { _id: string; name: string };
  collegeId?: string;
  role?: string;
  isProfileComplete?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  xp?: number;
  streak?: number;
  lastActiveDate?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions — phone-based
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<{ needsProfile: boolean }>;
  completeProfile: (data: Record<string, unknown>) => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      sendOtp: async (phone) => {
        set({ isLoading: true });
        try {
          await authApi.sendOtp(phone);
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (phone, otp) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.verifyOtp(phone, otp);
          const { tokens, user, isNewUser } = data.data;
          const { accessToken, refreshToken } = tokens;
          localStorage.setItem("cp_access_token", accessToken);
          localStorage.setItem("cp_refresh_token", refreshToken);
          document.cookie = `cp_access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
          });
          return { needsProfile: isNewUser || !user?.isProfileComplete };
        } finally {
          set({ isLoading: false });
        }
      },

      completeProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const { data } = await usersApi.completeProfile(profileData);
          set({ user: data.data, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await usersApi.getMe();
          set({ user: data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null });
          localStorage.removeItem("cp_access_token");
          localStorage.removeItem("cp_refresh_token");
          if (typeof document !== "undefined") {
            document.cookie = "cp_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const { data } = await usersApi.updateProfile(profileData);
          set({ user: data.data });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch { /* ignore */ }
        localStorage.removeItem("cp_access_token");
        localStorage.removeItem("cp_refresh_token");
        document.cookie = "cp_access_token=; path=/; max-age=0";
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: "cp-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
