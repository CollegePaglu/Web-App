"use client";

import { useState, useEffect, useRef } from "react";
import { storiesApi } from "@/lib/api";
import { X } from "lucide-react";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23374151'/%3E%3Ccircle cx='50' cy='38' r='16' fill='%239CA3AF'/%3E%3Cellipse cx='50' cy='75' rx='28' ry='18' fill='%239CA3AF'/%3E%3C/svg%3E";

/** Lightweight "time ago" formatter — avoids date-fns dependency */
function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
}

interface Props {
  userGroup: StoryUserGroup;
  onClose: () => void;
  onNextUser: () => void;
  onPrevUser: () => void;
}

export default function StoryViewer({ userGroup, onClose, onNextUser, onPrevUser }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const currentStoryRaw = userGroup.stories[currentIndex];
  
  // Backend sometimes marks videos as images. Auto-detect from URL extension.
  const isVideoUrl = currentStoryRaw?.mediaUrl?.match(/\.(mp4|mov|webm|mkv)(?:\?.*)?$/i) || currentStoryRaw?.mediaUrl?.includes('/videos/');
  const currentStory = currentStoryRaw ? {
    ...currentStoryRaw,
    type: isVideoUrl ? "video" : currentStoryRaw.type
  } : undefined;

  // Default to 5 seconds for images/text, or actual duration for videos
  const duration = currentStory?.duration ? currentStory.duration * 1000 : 5000;

  // Preload next image
  useEffect(() => {
    const nextStory = userGroup.stories[currentIndex + 1];
    if (nextStory?.type === "image" && nextStory.mediaUrl) {
      const img = new window.Image();
      img.src = nextStory.mediaUrl;
    }
  }, [currentIndex, userGroup.stories]);

  // Mark as viewed
  useEffect(() => {
    if (!currentStory) return;
    
    // Call API to mark as viewed
    if (!currentStory.hasViewed) {
      storiesApi.viewStory(currentStory._id, Math.floor(duration / 1000)).catch(console.error);
      currentStory.hasViewed = true; // Optimistic update
    }
  }, [currentStory, duration]);

  // Handle Progress and auto-advance
  useEffect(() => {
    if (isPaused || !currentStory) return;

    let start = performance.now();
    let animationFrameId: number;

    const animate = (time: number) => {
      // If video, we use video time update instead of performance.now()
      if (currentStory.type === "video" && videoRef.current) {
        const video = videoRef.current;
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
        
        if (!video.ended && !video.paused) {
          animationFrameId = requestAnimationFrame(animate);
        }
        return;
      }

      // Image or text progress
      const elapsed = time - start;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        handleNext();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [currentIndex, isPaused, currentStory, duration]);

  const handleNext = () => {
    setProgress(0);
    if (currentIndex < userGroup.stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onNextUser();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onPrevUser();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const { clientX } = e;
    const { innerWidth } = window;
    if (clientX < innerWidth / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in-up">
      <div 
        className="relative w-full h-full max-w-[500px] max-h-[100dvh] bg-black sm:rounded-[2rem] sm:my-4 sm:max-h-[90dvh] overflow-hidden shadow-2xl flex flex-col"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 w-full z-20 flex gap-1 p-3 pt-4 bg-gradient-to-b from-black/60 to-transparent">
          {userGroup.stories.map((story, idx) => (
            <div key={story._id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div 
                className="h-full bg-white transition-all ease-linear"
                style={{ 
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%",
                  transitionDuration: idx === currentIndex && !isPaused ? "100ms" : "0ms" 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 w-full z-20 px-4 pt-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={userGroup.author?.avatar || DEFAULT_AVATAR}
            alt={userGroup.author?.displayName || "User"}
            className="w-10 h-10 rounded-full border border-white/20 object-cover"
          />
          <div className="flex-1 drop-shadow-md">
            <h3 className="text-white font-bold text-sm">{userGroup.author?.displayName || userGroup.author?.firstName || "User"}</h3>
            <p className="text-white/80 text-xs font-medium">
              {timeAgo(currentStory.createdAt)}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Story Content */}
        <div 
          className="flex-1 relative cursor-pointer flex items-center justify-center bg-zinc-900"
          onClick={handleClick}
        >
          {currentStory.type === "image" && currentStory.mediaUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={currentStory.mediaUrl}
              alt="Story"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {currentStory.type === "video" && currentStory.mediaUrl && (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              onEnded={handleNext}
              onPause={() => setIsPaused(true)}
              onPlay={() => setIsPaused(false)}
            />
          )}

          {currentStory.type === "text" && (
            <div 
              className="w-full h-full flex items-center justify-center p-8 text-center"
              style={{ backgroundColor: currentStory.backgroundColor || "#000000" }}
            >
              <p 
                className="text-white text-3xl font-bold whitespace-pre-wrap drop-shadow-lg"
                style={{ fontFamily: currentStory.fontStyle === "script" ? "'Dancing Script', cursive" : "var(--font-sans)" }}
              >
                {currentStory.textContent}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
