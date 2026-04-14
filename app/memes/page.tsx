"use client";
import { useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import { useFeedStore, DEMO_POSTS } from "@/store/useFeedStore";
import PostCard from "@/app/components/features/feed/PostCard";

// Demo meme images for visual richness
const MEME_IMAGES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&auto=format",
  "https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=600&auto=format",
];

const DEMO_MEMES = [
  {
    _id: "meme_1", type: "image" as const, isAnonymous: false,
    title: "Every CS student be like 💀",
    content: "Me reading documentation: 'Just works™️'\nMe actually implementing it: WHAT IS HAPPENING #MemeMonday #CSMemes",
    author: { _id: "u1", displayName: "Meme Lord 3000", username: "memelord3k" },
    media: [{ url: MEME_IMAGES[0], type: "image" as const }],
    upvotes: 456, downvotes: 9, commentsCount: 67,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "meme_2", type: "text" as const, isAnonymous: false,
    content: "Stages of a semester:\n📚 Week 1: 'This time I'll be regular'\n😎 Week 3: 'Still on track ngl'\n😬 Week 6: 'Okay catching up'\n😰 Week 10: 'Anyone has notes'\n💀 Week 14: 'What even is this subject' #SemesterMemes",
    author: { _id: "u2", displayName: "Relatable College", username: "relatable" },
    upvotes: 1234, downvotes: 7, commentsCount: 203,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function MemesPage() {
  const { posts, isLoading, setFilterType, setSortBy } = useFeedStore();

  useEffect(() => {
    setFilterType("image");
    setSortBy("trending");
  }, []);

  const memes = posts.filter((p) => p.type === "image" && !p.isAnonymous);
  const display = memes.length > 0 ? memes : DEMO_MEMES;

  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 px-6 py-4 max-w-2xl w-full self-center">
        <div className="cp-card p-6 mb-6 text-center"
          style={{ background: "linear-gradient(135deg, #FCD34D20, #FACC1540)" }}>
          <div className="text-4xl mb-2">😂</div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--cp-text)" }}>Memes</h1>
          <p className="text-sm" style={{ color: "var(--cp-muted)" }}>
            The finest campus humour, certified dank
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: "var(--cp-border)", borderTopColor: "var(--cp-primary)" }} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {display.map((p) => <PostCard key={p._id} post={p as any} />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
