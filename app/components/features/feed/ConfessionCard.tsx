"use client";
import { Post } from "@/store/useFeedStore";
import PostCard from "./PostCard";

interface Props { post: Post; }

export default function ConfessionCard({ post }: Props) {
  // Render as a regular PostCard — the isAnonymous flag hides author in PostCard
  return <PostCard post={post} />;
}