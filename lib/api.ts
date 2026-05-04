/**
 * API Client — Production-grade (matches AppV1/backend architecture)
 *
 * Endpoints:  POST /auth/otp/send  →  { phone }
 *             POST /auth/otp/verify →  { phone, otp }  → { tokens, user, isNewUser }
 *             POST /auth/refresh    →  { refreshToken } → { accessToken, refreshToken }
 *             POST /auth/logout     (authenticated)
 *             GET  /users/me
 *             PATCH/POST /users/me/complete
 *
 * Token storage (web-safe):
 *   localStorage["cp_access_token"]  — read by axios interceptor
 *   localStorage["cp_refresh_token"] — used for auto-refresh
 *   cookie "cp_access_token"         — read by Next.js middleware for SSR route protection
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const TOKEN_KEY   = "cp_access_token";
const REFRESH_KEY = "cp_refresh_token";
const COOKIE_MAX_AGE = 86400; // 24 h

// ── Token helpers (localStorage + cookie) ────────────────────────────────────
export const tokenStorage = {
  getAccess:   () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY)   : null),
  getRefresh:  () => (typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null),

  setAccess(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    // Keep cookie in sync so Next.js middleware can read it server-side
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  },

  setRefresh(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_KEY, token);
  },

  setTokens(access: string, refresh: string) {
    this.setAccess(access);
    this.setRefresh(refresh);
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  },
};

// ── Create Axios instance ─────────────────────────────────────────────────────
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

// ── Request interceptor: inject Bearer token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Remove Content-Type for GET / DELETE so browser sets it correctly
  const method = config.method?.toLowerCase();
  if (method === "get" || method === "delete" || method === "head") {
    config.data = undefined;
    delete (config.headers as Record<string, unknown>)["Content-Type"];
    delete (config.headers as Record<string, unknown>)["content-type"];
  }
  return config;
});

import { resolvePublicMediaUrl } from "./resolveMediaUrl";

function fixMediaUrls(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(fixMediaUrls);
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      if (
        key === "avatar" ||
        key === "mediaUrl" ||
        key === "profilePicture" ||
        key === "videoUrl" ||
        key === "thumbnailUrl" ||
        key === "url"
      ) {
        result[key] = resolvePublicMediaUrl(value);
      } else {
        result[key] = value;
      }
    } else if (key === "images" && Array.isArray(value)) {
      result[key] = value.map((v) => (typeof v === "string" ? resolvePublicMediaUrl(v) : fixMediaUrls(v)));
    } else if (typeof value === "object") {
      result[key] = fixMediaUrls(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ── Response interceptor: auto-refresh on 401 & fix media URLs ──────────────
api.interceptors.response.use(
  (res) => {
    if (res.data) {
      res.data = fixMediaUrls(res.data);
    }
    return res;
  },
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) {
        tokenStorage.clear();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }

      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
              refreshToken,
            });
            const payload = data.data;
            const newAccess: string = payload.accessToken;
            const newRefresh: string | undefined = payload.refreshToken;
            tokenStorage.setAccess(newAccess);
            if (newRefresh) tokenStorage.setRefresh(newRefresh);
            return newAccess;
          } catch {
            tokenStorage.clear();
            if (typeof window !== "undefined") window.location.href = "/login";
            throw new Error("Session expired");
          } finally {
            refreshPromise = null;
          }
        })();
      }

      try {
        const newAccess = await refreshPromise;
        if (original.headers) original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  /** Send OTP via MSG91 WhatsApp (same as AppV1) */
  sendOtp: (phone: string) =>
    api.post("/auth/otp/send", { phone }),

  /** Verify OTP → returns { tokens: { accessToken, refreshToken }, user, isNewUser } */
  verifyOtp: (phone: string, otp: string) =>
    api.post("/auth/otp/verify", { phone, otp }),

  /** Refresh access token */
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),

  /** Logout (invalidates session in Redis) */
  logout: () => api.post("/auth/logout"),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get("/users/me"),

  updateProfile: (data: Record<string, unknown>) =>
    api.patch("/users/me", data),

  completeProfile: (data: Record<string, unknown>) =>
    api.post("/users/me/complete", data),

  setUsername: (username: string) =>
    api.patch("/users/me/username", { username }),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return api.post("/users/me/avatar", fd);
  },

  getUser: (id: string) => api.get(`/users/${id}`),

  searchUsers: (q: string, page = 1) =>
    api.get(`/users/search`, { params: { q, page } }),

  getStatus: () => api.get("/users/me/status"),

  getLeaderboard: (limit = 20) =>
    api.get("/users/leaderboard", { params: { limit } }),
};

// ── Community / Posts ─────────────────────────────────────────────────────────
export const postsApi = {
  getFeed: (params?: {
    page?: number;
    limit?: number;
    sortBy?: "recent" | "trending" | "top";
    type?: string;
    category?: string;
    search?: string;
    authorType?: string;
    includeUpdates?: string;
  }) => api.get("/community/posts", { params }),

  getUpdates: (page = 1, limit = 20) =>
    api.get("/community/updates", { params: { page, limit } }),

  getConfessions: (page = 1, limit = 20) =>
    api.get("/community/confessions", { params: { page, limit } }),

  getTrendingTags: (limit = 5) =>
    api.get("/community/posts/trending/tags", { params: { limit } }),

  getPost: (id: string) => api.get(`/community/posts/${id}`),

  createPost: (formData: FormData) =>
    api.post("/community/posts", formData),

  deletePost: (id: string) => api.delete(`/community/posts/${id}`),

  vote: (id: string, type: "up" | "down") =>
    api.post(`/community/posts/${id}/vote`, { type }),

  removeVote: (id: string) => api.delete(`/community/posts/${id}/vote`),

  getComments: (id: string, page = 1) =>
    api.get(`/community/posts/${id}/comments`, { params: { page } }),

  addComment: (
    id: string,
    content: string,
    isAnonymous = false,
    parentId?: string
  ) => api.post(`/community/posts/${id}/comments`, { content, isAnonymous, parentId }),

  getMyPosts: (page = 1) =>
    api.get("/community/posts/my", { params: { page } }),

  uploadMedia: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("media", f));
    return api.post("/community/media/upload", fd);
  },
};

// ── Follow ────────────────────────────────────────────────────────────────────
export const followApi = {
  follow: (userId: string) => api.post(`/users/${userId}/follow`),
  unfollow: (userId: string) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId: string, page = 1) =>
    api.get(`/users/${userId}/followers`, { params: { page } }),
  getFollowing: (userId: string, page = 1) =>
    api.get(`/users/${userId}/following`, { params: { page } }),
};

// ── Colleges ──────────────────────────────────────────────────────────────────
export const collegesApi = {
  list: () => api.get("/colleges"),
};

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsApi = {
  getEvents: (params?: { page?: number; limit?: number }) =>
    api.get("/community/events", { params }),
};

export default api;
