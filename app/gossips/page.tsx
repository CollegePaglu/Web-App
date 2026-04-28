import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import FeedList from "@/app/components/features/feed/FeedList";

export const metadata = { title: "Gossips – College Paglu", description: "Campus gossip, hot takes, and trending stories" };

export default function GossipsPage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        {/* Section header */}
        <div
          className="rounded-3xl p-5 mb-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #8B5CF620, #8B5CF608)", border: "1px solid #8B5CF630" }}
        >
          <span className="text-4xl">🗣️</span>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--cp-text)" }}>Gossips</h1>
            <p className="text-sm" style={{ color: "var(--cp-muted)" }}>Hot takes, campus tea & trending stories ☕</p>
          </div>
        </div>
        <FeedList category="GOSSIPS" />
      </div>
    </MainLayout>
  );
}
