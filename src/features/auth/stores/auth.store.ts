/**
 * Auth Store
 * 
 * Zustand store for authentication state management.
 * Provides persistent auth state across app restarts.
 */

import { create } from 'zustand';
import { AuthState, User, Tokens } from '../types';
import { tokenStorage, userStorage, lastActiveStorage } from '@/utils/storage';
import { env } from '@/config/env';
import { SESSION_CONFIG } from '@/config/constants';

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  user: null,
  tokens: null,
  error: null,

  /**
   * Initialize auth state from storage
   * Called on app start to restore session
   */
  initialize: async () => {
    if (get().isInitialized) return;

    try {
      set({ isLoading: true, error: null });

      // Check for existing tokens
      const [accessToken, refreshToken, user] = await Promise.all([
        tokenStorage.getAccessToken(),
        tokenStorage.getRefreshToken(),
        userStorage.getUser(),
      ]);

      let hasValidTokens = !!accessToken && !!refreshToken;

      // Check if session has expired (inactive for > 7 days)
      if (hasValidTokens) {
        const lastActive = await lastActiveStorage.get();
        if (lastActive) {
          const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
          if (daysSinceActive > SESSION_CONFIG.EXPIRY_DAYS) {
            if (env.ENABLE_DEBUG_LOGS) {
              console.log(`🔐 Session expired: inactive for ${daysSinceActive.toFixed(1)} days (limit: ${SESSION_CONFIG.EXPIRY_DAYS})`);
            }
            // Clear tokens and force re-login
            await tokenStorage.clearAll();
            await lastActiveStorage.clear();
            hasValidTokens = false;
          }
        }
      }

      if (env.ENABLE_DEBUG_LOGS) {
        console.log('🔐 Auth initialized:', {
          hasTokens: hasValidTokens,
          hasUser: !!user,
        });
      }

      set({
        isAuthenticated: hasValidTokens,
        tokens: hasValidTokens
          ? { accessToken: accessToken!, refreshToken: refreshToken! }
          : null,
        user: hasValidTokens ? (user as User) : null,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        isAuthenticated: false,
        tokens: null,
        user: null,
        isInitialized: true,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  },

  /**
   * Login - store tokens and user data
   */
  login: async (tokens: Tokens, user: User) => {
    try {
      set({ isLoading: true, error: null });

      // Store tokens, user, and record last active timestamp
      await Promise.all([
        tokenStorage.setTokens(tokens),
        userStorage.setUser(user),
        lastActiveStorage.set(),
      ]);

      set({
        isAuthenticated: true,
        tokens,
        user,
        isLoading: false,
      });

      if (env.ENABLE_DEBUG_LOGS) {
        console.log('✅ Logged in:', user.name || user.phone);
      }
    } catch (error) {
      console.error('Login error:', error);
      set({
        isLoading: false,
        error: 'Failed to save login data',
      });
      throw error;
    }
  },

  /**
   * Logout - clear all auth data
   */
  logout: async () => {
    try {
      set({ isLoading: true, error: null });

      // Clear storage
      await tokenStorage.clearAll();

      set({
        isAuthenticated: false,
        tokens: null,
        user: null,
        isLoading: false,
      });

      if (env.ENABLE_DEBUG_LOGS) {
        console.log('✅ Logged out');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if storage fails
      set({
        isAuthenticated: false,
        tokens: null,
        user: null,
        isLoading: false,
      });
    }
  },

  /**
   * Update user data
   */
  setUser: (user: User) => {
    set({ user });
    // Also update storage
    userStorage.setUser(user);
  },

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  /**
   * Set error
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));

// Selector hooks for performance optimization
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);

export default useAuthStore;
