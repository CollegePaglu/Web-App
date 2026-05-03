"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { postsApi } from "@/lib/api";
import { Post } from "@/store/useFeedStore";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import PostCard from "@/app/components/features/feed/PostCard";
import CommentsPanel from "@/app/components/features/feed/CommentsPanel";
import { DEMO_POSTS } from "@/store/useFeedStore";

export default function PostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    if (id.startsWith("demo_")) {
      const demoPost = DEMO_POSTS.find(p => p._id === id);
      if (demoPost) setPost(demoPost);
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const { data } = await postsApi.getPost(id);
        if (data.success && data.data) {
          setPost(data.data);
        } else {
          router.push("/404");
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  if (loading) {
    return (
      <MainLayout>
        <Navbar />
        <div className="flex-1 flex justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20" style={{ color: "var(--cp-muted)" }}>
          <span className="material-symbols-outlined text-6xl">heart_broken</span>
          <p className="text-base font-bold">Post not found</p>
          <button onClick={() => router.back()} className="px-5 py-2 rounded-xl font-bold text-sm" style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}>
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-[600px] mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Back button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold w-fit transition-opacity hover:opacity-70" style={{ color: "var(--cp-text)" }}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        <PostCard post={post} />
        
        {/* Render comments inline on the post page */}
        <div className="mt-4 rounded-3xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--cp-border)" }}>
          <div className="h-[600px] relative">
            {/* Using the CommentsPanel directly but tricking it to act inline by removing its fixed overlay via CSS or wrapping it */}
            <div className="absolute inset-0 [&>div]:static [&>div]:inset-auto [&>div]:w-full [&>div]:h-full [&>div]:max-h-none [&>div]:rounded-none [&>div]:border-0 [&>div]:bg-transparent">
               <CommentsPanel postId={post._id} onClose={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
