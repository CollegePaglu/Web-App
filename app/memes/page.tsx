import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import FeedList from "@/app/components/features/feed/FeedList";

export const metadata = { title: "Memes – College Paglu", description: "Campus memes, dank and certified hilarious" };

export default function MemesPage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        <div
          className="rounded-3xl p-5 mb-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #F59E0B20, #F59E0B08)", border: "1px solid #F59E0B30" }}
        >
          <span className="text-4xl">😂</span>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--cp-text)" }}>Memes</h1>
            <p className="text-sm" style={{ color: "var(--cp-muted)" }}>The finest campus humour — certified dank 🔥</p>
          </div>
        </div>
        <FeedList category="MEMES" />
      </div>
    </MainLayout>
  );
}
