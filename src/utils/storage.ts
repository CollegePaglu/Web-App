/**
 * Storage Utilities (Web/Next.js)
 *
 * Replaces expo-secure-store with localStorage.
 * All helpers are synchronous or async-compatible.
 */

const KEYS = {
  ACCESS_TOKEN: 'cp_access_token',
  REFRESH_TOKEN: 'cp_refresh_token',
  USER: 'cp_user',
  LAST_ACTIVE: 'cp_last_active',
} as const;

const isBrowser = () => typeof window !== 'undefined';

// ─── Token Storage ────────────────────────────────────────────────────────────

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    if (!isBrowser()) return null;
    return localStorage.getItem(KEYS.ACCESS_TOKEN);
  },
  async getRefreshToken(): Promise<string | null> {
    if (!isBrowser()) return null;
    return localStorage.getItem(KEYS.REFRESH_TOKEN);
  },
  async setTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  },
  async setAccessToken(token: string) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.ACCESS_TOKEN, token);
  },
  async setRefreshToken(token: string) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.REFRESH_TOKEN, token);
  },
  async clearAll() {
    if (!isBrowser()) return;
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.LAST_ACTIVE);
  },
};

// ─── User Storage ─────────────────────────────────────────────────────────────

export const userStorage = {
  async getUser<T = unknown>(): Promise<T | null> {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async setUser<T>(user: T) {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
};

// ─── Last Active ──────────────────────────────────────────────────────────────

export const lastActiveStorage = {
  async get(): Promise<number | null> {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(KEYS.LAST_ACTIVE);
    return raw ? Number(raw) : null;
  },
  set() {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.LAST_ACTIVE, String(Date.now()));
  },
  async clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(KEYS.LAST_ACTIVE);
  },
};
