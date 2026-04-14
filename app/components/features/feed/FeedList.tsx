import PostCard from "./PostCard";
import ConfessionCard from "./ConfessionCard";
import EventCard from "./EventCard";

const FEED_ITEMS = [
  { type: "post", id: 1 },
  { type: "confession", id: 2 },
  { type: "event", id: 3 },
];

export default function FeedList() {
  return (
    <div className="flex flex-col gap-6">
      <PostCard
        author="Meme Lords Society"
        authorAvatar="https://lh3.googleusercontent.com/aida-public/AB6AXuCg5pZ9R4ZD1laqu79yJns-kRFSTt0eDD32EMEJ3nbp8DgrzlHSqHDU5kTE0a4p2bhN91lpHszLsU3gEoQ80Uv5zfque-KeMwGk9n-b4DH82j0LEuQ6OEMx1XttnlvQlvmm7v9x6fDrKTKSbvw2yz2o6Tp53oB4qdfcVBZ-4rtCyljDo1kpuKVL7mCDA08Fwd7ffKaQiLMZzLZ-IzJWGYaKWmKLo5lPGbwy0a77Yxp5KBAa7iWxZXXZS2PcvfcS0fArtbX_W1-dSOM"
        timeAgo="2 hours ago"
        content="Me trying to explain my 4 AM internal monologue to the professor during a viva. 💀"
        imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuA6rMdJZ12BSvLDfLg4l8aCMWE0rapmWo4PP4DXahrIbo6UjiA84RTovotF3b24IwA1KgHaPmdGG9pw8NLKKbCCUK9FktjOyyHrOgU3J5vxIKtBUI_nx5vq4_5IqJkMaSbBFjw8wSV_IMMC9Nychz641ErMWAJGYN_JxI2uGZllUSn2_PrhC_tl0rBPoljVht_SKcRwPHbgkYAQl32qrG7oRhSr_sgF7riT5BW6sH9wrnrmHdx5DUx1M0rc7SNlmNG8JzzGIg_ygZE"
        likes="1.2k"
        comments="84"
      />

      <ConfessionCard
        number={4208}
        text="I accidentally CC'd the Dean on a meme about the new library fines. Waiting for my suspension or a job offer in the marketing dept. Will update."
        likes={459}
        tag="#Engineering"
      />

      <EventCard
        society="Robotics Society"
        title="Battle Bots: Semester Finals"
        description="Registration closes at midnight! Don't miss the biggest metal-crunching event of the year."
      />
    </div>
  );
}