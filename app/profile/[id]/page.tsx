"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { usersApi, postsApi, followApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import PostCard from "@/app/components/features/feed/PostCard";
import { Post } from "@/store/useFeedStore";
import toast from "react-hot-toast";

interface UserProfile {
  _id: string;
  id?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  college?: { name: string; department?: string; year?: number };
  followersCount: number;
  followingCount: number;
  postsCount?: number;
  xp?: number;
  streak?: number;
  level?: number;
  isFollowing?: boolean;
  isMutualFollow?: boolean;
  role?: string;
  createdAt?: string;
}

type Tab = "posts" | "likes";

// Gradient banners per role
const BANNER_GRADIENTS: Record<string, string> = {
  society:    "linear-gradient(135deg, #6366F1, #8B5CF6)",
  moderator:  "linear-gradient(135deg, #F59E0B, #EF4444)",
  admin:      "linear-gradient(135deg, #EF4444, #DC2626)",
  student:    "linear-gradient(135deg, var(--cp-primary), #10B981)",
  default:    "linear-gradient(135deg, var(--cp-primary), #6366F1)",
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: me, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const isOwnProfile = me && (me._id === id || me.id === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    usersApi.getUser(id)
      .then(({ data }) => {
        const p = data.data;
        setProfile(p);
        setIsFollowing(p.isFollowing || false);
        setFollowersCount(p.followersCount || 0);
      })
      .catch(() => toast.error("User not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // Load posts whenever tab or id changes
  useEffect(() => {
    if (!id) return;
    setPostsLoading(true);
    setPosts([]);

    const req = activeTab === "posts"
      ? postsApi.getMyPosts(1)
      : postsApi.getMyPosts(1); // placeholder – backend add likes endpoint later

    req
      .then(({ data }) => setPosts(data.data || []))
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, [id, activeTab]);

  const handleFollow = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followApi.unfollow(id);
        setIsFollowing(false);
        setFollowersCount((n) => Math.max(0, n - 1));
      } else {
        await followApi.follow(id);
        setIsFollowing(true);
        setFollowersCount((n) => n + 1);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: "var(--cp-muted)" }}>
          <span className="material-symbols-outlined text-6xl">person_off</span>
          <p className="text-base font-bold">User not found</p>
          <button onClick={() => router.back()}
            className="px-5 py-2 rounded-xl font-bold text-sm"
            style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  const displayName = profile.displayName ||
    (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : null) ||
    profile.name || profile.username || "User";

  const bannerGradient = BANNER_GRADIENTS[profile.role || "default"] || BANNER_GRADIENTS.default;
  const initial = displayName[0]?.toUpperCase();
  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">

        {/* Profile Card */}
        <div className="rounded-3xl overflow-hidden mb-4"
          style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>

          {/* Cover banner */}
          <div className="h-36 relative" style={{ background: bannerGradient }}>
            {profile.role && profile.role !== "student" && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ background: "rgba(0,0,0,0.35)", color: "#fff" }}>
                {profile.role}
              </span>
            )}
            {/* Streak badge */}
            {(profile.streak ?? 0) > 0 && (
              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-black"
                style={{ background: "rgba(0,0,0,0.35)", color: "#fff" }}>
                🔥 {profile.streak} day streak
              </span>
            )}
          </div>

          {/* Info row */}
          <div className="px-5 pb-5">
            <div className="relative z-10 flex items-end justify-between -mt-12 mb-4">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full border-4 overflow-hidden flex-shrink-0"
                style={{ background: "var(--cp-surface-2)", borderColor: "var(--cp-surface)" }}>
                {profile.avatar
                  ? <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black"
                      style={{ background: "var(--cp-primary-10)", color: "var(--cp-primary)" }}>
                      {initial}
                    </div>}
              </div>

              {/* Action button */}
              {isOwnProfile ? (
                <button onClick={() => router.push("/settings")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
                  style={{ borderColor: "var(--cp-border)", color: "var(--cp-text)", background: "var(--cp-surface-2)" }}>
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleFollow} disabled={followLoading}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                    style={{
                      background: isFollowing ? "var(--cp-surface-2)" : "var(--cp-primary)",
                      color: isFollowing ? "var(--cp-text)" : "#fff",
                      border: isFollowing ? "1px solid var(--cp-border)" : "none",
                    }}>
                    {followLoading
                      ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <span className="material-symbols-outlined text-base">{isFollowing ? "person_check" : "person_add"}</span>
                    }
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              )}
            </div>

            {/* Name & username */}
            <h1 className="text-xl font-extrabold leading-tight" style={{ color: "var(--cp-text)" }}>{displayName}</h1>
            {profile.username && (
              <p className="text-sm mb-2" style={{ color: "var(--cp-muted)" }}>@{profile.username}</p>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--cp-text)" }}>{profile.bio}</p>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.college && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "var(--cp-surface-2)", color: "var(--cp-muted)" }}>
                  <span className="material-symbols-outlined text-sm">school</span>
                  {profile.college.name}
                  {profile.college.department && ` · ${profile.college.department}`}
                  {profile.college.year && ` · Year ${profile.college.year}`}
                </span>
              )}
              {joinDate && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "var(--cp-surface-2)", color: "var(--cp-muted)" }}>
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Joined {joinDate}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Posts",     value: profile.postsCount ?? posts.length },
                { label: "Followers", value: followersCount },
                { label: "Following", value: profile.followingCount ?? 0 },
                { label: "🔥 Streak", value: profile.streak ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center py-2 rounded-2xl"
                  style={{ background: "var(--cp-surface-2)" }}>
                  <p className="text-base font-extrabold" style={{ color: "var(--cp-text)" }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-2xl" style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}>
          {(["posts", "likes"] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all flex items-center justify-center gap-2"
              style={{
                background: activeTab === tab ? "var(--cp-primary)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--cp-muted)",
              }}>
              <span className="material-symbols-outlined text-base">{tab === "posts" ? "article" : "thumb_up"}</span>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 rounded-3xl"
            style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)", color: "var(--cp-muted)" }}>
            <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">
              {activeTab === "posts" ? "article" : "thumb_up"}
            </span>
            <p className="text-sm font-bold">
              {activeTab === "posts" ? "No posts yet" : "No liked posts yet"}
            </p>
            {isOwnProfile && activeTab === "posts" && (
              <p className="text-xs mt-1 opacity-70">Use the ✏️ button to share your first post!</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        )}

      </div>
    </MainLayout>
  );
}
