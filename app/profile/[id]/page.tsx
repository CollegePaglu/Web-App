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
  displayName?: string;
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  college?: { name: string };
  followersCount: number;
  followingCount: number;
  postsCount: number;
  xp?: number;
  streak?: number;
  isFollowing?: boolean;
  role?: string;
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: me, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");

  const isOwnProfile = me && (me._id === id || me.id === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    usersApi.getUser(id)
      .then(({ data }) => {
        setProfile(data.data);
        setIsFollowing(data.data.isFollowing || false);
      })
      .catch(() => toast.error("User not found"))
      .finally(() => setLoading(false));

    setPostsLoading(true);
    postsApi.getMyPosts(1)
      .then(({ data }) => setPosts(data.data || []))
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, [id]);

  const handleFollow = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followApi.unfollow(id);
        setIsFollowing(false);
        setProfile((p) => p ? { ...p, followersCount: p.followersCount - 1 } : p);
      } else {
        await followApi.follow(id);
        setIsFollowing(true);
        setProfile((p) => p ? { ...p, followersCount: p.followersCount + 1 } : p);
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
        </div>
      </MainLayout>
    );
  }

  const displayName = profile.displayName || profile.name || profile.username || "User";

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
        {/* Cover */}
        <div className="cp-card overflow-hidden mb-4">
          {/* Banner */}
          <div className="h-32 relative" style={{ background: `linear-gradient(135deg, var(--cp-primary), var(--cp-blue))` }}>
            {/* Role badge */}
            {profile.role && profile.role !== "user" && (
              <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-black uppercase"
                style={{ background: "rgba(0,0,0,0.4)", color: "#fff" }}>
                {profile.role}
              </span>
            )}
          </div>

          {/* Info row */}
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full border-4 overflow-hidden"
                style={{ background: "var(--cp-surface-2)", borderColor: "var(--cp-surface)" }}>
                {profile.avatar
                  ? <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-black"
                      style={{ color: "var(--cp-primary)" }}>{displayName[0]}</div>}
              </div>

              {/* Action button */}
              {isOwnProfile ? (
                <button onClick={() => router.push("/settings")}
                  className="px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
                  style={{ borderColor: "var(--cp-border)", color: "var(--cp-text)" }}>
                  Edit Profile
                </button>
              ) : (
                <button onClick={handleFollow} disabled={followLoading}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{
                    background: isFollowing ? "var(--cp-surface-2)" : "var(--cp-primary)",
                    color: isFollowing ? "var(--cp-text)" : "#fff",
                    border: isFollowing ? "1px solid var(--cp-border)" : "none",
                  }}>
                  {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <h1 className="text-xl font-extrabold" style={{ color: "var(--cp-text)" }}>{displayName}</h1>
            {profile.username && (
              <p className="text-sm mb-2" style={{ color: "var(--cp-muted)" }}>@{profile.username}</p>
            )}
            {profile.bio && (
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--cp-text)" }}>{profile.bio}</p>
            )}
            {profile.college && (
              <p className="text-xs flex items-center gap-1 mb-3" style={{ color: "var(--cp-muted)" }}>
                <span className="material-symbols-outlined text-sm">school</span>
                {profile.college.name}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6">
              {[
                { label: "Posts", value: profile.postsCount || posts.length },
                { label: "Followers", value: profile.followersCount || 0 },
                { label: "Following", value: profile.followingCount || 0 },
                ...(profile.xp ? [{ label: "XP", value: profile.xp }] : []),
                ...(profile.streak ? [{ label: "🔥 Streak", value: profile.streak }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-base font-extrabold" style={{ color: "var(--cp-text)" }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--cp-muted)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-2xl" style={{ background: "var(--cp-surface)" }}>
          {(["posts", "likes"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all"
              style={{
                background: activeTab === tab ? "var(--cp-primary)" : "transparent",
                color: activeTab === tab ? "#fff" : "var(--cp-muted)",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12" style={{ color: "var(--cp-muted)" }}>
            <span className="material-symbols-outlined text-5xl mb-2 block opacity-30">feed</span>
            <p className="text-sm">No posts yet</p>
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
