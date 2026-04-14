"use client";
import { Post } from "@/store/useFeedStore";
import PostCard from "./PostCard";

interface Props { post: Post; }

export default function EventCard({ post }: Props) {
  return (
    <div className="relative">
      <div className="absolute -top-1 -left-1 right-0 bottom-0 rounded-2xl opacity-20" style={{ background: "var(--cp-blue)" }} />
      <PostCard post={post} />
    </div>
  );
}