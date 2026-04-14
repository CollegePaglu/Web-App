import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cp_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("cp_refresh_token");
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });
        const newToken = data.data?.accessToken;
        if (newToken) {
          localStorage.setItem("cp_access_token", newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem("cp_access_token");
        localStorage.removeItem("cp_refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (phone: string) => api.post("/auth/otp/send", { phone }),
  verifyOtp: (phone: string, otp: string) =>
    api.post("/auth/otp/verify", { phone, otp }),
  logout: () => api.post("/auth/logout"),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
};

// ── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get("/users/me"),
  updateProfile: (data: Record<string, unknown>) => api.patch("/users/me", data),
  completeProfile: (data: Record<string, unknown>) => api.post("/users/me/complete", data),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return api.post("/users/me/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getUser: (id: string) => api.get(`/users/${id}`),
  searchUsers: (q: string, page = 1) =>
    api.get(`/users/search?q=${encodeURIComponent(q)}&page=${page}`),
  getStatus: () => api.get("/users/me/status"),
};

// ── Community / Posts ────────────────────────────────────────────────────────
export const postsApi = {
  getFeed: (params?: {
    page?: number;
    limit?: number;
    sortBy?: "recent" | "trending" | "top";
    type?: string;
    search?: string;
  }) => api.get("/community/posts", { params }),

  getPost: (id: string) => api.get(`/community/posts/${id}`),

  createPost: (formData: FormData) =>
    api.post("/community/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deletePost: (id: string) => api.delete(`/community/posts/${id}`),

  vote: (id: string, type: "up" | "down") =>
    api.post(`/community/posts/${id}/vote`, { type }),

  removeVote: (id: string) => api.delete(`/community/posts/${id}/vote`),

  getComments: (id: string, page = 1) =>
    api.get(`/community/posts/${id}/comments?page=${page}`),

  addComment: (id: string, content: string, isAnonymous = false, parentId?: string) =>
    api.post(`/community/posts/${id}/comments`, { content, isAnonymous, parentId }),

  getMyPosts: (page = 1) => api.get(`/community/posts/my?page=${page}`),

  uploadMedia: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("media", f));
    return api.post("/community/media/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ── Follow ───────────────────────────────────────────────────────────────────
export const followApi = {
  follow: (userId: string) => api.post(`/users/${userId}/follow`),
  unfollow: (userId: string) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId: string, page = 1) =>
    api.get(`/users/${userId}/followers?page=${page}`),
  getFollowing: (userId: string, page = 1) =>
    api.get(`/users/${userId}/following?page=${page}`),
};

// ── Colleges ─────────────────────────────────────────────────────────────────
export const collegesApi = {
  list: () => api.get("/colleges"),
};

export default api;
