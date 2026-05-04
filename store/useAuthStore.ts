"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, usersApi, tokenStorage } from "@/lib/api";

export interface User {
  _id: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
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
          
          // Use centralized token storage (matches AppV1)
          tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
          
          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
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
          tokenStorage.clear();
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
        tokenStorage.clear();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: "cp-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
