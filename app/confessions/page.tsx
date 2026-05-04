import MainLayout from "@/app/components/layout/MainLayout";
import Navbar from "@/app/components/layout/Navbar";
import FeedList from "@/app/components/features/feed/FeedList";

export const metadata = { title: "Confessions – College Paglu", description: "Anonymous campus confessions" };

export default function ConfessionsPage() {
  return (
    <MainLayout>
      <Navbar />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4">
        <div
          className="rounded-3xl p-5 mb-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #EC489920, #EC489908)", border: "1px solid #EC489930" }}
        >
          <span className="text-4xl">🤫</span>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: "var(--cp-text)" }}>Confessions</h1>
            <p className="text-sm" style={{ color: "var(--cp-muted)" }}>Anonymous space — secrets, crushes & unfiltered thoughts</p>
          </div>
        </div>
        <FeedList isConfessions={true} category="CONFESSION" />
      </div>
    </MainLayout>
  );
}
