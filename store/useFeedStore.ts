"use client";
import { create } from "zustand";
import { postsApi } from "@/lib/api";

export interface PostMedia {
  url: string;
  key?: string;
  type?: "image" | "video";
  thumbnailUrl?: string;
}

export interface PostAuthor {
  _id: string;
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  role?: string;
}

export interface Post {
  _id: string;
  content: string;
  title?: string;
  type: "text" | "image" | "video" | "poll" | "link" | "update";
  category?: "GOSSIPS" | "CONFESSION" | "MEMES" | "GENERAL" | string;
  author?: PostAuthor;
  isAnonymous: boolean;
  media?: PostMedia[];
  images?: string[];
  videoUrl?: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  userVote?: "up" | "down" | null;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  societyId?: string;
}

// ── Demo data shown when backend returns nothing ─────────────────────────────
export const DEMO_POSTS: Post[] = [
  {
    _id: "demo_1",
    type: "text",
    isAnonymous: true,
    content: "Why does every lecturer think their subject is the ONLY one we have? 💀 4 assignments due tomorrow and I just found out about 2 of them right now.",
    upvotes: 342,
    downvotes: 8,
    commentsCount: 47,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "demo_2",
    type: "image",
    isAnonymous: false,
    title: "🎉 Techfest 2025 Registration OPEN!",
    content: "College's biggest annual tech fest is back! Register now for hackathon, robo-wars, and code-jam. Prize pool ₹2 Lakhs 🏆 Link in bio.",
    author: { _id: "soc_1", displayName: "Tech Society", username: "techsoc", role: "society" },
    media: [{ url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format", type: "image" }],
    upvotes: 891,
    downvotes: 3,
    commentsCount: 124,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: "demo_3",
    type: "text",
    isAnonymous: false,
    title: "Placement tip that actually works 🎯",
    content: "Stop grinding LeetCode randomly. Pick ONE company, study their last 30 interview questions on Glassdoor, and build 2 projects around their tech stack. Got placed in 3 weeks doing exactly this. #PlacementPrep #CSE",
    author: { _id: "user_2", displayName: "Aryan Singh", username: "aryan_s", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aryan" },
    upvotes: 567,
    downvotes: 12,
    commentsCount: 88,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    _id: "demo_4",
    type: "text",
    isAnonymous: true,
    content: "Update: I confessed to my lab partner last week. She said she likes me too 🥹 Thank you all for the courage boost. College Paglu gang W 💚",
    upvotes: 1204,
    downvotes: 4,
    commentsCount: 203,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    _id: "demo_5",
    type: "update",
    isAnonymous: false,
    title: "📢 Library Timing Extended",
    content: "The central library will now remain open till 11 PM on all weekdays during exam season. Carry your ID cards. — Admin",
    author: { _id: "admin_1", displayName: "College Administration", username: "admin", role: "admin" },
    upvotes: 445,
    downvotes: 2,
    commentsCount: 31,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    _id: "demo_6",
    type: "image",
    isAnonymous: false,
    title: "Mess food hit different today 👀",
    content: "Bro the mess actually cooked today. Paneer butter masala on a random Tuesday?? What's the occasion 🤌 #MessLife #CollegeFood",
    author: { _id: "user_3", displayName: "Priya Sharma", username: "priyasharma", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya" },
    media: [{ url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format", type: "image" }],
    upvotes: 289,
    downvotes: 5,
    commentsCount: 42,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    _id: "demo_7",
    type: "poll",
    isAnonymous: false,
    title: "Most stressful thing rn?",
    content: "Be honest. What's actually destroying you this semester? #CollegeLife #ExamSeason",
    author: { _id: "user_4", displayName: "Rahul Verma", username: "rahulv" },
    upvotes: 734,
    downvotes: 11,
    commentsCount: 156,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    _id: "demo_8",
    type: "text",
    isAnonymous: true,
    content: "My wifi lab report got a 9/10 and I literally wrote it 10 mins before class while copying from the guy next to me 💀 Meanwhile the person who spent 3 hours on it got 7. College is cooked. #CollegeHacks",
    upvotes: 923,
    downvotes: 34,
    commentsCount: 187,
    createdAt: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    _id: "demo_9",
    type: "image",
    isAnonymous: false,
    title: "Cultural Night Throwback 🎭",
    content: "Last night was unreal. Our drama team absolutely killed it 👏 Proud moment for the whole college. #CulturalNight2025 #CollegePaglu",
    author: { _id: "soc_2", displayName: "Cultural Society", username: "culturalsoc", role: "society" },
    media: [{ url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format", type: "image" }],
    upvotes: 1102,
    downvotes: 7,
    commentsCount: 98,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "demo_10",
    type: "text",
    isAnonymous: false,
    content: "Free resources for every CS student:\n🔹 CS50 (Harvard): learn.edx.org\n🔹 Missing Semester: missing.csail.mit.edu\n🔹 Roadmap.sh for tech paths\n🔹 The Odin Project for web\n🔹 fast.ai for ML\n\nSave this. You won't regret it 🙌 #LearnForFree #CSE",
    author: { _id: "user_5", displayName: "Nisha Kapoor", username: "nishak", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nisha" },
    upvotes: 1876,
    downvotes: 14,
    commentsCount: 234,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FeedState {
  posts: Post[];
  pagination: Pagination | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  currentPage: number;
  sortBy: "recent" | "trending" | "top";
  filterType: string;
  filterCategory: string;
  searchQuery: string;
  usingDemoData: boolean;

  fetchFeed: (reset?: boolean, categoryOverride?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  setSortBy: (sort: "recent" | "trending" | "top") => void;
  setFilterType: (type: string) => void;
  setFilterCategory: (category: string) => void;
  setSearchQuery: (q: string) => void;
  addPost: (post: Post) => void;
  removePost: (id: string) => void;
  updatePostVote: (id: string, upvotes: number, downvotes: number, userVote: "up" | "down" | null) => void;
  updatePostCommentCount: (id: string, delta: number) => void;
}

function applyDemoFilters(posts: Post[], sortBy: string, filterType: string, searchQuery: string): Post[] {
  let result = [...posts];
  if (filterType) result = result.filter((p) => p.type === filterType);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (p) =>
        p.content?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.author?.displayName?.toLowerCase().includes(q)
    );
  }
  if (sortBy === "trending") result.sort((a, b) => (b.upvotes + b.commentsCount * 2) - (a.upvotes + a.commentsCount * 2));
  else if (sortBy === "top") result.sort((a, b) => b.upvotes - a.upvotes);
  else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  currentPage: 1,
  sortBy: "recent",
  filterType: "",
  filterCategory: "",
  searchQuery: "",
  usingDemoData: false,

  fetchFeed: async (reset = true, categoryOverride?: string) => {
    const { sortBy, filterType, searchQuery, filterCategory } = get();
    const category = categoryOverride !== undefined ? categoryOverride : filterCategory;
    set({ isLoading: reset, isLoadingMore: !reset });
    try {
      const { data } = await postsApi.getFeed({
        page: reset ? 1 : get().currentPage,
        limit: 10,
        sortBy,
        type: filterType || undefined,
        category: category || undefined,
        search: searchQuery || undefined,
      });
      const posts: Post[] = data.data || [];
      // If backend truly returns empty, fall back to demo data
      const finalPosts = posts.length === 0 && reset
        ? applyDemoFilters(DEMO_POSTS, sortBy, filterType, searchQuery)
        : posts;
      set((s) => ({
        posts: reset ? finalPosts : [...s.posts, ...posts],
        pagination: data.pagination,
        currentPage: reset ? 1 : s.currentPage,
        isLoading: false,
        isLoadingMore: false,
        usingDemoData: posts.length === 0 && reset,
      }));
    } catch {
      // Backend offline → show demo data
      if (reset) {
        set({
          posts: applyDemoFilters(DEMO_POSTS, sortBy, filterType, searchQuery),
          isLoading: false,
          isLoadingMore: false,
          usingDemoData: true,
        });
      } else {
        set({ isLoading: false, isLoadingMore: false });
      }
    }
  },

  loadMore: async () => {
    const { pagination, isLoadingMore, isLoading, usingDemoData } = get();
    if (isLoadingMore || isLoading || usingDemoData) return;
    if (!pagination?.hasNext) return;
    set((s) => ({ currentPage: s.currentPage + 1 }));
    await get().fetchFeed(false);
  },

  setSortBy: (sortBy) => {
    set({ sortBy, currentPage: 1 });
    get().fetchFeed(true);
  },

  setFilterType: (filterType) => {
    set({ filterType, currentPage: 1 });
    get().fetchFeed(true);
  },

  setFilterCategory: (filterCategory) => {
    set({ filterCategory, currentPage: 1 });
    get().fetchFeed(true);
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery, currentPage: 1 });
    get().fetchFeed(true);
  },

  addPost: (post) =>
    set((s) => ({
      posts: [post, ...s.posts.filter((p) => !p._id.startsWith("demo_"))],
      usingDemoData: false,
    })),

  removePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p._id !== id) })),

  updatePostVote: (id, upvotes, downvotes, userVote) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p._id === id ? { ...p, upvotes, downvotes, userVote } : p
      ),
    })),

  updatePostCommentCount: (id, delta) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p._id === id ? { ...p, commentsCount: (p.commentsCount || 0) + delta } : p
      ),
    })),
}));
