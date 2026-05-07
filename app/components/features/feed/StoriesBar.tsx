"use client";

import { useState, useEffect } from "react";
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23374151'/%3E%3Ccircle cx='50' cy='38' r='16' fill='%239CA3AF'/%3E%3Cellipse cx='50' cy='75' rx='28' ry='18' fill='%239CA3AF'/%3E%3C/svg%3E";

import { storiesApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import StoryViewer from "./StoryViewer";
import { Plus, X, Download } from "lucide-react";

interface Story {
  _id: string;
  type: "image" | "video" | "text";
  mediaUrl?: string;
  textContent?: string;
  backgroundColor?: string;
  fontStyle?: string;
  duration?: number;
  hasViewed?: boolean;
  createdAt: string;
}

interface StoryUserGroup {
  authorId: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatar: string;
  };
  stories: Story[];
  allViewed: boolean;
}

export default function StoriesBar() {
  const { user } = useAuthStore();
  const [userGroups, setUserGroups] = useState<StoryUserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await storiesApi.getFeed(1, 20);
        console.log("[StoriesBar] Raw API response:", JSON.stringify(response.data, null, 2));
        // data.data.data contains the array of user groups
        const groups = response.data?.data?.data || response.data?.data || [];
        console.log("[StoriesBar] Parsed groups:", groups.length, "First group stories:", groups[0]?.stories?.map((s: any) => ({ type: s.type, mediaUrl: s.mediaUrl, _id: s._id })));
        setUserGroups(groups);
      } catch (error) {
        console.error("Failed to fetch stories", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleAddStoryClick = () => {
    setShowDownloadModal(true);
  };

  const handleNextUser = () => {
    if (activeGroupIndex !== null && activeGroupIndex < userGroups.length - 1) {
      setActiveGroupIndex(activeGroupIndex + 1);
    } else {
      setActiveGroupIndex(null); // Close viewer if at the end
    }
  };

  const handlePrevUser = () => {
    if (activeGroupIndex !== null && activeGroupIndex > 0) {
      setActiveGroupIndex(activeGroupIndex - 1);
    } else {
      setActiveGroupIndex(null); // Close viewer if at the beginning
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-1 mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0 animate-pulse">
            <div className="w-[72px] h-[72px] rounded-full" style={{ background: "var(--cp-surface-2)" }} />
            <div className="w-12 h-2 rounded-full mt-1" style={{ background: "var(--cp-surface-2)" }} />
          </div>
        ))}
      </div>
    );
  }

  // If there are no stories and the user is not authenticated, don't show the bar
  if (userGroups.length === 0 && !user) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-1 mt-2">
        
        {/* Add Story Button (Current User) */}
        {user && (
          <div 
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer transition-transform active:scale-95"
            onClick={handleAddStoryClick}
          >
            <div className="relative w-[72px] h-[72px] rounded-full p-[2px] bg-gradient-to-tr from-gray-200 to-gray-400 dark:from-zinc-800 dark:to-zinc-600">
              <div className="w-full h-full rounded-full border-2 border-transparent bg-white dark:bg-black overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar || DEFAULT_AVATAR}
                  alt="Your Story"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-black flex items-center justify-center text-white">
                <Plus size={16} strokeWidth={3} />
              </div>
            </div>
            <span className="text-[11px] font-medium truncate w-16 text-center" style={{ color: "var(--cp-muted)" }}>
              Add Story
            </span>
          </div>
        )}

        {/* Stories from Feed */}
        {userGroups.map((group, index) => (
          <div 
            key={group.authorId}
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer transition-transform active:scale-95"
            onClick={() => setActiveGroupIndex(index)}
          >
            <div className={`relative w-[72px] h-[72px] rounded-full p-[2px] ${
              group.allViewed 
                ? 'bg-gray-300 dark:bg-zinc-700' 
                : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500'
            }`}>
              <div className="w-full h-full rounded-full border-2 border-white dark:border-black bg-white dark:bg-black overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={group.author?.avatar || DEFAULT_AVATAR}
                  alt={group.author?.displayName || "User"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
            <span className={`text-[11px] truncate w-16 text-center ${group.allViewed ? 'font-medium opacity-70' : 'font-semibold'}`} style={{ color: "var(--cp-text)" }}>
              {(group.author?.displayName || group.author?.firstName || "User").split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Full-screen Viewer */}
      {activeGroupIndex !== null && (
        <StoryViewer
          userGroup={userGroups[activeGroupIndex]}
          onClose={() => {
            setActiveGroupIndex(null);
            // Re-fetch stories to update viewed status
            storiesApi.getFeed(1, 20).then(res => {
              setUserGroups(res.data?.data?.data || res.data?.data || []);
            }).catch(console.error);
          }}
          onNextUser={handleNextUser}
          onPrevUser={handlePrevUser}
        />
      )}

      {/* Download App Modal */}
      {showDownloadModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in-up"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="relative w-[90vw] max-w-md mx-4 rounded-[2rem] overflow-hidden shadow-2xl"
            style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors"
              style={{ background: "var(--cp-surface-2)", color: "var(--cp-muted)" }}
            >
              <X size={20} />
            </button>

            {/* Gradient header */}
            <div className="h-36 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-7xl drop-shadow-lg">📱</span>
            </div>

            {/* Content */}
            <div className="p-6 pt-5 text-center">
              <h2 className="text-2xl font-black mb-2" style={{ color: "var(--cp-text)" }}>
                Add Your Story!
              </h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--cp-muted)" }}>
                Story creation is only available on the <strong>CollegePaglu</strong> mobile app. Download now and share what&apos;s happening on your campus! 🎉
              </p>

              {/* Download button */}
              <a
                href="https://play.google.com/store/apps/details?id=com.CollegePaglu.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: "var(--cp-primary)", color: "var(--cp-primary-text)" }}
              >
                <Download size={20} />
                Download the App
              </a>

              {/* Dismiss */}
              <button
                onClick={() => setShowDownloadModal(false)}
                className="mt-3 w-full py-3 rounded-2xl text-sm font-bold transition-colors"
                style={{ color: "var(--cp-muted)" }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
