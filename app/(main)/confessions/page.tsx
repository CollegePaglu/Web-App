import ConfessionCard from "@/app/components/features/feed/ConfessionCard";

export default function ConfessionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <ConfessionCard
        number={4208}
        text="I accidentally CC'd the Dean on a meme about the new library fines..."
        likes={459}
        tag="#Engineering"
      />

      <ConfessionCard
        number={4209}
        text="Skipped lecture for chai, professor was sitting next to me 💀"
        likes={210}
        tag="#CollegeLife"
      />
    </div>
  );
}